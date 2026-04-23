import {NextResponse} from 'next/server';
import {PageOptions} from "@/src/model/common";
import {repository} from "@/src/business/preset/repository";
import {interceptor} from "@/src/interceptor";
import {PresetModel} from "@/src/business/preset";

/**
 * GET /api/db
 * 获取当前用户的预设列表
 */
export const GET = interceptor.createRoute(
    async request => {
        const options = await request.json() as PageOptions;
        const models = await repository.getList(options);
        return NextResponse.json(models);
    }
)

/**
 * POST /api/db
 * 创建新预设
 *
 * 请求体：完整的预设 JSON 对象
 * 验证：检查 id 唯一性、格式正确性
 */
export const POST = interceptor.createRoute(
    async request => {
        const model = await request.json() as PresetModel;
        const res = await repository.create(model);
        return NextResponse.json({id: res});
    }
)