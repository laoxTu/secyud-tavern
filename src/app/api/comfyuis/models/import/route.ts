import {interceptor} from "@/handler/server/interceptor";
import {apiConfig} from "../models";
import {apiImportModel} from "@/app/api/template";


/**
 * 创建预设
 * @body any
 * @response {id: string}
 * @openapi
 */
export const POST = interceptor.createRoute(
    apiImportModel(apiConfig)
)
