import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MSWProvider } from "./components/MSWProvider";
import { AntdProvider } from "./components/AntdProvider";
import { ThemeProvider } from "./components/hooks/useTheme";
import EnvInitializer from "./components/EnvInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NSPass Web",
  description: "NSPass Web Management Interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script dangerouslySetInnerHTML={{
          __html: `
            console.log('🚀 Layout加载完成，JavaScript执行正常');
            console.log('🔍 Environment Debug:');
            console.log('  NODE_ENV:', '${process.env.NODE_ENV}');
            console.log('  NEXT_PUBLIC_API_BASE_URL:', '${process.env.NEXT_PUBLIC_API_BASE_URL || 'undefined'}');
            console.log('  Build time:', '${new Date().toISOString()}');
          `
        }} />
        <ThemeProvider>
          <MSWProvider>
            <AntdProvider>
              <EnvInitializer />
              {children}
            </AntdProvider>
          </MSWProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
