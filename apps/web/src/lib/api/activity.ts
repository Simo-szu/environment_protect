/**
 * 活动相关 API
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '../api-client';
import { PageResponse } from '../api-types';
import { Comment } from './content';

// 活动类型（前端使用）
export type ActivityType = 'HOSTED' | 'EXTERNAL';

// 活动状态（前端使用）
export type ActivityStatus = 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

// 报名策略
export type SignupPolicy = 'OPEN' | 'APPROVAL_REQUIRED' | 'CLOSED';

// 后端活动列表项 DTO（实际返回的结构）
interface ActivityListItemDTO {
  id: string;
  sourceType: number; // 1=爬取 2=主办方发布
  title: string;
  category: number; // 1-8
  topic?: string;
  startTime: string;
  endTime: string;
  location?: string;
  posterUrl?: string; // 后端字段名
  status: number; // 1=已发布 2=隐藏 3=已结束
  createdAt: string;
  signupCount: number;
  likeCount: number;
  favCount: number;
  commentCount: number;
  userState?: {
    liked: boolean;
    favorited: boolean;
  };
  signedUp?: boolean;
}

// 后端活动详情 DTO
interface ActivityDetailDTO {
  id: string;
  sourceType: number;
  title: string;
  category: number;
  topic?: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  posterUrls?: string[];
  externalUrl?: string;
  contactInfo?: string;
  status: number;
  createdAt: string;
  signupCount: number;
  likeCount: number;
  favCount: number;
  commentCount: number;
  userState?: {
    liked: boolean;
    favorited: boolean;
  };
  signedUp?: boolean;
}

// 后端评论 DTO
interface CommentDTO {
  id: string;
  targetType: number;
  targetId: string;
  userId: string;
  userNickname: string;
  userAvatar?: string;
  parentId?: string;
  rootId?: string;
  depth: number;
  body: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  replyCount: number;
  replies?: CommentDTO[];
}

// 后端评论树 DTO
interface CommentTreeDTO {
  rootComments: PageResponse<CommentDTO>;
  sort: string;
}

// 前端活动项（UI 使用）
export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  summary?: string;
  coverImageUrl?: string;
  category?: string;
  location?: string;
  startTime: string;
  endTime: string;
  status: ActivityStatus;
  signupPolicy: SignupPolicy;
  maxParticipants?: number;
  currentParticipants: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  userState?: {
    liked: boolean;
    favorited: boolean;
    signedUp: boolean;
  };
}

// 活动详情
export interface ActivityDetail extends ActivityItem {
  description: string;
  organizerName?: string;
  contactInfo?: string;
  tags?: string[];
  externalUrl?: string;
}

// 活动场次
export interface ActivitySession {
  id: string;
  activityId: string;
  sessionName: string;
  startTime: string;
  endTime: string;
  location?: string;
  maxParticipants?: number;
  currentParticipants: number;
}

// 报名请求
export interface SignupRequest {
  sessionId?: string; // HOSTED 类型活动需要选择场次
  realName: string;
  phone: string;
  email?: string;
  guestEmail?: string; // 游客报名时使用
  remarks?: string;
}

// 报名响应
export interface SignupResponse {
  signupId: string;
  activityId: string;
  sessionId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

/**
 * 映射活动类型：后端 sourceType → 前端 ActivityType
 */
function mapActivityType(sourceType: number): ActivityType {
  return sourceType === 2 ? 'HOSTED' : 'EXTERNAL';
}

/**
 * 映射活动状态：后端 status → 前端 ActivityStatus
 */
function mapActivityStatus(status: number): ActivityStatus {
  const statusMap: Record<number, ActivityStatus> = {
    1: 'PUBLISHED',
    2: 'DRAFT',
    3: 'COMPLETED',
  };
  return statusMap[status] || 'PUBLISHED';
}

/**
 * 映射分类：后端 int → 前端 string
 */
function mapCategory(category: number): string {
  const categoryMap: Record<number, string> = {
    1: '环保教育',
    2: '志愿服务',
    3: '社区活动',
    4: '文化交流',
    5: '体育健身',
    6: '科技创新',
    7: '艺术表演',
    8: '其他',
  };
  return categoryMap[category] || '其他';
}

/**
 * 映射后端活动列表项 DTO 到前端 ActivityItem
 */
function mapActivityListItemDtoToItem(dto: ActivityListItemDTO): ActivityItem {
  return {
    id: dto.id,
    type: mapActivityType(dto.sourceType),
    title: dto.title,
    summary: dto.topic,
    coverImageUrl: dto.posterUrl, // 字段名映射
    category: mapCategory(dto.category),
    location: dto.location,
    startTime: dto.startTime,
    endTime: dto.endTime,
    status: mapActivityStatus(dto.status),
    signupPolicy: 'OPEN', // 默认值，后端没有这个字段
    currentParticipants: dto.signupCount,
    viewCount: 0, // 后端没有这个字段
    likeCount: dto.likeCount,
    commentCount: dto.commentCount,
    userState: dto.userState ? {
      liked: dto.userState.liked,
      favorited: dto.userState.favorited,
      signedUp: dto.signedUp || false,
    } : undefined,
  };
}

