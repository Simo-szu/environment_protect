/**
 * Homepage related API helpers.
 */

import { apiGet } from '../api-client';
import { PageResponse } from '../api-types';

export interface CarbonMarketTrendPoint {
  tradeDate: string;
  previousClosePrice?: number;
  closingPrice: number;
  lowPrice?: number;
  highPrice?: number;
  volume?: number;
}

export interface CarbonMarketSnapshot {
  sourceUrl?: string;
  sourceName?: string;
  tradeDate?: string;
  quoteTime?: string;
  marketStatus?: string;
  closingPrice?: number;
  closingChangePercent?: number;
  previousClosePrice?: number;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  priceUp?: boolean;
  dailyVolume?: number;
  dailyTurnover?: number;
  cumulativeVolume?: number;
  cumulativeTurnover?: number;
  dailyVolumeText?: string;
  dailyTurnoverText?: string;
  cumulativeVolumeText?: string;
  cumulativeTurnoverText?: string;
  trendPoints?: CarbonMarketTrendPoint[];
  syncedAt?: string;
}

export interface HomeData {
  banners?: HomeBanner[];
  latestContents?: unknown[];
  latestActivities?: unknown[];
  marketSnapshot?: CarbonMarketSnapshot | null;
}

export interface HomeBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;
}

interface HomeBannerDTO {
  id: string;
  title: string;
  imageUrl: string;
  linkType: number;
  linkTarget?: string;
  sortOrder: number;
}

export async function getHomeData(): Promise<HomeData> {
  return apiGet<HomeData>('/api/v1/home');
}

export async function getCarbonMarketSnapshot(): Promise<CarbonMarketSnapshot | null> {
  return apiGet<CarbonMarketSnapshot | null>('/api/v1/market/carbon');
}

export async function getHomeBanners(): Promise<HomeBanner[]> {
  const response = await apiGet<PageResponse<HomeBannerDTO>>('/api/v1/home/banners');
  const dtos = response.items || [];

  const mapLinkUrl = (dto: HomeBannerDTO): string | undefined => {
    if (!dto.linkTarget) {
      return undefined;
    }
    switch (dto.linkType) {
      case 2:
        return `/science/${dto.linkTarget}`;
      case 3:
        return `/activities/${dto.linkTarget}`;
      case 4:
        return dto.linkTarget;
      default:
        return undefined;
    }
  };

  return dtos.map((dto) => ({
    id: dto.id,
    title: dto.title,
    imageUrl: dto.imageUrl,
    linkUrl: mapLinkUrl(dto),
    displayOrder: dto.sortOrder,
  }));
}
