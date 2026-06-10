'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { useTheme } from '../hooks/useTheme'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // 登录/注册页不显示侧边栏
  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto transition-colors duration-300" style={{ background: isDark ? '#0F172A' : '#F1F5F9' }}>
        {children}
      </main>
    </div>
  )
}
