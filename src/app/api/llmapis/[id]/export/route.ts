import {llmapiRepository as repository} from "@/server/business/llmapis";
import {interceptor} from "@/server/interceptor";
import {generateExportModelApi} from "@/app/api/template";

/**
 * 获取预设
 * @pathParams { id:string }
 * @response ReadableStream
 * @openapi
 */
export const GET = interceptor.createRoute(
    generateExportModelApi(repository, model => `${model.name}-${model.id}`)
)
