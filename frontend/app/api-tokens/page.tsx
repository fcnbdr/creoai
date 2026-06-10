'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

export default function ApiTokensPage() {
  const { getToken } = useAuth(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTokenName, setNewTokenName] = useState('')
  const [createdToken, setCreatedToken] = useState<any>(null)

  const bg = isDark ? '#0F172A' : '#F1F5F9'
  const cardBg = isDark ? '#1E293B' : '#FFFFFF'
  const border = isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0'
  const text = isDark ? '#E2E8F0' : '#1E293B'
  const subText = isDark ? '#94A3B8' : '#64748B'
  const inputBg = isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC'

  useEffect(() => { fetchTokens() }, [])

  async function fetchTokens() {
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/video/tokens', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        const data = await res.json()
        setTokens(data.tokens || [])
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleCreate() {
    if (!newTokenName.trim()) return
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/video/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ token_name: newTokenName }),
      })
      if (res.ok) {
        const data = await res.json()
        setCreatedToken(data)
        setShowCreate(false)
        setNewTokenName('')
        fetchTokens()
      }
    } catch (err) { console.error(err) }
  }

  async function handleDelete(id: number) {
    if (!confirm('确定删除此令牌？')) return
    try {
      const token = getToken()
      await fetch(`http://localhost:8000/api/video/tokens/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      fetchTokens()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="min-h-screen p-6 transition-colors duration-300" style={{ background: bg }}>
      <div className="rounded-2xl p-6 space-y-6" style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: text }}>🔑 API 令牌管理</h1>
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
            + 新建令牌
          </button>
        </div>

        {/* 使用说明 */}
        <div className="rounded-xl p-5 border" style={{ borderColor: border, background: inputBg }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: text }}>📖 使用说明</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: subText }}>curl 示例</p>
              <pre className="p-3 rounded-lg text-xs overflow-x-auto" style={{ background: isDark ? '#0F172A' : '#1E293B', color: '#E2E8F0' }}>
{`curl -X POST http://localhost:8000/api/video/generate \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"description": "一件时尚连衣裙展示视频"}'`}
              </pre>
            </div>
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: subText }}>Python 示例</p>
              <pre className="p-3 rounded-lg text-xs overflow-x-auto" style={{ background: isDark ? '#0F172A' : '#1E293B', color: '#E2E8F0' }}>
{`import requests

headers = {
    "Authorization": "Bearer YOUR_API_TOKEN",
    "Content-Type": "application/json"
}
data = {"description": "一件时尚连衣裙展示视频"}
response = requests.post(
    "http://localhost:8000/api/video/generate",
    json=data,
    headers=headers
)
print(response.json())`}
              </pre>
            </div>
          </div>
        </div>

        {/* 令牌列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin w-8 h-8" style={{ color: '#7C3AED' }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">🔑</p>
            <p className="text-sm" style={{ color: subText }}>暂无 API 令牌，点击上方按钮创建</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ color: subText }}>
                  <th className="pb-3">名称</th>
                  <th className="pb-3">Token Key</th>
                  <th className="pb-3">创建时间</th>
                  <th className="pb-3">最后使用</th>
                  <th className="pb-3">过期时间</th>
                  <th className="pb-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map(t => (
                  <tr key={t.id} className="border-t" style={{ borderColor: border }}>
                    <td className="py-3 font-medium" style={{ color: text }}>{t.token_name}</td>
                    <td className="py-3">
                      <code className="px-2 py-0.5 rounded text-xs" style={{ background: inputBg, color: '#7C3AED' }}>
                        {t.token_key}
                      </code>
                      <button onClick={() => navigator.clipboard.writeText(t.token_key)}
                        className="ml-2 text-xs hover:underline" style={{ color: '#7C3AED' }}>复制</button>
                    </td>
                    <td className="py-3 text-xs" style={{ color: subText }}>{t.created_at ? new Date(t.created_at).toLocaleString('zh-CN') : '-'}</td>
                    <td className="py-3 text-xs" style={{ color: subText }}>{t.last_used_at ? new Date(t.last_used_at).toLocaleString('zh-CN') : '从未使用'}</td>
                    <td className="py-3 text-xs" style={{ color: subText }}>{t.expires_at ? new Date(t.expires_at).toLocaleString('zh-CN') : '-'}</td>
                    <td className="py-3">
                      <button onClick={() => handleDelete(t.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{ color: '#DC2626', background: 'rgba(220,38,38,0.06)' }}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 新建弹窗 + 创建成功提示 */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="rounded-2xl p-6 max-w-sm w-full mx-4" style={{ background: cardBg }} onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4" style={{ color: text }}>新建 API 令牌</h3>
            <input value={newTokenName} onChange={e => setNewTokenName(e.target.value)}
              placeholder="令牌名称"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border mb-4"
              style={{ background: inputBg, borderColor: border, color: text }} />
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ color: subText, borderColor: border, background: inputBg }}>取消</button>
              <button onClick={handleCreate}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>创建</button>
            </div>
          </div>
        </div>
      )}

      {createdToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setCreatedToken(null)}>
          <div className="rounded-2xl p-6 max-w-sm w-full mx-4" style={{ background: cardBg }} onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2" style={{ color: '#059669' }}>✅ 令牌已创建</h3>
            <p className="text-xs mb-3" style={{ color: '#DC2626' }}>⚠️ 请立即复制保存，此密钥仅显示一次</p>
            <pre className="p-3 rounded-lg text-xs mb-4 break-all" style={{ background: inputBg, color: '#7C3AED', border: `1px solid ${border}` }}>
              {createdToken.token_key}
            </pre>
            <button onClick={() => { navigator.clipboard.writeText(createdToken.token_key); setCreatedToken(null) }}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ background: '#7C3AED' }}>复制并关闭</button>
          </div>
        </div>
      )}
    </div>
  )
}
