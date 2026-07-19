import {interceptor} from "@/handler/server/interceptor";
import {imageRepository} from "@/business/server/image-repository";
import {NextResponse} from "next/server";

/**
 * @pathParams { id:string }
 * @response ReadableStream
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        const file = await imageRepository.get(id);
        // 3. 返回图片
        return new NextResponse(file.buffer, {
            headers: {
                'Content-Type': file.type ?? "",
                'Content-Disposition': `inline; filename="${id}"`,
                'Cache-Control': 'public, max-age=31536000, immutable', // 缓存一年
            },
        });
    }
)


/**
 * @pathParams { id:string }
 * @openapi
 */
export const DELETE = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        await imageRepository.delete(id);
        return NextResponse.json(null);
    }
);