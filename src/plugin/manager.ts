// src/plugin/manager.ts
import {Registry} from "@/src/model/registerable";
import {PluginManifest} from ".";
import path from "path";
import fs from "fs/promises";

class PluginManager extends Registry<PluginManifest> {

    private initialized = false;
    private readonly pluginDirectory: string;

    constructor(pluginDirectory: string) {
        super(`plugin manager (${pluginDirectory})`);
        this.pluginDirectory = pluginDirectory;
    }

    async initialize() {
        if (this.initialized) return;
        this.initialized = true;
        const pluginsDir = path.join(process.cwd(), this.pluginDirectory);

        // 检查插件目录是否存在
        try {
            await fs.access(pluginsDir);
        } catch {
            console.log('📁 plugins 目录不存在，跳过插件加载');
            return;
        }

        // 读取 plugins 目录下的所有文件夹
        const entries = await fs.readdir(pluginsDir, {withFileTypes: true});
        const pluginDirs = entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);

        console.log(`📂 发现 ${pluginDirs.length} 个插件目录:`, pluginDirs);

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
            // 动态导入插件的 index.ts
            const pluginModule = await import(path.join(manifest.directory, manifest.serverScript));
            const plugin = pluginModule.default;
            await plugin();
            console.log(`✅ 加载插件: ${manifest.id}`);

        } catch (error) {
            console.error(`❌ 加载插件失败 ${manifest.id}:`, error);
            throw error;
        }
    }


    // 新增：获取前端可用的插件清单（过滤敏感信息）
    async getClientManifests() {
        const res: {
            id: string,
            version: string,
            api: string
        }[] = [];

        await this.use(async manifest => {
            if (!manifest.clientScript) return;
            res.push({
                id: manifest.id,
                version: manifest.version,
                api: `/api/plugins/${manifest.id}/${manifest.clientScript}`
            })
        })

        return res;
    }
}


const pluginManager = new PluginManager("plugin manager");

export default pluginManager;