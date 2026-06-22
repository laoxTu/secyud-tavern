import {storyRepository as repository} from "@/stories/server/repository";
import {interceptor} from "@/handler/server/interceptor";
import {generateExportModelApi} from "@/app/api/template";

/**
 * 获取预设
 * @pathParams { id:string }
 * @response ReadableStream
 * @openapi
 */
export const GET = interceptor.createRoute(
    generateExportModelApi(repository, model => `story-${model.id}`)
)
