'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

export default function VideoGenerationPage() {
  const { getToken } = useAuth(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [points, setPoints] = useState(0)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [sellingPoints, setSellingPoints] = useState('')
  const [scenario, setScenario] = useState('')
  const [duration, setDuration] = useState(5)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [enhance, setEnhance] = useState(false)
  const [sceneEnhance, setSceneEnhance] = useState(false)
  const [prompts, setPrompts] = useState<Record<string, string[]>>({})
  const [generating, setGenerating] = useState(false)
  const [generatingPrompts, setGeneratingPrompts] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [checkResult, setCheckResult] = useState<any>(null)

  const bg = isDark ? '#0F172A' : '#F1F5F9'
  const cardBg = isDark ? '#1E293B' : '#FFFFFF'
  const border = isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0'
  const text = isDark ? '#E2E8F0' : '#1E293B'
  const subText = isDark ? '#94A3B8' : '#64748B'
  const inputBg = isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC'

  useEffect(() => {
    fetchPoints()
  }, [])

  async function fetchPoints() {
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/account/points', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        const data = await res.json()
        setPoints(data.balance)
      }
    } catch (err) { console.error(err) }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const urls = Array.from(files).map(f => URL.createObjectURL(f))
    setUploadedImages(prev => [...prev, ...urls].slice(0, 6))
  }

  async function handleGeneratePrompts() {
    if (!category.trim()) { setError('请输入商品类别'); return }
    setGeneratingPrompts(true)
    setError('')
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/video/prompts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ category, selling_points: sellingPoints, scenario }),
      })
      if (res.ok) {
        const data = await res.json()
        setPrompts(data.prompts || {})
      }
    } catch (err: any) {
      setError(err.message || '生成Prompt失败')
    } finally {
      setGeneratingPrompts(false)
    }
  }

  async function handleCheckSafe() {
    if (!description.trim()) return
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/video/check-safe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ description }),
      })
      if (res.ok) {
        const data = await res.json()
        setCheckResult(data)
      }
    } catch (err) { console.error(err) }
  }

  async function handleGenerate() {
    if (!description.trim()) { setError('请输入视频描述'); return }
    if (points < 15) { setError(`积分不足，需要15点，当前${points}点`); return }

    setError('')
    setGenerating(true)
    setResult(null)

    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ description, duration, style_prompt: enhance ? 'enhanced' : undefined }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.detail || '生成失败')
      }
      const data = await res.json()
      setResult(data)
      fetchPoints()
    } catch (err: any) {
      setError(err.message || '网络错误')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen p-6 transition-colors duration-300" style={{ background: bg }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 积分卡片 */}
        <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <p className="text-xs" style={{ color: subText }}>剩余积分</p>
              <p className="text-2xl font-bold" style={{ color: '#7C3AED' }}>{points}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: subText }}>每次生成消耗</p>
            <p className="text-lg font-semibold" style={{ color: text }}>15 积分</p>
          </div>
        </div>

        {/* 限制提示 */}
        <div className="rounded-2xl p-4 border" style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.2)' }}>
          <div className="flex items-start gap-2">
            <span className="text-lg shrink-0">⚠️</span>
            <div className="text-xs space-y-1" style={{ color: '#DC2626' }}>
              <p>• 不能生成真人面孔</p>
              <p>• 不能生成版权角色</p>
              <p>• 不能指定受版权保护的音乐</p>
              <p>• 仅支持 18+ 成人内容及以下</p>
              <p>• 图生视频不支持人脸输入图像</p>
            </div>
          </div>
        </div>

        {/* 主要内容区 */}
        <div className="rounded-2xl p-6 space-y-6" style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h1 className="text-xl font-bold" style={{ color: text }}>🎬 AI 视频生成</h1>

          {/* 商品信息输入 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>商品类别</label>
              <input value={category} onChange={e => setCategory(e.target.value)} placeholder="如 服装、数码"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border"
                style={{ background: inputBg, borderColor: border, color: text }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>商品卖点（每行一个）</label>
              <textarea value={sellingPoints} onChange={e => setSellingPoints(e.target.value)} rows={2}
                placeholder="优质面料&#10;全网最低价"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border resize-none"
                style={{ background: inputBg, borderColor: border, color: text }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>使用场景（可选）</label>
              <input value={scenario} onChange={e => setScenario(e.target.value)} placeholder="如 通勤、出游"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border"
                style={{ background: inputBg, borderColor: border, color: text }} />
            </div>
          </div>

          {/* AI 生成Prompt */}
          <div>
            <button onClick={handleGeneratePrompts} disabled={generatingPrompts}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
              {generatingPrompts ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> 生成中...</>
              ) : '🤖 AI 生成 Prompt 指令 (6种风格 x 21条)'}
            </button>
            {Object.keys(prompts).length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(prompts).map(([style, lines]) => (
                  <div key={style} className="rounded-xl p-3 border" style={{ borderColor: border, background: inputBg }}>
                    <h4 className="text-xs font-bold mb-2" style={{ color: '#7C3AED' }}>{style}</h4>
                    {lines.map((line, i) => (
                      <p key={i} className="text-xs mb-1 cursor-pointer hover:text-purple-500 transition-colors" style={{ color: subText }}
                        onClick={() => setDescription(line)}>
                        {line.slice(0, 50)}...
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 视频描述 */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>视频描述</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="详细描述你想要生成的视频内容...&#10;示例：展示一款时尚连衣裙的360度旋转效果，背景为纯白摄影棚，柔和灯光，产品细节突出"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              style={{ background: inputBg, borderColor: border, color: text }} />
          </div>

          {/* 图片上传区 */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>图片上传（图生视频，最多6张）</label>
            <div className="flex flex-wrap gap-3">
              {uploadedImages.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border" style={{ borderColor: border }}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setUploadedImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">×</button>
                </div>
              ))}
              {uploadedImages.length < 6 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-colors" style={{ borderColor: border }}>
                  <span className="text-lg" style={{ color: subText }}>+</span>
                  <span className="text-[10px]" style={{ color: subText }}>上传</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* 视频增强选项 */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={enhance} onChange={e => setEnhance(e.target.checked)}
                className="w-4 h-4 rounded accent-[#7C3AED]" />
              <span className="text-sm" style={{ color: text }}>超清增强</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={sceneEnhance} onChange={e => setSceneEnhance(e.target.checked)}
                className="w-4 h-4 rounded accent-[#7C3AED]" />
              <span className="text-sm" style={{ color: text }}>场景增强</span>
            </label>
          </div>

          {/* 安全检查 */}
          <div className="flex gap-3">
            <button onClick={handleGenerate} disabled={generating || !description.trim()}
              className="flex-1 py-3 rounded-full text-white font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
              {generating ? (
                <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> 生成中...</>
              ) : '🎬 生成视频 (消耗15积分)'}
            </button>
            <button onClick={handleCheckSafe}
              className="px-6 py-3 rounded-full text-sm font-medium border transition-all"
              style={{ color: subText, borderColor: border, background: inputBg }}>
              🔍 安全检查
            </button>
          </div>

          {checkResult && (
            <div className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${checkResult.safe ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {checkResult.safe ? '✅' : '❌'} {checkResult.message || '检查完成'}
            </div>
          )}

          {/* 错误 */}
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span>❌</span> {error}
            </div>
          )}

          {/* 结果 */}
          {result && result.status !== 'safety_failed' && (
            <div className="rounded-2xl p-5 border" style={{ borderColor: '#10B981', background: 'rgba(16,185,129,0.04)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#D1FAE5', color: '#065F46' }}>✅ 生成成功</span>
                <span className="text-xs" style={{ color: subText }}>消耗 {result.points_used} 积分</span>
              </div>
              <div className="aspect-video rounded-xl flex items-center justify-center" style={{ background: inputBg }}>
                <div className="text-center">
                  <span className="text-4xl">🎬</span>
                  <p className="text-sm mt-2" style={{ color: subText }}>视频已生成</p>
                  <p className="text-xs" style={{ color: '#7C3AED' }}>{result.generated_url}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
