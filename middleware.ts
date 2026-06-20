// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {defaultLocale, locales} from "@/localization/config";

// 创建 next-intl 中间件
const intlMiddleware = createMiddleware({
    // 支持的语言列表
    locales: locales,
    // 默认语言
    defaultLocale: defaultLocale,
    // 可选：语言前缀的显示策略
    localePrefix: 'always', // 'always' | 'as-needed' | 'never'
});

export default function middleware(request: NextRequest) {
    // 直接调用 next-intl 的中间件
    return intlMiddleware(request);
}

export const config = {
    // 匹配所有路径，但排除 API 路由、静态文件、Next.js 内部文件
    matcher: [
        /*
         * 匹配所有路径，除了：
         * - API 路由 (api/*)
         * - _next/static (静态文件)
         * - _next/image (图片优化)
         * - favicon.ico (网站图标)
         * - 所有 . 开头的文件 (如 .next, .env)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
};