'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

export default function RegisterPage() {
  const router = useRouter()
  const { login, loading: authLoading, error: authError } = useAuth(false)
  const { theme, toggleTheme, mounted } = useTheme()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [localError, setLocalError] = useState('')
  const [cardVisible, setCardVisible] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => { setCardVisible(true) }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  function handleSendSms() {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setLocalError('请输入正确的手机号')
      return
    }
    setLocalError('')
    setCountdown(60)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLocalError('')

    if (!/^1[3-9]\d{9}$/.test(phone)) { setLocalError('请输入正确的手机号'); return }
    if (password.length < 8) { setLocalError('密码至少8位'); return }
    if (password !== confirmPassword) { setLocalError('两次密码不一致'); return }
    if (!smsCode) { setLocalError('请输入短信验证码'); return }
    if (!agreed) { setLocalError('请阅读并同意用户协议'); return }

    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `${phone}@creoai.com`, password, phone }),
      })

      if (res.ok) {
        await login(phone, password)
      } else {
        const data = await res.json()
        setLocalError(data.detail || '注册失败')
      }
    } catch (err) {
      setLocalError('网络错误，请稍后重试')
    }
  }

  const errorMessage = authError || localError

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 relative transition-colors duration-300" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
      {mounted && (
        <button onClick={toggleTheme} className="absolute top-6 right-6 z-20 p-2 rounded-full transition-all hover:bg-slate-200 dark:hover:bg-slate-700" title={isDark ? '切换到浅色' : '切换到深色'}>
          {isDark ? (
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
          ) : (
            <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
          )}
        </button>
      )}

      <div className={`relative z-10 w-full max-w-[420px] rounded-3xl border transition-all duration-500 ease-out ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{
          background: isDark ? '#1E293B' : '#FFFFFF',
          borderColor: isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0',
          boxShadow: isDark ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}
      >
        <div className="px-8 pt-10 pb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <defs><linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#A855F7"/></linearGradient></defs>
                <rect width="32" height="32" rx="8" fill="url(#logoGrad2)"/><path d="M10 22V10l8 6-8 6z" fill="white"/>
              </svg>
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>CreoAI</span>
            </div>
            <p className="text-sm" style={{ color: '#64748B' }}>创建您的账号</p>
          </div>

          {errorMessage && (
            <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* 手机号 */}
            <div className="relative group">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors group-focus-within:text-[#7C3AED]" style={{ color: '#94A3B8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="手机号" maxLength={11}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                style={{ background: isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC', borderColor: isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0', color: isDark ? '#E2E8F0' : '#1E293B' }}
              />
            </div>

            {/* 密码 */}
            <div className="relative group">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors group-focus-within:text-[#7C3AED]" style={{ color: '#94A3B8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="密码（至少8位）"
                className="w-full pl-11 pr-12 py-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                style={{ background: isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC', borderColor: isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0', color: isDark ? '#E2E8F0' : '#1E293B' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: showPassword ? '#7C3AED' : '#94A3B8' }}>
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>

            {/* 确认密码 */}
            <div className="relative group">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors group-focus-within:text-[#7C3AED]" style={{ color: '#94A3B8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="确认密码"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                style={{ background: isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC', borderColor: isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0', color: isDark ? '#E2E8F0' : '#1E293B' }}
              />
            </div>

            {/* 验证码 */}
            <div className="relative group">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94A3B8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <input type="text" value={smsCode} onChange={e => setSmsCode(e.target.value)} placeholder="短信验证码" maxLength={6}
                className="w-full pl-11 pr-28 py-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                style={{ background: isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC', borderColor: isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0', color: isDark ? '#E2E8F0' : '#1E293B' }}
              />
              <button type="button" onClick={handleSendSms} disabled={countdown > 0}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                style={{ color: countdown > 0 ? '#94A3B8' : '#7C3AED', background: countdown > 0 ? 'transparent' : 'rgba(124,58,237,0.08)' }}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>

            {/* 用户协议 */}
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-4 h-4 mt-0.5 rounded accent-[#7C3AED]" />
              <span className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
                我已阅读并同意
                <a href="#" className="mx-0.5 font-medium hover:underline" style={{ color: '#7C3AED' }}>《用户协议》</a>
                和
                <a href="#" className="mx-0.5 font-medium hover:underline" style={{ color: '#7C3AED' }}>《隐私政策》</a>
              </span>
            </label>

            {/* 注册按钮 */}
            <button type="submit" disabled={authLoading}
              className="w-full py-3 rounded-full text-white font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
            >
              {authLoading ? (
                <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> 注册中...</>
              ) : '注 册'}
            </button>

            {/* 返回登录 */}
            <div className="text-center">
              <span className="text-xs" style={{ color: '#94A3B8' }}>已有账号？</span>
              <Link href="/login" className="text-xs font-medium ml-1 hover:underline" style={{ color: '#7C3AED' }}>立即登录</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
