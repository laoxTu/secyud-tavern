import {llmapiRepository as repository} from "@/server/business/llmapis";
import {interceptor} from "@/server/interceptor";
import {generateSetDisableEntryApi} from "@/app/api/template";

/**
 * 更新条目
 * @pathParams { id:string, entryId:number, entryType:string }
 * @params {disabled:boolean}
 * @openapi
 */
export const PUT = interceptor.createRoute(
    generateSetDisableEntryApi(repository)
)