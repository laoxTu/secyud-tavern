// app/layout.tsx
import {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";
import {registerClientPlugins} from "@/components/plugins";
import "./globals.css"

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
        <html lang="en" >
        <body>
        <NextIntlClientProvider>
            {children}
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
