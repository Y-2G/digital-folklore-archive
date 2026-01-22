/**
 * API Key Authentication Module
 *
 * Provides secure API key validation with timing-attack protection.
 * Used for authenticating server-to-server API requests.
 *
 * Security Features:
 * - Constant-time comparison to prevent timing attacks
 * - Safe logging (never logs actual key values)
 * - Secure handling of missing environment variables
 *
 * @example
 * ```typescript
 * export async function POST(request: Request) {
 *   if (!await validateApiKey(request)) {
 *     return createAuthError('Invalid or missing API key');
 *   }
 *   // ... process request
 * }
 * ```
 */

import { timingSafeEqual } from 'crypto';

/**
 * Environment variable key for the API secret
 */
const API_SECRET_ENV_KEY = 'DTA_API_SECRET_KEY';

/**
 * Header name for API key authentication
 */
const API_KEY_HEADER = 'X-API-Key';

/**
 * Performs constant-time comparison of two strings
 * Prevents timing attacks by ensuring comparison always takes the same time
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal, false otherwise
 */
function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  // If lengths differ, still perform a dummy comparison to maintain constant time
  if (bufA.length !== bufB.length) {
    // Compare buffer with itself to consume time
    timingSafeEqual(bufA, bufA);
    return false;
  }

  // Perform constant-time comparison
  try {
    return timingSafeEqual(bufA, bufB);
  } catch {
    // timingSafeEqual throws if buffers have different lengths
    // This should never happen due to the check above, but handle defensively
    return false;
  }
}

/**
 * Logs authentication failure without exposing sensitive information
 * SECURITY: Never logs the actual API key value
 *
 * @param request - The request that failed authentication
 * @param reason - Reason for authentication failure
 */
function logAuthFailure(request: Request, reason: string): void {
  const url = new URL(request.url);
  const method = request.method;
  const hasApiKey = request.headers.has(API_KEY_HEADER);

  // Log authentication failure with safe information
  // NOTE: We only log the presence/absence of the header, not its value
  console.warn('[API Auth]', {
    timestamp: new Date().toISOString(),
    method,
    path: url.pathname,
    reason,
    hasApiKey,
    // Never include: actual key value, headers, or other sensitive data
  });
}

/**
 * Validates the API key from the request headers
 *
 * Security considerations:
 * - Uses timing-safe comparison to prevent timing attacks
 * - Never logs actual key values
 * - Treats missing environment variable as authentication failure
 * - Returns false for any error condition
 *
 * @param request - The incoming HTTP request
 * @returns Promise resolving to true if authentication succeeds, false otherwise
 *
 * @example
 * ```typescript
 * export async function POST(request: Request) {
 *   if (!await validateApiKey(request)) {
 *     return createAuthError('Invalid or missing API key');
 *   }
 *   // Request is authenticated
 * }
 * ```
 */
export async function validateApiKey(request: Request): Promise<boolean> {
  // Check if API secret is configured
  const apiSecret = process.env[API_SECRET_ENV_KEY];

  if (!apiSecret) {
    // SECURITY: Always fail authentication if secret is not configured
    console.error('[API Auth] API secret not configured in environment variables');
    logAuthFailure(request, 'API secret not configured');
    return false;
  }

  // Extract API key from request header
  const providedKey = request.headers.get(API_KEY_HEADER);

  if (!providedKey) {
    logAuthFailure(request, 'API key header missing');
    return false;
  }

  // Validate key length to prevent empty string attacks
  if (providedKey.length === 0) {
    logAuthFailure(request, 'API key is empty');
    return false;
  }

  // Perform constant-time comparison
  const isValid = timingSafeCompare(providedKey, apiSecret);

  if (!isValid) {
    logAuthFailure(request, 'API key mismatch');
    return false;
  }

  // Authentication successful
  return true;
}

/**
 * Validates the API key and throws an error if invalid
 * Convenience function for use with error handling middleware
 *
 * @param request - The incoming HTTP request
 * @throws Error if authentication fails
 *
 * @example
 * ```typescript
 * export const POST = withErrorHandling(async (request: Request) => {
 *   await requireApiKey(request);
 *   // Request is authenticated, proceed with logic
 * });
 * ```
 */
export async function requireApiKey(request: Request): Promise<void> {
  const isValid = await validateApiKey(request);

  if (!isValid) {
    throw new Error('Invalid or missing API key');
  }
}

/**
 * Type guard to check if a request has an API key header
 * Does NOT validate the key, only checks for presence
 *
 * @param request - The incoming HTTP request
 * @returns true if API key header is present
 */
export function hasApiKeyHeader(request: Request): boolean {
  return request.headers.has(API_KEY_HEADER);
}

/**
 * Gets the configured API key header name
 * Useful for documentation or client implementation
 *
 * @returns The header name used for API key authentication
 */
export function getApiKeyHeaderName(): string {
  return API_KEY_HEADER;
}
