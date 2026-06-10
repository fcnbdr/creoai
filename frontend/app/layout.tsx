import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from './context/ThemeContext'
import AppLayout from './components/AppLayout'

export const metadata: Metadata = {
  title: 'CreoAI - 电商AI内容生产全能引擎',
  description: 'DeepSeek + ECPro + iClip 全融合版前端',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 防闪动脚本：在 HTML 解析前立即设置 data-theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
