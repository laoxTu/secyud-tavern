// src/app/api/presets/route.ts
import {NextResponse} from 'next/server';
import {eq, like, or, SQL} from "drizzle-orm";
import {interceptor} from "@/server/interceptor";
import {presetRepository} from "@/server/business/presets";
import {BusinessError} from "@/shared/errors";
import {PageOptions} from "@/shared/models";
import {PresetModel} from "@/shared/business/presets";

/**
 * 获取预设分页列表
 * @params PageOptions
 * @response PagedResult<PresetModel>
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const options = records.searchParams as PageOptions;
        const models = await presetRepository.getList(options,
            (e): SQL | SQL[] => {
                const conditions: SQL[] = [];
                if (options.search) {
                    conditions.push(like(e.name, `%${options.search}%`));
                    conditions.push(like(e.code, `%${options.search}%`));
                }

                return or(...conditions) ?? [];
            });
        return NextResponse.json(models);
    }
)

/**
 * 创建预设
 * @params {isImport?: boolean}
 * @body PresetModel
 * @response {id: string}
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (request, records) => {
        const model = records.body as PresetModel;
        const {isImport} = records.searchParams as { isImport?: boolean };
        if (model.name === "") {
            throw new BusinessError("No name provided", "errors.empty_field")
                .withValue("field", "default.name");
        }
        if (model.code === "") {
            throw new BusinessError("No code provided", "errors.empty_field")
                .withValue("field", "default.code");
        }

        if (isImport) {
            await presetRepository.delete(model.id)
        } else if (await presetRepository.exist(e => (eq(e.code, model.code)))) {
            throw new BusinessError("Code already exists", "errors.duplicate_field")
                .withValue("field", "default.code")
                .withValue("entity_name", "preset.name")
                ;
        }

        const res = await presetRepository.create(model);
        return NextResponse.json({id: res});
    }
)