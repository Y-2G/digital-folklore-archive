/**
 * API Module
 *
 * Centralized exports for API-related utilities including
 * error handling, response formatting, rate limiting, and common patterns.
 */

export {
  // Error codes
  ApiErrorCode,
  type ApiErrorCodeType,

  // Response types
  type ApiErrorResponse,
  type ApiSuccessResponse,
  type ApiResponse,

  // Response creators
  createErrorResponse,
  createSuccessResponse,

  // Helper functions
  createValidationError,
  createAuthError,
  createForbiddenError,
  createNotFoundError,
  createRateLimitError,

  // Type guards
  isErrorResponse,
  isSuccessResponse,

  // Utilities
  withErrorHandling,
} from './errors';

export {
  // Rate limiting
  type RateLimitResult,
  checkRateLimit,
  clearRateLimitStore,
  getRateLimitStatus,
} from './rateLimit';

export {
  // API Key Authentication
  validateApiKey,
  requireApiKey,
  hasApiKeyHeader,
  getApiKeyHeaderName,
} from './auth';
