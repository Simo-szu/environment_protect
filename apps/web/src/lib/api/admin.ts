import { apiDelete, apiGet, apiPatch, apiPost } from '../api-client';
import { PageResponse } from '../api-types';

export interface AdminHostVerificationItem {
  userId: string;
  orgName: string;
  contactName: string;
  contactPhone: string;
  docUrls?: string[];
  status: number;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface AdminReviewVerificationRequest {
  status: 2 | 3;
  reviewNote?: string;
}

export interface AdminHomeBannerItem {
  id: string;
  title?: string;
  imageUrl: string;
  linkType: number;
  linkTarget?: string;
  sortOrder?: number;
  isEnabled?: boolean;
  startAt?: string;
  endAt?: string;
}

export interface AdminCreateHomeBannerRequest {
  title?: string;
  imageUrl: string;
  linkType: number;
  linkTarget?: string;
  sortOrder?: number;
  isEnabled?: boolean;
  startAt?: string;
  endAt?: string;
}

export interface AdminUpdateHomeBannerRequest {
  title?: string;
  imageUrl?: string;
  linkType?: number;
  linkTarget?: string;
  sortOrder?: number;
  isEnabled?: boolean;
  startAt?: string;
  endAt?: string;
}

export async function getAdminHostVerifications(status?: number): Promise<PageResponse<AdminHostVerificationItem>> {
  return apiGet<PageResponse<AdminHostVerificationItem>>('/api/v1/admin/host/verifications', { status });
}

export async function reviewAdminHostVerification(
  userId: string,
  data: AdminReviewVerificationRequest
): Promise<void> {
  return apiPatch<void>(`/api/v1/admin/host/verifications/${userId}`, data);
}

export async function getAdminHomeBanners(): Promise<PageResponse<AdminHomeBannerItem>> {
  return apiGet<PageResponse<AdminHomeBannerItem>>('/api/v1/admin/home/banners');
}

export async function getAdminHomeBannerById(id: string): Promise<AdminHomeBannerItem> {
  return apiGet<AdminHomeBannerItem>(`/api/v1/admin/home/banners/${id}`);
}

export async function createAdminHomeBanner(data: AdminCreateHomeBannerRequest): Promise<string> {
  return apiPost<string>('/api/v1/admin/home/banners', data);
}

export async function updateAdminHomeBanner(id: string, data: AdminUpdateHomeBannerRequest): Promise<void> {
  return apiPatch<void>(`/api/v1/admin/home/banners/${id}`, data);
}

export async function deleteAdminHomeBanner(id: string): Promise<void> {
  return apiDelete<void>(`/api/v1/admin/home/banners/${id}`);
}

