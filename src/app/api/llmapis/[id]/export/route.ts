import {interceptor} from "@/handler/server/interceptor";
import {apiConfig} from "../../models";
import {apiExportModel} from "@/app/api/template";

/**
 * 获取预设
 * @pathParams { id:string }
 * @response ReadableStream
 * @openapi
 */
export const GET = interceptor.createRoute(
    apiExportModel(apiConfig)
)
