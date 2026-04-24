// src/plugins/manager.ts
import {Registry} from "@/src/models/registerable";
import {PluginManifest} from ".";
import {ClientPluginManifest} from "@/src/plugins/models";
import path from "path";
import fs from 'fs/promises';

class PluginManager extends Registry<PluginManifest> {

    private initialized = false;
    private readonly pluginDirectory: string;

    constructor(pluginDirectory: string) {
        super(`plugin manager`);
        this.pluginDirectory = pluginDirectory;
    }

    async initialize() {

        if (this.initialized) return;
        this.initialized = true;

        const pluginsDir = this.pluginDirectory;

        // 检查插件目录是否存在
        try {
            await fs.access(pluginsDir);
        } catch {
            console.log(`📁 plugins folder not found: ${pluginsDir}`);
            return;
        }

        // 读取 plugins 目录下的所有文件夹
        const entries = await fs.readdir(pluginsDir, {withFileTypes: true});
        const pluginDirs = entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);

        console.log(`📂 find ${pluginDirs.length} plugins folder:`, pluginDirs);

        for (const pluginDir of pluginDirs) {
            const configPath = path.join(pluginsDir, pluginDir, 'manifest.json');
            const content = await fs.readFile(configPath, 'utf-8');
            const manifest = JSON.parse(content) as PluginManifest;
            manifest.directory = path.join(pluginsDir, pluginDir);
            this.register(manifest);
        }
    }


    async loadServerPlugins() {
        await this.initialize();
        await this.use(async manifest => {
            await this.loadServerPlugin(manifest);
        })
    }

    async loadServerPlugin(manifest: PluginManifest) {
        try {
            if (!manifest.serverScript) return;
            if (process.env.NEXT_RUNTIME !== 'nodejs') {
                console.log('Edge runtime: skipping file operations');
                return;
            }
            // 动态导入插件的 index.ts
            const pluginModule = await import(`${manifest.directory}/${manifest.serverScript}`);
            const plugin = pluginModule.default;
            await plugin();
            console.log(`✅ load plugin: ${manifest.id}`);

        } catch (error) {
            console.error(`❌ load plugin ${manifest.id} failed:`, error);
            throw error;
        }
    }


    async loadClientPlugins() {
        await this.initialize();
        await this.use(async manifest => {
            await this.loadClientPlugin(manifest);
        })
    }

    async loadClientPlugin(manifest: PluginManifest) {
        try {
            if (!manifest.serverScript) return;
            if (process.env.NEXT_RUNTIME !== 'nodejs') {
                console.log('Edge runtime: skipping file operations');
                return;
            }
            // 动态导入插件的 index.ts
            const pluginModule = await import(`${manifest.directory}/${manifest.clientScript}`);
            const plugin = pluginModule.default;
            await plugin();
            console.log(`✅ load plugin: ${manifest.id}`);
        } catch (error) {
            console.error(`❌ load plugin ${manifest.id} failed:`, error);
            throw error;
        }
    }
}


const pluginManager = new PluginManager("public/plugins");

export default pluginManager;