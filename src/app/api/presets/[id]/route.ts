// src/app/api/presets/route.ts
import {NextResponse} from 'next/server';
import {validate} from "uuid";
import {eq} from "drizzle-orm";
import {presetRepository, presets} from "@/server/business/presets";
import {interceptor} from "@/server/interceptor";
import {PresetModel} from "@/shared/business/presets";

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
        const {withDetails} = records.searchParams as { withDetails?: boolean };
        const model = await presetRepository.get(id, withDetails,
            eq(validate(id) ? presets.id : presets.code, id));
        return NextResponse.json(model);
    }
)

/**
 * 更新预设
 * @pathParams { id:string }
 * @body any
 * @openapi
 */
export const PUT = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        const model = records.body as Partial<PresetModel>;
        await presetRepository.update(id, model);
        return NextResponse.json(null);
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
        await presetRepository.delete(id);
        return NextResponse.json(null);
    }
)