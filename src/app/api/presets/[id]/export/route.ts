import {presetRepository as repository} from "@/server/business/presets";
import {interceptor} from "@/server/interceptor";
import {generateExportModelApi} from "@/app/api/template";
import {validate} from "uuid";
import {eq} from "drizzle-orm";

/**
 * 获取预设
 * @pathParams { id:string }
 * @response ReadableStream
 * @openapi
 */
export const GET = interceptor.createRoute(
    generateExportModelApi(repository,
        model => `${model.name}-${model.id}`,
        id => table => validate(id) ? eq(table.id, id) : eq(table.code, id)
    )
)
