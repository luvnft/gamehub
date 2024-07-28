import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

import { ThemeProvider } from "@/components/themes-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Gamehub",
    description:
        "Live streaming platform focused on video games and related content, where users can watch and broadcast in real time, interact with other viewers and creators, and follow their favorite streamers.",
    icons: {
        icon: "/favicon.ico",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider appearance={{ baseTheme: dark }}>
            <html lang="en">
                <body className={inter.className}>
                    <ThemeProvider
                        attribute="class"
                        forcedTheme="dark"
                        storageKey="gamehub-theme"
                    >
                        <Toaster theme="light" position="bottom-center" />
                        {children}
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
