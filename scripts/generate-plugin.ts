
import {fileURLToPath} from 'url';
import fs from "fs/promises";
import path from "path";
import {PluginManifest} from "@/plugins/models";
import {PluginManager} from "@/plugins/manager";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pluginsDir = path.join(root, 'plugins');

await generatePlugin();

async function generatePlugin() {
    const pluginManager = new PluginManager("GeneratePlugin");
    pluginManager.register(...(await getPluginManifests()));
    const manifests = pluginManager.getSorted();
    const manifestPath = path.join(root, 'src', 'plugins', 'manifests.ts');
    await fs.writeFile(manifestPath,
        `export const manifests = ${JSON.stringify(manifests)}`);
    const serverRegisterPath = path.join(root, 'src', 'plugins', 'server', 'registerer.ts');
    const serverPlugins = manifests.filter(
        u => u.serverScript && u.serverScript !== "")
    await fs.writeFile(serverRegisterPath,
        `${serverPlugins
            .map((u, i) =>
                `import registerer${i} from '@plugins/${u.folder}/${u.serverScript}';`)
            .join(" ")}export async function registerServerPlugin() {${serverPlugins
            .map((u, i) =>
                `await registerer${i}();`)
            .join("")}}
        `);
    const clientRegisterPath = path.join(root, 'src', 'plugins', 'client', 'registerer.ts');
    const clientPlugins = manifests.filter(
        u => u.clientScript && u.clientScript !== "")
    await fs.writeFile(clientRegisterPath,
        `${clientPlugins
            .map((u, i) =>
                `import registerer${i} from '@plugins/${u.folder}/${u.clientScript}';`)
            .join(" ")}export async function registerClientPlugin() {${clientPlugins
            .map((u, i) =>
                `await registerer${i}();`)
            .join("")}}
        `);
}

async function getPluginManifests() {
    // 检查插件目录是否存在
    try {
        await fs.access(pluginsDir);
    } catch {
        console.warn(`[plugin loader] 📁 plugins folder not found.`);
        return [];
    }

    // 读取 plugins 目录下的所有文件夹
    const entries = await fs.readdir(pluginsDir, {withFileTypes: true});
    const folders = entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith("_"))
        .map(entry => entry.name);

    console.info(`[plugin loader] 📂 find ${folders.length} plugins folder:`, folders);

    const manifests: PluginManifest[] = [];
    for (const folder of folders) {
        const manifestPath = path.join(pluginsDir, folder, "manifest.json");

        try {
            await fs.access(manifestPath);
            const manifestText = await fs.readFile(manifestPath, 'utf-8');
            const manifest = JSON.parse(manifestText) as PluginManifest;
            manifest.folder = folder;
            manifests.push(manifest);
            console.info(`[plugin loader] 📂 find plugin: ${folder}`);
        } catch (e) {
            console.warn(`[plugin loader] 📂 ${folder} is not a plugin directory.`);
        }
    }
    return manifests;
}