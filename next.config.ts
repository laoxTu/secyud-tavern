import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntlConfig = createNextIntlPlugin(
  './src/localization/request.ts',
);

const nextConfig: NextConfig = {
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn', 'info'] }
        : false,
  },
  async headers() {
    return [
      // 配置模型目录，下载模型后将会缓存在前端
      {
        source: '/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

function compose(...plugins: Array<(config: NextConfig) => NextConfig>) {
  return (config: NextConfig) =>
    plugins.reduceRight((acc, plugin) => plugin(acc), config);
}

export default compose(withNextIntlConfig)(nextConfig);
