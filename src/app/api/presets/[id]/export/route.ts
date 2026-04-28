// app/api/presets/[id]/export/route.ts
import {NextResponse} from 'next/server';
import {repository} from "@/business/preset/repository";
import {interceptor} from "@/interceptor";

/**
 * 获取预设
 * @pathParams { id:string }
 * @response ReadableStream
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        const model = await repository.get(id, true);

        if (model === null) throw new Error('not found');

        // 1. 将 JSON 对象转为字符串
        const jsonStr = JSON.stringify(model);

        // 2. 创建 Web 标准的 ReadableStream（不是 Node.js 的 stream.ReadableStream）
        const encoder = new TextEncoder();
        const jsonStream = new ReadableStream({
            start(controller) {
                // 将 JSON 字符串编码为 Uint8Array 并加入流
                controller.enqueue(encoder.encode(jsonStr));
                controller.close();  // 关闭流
            }
        });

        // 3. 设置响应头，触发下载
        const headers = new Headers();
        headers.set('Content-Type', 'application/octet-stream');
        headers.set('Content-Disposition', `attachment; filename="${model.code}.json"`);

        return new NextResponse(jsonStream, {status: 200, headers});
    }
)
