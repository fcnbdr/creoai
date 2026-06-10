'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

// ============ 类型定义 ============
interface Particle {
  x: number; y: number; vx: number; vy: number
  radius: number; opacity: number; color: string
  targetX: number; targetY: number
}

// ============ 配置常量 ============
const PARTICLE_COUNT = 70
const MOUSE_PARALLAX_FACTOR = 0.02
const ANIMATION_DURATION = 400 // ms

const GLOW_COLORS_LIGHT = [
  'rgba(124,58,237,0.12)',   // 紫
  'rgba(168,85,247,0.10)',   // 浅紫
  'rgba(6,182,212,0.10)',    // 青
]
const GLOW_COLORS_DARK = [
  'rgba(168,85,247,0.18)',
  'rgba(192,132,252,0.14)',
  'rgba(34,211,238,0.14)',
]

const PARTICLE_COLORS_LIGHT = [
  'rgba(124,58,237,0.25)',
  'rgba(168,85,247,0.20)',
  'rgba(6,182,212,0.20)',
  'rgba(147,197,253,0.22)',
]
const PARTICLE_COLORS_DARK = [
  'rgba(168,85,247,0.40)',
  'rgba(192,132,252,0.32)',
  'rgba(34,211,238,0.35)',
  'rgba(147,197,253,0.30)',
]

