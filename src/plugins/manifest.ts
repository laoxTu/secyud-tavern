import fs from "fs/promises";
import {PluginManifest} from "@/src/plugins/index";
import path from "node:path";

export default async function getPluginManifests(pluginDir: string = "public/plugins/") {

    // 检查插件目录是否存在
    try {
        await fs.access(pluginDir);
    } catch {
        console.log(`📁 plugins folder not found: ${pluginDir}`);
        return;
    }

    // 读取 plugins 目录下的所有文件夹
    const entries = await fs.readdir(pluginDir, {withFileTypes: true});
    const folders = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

    console.log(`📂 find ${folders.length} plugins folder:`, folders);

    const manifests: PluginManifest[] = [];
    for (const folder of folders) {
        const pluginPath = path.join(pluginDir, folder);
        const manifestPath = path.join(pluginPath, `manifest.json`);

        try {
            await fs.access(manifestPath);
            const manifestText = await fs.readFile(manifestPath, 'utf-8');
            const manifest = JSON.parse(manifestText) as PluginManifest;
            manifest.directory = pluginPath;
            manifests.push(manifest);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {

        }
    }
    return manifests;
}