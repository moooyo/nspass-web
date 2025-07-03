import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MSWProvider } from "./components/MSWProvider";
import { AntdProvider } from "./components/AntdProvider";
import { ThemeProvider } from "./components/hooks/useTheme";

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
          __html: `console.log('🚀 Layout加载完成，JavaScript执行正常');`
        }} />
        <ThemeProvider>
          <MSWProvider>
            <AntdProvider>
              {children}
            </AntdProvider>
          </MSWProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
