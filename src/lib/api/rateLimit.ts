/**
 * Rate Limiting Module
 *
 * Provides IP-based rate limiting for API routes with configurable windows and request limits.
 * Uses an in-memory store for simplicity, suitable for serverless environments with the
 * understanding that limits are per-instance.
 *
 * Configuration via environment variables:
 * - DTA_API_RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 60000)
 * - DTA_API_RATE_LIMIT_MAX_REQUESTS: Maximum requests per window (default: 10)
 */

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** HTTP headers to include in the response */
  headers: Record<string, string>;
  /** Number of requests remaining in the current window */
  remaining: number;
  /** Unix timestamp (seconds) when the rate limit resets */
  reset: number;
}

/**
 * Internal structure for tracking client requests
 */
interface ClientRecord {
  /** Number of requests made in the current window */
  count: number;
  /** Unix timestamp (ms) when the current window started */
  windowStart: number;
}

/**
 * Configuration for rate limiting
 */
interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests per window */
  maxRequests: number;
}

/**
 * In-memory store for rate limit tracking
 * Key: IP address, Value: Client request record
 */
const rateLimitStore = new Map<string, ClientRecord>();

/**
 * Last cleanup timestamp (ms)
 */
let lastCleanup = Date.now();

/**
 * Cleanup interval in milliseconds (5 minutes)
 */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Get rate limit configuration from environment variables
 */
function getConfig(): RateLimitConfig {
  const windowMs = parseInt(
    process.env.DTA_API_RATE_LIMIT_WINDOW_MS || '60000',
    10
  );
  const maxRequests = parseInt(
    process.env.DTA_API_RATE_LIMIT_MAX_REQUESTS || '10',
    10
  );

  return {
    windowMs: isNaN(windowMs) ? 60000 : windowMs,
    maxRequests: isNaN(maxRequests) ? 10 : maxRequests,
  };
}

/**
 * Extract client IP address from request headers
 *
 * Checks the following headers in order:
 * 1. x-forwarded-for (first IP in the list)
 * 2. x-real-ip
 * 3. Connection remote address (fallback)
 *
 * @param request - Incoming HTTP request
 * @returns Client IP address
 */
function getClientIp(request: Request): string {
  // Check x-forwarded-for header (proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  // Check x-real-ip header
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a default identifier
  // In serverless environments, we may not have access to the socket
  return 'unknown';
}

/**
 * Clean up expired entries from the rate limit store
 * to prevent memory leaks
 *
 * @param config - Rate limit configuration
 */
function cleanupExpiredEntries(config: RateLimitConfig): void {
  const now = Date.now();

  // Only run cleanup periodically
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }

  const expirationThreshold = now - config.windowMs;

  for (const [ip, record] of rateLimitStore.entries()) {
    if (record.windowStart < expirationThreshold) {
      rateLimitStore.delete(ip);
    }
  }

  lastCleanup = now;
}

/**
 * Check if a request should be rate limited
 *
 * Implements a fixed window rate limiting algorithm:
 * - Tracks requests per IP address within a time window
 * - Resets the window when it expires
 * - Returns headers for client information
 *
 * @param request - Incoming HTTP request
 * @returns Rate limit check result with headers
 *
 * @example
 * ```typescript
 * // In an API route handler
 * export async function GET(request: Request) {
 *   const rateLimitResult = await checkRateLimit(request);
 *
 *   if (!rateLimitResult.allowed) {
 *     return createRateLimitError(
 *       Math.ceil((rateLimitResult.reset * 1000 - Date.now()) / 1000)
 *     );
 *   }
 *
 *   // Process request...
 *   return NextResponse.json(data, {
 *     headers: rateLimitResult.headers
 *   });
 * }
 * ```
 */
export async function checkRateLimit(
  request: Request
): Promise<RateLimitResult> {
  const config = getConfig();
  const clientIp = getClientIp(request);
  const now = Date.now();

  // Perform periodic cleanup
  cleanupExpiredEntries(config);

  // Get or initialize client record
  let record = rateLimitStore.get(clientIp);

  // Check if window has expired
  if (!record || now - record.windowStart >= config.windowMs) {
    // Start new window
    record = {
      count: 1,
      windowStart: now,
    };
    rateLimitStore.set(clientIp, record);

    const resetTime = Math.floor((now + config.windowMs) / 1000);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      reset: resetTime,
      headers: {
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': (config.maxRequests - 1).toString(),
        'X-RateLimit-Reset': resetTime.toString(),
      },
    };
  }

  // Increment request count in current window
  record.count++;

  const resetTime = Math.floor((record.windowStart + config.windowMs) / 1000);
  const remaining = Math.max(0, config.maxRequests - record.count);
  const allowed = record.count <= config.maxRequests;

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime.toString(),
  };

  // Add Retry-After header if rate limited
  if (!allowed) {
    const retryAfterSeconds = Math.ceil(
      (record.windowStart + config.windowMs - now) / 1000
    );
    headers['Retry-After'] = retryAfterSeconds.toString();
  }

  return {
    allowed,
    remaining,
    reset: resetTime,
    headers,
  };
}

/**
 * Clear all rate limit records
 * Primarily used for testing purposes
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
  lastCleanup = Date.now();
}

/**
 * Get current rate limit status for a specific IP
 * Useful for debugging and monitoring
 *
 * @param ip - IP address to check
 * @returns Current record or null if not tracked
 */
export function getRateLimitStatus(ip: string): ClientRecord | null {
  return rateLimitStore.get(ip) || null;
}
