/**
 * Custom error types for different API failure scenarios
 * Provides structured error handling for network, validation, and API errors
 */

/**
 * Base class for all API-related errors
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Network-related errors (connection failures, timeouts, etc.)
 */
export class NetworkError extends APIError {
  constructor(message: string, originalError?: unknown) {
    super(0, message, originalError);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Validation errors (response doesn't match expected schema)
 */
export class ValidationError extends APIError {
  constructor(message: string, originalError?: unknown) {
    super(422, message, originalError);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * API errors (4xx, 5xx responses from server)
 */
export class APIResponseError extends APIError {
  constructor(statusCode: number, message: string, originalError?: unknown) {
    super(statusCode, message, originalError);
    this.name = 'APIResponseError';
    Object.setPrototypeOf(this, APIResponseError.prototype);
  }
}

/**
 * Configuration errors (missing API key, invalid setup)
 */
export class ConfigurationError extends APIError {
  constructor(message: string) {
    super(500, message);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Determines if an error is retryable
 * Network errors and 5xx server errors are retryable
 * 4xx client errors are generally not retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) {
    return true;
  }

  if (error instanceof APIResponseError) {
    // Retry on 5xx errors and specific 4xx errors
    return (
      error.statusCode >= 500 ||
      error.statusCode === 408 || // Request Timeout
      error.statusCode === 429 // Too Many Requests
    );
  }

  return false;
}

/**
 * Calculates exponential backoff delay in milliseconds
 * Formula: baseDelay * (2 ^ attemptNumber) + random jitter
 */
export function getBackoffDelay(attemptNumber: number, baseDelay: number = 100): number {
  const exponentialDelay = baseDelay * Math.pow(2, attemptNumber);
  const jitter = Math.random() * exponentialDelay * 0.1; // 10% jitter
  return exponentialDelay + jitter;
}
