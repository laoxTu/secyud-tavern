// app/api/presets/route.ts
import {NextResponse} from 'next/server';
import {PageOptions} from "@/models/common";
import {repository} from "@/business/preset/repository";
import {interceptor} from "@/interceptor";

/**
 * 获取条目分页列表
 * @pathParams { id:string }
 * @params PageOptions & { type: string }
 * @response PagedResult<any>
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        const options = records.searchParams as PageOptions & { type: string };
        const models = await repository.entry.getList(id, options.type, options);
        return NextResponse.json(models);
    }
)

/**
 * 创建条目
 * @pathParams { id:string }
 * @params { type:string }
 * @body any
 * @response {id: number}
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        const {type} = records.searchParams;
        const model = records.body;
        const res = await repository.entry.create(id, type, model);
        return NextResponse.json({id: res});
    }
)