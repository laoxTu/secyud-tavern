import {interceptor} from "@/handler/server/interceptor";
import {apiConfig} from "../models";
import {
    apiDeleteModel,
    apiGetModel,
    apiUpdateModel
} from "@/app/api/template";

/**
 * @pathParams { id:string }
 * @params { withDetails:boolean }
 * @response any
 * @openapi
 */
export const GET = interceptor.createRoute(
    apiGetModel(apiConfig)
)

/**
 * @pathParams { id:string }
 * @body any
 * @openapi
 */
export const PUT = interceptor.createRoute(
    apiUpdateModel(apiConfig)
)

/**
 * @pathParams { id:string }
 * @openapi
 */
export const DELETE = interceptor.createRoute(
    apiDeleteModel(apiConfig)
)