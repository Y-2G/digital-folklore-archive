/**
 * Example Server Actions
 *
 * This file demonstrates how to use the error handling module
 * in Server Actions for the Digital Folklore Archive.
 *
 * Location: app/actions/items.ts
 */

'use server';

import { revalidatePath } from 'next/cache';
import {
  createSuccessResponse,
  createAuthError,
  createForbiddenError,
  createValidationError,
  createNotFoundError,
  type ApiResponse,
} from '@/lib/api/errors';
import type { ItemDoc } from '@/types/firestore';

// Mock functions (replace with actual implementations)
async function getCurrentSession(): Promise<{ user: { id: string } } | null> {
  // Implementation would check server-side session
  return null;
}

async function getItemById(id: string): Promise<ItemDoc | null> {
  return null;
}

async function updateItemInFirestore(
  id: string,
  data: Partial<ItemDoc>
): Promise<ItemDoc> {
  return {} as ItemDoc;
}

async function deleteItemFromFirestore(id: string): Promise<void> {
  // Implementation
}

async function checkUserPermission(userId: string, itemId: string) {
  return false;
}

/**
 * Server Action: Update an item
 *
 * Usage in client component:
 * ```tsx
 * const result = await updateItem(itemId, { title: { ja: '新しいタイトル' } });
 * if (!result.success) {
 *   setError(result.error.message);
 * }
 * ```
 */
export async function updateItem(
  id: string,
  data: Partial<ItemDoc>
): Promise<ApiResponse<ItemDoc>> {
  // Check authentication
  const session = await getCurrentSession();
  if (!session?.user) {
    const response = await createAuthError('Please sign in to edit items');
    return response.json();
  }

  // Validate ID format
  if (!/^DTA-\d{6}$/.test(id)) {
    const response = await createValidationError('Invalid item ID format', {
      id: 'Must match format DTA-XXXXXX',
    });
    return response.json();
  }

  // Check item exists
  const existingItem = await getItemById(id);
  if (!existingItem) {
    const response = await createNotFoundError('Item');
    return response.json();
  }

  // Check permissions
  const hasPermission = await checkUserPermission(session.user.id, id);
  if (!hasPermission) {
    const response = await createForbiddenError(
      'You do not have permission to edit this item'
    );
    return response.json();
  }

  // Validate update data
  const errors: Record<string, string> = {};

  if (data.title) {
    if (typeof data.title !== 'object') {
      errors.title = 'Must be a bilingual object';
    } else if (!data.title.ja && !data.title.en) {
      errors.title = 'Must have at least one language variant';
    }
  }

  if (data.motifs && data.motifs.length > 3) {
    errors.motifs = 'Maximum 3 motifs recommended';
  }

  if (Object.keys(errors).length > 0) {
    const response = await createValidationError('Invalid data', errors);
    return response.json();
  }

  // Update item in Firestore
  // Note: In actual implementation, use Firestore Timestamp
  const updatedItem = await updateItemInFirestore(id, data);

  // Revalidate affected pages
  revalidatePath(`/items/${id}`);
  revalidatePath('/catalog');

  // Return success response
  const response = await createSuccessResponse(updatedItem);
  return response.json();
}

/**
 * Server Action: Delete an item
 */
export async function deleteItem(id: string): Promise<ApiResponse<void>> {
  // Check authentication
  const session = await getCurrentSession();
  if (!session?.user) {
    const response = await createAuthError('Please sign in to delete items');
    return response.json();
  }

  // Validate ID
  if (!/^DTA-\d{6}$/.test(id)) {
    const response = await createValidationError('Invalid item ID format', {
      id: 'Must match format DTA-XXXXXX',
    });
    return response.json();
  }

  // Check item exists
  const existingItem = await getItemById(id);
  if (!existingItem) {
    const response = await createNotFoundError('Item');
    return response.json();
  }

  // Check permissions
  const hasPermission = await checkUserPermission(session.user.id, id);
  if (!hasPermission) {
    const response = await createForbiddenError(
      'You do not have permission to delete this item'
    );
    return response.json();
  }

  // Delete from Firestore
  await deleteItemFromFirestore(id);

  // Revalidate catalog page
  revalidatePath('/catalog');

  // Return success
  const response = await createSuccessResponse(undefined, 204);
  return response.json();
}

/**
 * Server Action: Create a new item
 */
export async function createItem(
  data: Omit<ItemDoc, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<ItemDoc>> {
  // Check authentication
  const session = await getCurrentSession();
  if (!session?.user) {
    const response = await createAuthError('Please sign in to create items');
    return response.json();
  }

  // Validate required fields
  const errors: Record<string, string> = {};

  if (!data.title || typeof data.title !== 'object') {
    errors.title = 'Required bilingual field';
  } else if (!data.title.ja && !data.title.en) {
    errors.title = 'Must have at least one language variant';
  }

  if (!data.body || typeof data.body !== 'object') {
    errors.body = 'Required bilingual field';
  }

  if (!data.type) {
    errors.type = 'Required field';
  }

  if (!data.language) {
    errors.language = 'Required field';
  }

  if (!data.confidence) {
    errors.confidence = 'Required field';
  }

  if (Object.keys(errors).length > 0) {
    const response = await createValidationError(
      'Missing required fields',
      errors
    );
    return response.json();
  }

  // Create item with generated ID and timestamps
  const newItem = await createItemInFirestore({
    ...data,
    status: 'DRAFT',
    motifs: data.motifs || [],
  });

  // Revalidate catalog
  revalidatePath('/catalog');

  // Return created item
  const response = await createSuccessResponse(newItem, 201);
  return response.json();
}

async function createItemInFirestore(
  data: Partial<ItemDoc>
): Promise<ItemDoc> {
  // Mock implementation
  return {} as ItemDoc;
}

/**
 * Example client-side usage:
 *
 * ```tsx
 * 'use client';
 *
 * import { useState } from 'react';
 * import { updateItem, deleteItem } from '@/app/actions/items';
 *
 * export function ItemEditor({ item }: { item: ItemDoc }) {
 *   const [error, setError] = useState<string | null>(null);
 *   const [loading, setLoading] = useState(false);
 *
 *   async function handleSave(updatedData: Partial<ItemDoc>) {
 *     setLoading(true);
 *     setError(null);
 *
 *     const result = await updateItem(item.id, updatedData);
 *
 *     if (!result.success) {
 *       setError(result.error.message);
 *       // Show field-specific errors
 *       if (result.error.details?.fields) {
 *         console.error('Validation errors:', result.error.details.fields);
 *       }
 *     } else {
 *       // Success - redirect or show success message
 *       router.push(`/items/${result.data.id}`);
 *     }
 *
 *     setLoading(false);
 *   }
 *
 *   async function handleDelete() {
 *     if (!confirm('本当に削除しますか？')) return;
 *
 *     setLoading(true);
 *     const result = await deleteItem(item.id);
 *
 *     if (!result.success) {
 *       setError(result.error.message);
 *     } else {
 *       router.push('/catalog');
 *     }
 *
 *     setLoading(false);
 *   }
 *
 *   return (
 *     <div>
 *       {error && <div className="error">{error}</div>}
 *       <button onClick={handleSave} disabled={loading}>
 *         保存
 *       </button>
 *       <button onClick={handleDelete} disabled={loading}>
 *         削除
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
