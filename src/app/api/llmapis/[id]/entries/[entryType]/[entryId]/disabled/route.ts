import {interceptor} from "@/handler/server/interceptor";
import {apiConfig} from "../../../../../models";
import {apiDisableEntry} from "@/app/api/template";


/**
 * 更新条目
 * @pathParams { id:string, entryId:number, entryType:string }
 * @params {disabled:boolean}
 * @openapi
 */
export const PUT = interceptor.createRoute(
    apiDisableEntry(apiConfig)
)