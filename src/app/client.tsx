'use client';
import { ThemeProvider } from '@teispace/next-themes';
import React, { useEffect, useState } from 'react';

import { Toaster, TooltipProvider } from '@/components';
import { registerClientPlugin } from '@/generated/client-registerer';
import { Loading } from '@/global/client/loading';
import { useHandler } from '@/interceptors/client';

export function Client({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [initialized, setInitialized] = useState(false);
  const { handler } = useHandler();
  useEffect(() => {
    handler(async () => {
      await registerClientPlugin();
      setInitialized(true);
    })();
    // handler 是纯辅助函数，只做 try-catch 包装，不依赖外部状态
    // 初始化只需执行一次
  }, []); // 空依赖

  if (!initialized) return <Loading />;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
    >
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
export default Client;
