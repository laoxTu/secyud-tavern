import {interceptor} from "@/handler/server/interceptor";
import {apiConfig} from "../../../../models";
import {apiExistEntry} from "@/app/api/template";

/**
 * 获取条目分页列表
 * @pathParams { id:string, entryType: string }
 * @params PageOptions
 * @response PagedResult<any>
 * @openapi
 */
export const GET = interceptor.createRoute(
    apiExistEntry(apiConfig)
)