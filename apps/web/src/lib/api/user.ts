/**
 * 用户相关 API
 */

import { apiGet, apiPost } from '../api-client';
import { PageResponse } from '../api-types';

// 用户资料
export interface UserProfile {
  userId: string;
  nickname: string;
  avatarUrl?: string;
  bio?: string;
  email?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate?: string;
  location?: string;
  createdAt: string;
}

// 更新资料请求
export interface UpdateProfileRequest {
  nickname?: string;
  avatarUrl?: string;
  bio?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate?: string;
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
  type: string;
  title: string;
  content: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

// 标记已读请求
export interface MarkNotificationsReadRequest {
  notificationIds?: string[];
  markAllAsRead?: boolean;
}

// Reaction 项
export interface ReactionItem {
  id: string;
  targetType: 'CONTENT' | 'ACTIVITY' | 'COMMENT';
  targetId: string;
  reactionType: 'LIKE' | 'FAVORITE' | 'DISLIKE';
  targetTitle?: string;
  targetCoverUrl?: string;
  createdAt: string;
}

// 我的活动项
export interface MyActivityItem {
  signupId: string;
  activityId: string;
  activityTitle: string;
  activityCoverUrl?: string;
  sessionName?: string;
  startTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  signedUpAt: string;
}

/**
 * 获取我的资料
 */
export async function getMyProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>('/api/v1/me/profile');
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
  switch (dto.type) {
    case 1: // 评论
      title = `${dto.actorNickname || '用户'} 评论了你`;
      content = dto.commentContent || '';
      linkUrl = dto.targetType === 1 
        ? `/science/${dto.targetId}` 
        : `/activities/${dto.targetId}`;
      break;
    case 2: // 回复
      title = `${dto.actorNickname || '用户'} 回复了你`;
      content = dto.commentContent || '';
      linkUrl = dto.targetType === 1 
        ? `/science/${dto.targetId}` 
        : `/activities/${dto.targetId}`;
      break;
    case 3: // 点赞
      title = `${dto.actorNickname || '用户'} 点赞了你`;
      content = dto.targetPreview || '';
      linkUrl = dto.targetType === 1 
        ? `/science/${dto.targetId}` 
        : `/activities/${dto.targetId}`;
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
    type: dto.type.toString(),
    title,
    content,
    linkUrl,
    isRead: dto.isRead,
    createdAt: dto.createdAt,
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
 * 获取我的点赞/收藏
 */
export async function getMyReactions(params: {
  reactionType?: 'LIKE' | 'FAVORITE';
  targetType?: 'CONTENT' | 'ACTIVITY';
  page?: number;
  size?: number;
}): Promise<PageResponse<ReactionItem>> {
  return apiGet<PageResponse<ReactionItem>>('/api/v1/me/reactions', {
    reactionType: params.reactionType,
    targetType: params.targetType,
    page: params.page || 1,
    size: params.size || 10,
  });
}

/**
 * 获取我的活动报名
 */
export async function getMyActivities(params: {
  page?: number;
  size?: number;
}): Promise<PageResponse<MyActivityItem>> {
  return apiGet<PageResponse<MyActivityItem>>('/api/v1/me/activities', {
    page: params.page || 1,
    size: params.size || 10,
  });
}
