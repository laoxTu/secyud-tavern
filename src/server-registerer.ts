import {registerHasher} from "@/utils/hasher";
import * as dotenv from "dotenv";
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

let initialized = false;

export async function registerServerPlugins() {
    if (initialized) return;
    initialized = true;
    dotenv.config();
    interceptor.register(
        errorInterceptor,
        paramInterceptor
    );
    registerDeepseekServer();

    registerLorebooksServer();
    registerRegexesServer();
    registerStylesServer();
    registerScriptsServer();
    registerMacrosServer();

    registerHasher();
    await pluginManager.loadServerPlugins();
}