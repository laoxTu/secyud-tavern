import {llmapiRepository as repository} from "@/server/business/llmapis";
import {interceptor} from "@/server/interceptor";
import {
    generateDeleteModelApi,
    generateGetModelApi,
    generateUpdateModelApi
} from "@/app/api/template";
import {Hasher} from "@/server/hasher";

/**
 * 获取预设
 * @pathParams { id:string }
 * @params { withDetails:boolean }
 * @response LlmapiModel
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
    generateUpdateModelApi(repository, async params => {
        if (params.key) {
            params.key = Hasher.instance.encrypt(params.key)
        }
    })
)

/**
 * 删除预设
 * @pathParams { id:string }
 * @openapi
 */
export const DELETE = interceptor.createRoute(
    generateDeleteModelApi(repository)
)