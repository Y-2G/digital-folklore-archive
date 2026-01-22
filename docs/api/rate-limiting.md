# Rate Limiting Implementation

This document describes the rate limiting implementation for the Digital Folklore Archive API.

## Overview

The rate limiting module (`src/lib/api/rateLimit.ts`) provides IP-based request throttling to prevent abuse and ensure fair resource allocation across all API clients.

## Configuration

Rate limiting is configured via environment variables:

```bash
# .env.local or .env
DTA_API_RATE_LIMIT_WINDOW_MS=60000    # Time window in milliseconds (default: 60000 = 1 minute)
DTA_API_RATE_LIMIT_MAX_REQUESTS=10    # Maximum requests per window (default: 10)
```

## Implementation Details

### Algorithm

- **Type**: Fixed window rate limiting
- **Scope**: Per IP address
- **Storage**: In-memory (per instance)
- **Cleanup**: Automatic periodic cleanup of expired entries

### IP Address Detection

The system checks the following headers in order:

1. `x-forwarded-for` (first IP in comma-separated list)
2. `x-real-ip`
3. Fallback to `unknown` if no headers present

### Response Headers

All API responses include rate limit information:

```
X-RateLimit-Limit: 10              # Maximum requests allowed
X-RateLimit-Remaining: 7           # Requests remaining in window
X-RateLimit-Reset: 1706000000      # Unix timestamp when limit resets
```

When rate limited, an additional header is included:

```
Retry-After: 30                    # Seconds until next request allowed
```

## Usage in API Routes

### Basic Example

```typescript
// app/api/items/route.ts
import { NextResponse } from 'next/server';
import { checkRateLimit, createRateLimitError } from '@/lib/api';

export async function GET(request: Request) {
  // Check rate limit
  const rateLimitResult = await checkRateLimit(request);

  if (!rateLimitResult.allowed) {
    // Calculate retry time in seconds
    const retryAfter = Math.ceil(
      (rateLimitResult.reset * 1000 - Date.now()) / 1000
    );
    return createRateLimitError(retryAfter);
  }

  // Process request...
  const data = { items: [] };

  // Return response with rate limit headers
  return NextResponse.json(data, {
    headers: rateLimitResult.headers,
  });
}
```

### With Error Handling Wrapper

```typescript
// app/api/items/[id]/route.ts
import { NextResponse } from 'next/server';
import {
  checkRateLimit,
  createRateLimitError,
  withErrorHandling,
  createSuccessResponse,
} from '@/lib/api';

export const GET = withErrorHandling(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  // Check rate limit
  const rateLimitResult = await checkRateLimit(request);

  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil(
      (rateLimitResult.reset * 1000 - Date.now()) / 1000
    );
    return createRateLimitError(retryAfter);
  }

  // Fetch item...
  const item = await fetchItemById(params.id);

  // Return with rate limit headers
  const response = createSuccessResponse(item);

  // Merge rate limit headers
  Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
});
```

### Middleware Integration (Optional)

For global rate limiting, you can create middleware:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/api/rateLimit';
import { ApiErrorCode } from '@/lib/api/errors';

export async function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResult = await checkRateLimit(request);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ApiErrorCode.RATE_LIMITED,
            message: 'Too many requests',
          },
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Add rate limit headers to the response
    const response = NextResponse.next();
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

## Client-Side Handling

Clients should handle rate limiting gracefully:

```typescript
// Example client implementation
async function fetchAPI(url: string) {
  const response = await fetch(url);

  // Check rate limit status
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
  }

  return response.json();
}
```

## Testing

Use the provided test utilities:

```typescript
import { clearRateLimitStore, getRateLimitStatus } from '@/lib/api';

// Clear rate limit data between tests
beforeEach(() => {
  clearRateLimitStore();
});

// Check current status for debugging
const status = getRateLimitStatus('192.168.1.1');
console.log(status); // { count: 5, windowStart: 1706000000 }
```

## Limitations and Considerations

### Serverless Environment

The in-memory implementation means:

- Rate limits are **per instance**, not global
- Limits reset when the instance is recycled
- Multiple instances may allow more requests than configured

### Future Improvements

For production use with global rate limiting:

1. **Redis Backend**: Implement distributed rate limiting using Redis
2. **User-Based Limits**: Track authenticated users separately
3. **Tiered Limits**: Different limits for different API endpoints
4. **Burst Allowance**: Allow short bursts above the limit

### Migration Path

The current implementation is designed to be easily swapped:

```typescript
// Future: Replace in-memory store with Redis
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function checkRateLimit(request: Request): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const key = `rate_limit:${ip}`;

  // Use Redis INCR with EXPIRE for atomic rate limiting
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, config.windowMs / 1000);
  }

  // ... rest of implementation
}
```

## Monitoring

For production monitoring, consider logging rate limit events:

```typescript
if (!rateLimitResult.allowed) {
  console.warn('[Rate Limit]', {
    ip: getClientIp(request),
    path: request.url,
    timestamp: new Date().toISOString(),
  });
}
```

## Related Files

- **Implementation**: `src/lib/api/rateLimit.ts`
- **Error Handling**: `src/lib/api/errors.ts`
- **Tests**: `src/lib/api/__tests__/rateLimit.test.ts`
- **API Index**: `src/lib/api/index.ts`
