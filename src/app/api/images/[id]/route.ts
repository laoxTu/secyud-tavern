import {interceptor} from "@/handler/server/interceptor";
import {imageRepository} from "@/business/server/image-repository";
import {NextResponse} from "next/server";
import {BusinessError} from "@/handler/models";

/**
 * @pathParams { id:string }
 * @response ReadableStream
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const {id} = records.params;
        const file = await imageRepository.get(id);

        if (!file) {
            throw new BusinessError(
                `Image not found: ${id}`,
                "image.not_found",
                undefined,
                404);
        }

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
        const {id} = records.params;
        await imageRepository.delete(id);
        return NextResponse.json(null);
    }
);