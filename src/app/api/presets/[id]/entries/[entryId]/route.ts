// app/api/presets/route.ts
import {NextResponse} from 'next/server';
import {repository} from "@/business/preset/repository";
import {interceptor} from "@/interceptor";
import {PresetModel} from "@/business/preset/models";


/**
 * 更新条目
 * @pathParams { id:string, entryId:number }
 * @params { type:string }
 * @response PresetModel
 * @openapi
 */
export const PUT = interceptor.createRoute(
    async (request, records) => {
        const {id, entryId} = await records.context.params;
        const {type} = records.searchParams;
        const model = records.body as Partial<PresetModel>;
        await repository.entry.update(id, type, entryId, model);
        return NextResponse.json(model);
    }
)

/**
 * 删除条目
 * @pathParams { id:string, entryId:number }
 * @params { type:string }
 * @openapi
 */
export const DELETE = interceptor.createRoute(
    async (request, records) => {
        const {id, entryId} = await records.context.params;
        const {type} = records.searchParams;
        await repository.entry.delete(id, type, entryId);
        return NextResponse.json(null);
    }
)