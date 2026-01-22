/**
 * Validation Layer Usage Examples
 *
 * This file demonstrates how to use the validation layer in various contexts.
 * DO NOT IMPORT THIS FILE - These are examples only.
 */

import { NextRequest } from 'next/server';
import {
  validateCreateItemRequest,
  validateUpdateItemRequest,
  validateCreateAnnotationRequest,
  type CreateItemRequest,
} from '../validation';
import {
  createSuccessResponse,
  createValidationError,
  withErrorHandling,
} from '../errors';

// ============================================================================
// Example 1: API Route Handler
// ============================================================================

/**
 * POST /api/items - Create a new folklore item
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Parse request body
  const body = await request.json();

  // Validate request
  const result = validateCreateItemRequest(body);

  // Handle validation errors
  if (!result.success) {
    return createValidationError(result.error.message, result.error.fields);
  }

  // At this point, result.data is type-safe CreateItemRequest
  const validatedData: CreateItemRequest = result.data;

  // TODO: Create item in Firestore
  // const item = await createItemInFirestore(validatedData);

  // Return success response
  return createSuccessResponse(
    {
      id: 'DTA-000001',
      ...validatedData,
      createdAt: new Date().toISOString(),
    },
    201
  );
});

// ============================================================================
// Example 2: PATCH API Route for Updates
// ============================================================================

/**
 * PATCH /api/items/[id] - Update an existing item
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  // Validate update request (all fields optional)
  const result = validateUpdateItemRequest(body);

  if (!result.success) {
    return createValidationError(result.error.message, result.error.fields);
  }

  // TODO: Update item in Firestore
  // await updateItemInFirestore(id, result.data);

  return createSuccessResponse({ id, ...result.data });
}

// ============================================================================
// Example 3: Server Action
// ============================================================================

'use server';

/**
 * Server action for creating an item from a form
 */
async function createItemAction(formData: FormData) {
  // Convert FormData to plain object
  const rawData = {
    type: formData.get('type'),
    language: formData.get('language'),
    confidence: formData.get('confidence'),
    title: {
      ja: formData.get('title.ja'),
      en: formData.get('title.en'),
    },
    body: {
      ja: formData.get('body.ja'),
      en: formData.get('body.en'),
    },
    motifs: formData.getAll('motifs'),
    status: formData.get('status') || 'DRAFT',
  };

  // Validate
  const result = validateCreateItemRequest(rawData);

  if (!result.success) {
    return {
      success: false,
      error: result.error.fields,
    };
  }

  // TODO: Create item
  // const item = await createItem(result.data);

  return {
    success: true,
    data: { id: 'DTA-000001' },
  };
}

// ============================================================================
// Example 4: Validation with Custom Error Handling
// ============================================================================

async function createItemWithCustomValidation(body: unknown) {
  const result = validateCreateItemRequest(body);

  if (!result.success) {
    // Custom error handling
    console.error('Validation failed:', result.error.fields);

    // Log specific field errors
    Object.entries(result.error.fields).forEach(([field, message]) => {
      console.error(`  ${field}: ${message}`);
    });

    // Return custom error structure
    return {
      ok: false,
      errors: result.error.fields,
      message: 'Please correct the following errors',
    };
  }

  // Proceed with validated data
  return {
    ok: true,
    data: result.data,
  };
}

// ============================================================================
// Example 5: Nested Route - Create Annotation
// ============================================================================

/**
 * POST /api/items/[id]/annotations - Add annotation to an item
 */
export async function createAnnotation(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  // Validate annotation request
  const result = validateCreateAnnotationRequest(body);

  if (!result.success) {
    return createValidationError(result.error.message, result.error.fields);
  }

  // TODO: Create annotation subcollection document
  // await createAnnotationInFirestore(id, result.data);

  return createSuccessResponse({
    itemId: id,
    ...result.data,
  });
}

// ============================================================================
// Example 6: Validation in Middleware/Helper
// ============================================================================

/**
 * Helper function that validates and processes item creation
 */
