
import {and, eq, like, or, SQL} from "drizzle-orm";
import {interceptor} from "@/server/interceptor";
import {llmapiRepository as repository} from "@/server/business/llmapis";
import {BusinessError} from "@/shared/errors";
import {
    generateCreateModelApi,
    generateGetModelListApi
} from "@/app/api/template";

/**
 * 获取预设分页列表
 * @params PageOptions
 * @response PagedResult<LlmapiModel>
 * @openapi
 */
export const GET = interceptor.createRoute(
    generateGetModelListApi(repository, search => table => {
        const conditions: SQL[] = [];
        const fuzzy = search?.fuzzy;
        if (fuzzy && fuzzy !== "") {
            conditions.push(or(
                like(table.name, `%${fuzzy}%`),
                like(table.code, `%${fuzzy}%`)
            ) as SQL);
        }

        return and(...conditions) as SQL;
    })
)

/**
 * 创建预设
 * @params {isImport?: boolean}
 * @body LlmapiModel
 * @response {id: string}
 * @openapi
 */
export const POST = interceptor.createRoute(
    generateCreateModelApi(repository, async (model, {isImport}) => {
        if (model.code === "") {
            throw new BusinessError("No code provided", "error.empty_field")
                .withValue("field", "default.code");
        }
        if (!isImport && await repository.exist(e => (eq(e.code, model.code)))) {
            throw new BusinessError("Code already exists", "error.duplicate_field")
                .withValue("field", "default.code")
                .withValue("entity_name", "default.preset")
                ;
        }
    })
)