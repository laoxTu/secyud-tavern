import {interceptor} from "@/handler/server/interceptor";
import {PresetModel} from "@/modules/presets/models";
import {presetRepository} from "@/modules/presets/server/repository";
import {NextResponse} from "next/server";

/**
 * @params { requires: string[] }
 * @response PagedResult<any>
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const {requires} = await records.params as { requires: string[] };
        const presets: PresetModel[] = await presetRepository
            .getWithRequires(requires);
        
        return NextResponse.json(presets);
    }
)
