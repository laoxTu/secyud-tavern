import {Registry} from "@/utils/register";
import {PluginManifest} from "@/plugins/models";
import {get} from "@/client";


class PluginManager extends Registry<PluginManifest> {
    initialized: boolean = false;

    constructor() {
        super(`plugin manager`);
    }

    public async initialize() {
        if (this.initialized) return;
        this.initialized = true;
        let manifests: PluginManifest[] | undefined = [];
        if (process.env.NEXT_RUNTIME === 'nodejs') {
            const getManifest = await import("./nodejs.get-plugin-manifest");
            manifests = await getManifest.default();
        } else {
            try {
                manifests = await get('/plugins');
            } catch (error) {
                console.error(error);
            }
        }
        if (manifests && manifests.length > 0) {
            for (const manifest of manifests) {
                this.register(manifest);
            }
        }
    }

    async getPlugins() {
        await this.initialize();
        return this.getSorted();
    }

    async loadServerPlugins() {
        await this.initialize();
        await this.use(async manifest => {
            await this.loadServerPlugin(manifest, manifest.serverScript);
        })
    }

    async loadClientPlugins(pluginApi?: Record<string, any>) {
        await this.initialize();
        await this.use(async manifest => {
            await this.loadClientPlugin(manifest, manifest.clientScript, pluginApi);
        })
    }

    protected async loadServerPlugin(manifest: PluginManifest, script: string | undefined) {
        try {
            if (!script) return;
            if (process.env.NEXT_RUNTIME !== 'nodejs') {
                console.info('[plugin manager] Edge runtime: skipping file operations');
                return;
            }
            console.debug(`[${this.name}] ℹ️ load plugin: ${manifest.id}`);
            const pluginModule = await import(/* webpackIgnore: true */`${manifest.directory}/${script}`);
            const plugin = pluginModule.default;
            await plugin();
            console.info(`[${this.name}] ✅ load plugin: ${manifest.id}`);
        } catch (error) {
            console.error(`[${this.name}] ❌ load plugin ${manifest.id} failed:`, error);
            throw error;
        }
    }

    protected async loadClientPlugin(manifest: PluginManifest, script: string | undefined, pluginApi?: Record<string, any>) {
        try {
            if (!script) return;
            console.log(`[${this.name}] ℹ️ load client plugin: ${manifest.id}`);
            // 通过 API 端点加载插件脚本，API 从 plugins/ 目录读取文件并返回
            const pluginUrl = `/api/plugins/${manifest.id}`;
            const pluginModule = await import(/* webpackIgnore: true */ pluginUrl);
            if (typeof pluginModule.default === 'function') {
                // 将宿主 API（React, 注册表等）传给插件的 register 函数
                await pluginModule.default(pluginApi ?? {});
            }
            console.log(`[${this.name}] ✅ load client plugin: ${manifest.id}`);
        } catch (error) {
            console.error(`[${this.name}] ❌ load client plugin ${manifest.id} failed:`, error);
        }
    }
}

export const pluginManager = (() =>
    (
        globalThis as { __pluginManager?: PluginManager }
    ).__pluginManager ??= new PluginManager())();