import { apiGet } from '../api-client';
import { PageResponse } from '../api-types';

export type ContentType = 'NEWS' | 'DYNAMIC' | 'POLICY' | 'WIKI';

interface ContentListItemDTO {
  id: string;
  type: number;
  title: string;
  summary?: string;
  coverUrl?: string;
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

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  summary?: string;
  coverImageUrl?: string;
  sourceUrl?: string;
  authorName?: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  userState?: {
    liked: boolean;
    favorited: boolean;
  };
}

export interface ContentDetail extends ContentItem {
  content: string;
  tags?: string[];
}

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

interface CommentTreeDTO {
  rootComments: PageResponse<CommentDTO>;
  sort: string;
}

const DATA_NEWS_SOURCE_PATTERNS = [
  /ourworldindata\.org\/data-insights\//i,
  /pudding\.cool\//i,
];

function mapContentType(type: number): ContentType {
  const typeMap: Record<number, ContentType> = {
    1: 'NEWS',
    2: 'DYNAMIC',
    3: 'POLICY',
    4: 'WIKI',
  };
  return typeMap[type] || 'NEWS';
}

function mapContentTypeToBackend(type?: ContentType): number | undefined {
  if (!type) {
    return undefined;
  }
  const typeMap: Record<ContentType, number> = {
    NEWS: 1,
    DYNAMIC: 2,
    POLICY: 3,
    WIKI: 4,
  };
  return typeMap[type];
}

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

function mapContentListItemDtoToItem(dto: ContentListItemDTO): ContentItem {
  return {
    id: dto.id,
    type: mapContentType(dto.type),
    title: dto.title,
    summary: dto.summary,
    coverImageUrl: dto.coverUrl,
    sourceUrl: dto.sourceUrl,
    publishedAt: dto.publishedAt,
    viewCount: dto.viewCount,
    likeCount: dto.likeCount,
    favoriteCount: dto.favCount,
    commentCount: dto.commentCount,
    userState: dto.userState,
  };
}

function mapContentDetailDtoToDetail(dto: ContentDetailDTO): ContentDetail {
  return {
    id: dto.id,
    type: mapContentType(dto.type),
    title: dto.title,
    summary: dto.summary,
    coverImageUrl: dto.coverUrl,
    sourceUrl: dto.sourceUrl,
    content: dto.body,
    publishedAt: dto.publishedAt,
    viewCount: dto.viewCount,
    likeCount: dto.likeCount,
    favoriteCount: dto.favCount,
    commentCount: dto.commentCount,
    userState: dto.userState,
  };
}

export async function getContents(params: {
  type?: ContentType;
  sourceKey?: string;
  page?: number;
  size?: number;
  sort?: 'latest' | 'hot';
}): Promise<PageResponse<ContentItem>> {
  const response = await apiGet<PageResponse<ContentListItemDTO>>('/api/v1/contents', {
    type: mapContentTypeToBackend(params.type),
    sourceKey: params.sourceKey,
    page: params.page || 1,
    size: params.size || 10,
    sort: params.sort || 'latest',
  });

  return {
    ...response,
    items: response.items.map(mapContentListItemDtoToItem),
  };
}

export async function getContentDetail(id: string): Promise<ContentDetail> {
  const dto = await apiGet<ContentDetailDTO>(`/api/v1/contents/${id}`);
  return mapContentDetailDtoToDetail(dto);
}

export function isDataNewsSourceUrl(sourceUrl?: string): boolean {
  if (!sourceUrl) {
    return false;
  }
  return DATA_NEWS_SOURCE_PATTERNS.some((pattern) => pattern.test(sourceUrl));
}

export async function getDataNewsContents(params: {
  page?: number;
  size?: number;
  sort?: 'latest' | 'hot';
} = {}): Promise<PageResponse<ContentItem>> {
  const page = params.page || 1;
  const targetSize = params.size || 6;
  return getContents({
    type: 'NEWS',
    sourceKey: 'owid_data_news,pudding_data_news',
    page,
    size: targetSize,
    sort: params.sort || 'latest',
  });
}

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

  return {
    ...treeDto.rootComments,
    items: treeDto.rootComments.items.map(mapCommentDtoToComment),
  };
}
