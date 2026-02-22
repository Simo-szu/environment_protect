import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // MinIO (dev)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      // Aliyun OSS (prod) — set NEXT_PUBLIC_STORAGE_BASE_URL to your OSS domain
      {
        protocol: 'https',
        hostname: '*.aliyuncs.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/game/:path*',
        destination: 'http://localhost:8082/api/v1/game/:path*',
      },
      {
        source: '/api/v1/admin/game/:path*',
        destination: 'http://localhost:8082/api/v1/admin/game/:path*',
      },
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/api/v1/:path*',
      },
      {
        source: '/health',
        destination: 'http://localhost:8080/health',
      },
      {
        source: '/swagger-ui/:path*',
        destination: 'http://localhost:8080/swagger-ui/:path*',
      },
      {
        source: '/api-docs/:path*',
        destination: 'http://localhost:8080/api-docs/:path*',
      },
      {
        source: '/v3/api-docs/:path*',
        destination: 'http://localhost:8080/v3/api-docs/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
