/**
 * API type definitions.
 */

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface BaseResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: ApiFieldError[];
  traceId?: string;
}

export interface UnifiedRequest<T = any> {
  requestId?: string;
  data: T;
}

export interface PageResponse<T = any> {
  page: number;
  size: number;
  total: number;
  items: T[];
}

export class ApiError extends Error {
  traceId?: string;
  errors?: ApiFieldError[];

  constructor(message: string, traceId?: string, errors?: ApiFieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.traceId = traceId;
    this.errors = errors;
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}
