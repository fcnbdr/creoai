'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

type AIModel = {
  id: number
  name: string
  thumbnail: string
  gender: string
  style: string
  is_default: boolean
  created_at: string
}

export default function AIModelsPage() {
  const { getToken } = useAuth(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [models, setModels] = useState<AIModel[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newModelName, setNewModelName] = useState('')
  const [newModelGender, setNewModelGender] = useState('female')

  const bg = isDark ? '#0F172A' : '#F1F5F9'
  const cardBg = isDark ? '#1E293B' : '#FFFFFF'
  const border = isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0'
  const text = isDark ? '#E2E8F0' : '#1E293B'
  const subText = isDark ? '#94A3B8' : '#64748B'
  const inputBg = isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC'

  // Mock data for AI models
  const mockModels: AIModel[] = [
    { id: 1, name: '时尚女性-A', thumbnail: '👩‍🦰', gender: 'female', style: '时尚', is_default: true, created_at: '2025-01-15' },
    { id: 2, name: '商务男性-B', thumbnail: '👨‍💼', gender: 'male', style: '商务', is_default: false, created_at: '2025-02-20' },
    { id: 3, name: '运动达人-C', thumbnail: '🏃‍♀️', gender: 'female', style: '运动', is_default: false, created_at: '2025-03-10' },
    { id: 4, name: '甜美少女-D', thumbnail: '👧', gender: 'female', style: '甜美', is_default: false, created_at: '2025-04-05' },
  ]

  useEffect(() => {
    // Mock loading
    setTimeout(() => {
      setModels(mockModels)
      setLoading(false)
    }, 500)
  }, [])

  async function handleCreate() {
    if (!newModelName.trim()) return
    const newModel: AIModel = {
      id: Date.now(),
      name: newModelName,
      thumbnail: newModelGender === 'female' ? '👩' : '👨',
      gender: newModelGender,
      style: '自定义',
      is_default: false,
      created_at: new Date().toISOString().split('T')[0],
    }
    setModels(prev => [...prev, newModel])
    setShowCreate(false)
    setNewModelName('')
  }

  function handleDelete(id: number) {
    if (!confirm('确定删除此模特？')) return
    setModels(prev => prev.filter(m => m.id !== id))
  }

  function handleSetDefault(id: number) {
    setModels(prev => prev.map(m => ({ ...m, is_default: m.id === id })))
  }

  return (
    <div className="min-h-screen p-6 transition-colors duration-300" style={{ background: bg }}>
      <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold" style={{ color: text }}>👤 AI 模特库</h1>
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
            + 新建模特
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin w-8 h-8" style={{ color: '#7C3AED' }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {models.map(model => (
              <div key={model.id} className="rounded-xl border p-4 transition-all hover:shadow-md relative"
                style={{ borderColor: model.is_default ? '#7C3AED' : border, background: cardBg }}>
                {model.is_default && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: '#7C3AED' }}>默认</span>
                )}
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl" style={{ background: inputBg }}>
                  {model.thumbnail}
                </div>
                <h3 className="text-sm font-medium text-center mb-1" style={{ color: text }}>{model.name}</h3>
                <div className="flex justify-center gap-2 mb-3">
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: inputBg, color: subText }}>{model.gender === 'female' ? '女性' : '男性'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: inputBg, color: subText }}>{model.style}</span>
                </div>
                <div className="flex gap-1.5">
                  {!model.is_default && (
                    <button onClick={() => handleSetDefault(model.id)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ color: '#7C3AED', background: 'rgba(124,58,237,0.08)' }}>设为默认</button>
                  )}
                  <button onClick={() => handleDelete(model.id)}
                    className="py-1.5 px-3 rounded-lg text-xs font-medium transition-colors"
                    style={{ color: '#DC2626', background: 'rgba(220,38,38,0.06)' }}>删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新建模特弹窗 */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="rounded-2xl p-6 max-w-sm w-full mx-4" style={{ background: cardBg }} onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4" style={{ color: text }}>新建 AI 模特</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>模特名称</label>
                <input value={newModelName} onChange={e => setNewModelName(e.target.value)}
                  placeholder="输入模特名称"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                  style={{ background: inputBg, borderColor: border, color: text }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>性别</label>
                <div className="flex gap-2">
                  {['female', 'male'].map(g => (
                    <button key={g} onClick={() => setNewModelGender(g)}
                      className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
                      style={{
                        background: newModelGender === g ? 'rgba(124,58,237,0.1)' : inputBg,
                        borderColor: newModelGender === g ? '#7C3AED' : border,
                        color: newModelGender === g ? '#7C3AED' : subText,
                      }}>{g === 'female' ? '女性' : '男性'}</button>
                  ))}
                </div>
              </div>
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
        </div>
      )}
    </div>
  )
}
