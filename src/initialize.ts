import {pluginManager} from "@/plugins";

(async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const getManifest = await import("@/plugins/manifest");

        const manifests = await getManifest.default();
        if (manifests) {
            for (const manifest of manifests) {
                pluginManager.register(manifest);
            }
        }

        await pluginManager.loadServerPlugins();
    }
})();