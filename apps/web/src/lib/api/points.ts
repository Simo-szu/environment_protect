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
  levelName?: string;
}

// 积分记录
export interface PointsLedger {
  id: string;
  userId: string;
  amount: number;
  balance: number;
  reason: string;
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
  taskName: string;
  description: string;
  points: number;
  maxCompletions: number;
  currentCompletions: number;
  completed: boolean;
}

// 每日问答
export interface DailyQuiz {
  id: string;
  quizDate: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  explanation?: string;
}

// 问答提交请求
export interface QuizSubmissionRequest {
  quizId: string;
  answer: number;
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
  return apiGet<PageResponse<PointsLedger>>('/api/v1/points/ledger', {
    page: params.page || 1,
    size: params.size || 20,
  });
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
  return apiGet<SigninRecord | null>('/api/v1/points/signins/today');
}

/**
 * 获取每日任务列表
 */
export async function getDailyTasks(): Promise<DailyTask[]> {
  return apiGet<DailyTask[]>('/api/v1/points/tasks');
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
