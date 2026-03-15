import type { Metadata } from "next";
import { Geist } from "next/font/google";
const GeistSans = Geist({ subsets: ["latin"] });
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
    title: "Armin — Créateur de contenu IA",
    description:
        "Générez des idées, scripts et titres optimisés pour vos contenus.",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" suppressHydrationWarning>
        <body className={GeistSans.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <QueryProvider>{children}</QueryProvider>
            <Toaster position="bottom-right" richColors />
        </ThemeProvider>
        </body>
        </html>
    );
}