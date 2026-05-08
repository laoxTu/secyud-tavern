import {registerInterceptors} from "@/server/interceptor";
import {registerBusiness} from "@/server/business";
import {registerHasher} from "@/server/hasher";
import * as dotenv from "dotenv";
import {pluginManager} from "@/shared/plugins";

let initialized = false;
export async function registerServerPlugins() {
    if (initialized) return;
    initialized = true;
    dotenv.config();
    registerInterceptors();
    registerBusiness();
    registerHasher();
    await pluginManager.loadServerPlugins();
}