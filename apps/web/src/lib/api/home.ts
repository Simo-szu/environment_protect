/**
 * 首页相关 API
 */

import { apiGet } from '../api-client';

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
  return apiGet<HomeBanner[]>('/api/v1/home/banners');
}
