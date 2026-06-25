/**
 * 从 plugins\/*\/manifest.json 搜集 modules，生成 src/plugins/client/api-list.ts
 *
 * 用法: pnpm gen-plugin-api
 *
 * 扫描每个插件的 manifest.json → 收集 modules 字段 → 去重 → 生成 api-list.ts
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pluginsDir = path.join(root, 'plugins');

// 1. 扫描 plugins/ 下所有 manifest.json
const moduleSet = new Set<string>();
moduleSet.add('react/jsx-runtime');
moduleSet.add('react/jsx-dev-runtime');

const entries = fs.readdirSync(pluginsDir, {withFileTypes: true});
for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;

    const manifestPath = path.join(pluginsDir, entry.name, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.log(`  ⚠ ${entry.name}: 无 manifest.json，跳过`);
        continue;
    }

    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        const modules: string[] = manifest.modules ?? [];
        for (const m of modules) {
            moduleSet.add(m);
        }
        console.log(`  ✅ ${entry.name}: ${modules.length} modules`);
    } catch (e: any) {
        console.log(`  ⚠ ${entry.name}: manifest 解析失败 (${e.message})`);
    }
}

// 2. 生成 api-list.ts
const modules = Array.from(moduleSet).sort();
const lines: string[] = [];

lines.push(`import {def} from "@/plugins/client/api";`);
lines.push('');

// 每个模块 import * as moduleN
modules.forEach((m, i) => {
    lines.push(`import * as module${i} from '${m}';`);
});

lines.push('');
lines.push('export const buildPluginApi = () => {');

// 每个模块调用 def()
modules.forEach((m, i) => {
    lines.push(`    def('${m}', module${i});`);
});

lines.push('};');
lines.push('');

const outPath = path.join(root, 'src/plugins/client/api-list.ts');
fs.writeFileSync(outPath, lines.join('\n'));
console.log(`[api-list-gen] ✅ 生成 ${outPath} (${modules.length} 个模块)`);
