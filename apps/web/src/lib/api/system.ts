import { apiGet } from '../api-client';

export interface PublicSystemConfig {
  googleClientId?: string;
}

export async function getPublicSystemConfig(): Promise<PublicSystemConfig> {
  return apiGet<PublicSystemConfig>('/api/v1/system/config');
}

export async function getPublicSystemConfigServer(
  baseUrl: string = 'http://localhost:8080'
): Promise<PublicSystemConfig | null> {
  try {
    const response = await fetch(`${baseUrl}/api/v1/system/config`, {
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

