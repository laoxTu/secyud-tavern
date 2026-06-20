/**
 * 插件打包脚本
 * 用法: npm run build-plugin <plugin-name>
 *
 * 构建时通过 onResolve+onLoad 将已注册路径替换为
 * window.__PLUGIN_API__ 虚拟模块。
 * 导出 key 从 plugin-api.json 读取（由 gen-stubs 生成）。
 */
import * as esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const apiJsonFile = path.join(root, 'plugins/_shared/plugin-api.json');

const pluginName = process.argv[2];
if (!pluginName) {
    console.error('请指定插件名: node scripts/build-plugin.mjs <plugin-name>');
    process.exit(1);
}

const pluginDir = path.join(root, 'plugins', pluginName);
const entryFile = ['client.tsx', 'client.ts']
        .map(f => path.join(pluginDir, f))
        .find(f => fs.existsSync(f))
    || path.join(pluginDir, 'client.tsx');
const outFile = path.join(pluginDir, 'client.js');

console.log(`[build-plugin] 打包插件: ${pluginName}`);
console.log(`  入口: ${entryFile}`);
console.log(`  输出: ${outFile}`);

// 1. 读取 gen-stubs 生成的 key 映射（不 import plugin.ts，避免加载浏览器专用库）
const apiKeys: Record<string, string[]> = JSON.parse(fs.readFileSync(apiJsonFile, 'utf-8'));

// 3. esbuild 插件
const windowImportPlugin = {
    name: 'window-import',
    setup(build: any) {
        build.onResolve({filter: /./}, (args: any) => {
            if (apiKeys.hasOwnProperty(args.path)) {
                return {path: args.path, namespace: 'plugin-api'};
            }
            return null;
        });

        build.onLoad({filter: /.*/, namespace: 'plugin-api'}, (args: any) => {
            const keys = apiKeys[args.path];
            if (!keys) return null;

            if (keys.length > 0) {
                const lines = keys
                    .filter((k: string) => k !== 'default')
                    .map((k: string) => `export const { ${k} } = window.__PLUGIN_API__['${args.path}'];`)
                    .join('\n');
                return {contents: lines, loader: 'js'};
            }

            return {contents: `export default window.__PLUGIN_API__['${args.path}'];`, loader: 'js'};
        });
    },
};

await esbuild.build({
    entryPoints: [entryFile],
    bundle: true,
    outfile: outFile,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    jsx: 'automatic',
    tsconfig: path.join(root, 'tsconfig.json'),
    loader: {'.ts': 'tsx'},
    minify: false,
    plugins: [windowImportPlugin],
    sourcemap: 'inline',
});

console.log(`[build-plugin] ✅ 打包完成: ${outFile}`);
