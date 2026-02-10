/**
 * 首页相关 API
 */

import { apiGet } from '../api-client';
import { PageResponse } from '../api-types';

// 首页数据
export interface HomeData {
  // 根据后端实际返回结构定义
  [key: string]: any;
}

// 轮播图
export interface HomeBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;
}

// 后端 DTO（/api/v1/home/banners）
interface HomeBannerDTO {
  id: string;
  title: string;
  imageUrl: string;
  linkType: number; // 1=none 2=content 3=activity 4=url
  linkTarget?: string;
  sortOrder: number;
}

/**
 * 获取首页数据
 */
export async function getHomeData(): Promise<HomeData> {
  return apiGet<HomeData>('/api/v1/home');
}

/**
 * 获取首页轮播图
 */
export async function getHomeBanners(): Promise<HomeBanner[]> {
  const response = await apiGet<PageResponse<HomeBannerDTO>>('/api/v1/home/banners');
  const dtos = response.items || [];

  const mapLinkUrl = (dto: HomeBannerDTO): string | undefined => {
    if (!dto.linkTarget) return undefined;
    switch (dto.linkType) {
      case 2: return `/science/${dto.linkTarget}`;
      case 3: return `/activities/${dto.linkTarget}`;
      case 4: return dto.linkTarget;
      default: return undefined;
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
