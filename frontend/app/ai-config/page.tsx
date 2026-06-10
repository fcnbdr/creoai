'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../hooks/useTheme'

type Provider = {
  id: number
  name: string
  base_url?: string
  api_key_encrypted?: string
  supports_text: boolean
  supports_vision: boolean
  supports_audio: boolean
  supports_image_to_video: boolean
  supports_detail_page: boolean
  priority: number
  created_at: string
  updated_at: string
}

type AIModel = {
  id: number
  provider_id: number
  task_type: string
  model_alias: string
  actual_model_name: string
  max_tokens?: number
  enabled: boolean
  created_at: string
  updated_at: string
}

type AIPrompt = {
  id: number
  name: string
  version: string
  task_type: string
  system_prompt?: string
  user_prompt_template?: string
  json_schema?: any
  enabled: boolean
  created_at: string
  updated_at: string
}

export default function AIConfigPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState<'providers' | 'models' | 'prompts' | 'test'>('providers')
  
  // Provider状态
  const [providers, setProviders] = useState<Provider[]>([])
  const [showCreateProvider, setShowCreateProvider] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  
  // Model状态
  const [models, setModels] = useState<AIModel[]>([])
  
  // Prompt状态
  const [prompts, setPrompts] = useState<AIPrompt[]>([])
  
  // 测试台状态
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null)
  const [testType, setTestType] = useState<'text' | 'json' | 'image' | 'audio'>('text')
  const [testPrompt, setTestPrompt] = useState('请生成一个电商详情页标题')
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Token
  const [token, setToken] = useState('')

  // --- 主题变量 ---
  const pageBg = isDark ? '#0F172A' : '#F8FAFC'
  const cardBg = isDark ? '#1E293B' : '#FFFFFF'
  const innerBg = isDark ? '#0F172A' : '#F8FAFC'
  const border = isDark ? 'rgba(148,163,184,0.12)' : '#E2E8F0'
  const text = isDark ? '#F1F5F9' : '#1E293B'
  const subText = isDark ? '#94A3B8' : '#64748B'
  const mutedText = isDark ? '#64748B' : '#94A3B8'
  const accentBg = isDark ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.08)'
  const accentText = '#06B6D4'
  const tabActiveBorder = isDark ? '#22D3EE' : '#06B6D4'
  const tabInactive = isDark ? '#64748B' : '#94A3B8'
  const inputBg = isDark ? '#0F172A' : '#F8FAFC'
  const inputBorder = isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0'

  useEffect(() => {
    fetchProviders()
    if (activeTab === 'models') fetchModels()
    if (activeTab === 'prompts') fetchPrompts()
  }, [activeTab])

  async function fetchProviders() {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8001/api/ai/providers', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        const data = await res.json()
        setProviders(data)
        if (data.length > 0 && !selectedProvider) {
          setSelectedProvider(data[0].id)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  async function fetchModels() {
    try {
      const res = await fetch('http://localhost:8001/api/ai/models', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setModels(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
    }
  }

  async function fetchPrompts() {
    try {
      const res = await fetch('http://localhost:8001/api/ai/prompts', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setPrompts(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
    }
  }

  async function handleCreateProvider(providerData: any) {
    try {
      const res = await fetch('http://localhost:8001/api/ai/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(providerData),
      })
      if (res.ok) {
        setShowCreateProvider(false)
        fetchProviders()
      }
    } catch (error) {
      console.error('Failed to create provider:', error)
    }
  }

  async function handleDeleteProvider(id: number) {
    if (!confirm('确定要删除这个供应商吗？')) return
    
    try {
      const res = await fetch(`http://localhost:8001/api/ai/providers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        fetchProviders()
      }
    } catch (error) {
      console.error('Failed to delete provider:', error)
    }
  }

  async function runTest() {
    if (!selectedProvider) {
      alert('请先选择一个供应商')
      return
    }

    setLoading(true)
    setTestResult('')
    
    try {
      let endpoint = ''
      let body: any = {}
      
      switch (testType) {
        case 'text':
          endpoint = `/api/ai/providers/${selectedProvider}/test/text`
          body = { prompt: testPrompt, task_type: 'test' }
          break
        case 'json':
          endpoint = `/api/ai/providers/${selectedProvider}/test/json`
          body = { 
            prompt: testPrompt, 
            task_type: 'test',
            json_schema: { type: 'object', properties: { result: { type: 'string' } } }
          }
          break
        case 'image':
          endpoint = `/api/ai/providers/${selectedProvider}/test/image`
          body = { 
            image_urls: ['https://via.placeholder.com/300'],
            prompt: testPrompt,
            task_type: 'vision_test'
          }
          break
        case 'audio':
          endpoint = `/api/ai/providers/${selectedProvider}/test/audio`
          body = { audio_url: 'https://example.com/test.mp3' }
          break
      }
      
      const res = await fetch(`http://localhost:8001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(body),
      })
      
      const data = await res.json()
      setTestResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setTestResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen transition-colors duration-300 p-8" style={{ background: pageBg, color: text }}>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="rounded-3xl border p-8 shadow-xl" style={{ borderColor: border, background: cardBg }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold" style={{ color: text }}>AI 配置中心</h1>
              <p className="mt-2" style={{ color: subText }}>管理AI供应商、模型映射、Prompt模板和测试能力</p>
            </div>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="API Token"
              className="rounded-2xl border px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
              style={{ background: inputBg, borderColor: inputBorder, color: text }}
            />
          </div>
          
          {/* Tabs */}
          <div className="mt-6 flex gap-2 border-b" style={{ borderColor: border }}>
            {[
              { key: 'providers', label: '供应商管理' },
              { key: 'models', label: '模型映射' },
              { key: 'prompts', label: 'Prompt管理' },
              { key: 'test', label: '测试台' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className="px-6 py-3 text-sm font-medium transition"
                style={{
                  borderBottom: activeTab === tab.key ? `2px solid ${tabActiveBorder}` : '2px solid transparent',
                  color: activeTab === tab.key ? accentText : tabInactive,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Tab Content */}
        {activeTab === 'providers' && (
          <section className="rounded-3xl border p-6" style={{ borderColor: border, background: cardBg }}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold" style={{ color: text }}>AI供应商列表</h2>
              <button
                onClick={() => setShowCreateProvider(true)}
                className="rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
              >
                + 新增供应商
              </button>
            </div>
            
            {loading ? (
              <div className="rounded-3xl border p-6 text-center" style={{ borderColor: border, background: innerBg, color: subText }}>加载中...</div>
            ) : providers.length === 0 ? (
              <div className="rounded-3xl border p-6 text-center" style={{ borderColor: border, background: innerBg, color: subText }}>
                暂无配置的 AI 供应商
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="rounded-3xl border p-5 transition hover:border-cyan-500/50"
                    style={{ borderColor: border, background: innerBg }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: text }}>{provider.name}</h3>
                        <p className="mt-1 text-xs" style={{ color: mutedText }}>优先级: {provider.priority}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="rounded-full px-3 py-1 text-xs transition"
                        style={{ background: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)', color: '#f87171' }}
                      >
                        删除
                      </button>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {provider.supports_text && (
                        <span className="rounded-full border px-2 py-1 text-xs" style={{ borderColor: border, color: subText }}>文本</span>
                      )}
                      {provider.supports_vision && (
                        <span className="rounded-full border px-2 py-1 text-xs" style={{ borderColor: border, color: subText }}>视觉</span>
                      )}
                      {provider.supports_audio && (
                        <span className="rounded-full border px-2 py-1 text-xs" style={{ borderColor: border, color: subText }}>音频</span>
                      )}
                      {provider.supports_image_to_video && (
                        <span className="rounded-full border px-2 py-1 text-xs" style={{ borderColor: border, color: subText }}>视频</span>
                      )}
                      {provider.supports_detail_page && (
                        <span className="rounded-full border px-2 py-1 text-xs" style={{ borderColor: border, color: subText }}>详情页</span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedProvider(provider.id)
                        setActiveTab('test')
                      }}
                      className="mt-4 w-full rounded-2xl border py-2 text-sm transition"
                      style={{
                        borderColor: border,
                        background: innerBg,
                        color: subText,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#06B6D4'
                        e.currentTarget.style.color = '#06B6D4'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = border
                        e.currentTarget.style.color = subText
                      }}
                    >
                      测试此供应商
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'models' && (
          <section className="rounded-3xl border p-6" style={{ borderColor: border, background: cardBg }}>
            <h2 className="mb-6 text-2xl font-semibold" style={{ color: text }}>模型映射</h2>
            <div className="rounded-3xl border p-6" style={{ borderColor: border, background: innerBg, color: subText }}>
              <p>模型映射功能开发中...</p>
              <pre className="mt-4 text-xs" style={{ color: subText }}>{JSON.stringify(models, null, 2)}</pre>
            </div>
          </section>
        )}

        {activeTab === 'prompts' && (
          <section className="rounded-3xl border p-6" style={{ borderColor: border, background: cardBg }}>
            <h2 className="mb-6 text-2xl font-semibold" style={{ color: text }}>Prompt管理</h2>
            <div className="rounded-3xl border p-6" style={{ borderColor: border, background: innerBg, color: subText }}>
              <p>Prompt管理功能开发中...</p>
              <pre className="mt-4 text-xs" style={{ color: subText }}>{JSON.stringify(prompts, null, 2)}</pre>
            </div>
          </section>
        )}

        {activeTab === 'test' && (
          <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            {/* Test Configuration */}
            <div className="rounded-3xl border p-6" style={{ borderColor: border, background: cardBg }}>
              <h2 className="text-2xl font-semibold" style={{ color: text }}>测试配置</h2>
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm" style={{ color: subText }}>选择供应商</label>
                  <select
                    value={selectedProvider || ''}
                    onChange={(e) => setSelectedProvider(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border px-4 py-3 focus:border-cyan-500 focus:outline-none transition-colors"
                    style={{ background: inputBg, borderColor: inputBorder, color: text }}
                  >
                    <option value="">请选择供应商</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm" style={{ color: subText }}>测试类型</label>
                  <div className="mt-2 flex gap-2">
                    {(['text', 'json', 'image', 'audio'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setTestType(type)}
                        className="rounded-xl px-4 py-2 text-sm font-medium transition"
                        style={{
                          background: testType === type ? '#06B6D4' : innerBg,
                          color: testType === type ? '#fff' : subText,
                          border: testType === type ? 'none' : `1px solid ${border}`,
                        }}
                      >
                        {type === 'text' && '文本'}
                        {type === 'json' && 'JSON'}
                        {type === 'image' && '图片'}
                        {type === 'audio' && '音频'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm" style={{ color: subText }}>提示词 / 参数</label>
                  <textarea
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border px-4 py-3 focus:border-cyan-500 focus:outline-none transition-colors"
                    style={{ background: inputBg, borderColor: inputBorder, color: text }}
                  />
                </div>
                
                <button
                  onClick={runTest}
                  disabled={loading || !selectedProvider}
                  className="w-full rounded-2xl px-6 py-3 text-sm font-semibold transition disabled:opacity-50"
                  style={{ background: '#06B6D4', color: '#fff' }}
                >
                  {loading ? '测试中...' : '运行测试'}
                </button>
              </div>
            </div>
            
            {/* Test Result */}
            <div className="rounded-3xl border p-6" style={{ borderColor: border, background: cardBg }}>
              <h2 className="text-2xl font-semibold" style={{ color: text }}>测试结果</h2>
              <div className="mt-6 rounded-3xl border p-4" style={{ borderColor: border, background: innerBg }}>
                <pre className="whitespace-pre-wrap text-sm" style={{ color: subText }}>
                  {testResult || '等待测试结果...'}
                </pre>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
