import {presetRepository as repository} from "@/server/business/presets";
import {interceptor} from "@/server/interceptor";
import {
    generateDeleteModelApi,
    generateGetModelApi,
    generateUpdateModelApi
} from "@/app/api/template";

/**
 * 获取预设
 * @pathParams { id:string }
 * @params { withDetails:boolean }
 * @response PresetModel
 * @openapi
 */
export const GET = interceptor.createRoute(
    generateGetModelApi(repository)
)

/**
 * 更新预设
 * @pathParams { id:string }
 * @body any
 * @openapi
 */
export const PUT = interceptor.createRoute(
    generateUpdateModelApi(repository)
)

/**
 * 删除预设
 * @pathParams { id:string }
 * @openapi
 */
export const DELETE = interceptor.createRoute(
    generateDeleteModelApi(repository)
)