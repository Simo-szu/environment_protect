import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";
import createNextIntlPlugin from 'next-intl/plugin';
import { loadEnvFile } from 'node:process';
import { resolve } from 'node:path';

// Load root .env so monorepo env vars are available during build
try {
  loadEnvFile(resolve(__dirname, '../../.env'));
} catch {
  // ignore if file doesn't exist (e.g. CI injects env vars directly)
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.replace(/\/+$/, '');
}

function parseRemotePattern(baseUrl: string): RemotePattern {
  const url = new URL(baseUrl);
  const pathname = (url.pathname || '/').replace(/\/+$/, '') || '/';

  return {
    protocol: url.protocol.replace(':', '') as 'http' | 'https',
    hostname: url.hostname,
    ...(url.port ? { port: url.port } : {}),
    pathname: pathname === '/' ? '/**' : `${pathname}/**`,
  };
}

const socialApiOrigin = requireEnv('SOCIAL_API_ORIGIN');
const gameApiOrigin = requireEnv('GAME_API_ORIGIN');
const storagePublicBaseUrl = requireEnv('STORAGE_PUBLIC_BASE_URL');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [parseRemotePattern(storagePublicBaseUrl)],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/game/:path*',
        destination: `${gameApiOrigin}/api/v1/game/:path*`,
      },
      {
        source: '/api/v1/admin/game/:path*',
        destination: `${gameApiOrigin}/api/v1/admin/game/:path*`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${socialApiOrigin}/api/v1/:path*`,
      },
      {
        source: '/health',
        destination: `${socialApiOrigin}/health`,
      },
      {
        source: '/swagger-ui/:path*',
        destination: `${socialApiOrigin}/swagger-ui/:path*`,
      },
      {
        source: '/api-docs/:path*',
        destination: `${socialApiOrigin}/api-docs/:path*`,
      },
      {
        source: '/v3/api-docs/:path*',
        destination: `${socialApiOrigin}/v3/api-docs/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
