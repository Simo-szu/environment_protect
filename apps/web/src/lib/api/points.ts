/**
 * 积分系统相关 API
 */

import { apiGet, apiPost } from '../api-client';
import { PageResponse } from '../api-types';

// 积分账户
export interface PointsAccount {
  userId: string;
  totalPoints: number;
  availablePoints: number;
  level: number;
  pointsToNextLevel?: number;      // 距离下一等级还需积分
  nextLevelMinPoints?: number;     // 下一等级最低积分
}

// 积分记录
export interface PointsLedger {
  id: string;
  userId: string;
  amount: number;
  balance: number;
  reason: string;          // 原因描述（中文）
  reasonCode?: number;     // 原因代码
  memo?: string;           // 备注
  sourceType: string;
  sourceId?: string;
  createdAt: string;
}

// 签到记录
export interface SigninRecord {
  userId: string;
  signinDate: string;
  points: number;
  consecutiveDays: number;
}

// 每日任务
export interface DailyTask {
  id: string;
  name: string;
  code: string;
  points: number;
  progress: number;
  target: number;
  status: number; // 1=doing 2=claimable 3=done
}

// 每日问答
export interface DailyQuiz {
  quizDate: string;
  question: any; // Backend returns JsonNode, assumes title/options inside
  points: number;
  answered: boolean;
  isCorrect?: boolean;
}

// 问答提交请求
export interface QuizSubmissionRequest {
  quizDate: string; // yyyy-MM-dd
  userAnswer: any;
}

// 问答提交响应
export interface QuizSubmissionResponse {
  correct: boolean;
  earnedPoints: number;
  correctAnswer: number;
  explanation?: string;
}

/**
 * 获取积分账户
 */
export async function getPointsAccount(): Promise<PointsAccount> {
  return apiGet<PointsAccount>('/api/v1/points/account');
}

/**
 * 获取积分记录
 */
export async function getPointsLedger(params: {
  page?: number;
  size?: number;
}): Promise<PageResponse<PointsLedger>> {
  // 调用后端 GET /api/v1/points/ledger
  // items: PointsLedger[], total: number
  return apiGet<PageResponse<PointsLedger>>('/api/v1/points/ledger', params);
}

/**
 * 签到
 */
export async function signin(): Promise<SigninRecord> {
  return apiPost<SigninRecord>('/api/v1/points/signins', {}, true);
}

/**
 * 获取今日签到状态
 */
export async function getTodaySignin(): Promise<SigninRecord | null> {
  // 调用后端 GET /api/v1/points/signins/today
  return apiGet<SigninRecord | null>('/api/v1/points/signins/today');
}

/**
 * 获取每日任务列表
 */
export async function getDailyTasks(): Promise<PageResponse<DailyTask>> {
  return apiGet<PageResponse<DailyTask>>('/api/v1/points/tasks');
}

/**
 * 领取任务奖励
 */
export async function claimTaskReward(taskId: string): Promise<void> {
  return apiPost<void>(`/api/v1/points/tasks/${taskId}/claim`, {}, true);
}

/**
 * 获取今日问答
 */
export async function getTodayQuiz(): Promise<DailyQuiz | null> {
  return apiGet<DailyQuiz | null>('/api/v1/points/quiz/today');
}

/**
 * 提交问答答案
 */
export async function submitQuizAnswer(
  data: QuizSubmissionRequest
): Promise<QuizSubmissionResponse> {
  return apiPost<QuizSubmissionResponse>(
    '/api/v1/points/quiz/submissions',
    data,
    true
  );
}

/**
 * 获取可兑换商品
 */
export async function getExchangeGoods(): Promise<PageResponse<any>> {
  return apiGet<PageResponse<any>>('/api/v1/points/exchange/goods');
}

/**
 * 兑换商品
 */
export async function exchangeGood(
  goodId: string,
  shippingInfo: {
    recipientName: string;
    recipientPhone: string;
    shippingAddress: string;
    shippingNote?: string;
  }
): Promise<void> {
  return apiPost<void>('/api/v1/points/exchange/orders', {
    goodId,
    ...shippingInfo
  }, true);
}
