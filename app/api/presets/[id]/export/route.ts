import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/presets/export
 * 批量导出多个预设
 *
 * 请求体：{ ids: string[] }
 * 返回：打包的 JSON 文件
 */
export async function POST(request: NextRequest) {
    const { ids } = await request.json();
    // TODO: 实现导出逻辑
    return NextResponse.json({
        message: '导出预设',
        ids,
        presets: []
    });
}