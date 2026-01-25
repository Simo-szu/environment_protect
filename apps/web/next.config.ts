import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // API 代理：将前端 /api/v1/* 转发到后端 8080
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/api/v1/:path*',
      },
      // 健康检查
      {
        source: '/health',
        destination: 'http://localhost:8080/health',
      },
      // Swagger UI（开发调试用）
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