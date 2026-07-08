import type {NextConfig} from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntlConfig = createNextIntlPlugin('./src/localization/request.ts');


const nextConfig: NextConfig = {
    serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-node'],
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {exclude: ['error', 'warn', 'info']} : false,
    },
};

function compose(...plugins: Array<(config: NextConfig) => NextConfig>) {
    return (config: NextConfig) => plugins.reduceRight((acc, plugin) => plugin(acc), config);
}

export default compose(withNextIntlConfig)(nextConfig);
