/**
 * API 类型定义
 */

// 后端统一响应格式
export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data: T;
  traceId?: string;
  error?: ApiErrorInfo;
}

export interface ApiErrorInfo {
  type: string;
  httpStatus: number;
  details: ApiErrorDetail[];
}

export interface ApiErrorDetail {
  field: string;
  reason: string;
}

// 后端统一请求格式
export interface UnifiedRequest<T = any> {
  requestId?: string;
  data: T;
}

// 分页响应
export interface PageResponse<T = any> {
  page: number;
  size: number;
  total: number;
  items: T[];
}

// API 错误
export class ApiError extends Error {
  code: number;
  traceId?: string;

  constructor(code: number, message: string, traceId?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.traceId = traceId;
  }
}

// 认证相关类型
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // 秒数
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // 时间戳（毫秒）
}
