// src/app/layout.tsx
import React from "react";
import {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";
import {Toaster} from "sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import "./globals.css"
import "./app.css"
import {ThemeProvider} from "@/components/theme-provider";

export const metadata: Metadata = {
    title: "Secyud Tavern",
    description: "Secyud Tavern",
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
        <html suppressHydrationWarning>
        <body>
        <ThemeProvider
            attribute="class"
            defaultTheme='system'
            enableSystem
            storageKey="settings-theme"
            disableTransitionOnChange>
            <NextIntlClientProvider>
                <TooltipProvider>
                    {children}
                </TooltipProvider>
            </NextIntlClientProvider>
            <Toaster/>
        </ThemeProvider>
        </body>
        </html>
    );
}
