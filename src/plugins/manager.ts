// src/plugins/manager.ts
import {Registry} from "@/src/models/registerable";
import {PluginManifest} from ".";

class PluginManager extends Registry<PluginManifest> {

    constructor() {
        super(`plugin manager`);
    }

    async loadServerPlugins() {
        await this.use(async manifest => {
            await this.loadPlugin(manifest, manifest.serverScript);
        })
    }

    async loadClientPlugins() {
        await this.use(async manifest => {
            await this.loadPlugin(manifest, manifest.clientScript);
        })
    }

    async loadPlugin(manifest: PluginManifest, script: string | undefined) {
        try {
            if (!script) return;
            if (process.env.NEXT_RUNTIME !== 'nodejs') {
                console.log('Edge runtime: skipping file operations');
                return;
            }
            const pluginModule = await import(`${manifest.directory}/${script}`);
            const plugin = pluginModule.default;
            await plugin();
            console.log(`✅ load plugin: ${manifest.id}`);
        } catch (error) {
            console.error(`❌ load plugin ${manifest.id} failed:`, error);
            throw error;
        }
    }
}


const pluginManager = new PluginManager();

export default pluginManager;