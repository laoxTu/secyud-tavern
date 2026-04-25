// app/layout.tsx
import {Metadata} from "next";
import {Geist} from "next/font/google";
import {cn} from "@/lib/utils";
import {NextIntlClientProvider} from "next-intl";
import {registerClientPlugins} from "@/components/plugins";
import "./globals.css"

const geist = Geist({subsets: ['latin'], variable: '--font-sans'});

export const metadata: Metadata = {
    title: "Secyud Tavern",
    description: "Secyud Tavern"
};

registerClientPlugins();

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={cn("font-sans", geist.variable)}>
        <body>
        <NextIntlClientProvider>
            {children}
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
