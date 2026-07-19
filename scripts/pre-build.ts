import {fileURLToPath} from 'url';
import promise from "fs/promises";
import path from "path";
import {PluginManifest} from "@/plugins/models";
import {PluginManager} from "@/plugins/manager";
import {randomBytes} from 'crypto';
import {downloadFile} from "@/utils/download";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pluginsDir = path.join(root, 'plugins');

await preBuild();

async function preBuild() {
    const config = await import('./build-config.json');
    const pluginManager = new PluginManager("GeneratePlugin");
    pluginManager.register(...(await getPluginManifests()));
    const manifests = pluginManager.getSorted();
    const manifestPath = path.join(root, 'src', 'plugins', 'manifests.ts');
    await promise.writeFile(manifestPath,
        `export const manifests = ${JSON.stringify(manifests)}`);
    const serverRegisterPath = path.join(root, 'src', 'plugins', 'server', 'registerer.ts');
    const serverPlugins = manifests.filter(
        u => u.serverScript)
    await promise.writeFile(serverRegisterPath,
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
        u => u.clientScript)
    await promise.writeFile(clientRegisterPath,
        `${clientPlugins
            .map((u, i) =>
                `import registerer${i} from '@plugins/${u.folder}/${u.clientScript}';`)
            .join(" ")}export async function registerClientPlugin() {${clientPlugins
            .map((u, i) =>
                `await registerer${i}();`)
            .join("")}}
        `);
    try {
        const envFilePath = path.join(root, '.env');
        // 使用 'wx' 标志
        await promise.writeFile(envFilePath, `SECRET_SALT=${generateSecureDigitString(40)}\r\nSECRET_KEYS=${generateSecureDigitString(39)}`, {flag: 'wx'});
        console.log('generated .env file!');
        return true;
    } catch (err: any) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }

    await downloadFromHuggingface(
        "Xenova/all-MiniLM-L6-v2", "all-MiniLM-L6-v2",
        [
            "config.json",
            // "onnx/model.onnx",
            "tokenizer_config.json",
            "tokenizer.json",
            "onnx/model_quantized.onnx"
        ]);

    await downloadFromHuggingface(
        "Xenova/bge-small-zh-v1.5", "bge-small-zh-v1.5",
        [
            "config.json",
            // "onnx/model.onnx",
            "tokenizer_config.json",
            "tokenizer.json",
            "onnx/model_quantized.onnx",
        ]);


    async function downloadFromHuggingface(repository: string, local: string, files: string[]) {

        for (const file of files) {
            await downloadFile(
                `${config.mirrors.huggingface}/${repository}/resolve/main/${file}`,
                path.join(root, 'public', 'models', `${local}/${file}`));
        }
    }
}


function generateSecureDigitString(length: number): string {
    if (length <= 0) return '';

    // 每次生成 1 字节（0-255），取 0-9 的映射
    const bytes = randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
        // 取模 10 得到 0-9
        result += bytes[i] % 10;
    }
    return result;
}

async function getPluginManifests() {
    // 检查插件目录是否存在
    try {
        await promise.access(pluginsDir);
    } catch {
        console.warn(`[plugin loader] 📁 plugins folder not found.`);
        return [];
    }

    // 读取 plugins 目录下的所有文件夹
    const entries = await promise.readdir(pluginsDir, {withFileTypes: true});
    const folders = entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith("_"))
        .map(entry => entry.name);

    console.info(`[plugin loader] 📂 find ${folders.length} plugins folder:`, folders);

    const manifests: PluginManifest[] = [];
    for (const folder of folders) {
        const manifestPath = path.join(pluginsDir, folder, "manifest.json");

        try {
            await promise.access(manifestPath);
            const manifestText = await promise.readFile(manifestPath, 'utf-8');
            const manifest = JSON.parse(manifestText) as PluginManifest;
            if (manifest.disabled) continue;
            manifest.folder = folder;
            manifests.push(manifest);
            console.info(`[plugin loader] 📂 find plugin: ${folder}`);
        } catch (e) {
            console.warn(`[plugin loader] 📂 ${folder} is not a plugin directory.`);
        }
    }
    return manifests;
}

