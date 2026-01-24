import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['zh', 'en'];
const defaultLocale = 'zh';

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 排除静态资源和API路由
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('.') ||
        pathname.startsWith('/api') ||
        pathname === '/favicon.ico'
    ) {
        return;
    }

    // 检查路径是否已包含语言前缀
    const hasLocale = locales.some(
        locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
    );

    // 如果没有语言前缀，重定向到默认语言
    if (!hasLocale) {
        return NextResponse.redirect(
            new URL(`/${defaultLocale}${pathname}`, request.url)
        );
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};