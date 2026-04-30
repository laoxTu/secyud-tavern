// app/api/presets/route.ts
import {NextResponse} from 'next/server';
import {presetRepository} from "@/server/business/presets";
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
        await presetRepository.entry.update(id, entryType, entryId, model);
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
        await presetRepository.entry.delete(id, entryType, entryId);
        return NextResponse.json(null);
    }
)