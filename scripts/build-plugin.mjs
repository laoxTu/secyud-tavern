/**
 * 插件打包脚本
 * 用法: npm run build-plugin <plugin-name>
 *
 *
 * 插件用原生 @/ 路径 + JSX，就像写内部代码：
 *   import { businessNavigationManager } from '@/business/client/navigation';
 */
import * as esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const aliasFile = path.join(root, 'plugins/_shared/build-alias.json');

const pluginName = process.argv[2];
if (!pluginName) {
    console.error('请指定插件名: node scripts/build-plugin.mjs <plugin-name>');
    process.exit(1);
}

// 加载自动生成的 alias 配置
if (!fs.existsSync(aliasFile)) {
    console.error('[build-plugin] 未找到 build-alias.json，请先运行: npm run gen-stubs');
    process.exit(1);
}
const alias = JSON.parse(fs.readFileSync(aliasFile, 'utf-8'));

const pluginDir = path.join(root, 'plugins', pluginName);
const entryFile = ['client.tsx', 'client.ts']
    .map(f => path.join(pluginDir, f))
    .find(f => fs.existsSync(f))
    || path.join(pluginDir, 'client.tsx');
const outFile = path.join(pluginDir, 'client.js');

console.log(`[build-plugin] 打包插件: ${pluginName}`);
console.log(`  入口: ${entryFile}`);
console.log(`  输出: ${outFile}`);

await esbuild.build({
    entryPoints: [entryFile],
    bundle: true,
    outfile: outFile,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    alias,
    // automatic → 使用 react/jsx-runtime（自动补 key，见 react-jsx-runtime.js）
    jsx: 'automatic',
    tsconfig: path.join(root, 'tsconfig.json'),
    loader: { '.ts': 'tsx' },
    minify: false,
    sourcemap: 'inline',
});

console.log(`[build-plugin] ✅ 打包完成: ${outFile}`);
