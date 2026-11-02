export type ApiErrorCode =
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "INVALID_RESPONSE"
  | "NOT_CONFIGURED"
  // Codes returned by the API pass through as-is (e.g. "VALIDATION_ERROR").
  | (string & {});

/** Every failure from the API layer is normalised into this one error type. */
export class ApiError extends Error {
  override readonly name = "ApiError";
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    code: ApiErrorCode,
    details?: unknown,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
