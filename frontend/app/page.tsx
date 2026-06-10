'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    // 检查是否已登录
    const token = localStorage.getItem('access_token')
    
    if (token) {
      // 已登录，跳转到Dashboard
      router.push('/dashboard')
    } else {
      // 未登录，跳转到登录页
      router.push('/login')
    }
  }, [router])
  
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4 animate-pulse">
          <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>正在跳转...</p>
      </div>
    </main>
  )
}
