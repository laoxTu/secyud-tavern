import {and, like, SQL} from "drizzle-orm";
import {interceptor} from "@/server/interceptor";
import {storyRepository as repository} from "@/server/business/stories";
import {generateCreateModelApi, generateGetModelListApi} from "@/app/api/template";

/**
 * 获取预设分页列表
 * @params PageOptions
 * @response PagedResult<StoryModel>
 * @openapi
 */
export const GET = interceptor.createRoute(
    generateGetModelListApi(repository, search => table => {
        const conditions: SQL[] = [];
        const fuzzy = search?.fuzzy;
        if (fuzzy && fuzzy !== "") {
            conditions.push(like(table.name, `%${fuzzy}%`) as SQL);
        }

        return and(...conditions) as SQL;
    })
)

/**
 * 创建预设
 * @params {isImport?: boolean}
 * @body StoryModel
 * @response {id: string}
 * @openapi
 */
export const POST = interceptor.createRoute(
    generateCreateModelApi(repository)
)