'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useState } from 'react'

const menuItems = [
  {
    group: 'ECPro 图片处理',
    items: [
      { href: '/image-editing', label: '创作中心', icon: '🖼️' },
      { href: '/image-tasks', label: '任务中心', icon: '📋' },
      { href: '/resource-library', label: '资源库', icon: '📁' },
      { href: '/ai-models', label: 'AI 模特库', icon: '👤' },
    ]
  },
  {
    group: 'Video AI',
    items: [
      { href: '/video-generation', label: '视频生成', icon: '🎬' },
      { href: '/video-tasks', label: '视频任务', icon: '📺' },
    ]
  },
  {
    group: '数据分析',
    items: [
      { href: '/dashboard', label: '仪表盘', icon: '📊' },
      { href: '/products', label: '商品库', icon: '🛍️' },
      { href: '/recommendations', label: '选题推荐', icon: '💡' },
    ]
  },
  {
    group: '系统',
    items: [
      { href: '/account', label: '账户中心', icon: '⚡' },
      { href: '/api-tokens', label: 'API 令牌', icon: '🔑' },
      { href: '/ai-config', label: 'AI 配置', icon: '⚙️' },
      { href: '/help', label: '使用帮助', icon: '📖' },
    ]
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth(false)
  const { theme, toggleTheme, mounted } = useTheme()
  const [collapsed, setCollapsed] = useState(false)

  const isDark = theme === 'dark'
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  const sidebarBg = isDark ? '#1E293B' : '#FFFFFF'
  const borderColor = isDark ? 'rgba(148,163,184,0.12)' : '#E2E8F0'
  const hoverBg = isDark ? 'rgba(148,163,184,0.08)' : '#F1F5F9'
  const activeBg = isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)'
  const activeColor = isDark ? '#A855F7' : '#7C3AED'
  const itemColor = isDark ? '#94A3B8' : '#64748B'
  const itemColorHover = isDark ? '#E2E8F0' : '#1E293B'
  const groupColor = '#94A3B8'

  const collapsedWidth = 72
  const expandedWidth = 248

  return (
    <aside
      className="h-screen sticky top-0 flex flex-col border-r transition-all duration-300 shrink-0 z-20"
      style={{
        width: collapsed ? `${collapsedWidth}px` : `${expandedWidth}px`,
        background: sidebarBg,
        borderColor,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-between transition-all duration-300 border-b"
        style={{
          height: '56px',
          paddingLeft: collapsed ? '16px' : '20px',
          paddingRight: collapsed ? '16px' : '16px',
          borderColor,
        }}
      >
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-base font-bold" style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}>
              CreoAI
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center shrink-0"
          style={{ background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = hoverBg }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <svg className="w-4 h-4" style={{ color: itemColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-3" style={{ paddingLeft: collapsed ? '8px' : '12px', paddingRight: collapsed ? '8px' : '12px' }}>
        {menuItems.map((group, gi) => (
          <div key={gi} style={{ marginBottom: collapsed ? '12px' : '16px' }}>
            {/* 分组标签 - 折叠时隐藏 */}
            {!collapsed && (
              <div
                className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 select-none"
                style={{ color: groupColor, paddingLeft: '10px', paddingRight: '10px' }}
              >
                {group.group}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center rounded-lg text-[13px] font-medium transition-all duration-200 select-none"
                    style={{
                      height: '40px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      paddingLeft: collapsed ? '0' : '10px',
                      paddingRight: collapsed ? '0' : '10px',
                      gap: collapsed ? '0' : '10px',
                      color: active ? activeColor : itemColor,
                      background: active ? activeBg : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = hoverBg
                        e.currentTarget.style.color = itemColorHover
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = itemColor
                      }
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="text-base shrink-0 flex items-center justify-center" style={{ width: '20px', textAlign: 'center' }}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {active && (
                          <span
                            className="ml-auto rounded-full shrink-0"
                            style={{
                              width: '6px',
                              height: '6px',
                              background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                            }}
                          />
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div
        className="border-t flex flex-col gap-0.5"
        style={{
          borderColor,
          padding: collapsed ? '8px' : '12px',
        }}
      >
        {mounted && (
          <button
            onClick={toggleTheme}
            className="flex items-center rounded-lg text-[13px] font-medium transition-all duration-200"
            style={{
              height: '40px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              paddingLeft: collapsed ? '0' : '10px',
              paddingRight: collapsed ? '0' : '10px',
              gap: collapsed ? '0' : '10px',
              color: itemColor,
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = hoverBg
              e.currentTarget.style.color = itemColorHover
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = itemColor
            }}
            title={collapsed ? (isDark ? '切换浅色' : '切换深色') : undefined}
          >
            <span className="text-base shrink-0 flex items-center justify-center" style={{ width: '20px' }}>
              {isDark ? '☀️' : '🌙'}
            </span>
            {!collapsed && <span className="truncate">{isDark ? '浅色模式' : '深色模式'}</span>}
          </button>
        )}
        <button
          onClick={logout}
          className="flex items-center rounded-lg text-[13px] font-medium transition-all duration-200"
          style={{
            height: '40px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            paddingLeft: collapsed ? '0' : '10px',
            paddingRight: collapsed ? '0' : '10px',
            gap: collapsed ? '0' : '10px',
            color: isDark ? '#f87171' : '#ef4444',
            background: 'transparent',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
          }}
          title={collapsed ? '退出' : undefined}
        >
          <span className="text-base shrink-0 flex items-center justify-center" style={{ width: '20px' }}>🚪</span>
          {!collapsed && <span className="truncate">退出登录</span>}
        </button>
      </div>
    </aside>
  )
}
