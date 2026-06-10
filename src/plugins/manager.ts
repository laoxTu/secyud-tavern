import {Registry} from "@/utils/register";
import {PluginManifest} from "@/plugins/models";

class PluginManager extends Registry<PluginManifest> {
    initialized: boolean = false;

    constructor() {
        super(`plugin manager`);
    }

    protected async initialize() {
        if (this.initialized) return;
        this.initialized = true;
        if (process.env.NEXT_RUNTIME === 'nodejs') {
            const getManifest = await import("./nodejs.get-plugin-manifest");

            const manifests = await getManifest.default();
            if (manifests) {
                for (const manifest of manifests) {
                    this.register(manifest);
                }
            }
        } else {
            // TODO api get plugin
        }
    }

    async loadServerPlugins() {
        await this.initialize();
        await this.use(async manifest => {
            await this.loadServerPlugin(manifest, manifest.serverScript);
        })
    }

    async loadClientPlugins() {
        await this.initialize();
        await this.use(async () => {
            // TODO 添加加载客户端插件过程
        })
    }

    protected async loadServerPlugin(manifest: PluginManifest, script: string | undefined) {
        try {
            if (!script) return;
            if (process.env.NEXT_RUNTIME !== 'nodejs') {
                console.log('[plugin manager] Edge runtime: skipping file operations');
                return;
            }
            console.log(`[${this.name}] ℹ️ load plugin: ${manifest.id}`);
            const pluginModule = await import(/* webpackIgnore: true */`${manifest.directory}/${script}`);
            const plugin = pluginModule.default;
            await plugin();
            console.log(`[plugin manager] ✅ load plugin: ${manifest.id}`);
        } catch (error) {
            console.error(`[plugin manger] ❌ load plugin ${manifest.id} failed:`, error);
            throw error;
        }
    }
}

export const pluginManager = new PluginManager();