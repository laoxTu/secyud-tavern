import {interceptor} from "@/interceptor";
import {errorInterceptor} from "@/utils/error-interceptor";
import {paramInterceptor} from "@/utils/param-interceptor";
import {pluginManager} from "@/plugins";
import {databaseManager} from "@/database";

(async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const getManifest = await import("@/plugins/manifest");
        interceptor.register(errorInterceptor);
        interceptor.register(paramInterceptor);

        const manifests = await getManifest.default();
        if (manifests) {
            for (const manifest of manifests) {
                pluginManager.register(manifest);
            }
        }

        await pluginManager.loadServerPlugins();

        await databaseManager.migrate();
    }
})();