import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/presets
 * 获取当前用户的预设列表
 *
 * 查询参数：
 * - type: 按类型筛选
 * - tags: 按标签筛选（逗号分隔）
 * - search: 搜索关键词
 * - limit: 分页限制（默认 20）
 * - offset: 分页偏移（默认 0）
 * - sort: 排序字段（createdAt, updatedAt, name）
 * - order: 排序方向（asc, desc）
 */
export async function GET(request: NextRequest) {
    // TODO: 实现获取预设列表逻辑
    return NextResponse.json({ message: '获取预设列表' });
}

/**
 * POST /api/presets
 * 创建新预设
 *
 * 请求体：完整的预设 JSON 对象
 * 验证：检查 id 唯一性、格式正确性
 */
export async function POST(request: NextRequest) {
    // TODO: 实现创建预设逻辑
    return NextResponse.json({ message: '创建预设' });
}