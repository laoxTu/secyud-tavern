import {interceptor} from "@/handler/server/interceptor";
import {apiConfig} from "../models";
import {eq} from "drizzle-orm";
import {NextResponse} from "next/server";
import {deleteCache, getCache, setCache} from "@/utils/server/cache";
import {convertToRequire, PresetModel} from "@/modules/presets/models";

/**
 * 创建预设
 * @body any
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (request, records) => {
        const {sessionId} = records.searchParams;
        const buffer = await request.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        const importInput = await apiConfig.importHandler!(uint8);
        const models = Array.isArray(importInput) ? importInput : [importInput];
        await setCache(`preset_import_${sessionId}`, models)
        return NextResponse.json(models.map(convertToRequire));
    }
)

/**
 * 创建预设
 * @body any
 * @openapi
 */
export const PUT = interceptor.createRoute(
    async (request, records) => {
        const {sessionId} = records.searchParams;
        const imports: Record<string, boolean> = await request.json();
        const models =
            await getCache<PresetModel[]>(`preset_import_${sessionId}`);
        await deleteCache(`preset_import_${sessionId}`);
        const repository = apiConfig.repository;
        let res = undefined;
        for (const model of models) {
            if (!imports[model.code]) continue;
            const exist = await repository.exist(e => eq(e.id, model.id));
            if (exist) {
                await repository.delete(model.id);
            }
            const entity = await repository.create(model);
            if (!res) res = entity;
        }

        return NextResponse.json({id: models[0].id});
    }
)