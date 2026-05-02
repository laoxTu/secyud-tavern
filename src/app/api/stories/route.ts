
import {NextResponse} from 'next/server';
import {eq, like, or, SQL} from "drizzle-orm";
import {interceptor} from "@/server/interceptor";
import {storyRepository as repository} from "@/server/business/stories";
import {BusinessError} from "@/shared/errors";
import {PageOptions} from "@/shared/models";
import {StoryModel} from "@/shared/business/stories";

/**
 * 获取预设分页列表
 * @params PageOptions
 * @response PagedResult<StoryModel>
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const options = records.searchParams as PageOptions;
        const models = await repository.getList(options,
            (e): SQL | SQL[] => {
                const conditions: SQL[] = [];
                if (options.search) {
                    conditions.push(like(e.name, `%${options.search}%`));
                }

                return or(...conditions) ?? [];
            });
        return NextResponse.json(models);
    }
)

/**
 * 创建预设
 * @params {isImport?: boolean}
 * @body StoryModel
 * @response {id: string}
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (request, records) => {
        const model = records.body as StoryModel;
        const {isImport} = records.searchParams as { isImport?: boolean };
        if (model.name === "") {
            throw new BusinessError("No name provided", "errors.empty_field")
                .withValue("field", "default.name");
        }

        if (isImport) {
            model.id = "";
        } else if (await repository.exist(e => (eq(e.id, model.id)))) {
            throw new BusinessError("Code already exists", "errors.duplicate_field")
                .withValue("field", "default.id")
                .withValue("entity_name", "preset.story")
                ;
        }

        const res = await repository.create(model);
        return NextResponse.json({id: res});
    }
)