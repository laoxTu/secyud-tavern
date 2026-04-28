// app/api/presets/route.ts
import {NextResponse} from 'next/server';
import {repository} from "@/business/preset/repository";
import {interceptor} from "@/interceptor";
import {PresetModel} from "@/business/preset/models";


/**
 * 更新条目
 * @pathParams { id:string, entryId:number, entryType:string }
 * @response PresetModel
 * @openapi
 */
export const PUT = interceptor.createRoute(
    async (request, records) => {
        const {id, entryType, entryId} = await records.context.params;
        const model = records.body as Partial<PresetModel>;
        await repository.entry.update(id, entryType, entryId, model);
        return NextResponse.json(model);
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