/**
 * 文件上传相关 API（MinIO 预签名）
 */

import { apiPost } from '../api-client';

export type FileType = 'avatar' | 'poster' | 'doc';

export interface PresignRequest {
  fileName: string;
  contentType: string;
  fileType: FileType;
}

export interface PresignResponse {
  uploadUrl: string;
  fileUrl: string;
  expiresIn: number;
}

export async function getUploadPresignUrl(
  data: PresignRequest
): Promise<PresignResponse> {
  return apiPost<PresignResponse>('/api/v1/files/presign', data);
}

