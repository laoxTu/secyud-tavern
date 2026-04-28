// app/layout.tsx
import {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";
import {Toaster} from "sonner";
import "./globals.css"
import "./app.css"
import "./initialize"

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
        <html lang="en" className="flex w-full h-full">
        <body className="flex w-full h-full">
        <NextIntlClientProvider>
            {children}
        </NextIntlClientProvider>
        <Toaster />
        </body>
        </html>
    );
}
