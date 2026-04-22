import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
    params: {
        id: string;
    };
}

/**
 * GET /api/presets/:id
 * 获取单个预设详情
 */
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    const { id } = params;
    // TODO: 实现获取预设详情逻辑
    return NextResponse.json({ message: `获取预设 ${id}` });
}

/**
 * PUT /api/presets/:id
 * 更新预设（支持部分更新）
 */
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    const { id } = params;
    const body = await request.json();
    // TODO: 实现更新预设逻辑
    return NextResponse.json({ message: `更新预设 ${id}`, body });
}

/**
 * DELETE /api/presets/:id
 * 删除预设
 */
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    const { id } = params;
    // TODO: 实现删除预设逻辑
    return NextResponse.json({ message: `删除预设 ${id}` });
}