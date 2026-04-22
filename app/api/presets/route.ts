import {NextResponse} from 'next/server';
import {PageOptions} from "@/models/common-types";
import {presetRepository} from "@/db/repositories/preset-repository";
import {PresetModel} from "@/models/preset-model";
import {requestHandler} from "@/services/middleware";

/**
 * GET /api/presets
 * 获取当前用户的预设列表
 */
export const GET = requestHandler(
    async request => {
        const options = await request.json() as PageOptions;
        const models = await presetRepository.getList(options);
        return NextResponse.json(models);
    }
)

/**
 * POST /api/presets
 * 创建新预设
 *
 * 请求体：完整的预设 JSON 对象
 * 验证：检查 id 唯一性、格式正确性
 */
export const POST = requestHandler(
    async request => {
        const model = await request.json() as PresetModel;
        const res = await presetRepository.create(model);
        return NextResponse.json({id: res});
    }
)