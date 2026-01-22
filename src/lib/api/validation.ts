/**
 * Request Validation Module
 *
 * Provides Zod schema validation for API requests and server actions.
 * Based on Firestore type definitions in src/types/firestore.ts
 */

import { z } from 'zod';
import type {
  ItemType,
  Language,
  SourceConfidence,
  DocStatus,
  FirstSeen,
  Motif,
  Region,
  Medium,
  BilingualText,
  BodyText,
} from '@/types/firestore';
import { createValidationError } from './errors';
import type { NextResponse } from 'next/server';
import type { ApiErrorResponse } from './errors';

// ============================================================================
// Enum Schemas
// ============================================================================

/**
 * ItemType schema
 */
export const ItemTypeSchema = z.enum([
  'KAIDAN',
  'URBAN_LEGEND',
  'CREEPYPASTA',
  'CHAIN_MEME',
  'ORIGINAL',
  'COMMENTARY',
]) satisfies z.ZodType<ItemType>;

/**
 * Language schema
 */
export const LanguageSchema = z.enum(['JA', 'EN', 'OTHER']) satisfies z.ZodType<Language>;

/**
 * SourceConfidence schema
 */
export const SourceConfidenceSchema = z.enum([
  'PRIMARY',
  'SECONDARY',
  'UNKNOWN',
]) satisfies z.ZodType<SourceConfidence>;

/**
 * DocStatus schema
 */
export const DocStatusSchema = z.enum(['PUBLISHED', 'DRAFT']) satisfies z.ZodType<DocStatus>;

/**
 * FirstSeen schema (flexible to accept both predefined decades and custom strings)
 */
export const FirstSeenSchema = z.union([
  z.enum(['Pre-1999', '2000s', '2010s', '2020s', 'Unknown']),
  z.string().regex(/^\d{4}(-\d{2})?$/, 'Must be in format YYYY or YYYY-MM'),
]) satisfies z.ZodType<FirstSeen | string>;

/**
 * Motif schema
 */
export const MotifSchema = z.enum([
  'PLACE',
  'ROAD_TUNNEL',
  'FOREST_MOUNTAIN',
  'WATER',
  'ROOM_APARTMENT',
  'MISSING_PERSON',
  'STALKER_OBSERVER',
  'ENTITY',
  'DOPPELGANGER',
  'CHILD_FAMILY',
  'MEDIA_DEVICE',
  'RITUAL_RULES',
  'WARNING_CHAIN',
  'EXPERIMENT_REPORT',
  'IDENTITY',
]) satisfies z.ZodType<Motif>;

/**
 * Region schema
 */
export const RegionSchema = z.enum([
  'JAPAN',
  'NA',
  'EU',
  'ASIA_EX_JAPAN',
  'GLOBAL_UNKNOWN',
]) satisfies z.ZodType<Region>;

/**
 * Medium schema
 */
export const MediumSchema = z.enum([
  'FORUM_BBS',
  'SNS',
  'VIDEO',
  'WIKI_ARCHIVE',
  'PRINT_ORAL',
  'UNKNOWN',
]) satisfies z.ZodType<Medium>;

// ============================================================================
// Multilingual Text Schemas
// ============================================================================

/**
 * BilingualText schema
 * At least one of ja or en must be provided
 */
export const BilingualTextSchema: z.ZodType<BilingualText> = z
  .object({
    ja: z.string().max(200, 'Japanese text must not exceed 200 characters').optional(),
    en: z.string().max(200, 'English text must not exceed 200 characters').optional(),
  })
  .refine((data) => data.ja || data.en, {
    message: 'At least one of ja or en is required',
  });

/**
 * BodyText schema
 * At least one of ja, en, or original must be provided
 */
export const BodyTextSchema: z.ZodType<BodyText> = z
  .object({
    ja: z.string().max(100000, 'Japanese body must not exceed 100,000 characters').optional(),
    en: z.string().max(100000, 'English body must not exceed 100,000 characters').optional(),
    original: z
      .string()
      .max(100000, 'Original body must not exceed 100,000 characters')
      .optional(),
  })
  .refine((data) => data.ja || data.en || data.original, {
    message: 'At least one of ja, en, or original is required',
  });

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * CreateItemRequest schema
 * Validates request body for creating a new folklore item
 */
