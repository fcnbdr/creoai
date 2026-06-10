'use client'

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

const leftNavItems = [
  { key: 'retouch', label: '智能精修', icon: '✨' },
  { key: 'expand', label: '图片扩充', icon: '📐' },
  { key: 'detail-page', label: 'AI 详情页生成', icon: '📄' },
  { key: 'color-swap', label: '换色列表', icon: '🎨', vip: true },
  { key: 'text-replace', label: 'T 可视化文字替换', icon: '🔤' },
  { key: 'outpainting', label: '扩图列表', icon: '🖼️' },
  { key: 'style-transfer', label: '视觉迁移', icon: '🎭', vip: true },
  { key: 'style-transfer-list', label: '视觉迁移列表', icon: '📋', vip: true },
  { key: 'koc', label: 'KOC 种草', icon: '🌱', vip: true },
  { key: 'koc-list', label: '种草列表', icon: '📝', vip: true },
]

const ratioOptions = ['1:1', '3:4', '4:3', '9:16']
const modelOptions = ['极睿 GPT2', '极睿 NPro']
const resolutionOptions = ['2K 高清', '4K 超清']
const qualityOptions = ['中', '高']
const quantityOptions = [1, 2, 3, 4, 5, 6]
const scenePresets = ['白底主图', '模特上身', '背景替换', '质感增强', '海报改版']
const promptTemplates = [
  '电商白底图，干净背景，产品居中展示',
  '模特上身效果，自然光，真实场景',
  '高级质感，柔和光线，专业商业摄影',
  '社交媒体风格，年轻化，活力配色',
  '极简主义，纯色背景，突出产品细节',
]

