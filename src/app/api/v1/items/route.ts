/**
 * Item API Route Handler
 *
 * POST /api/v1/items - Create a new folklore item
 *
 * Authentication: X-API-Key header (admin only)
 * Rate Limit: 10 requests per minute per IP
 *
 * @see docs/design/12-item-api.md for API specification
 * @see docs/tasks/tasks-002.md for implementation plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

// API utilities
import { validateApiKey } from '@/lib/api/auth';
import { validateCreateItemRequest } from '@/lib/api/validation';
import { checkRateLimit } from '@/lib/api/rateLimit';
import { generateItemId } from '@/lib/api/idGenerator';
import {
  createSuccessResponse,
  createAuthError,
  createValidationError,
  createErrorResponse,
  ApiErrorCode,
  withErrorHandling,
} from '@/lib/api/errors';

// Firebase
import { getAdminFirestore } from '@/lib/firebase/admin';

// Search token generation
import { generateSearchTokens } from '@/lib/catalog/searchTokens';

// Types
import type { ItemDoc } from '@/types/firestore';

/**
 * Response type for successful item creation
 */
interface CreateItemResponse {
  id: string;
  createdAt: string;
}

/**
 * POST /api/v1/items
 *
 * Creates a new folklore item in the database.
 *
 * Security:
 * - Requires valid API key in X-API-Key header
 * - Subject to rate limiting (10 req/min per IP)
 * - Input validated with Zod schemas
 *
 * Automatic processing:
 * - ID auto-generation (DTA-XXXXXX format)
 * - searchTokens generation for full-text search
 * - Timestamp generation (createdAt, updatedAt)
 *
 * @example
 * ```bash
 * curl -X POST http://localhost:3000/api/v1/items \
 *   -H "Content-Type: application/json" \
 *   -H "X-API-Key: $DTA_API_SECRET_KEY" \
 *   -d '{
 *     "type": "KAIDAN",
 *     "language": "JA",
 *     "confidence": "PRIMARY",
 *     "title": { "ja": "くねくね" },
 *     "body": { "ja": "田んぼの中にいる白い人型の何かが..." },
 *     "motifs": ["ENTITY", "PLACE"],
 *     "status": "DRAFT"
 *   }'
 * ```
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // 1. Rate limit check (before authentication to prevent DoS)
  const rateLimitResult = await checkRateLimit(request);

  if (!rateLimitResult.allowed) {
    const retryAfterSeconds = Math.ceil(
      (rateLimitResult.reset * 1000 - Date.now()) / 1000
    );

    const response = createErrorResponse(
      ApiErrorCode.RATE_LIMITED,
      'Rate limit exceeded. Please try again later.',
      { retryAfter: retryAfterSeconds }
    );

    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // 2. Authentication check
  const isAuthenticated = await validateApiKey(request);

  if (!isAuthenticated) {
    return createAuthError('Invalid or missing API key');
  }

  // 3. Parse and validate request body
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return createValidationError('Invalid JSON in request body');
  }

  const validation = validateCreateItemRequest(body);

  if (!validation.success) {
    return createValidationError(
      validation.error.message,
      validation.error.fields
    );
  }

  const validatedData = validation.data;

  // 4. Generate unique item ID
  const id = await generateItemId();

  // 5. Generate search tokens for full-text search
  // Create a partial item for token generation
  const itemForTokens = {
    id,
    title: validatedData.title,
    originalTitle: validatedData.originalTitle,
    sourceName: validatedData.sourceName,
    motifs: validatedData.motifs,
  } as ItemDoc;

  const searchTokens = generateSearchTokens(itemForTokens);

  // 6. Prepare document for Firestore
  const now = Timestamp.now();

  const itemDoc: Omit<ItemDoc, 'createdAt' | 'updatedAt'> & {
    createdAt: Timestamp;
    updatedAt: Timestamp;
  } = {
    id,
    type: validatedData.type,
    language: validatedData.language,
    confidence: validatedData.confidence,
    title: validatedData.title,
    body: validatedData.body,
    motifs: validatedData.motifs,
    status: validatedData.status,
    searchTokens,
    annotationCount: 0,
    revisionCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  // Add optional fields if provided
  if (validatedData.originalTitle) {
    itemDoc.originalTitle = validatedData.originalTitle;
  }
  if (validatedData.firstSeen) {
    itemDoc.firstSeen = validatedData.firstSeen;
  }
  if (validatedData.sourceName) {
    itemDoc.sourceName = validatedData.sourceName;
  }
  if (validatedData.sourceUrl) {
    itemDoc.sourceUrl = validatedData.sourceUrl;
  }
  if (validatedData.sourceArchiveUrl) {
    itemDoc.sourceArchiveUrl = validatedData.sourceArchiveUrl;
  }
  if (validatedData.formats && validatedData.formats.length > 0) {
    itemDoc.formats = validatedData.formats;
  }
  if (validatedData.region) {
    itemDoc.region = validatedData.region;
  }
  if (validatedData.medium) {
    itemDoc.medium = validatedData.medium;
  }

  // 7. Save to Firestore
  const db = getAdminFirestore();

  await db.collection('items').doc(id).set(itemDoc);

  // 8. Return success response
  const responseData: CreateItemResponse = {
    id,
    createdAt: now.toDate().toISOString(),
  };

  // Include rate limit headers in successful response
  const successResponse = createSuccessResponse(responseData, 201);

  Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
    successResponse.headers.set(key, value);
  });

  return successResponse;
});

/**
 * OPTIONS /api/v1/items
 *
 * Handle CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      'Access-Control-Max-Age': '86400',
    },
  });
}
