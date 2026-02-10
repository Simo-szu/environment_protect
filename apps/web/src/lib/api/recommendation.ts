import { apiGet } from '../api-client';

export interface RecommendationPayload {
  items: any;
  source: 'weekly' | 'latest' | string;
}

export async function getWeeklyRecommendation(): Promise<RecommendationPayload> {
  return apiGet<RecommendationPayload>('/api/v1/recommendations/weekly');
}

export async function getLatestRecommendation(): Promise<RecommendationPayload> {
  return apiGet<RecommendationPayload>('/api/v1/recommendations/latest');
}

