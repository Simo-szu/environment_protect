/**
 * 用户相关 API
 */

import { apiGet, apiPost } from '../api-client';
import { PageResponse } from '../api-types';
import type { PointsAccount } from './points';

// 用户资料（后端返回格式）
export interface UserProfile {
  userId: string;
  nickname: string;
  avatarUrl?: string;
  gender?: number; // 0=未知 1=男 2=女
  birthday?: string; // yyyy-MM-dd
  hometown?: string;
  bio?: string;
  location?: string;
}

// 更新资料请求（与后端 DTO 一致）
export interface UpdateProfileRequest {
  nickname?: string;
  avatarUrl?: string;
  gender?: number; // 0=未知 1=男 2=女
  birthday?: string; // yyyy-MM-dd
  hometown?: string;
  bio?: string;
  location?: string;
}

// 后端通知 DTO（实际返回的结构）
interface NotificationItemDTO {
  id: string;
  type: number; // 1=评论 2=回复 3=点赞 4=系统通知
  isRead: boolean;
  createdAt: string;
  actorId?: string;
  actorNickname?: string;
  actorAvatar?: string;
  targetType?: number; // 1=内容 2=活动 3=评论
  targetId?: string;
  targetPreview?: string;
  commentId?: string;
  commentContent?: string;
}

// 前端通知项（UI 使用）
export interface NotificationItem {
  id: string;
  type: number;
  title: string;
  content: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
  actorNickname?: string;
}

// 标记已读请求
export interface MarkNotificationsReadRequest {
  notificationIds?: string[];
  markAllAsRead?: boolean;
}

// Reaction 项（与后端 ReactionItemDTO 对齐）
export interface ReactionItem {
  id: string;
  reactionType: number; // 1=点赞 2=收藏 3=踩
  targetType: number; // 1=内容 2=活动
  targetId: string;
  createdAt: string;
  // 内容字段（targetType=1）
  contentTitle?: string;
  contentType?: number;
  contentCoverUrl?: string;
  contentSummary?: string;
  // 活动字段（targetType=2）
  activityTitle?: string;
  activityCategory?: number;
  activityPosterUrl?: string;
  activityStartTime?: string;
  activityLocation?: string;
}

// 前端类型映射
const REACTION_TYPE_MAP: Record<string, number> = {
  'LIKE': 1,
  'FAVORITE': 2,
  'DISLIKE': 3
};

const TARGET_TYPE_MAP: Record<string, number> = {
  'CONTENT': 1,
  'ACTIVITY': 2
};

/**
 * 获取我的点赞/收藏
 */
export async function getMyReactions(
  reactionType: 'LIKE' | 'FAVORITE',
  targetType: 'CONTENT' | 'ACTIVITY',
  page: number = 1,
  size: number = 20
): Promise<PageResponse<ReactionItem>> {
  // 映射为后端需要的 int 参数
  const params = new URLSearchParams({
    reactionType: REACTION_TYPE_MAP[reactionType].toString(),
    targetType: TARGET_TYPE_MAP[targetType].toString(),
    page: page.toString(),
    size: size.toString()
  });
  return apiGet<PageResponse<ReactionItem>>(`/api/v1/me/reactions?${params}`);
}
export interface MyActivityItem {
  signupId: string;
  activityId: string;
  title: string;
  coverImageUrl?: string;
  sessionId?: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  signedUpAt: string;
}

/**
 * 获取我的资料
 */
export async function getMyProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>('/api/v1/me/profile');
}

export async function getMyPoints(): Promise<PointsAccount> {
  return apiGet<PointsAccount>('/api/v1/me/points');
}

/**
 * 更新我的资料
 */
export async function updateMyProfile(
  data: UpdateProfileRequest
): Promise<void> {
  return apiPost<void>('/api/v1/me/profile', data);
}

/**
 * 获取我的通知
 */
export async function getMyNotifications(params: {
  page?: number;
  size?: number;
}): Promise<PageResponse<NotificationItem>> {
  const response = await apiGet<PageResponse<NotificationItemDTO>>('/api/v1/me/notifications', {
    page: params.page || 1,
    size: params.size || 20,
  });

  // 映射后端 DTO 到前端 ViewModel
  return {
    ...response,
    items: response.items.map(mapNotificationDtoToItem)
  };
}

/**
 * 映射后端通知 DTO 到前端 NotificationItem
 */
function mapNotificationDtoToItem(dto: NotificationItemDTO): NotificationItem {
  let title = '';
  let content = '';
  let linkUrl: string | undefined;

  // 根据类型生成 title 和 content
  const resolveTargetLink = (): string | undefined => {
    if (!dto.targetId) return undefined;
    if (dto.targetType === 1) return `/science/${dto.targetId}`;
    if (dto.targetType === 2) return `/activities/${dto.targetId}`;
    return undefined;
  };

  switch (dto.type) {
    case 1: // 评论
      title = `${dto.actorNickname || '用户'} 评论了你`;
      content = dto.commentContent || '';
      linkUrl = resolveTargetLink();
      break;
    case 2: // 回复
      title = `${dto.actorNickname || '用户'} 回复了你`;
      content = dto.commentContent || '';
      linkUrl = resolveTargetLink();
      break;
    case 3: // 点赞
      title = `${dto.actorNickname || '用户'} 点赞了你`;
      content = dto.targetPreview || '';
      linkUrl = resolveTargetLink();
      break;
    case 4: // 系统通知
      title = '系统通知';
      content = dto.targetPreview || '';
      break;
    default:
      title = '通知';
      content = dto.targetPreview || '';
  }

  return {
    id: dto.id,
    type: dto.type,
    title,
    content,
    linkUrl,
    isRead: dto.isRead,
    createdAt: dto.createdAt,
    actorNickname: dto.actorNickname || '用户'
  };
}

/**
 * 标记通知已读
 */
export async function markNotificationsRead(
  data: MarkNotificationsReadRequest
): Promise<void> {
  return apiPost<void>('/api/v1/me/notifications/read', data);
}

/**
 * 获取我的活动报名
 */
export async function getMyActivities(params: {
  page?: number;
  size?: number;
}): Promise<PageResponse<MyActivityItem>> {
  const response = await apiGet<PageResponse<any>>('/api/v1/me/activities', {
    page: params.page || 1,
    size: params.size || 10,
  });

  const mapStatus = (s: number): 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' => {
    switch (s) {
      case 1: return 'PENDING';
      case 2: return 'APPROVED';
      case 3: return 'REJECTED';
      case 4: return 'CANCELLED';
      default: return 'PENDING';
    }
  };

  return {
    ...response,
    items: response.items.map((dto: any) => ({
      signupId: dto.signupId,
      activityId: dto.activityId,
      title: dto.title,
      coverImageUrl: dto.posterUrls && dto.posterUrls.length > 0 ? dto.posterUrls[0] : undefined,
      sessionId: dto.sessionId,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: mapStatus(dto.signupStatus),
      signedUpAt: dto.signupAt
    }))
  };
}
