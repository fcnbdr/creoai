'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

const taskTypeTabs = [
  { key: '', label: '全部', icon: '📋' },
  { key: 'retouch', label: '精修列表', icon: '✨' },
  { key: 'detail_page', label: '详情页列表', icon: '📄' },
  { key: 'color_swap', label: '换色列表', icon: '🎨' },
  { key: 'text_replace', label: '文字替换列表', icon: '🔤' },
  { key: 'outpainting', label: '扩图列表', icon: '🖼️' },
  { key: 'style_transfer', label: '视觉迁移列表', icon: '🎭' },
  { key: 'koc', label: '种草列表', icon: '🌱' },
]

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '等待中' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' },
]

export default function ImageTasksPage() {
  const { getToken } = useAuth(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const bg = isDark ? '#0F172A' : '#F1F5F9'
  const cardBg = isDark ? '#1E293B' : '#FFFFFF'
  const border = isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0'
  const text = isDark ? '#E2E8F0' : '#1E293B'
  const subText = isDark ? '#94A3B8' : '#64748B'
  const inputBg = isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC'

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 8000)
    return () => clearInterval(interval)
  }, [activeTab, filterStatus])

  async function fetchTasks() {
    try {
      const token = getToken()
      const params = new URLSearchParams({ page_size: '50' })
      if (filterStatus) params.set('status', filterStatus)
      if (activeTab) params.set('task_type', activeTab)

      const res = await fetch(`http://localhost:8000/api/ecpro-images/tasks?${params}`, {
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
      await fetch(`http://localhost:8000/api/ecpro-images/tasks/${taskId}/retry`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      fetchTasks()
    } catch (err) { console.error(err) }
  }

  async function handleDelete(taskId: number) {
    if (!confirm('确定删除此任务？')) return
    try {
      const token = getToken()
      await fetch(`http://localhost:8000/api/ecpro-images/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      fetchTasks()
    } catch (err) { console.error(err) }
  }

  function toggleSelect(id: number) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === tasks.length) setSelected(new Set())
    else setSelected(new Set(tasks.map(t => t.id)))
  }

  const statusBadge = (s: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      pending: { bg: '#FEF3C7', color: '#D97706', label: '等待中' },
      processing: { bg: '#DBEAFE', color: '#2563EB', label: '处理中' },
      completed: { bg: '#D1FAE5', color: '#065F46', label: '已完成' },
      failed: { bg: '#FEE2E2', color: '#DC2626', label: '失败' },
    }
    const m = map[s] || { bg: '#F1F5F9', color: '#64748B', label: s }
    return <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: m.bg, color: m.color }}>{m.label}</span>
  }

  return (
    <div className="min-h-screen p-6 transition-colors duration-300" style={{ background: bg }}>
      <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h1 className="text-xl font-bold mb-6" style={{ color: text }}>📋 任务中心</h1>

        {/* Tab 切换 */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {taskTypeTabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.key
                  ? isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-700'
                  : isDark ? 'text-slate-400 hover:bg-slate-700/30' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* 搜索 + 筛选 */}
        <div className="flex gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 搜索任务ID、提示词..."
            className="flex-1 px-4 py-2 rounded-xl text-sm outline-none border"
            style={{ background: inputBg, borderColor: border, color: text }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm outline-none border"
            style={{ background: inputBg, borderColor: border, color: text }}>
            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={() => setSelected(new Set(tasks.filter(t => t.status === 'failed').map(t => t.id)))}
            className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
            style={{ color: subText, borderColor: border, background: inputBg }}>
            全选失败
          </button>
        </div>

        {/* 批量操作 */}
        {selected.size > 0 && (
          <div className="mb-4 px-4 py-2 rounded-xl flex items-center justify-between" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <span className="text-sm" style={{ color: '#7C3AED' }}>已选 {selected.size} 项</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-lg text-xs font-medium text-white" style={{ background: '#7C3AED' }}>批量下载 ZIP</button>
              <button onClick={() => setSelected(new Set())} className="px-3 py-1 rounded-lg text-xs font-medium" style={{ color: subText }}>取消选择</button>
            </div>
          </div>
        )}

        {/* 任务列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin w-8 h-8" style={{ color: '#7C3AED' }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-sm" style={{ color: subText }}>暂无任务，前往创作中心开始</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ color: subText }}>
                  <th className="pb-3 pl-2"><input type="checkbox" checked={selected.size === tasks.length} onChange={toggleAll} /></th>
                  <th className="pb-3">ID</th>
                  <th className="pb-3">类型</th>
                  <th className="pb-3">标题</th>
                  <th className="pb-3">状态</th>
                  <th className="pb-3">积分</th>
                  <th className="pb-3">创建时间</th>
                  <th className="pb-3 pr-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {tasks.filter(t => !search || t.title?.includes(search) || String(t.id).includes(search)).map(task => (
                  <tr key={task.id} className="border-t transition-colors" style={{ borderColor: border }}>
                    <td className="py-3 pl-2"><input type="checkbox" checked={selected.has(task.id)} onChange={() => toggleSelect(task.id)} /></td>
                    <td className="py-3 font-mono text-xs" style={{ color: subText }}>#{task.id}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-xs" style={{ background: inputBg, color: text }}>
                        {taskTypeTabs.find(t => t.key === task.task_type)?.label || task.task_type}
                      </span>
                    </td>
                    <td className="py-3 max-w-xs truncate" style={{ color: text }}>{task.title || '-'}</td>
                    <td className="py-3">{statusBadge(task.status)}</td>
                    <td className="py-3" style={{ color: subText }}>{task.points_cost || 0}</td>
                    <td className="py-3 text-xs" style={{ color: subText }}>{task.created_at ? new Date(task.created_at).toLocaleString('zh-CN') : '-'}</td>
                    <td className="py-3 pr-2">
                      <div className="flex gap-1.5">
                        {task.status === 'completed' && task.output_images?.length > 0 && (
                          <button className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors" style={{ color: '#2563EB', background: isDark ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.08)' }}>下载</button>
                        )}
                        {task.status === 'failed' && (
                          <button onClick={() => handleRetry(task.id)} className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors" style={{ color: '#D97706', background: isDark ? 'rgba(217,119,6,0.15)' : 'rgba(217,119,6,0.08)' }}>重试</button>
                        )}
                        <button onClick={() => handleDelete(task.id)} className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors" style={{ color: '#DC2626', background: isDark ? 'rgba(220,38,38,0.1)' : 'rgba(220,38,38,0.06)' }}>删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
