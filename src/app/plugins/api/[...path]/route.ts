import {interceptor} from "@/handler/server/interceptor";
import {pluginRouteManager} from "@/plugins/server/plugin-route";
import {BusinessError} from "@/handler/models";
import {NextRequest, NextResponse} from "next/server";


/**
 * 在路由树中查找匹配的处理器，支持 {param} 动态路径参数
 * @returns { handler, params } 或 null
 */
function resolveRoute(
    tree: Record<string, any>,
    method: string,
    pathSegments: string[]
): { handler: (req: NextRequest, records: Record<string, any>) => Promise<NextResponse>; params: Record<string, string> } | null {

    // 进入 [METHOD] 节点
    let node = tree[`[${method}]`];
    if (!node) return null;

    // 进入 "" 节点（registerRouteTree 中 path 始终以 / 开头，
    // split("/") 后第一个 / 前产生空字符串段）
    node = node[""];
    if (!node) return null;

    const params: Record<string, string> = {};

    for (const segment of pathSegments) {
        // 优先精确匹配
        if (node[segment]) {
            node = node[segment];
            continue;
        }

        // 检查动态参数段 {paramName}（由 getRouteTree 预存在 __dynamic 上）
        const dynamicKey: string | undefined = node["__dynamic"];
        if (dynamicKey) {
            const paramName = dynamicKey.slice(1, -1); // 去掉花括号
            params[paramName] = segment;
            node = node[dynamicKey];
            continue;
        }

        // 没有匹配的段
        return null;
    }

    const handler = node["__handler"];
    if (!handler) return null;

    return {handler, params};
}


/**
 * 通用插件路由处理器工厂
 * 遍历 getRouteTree() 构建的路由树，匹配动态参数（如 {id}）
 */
function createPluginRouteHandler(method: "GET" | "POST" | "PUT" | "DELETE") {
    return async (request: NextRequest, records: Record<string, any>) => {
        const params = await records.context.params;
        const pathSegments: string[] = params.path ?? [];

        const tree = pluginRouteManager.getRouteTree();
        const resolved = resolveRoute(tree, method, pathSegments);

        if (!resolved) {
            const path = pathSegments.length > 0 ? `/${pathSegments.join("/")}` : "";
            throw new BusinessError(
                `Plugin route not found: [${method}]/${path}`,
                "plugin.route_not_found"
            ).withValue("method", method).withValue("path", path);
        }

        // 将提取的路径参数注入 records
        records.pluginRouteParams = resolved.params;

        return resolved.handler(request, records);
    };
}


/**
 * GET /api/plugins/api/[...path]
 * @pathParams { path: string[] } — 插件路由的路径段
 * @openapi
 */
export const GET = interceptor.createRoute(createPluginRouteHandler("GET"));

/**
 * POST /api/plugins/api/[...path]
 * @pathParams { path: string[] } — 插件路由的路径段
 * @openapi
 */
export const POST = interceptor.createRoute(createPluginRouteHandler("POST"));

/**
 * PUT /api/plugins/api/[...path]
 * @pathParams { path: string[] } — 插件路由的路径段
 * @openapi
 */
export const PUT = interceptor.createRoute(createPluginRouteHandler("PUT"));

/**
 * DELETE /api/plugins/api/[...path]
 * @pathParams { path: string[] } — 插件路由的路径段
 * @openapi
 */
export const DELETE = interceptor.createRoute(createPluginRouteHandler("DELETE"));
