import type {NextConfig} from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntlConfig = createNextIntlPlugin('./src/localization/request.ts');


const nextConfig: NextConfig = {
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {exclude: ['error', 'warn', 'info']} : false,
    },
    experimental: {
        // 启用此选项，让 next build 使用项目本地安装的 tsc 命令
        useTypeScriptCli: true,
    },
};

function compose(...plugins: Array<(config: NextConfig) => NextConfig>) {
    return (config: NextConfig) => plugins.reduceRight((acc, plugin) => plugin(acc), config);
}

export default compose(withNextIntlConfig)(nextConfig);
