import { NextRequest, NextResponse } from 'next/server';
import {PresetModel} from "@/models/preset-model";
import {presetRepository} from "@/db/repositories/preset-repository";

/**
 * POST /api/presets/import
 * 从 JSON 文件导入预设
 *
 * 请求体：JSON 文件内容
 * 选项：overwrite 是否覆盖同名预设
 */
export async function POST(request: NextRequest) {
    const model = await request.json() as PresetModel;
    const res = await presetRepository.create(model);
    return NextResponse.json(res);
}