// app/api/presets/route.ts
import {NextResponse} from 'next/server';
import {PageOptions} from "@/models/common";
import {repository} from "@/business/preset/repository";
import {interceptor} from "@/interceptor";
import {like, or, SQL} from "drizzle-orm";

/**
 * 获取条目分页列表
 * @pathParams { id:string, entryType: string }
 * @params PageOptions
 * @response PagedResult<any>
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const {id, entryType} = await records.context.params as { id: string, entryType: string };
        const options = records.searchParams as PageOptions;
        const models = await repository.entry.getList(id, entryType, options, p => {
            const conditions: SQL[] = [];
            if (options.search) {
                conditions.push(like(p.search, `%${options.search}%`));
            }

            return or(...conditions) ?? [];
        });
        return NextResponse.json(models);
    }
)

/**
 * 创建条目
 * @pathParams { id:string, entryType: string }
 * @body any
 * @response {id: number}
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (request, records) => {
        const {id, entryType} = await records.context.params as { id: string, entryType: string };
        const model = records.body;
        const res = await repository.entry.create(id, entryType, model);
        return NextResponse.json({id: res});
    }
)