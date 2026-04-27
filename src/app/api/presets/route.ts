// app/api/presets/route.ts
import {NextResponse} from 'next/server';
import {PageOptions} from "@/models/common";
import {repository} from "@/business/preset/repository";
import {interceptor} from "@/interceptor";
import {PresetModel} from "@/business/preset/models";
import {BusinessError} from "@/business";
import {eq} from "drizzle-orm";

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
        if (model.name === "") {
            throw new BusinessError("No name provided", "error.empty_field")
                .withValue("field", "default.name");
        }
        if (model.code === "") {
            throw new BusinessError("No code provided", "error.empty_field")
                .withValue("field", "default.code");
        }

        if (await repository.exist(e => (eq(e.code, model.code)))) {
            throw new BusinessError("Code already exists", "error.duplicate_field")
                .withValue("field", "default.code")
                .withValue("entity_name", "preset.name")
                ;
        }

        const res = await repository.create(model);
        return NextResponse.json({id: res});
    }
)