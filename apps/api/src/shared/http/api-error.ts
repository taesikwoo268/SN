export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "NOT_FOUND"
  | "INTERNAL_SERVER_ERROR";

export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}

export function createApiError(
  code: ApiErrorCode,
  message: string,
): ApiErrorResponse {
  return {
    error: {
      code,
      message,
    },
  };
}