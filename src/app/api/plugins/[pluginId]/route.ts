import fs from "fs/promises";
import path from "path";
import {NextResponse} from "next/server";
import {pluginManager} from "@/plugins/manager";


/**
 @pathParams { pluginId:string }
 @response string
 @response-header Content-Type = "application/javascript; charset=utf-8"
 @response-header Cache-Control = "no-cache, no-store, must-revalidate"
 @openapi
 */
export async function GET(
    _request: Request,
    context: { params: Promise<{ pluginId: string }> }
) {
    const {pluginId} = await context.params;

    await pluginManager.initialize();
    const manifest = pluginManager.records[pluginId];

    if (!manifest) {
        return new NextResponse("Plugin not found", {status: 404});
    }

    const pluginPath = path.join(process.cwd(), manifest.path);
    const clientScript = manifest.clientScript;

    if (!clientScript) {
        return new NextResponse("No client script", {status: 404});
    }

    const scriptPath = path.join(pluginPath, clientScript);

    try {
        await fs.access(scriptPath);
    } catch {
        return new NextResponse("Client script not found", {status: 404});
    }

    const scriptContent = await fs.readFile(scriptPath, "utf-8");

    return new NextResponse(scriptContent, {
        headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            // 开发环境禁用缓存，方便调试
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    });
}