export const CreateItemRequestSchema = z.object({
  // Required fields
  type: ItemTypeSchema,
  language: LanguageSchema,
  confidence: SourceConfidenceSchema,
  title: BilingualTextSchema,
  body: BodyTextSchema,
  motifs: z
    .array(MotifSchema)
    .min(1, 'At least one motif is required')
    .max(3, 'Maximum 3 motifs allowed'),
  status: DocStatusSchema.default('DRAFT'),

  // Optional metadata fields
  originalTitle: z.string().max(200, 'Original title must not exceed 200 characters').optional(),
  firstSeen: FirstSeenSchema.optional(),
  sourceName: z.string().max(100, 'Source name must not exceed 100 characters').optional(),
  sourceUrl: z.string().url('Must be a valid URL').optional(),
  sourceArchiveUrl: z.string().url('Must be a valid URL').optional(),
  formats: z.array(z.string().max(50)).max(10, 'Maximum 10 format tags allowed').optional(),
  region: RegionSchema.optional(),
  medium: MediumSchema.optional(),
});

/**
 * UpdateItemRequest schema
 * All fields are optional for partial updates
 */
export const UpdateItemRequestSchema = z.object({
  type: ItemTypeSchema.optional(),
  language: LanguageSchema.optional(),
  confidence: SourceConfidenceSchema.optional(),
  title: BilingualTextSchema.optional(),
  body: BodyTextSchema.optional(),
  originalTitle: z.string().max(200, 'Original title must not exceed 200 characters').optional(),
  firstSeen: FirstSeenSchema.optional(),
  sourceName: z.string().max(100, 'Source name must not exceed 100 characters').optional(),
  sourceUrl: z.string().url('Must be a valid URL').optional(),
  sourceArchiveUrl: z.string().url('Must be a valid URL').optional(),
  motifs: z
    .array(MotifSchema)
    .min(1, 'At least one motif is required')
    .max(3, 'Maximum 3 motifs allowed')
    .optional(),
  formats: z.array(z.string().max(50)).max(10, 'Maximum 10 format tags allowed').optional(),
  region: RegionSchema.optional(),
  medium: MediumSchema.optional(),
  status: DocStatusSchema.optional(),
});

/**
 * CreateAnnotationRequest schema
 */
export const CreateAnnotationRequestSchema = z.object({
  order: z.number().int().positive('Order must be a positive integer'),
  text: BilingualTextSchema,
});

/**
 * UpdateAnnotationRequest schema
 */
export const UpdateAnnotationRequestSchema = z.object({
  order: z.number().int().positive('Order must be a positive integer').optional(),
  text: BilingualTextSchema.optional(),
});

/**
 * CreateRevisionRequest schema
 */
export const CreateRevisionRequestSchema = z.object({
  summary: BilingualTextSchema,
});

// ============================================================================
// Inferred Types
// ============================================================================

export type CreateItemRequest = z.infer<typeof CreateItemRequestSchema>;
export type UpdateItemRequest = z.infer<typeof UpdateItemRequestSchema>;
export type CreateAnnotationRequest = z.infer<typeof CreateAnnotationRequestSchema>;
export type UpdateAnnotationRequest = z.infer<typeof UpdateAnnotationRequestSchema>;
export type CreateRevisionRequest = z.infer<typeof CreateRevisionRequestSchema>;

// ============================================================================
// Validation Result Types
// ============================================================================

/**
 * Field-specific validation error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Validation error details
 */
export interface ValidationErrorDetails {
  fields: Record<string, string>;
  raw?: z.ZodError;
}

/**
 * Success result wrapper
 */
export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

/**
 * Error result wrapper
 */
export interface ValidationError {
  success: false;
  error: {
    message: string;
    fields: Record<string, string>;
  };
}

/**
 * Union type for validation results
 */
export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Formats Zod errors into field-specific error messages
 *
 * @param error - ZodError from schema validation
 * @returns Object mapping field paths to error messages
 *
 * @example
 * ```typescript
 * const errors = formatZodErrors(zodError);
 * // { 'title.ja': 'Required', 'motifs': 'At least one motif is required' }
 * ```
 */
function formatZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    const field = path || 'root';
    fieldErrors[field] = issue.message;
  }

  return fieldErrors;
}

/**
 * Validates create item request body
 *
 * @param body - Unknown request body to validate
 * @returns ValidationResult with typed data or error details
 *
 * @example
 * ```typescript
 * const result = validateCreateItemRequest(requestBody);
 * if (!result.success) {
 *   return createValidationError(result.error.message, result.error.fields);
 * }
 * // result.data is now a type-safe CreateItemRequest
 * await createItem(result.data);
 * ```
 */
export function validateCreateItemRequest(body: unknown): ValidationResult<CreateItemRequest> {
  const result = CreateItemRequestSchema.safeParse(body);

  if (!result.success) {
    const fieldErrors = formatZodErrors(result.error);
    return {
      success: false,
      error: {
        message: 'Invalid request data',
        fields: fieldErrors,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validates update item request body
 *
 * @param body - Unknown request body to validate
 * @returns ValidationResult with typed data or error details
 */
export function validateUpdateItemRequest(body: unknown): ValidationResult<UpdateItemRequest> {
  const result = UpdateItemRequestSchema.safeParse(body);

  if (!result.success) {
    const fieldErrors = formatZodErrors(result.error);
    return {
      success: false,
      error: {
        message: 'Invalid request data',
        fields: fieldErrors,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validates create annotation request body
 *
 * @param body - Unknown request body to validate
 * @returns ValidationResult with typed data or error details
 */
export function validateCreateAnnotationRequest(
  body: unknown
): ValidationResult<CreateAnnotationRequest> {
  const result = CreateAnnotationRequestSchema.safeParse(body);

  if (!result.success) {
    const fieldErrors = formatZodErrors(result.error);
    return {
      success: false,
      error: {
        message: 'Invalid annotation data',
        fields: fieldErrors,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validates update annotation request body
 *
 * @param body - Unknown request body to validate
 * @returns ValidationResult with typed data or error details
 */
export function validateUpdateAnnotationRequest(
  body: unknown
): ValidationResult<UpdateAnnotationRequest> {
  const result = UpdateAnnotationRequestSchema.safeParse(body);

  if (!result.success) {
    const fieldErrors = formatZodErrors(result.error);
    return {
      success: false,
      error: {
        message: 'Invalid annotation data',
        fields: fieldErrors,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validates create revision request body
 *
 * @param body - Unknown request body to validate
 * @returns ValidationResult with typed data or error details
 */
export function validateCreateRevisionRequest(
  body: unknown
): ValidationResult<CreateRevisionRequest> {
  const result = CreateRevisionRequestSchema.safeParse(body);

  if (!result.success) {
    const fieldErrors = formatZodErrors(result.error);
    return {
      success: false,
      error: {
        message: 'Invalid revision data',
        fields: fieldErrors,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

// ============================================================================
// Helper Functions for API Routes
// ============================================================================

/**
 * Validates and returns NextResponse for validation errors
 * Convenience wrapper that combines validation with error response creation
 *
 * @param body - Unknown request body to validate
 * @param schema - Zod schema to validate against
 * @returns ValidationResult or NextResponse with error
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const body = await request.json();
 *   const result = validateCreateItemRequest(body);
 *
 *   if (!result.success) {
 *     return createValidationError(result.error.message, result.error.fields);
 *   }
 *
 *   // Proceed with result.data
 * }
 * ```
 */
export function createValidationErrorResponse(
  error: ValidationError['error']
): NextResponse<ApiErrorResponse> {
  return createValidationError(error.message, error.fields);
}

/**
 * Validates request body or returns error response
 * Generic helper that validates any schema and returns appropriate response
 *
 * @param body - Request body to validate
 * @param schema - Zod schema
 * @returns Validated data or NextResponse with error
 */
export function validateOrError<T extends z.ZodTypeAny>(
  body: unknown,
  schema: T
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(body);

  if (!result.success) {
    const fieldErrors = formatZodErrors(result.error);
    return {
      success: false,
      error: {
        message: 'Invalid request data',
        fields: fieldErrors,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
