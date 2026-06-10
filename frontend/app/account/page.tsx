'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

export default function AccountPage() {
  const { getToken } = useAuth(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [profile, setProfile] = useState<any>(null)
  const [points, setPoints] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [rechargeAmount, setRechargeAmount] = useState(100)

  const bg = isDark ? '#0F172A' : '#F1F5F9'
  const cardBg = isDark ? '#1E293B' : '#FFFFFF'
  const borderColor = isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0'
  const text = isDark ? '#E2E8F0' : '#1E293B'
  const subText = isDark ? '#94A3B8' : '#64748B'
  const inputBg = isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC'

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const token = getToken()
      const headers = { Authorization: token ? `Bearer ${token}` : '' }

      const [profileRes, pointsRes, transRes] = await Promise.all([
        fetch('http://localhost:8000/api/account/profile', { headers }),
        fetch('http://localhost:8000/api/account/points', { headers }),
        fetch('http://localhost:8000/api/account/transactions?page_size=50', { headers }),
      ])

      if (profileRes.ok) setProfile(await profileRes.json())
      if (pointsRes.ok) setPoints(await pointsRes.json())
      if (transRes.ok) setTransactions((await transRes.json()).items || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleRecharge() {
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/account/points/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ amount: rechargeAmount }),
      })
      if (res.ok) {
        const data = await res.json()
        setPoints((prev: any) => ({ ...prev, balance: data.balance }))
        fetchData()
      }
    } catch (err) { console.error(err) }
  }

  const plans = [
    { name: '个人版', price: '¥99/月', features: ['500积分/月', '基础图片精修', '标准分辨率', '基础模板'], color: '#64748B' },
    { name: '专业版', price: '¥299/月', features: ['2000积分/月', '全部图片功能', '4K超清', '全部模板', '视频生成'], color: '#7C3AED', popular: true },
    { name: '企业版', price: '¥999/月', features: ['10000积分/月', '全部功能', 'API接入', '专属客服', '定制模板', '多人协作'], color: '#F59E0B' },
  ]

  const tabs = [
    { key: 'overview', label: '账户概览', icon: '📊' },
    { key: 'points', label: '积分管理', icon: '⚡' },
    { key: 'plans', label: '套餐对比', icon: '💎' },
    { key: 'referral', label: '邀请奖励', icon: '🎁' },
  ]

  return (
    <div className="min-h-screen p-6 transition-colors duration-300" style={{ background: bg }}>
      <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${borderColor}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h1 className="text-xl font-bold mb-6" style={{ color: text }}>⚡ 账户中心</h1>

        {/* Tab导航 */}
        <div className="flex gap-1 mb-6">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-700'
                  : isDark ? 'text-slate-400 hover:bg-slate-700/30' : 'text-slate-600 hover:bg-slate-100'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin w-8 h-8" style={{ color: '#7C3AED' }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 账户信息 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl p-5 border" style={{ borderColor, background: inputBg }}>
                    <p className="text-xs mb-1" style={{ color: subText }}>邮箱</p>
                    <p className="font-semibold" style={{ color: text }}>{profile?.email || '-'}</p>
                  </div>
                  <div className="rounded-xl p-5 border" style={{ borderColor, background: inputBg }}>
                    <p className="text-xs mb-1" style={{ color: subText }}>手机号</p>
                    <p className="font-semibold" style={{ color: text }}>{profile?.phone || '未绑定'}</p>
                  </div>
                  <div className="rounded-xl p-5 border" style={{ borderColor, background: inputBg }}>
                    <p className="text-xs mb-1" style={{ color: subText }}>角色</p>
                    <p className="font-semibold" style={{ color: text }}>{profile?.role === 'admin' ? '管理员' : '用户'}</p>
                  </div>
                </div>

                {/* 积分概览 + 资源统计 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#7C3AED' }}>{points?.balance || 0}</p>
                    <p className="text-xs" style={{ color: subText }}>积分余额</p>
                  </div>
                  <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.15)' }}>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#059669' }}>{profile?.image_count || 0}</p>
                    <p className="text-xs" style={{ color: subText }}>图片资源</p>
                  </div>
                  <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#2563EB' }}>{profile?.video_count || 0}</p>
                    <p className="text-xs" style={{ color: subText }}>视频资源</p>
                  </div>
                </div>

                {/* 最近流水 */}
                <div>
                  <h3 className="text-sm font-bold mb-3" style={{ color: text }}>最近积分流水</h3>
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor }}>
                    <table className="w-full text-sm">
                      <thead><tr className="text-left" style={{ color: subText, background: inputBg }}>
                        <th className="px-4 py-2.5">类型</th>
                        <th className="px-4 py-2.5">金额</th>
                        <th className="px-4 py-2.5">描述</th>
                        <th className="px-4 py-2.5">时间</th>
                      </tr></thead>
                      <tbody>
                        {transactions.slice(0, 5).map(t => (
                          <tr key={t.id} className="border-t" style={{ borderColor }}>
                            <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded text-xs" style={{
                              background: t.amount > 0 ? 'rgba(5,150,105,0.1)' : 'rgba(239,68,68,0.1)',
                              color: t.amount > 0 ? '#059669' : '#DC2626',
                            }}>{t.amount > 0 ? '收入' : '支出'}</span></td>
                            <td className="px-4 py-2.5 font-medium" style={{ color: t.amount > 0 ? '#059669' : '#DC2626' }}>
                              {t.amount > 0 ? '+' : ''}{t.amount}
                            </td>
                            <td className="px-4 py-2.5 text-xs" style={{ color: subText }}>{t.description}</td>
                            <td className="px-4 py-2.5 text-xs" style={{ color: subText }}>
                              {t.created_at ? new Date(t.created_at).toLocaleString('zh-CN') : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'points' && (
              <div className="space-y-6">
                <div className="rounded-xl p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(168,85,247,0.08))', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <p className="text-sm mb-1" style={{ color: subText }}>当前积分余额</p>
                  <p className="text-5xl font-bold mb-4" style={{ color: '#7C3AED' }}>{points?.balance || 0}</p>
                  <div className="flex items-center justify-center gap-4">
                    <div>
                      <p className="text-xs" style={{ color: subText }}>累计获得</p>
                      <p className="font-semibold" style={{ color: '#059669' }}>+{points?.total_earned || 0}</p>
                    </div>
                    <div className="w-px h-8" style={{ background: borderColor }} />
                    <div>
                      <p className="text-xs" style={{ color: subText }}>累计使用</p>
                      <p className="font-semibold" style={{ color: '#DC2626' }}>-{points?.total_spent || 0}</p>
                    </div>
                  </div>
                </div>

                {/* 充值 */}
                <div className="flex items-center gap-3 max-w-md">
                  <input type="number" value={rechargeAmount} onChange={e => setRechargeAmount(Number(e.target.value))} min={10}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border"
                    style={{ background: inputBg, borderColor, color: text }} />
                  <button onClick={handleRecharge}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
                    充值
                  </button>
                </div>

                {/* 全部流水 */}
                <div className="rounded-xl border overflow-hidden" style={{ borderColor }}>
                  <table className="w-full text-sm">
                    <thead><tr className="text-left" style={{ color: subText, background: inputBg }}>
                      <th className="px-4 py-2.5">类型</th><th className="px-4 py-2.5">金额</th>
                      <th className="px-4 py-2.5">描述</th><th className="px-4 py-2.5">时间</th>
                    </tr></thead>
                    <tbody>
                      {transactions.map(t => (
                        <tr key={t.id} className="border-t" style={{ borderColor }}>
                          <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded text-xs" style={{
                            background: t.amount > 0 ? 'rgba(5,150,105,0.1)' : 'rgba(239,68,68,0.1)',
                            color: t.amount > 0 ? '#059669' : '#DC2626',
                          }}>{t.amount > 0 ? '收入' : '支出'}</span></td>
                          <td className="px-4 py-2.5 font-medium" style={{ color: t.amount > 0 ? '#059669' : '#DC2626' }}>
                            {t.amount > 0 ? '+' : ''}{t.amount}
                          </td>
                          <td className="px-4 py-2.5 text-xs" style={{ color: subText }}>{t.description || '-'}</td>
                          <td className="px-4 py-2.5 text-xs" style={{ color: subText }}>
                            {t.created_at ? new Date(t.created_at).toLocaleString('zh-CN') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'plans' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <div key={plan.name} className={`rounded-2xl border p-6 relative ${plan.popular ? 'ring-2' : ''}`}
                    style={{ borderColor: plan.popular ? '#7C3AED' : borderColor, background: cardBg }}>
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                        style={{ background: '#7C3AED' }}>最受欢迎</span>
                    )}
                    <h3 className="text-lg font-bold mb-2" style={{ color: plan.color }}>{plan.name}</h3>
                    <p className="text-2xl font-bold mb-4" style={{ color: text }}>{plan.price}</p>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm" style={{ color: subText }}>
                          <span style={{ color: '#10B981' }}>✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <button className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                      plan.popular ? 'text-white' : ''
                    }`} style={{
                      background: plan.popular ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : inputBg,
                      color: plan.popular ? '#fff' : text,
                      border: plan.popular ? 'none' : `1px solid ${borderColor}`,
                    }}>{plan.popular ? '立即升级' : '了解详情'}</button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'referral' && (
              <div className="max-w-lg space-y-6">
                <div className="rounded-xl p-6 border" style={{ borderColor, background: inputBg }}>
                  <p className="text-sm font-medium mb-2" style={{ color: text }}>邀请好友，双方各得 200 积分</p>
                  <div className="flex gap-2 mb-3">
                    <input readOnly value="https://creoai.com/invite/ABC123"
                      className="flex-1 px-4 py-2 rounded-xl text-sm outline-none border bg-transparent"
                      style={{ borderColor, color: '#7C3AED' }} />
                    <button className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                      style={{ background: '#7C3AED' }}
                      onClick={() => navigator.clipboard.writeText('https://creoai.com/invite/ABC123')}>
                      复制
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: subText }}>每成功邀请一位好友注册并完成首次任务，双方各获得 200 积分奖励</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold mb-3" style={{ color: text }}>邀请记录</h3>
                  <div className="rounded-xl border p-8 text-center" style={{ borderColor }}>
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-sm" style={{ color: subText }}>暂无邀请记录</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
