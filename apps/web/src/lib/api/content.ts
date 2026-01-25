/**
 * 科普内容相关 API
 */

import { apiGet } from '../api-client';
import { PageResponse } from '../api-types';

// 内容类型（前端使用）
export type ContentType = 'NEWS' | 'DYNAMIC' | 'POLICY' | 'WIKI';

// 后端内容列表项 DTO（实际返回的结构）
interface ContentListItemDTO {
  id: string;
  type: number; // 1=新闻 2=动态 3=政策 4=百科
  title: string;
  summary?: string;
  coverUrl?: string; // 后端字段名
  publishedAt: string;
  status: number;
  createdAt: string;
  likeCount: number;
  favCount: number;
  commentCount: number;
  viewCount: number;
  userState?: {
    liked: boolean;
    favorited: boolean;
  };
}

// 后端内容详情 DTO
interface ContentDetailDTO {
  id: string;
  type: number;
  title: string;
  summary?: string;
  coverUrl?: string;
  body: string;
  sourceType?: number;
  sourceUrl?: string;
  publishedAt: string;
  status: number;
  createdAt: string;
  likeCount: number;
  favCount: number;
  commentCount: number;
  viewCount: number;
  userState?: {
    liked: boolean;
    favorited: boolean;
  };
}

// 前端内容项（UI 使用）
export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  summary?: string;
  coverImageUrl?: string;
  authorName?: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  favoriteCount: number; // 收藏数
  commentCount: number;
  // 用户状态（已登录时）
  userState?: {
    liked: boolean;
    favorited: boolean;
  };
}

// 内容详情
export interface ContentDetail extends ContentItem {
  content: string;
  tags?: string[];
  sourceUrl?: string;
}

// 评论
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  content: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  liked?: boolean;
  replies?: Comment[];
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
 * 映射内容类型：后端 int → 前端 string
 */
function mapContentType(type: number): ContentType {
  const typeMap: Record<number, ContentType> = {
    1: 'NEWS',
    2: 'DYNAMIC',
    3: 'POLICY',
    4: 'WIKI',
  };
  return typeMap[type] || 'NEWS';
}

/**
 * 映射内容类型：前端 string → 后端 int
 */
function mapContentTypeToBackend(type?: ContentType): number | undefined {
  if (!type) return undefined;
  const typeMap: Record<ContentType, number> = {
    'NEWS': 1,
    'DYNAMIC': 2,
    'POLICY': 3,
    'WIKI': 4,
  };
  return typeMap[type];
}

/**
 * 映射后端内容列表项 DTO 到前端 ContentItem
 */
function mapContentListItemDtoToItem(dto: ContentListItemDTO): ContentItem {
  return {
    id: dto.id,
    type: mapContentType(dto.type),
    title: dto.title,
    summary: dto.summary,
    coverImageUrl: dto.coverUrl, // 字段名映射
    publishedAt: dto.publishedAt,
    viewCount: dto.viewCount,
    likeCount: dto.likeCount,
    favoriteCount: dto.favCount, // 添加收藏数映射
    commentCount: dto.commentCount,
    userState: dto.userState,
  };
}

/**
 * 映射后端内容详情 DTO 到前端 ContentDetail
 */
function mapContentDetailDtoToDetail(dto: ContentDetailDTO): ContentDetail {
  return {
    id: dto.id,
    type: mapContentType(dto.type),
    title: dto.title,
    summary: dto.summary,
    coverImageUrl: dto.coverUrl, // 字段名映射
    content: dto.body, // body → content
    sourceUrl: dto.sourceUrl,
    publishedAt: dto.publishedAt,
    viewCount: dto.viewCount,
    likeCount: dto.likeCount,
    favoriteCount: dto.favCount, // 添加收藏数映射
    commentCount: dto.commentCount,
    userState: dto.userState,
  };
}

/**
 * 获取内容列表
 */
export async function getContents(params: {
  type?: ContentType;
  page?: number;
  size?: number;
  sort?: 'latest' | 'hot';
}): Promise<PageResponse<ContentItem>> {
  const response = await apiGet<PageResponse<ContentListItemDTO>>('/api/v1/contents', {
    type: mapContentTypeToBackend(params.type),
    page: params.page || 1,
    size: params.size || 10,
    sort: params.sort || 'latest',
  });
  
  return {
    ...response,
    items: response.items.map(mapContentListItemDtoToItem)
  };
}

/**
 * 获取内容详情
 */
export async function getContentDetail(id: string): Promise<ContentDetail> {
  const dto = await apiGet<ContentDetailDTO>(`/api/v1/contents/${id}`);
  return mapContentDetailDtoToDetail(dto);
}

/**
 * 获取内容评论
 */
export async function getContentComments(
  id: string,
  params: {
    sort?: 'latest' | 'hot';
    page?: number;
    size?: number;
  }
): Promise<PageResponse<Comment>> {
  const treeDto = await apiGet<CommentTreeDTO>(`/api/v1/contents/${id}/comments`, {
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