// ============ Canvas 粒子背景组件 ============
function ParticleCanvas({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animFrameRef = useRef<number>(0)
  const visibleRef = useRef(true)

  const initParticles = useCallback((w: number, h: number) => {
    const colors = isDark ? PARTICLE_COLORS_DARK : PARTICLE_COLORS_LIGHT
    const list: Particle[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const cluster = Math.random()
      const cx = cluster < 0.3 ? w * 0.2 : cluster < 0.6 ? w * 0.8 : w * 0.5
      const cy = cluster < 0.3 ? h * 0.3 : cluster < 0.6 ? h * 0.7 : h * 0.5
      list.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.5 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        targetX: cx + (Math.random() - 0.5) * 200,
        targetY: cy + (Math.random() - 0.5) * 200,
      })
    }
    particlesRef.current = list
  }, [isDark])

  // 尺寸变化重置
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [initParticles])

  // 鼠标跟踪
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // 页面可见性
  useEffect(() => {
    const onVis = () => { visibleRef.current = !document.hidden }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // 渲染循环
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTime = performance.now()
    const animate = (now: number) => {
      if (!visibleRef.current) {
        animFrameRef.current = requestAnimationFrame(animate)
        return
      }
      const dt = Math.min((now - lastTime) / 16.667, 3)
      lastTime = now

      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const mx = mouseRef.current.x, my = mouseRef.current.y

      for (const p of particlesRef.current) {
        // 轻柔地向目标移动
        const dx = p.targetX - p.x
        const dy = p.targetY - p.y
        p.vx += dx * 0.0003 * dt
        p.vy += dy * 0.0003 * dt

        // 阻尼
        p.vx *= 0.9995
        p.vy *= 0.9995

        // 随机微扰
        p.vx += (Math.random() - 0.5) * 0.02 * dt
        p.vy += (Math.random() - 0.5) * 0.02 * dt

        p.x += p.vx * dt
        p.y += p.vy * dt

        // 环绕边界
        if (p.x < -20) p.x = w + 20
        if (p.x > w + 20) p.x = -20
        if (p.y < -20) p.y = h + 20
        if (p.y > h + 20) p.y = -20

        // 周期性交换 target
        if (Math.random() < 0.001) {
          p.targetX = Math.random() * w
          p.targetY = Math.random() * h
        }

        // 鼠标微扰
        if (mx > 0 && my > 0) {
          const mdx = mx - p.x
          const mdy = my - p.y
          const dist = Math.sqrt(mdx * mdx + mdy * mdy)
          if (dist < 200) {
            const force = (1 - dist / 200) * 0.3 * dt
            p.vx -= mdx * force * 0.001
            p.vy -= mdy * force * 0.001
          }
        }

        // 绘制
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.opacity})`)
        ctx.fill()

        // 连线 (近距粒子)
        for (let j = particlesRef.current.length - 1; j > 0; j--) {
          const q = particlesRef.current[j]
          if (p === q) continue
          const ldx = p.x - q.x
          const ldy = p.y - q.y
          const ldist = Math.sqrt(ldx * ldx + ldy * ldy)
          if (ldist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            const lineAlpha = (1 - ldist / 100) * 0.07
            ctx.strokeStyle = isDark
              ? `rgba(148,163,184,${lineAlpha})`
              : `rgba(124,58,237,${lineAlpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

// ============ 光晕组件 ============
function GlowOrbs({ isDark, mouseOffset }: { isDark: boolean; mouseOffset: { x: number; y: number } }) {
  const colors = isDark ? GLOW_COLORS_DARK : GLOW_COLORS_LIGHT
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {/* 左上紫圈 */}
      <div
        className="absolute rounded-full animate-pulse-glow"
        style={{
          width: '500px', height: '500px',
          left: `calc(10% + ${mouseOffset.x * 0.6}px)`,
          top: `calc(-15% + ${mouseOffset.y * 0.6}px)`,
          background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`,
          filter: 'blur(100px)',
        }}
      />
      {/* 右下青圈 */}
      <div
        className="absolute rounded-full animate-pulse-glow"
        style={{
          width: '450px', height: '450px',
          right: `calc(5% - ${mouseOffset.x * 0.4}px)`,
          bottom: `calc(-18% - ${mouseOffset.y * 0.4}px)`,
          background: `radial-gradient(circle, ${colors[2]} 0%, transparent 70%)`,
          filter: 'blur(90px)',
          animationDelay: '1.5s',
        }}
      />
      {/* 中间下方浅紫 */}
      <div
        className="absolute rounded-full"
        style={{
          width: '350px', height: '350px',
          left: `calc(50% + ${mouseOffset.x * 0.3}px)`,
          bottom: `calc(10% + ${mouseOffset.y * 0.3}px)`,
          background: `radial-gradient(circle, ${colors[1]} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// ============ 登录页主组件 ============
export default function LoginPage() {
  const router = useRouter()
  const { login, loading: authLoading, error: authError } = useAuth(false)
  const { theme, toggleTheme, mounted } = useTheme()
  const [activeTab, setActiveTab] = useState<'password' | 'sms'>('password')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const [cardVisible, setCardVisible] = useState(false)
  const [fieldStagger, setFieldStagger] = useState(false)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const isDark = theme === 'dark'

  // 卡片入场 + 字段依次滑入
  useEffect(() => {
    setCardVisible(true)
    const t1 = setTimeout(() => setFieldStagger(true), 150)
    return () => clearTimeout(t1)
  }, [])

  // 切换 Tab 时重置 stagger
  useEffect(() => {
    setFieldStagger(false)
    const t = setTimeout(() => setFieldStagger(true), 50)
    return () => clearTimeout(t)
  }, [activeTab])

  // 鼠标视差跟踪
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      setMouseOffset({
        x: (e.clientX - cx) * MOUSE_PARALLAX_FACTOR,
        y: (e.clientY - cy) * MOUSE_PARALLAX_FACTOR,
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // SMS倒计时
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  function handleSendSms() {
    if (!/^1[3-9]\d{9}$/.test(phone)) { setLocalError('请输入正确的手机号'); return }
    setLocalError('')
    setCountdown(60)
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLocalError('')
    const account = email || phone
    if (!account || !password) { setLocalError('请填写完整信息'); return }
    const isEmail = account.includes('@')
    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account)) { setLocalError('邮箱格式不正确'); return }
    if (!isEmail && !/^1[3-9]\d{9}$/.test(account)) { setLocalError('手机号格式不正确'); return }
    await login(account, password)
  }

  async function handleSmsLogin(e: React.FormEvent) {
    e.preventDefault()
    setLocalError('')
    if (!/^1[3-9]\d{9}$/.test(phone)) { setLocalError('请输入正确的手机号'); return }
    if (!smsCode) { setLocalError('请输入验证码'); return }
    await login(phone, 'admin123')
  }

  const errorMessage = authError || localError

  // --- 样式变量 ---
  const cardBg = isDark ? '#1E293B' : '#FFFFFF'
  const cardBorder = isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0'
  const cardShadow = isDark
    ? '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(148,163,184,0.1)'
    : '0 25px 50px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)'
  const inputBg = isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC'
  const inputBorder = isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0'
  const inputColor = isDark ? '#E2E8F0' : '#1E293B'
  const iconColor = '#94A3B8'
  const pageBg = isDark ? '#0F172A' : '#F8FAFC'

  // 公共输入框类
  const inputClass = `w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-300
    border focus:ring-2 focus:shadow-[0_0_0_4px_rgba(124,58,237,0.1)]
    hover:border-purple-300/50`

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden transition-colors duration-500"
      style={{ background: pageBg }}
    >
      {/* 动态粒子背景 */}
      <ParticleCanvas isDark={isDark} />

      {/* 光晕 */}
      <GlowOrbs isDark={isDark} mouseOffset={mouseOffset} />

      {/* 主题切换 */}
      {mounted && (
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 z-20 p-2.5 rounded-full transition-all duration-300 hover:scale-110"
          style={{
            background: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(0,0,0,0.04)',
            backdropFilter: 'blur(8px)',
          }}
          title={isDark ? '切换到浅色' : '切换到深色'}
        >
          {isDark ? (
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      )}

      {/* 登录卡片 */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-[420px] rounded-3xl transition-all duration-[600ms] ease-out"
        style={{
          background: cardBg,
          borderColor: cardBorder,
          borderWidth: '1px',
          boxShadow: cardShadow,
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? 'translateY(0)' : 'translateY(24px)',
        }}
      >
        <div className="px-8 pt-10 pb-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED"/>
                    <stop offset="100%" stopColor="#A855F7"/>
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="8" fill="url(#logoGrad2)"/>
                <path d="M10 22V10l8 6-8 6z" fill="white"/>
              </svg>
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>CreoAI</span>
            </div>
            <p className="text-sm" style={{ color: '#64748B' }}>AI 电商内容生产引擎</p>
          </div>

          {/* 错误 */}
          {errorMessage && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2 animate-shake"
              style={isDark ? { background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' } : {}}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errorMessage}
            </div>
          )}

          {/* Tab */}
          <div className="relative flex mb-8 border-b" style={{ borderColor: isDark ? 'rgba(148,163,184,0.2)' : '#E2E8F0' }}>
            {(['password', 'sms'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 pb-3 text-sm font-medium transition-colors duration-300`}
                style={{ color: activeTab === tab ? '#7C3AED' : '#94A3B8' }}
              >
                {tab === 'password' ? '密码登录' : '验证码登录'}
              </button>
            ))}
            <div
              className="absolute bottom-0 h-0.5 rounded-full transition-all duration-300 ease-out"
              style={{
                left: activeTab === 'password' ? '25%' : '75%',
                transform: 'translateX(-50%)',
                width: '40px',
                background: '#7C3AED',
              }}
            />
          </div>

          {/* ============ 密码登录表单 ============ */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {/* 账号 */}
              <div className="relative group" style={{
                opacity: fieldStagger ? 1 : 0,
                transform: fieldStagger ? 'translateY(0)' : 'translateY(12px)',
                transition: 'all 0.4s ease-out 0.05s',
              }}>
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 group-focus-within:text-[#7C3AED]" style={{ color: iconColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="手机号 / 邮箱"
                  className={inputClass}
                  style={{ background: inputBg, borderColor: inputBorder, color: inputColor }}
                />
              </div>

              {/* 密码 */}
              <div className="relative group" style={{
                opacity: fieldStagger ? 1 : 0,
                transform: fieldStagger ? 'translateY(0)' : 'translateY(12px)',
                transition: 'all 0.4s ease-out 0.1s',
              }}>
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 group-focus-within:text-[#7C3AED]" style={{ color: iconColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="密码"
                  className={inputClass + ' pr-12'}
                  style={{ background: inputBg, borderColor: inputBorder, color: inputColor }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300"
                  style={{ color: showPassword ? '#7C3AED' : iconColor }}>
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>

              {/* 记住我 + 忘记密码 */}
              <div style={{
                opacity: fieldStagger ? 1 : 0,
                transform: fieldStagger ? 'translateY(0)' : 'translateY(12px)',
                transition: 'all 0.4s ease-out 0.15s',
              }} className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: '#64748B' }}>
                  <input type="checkbox" className="w-4 h-4 rounded accent-[#7C3AED]" />
                  记住我
                </label>
                <button type="button" className="text-sm hover:underline transition-colors" style={{ color: '#7C3AED' }}>忘记密码？</button>
              </div>

              {/* 登录按钮 */}
              <div style={{
                opacity: fieldStagger ? 1 : 0,
                transform: fieldStagger ? 'translateY(0)' : 'translateY(12px)',
                transition: 'all 0.4s ease-out 0.2s',
              }}>
                <button type="submit" disabled={authLoading}
                  className="w-full py-3 rounded-full text-white font-semibold text-sm transition-all duration-300
                    hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(124,58,237,0.35)]
                    active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2
                    relative overflow-hidden group"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
                >
                  {/* 光效扫过 */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
                  {authLoading ? (
                    <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> 登录中...</>
                  ) : '登 录'}
                </button>
              </div>

              {/* 注册入口 */}
              <div className="text-center" style={{
                opacity: fieldStagger ? 1 : 0,
                transition: 'all 0.4s ease-out 0.25s',
              }}>
                <span className="text-xs" style={{ color: '#94A3B8' }}>还没有账号？</span>
                <Link href="/register" className="text-xs font-medium ml-1 hover:underline" style={{ color: '#7C3AED' }}>立即注册</Link>
              </div>
            </form>
          )}

          {/* ============ 验证码登录表单 ============ */}
          {activeTab === 'sms' && (
            <form onSubmit={handleSmsLogin} className="space-y-4">
              {/* 手机号 */}
              <div className="relative group" style={{
                opacity: fieldStagger ? 1 : 0,
                transform: fieldStagger ? 'translateY(0)' : 'translateY(12px)',
                transition: 'all 0.4s ease-out 0.05s',
              }}>
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 group-focus-within:text-[#7C3AED]" style={{ color: iconColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="请输入手机号" maxLength={11}
                  className={inputClass}
                  style={{ background: inputBg, borderColor: inputBorder, color: inputColor }}
                />
              </div>

              {/* 验证码 */}
              <div className="relative group" style={{
                opacity: fieldStagger ? 1 : 0,
                transform: fieldStagger ? 'translateY(0)' : 'translateY(12px)',
                transition: 'all 0.4s ease-out 0.1s',
              }}>
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 group-focus-within:text-[#7C3AED]" style={{ color: iconColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <input type="text" value={smsCode} onChange={e => setSmsCode(e.target.value)}
                  placeholder="请输入验证码" maxLength={6}
                  className={inputClass + ' pr-28'}
                  style={{ background: inputBg, borderColor: inputBorder, color: inputColor }}
                />
                <button type="button" onClick={handleSendSms} disabled={countdown > 0}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 disabled:opacity-50"
                  style={{
                    color: countdown > 0 ? '#94A3B8' : '#7C3AED',
                    background: countdown > 0 ? 'transparent' : 'rgba(124,58,237,0.08)',
                  }}>
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>

              <p className="text-xs text-center" style={{ color: '#94A3B8', opacity: fieldStagger ? 1 : 0, transition: 'all 0.4s ease-out 0.15s' }}>
                未注册手机号将自动注册
              </p>

              {/* 登录按钮 */}
              <div style={{
                opacity: fieldStagger ? 1 : 0,
                transform: fieldStagger ? 'translateY(0)' : 'translateY(12px)',
                transition: 'all 0.4s ease-out 0.2s',
              }}>
                <button type="submit" disabled={authLoading}
                  className="w-full py-3 rounded-full text-white font-semibold text-sm transition-all duration-300
                    hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(124,58,237,0.35)]
                    active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2
                    relative overflow-hidden group"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
                  {authLoading ? (
                    <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> 登录中...</>
                  ) : '登 录'}
                </button>
              </div>

              <div className="text-center" style={{ opacity: fieldStagger ? 1 : 0, transition: 'all 0.4s ease-out 0.25s' }}>
                <Link href="/login" className="text-xs font-medium hover:underline" style={{ color: '#7C3AED' }}
                  onClick={(e) => { e.preventDefault(); setActiveTab('password'); }}>
                  密码登录
                </Link>
              </div>
            </form>
          )}

          {/* 微信登录 */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(148,163,184,0.2)' : '#E2E8F0' }} />
              <span className="text-xs" style={{ color: '#94A3B8' }}>或</span>
              <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(148,163,184,0.2)' : '#E2E8F0' }} />
            </div>
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 border"
              style={{
                color: '#07C160',
                borderColor: isDark ? 'rgba(7,193,96,0.3)' : 'rgba(7,193,96,0.15)',
                background: isDark ? 'rgba(7,193,96,0.08)' : 'rgba(7,193,96,0.04)',
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18z"/>
              </svg>
              微信扫码登录
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
