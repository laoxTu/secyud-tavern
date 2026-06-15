import fs from "fs/promises";
import path from "path";
import {pathToFileURL} from 'url';
import {PluginManifest} from "./models";

const pluginDir = "plugins";

export default async function getPluginManifests() {
    // 检查插件目录是否存在
    try {
        await fs.access(pluginDir);
    } catch {
        console.log(`[plugin loader] 📁 plugins folder not found: ${pluginDir}`);
        return;
    }

    // 读取 plugins 目录下的所有文件夹
    const entries = await fs.readdir(pluginDir, {withFileTypes: true});
    const folders = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

    console.log(`[plugin loader] 📂 find ${folders.length} plugins folder:`, folders);

    const manifests: PluginManifest[] = [];
    for (const folder of folders) {
        const pluginPath = path.join(process.cwd(), pluginDir, folder);
        const manifestPath = path.join(pluginPath, "manifest.json");

        try {
            await fs.access(manifestPath);
            const manifestText = await fs.readFile(manifestPath, 'utf-8');
            const manifest = JSON.parse(manifestText) as PluginManifest;
            manifest.path = `/${pluginDir}/${folder}`;
            manifest.directory = pathToFileURL(pluginPath).toString();
            manifests.push(manifest);
            console.log(`[plugin loader] 📂 find plugin: ${pluginDir}/${folder}`);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {
            console.warn(`[plugin loader] 📂 ${pluginDir}/${folder} is not a plugin directory.`);
        }
    }
    return manifests;
}