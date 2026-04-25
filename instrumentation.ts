// instrumentation.ts

import {createDb} from "@/src/db";
import {interceptor} from "@/src/interceptor";
import {pluginManager} from "@/src/plugins";
import {errorInterceptor} from "@/src/utils/error-interceptor";
import {paramInterceptor} from "@/src/utils/param-interceptor";
import i18nInterceptor from "@/src/localization/interceptor";

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