// app/api/presets/route.ts
import {NextResponse} from 'next/server';
import {PageOptions} from "@/models/common";
import {repository} from "@/business/preset/repository";
import {interceptor} from "@/interceptor";
import {PresetModel} from "@/business/preset/models";

/**
 * 获取预设分页列表
 * @params PageOptions
 * @response PagedResult<PresetModel>
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const options = records.searchParams as PageOptions;
        const models = await repository.getList(options);
        return NextResponse.json(models);
    }
)

/**
 * 创建预设
 * @body PresetModel
 * @response {id: string}
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (request, records) => {
        const model = records.body as PresetModel;
        const res = await repository.create(model);
        return NextResponse.json({id: res});
    }
)