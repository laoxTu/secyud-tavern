// instrumentation.ts
import {createDb} from "@/src/db";
import {middleware} from "@/src/middleware";
import {intlMiddleware} from "@/src/localization";
import {pluginManager} from "@/src/plugin";

export async function register() {
    if (process.env.NEXT_RUNTIME !== "nodejs") {
        return; // 只在 Node.js 运行时执行
    }

    await pluginManager.loadServerPlugins();
    await createDb();

    // middleware
    middleware.register(intlMiddleware)
}