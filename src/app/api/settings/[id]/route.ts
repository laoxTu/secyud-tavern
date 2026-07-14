import {interceptor} from "@/handler/server/interceptor";
import {NextResponse} from "next/server";
import {settingRepository} from "@/modules/settings/server/repository";

/**
 * @pathParams { id:string }
 * @params { withDetails:boolean }
 * @response { id: string, data: string}
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        const setting = await settingRepository.get(id);
        return NextResponse.json(setting ?? {});
    }
)

/**
 * @pathParams { id:string }
 * @body {data: string}
 * @openapi
 */
export const PUT = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        const {data} = await request.json();
        await settingRepository.set({id, data});
        return NextResponse.json(null);
    }
)
