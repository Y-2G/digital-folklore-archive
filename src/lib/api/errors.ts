/**
 * API Error Handling Module
 *
 * Provides unified error handling for API routes and server actions.
 * Ensures consistent error responses and prevents exposure of sensitive information.
 */

import { NextResponse } from 'next/server';

/**
 * Standard API error codes
 */
export const ApiErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ApiErrorCodeType = typeof ApiErrorCode[keyof typeof ApiErrorCode];

/**
 * Standard error response structure
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCodeType;
    message: string;
    details?: unknown;
  };
}

/**
 * Standard success response structure
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Default error messages for each error code
 */
const DEFAULT_ERROR_MESSAGES: Record<ApiErrorCodeType, string> = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  VALIDATION_ERROR: 'Invalid request data',
  RATE_LIMITED: 'Too many requests',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
};

/**
 * HTTP status codes for each error type
 */
const ERROR_STATUS_CODES: Record<ApiErrorCodeType, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  VALIDATION_ERROR: 400,
  RATE_LIMITED: 429,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

/**
 * Determines if we should expose detailed error information
 * In production, we hide internal error details for security
 */
function shouldExposeDetails(code: ApiErrorCodeType): boolean {
  const isProduction = process.env.NODE_ENV === 'production';

  // Always hide internal error details in production
  if (isProduction && code === ApiErrorCode.INTERNAL_ERROR) {
    return false;
  }

  // For other errors, expose details in development only
  return !isProduction;
}

/**
 * Sanitizes error details to prevent exposure of sensitive information
 */
function sanitizeDetails(
  code: ApiErrorCodeType,
  details?: unknown
): unknown | undefined {
  if (!shouldExposeDetails(code)) {
    return undefined;
  }

  // Remove stack traces and other sensitive information
  if (details && typeof details === 'object') {
    const sanitized = { ...details } as Record<string, unknown>;
    delete sanitized.stack;
    delete sanitized.stackTrace;
    return sanitized;
  }

  return details;
}

/**
 * Creates a standardized error response
 *
 * @param code - Error code from ApiErrorCode
 * @param message - Custom error message (optional, defaults to standard message)
 * @param details - Additional error details (sanitized in production)
 * @param status - HTTP status code (optional, defaults to code-specific status)
 * @returns NextResponse with error payload
 *
 * @example
 * ```typescript
 * return createErrorResponse(
 *   ApiErrorCode.VALIDATION_ERROR,
 *   'Invalid item ID format',
 *   { field: 'id', expected: 'DTA-XXXXXX' },
 *   400
 * );
 * ```
 */
export function createErrorResponse(
  code: ApiErrorCodeType,
  message?: string,
  details?: unknown,
  status?: number
): NextResponse<ApiErrorResponse> {
  const errorMessage = message || DEFAULT_ERROR_MESSAGES[code];
  const statusCode = status || ERROR_STATUS_CODES[code];
  const sanitizedDetails = sanitizeDetails(code, details);

  const errorObject: ApiErrorResponse['error'] = {
    code,
    message: errorMessage,
  };

  if (sanitizedDetails !== undefined) {
    errorObject.details = sanitizedDetails;
  }

  const response: ApiErrorResponse = {
    success: false,
    error: errorObject,
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Creates a standardized success response
 *
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with success payload
 *
 * @example
 * ```typescript
 * return createSuccessResponse(
 *   { id: 'DTA-000001', title: { ja: '口裂け女' } },
 *   201
 * );
 * ```
 */
export function createSuccessResponse<T>(
  data: T,
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  return NextResponse.json(response, { status });
}

/**
 * Type guard to check if a response is an error response
 */
export function isErrorResponse(
  response: ApiResponse
): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Type guard to check if a response is a success response
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Wraps an async function with error handling
 * Catches errors and converts them to standardized error responses
 *
 * @param fn - Async function to wrap
 * @returns Wrapped function that returns NextResponse
 *
 * @example
 * ```typescript
 * export const GET = withErrorHandling(async (request) => {
 *   const data = await fetchData();
 *   return createSuccessResponse(data);
 * });
 * ```
 */
export function withErrorHandling<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<NextResponse>
): (...args: TArgs) => Promise<NextResponse> {
  return async (...args: TArgs): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (error) {
      // Log error for monitoring (only in development)
      if (process.env.NODE_ENV !== 'production') {
        console.error('[API Error]', error);
      }

      // Return generic internal error
      return createErrorResponse(
        ApiErrorCode.INTERNAL_ERROR,
        'An unexpected error occurred',
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  };
}

/**
 * Common validation error helper
 * Creates a validation error response with field-specific details
 *
 * @param message - Error message
 * @param fieldErrors - Object mapping field names to error messages
 * @returns NextResponse with validation error
 *
 * @example
 * ```typescript
 * if (!isValidId(id)) {
 *   return createValidationError('Invalid input', {
 *     id: 'Must match format DTA-XXXXXX'
 *   });
 * }
 * ```
 */
export function createValidationError(
  message: string,
  fieldErrors?: Record<string, string>
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    ApiErrorCode.VALIDATION_ERROR,
    message,
    fieldErrors ? { fields: fieldErrors } : undefined
  );
}

/**
 * Common authentication error helper
 */
export function createAuthError(
  message?: string
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    ApiErrorCode.UNAUTHORIZED,
    message || 'Authentication required'
  );
}

/**
 * Common authorization error helper
 */
export function createForbiddenError(
  message?: string
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    ApiErrorCode.FORBIDDEN,
    message || 'Access denied'
  );
}

/**
 * Common not found error helper
 */
export function createNotFoundError(
  resource?: string
): NextResponse<ApiErrorResponse> {
  const message = resource
    ? `${resource} not found`
    : 'Resource not found';

  return createErrorResponse(ApiErrorCode.NOT_FOUND, message);
}

/**
 * Common rate limit error helper
 */
export function createRateLimitError(
  retryAfter?: number
): NextResponse<ApiErrorResponse> {
  const response = createErrorResponse(
    ApiErrorCode.RATE_LIMITED,
    'Too many requests',
    retryAfter ? { retryAfter } : undefined
  );

  // Add Retry-After header if provided
  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString());
  }

  return response;
}
