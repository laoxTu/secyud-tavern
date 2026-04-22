import {Metadata} from "next";

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
        <body>{children}</body>
        </html>
    );
}
