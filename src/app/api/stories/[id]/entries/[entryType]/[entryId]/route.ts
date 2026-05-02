
import {NextResponse} from 'next/server';
import {storyRepository as repository} from "@/server/business/stories";
import {interceptor} from "@/server/interceptor";

/**
 * 更新条目
 * @pathParams { id:string, entryId:number, entryType:string }
 * @body any
 * @openapi
 */
export const PUT = interceptor.createRoute(
    async (request, records) => {
        const {id, entryType, entryId} = await records.context.params;
        const model = records.body;
        await repository.entry.update(id, entryType, entryId, model);
        return NextResponse.json(null);
    }
)

/**
 * 删除条目
 * @pathParams { id:string, entryId:number, entryType:string }
 * @openapi
 */
export const DELETE = interceptor.createRoute(
    async (request, records) => {
        const {id, entryType, entryId} = await records.context.params;
        await repository.entry.delete(id, entryType, entryId);
        return NextResponse.json(null);
    }
)