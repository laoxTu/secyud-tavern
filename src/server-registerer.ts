import { registerServerPlugin } from '@/plugins/server/registerer';

export async function registerServerPlugins() {
  const global = globalThis as { __initialized?: boolean };
  if (global.__initialized) return;
  global.__initialized = true;

  if (process.env.NODE_ENV === 'development') {
    // ✅ 替换为 console.log（带时间戳和前缀）
    console.debug = (...args: any[]) => {
      console.log(`[DEBUG] ${new Date().toISOString()}`, ...args);
    };
  }

  await registerServerPlugin();
}
