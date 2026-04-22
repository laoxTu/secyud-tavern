
export const metadata = {
    title: "Secyud Tavern",
    description: "Secyud Tavern"
};

export default function RootLayout({children,}) {
    return (
        <html lang="en">
        <body>
        <div className="st-app">
            {children}
        </div>
        </body>
        </html>
    );
}
