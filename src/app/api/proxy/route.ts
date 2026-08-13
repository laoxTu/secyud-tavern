import {interceptor} from "@/handler/server/interceptor";
import {NextResponse} from "next/server";
import {BusinessError} from "@/handler/models";

/**
 * @body { url: string, method: string }
 * @response {contentType: string, content: string}
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (request) => {
        const {url, method = 'GET'} =  await request.json();;
        if (!url) throw new BusinessError("missing url");
        const response = await fetch(url, {
            method,
            signal: request.signal,
        });

        const contentType = response.headers.get('content-type') || '';
        const transferEncoding = response.headers.get('transfer-encoding');

        // 检测流式响应，直接抛出错误
        if (
            contentType.includes('text/event-stream') ||
            contentType.includes('application/octet-stream') ||
            transferEncoding === 'chunked'
        ) throw new BusinessError('streaming response not supported!');

        const content = await response.text();

        return NextResponse.json({
            contentType,
            content,
        });
    }
)