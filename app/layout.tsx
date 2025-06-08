import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MSWProvider } from "./components/MSWProvider";
import { AntdProvider } from "./components/AntdProvider";

// 避免在导入时执行初始化
// 使用动态导入在适当时机初始化MSW
const initMSW = async () => {
  if (process.env.NODE_ENV === 'development') {
    const { initMockServiceWorker } = await import('./mocks');
    await initMockServiceWorker();
  }
};

// 只在服务器端执行初始化
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  initMSW();
}

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
        <MSWProvider>
          <AntdProvider>
            {children}
          </AntdProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
