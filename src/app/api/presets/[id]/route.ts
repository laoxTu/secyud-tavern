import {interceptor} from "@/handler/server/interceptor";
import {apiConfig} from "../models";
import {
    apiDeleteModel,
    apiGetModel,
    apiUpdateModel
} from "@/app/api/template";

/**
 * 获取预设
 * @pathParams { id:string }
 * @params { withDetails:boolean }
 * @response any
 * @openapi
 */
export const GET = interceptor.createRoute(
    apiGetModel(apiConfig)
)

/**
 * 更新预设
 * @pathParams { id:string }
 * @body any
 * @openapi
 */
export const PUT = interceptor.createRoute(
    apiUpdateModel(apiConfig)
)

/**
 * 删除预设
 * @pathParams { id:string }
 * @openapi
 */
export const DELETE = interceptor.createRoute(
    apiDeleteModel(apiConfig)
)