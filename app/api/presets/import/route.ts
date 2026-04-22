import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/presets/import
 * 从 JSON 文件导入预设
 *
 * 请求体：JSON 文件内容
 * 选项：overwrite 是否覆盖同名预设
 */
export async function POST(request: NextRequest) {
    const body = await request.json();
    const overwrite = request.nextUrl.searchParams.get('overwrite') === 'true';
    // TODO: 实现导入逻辑
    return NextResponse.json({
        message: '导入预设',
        overwrite,
        imported: [],
        failed: []
    });
}