/**
 * API 统一导出
 */

// 基础类型和工具
export * from '../api-types';
export * from '../api-client';
export * from '../auth-store';

// 各模块 API
export * as homeApi from './home';
export * as contentApi from './content';
export * as activityApi from './activity';
export * as authApi from './auth';
export * as userApi from './user';
export * as pointsApi from './points';
export * as interactionApi from './interaction';
export * as filesApi from './files';
export * as hostApi from './host';
export * as searchApi from './search';
export * as recommendationApi from './recommendation';
export * as systemApi from './system';
export * as notificationApi from './notification';
export * as adminApi from './admin';
