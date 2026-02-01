/**
 * 互动相关 API（评论、点赞、收藏）
 */

import { apiPost, apiDelete } from '../api-client';

// 目标类型
export type TargetType = 'CONTENT' | 'ACTIVITY' | 'COMMENT';

// Reaction 类型映射
const REACTION_TYPE_MAP = {
  'LIKE': 1,
  'FAVORITE': 2,
  'DISLIKE': 3
} as const;

// Reaction 类型
export type ReactionType = 'LIKE' | 'FAVORITE' | 'DISLIKE';

// 创建评论请求
export interface CreateCommentRequest {
  targetType: number; // 1=CONTENT, 2=ACTIVITY
  targetId: string;
  body: string;
  parentId?: string;
}

// 评论响应
export interface CommentResponse {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  targetType: TargetType;
  targetId: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
  likeCount: number;
}

// 创建 Reaction 请求
export interface CreateReactionRequest {
  targetType: number; // 1=CONTENT, 2=ACTIVITY, 3=COMMENT
  targetId: string;
  reactionType: number; // 1=LIKE, 2=FAVORITE, 3=DISLIKE
}

// Reaction 响应
export interface ReactionResponse {
  id: string;
  userId: string;
  targetType: TargetType;
  targetId: string;
  reactionType: ReactionType;
  createdAt: string;
}

// 删除 Reaction 请求
export interface DeleteReactionRequest {
  targetType: number; // 1=CONTENT, 2=ACTIVITY, 3=COMMENT
  targetId: string;
  reactionType: number; // 1=LIKE, 2=FAVORITE, 3=DISLIKE
}

/**
 * 创建评论
 * targetType: 1=CONTENT, 2=ACTIVITY
 */
export async function createComment(
  data: CreateCommentRequest
): Promise<string> {
  // 后端返回 UUID，不是完整的 CommentResponse
  return apiPost<string>('/api/v1/comments', data);
}

// 注意：后端目前不支持删除评论接口
// 如需删除评论功能，需要后端先实现 DELETE /api/v1/comments/{id} 接口

/**
 * 创建 Reaction（点赞/收藏/踩）
 * targetType: 1=CONTENT, 2=ACTIVITY, 3=COMMENT
 * reactionType: 1=LIKE, 2=FAVORITE, 3=DISLIKE
 * 注意：后端返回 void，操作是幂等的
 */
export async function createReaction(
  targetType: number,
  targetId: string,
  reactionType: ReactionType
): Promise<void> {
  return apiPost<void>('/api/v1/reactions', {
    targetType,
    targetId,
    reactionType: REACTION_TYPE_MAP[reactionType]
  }, true);
}

/**
 * 删除 Reaction（取消点赞/收藏/踩）
 * targetType: 1=CONTENT, 2=ACTIVITY, 3=COMMENT
 * reactionType: 1=LIKE, 2=FAVORITE, 3=DISLIKE
 * 注意：后端使用 DELETE /api/v1/reactions（带 body）
 */
export async function deleteReaction(
  targetType: number,
  targetId: string,
  reactionType: ReactionType
): Promise<void> {
  return apiPost<void>('/api/v1/reactions/delete', {
    targetType,
    targetId,
    reactionType: REACTION_TYPE_MAP[reactionType]
  }, true);
}
