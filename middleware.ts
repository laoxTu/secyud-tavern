// middleware.ts
// 中间件
import {middleware} from "@/src/middleware";
import {NextFetchEvent, NextRequest, NextResponse} from "next/server";

// 主中间件函数：组合所有逻辑
export default async function middleware(request: NextRequest, event: NextFetchEvent) {
    const response = NextResponse.next();
    return middleware.handle(request, event, response);
}

// 配置匹配器，排除不需要中间件的路径
export const config = {
    matcher: [
        // 匹配所有路径，除了 api、_next/static、_next/image、favicon.ico 等
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'
    ]
};