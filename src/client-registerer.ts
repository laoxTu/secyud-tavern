'use client';
import { useEffect, useState } from 'react';

import { useHandler } from '@/interceptors/client';
import { registerClientPlugin } from '@/plugins/client/registerer';

async function loadClientPlugins() {
  await registerClientPlugin();
}

export const useClientPlugins = () => {
  const [initialized, setInitialized] = useState(false);
  const { handler } = useHandler();
  useEffect(() => {
    handler(async () => {
      await loadClientPlugins();
      setInitialized(true);
    })();
    // handler 是纯辅助函数，只做 try-catch 包装，不依赖外部状态
    // 初始化只需执行一次
  }, []); // 空依赖
  return { initialized };
};
