import {interceptor} from "@/handler/server/interceptor";
import {errorInterceptor} from "@/handler/server/error-interceptor";
import {paramInterceptor} from "@/handler/server/param-interceptor";
import {pluginManager} from "@/plugins/manager";
import {registerDeepseekServer} from "@/engines/deepseek/server";
import {registerStylesServer} from "@/engines/styles/server";
import {registerScriptsServer} from "@/engines/scripts/server";
import {registerRegexesServer} from "@/engines/regexes/server";
import {registerLorebooksServer} from "@/engines/lorebooks/server";
import {registerMacrosServer} from "@/engines/macros/server";
import {registerOpenAIServer} from "@/engines/openai/server";

export async function registerServerPlugins() {
    const global = globalThis as { __initialized?: boolean };
    if (global.__initialized) return;
    global.__initialized = true;
    interceptor.register(
        errorInterceptor,
        paramInterceptor
    );
    registerDeepseekServer();
    registerOpenAIServer();

    registerLorebooksServer();
    registerRegexesServer();
    registerStylesServer();
    registerScriptsServer();
    registerMacrosServer();

    if (process.env.NODE_ENV === 'development') {
        // ✅ 替换为 console.log（带时间戳和前缀）
        console.debug = (...args: any[]) => {
            console.log(`[DEBUG] ${new Date().toISOString()}`, ...args);
        };
    }

    await pluginManager.loadServerPlugins();
}