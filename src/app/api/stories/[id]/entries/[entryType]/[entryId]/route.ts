import {storyRepository as repository} from "@/stories/server/repository";
import {interceptor} from "@/handler/server/interceptor";
import {
    generateDeleteEntryApi,
    generateUpdateEntryApi
} from "@/app/api/template";

/**
 * 更新条目
 * @pathParams { id:string, entryId:number, entryType:string }
 * @body any
 * @openapi
 */
export const PUT = interceptor.createRoute(
    generateUpdateEntryApi(repository)
)

/**
 * 删除条目
 * @pathParams { id:string, entryId:number, entryType:string }
 * @openapi
 */
export const DELETE = interceptor.createRoute(
    generateDeleteEntryApi(repository)
)