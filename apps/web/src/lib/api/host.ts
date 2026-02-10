/**
 * Host related API.
 */

import { apiGet, apiPost } from '../api-client';

export interface HostVerificationRequest {
  orgName: string;
  contactName: string;
  contactPhone: string;
  docUrls?: string[];
}

export interface HostVerificationResponse {
  userId: string;
  orgName: string;
  contactName: string;
  contactPhone: string;
  docUrls?: string[];
  status: number; // 1=pending 2=approved 3=rejected 4=revoked
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function submitHostVerification(
  data: HostVerificationRequest
): Promise<void> {
  return apiPost<void>('/api/v1/host/verification/submit', data);
}

export async function getMyHostVerification(): Promise<HostVerificationResponse> {
  return apiGet<HostVerificationResponse>('/api/v1/host/verification');
}

