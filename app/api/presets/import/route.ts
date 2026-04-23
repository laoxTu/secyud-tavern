import { NextRequest, NextResponse } from 'next/server';
import {Model} from "@/src/business/preset/model";
import {repository} from "@/src/business/preset/repository";

/**
 * POST /api/db/import
 * 从 JSON 文件导入预设
 *
 * 请求体：JSON 文件内容
 * 选项：overwrite 是否覆盖同名预设
 */
export async function POST(request: NextRequest) {
    const model = await request.json() as Model;
    const res = await repository.create(model);
    return NextResponse.json(res);
}