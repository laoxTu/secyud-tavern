import { interceptor } from "@/handler/server/interceptor";
import {NextResponse} from "next/server";
import {pluginManager} from "@/plugins/manager";

/**
 * 获取预设分页列表
 * @response PluginManifest[]
 * @openapi
 */
export const GET = interceptor.createRoute(
    async () => {
        const plugins = await pluginManager.getPlugins()
        return NextResponse.json(plugins);
    }
)