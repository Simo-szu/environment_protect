import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "../globals.css";

export const metadata: Metadata = {
    title: "YouthLoop - 让绿色循环，用行动改变未来",
    description: "YouthLoop是一个以环保为主题的青年互动网站，通过游戏化的方式提高年轻人的环保意识，提供环保知识学习、活动参与和社区互动的综合平台。",
};

interface LocaleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
    children,
    params
}: LocaleLayoutProps) {
    // 解包 params Promise
    const { locale } = await params;

    return (
        <html lang={locale} suppressHydrationWarning>
            <body
                className="antialiased font-sans"
                suppressHydrationWarning={true}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange={false}
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}