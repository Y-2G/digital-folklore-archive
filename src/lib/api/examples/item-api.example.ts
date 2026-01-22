/**
 * Example API Route Handler
 *
 * This file demonstrates how to use the error handling module
 * in a typical Next.js API route for the Digital Folklore Archive.
 *
 * Location: app/api/items/[id]/route.ts
 */

import { NextRequest } from 'next/server';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationError,
  createNotFoundError,
  createAuthError,
  createForbiddenError,
  withErrorHandling,
  ApiErrorCode,
} from '@/lib/api/errors';
import type { ItemDoc } from '@/types/firestore';

// Mock functions (replace with actual implementations)
async function getItemById(id: string): Promise<ItemDoc | null> {
  // Implementation would query Firestore
  return null;
}

async function updateItemInFirestore(
  id: string,
  data: Partial<ItemDoc>
): Promise<ItemDoc> {
  // Implementation would update Firestore
  return {} as ItemDoc;
}

async function deleteItemFromFirestore(id: string): Promise<void> {
  // Implementation would delete from Firestore
}

async function getCurrentUser(): Promise<{ id: string } | null> {
  // Implementation would check authentication
  return null;
}

async function checkUserPermission(userId: string, itemId: string) {
  // Implementation would check if user can modify item
  return false;
}

/**
 * Validates item ID format (DTA-XXXXXX)
 */
function isValidItemId(id: string): boolean {
  return /^DTA-\d{6}$/.test(id);
}

/**
 * GET /api/items/[id]
 * Retrieve a single item by ID
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  // Validate ID format
  if (!isValidItemId(id)) {
    return createValidationError('Invalid item ID format', {
      id: 'Must match format DTA-XXXXXX (e.g., DTA-000128)',
    });
  }

  // Fetch item from database
  const item = await getItemById(id);

  // Handle not found
  if (!item) {
    return createNotFoundError('Item');
  }

  // Return success response
  return createSuccessResponse(item, 200);
});

/**
 * PATCH /api/items/[id]
 * Update an existing item
 */
export const PATCH = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  // Validate ID
  if (!isValidItemId(id)) {
    return createValidationError('Invalid item ID format', {
      id: 'Must match format DTA-XXXXXX',
    });
  }

  // Check authentication
  const user = await getCurrentUser();
  if (!user) {
    return createAuthError('Authentication required to modify items');
  }

  // Check item exists
  const existingItem = await getItemById(id);
  if (!existingItem) {
    return createNotFoundError('Item');
  }

  // Check permissions
  const hasPermission = await checkUserPermission(user.id, id);
  if (!hasPermission) {
    return createForbiddenError(
      'You do not have permission to modify this item'
    );
  }

  // Parse and validate request body
  const body = await request.json();

  // Validate required fields
  const errors: Record<string, string> = {};

  if (body.title) {
    if (typeof body.title !== 'object') {
      errors.title = 'Must be a bilingual object with ja/en properties';
    } else if (!body.title.ja && !body.title.en) {
      errors.title = 'Must have at least one language variant';
    }
  }

  if (body.motifs) {
    if (!Array.isArray(body.motifs)) {
      errors.motifs = 'Must be an array';
    } else if (body.motifs.length > 3) {
      errors.motifs = 'Maximum 3 motifs recommended';
    }
  }

  if (body.type) {
    const validTypes = [
      'KAIDAN',
      'URBAN_LEGEND',
      'CREEPYPASTA',
      'CHAIN_MEME',
      'ORIGINAL',
      'COMMENTARY',
    ];
    if (!validTypes.includes(body.type)) {
      errors.type = `Must be one of: ${validTypes.join(', ')}`;
    }
  }

  // Return validation errors if any
  if (Object.keys(errors).length > 0) {
    return createValidationError('Invalid request data', errors);
  }

  // Update item
  const updatedItem = await updateItemInFirestore(id, body);

  // Return updated item
  return createSuccessResponse(updatedItem, 200);
});

/**
 * DELETE /api/items/[id]
 * Delete an item
 */
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  // Validate ID
  if (!isValidItemId(id)) {
    return createValidationError('Invalid item ID format', {
      id: 'Must match format DTA-XXXXXX',
    });
  }

  // Check authentication
  const user = await getCurrentUser();
  if (!user) {
    return createAuthError('Authentication required to delete items');
  }

  // Check item exists
  const existingItem = await getItemById(id);
  if (!existingItem) {
    return createNotFoundError('Item');
  }

  // Check permissions
  const hasPermission = await checkUserPermission(user.id, id);
  if (!hasPermission) {
    return createForbiddenError(
      'You do not have permission to delete this item'
    );
  }

  // Delete item
  await deleteItemFromFirestore(id);

  // Return success with no content
  return createSuccessResponse(undefined, 204);
});

/**
 * POST /api/items
 * Create a new item
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Check authentication
  const user = await getCurrentUser();
  if (!user) {
    return createAuthError('Authentication required to create items');
  }

  // Parse request body
  const body = await request.json();

  // Validate required fields
  const errors: Record<string, string> = {};

  if (!body.title) {
    errors.title = 'Required field';
  } else if (typeof body.title !== 'object' || (!body.title.ja && !body.title.en)) {
    errors.title = 'Must be a bilingual object with at least one language variant';
  }

  if (!body.body) {
    errors.body = 'Required field';
  } else if (typeof body.body !== 'object') {
    errors.body = 'Must be a bilingual object';
  }

  if (!body.type) {
    errors.type = 'Required field';
  }

  if (!body.language) {
    errors.language = 'Required field';
  }

  if (!body.confidence) {
    errors.confidence = 'Required field';
  }

  // Return validation errors if any
  if (Object.keys(errors).length > 0) {
    return createValidationError('Missing or invalid required fields', errors);
  }

  // Create item (would generate ID, add timestamps, etc.)
  const newItem = await createItemInFirestore(body);

  // Return created item with 201 status
  return createSuccessResponse(newItem, 201);
});

async function createItemInFirestore(data: Partial<ItemDoc>): Promise<ItemDoc> {
  // Mock implementation
  return {} as ItemDoc;
}