/**
 * 映射后端活动详情 DTO 到前端 ActivityDetail
 */
function mapActivityDetailDtoToDetail(dto: ActivityDetailDTO): ActivityDetail {
  return {
    id: dto.id,
    type: mapActivityType(dto.sourceType),
    title: dto.title,
    summary: dto.topic,
    coverImageUrl: dto.posterUrls?.[0], // 取第一张海报
    category: mapCategory(dto.category),
    location: dto.location,
    startTime: dto.startTime,
    endTime: dto.endTime,
    status: mapActivityStatus(dto.status),
    signupPolicy: 'OPEN',
    currentParticipants: dto.signupCount,
    viewCount: 0,
    likeCount: dto.likeCount,
    commentCount: dto.commentCount,
    description: dto.description || '',
    contactInfo: dto.contactInfo,
    externalUrl: dto.externalUrl,
    userState: dto.userState ? {
      liked: dto.userState.liked,
      favorited: dto.userState.favorited,
      signedUp: dto.signedUp || false,
    } : undefined,
  };
}

/**
 * 映射后端评论 DTO 到前端 Comment
 */
function mapCommentDtoToComment(dto: CommentDTO): Comment {
  return {
    id: dto.id,
    userId: dto.userId,
    userName: dto.userNickname,
    userAvatarUrl: dto.userAvatar,
    content: dto.body,
    createdAt: dto.createdAt,
    likeCount: dto.likeCount,
    replyCount: dto.replyCount,
    replies: dto.replies?.map(mapCommentDtoToComment),
  };
}

/**
 * 获取活动列表
 */
export async function getActivities(params: {
  category?: string;
  status?: ActivityStatus;
  sort?: 'latest' | 'hot' | 'upcoming';
  page?: number;
  size?: number;
}): Promise<PageResponse<ActivityItem>> {
  const response = await apiGet<PageResponse<ActivityListItemDTO>>('/api/v1/activities', {
    category: params.category,
    status: params.status,
    sort: params.sort || 'latest',
    page: params.page || 1,
    size: params.size || 10,
  });
  
  return {
    ...response,
    items: response.items.map(mapActivityListItemDtoToItem)
  };
}

/**
 * 获取活动详情
 */
export async function getActivityDetail(id: string): Promise<ActivityDetail> {
  const dto = await apiGet<ActivityDetailDTO>(`/api/v1/activities/${id}`);
  return mapActivityDetailDtoToDetail(dto);
}

/**
 * 获取活动场次
 */
export async function getActivitySessions(
  id: string
): Promise<ActivitySession[]> {
  return apiGet<ActivitySession[]>(`/api/v1/activities/${id}/sessions`);
}

/**
 * 获取活动评论
 */
export async function getActivityComments(
  id: string,
  params: {
    sort?: 'latest' | 'hot';
    page?: number;
    size?: number;
  }
): Promise<PageResponse<Comment>> {
  const treeDto = await apiGet<CommentTreeDTO>(`/api/v1/activities/${id}/comments`, {
    sort: params.sort || 'latest',
    page: params.page || 1,
    size: params.size || 10,
  });
  
  // 将 CommentTreeDTO 转换为 PageResponse<Comment>
  return {
    ...treeDto.rootComments,
    items: treeDto.rootComments.items.map(mapCommentDtoToComment)
  };
}

/**
 * 活动报名（支持游客报名）
 */
export async function signupActivity(
  activityId: string,
  data: SignupRequest
): Promise<SignupResponse> {
  return apiPost<SignupResponse>(
    `/api/v1/activities/${activityId}/signups`,
    data,
    true // 需要 requestId 保证幂等
  );
}

/**
 * 修改报名信息
 * 注意：后端返回 Void，不返回 SignupResponse
 */
export async function updateSignup(
  activityId: string,
  signupId: string,
  data: Partial<SignupRequest>
): Promise<void> {
  return apiPatch<void>(
    `/api/v1/activities/${activityId}/signups/${signupId}`,
    data,
    true
  );
}

/**
 * 取消报名
 */
export async function cancelSignup(
  activityId: string,
  signupId: string,
  guestEmail?: string
): Promise<void> {
  // 如果提供了 guestEmail，需要在 body 中传递
  const body = guestEmail ? { guestEmail } : undefined;
  return apiDelete<void>(
    `/api/v1/activities/${activityId}/signups/${signupId}`,
    body
  );
}
