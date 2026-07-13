import {fileURLToPath} from 'url';
import promise from "fs/promises";
import fs from "fs";
import path from "path";
import {PluginManifest} from "@/plugins/models";
import {PluginManager} from "@/plugins/manager";
import {randomBytes} from 'crypto';

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
        u => u.serverScript && u.serverScript !== "")
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
        u => u.clientScript && u.clientScript !== "")
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

async function ensureDir(dir: string) {
    try {
        await promise.access(dir);
    } catch (err) {
        await promise.mkdir(dir, {recursive: true});
    }
}

// 下载文件
async function downloadFile(url: string, dest: string) {
    if (await fileExists(dest)) return;
    await ensureDir(path.dirname(dest));
    console.log(`⬇️ download: ${url} to ${dest}`);

    const response = await fetch(url);
    if (!response.ok) {
        console.error(`download failed: ${response.status} ${response.statusText}`);
        return;
    }
    const totalBytes = parseInt(response.headers.get('content-length') as string, 10);
    let downloadedBytes = 0;
    // 创建可写流
    const fileStream = fs.createWriteStream(dest);

    // 使用流式读取
    const reader = response.body!.getReader();

    try {
        while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            downloadedBytes += value.length;
            if (totalBytes) {
                const percent = ((downloadedBytes / totalBytes) * 100).toFixed(1);
                const downloadedMB = (downloadedBytes / 1024 / 1024).toFixed(1);
                const totalMB = (totalBytes / 1024 / 1024).toFixed(1);
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(`⏳ download: ${percent}% (${downloadedMB}MB / ${totalMB}MB)`);
            }

            // 写入文件
            await new Promise((resolve, reject) => {
                fileStream.write(value, (err) => {
                    if (err) reject(err);
                    else resolve(null);
                });
            });
        }

        // 关闭流
        await new Promise((resolve, reject) => {
            fileStream.end((err: any) => {
                if (err) reject(err);
                else resolve(null);
            });
        });

        console.log('\n✅ download successfully!');
    } catch (err) {
        fileStream.destroy();
        throw err;
    }
}

// 检查文件是否存在
async function fileExists(filePath: string) {
    try {
        await promise.access(filePath);
        return true;
    } catch (err) {
        return false;
    }
}

