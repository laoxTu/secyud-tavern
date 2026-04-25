// app/api/presets/route.ts
import {NextResponse} from 'next/server';
import {repository} from "@/business/preset/repository";
import {interceptor} from "@/interceptor";
import {PresetModel} from "@/business/preset/models";


/**
 * 获取预设
 * @pathParams { id:string }
 * @params { withDetails:boolean }
 * @response PresetModel
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        const {withDetails} = records.searchParams;
        const model = await repository.get(id, withDetails);
        return NextResponse.json(model);
    }
)

/**
 * 更新预设
 * @pathParams { id:string }
 * @response PresetModel
 * @openapi
 */
export const PUT = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        const model = records.body as Partial<PresetModel>;
        await repository.update(id, model);
        return NextResponse.json(model);
    }
)

/**
 * 删除预设
 * @pathParams { id:string }
 * @openapi
 */
export const DELETE = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        await repository.delete(id);
        return NextResponse.json(null);
    }
)