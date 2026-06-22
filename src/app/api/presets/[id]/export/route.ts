import {presetRepository as repository} from "@/presets/server/repository";
import {interceptor} from "@/handler/server/interceptor";
import {validate} from "uuid";
import {eq} from "drizzle-orm";
import {imageRepository} from "@/business/server/image-repository";
import {NextResponse} from "next/server";

/**
 * 获取预设
 * @pathParams { id:string }
 * @response ReadableStream
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        const model = await repository.get(id, true,
            table => validate(id) ? eq(table.id, id) : eq(table.code, id));
        if (model === null) throw new Error('not found');


        const coverId = model.content.coverId;

        const image =
            coverId ? await imageRepository.get(coverId) : null;


        const encoder = new TextEncoder();
        const jsonStream = new ReadableStream({
            start(controller) {
                if (image?.buffer) {
                    controller.enqueue(image.buffer);
                }
                // 将 JSON 字符串编码为 Uint8Array 并加入流
                const jsonStr = JSON.stringify(model);
                controller.enqueue(encoder.encode(jsonStr));
                controller.close();  // 关闭流
            }
        });

        // 3. 设置响应头，触发下载
        const headers = new Headers();
        headers.set('Content-Type', 'application/octet-stream');
        headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(`preset-${model.content.author ?? ""}-${model.code}-${model.version}`)}.${coverId ? "png" : "json"}`);

        return new NextResponse(jsonStream, {status: 200, headers});
    }
)
