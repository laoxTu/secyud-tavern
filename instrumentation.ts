// instrumentation.ts

import {createDb} from "@/database";
import {interceptor} from "@/interceptor";
import {pluginManager} from "@/plugins";
import {errorInterceptor} from "@/utils/error-interceptor";
import {paramInterceptor} from "@/utils/param-interceptor";
import i18nInterceptor from "@/localization/interceptor";

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const getManifest = await import("./src/plugins/manifest");
        interceptor.register(errorInterceptor);
        interceptor.register(paramInterceptor);
        interceptor.register(i18nInterceptor);

        const manifests = await getManifest.default();
        if (manifests) {
            for (const manifest of manifests) {
                pluginManager.register(manifest);
            }
        }

        await pluginManager.loadServerPlugins();

        await createDb();
    }
}