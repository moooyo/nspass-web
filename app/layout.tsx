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
        {/* 直接注入环境变量 - 在构建时确定 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.__ENV__ = {
              NEXT_PUBLIC_API_BASE_URL: "${process.env.NEXT_PUBLIC_API_BASE_URL || ''}",
              NODE_ENV: "${process.env.NODE_ENV || 'production'}"
            };
            console.log('🌍 运行时环境变量已注入:', window.__ENV__);
          `
        }} />
        {/* Cloudflare Pages 环境变量注入脚本 */}
        <script src="/cf-pages-env.js"></script>
        {/* 运行时配置文件加载（备用） */}
        <script src="/runtime-config.js" defer></script>
        
        {/* 调试信息脚本 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            console.log('🚀 Layout加载完成，JavaScript执行正常');
            console.log('🔍 Build Environment Debug:');
            console.log('  NODE_ENV:', '${process.env.NODE_ENV}');
            console.log('  NEXT_PUBLIC_API_BASE_URL:', '${process.env.NEXT_PUBLIC_API_BASE_URL || 'undefined'}');
            console.log('  Build time:', '${new Date().toISOString()}');
            
            // 等待运行时配置加载完成后输出信息
            document.addEventListener('DOMContentLoaded', function() {
              if (window.__RUNTIME_CONFIG__) {
                console.log('✅ 运行时配置加载成功:', window.__RUNTIME_CONFIG__);
              } else {
                console.warn('⚠️ 运行时配置未找到，可能是构建时环境变量未设置');
              }
            });
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
