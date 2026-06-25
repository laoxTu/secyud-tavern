/**
 * 插件打包脚本
 * 用法: pnpm generate-plugin <plugin-name>
 *
 * esbuild 打包 → 将 manifest.modules 中的 import 替换为读 window.__PLUGIN_API__
 */
import * as esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pluginsDir = path.join(root, 'plugins');

const pluginName = process.argv[2];
if (!pluginName) {
    console.error('用法: pnpm generate-plugin <plugin-name>');
    process.exit(1);
}

const pluginDir = path.join(pluginsDir, pluginName);
if (!fs.existsSync(pluginDir)) {
    console.error(`插件目录不存在: ${pluginDir}`);
    process.exit(1);
}

const manifestPath = path.join(pluginDir, 'manifest.json');
const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    : {};
const modules: string[] = manifest.modules ?? [];

// react/jsx-runtime 是 jsx automatic 编译产物，react 在 modules 里就自动补上
if (modules.includes('react')) {
    modules.push('react/jsx-runtime', 'react/jsx-dev-runtime');
}

const entry = ['client.tsx', 'client.ts']
    .map(f => path.join(pluginDir, f))
    .find(f => fs.existsSync(f));

if (!entry) {
    console.error(`未找到入口文件 (client.tsx / client.ts): ${pluginDir}`);
    process.exit(1);
}

const outFile = path.join(pluginDir, 'client.js');

console.log(`[generate-plugin] ${pluginName}`);
console.log(`  入口: ${path.relative(root, entry)}`);
console.log(`  输出: ${path.relative(root, outFile)}`);
console.log(`  modules: ${modules.join(', ') || '(无)'}`);

// esbuild 打包（非 module 的正常 bundle，module 标 external 保留 import）
await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outfile: outFile,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    jsx: 'automatic',
    tsconfig: path.join(root, 'tsconfig.json'),
    loader: {'.ts': 'tsx'},
    external: modules,
    minify: false,
    sourcemap: 'inline',
});

// 后处理：将 external 残留的 import 语句替换为读 window.__PLUGIN_API__
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\\/@]/g, '\\$&');
let output = fs.readFileSync(outFile, 'utf-8');

for (const mod of modules) {
    const api = `window.__PLUGIN_API__['${mod}']`;

    // import x, { a, b } from 'mod'  →  const { default: x, a, b } = window.__PLUGIN_API__['mod'];
    output = output.replace(
        new RegExp(`import\\s*(\\w+)\\s*,\\s*\\{([^}]*)\\}\\s*from\\s*['"]${escapeRe(mod)}['"];?`, 'g'),
        (_, defaultName, names) => `const { default: ${defaultName}, ${names} } = ${api};`,
    );

    // import { a, b } from 'mod'  →  const { a, b } = window.__PLUGIN_API__['mod'];
    output = output.replace(
        new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${escapeRe(mod)}['"];?`, 'g'),
        (_, names) => `const {${names}} = ${api};`,
    );

    // import * as x from 'mod'  →  const x = window.__PLUGIN_API__['mod'];
    output = output.replace(
        new RegExp(`import\\s*\\*\\s*as\\s*(\\w+)\\s*from\\s*['"]${escapeRe(mod)}['"];?`, 'g'),
        (_, name) => `const ${name} = ${api};`,
    );

    // import x from 'mod'  →  const { default: x } = window.__PLUGIN_API__['mod'];
    output = output.replace(
        new RegExp(`import\\s*(\\w+)\\s*from\\s*['"]${escapeRe(mod)}['"];?`, 'g'),
        (_, name) => `const { default: ${name} } = ${api};`,
    );
}

fs.writeFileSync(outFile, output);
console.log(`[generate-plugin] ✅ 完成`);
