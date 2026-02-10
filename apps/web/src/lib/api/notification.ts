import { apiPut } from '../api-client';

export async function markNotificationRead(notificationId: string): Promise<void> {
  return apiPut<void>(`/api/v1/notifications/${notificationId}/read`, {});
}

export async function markAllNotificationsRead(): Promise<void> {
  return apiPut<void>('/api/v1/notifications/read-all', {});
}

