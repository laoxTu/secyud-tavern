// src/app/layout.tsx
import React from "react";
import {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";
import {Toaster} from "sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import "./globals.css"
import "./app.css"

export const metadata: Metadata = {
    title: "Secyud Tavern",
    description: "Secyud Tavern"
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html>
        <body>
        <NextIntlClientProvider>
            <TooltipProvider>
                {children}
            </TooltipProvider>
        </NextIntlClientProvider>
        <Toaster/>
        </body>
        </html>
    );
}
