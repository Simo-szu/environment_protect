import { apiGet } from '../api-client';

export interface PublicSystemConfig {
  googleClientId?: string;
  storageBaseUrl?: string;
}

export async function getPublicSystemConfig(): Promise<PublicSystemConfig> {
  return apiGet<PublicSystemConfig>('/api/v1/system/config');
}

export async function getPublicSystemConfigServer(
  baseUrl?: string
): Promise<PublicSystemConfig | null> {
  const targetBaseUrl = (baseUrl ?? '').trim().replace(/\/+$/, '');
  if (!targetBaseUrl) {
    return null;
  }
  try {
    const response = await fetch(`${targetBaseUrl}/api/v1/system/config`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return null;
    const payload = await response.json();
    if (!payload?.success) return null;
    return payload.data || null;
  } catch {
    return null;
  }
}
