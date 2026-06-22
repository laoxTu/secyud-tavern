import {llmapiRepository as repository} from "@/llmapis/server/repository";
import {interceptor} from "@/handler/server/interceptor";
import {generateExportModelApi} from "@/app/api/template";
import {validate} from "uuid";
import {eq} from "drizzle-orm";

/**
 * 获取预设
 * @pathParams { id:string }
 * @response ReadableStream
 * @openapi
 */
export const GET = interceptor.createRoute(
    generateExportModelApi(repository,
        model => `llmapi-${model.code}`,
        id => table => validate(id) ? eq(table.id, id) : eq(table.code, id),
        model => {
            model.key = undefined;
        }
    )
)
