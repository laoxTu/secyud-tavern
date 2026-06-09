
import {llmapiRepository as repository} from "@/llmapis/server/repository";
import {interceptor} from "@/handler/server/interceptor";
import {
    generateCreateEntryApi,
    generateGetEntryListApi
} from "@/app/api/template";

/**
 * 获取条目分页列表
 * @pathParams { id:string, entryType: string }
 * @params PageOptions
 * @response PagedResult<any>
 * @openapi
 */
export const GET = interceptor.createRoute(
    generateGetEntryListApi(repository)
)

/**
 * 创建条目
 * @pathParams { id:string, entryType: string }
 * @body any
 * @response {id: number}
 * @openapi
 */
export const POST = interceptor.createRoute(
    generateCreateEntryApi(repository)
)