export default function ImageEditingPage() {
  const { getToken } = useAuth(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeNav, setActiveNav] = useState('retouch')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('极睿 GPT2')
  const [selectedRatio, setSelectedRatio] = useState('1:1')
  const [selectedResolution, setSelectedResolution] = useState('2K 高清')
  const [selectedQuality, setSelectedQuality] = useState('高')
  const [quantity, setQuantity] = useState(2)
  const [productCategory, setProductCategory] = useState('')
  const [sellingPoints, setSellingPoints] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [usageScene, setUsageScene] = useState('')
  const [activeScene, setActiveScene] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const bg = isDark ? '#0F172A' : '#F1F5F9'
  const cardBg = isDark ? '#1E293B' : '#FFFFFF'
  const border = isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0'
  const text = isDark ? '#E2E8F0' : '#1E293B'
  const subText = isDark ? '#94A3B8' : '#64748B'
  const inputBg = isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC'

  const apiMap: Record<string, string> = {
    'retouch': '/api/ecpro-images/smart-retouch',
    'expand': '/api/ecpro-images/image-expand',
    'detail-page': '/api/ecpro-images/detail-page',
    'color-swap': '/api/ecpro-images/color-swap',
    'text-replace': '/api/ecpro-images/text-replace',
    'outpainting': '/api/ecpro-images/outpainting',
    'style-transfer': '/api/ecpro-images/style-transfer',
    'koc': '/api/ecpro-images/koc-content',
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const urls = Array.from(files).map(f => URL.createObjectURL(f))
    setUploadedImages(prev => [...prev, ...urls].slice(0, 10))
  }

  function removeImage(idx: number) {
    setUploadedImages(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleGenerate() {
    const apiUrl = apiMap[activeNav]
    if (!apiUrl) {
      setError('请先选择功能模块')
      return
    }
    setError('')
    setGenerating(true)
    setResult(null)

    try {
      const token = getToken()
      const res = await fetch(`http://localhost:8000${apiUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          task_type: activeNav,
          title: `${leftNavItems.find(i => i.key === activeNav)?.label || ''} - ${productCategory || '未分类'}`,
          input_images: uploadedImages.length > 0 ? uploadedImages : ['https://placehold.co/600x400/png'],
          prompt: prompt || scenePresets[0],
          params: {
            ratio: selectedRatio,
            model: selectedModel,
            resolution: selectedResolution,
            quality: selectedQuality,
            quantity: quantity,
            scene: activeScene,
            category: productCategory,
            selling_points: sellingPoints.split('\n').filter(Boolean),
          },
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.detail || '生成失败')
      }
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || '网络错误')
    } finally {
      setGenerating(false)
    }
  }

  const navSection = (
    <div className="w-48 shrink-0 pr-4 border-r" style={{ borderColor: border }}>
      <div className="text-xs font-semibold uppercase tracking-wider mb-3 px-2" style={{ color: subText }}>
        功能导航
      </div>
      <nav className="space-y-0.5">
        {leftNavItems.map(item => (
          <button
            key={item.key}
            onClick={() => { setActiveNav(item.key); setResult(null); setError('') }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left ${
              activeNav === item.key
                ? isDark ? 'bg-purple-500/15 text-purple-400 font-medium' : 'bg-purple-50 text-purple-700 font-medium'
                : isDark ? 'text-slate-400 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{item.icon}</span>
            <span className="flex-1 truncate">{item.label}</span>
            {item.vip && (
              <span className="px-1 py-0.5 rounded text-[10px] font-bold" style={{ background: '#F59E0B', color: '#fff' }}>VIP</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )

  const activeItem = leftNavItems.find(i => i.key === activeNav)

  return (
    <div className="min-h-screen p-6 transition-colors duration-300" style={{ background: bg }}>
      <div className="flex gap-6 h-full">
        {/* 左侧功能导航 */}
        <div className="rounded-2xl p-4 shrink-0" style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {navSection}
        </div>

        {/* 中间内容区 */}
        <div className="flex-1 rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">{activeItem?.icon}</span>
            <div>
              <h1 className="text-xl font-bold" style={{ color: text }}>{activeItem?.label}</h1>
              <p className="text-xs" style={{ color: subText }}>
                {activeNav === 'retouch' && '上传单张图片 + Prompt指令 → AI生成精修图'}
                {activeNav === 'expand' && '最多同时上传10张图片 → 批量扩充'}
                {activeNav === 'detail-page' && '根据商品信息生成适配16+电商平台的详情页'}
                {activeNav === 'color-swap' && '上传商品图 → 选择目标颜色 → AI换色'}
                {activeNav === 'text-replace' && '上传图片 → 框选文字区域 → 输入新文字 → AI替换'}
                {activeNav === 'outpainting' && '上传图片 → 选择扩图方向 → AI智能补全'}
                {activeNav === 'style-transfer' && '上传内容图+风格参考图 → AI风格迁移'}
                {activeNav === 'koc' && '输入商品信息 → AI生成种草图文'}
              </p>
            </div>
            {activeItem?.vip && (
              <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#FEF3C7', color: '#D97706' }}>VIP 专属</span>
            )}
          </div>

          {/* 图片上传区 */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block" style={{ color: text }}>上传图片（最多10张）</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {uploadedImages.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border" style={{ borderColor: border }}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">×</button>
                </div>
              ))}
              {uploadedImages.length < 10 && (
                <label className="w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-colors" style={{ borderColor: border }}>
                  <svg className="w-6 h-6 mb-1" style={{ color: subText }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-xs" style={{ color: subText }}>上传</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Prompt 输入 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: text }}>Prompt 指令</label>
              <button
                onClick={() => setPrompt(promptTemplates[Math.floor(Math.random() * promptTemplates.length)])}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{ color: '#7C3AED', background: isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.06)' }}
              >
                ✨ AI 优化
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="描述你想要的图片效果..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none transition-all focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              style={{ background: inputBg, borderColor: border, color: text }}
            />
            {/* 专业指令库 */}
            <div className="flex flex-wrap gap-2 mt-2">
              {promptTemplates.map((t, i) => (
                <button key={i} onClick={() => setPrompt(t)}
                  className="px-2.5 py-1 rounded-lg text-xs transition-all hover:bg-purple-50"
                  style={{ background: inputBg, color: subText, border: `1px solid ${border}` }}
                >
                  {t.slice(0, 20)}...
                </button>
              ))}
            </div>
          </div>

          {/* 生成按钮 */}
          <div className="mb-6">
            <button onClick={handleGenerate} disabled={generating}
              className="w-full py-3 rounded-full text-white font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
            >
              {generating ? (
                <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> 生成中...</>
              ) : `开始${activeItem?.label || '生成'}`}
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {/* 结果展示 */}
          {result && (
            <div className="rounded-2xl p-4 border" style={{ borderColor: border, background: inputBg }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#D1FAE5', color: '#065F46' }}>✅ 生成成功</span>
                <span className="text-xs" style={{ color: subText }}>消耗 {result.points_used} 积分 · 余额 {result.balance}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(result.output_images || []).map((url: string, i: number) => (
                  <div key={i} className="rounded-xl overflow-hidden border" style={{ borderColor: border }}>
                    <img src={url} alt="" className="w-full aspect-square object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧参数面板 */}
        <div className="w-64 shrink-0 rounded-2xl p-5 space-y-5" style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-bold" style={{ color: text }}>⚙️ 参数配置</h3>

          {/* 产品类目 */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>产品类目</label>
            <select value={productCategory} onChange={e => setProductCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs outline-none border"
              style={{ background: inputBg, borderColor: border, color: text }}>
              <option value="">选择类目</option>
              <option value="服装">服装</option>
              <option value="数码">数码</option>
              <option value="家居">家居</option>
              <option value="美妆">美妆</option>
              <option value="食品">食品</option>
            </select>
          </div>

          {/* 产品卖点 */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>产品卖点（每行一个）</label>
            <textarea value={sellingPoints} onChange={e => setSellingPoints(e.target.value)} rows={3}
              placeholder="优质面料&#10;全网最低价&#10;限时促销"
              className="w-full px-3 py-2 rounded-lg text-xs outline-none border resize-none"
              style={{ background: inputBg, borderColor: border, color: text }} />
          </div>

          {/* 目标人群 */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>目标人群</label>
            <input value={targetAudience} onChange={e => setTargetAudience(e.target.value)}
              placeholder="如 25-35岁女性"
              className="w-full px-3 py-2 rounded-lg text-xs outline-none border"
              style={{ background: inputBg, borderColor: border, color: text }} />
          </div>

          {/* 使用场景 */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>使用场景</label>
            <input value={usageScene} onChange={e => setUsageScene(e.target.value)}
              placeholder="如 通勤、会议、出游"
              className="w-full px-3 py-2 rounded-lg text-xs outline-none border"
              style={{ background: inputBg, borderColor: border, color: text }} />
          </div>

          {/* 生成比例 */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>生成比例</label>
            <div className="flex gap-1.5">
              {ratioOptions.map(r => (
                <button key={r} onClick={() => setSelectedRatio(r)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border"
                  style={{
                    background: selectedRatio === r ? 'rgba(124,58,237,0.1)' : inputBg,
                    borderColor: selectedRatio === r ? '#7C3AED' : border,
                    color: selectedRatio === r ? '#7C3AED' : subText,
                  }}>{r}</button>
              ))}
            </div>
          </div>

          {/* AI 模型 */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>AI 模型</label>
            <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs outline-none border"
              style={{ background: inputBg, borderColor: border, color: text }}>
              {modelOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* 分辨率 */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>分辨率</label>
            <select value={selectedResolution} onChange={e => setSelectedResolution(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs outline-none border"
              style={{ background: inputBg, borderColor: border, color: text }}>
              {resolutionOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* 质量 */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>质量</label>
            <select value={selectedQuality} onChange={e => setSelectedQuality(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs outline-none border"
              style={{ background: inputBg, borderColor: border, color: text }}>
              {qualityOptions.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>

          {/* 生成数量 */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>生成数量</label>
            <div className="flex gap-1.5">
              {quantityOptions.map(n => (
                <button key={n} onClick={() => setQuantity(n)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border"
                  style={{
                    background: quantity === n ? 'rgba(124,58,237,0.1)' : inputBg,
                    borderColor: quantity === n ? '#7C3AED' : border,
                    color: quantity === n ? '#7C3AED' : subText,
                  }}>{n}</button>
              ))}
            </div>
          </div>

          {/* 常用场景 */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: subText }}>常用场景</label>
            <div className="flex flex-wrap gap-1.5">
              {scenePresets.map(s => (
                <button key={s} onClick={() => setActiveScene(s)}
                  className="px-2.5 py-1 rounded-lg text-xs transition-all border"
                  style={{
                    background: activeScene === s ? 'rgba(124,58,237,0.1)' : inputBg,
                    borderColor: activeScene === s ? '#7C3AED' : border,
                    color: activeScene === s ? '#7C3AED' : subText,
                  }}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
