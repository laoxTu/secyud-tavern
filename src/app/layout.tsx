import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import React from 'react';

import './app.css';
import './globals.css';

import { Geist, JetBrains_Mono } from 'next/font/google';

import { Client } from '@/app/client';
import { cn } from '@/lib/utils';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Secyud Tavern',
  description: 'Secyud Tavern',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      className={cn(geist.variable, 'font-mono', jetbrainsMono.variable)}
    >
      <body>
        <NextIntlClientProvider>
          <Client>{children}</Client>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
