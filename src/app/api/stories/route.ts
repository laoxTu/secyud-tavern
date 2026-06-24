import {interceptor} from "@/handler/server/interceptor";
import {apiConfig} from "./models";
import {apiCreateModel, apiGetModelList} from "@/app/api/template";

/**
 * 获取预设分页列表
 * @params PageOptions
 * @response PagedResult<any>
 * @openapi
 */
export const GET = interceptor.createRoute(
    apiGetModelList(apiConfig)
)

/**
 * 创建预设
 * @params {isImport?: boolean}
 * @body any
 * @response {id: string}
 * @openapi
 */
export const POST = interceptor.createRoute(
    apiCreateModel(apiConfig)
)