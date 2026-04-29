// app/layout.tsx
import {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";
import {Toaster} from "sonner";
import "./globals.css"
import "./app.css"
import "./initialize"
import {TooltipProvider} from "@/components/ui/tooltip";

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
        <html lang="en">
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
