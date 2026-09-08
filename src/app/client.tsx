'use client';
import { ThemeProvider } from '@teispace/next-themes';
import React from 'react';

import { useClientPlugins } from '@/client-registerer';
import { Toaster, TooltipProvider } from '@/components';
import { Loading } from '@/global/client/loading';

export function Client({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialized = useClientPlugins();

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
