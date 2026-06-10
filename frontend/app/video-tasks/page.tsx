'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

export default function VideoTasksPage() {
  const { getToken } = useAuth(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState<'tasks' | 'micro' | 'live'>('tasks')

  // Micro video states
  const [productIds, setProductIds] = useState('')
  const [microResult, setMicroResult] = useState<any>(null)
  const [microLoading, setMicroLoading] = useState(false)

  // Live clip states
  const [liveUrl, setLiveUrl] = useState('')
  const [clipDuration, setClipDuration] = useState(15)
  const [clipCount, setClipCount] = useState(5)
  const [liveResult, setLiveResult] = useState<any>(null)
  const [liveLoading, setLiveLoading] = useState(false)

  const bg = isDark ? '#0F172A' : '#F1F5F9'
  const cardBg = isDark ? '#1E293B' : '#FFFFFF'
  const border = isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0'
  const text = isDark ? '#E2E8F0' : '#1E293B'
  const subText = isDark ? '#94A3B8' : '#64748B'
  const inputBg = isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC'

  useEffect(() => { fetchTasks() }, [filterStatus])

  async function fetchTasks() {
    setLoading(true)
    try {
      const token = getToken()
      const params = new URLSearchParams({ page_size: '50' })
      if (filterStatus) params.set('status', filterStatus)
      const res = await fetch(`http://localhost:8000/api/video/tasks?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(data.items || [])
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleRetry(taskId: number) {
    try {
      const token = getToken()
      await fetch(`http://localhost:8000/api/video/tasks/${taskId}/retry`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      fetchTasks()
    } catch (err) { console.error(err) }
  }

  async function handleMicroGenerate() {
    const ids = productIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    if (ids.length === 0) return
    setMicroLoading(true)
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/video/micro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ product_ids: ids }),
      })
      if (res.ok) setMicroResult(await res.json())
    } catch (err) { console.error(err) }
    finally { setMicroLoading(false) }
  }

  async function handleLiveGenerate() {
    if (!liveUrl.trim()) return
    setLiveLoading(true)
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/video/live-clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ live_url: liveUrl, duration: clipDuration, clip_count: clipCount }),
      })
      if (res.ok) setLiveResult(await res.json())
    } catch (err) { console.error(err) }
    finally { setLiveLoading(false) }
  }

  const statusBadge = (s: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      pending: { bg: '#FEF3C7', color: '#D97706', label: '等待中' },
      processing: { bg: '#DBEAFE', color: '#2563EB', label: '处理中' },
      completed: { bg: '#D1FAE5', color: '#065F46', label: '已完成' },
      failed: { bg: '#FEE2E2', color: '#DC2626', label: '失败' },
      safety_failed: { bg: '#FEE2E2', color: '#DC2626', label: '安全拦截' },
    }
    const m = map[s] || { bg: '#F1F5F9', color: '#64748B', label: s }
    return <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: m.bg, color: m.color }}>{m.label}</span>
  }

  return (
    <div className="min-h-screen p-6 transition-colors duration-300" style={{ background: bg }}>
      <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {/* 区段切换 */}
        <div className="flex gap-1 mb-6">
          {[
            { key: 'tasks', label: '视频任务列表', icon: '📋' },
            { key: 'micro', label: '微详情短视频', icon: '📱' },
            { key: 'live', label: '直播切片', icon: '🔴' },
          ].map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === s.key
                  ? isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-700'
                  : isDark ? 'text-slate-400 hover:bg-slate-700/30' : 'text-slate-600 hover:bg-slate-100'
              }`}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {activeSection === 'tasks' && (
          <>
            {/* 筛选 */}
            <div className="flex gap-3 mb-4">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 搜索..."
                className="flex-1 px-4 py-2 rounded-xl text-sm outline-none border"
                style={{ background: inputBg, borderColor: border, color: text }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-xl text-sm outline-none border"
                style={{ background: inputBg, borderColor: border, color: text }}>
                <option value="">全部状态</option>
                <option value="pending">等待中</option>
                <option value="processing">处理中</option>
                <option value="completed">已完成</option>
                <option value="failed">失败</option>
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <svg className="animate-spin w-8 h-8" style={{ color: '#7C3AED' }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left" style={{ color: subText }}>
                      <th className="pb-3">ID</th>
                      <th className="pb-3">描述</th>
                      <th className="pb-3">状态</th>
                      <th className="pb-3">时长</th>
                      <th className="pb-3">积分</th>
                      <th className="pb-3">创建时间</th>
                      <th className="pb-3">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.filter(t => !search || t.description?.includes(search)).map(task => (
                      <tr key={task.id} className="border-t" style={{ borderColor: border }}>
                        <td className="py-3 font-mono text-xs" style={{ color: subText }}>#{task.id}</td>
                        <td className="py-3 max-w-xs truncate" style={{ color: text }}>{task.description || '-'}</td>
                        <td className="py-3">{statusBadge(task.status)}</td>
                        <td className="py-3 text-xs" style={{ color: subText }}>{task.duration ? `${task.duration}s` : '-'}</td>
                        <td className="py-3" style={{ color: subText }}>{task.points_cost || 0}</td>
                        <td className="py-3 text-xs" style={{ color: subText }}>{task.created_at ? new Date(task.created_at).toLocaleString('zh-CN') : '-'}</td>
                        <td className="py-3">
                          <div className="flex gap-1.5">
                            {task.status === 'completed' && (
                              <button className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ color: '#2563EB', background: 'rgba(37,99,235,0.08)' }}>下载</button>
                            )}
                            {task.status === 'failed' && (
                              <button onClick={() => handleRetry(task.id)} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ color: '#D97706', background: 'rgba(217,119,6,0.08)' }}>重试</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {tasks.length === 0 && (
                      <tr><td colSpan={7} className="py-12 text-center" style={{ color: subText }}>暂无视频任务</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeSection === 'micro' && (
          <div className="max-w-lg">
            <h2 className="text-lg font-bold mb-4" style={{ color: text }}>📱 微详情短视频</h2>
            <p className="text-sm mb-4" style={{ color: subText }}>选择商品 → 系统自动抓取商品主图、详情图 → 批量生成短视频</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>商品ID（逗号分隔）</label>
                <input value={productIds} onChange={e => setProductIds(e.target.value)}
                  placeholder="1, 2, 3"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                  style={{ background: inputBg, borderColor: border, color: text }} />
              </div>
              <button onClick={handleMicroGenerate} disabled={microLoading}
                className="w-full py-3 rounded-full text-white font-semibold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
                {microLoading ? '生成中...' : '生成微详情视频 (每商品8积分)'}
              </button>
              {microResult && (
                <div className="rounded-xl p-4 border" style={{ borderColor: '#10B981', background: 'rgba(16,185,129,0.04)' }}>
                  <p className="text-sm font-medium" style={{ color: '#065F46' }}>✅ {microResult.message}</p>
                  <p className="text-xs mt-1" style={{ color: subText }}>消耗 {microResult.points_used} 积分 · 余额 {microResult.balance}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'live' && (
          <div className="max-w-lg">
            <h2 className="text-lg font-bold mb-4" style={{ color: text }}>🔴 直播切片</h2>
            <p className="text-sm mb-4" style={{ color: subText }}>输入直播回放视频链接 → 设置切片时长 → AI自动检测高光片段 → 批量生成切片短视频</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>直播回放链接</label>
                <input value={liveUrl} onChange={e => setLiveUrl(e.target.value)}
                  placeholder="https://live.example.com/replay/12345"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                  style={{ background: inputBg, borderColor: border, color: text }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>切片时长</label>
                  <div className="flex gap-2">
                    {[15, 30].map(d => (
                      <button key={d} onClick={() => setClipDuration(d)}
                        className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
                        style={{
                          background: clipDuration === d ? 'rgba(124,58,237,0.1)' : inputBg,
                          borderColor: clipDuration === d ? '#7C3AED' : border,
                          color: clipDuration === d ? '#7C3AED' : subText,
                        }}>{d}秒</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>切片数量</label>
                  <input type="number" value={clipCount} onChange={e => setClipCount(Number(e.target.value))} min={1} max={20}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                    style={{ background: inputBg, borderColor: border, color: text }} />
                </div>
              </div>
              <button onClick={handleLiveGenerate} disabled={liveLoading}
                className="w-full py-3 rounded-full text-white font-semibold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
                {liveLoading ? '切片生成中...' : '生成直播切片 (每切片5积分)'}
              </button>
              {liveResult && (
                <div className="rounded-xl p-4 border" style={{ borderColor: '#10B981', background: 'rgba(16,185,129,0.04)' }}>
                  <p className="text-sm font-medium" style={{ color: '#065F46' }}>✅ {liveResult.message}</p>
                  <p className="text-xs mt-1" style={{ color: subText }}>消耗 {liveResult.points_used} 积分 · 余额 {liveResult.balance}</p>
                  <div className="mt-2 space-y-1">
                    {(liveResult.clips || []).map((c: any, i: number) => (
                      <p key={i} className="text-xs" style={{ color: subText }}>切片#{i + 1}: {c.duration}s</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
