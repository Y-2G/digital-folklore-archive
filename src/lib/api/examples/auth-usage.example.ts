/**
 * API Key Authentication Usage Examples
 *
 * This file demonstrates how to use the API key authentication module
 * in various scenarios including API routes, server actions, and middleware.
 *
 * IMPORTANT: These are example patterns only. Do not execute this file directly.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  validateApiKey,
  requireApiKey,
  hasApiKeyHeader,
  createAuthError,
  createSuccessResponse,
  withErrorHandling,
} from '@/lib/api';

/* ============================================================================
 * Example 1: Basic API Route with Manual Validation
 * ============================================================================
 * Use this pattern when you need explicit control over the authentication flow.
 */

export async function POST_Example1(request: Request) {
  // Validate API key
  if (!(await validateApiKey(request))) {
    return createAuthError('Invalid or missing API key');
  }

  // Process authenticated request
  const body = await request.json();

  return createSuccessResponse({
    message: 'Request processed successfully',
    data: body,
  });
}

/* ============================================================================
 * Example 2: Using requireApiKey with Error Handling Wrapper
 * ============================================================================
 * Recommended pattern for most API routes. Combines authentication with
 * automatic error handling.
 */

export const POST_Example2 = withErrorHandling(async (request: Request) => {
  // This will throw if authentication fails, caught by withErrorHandling
  await requireApiKey(request);

  // Process authenticated request
  const data = await processData(request);

  return createSuccessResponse(data);
});

async function processData(_request: Request) {
  // Your business logic here
  return { processed: true };
}

/* ============================================================================
 * Example 3: Optional Authentication
 * ============================================================================
 * Use this pattern when API key authentication is optional, providing
 * different behavior for authenticated vs unauthenticated requests.
 */

export async function GET_Example3(request: Request) {
  const isAuthenticated = await validateApiKey(request);

  if (isAuthenticated) {
    // Return full data for authenticated requests
    return createSuccessResponse({
      items: await getFullItemList(),
      authenticated: true,
    });
  }

  // Return limited data for unauthenticated requests
  return createSuccessResponse({
    items: await getPublicItemList(),
    authenticated: false,
  });
}

async function getFullItemList() {
  return [{ id: 1, title: 'Item 1', private: true }];
}

async function getPublicItemList() {
  return [{ id: 1, title: 'Item 1' }];
}

/* ============================================================================
 * Example 4: Checking for API Key Header Before Processing
 * ============================================================================
 * Use when you need to determine authentication method before processing.
 * Useful for endpoints that support multiple authentication methods.
 */

export async function POST_Example4(request: Request) {
  // Check if request is attempting API key authentication
  if (hasApiKeyHeader(request)) {
    // Validate the provided API key
    if (!(await validateApiKey(request))) {
      return createAuthError('Invalid API key');
    }
    // Process as API key authenticated request
    return createSuccessResponse({ method: 'api-key', authenticated: true });
  }

  // Check for other authentication methods (session, JWT, etc.)
  const hasSession = checkSessionAuth(request);
  if (hasSession) {
    return createSuccessResponse({ method: 'session', authenticated: true });
  }

  // No authentication provided
  return createAuthError('Authentication required');
}

function checkSessionAuth(_request: Request): boolean {
  // Placeholder for session authentication check
  return false;
}

/* ============================================================================
 * Example 5: Middleware Pattern
 * ============================================================================
 * Use this pattern for Next.js middleware to protect multiple routes.
 */

export async function middleware_Example5(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only protect API routes under /api/admin/*
  if (pathname.startsWith('/api/admin/')) {
    if (!(await validateApiKey(request))) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'API key required for admin endpoints',
          },
        },
        { status: 401 }
      );
    }
  }

  // Continue to next middleware or route handler
  return NextResponse.next();
}

/* ============================================================================
 * Example 6: Server Action with Authentication
 * ============================================================================
 * Use this pattern for Next.js server actions that require API key authentication.
 * Note: Server actions typically use session-based auth, but API keys can be
 * useful for server-to-server communication.
 */

'use server';

import { headers } from 'next/headers';

export async function serverAction_Example6(formData: FormData) {
  // Reconstruct request object for validation
  const headersList = await headers();
  const apiKey = headersList.get('X-API-Key');

  // Create a mock request for validation
  const mockRequest = new Request('http://localhost:3000', {
    headers: apiKey ? { 'X-API-Key': apiKey } : {},
  });

  if (!(await validateApiKey(mockRequest))) {
    return {
      success: false,
      error: 'Authentication required',
    };
  }

  // Process the form data
  const title = formData.get('title') as string;

  return {
    success: true,
    data: { title, processed: true },
  };
}

/* ============================================================================
 * Example 7: Bulk Operations with Shared Authentication
 * ============================================================================
 * Use this pattern when performing multiple operations that share authentication.
 */

export const POST_Bulk_Example7 = withErrorHandling(
  async (request: Request) => {
    // Validate once for all operations
    await requireApiKey(request);

    const body = await request.json();
    const operations = body.operations as Array<{
      type: string;
      data: unknown;
    }>;

    // Process all operations with same authentication
    const results = await Promise.all(
      operations.map(async (op) => {
        switch (op.type) {
          case 'create':
            return createItem(op.data);
          case 'update':
            return updateItem(op.data);
          case 'delete':
            return deleteItem(op.data);
          default:
            throw new Error(`Unknown operation: ${op.type}`);
        }
      })
    );

    return createSuccessResponse({ results });
  }
);

async function createItem(data: unknown) {
  return { operation: 'create', data };
}

async function updateItem(data: unknown) {
  return { operation: 'update', data };
}

async function deleteItem(data: unknown) {
  return { operation: 'delete', data };
}

/* ============================================================================
 * Environment Setup
 * ============================================================================
 * Add this to your .env.local file:
 *
 * DTA_API_SECRET_KEY=your-secret-key-here
 *
 * Generate a secure API key:
 * node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * Or use a password manager to generate a strong random string.
 * ============================================================================ */

/* ============================================================================
 * Client Usage (TypeScript)
 * ============================================================================
 * When calling authenticated endpoints from a client or external service:
 */

export async function clientExample() {
  const response = await fetch('http://localhost:3000/api/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.API_KEY || '', // Store securely, never in frontend
    },
    body: JSON.stringify({
      title: { ja: '新しいアイテム' },
      type: 'KAIDAN',
    }),
  });

  const result = await response.json();
  return result;
}

/* ============================================================================
 * cURL Usage
 * ============================================================================
 * Test authenticated endpoints with cURL:
 *
 * curl -X POST http://localhost:3000/api/items \
 *   -H "Content-Type: application/json" \
 *   -H "X-API-Key: your-api-key-here" \
 *   -d '{"title":{"ja":"テストアイテム"},"type":"KAIDAN"}'
 * ============================================================================ */
