/**
 * 自动生成 _shared/stubs 和 esbuild alias
 *
 * 用法: npm run gen-stubs
 *
 * 流程:
 *   1. 导入 client-registerer → 触发所有模块的 def() 调用
 *   2. 读取 stubPoints → 为每个 def() 路径生成一个 stub
 *   3. 输出 build-alias.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const stubsDir = path.join(root, 'plugins/_shared/stubs');
const aliasFile = path.join(root, 'plugins/_shared/build-alias.json');

async function main() {
    console.log('[gen-stubs] 导入模块注册...');
    await import('../src/client-registerer');
    await new Promise(r => setTimeout(r, 200));

    const { pluginApi, stubPoints } = await import('../src/plugins/client/api');

    // 打印结构概览
    console.log('[gen-stubs] stub 端点:', stubPoints);

    fs.rmSync(stubsDir, { recursive: true, force: true });
    fs.mkdirSync(stubsDir, { recursive: true });
    const alias: Record<string, string> = {};

    for (const modulePath of stubPoints) {
        // 在 pluginApi 树中定位到对应节点
        const segments = modulePath.split('/').filter(x => x !== '');
        let node = pluginApi;
        for (const seg of segments) {
            node = node?.[seg];
        }
        if (!node || typeof node !== 'object') {
            console.warn(`  ⚠ ${modulePath} 节点不存在，跳过`);
            continue;
        }

        const keys = Object.keys(node);
        if (keys.length === 0) continue;

        const stubName = segments.join('-') + '.js';
        const accessPath = segments.map(s => `["${s}"]`).join('');
        const exportLines = keys.map(k => `export const { ${k} } = api${accessPath};`).join('\n');

        fs.writeFileSync(
            path.join(stubsDir, stubName),
            `const api = window.__PLUGIN_API__;\n${exportLines}\n`
        );

        alias[modulePath] = path.join(stubsDir, stubName).replace(/\\/g, '/');
        console.log(`  stub: ${modulePath} → ${stubName} (${keys.join(', ')})`);
    }

    // React alias（始终需要）
    alias['react'] = path.join(root, 'plugins/_shared/react-shim.js').replace(/\\/g, '/');
    alias['react/jsx-runtime'] = path.join(root, 'plugins/_shared/react-jsx-runtime.js').replace(/\\/g, '/');

    fs.writeFileSync(aliasFile, JSON.stringify(alias, null, 2));
    console.log(`[gen-stubs] ✅ 完成 (${Object.keys(alias).length} 个映射)`);
}

main().catch(err => {
    console.error('[gen-stubs] ❌', err);
    process.exit(1);
});
