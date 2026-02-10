import { apiGet } from '../api-client';
import { PageResponse } from '../api-types';

export interface SearchResultItem {
  id: string;
  resultType: number; // 1=content 2=activity
  title: string;
  summary?: string;
  coverUrl?: string;
  publishedAt?: string;
  relevanceScore?: number;
}

export async function searchAll(params: {
  keyword: string;
  type?: number;
  page?: number;
  size?: number;
}): Promise<PageResponse<SearchResultItem>> {
  return apiGet<PageResponse<SearchResultItem>>('/api/v1/search', {
    keyword: params.keyword,
    type: params.type,
    page: params.page || 1,
    size: params.size || 20,
  });
}

export async function suggestKeywords(prefix?: string): Promise<string[]> {
  const response = await apiGet<PageResponse<string>>('/api/v1/search/suggest', {
    prefix: prefix || undefined,
  });
  return response.items || [];
}

