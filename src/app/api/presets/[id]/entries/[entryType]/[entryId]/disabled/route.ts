import {NextResponse} from 'next/server';
import {repository} from "@/business/preset/repository";
import {interceptor} from "@/interceptor";


/**
 * 更新条目
 * @pathParams { id:string, entryId:number, entryType:string }
 * @params {disabled:boolean}
 * @openapi
 */
export const PUT = interceptor.createRoute(
    async (request, records) => {
        const {id, entryType, entryId} = await records.context.params;
        const {disabled} = await records.searchParams as { disabled: boolean };
        await repository.entry.setDisabled(id, entryType, entryId, disabled);
        return NextResponse.json(null);
    }
)