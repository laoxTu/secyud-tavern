
import {interceptor} from "@/handler/server/interceptor";
import {apiConfig} from "../../../../models";
import {
    apiDeleteEntry, apiGetEntry,
    apiUpdateEntry
} from "@/app/api/template";


/**
 * 更新条目
 * @pathParams { id:string, entryId:number, entryType:string }
 * @response any
 * @openapi
 */
export const GET = interceptor.createRoute(
    apiGetEntry(apiConfig)
)

/**
 * 更新条目
 * @pathParams { id:string, entryId:number, entryType:string }
 * @body any
 * @openapi
 */
export const PUT = interceptor.createRoute(
    apiUpdateEntry(apiConfig)
)

/**
 * 删除条目
 * @pathParams { id:string, entryId:number, entryType:string }
 * @openapi
 */
export const DELETE = interceptor.createRoute(
    apiDeleteEntry(apiConfig)
)