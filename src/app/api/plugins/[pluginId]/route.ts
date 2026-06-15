import fs from "fs/promises";
import {NextResponse} from "next/server";
import {pluginManager} from "@/plugins/manager";
import {fileURLToPath} from "url";
import {interceptor} from "@/handler/server/interceptor";
import {BusinessError} from "@/handler/models";


/**
 @pathParams { pluginId:string }
 @response string
 @response-header Content-Type = "application/javascript; charset=utf-8"
 @response-header Cache-Control = "no-cache, no-store, must-revalidate"
 @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const {pluginId} = await records.context.params;

        const manifest = pluginManager.records[pluginId];

        if (!manifest) {
            throw new BusinessError("Plugin not found");
        }

        const clientScript = manifest.clientScript;

        if (!clientScript) {
            throw new BusinessError("No client script");
        }

        const scriptPath = fileURLToPath(`${manifest.directory}/${clientScript}`);

        try {
            await fs.access(scriptPath);
        } catch {
            throw new BusinessError("Client script not found");
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
);
