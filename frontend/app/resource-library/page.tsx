'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

export default function ResourceLibraryPage() {
  const { getToken } = useAuth(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [search, setSearch] = useState('')
  const [viewDetail, setViewDetail] = useState<any>(null)

  const bg = isDark ? '#0F172A' : '#F1F5F9'
  const cardBg = isDark ? '#1E293B' : '#FFFFFF'
  const border = isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0'
  const text = isDark ? '#E2E8F0' : '#1E293B'
  const subText = isDark ? '#94A3B8' : '#64748B'
  const inputBg = isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC'

  useEffect(() => { fetchResources() }, [filterType])

  async function fetchResources() {
    setLoading(true)
    try {
      const token = getToken()
      const params = new URLSearchParams({ page_size: '100' })
      if (filterType) params.set('res_type', filterType)
      const res = await fetch(`http://localhost:8000/api/account/resources?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        const data = await res.json()
        setResources(data.items || [])
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleDelete(id: number) {
    if (!confirm('确定删除此资源？')) return
    try {
      const token = getToken()
      await fetch(`http://localhost:8000/api/account/resources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      fetchResources()
    } catch (err) { console.error(err) }
  }

  const filtered = resources.filter(r => !search || r.title?.includes(search))

  return (
    <div className="min-h-screen p-6 transition-colors duration-300" style={{ background: bg }}>
      <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h1 className="text-xl font-bold mb-6" style={{ color: text }}>📁 资源库</h1>

        {/* 筛选栏 */}
        <div className="flex gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 搜索资源名称..."
            className="flex-1 px-4 py-2 rounded-xl text-sm outline-none border"
            style={{ background: inputBg, borderColor: border, color: text }} />
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm outline-none border"
            style={{ background: inputBg, borderColor: border, color: text }}>
            <option value="">全部类型</option>
            <option value="image">图片</option>
            <option value="video">视频</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin w-8 h-8" style={{ color: '#7C3AED' }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-sm" style={{ color: subText }}>资源库为空，生成内容后将自动添加</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {filtered.map(r => (
              <div key={r.id} className="rounded-xl overflow-hidden border group cursor-pointer transition-all hover:shadow-md"
                style={{ borderColor: border }} onClick={() => setViewDetail(r)}>
                <div className="aspect-square flex items-center justify-center" style={{ background: inputBg }}>
                  {r.res_type === 'video' ? (
                    <svg className="w-12 h-12" style={{ color: subText }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ) : (
                    <svg className="w-12 h-12" style={{ color: subText }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium truncate" style={{ color: text }}>{r.title || '未命名'}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: r.res_type === 'video' ? 'rgba(37,99,235,0.1)' : 'rgba(5,150,105,0.1)', color: r.res_type === 'video' ? '#2563EB' : '#059669' }}>
                      {r.res_type === 'video' ? '视频' : '图片'}
                    </span>
                    <span className="text-[10px]" style={{ color: subText }}>{r.created_at ? new Date(r.created_at).toLocaleDateString('zh-CN') : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {viewDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewDetail(null)}>
          <div className="rounded-2xl p-6 max-w-lg w-full mx-4" style={{ background: cardBg }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg" style={{ color: text }}>资源详情</h3>
              <button onClick={() => setViewDetail(null)} className="p-1 rounded-lg hover:bg-slate-100" style={{ color: subText }}>✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span style={{ color: subText }}>名称：</span><span style={{ color: text }}>{viewDetail.title || '-'}</span></div>
              <div><span style={{ color: subText }}>类型：</span><span style={{ color: text }}>{viewDetail.res_type}</span></div>
              <div><span style={{ color: subText }}>URL：</span><span className="text-xs break-all" style={{ color: subText }}>{viewDetail.url}</span></div>
              <div><span style={{ color: subText }}>来源任务：</span><span style={{ color: text }}>#{viewDetail.source_task_id}</span></div>
              <div><span style={{ color: subText }}>创建时间：</span><span style={{ color: text }}>{viewDetail.created_at ? new Date(viewDetail.created_at).toLocaleString('zh-CN') : '-'}</span></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7C3AED' }}>下载</button>
              <button onClick={() => { handleDelete(viewDetail.id); setViewDetail(null) }}
                className="px-4 py-2 rounded-xl text-sm font-medium" style={{ color: '#DC2626', background: 'rgba(220,38,38,0.06)' }}>删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
