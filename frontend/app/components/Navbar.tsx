'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

const navItems = [
  { href: '/dashboard', label: '仪表盘', icon: '📊' },
  { href: '/videos', label: '视频库', icon: '🎬' },
  { href: '/products', label: '商品库', icon: '🛍️' },
  { href: '/recommendations', label: '选题推荐', icon: '💡' },
  { href: '/content-production', label: '内容生产', icon: '✨' },
  { href: '/image-editing', label: '图片精修', icon: '🖼️' },
  { href: '/video-generation', label: '视频生成', icon: '🎥' },
  { href: '/resource-library', label: '资源库', icon: '📁' },
  { href: '/account', label: '账户', icon: '👤' },
  { href: '/ai-config', label: 'AI配置', icon: '⚙️' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { logout } = useAuth(false)
  const { theme, toggleTheme, mounted } = useTheme()
  
  // 登录页不显示导航
  if (pathname === '/login') {
    return null
  }
  
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              CreoAI
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                      : 'hover:bg-opacity-10 hover:bg-gray-500'
                  }`}
                  style={{ color: isActive ? undefined : 'var(--text-secondary)' }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
          
          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* 主题切换按钮 */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-all hover:bg-opacity-10 hover:bg-gray-500"
                title={theme === 'light' ? '切换到深色主题' : '切换到浅色主题'}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            )}
            
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-red-500/10 border"
              style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
