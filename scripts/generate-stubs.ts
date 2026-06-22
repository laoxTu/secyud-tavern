/**
 * 从 plugins.json 生成 src/plugin.ts 和 plugins/_shared/plugin-api.json
 *
 * 用法: npm run gen-stubs
 *
 * 对每个路径用动态 import + try-catch 尝试加载：
 *   成功 → 提取 Object.keys() 作为命名导出
 *   失败 → 标记为 any（无命名导出，插件只能用默认导入）
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const pluginsJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'plugins.json'), 'utf-8')
) as string[];

const isValidExport = (k: string) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k);

interface ModuleInfo {
    path: string;
    keys: string[];
    success: boolean;
}

const modules: ModuleInfo[] = [];

for (const modulePath of pluginsJson) {
    try {
        // @/ → 相对路径，供 Node.js 解析
        let importPath = modulePath;
        if (modulePath.startsWith('@/')) {
            importPath = '../src/' + modulePath.slice(2);
        }
        const mod: any = await import(importPath);
        const keys = Object.keys(mod).filter(isValidExport);
        modules.push({path: modulePath, keys, success: true});
        console.log(`  ✅ ${modulePath} → ${keys.length} keys`);
    } catch (e: any) {
        modules.push({path: modulePath, keys: [], success: false});
        console.log(`  ⚠ ${modulePath} → any (${e.message?.split('\n')[0]})`);
    }
}

// —— 生成 src/plugin.ts ——
const lines: string[] = [];
lines.push(`import {def} from "@/plugins/client/api";`);
lines.push('');

const importNames: string[] = [];

// 全部导入（包括解析失败的浏览器专用库，Next.js 运行时 window 存在）
modules.forEach((m, i) => {
    const name = `module${i}`;
    importNames.push(name);
    lines.push(`import * as ${name} from '${m.path}';`);
});

lines.push('');
lines.push('export const buildPluginApi = () => {');

modules.forEach((m, i) => {
    lines.push(`    def('${m.path}', module${i});`);
});

lines.push('};');
lines.push('');

const pluginTsPath = path.join(root, 'src/plugins/client/api-list.ts');
fs.writeFileSync(pluginTsPath, lines.join('\n'));
console.log(`[gen-stubs] ✅ 生成 ${pluginTsPath} (${modules.length} 个模块)`);

// —— 生成 plugins/_shared/plugin-api.json ——
const apiData: Record<string, string[]> = {};
for (const m of modules) {
    apiData[m.path] = m.keys;
}
const apiJsonPath = path.join(root, 'plugins/_shared/plugin-api.json');
fs.mkdirSync(path.dirname(apiJsonPath), {recursive: true});
fs.writeFileSync(apiJsonPath, JSON.stringify(apiData, null, 2));
console.log(`[gen-stubs] ✅ 生成 ${apiJsonPath}`);