async function processItemCreation(rawBody: unknown) {
  // Step 1: Validate
  const validationResult = validateCreateItemRequest(rawBody);

  if (!validationResult.success) {
    throw new Error(
      `Validation failed: ${JSON.stringify(validationResult.error.fields)}`
    );
  }

  const itemData = validationResult.data;

  // Step 2: Generate search tokens (example)
  // const searchTokens = generateSearchTokens(itemData);

  // Step 3: Create Firestore document
  // const docData = {
  //   ...itemData,
  //   searchTokens,
  //   createdAt: serverTimestamp(),
  //   updatedAt: serverTimestamp(),
  // };

  // Step 4: Save to Firestore
  // await setDoc(doc(db, 'items', id), docData);

  return { success: true, id: 'DTA-000001' };
}

// ============================================================================
// Example 7: Type-safe Request Handler Factory
// ============================================================================

/**
 * Factory function to create type-safe API handlers
 */
function createValidatedHandler<TRequest, TResponse>(
  validator: (body: unknown) => { success: true; data: TRequest } | { success: false; error: { message: string; fields: Record<string, string> } },
  handler: (data: TRequest) => Promise<TResponse>
) {
  return async (request: NextRequest) => {
    const body = await request.json();
    const result = validator(body);

    if (!result.success) {
      return createValidationError(result.error.message, result.error.fields);
    }

    try {
      const response = await handler(result.data);
      return createSuccessResponse(response);
    } catch (error) {
      throw error; // Let withErrorHandling catch this
    }
  };
}

// Usage of factory
export const POST_ITEM = withErrorHandling(
  createValidatedHandler(
    validateCreateItemRequest,
    async (data) => {
      // Type-safe handler - data is CreateItemRequest
      return {
        id: 'DTA-000001',
        ...data,
        createdAt: new Date().toISOString(),
      };
    }
  )
);

// ============================================================================
// Example 8: Validation with Conditional Logic
// ============================================================================

async function createItemWithConditionalValidation(body: unknown, isDraft: boolean) {
  const result = validateCreateItemRequest(body);

  if (!result.success) {
    // In draft mode, only warn about validation errors
    if (isDraft) {
      console.warn('Draft has validation issues:', result.error.fields);
      // Allow draft with issues
      return { success: true, warnings: result.error.fields };
    } else {
      // In publish mode, reject invalid data
      return createValidationError(result.error.message, result.error.fields);
    }
  }

  // Validated data
  return { success: true, data: result.data };
}

// ============================================================================
// Example 9: Batch Validation
// ============================================================================

async function batchCreateItems(items: unknown[]) {
  const validatedItems: CreateItemRequest[] = [];
  const errors: Array<{ index: number; fields: Record<string, string> }> = [];

  // Validate all items
  items.forEach((item, index) => {
    const result = validateCreateItemRequest(item);

    if (result.success) {
      validatedItems.push(result.data);
    } else {
      errors.push({
        index,
        fields: result.error.fields,
      });
    }
  });

  // Return results
  if (errors.length > 0) {
    return {
      success: false,
      validCount: validatedItems.length,
      invalidCount: errors.length,
      errors,
    };
  }

  // TODO: Batch create in Firestore
  // await batchCreateInFirestore(validatedItems);

  return {
    success: true,
    count: validatedItems.length,
  };
}

// ============================================================================
// Example 10: Validation with Transformation
// ============================================================================

async function createItemWithTransformation(body: unknown) {
  const result = validateCreateItemRequest(body);

  if (!result.success) {
    return createValidationError(result.error.message, result.error.fields);
  }

  // Transform validated data before storage
  const transformed = {
    ...result.data,
    // Normalize whitespace in titles
    title: {
      ja: result.data.title.ja?.trim(),
      en: result.data.title.en?.trim(),
    },
    // Convert status to uppercase (redundant but example)
    status: result.data.status.toUpperCase(),
    // Add computed fields
    hasEnglishTranslation: !!result.data.body.en,
    hasOriginalText: !!result.data.body.original,
  };

  return { success: true, data: transformed };
}
