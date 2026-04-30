import {registerInterceptors} from "@/server/interceptor";
import {registerBusiness} from "@/server/business";
import {pluginManager} from "@/shared/plugins";

let initialized = false;
export async function registerServerPlugins() {
    if (initialized) return;
    initialized = true;
    registerInterceptors();
    registerBusiness();
    await pluginManager.loadServerPlugins();
}