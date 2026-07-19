import {interceptor} from "@/handler/server/interceptor";
import {NextResponse} from "next/server";
import {imageRepository} from "@/business/server/image-repository";
import {PageOptions} from "@/business/models";


/**
 * @params PageOptions
 * @response PagedResult<any>
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const options = records.searchParams as PageOptions;
        const models = await imageRepository.getList(options);
        return NextResponse.json(models);
    }
)

/**
 * 创建预设
 * @response {id: string}
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (request) => {
        const buffer = Buffer.from(await request.arrayBuffer());
        const mimeType = request.headers.get('content-type') || 'application/octet-stream';
        const id = await imageRepository.create(buffer, mimeType);
        return NextResponse.json({id: id});
    }
);