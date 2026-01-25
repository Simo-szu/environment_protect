/**
 * 支持与帮助相关 API
 */

import { apiPost } from '../api-client';

// 联系我们请求
export interface ContactRequest {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

// 用户反馈请求（映射到后端 DTO）
export interface FeedbackRequest {
    type: number; // 1=建议 2=Bug 3=表扬 4=其他
    rating: number; // 1-5
    title: string;
    content: string;
    contact?: string;
    anonymous: boolean;
}

// 前端类型映射
const FEEDBACK_TYPE_MAP: Record<string, number> = {
    'suggestion': 1,
    'bug': 2,
    'praise': 3,
    'other': 4
};

/**
 * 提交联系我们
 */
export async function submitContact(data: ContactRequest): Promise<void> {
    return apiPost<void>('/api/v1/support/contact', data);
}

/**
 * 提交用户反馈
 */
export async function submitFeedback(data: FeedbackRequest | { type: string; rating: number; title: string; content: string; contact?: string; anonymous: boolean }): Promise<void> {
    // 如果 type 是字符串，转换为数字
    const requestData: FeedbackRequest = {
        ...data,
        type: typeof data.type === 'string' ? FEEDBACK_TYPE_MAP[data.type] || 4 : data.type
    };
    return apiPost<void>('/api/v1/support/feedback', requestData);
}
