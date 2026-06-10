'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Card, Button, LoadingSpinner, EmptyState } from '../components/UIComponents'

type Product = {
  id: number
  name: string
  image_url?: string
}

type Template = {
  id: number
  name: string
  platform: string[]
  thumbnail?: string
}

export default function ContentProductionPage() {
  const { getToken } = useAuth(true)
  
  // ECPro状态
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['taobao'])
  const [ecproLoading, setEcproLoading] = useState(false)
  const [ecproResult, setEcproResult] = useState<any>(null)
  
  // iClip状态
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [selectedScript, setSelectedScript] = useState<string>('')
  const [videoDuration, setVideoDuration] = useState(15)
  const [iclipQuota, setIclipQuota] = useState({ total: 0, used: 0, remaining: 0 })
  const [iclipLoading, setIclipLoading] = useState(false)
  const [iclipResult, setIclipResult] = useState<any>(null)
  
  const platforms = [
    { value: 'taobao', label: '淘宝' },
    { value: 'tmall', label: '天猫' },
    { value: 'jd', label: '京东' },
    { value: 'pdd', label: '拼多多' },
    { value: 'douyin', label: '抖音' },
    { value: 'kuaishou', label: '快手' },
  ]

  useEffect(() => {
    fetchInitialData()
  }, [])

  async function fetchInitialData() {
    try {
      const token = getToken()
      
      // 获取商品列表
      const productsRes = await fetch('http://localhost:8000/api/products/?page_size=20', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (productsRes.ok) {
        setProducts(await productsRes.json())
      }
      
      // 获取模板列表
      const templatesRes = await fetch('http://localhost:8000/api/ecpro/templates', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (templatesRes.ok) {
        setTemplates(await templatesRes.json())
      }
      
      // 获取iClip积分余额
      const quotaRes = await fetch('http://localhost:8000/api/iclip/quota', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (quotaRes.ok) {
        setIclipQuota(await quotaRes.json())
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
    }
  }

  async function handleGenerateDetailPage() {
    if (!selectedProduct || !selectedTemplate) {
      alert('请选择商品和模板')
      return
    }
    
    setEcproLoading(true)
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/content-production/generate-detail-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          product_id: selectedProduct,
          template_id: selectedTemplate,
          platforms: selectedPlatforms,
        }),
      })
      
      if (res.ok) {
        setEcproResult(await res.json())
        alert('详情页生成成功!')
      } else {
        const error = await res.json()
        alert(`生成失败: ${error.detail || '未知错误'}`)
      }
    } catch (error) {
      console.error('Failed to generate detail page:', error)
      alert('网络错误,请稍后重试')
    } finally {
      setEcproLoading(false)
    }
  }

  async function handleGenerateVideo() {
    if (uploadedImages.length === 0) {
      alert('请至少上传一张图片')
      return
    }
    
    setIclipLoading(true)
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/content-production/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          images: uploadedImages,
          script: selectedScript || '自动生成脚本',
          duration: videoDuration,
        }),
      })
      
      if (res.ok) {
        const result = await res.json()
        setIclipResult(result)
        // 更新积分余额
        setIclipQuota(prev => ({
          ...prev,
          used: prev.used + (result.token_cost || 0),
          remaining: prev.remaining - (result.token_cost || 0),
        }))
        alert('视频生成成功!')
      } else {
        const error = await res.json()
        alert(`生成失败: ${error.detail || '未知错误'}`)
      }
    } catch (error) {
      console.error('Failed to generate video:', error)
      alert('网络错误,请稍后重试')
    } finally {
      setIclipLoading(false)
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    // 最多4张图片
    const newImages = Array.from(files).slice(0, 4 - uploadedImages.length)
    
    newImages.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImages(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  function togglePlatform(platform: string) {
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">✨ 内容生产中心</h1>
          <p className="page-subtitle">ECPro图文生产 + iClip视频创作一站式解决方案</p>
        </div>

        {/* 左右分屏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 左侧 - ECPro模块 */}
          <Card>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  📝 ECPro图文生产
                </h2>
                <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-500">
                  智能抠图 · 详情页生成 · 跨平台上架
                </span>
              </div>

              {/* 商品选择 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  选择商品
                </label>
                <select
                  value={selectedProduct || ''}
                  onChange={(e) => setSelectedProduct(Number(e.target.value))}
                  className="input-field w-full"
                >
                  <option value="">请选择商品</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 模板选择 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  选择模板
                </label>
                <select
                  value={selectedTemplate || ''}
                  onChange={(e) => setSelectedTemplate(Number(e.target.value))}
                  className="input-field w-full"
                >
                  <option value="">请选择模板</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.platform.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* 平台多选 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  目标平台(多选)
                </label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(platform => (
                    <button
                      key={platform.value}
                      onClick={() => togglePlatform(platform.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                        selectedPlatforms.includes(platform.value)
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-500'
                          : 'border-gray-300 hover:border-blue-500/30'
                      }`}
                      style={{ 
                        borderColor: selectedPlatforms.includes(platform.value) ? undefined : 'var(--border-color)',
                        color: selectedPlatforms.includes(platform.value) ? undefined : 'var(--text-secondary)'
                      }}
                    >
                      {platform.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 生成按钮 */}
              <Button
                onClick={handleGenerateDetailPage}
                disabled={!selectedProduct || !selectedTemplate || ecproLoading}
                loading={ecproLoading}
                className="w-full"
              >
                生成详情页
              </Button>

              {/* 结果展示 */}
              {ecproResult && (
                <div className="mt-4 p-4 rounded-lg border bg-green-500/5" style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                  <p className="text-sm text-green-600 mb-2">✅ 生成成功</p>
                  <pre className="text-xs overflow-auto max-h-40" style={{ color: 'var(--text-secondary)' }}>
                    {JSON.stringify(ecproResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Card>

          {/* 右侧 - iClip模块 */}
          <Card>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  🎬 iClip视频创作
                </h2>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>剩余积分</p>
                  <p className="text-lg font-bold text-purple-500">{iclipQuota.remaining}</p>
                </div>
              </div>

              {/* 图片上传 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  上传商品图(1-4张)
                </label>
                <div className="border-2 border-dashed rounded-xl p-6 text-center transition-all hover:border-blue-500/50" style={{ borderColor: 'var(--border-color)' }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadedImages.length >= 4}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    {uploadedImages.length === 0 ? (
                      <>
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>点击上传图片</p>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {uploadedImages.map((img, idx) => (
                          <img key={idx} src={img} alt={`Upload ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                        ))}
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* 脚本输入 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  视频脚本(可选)
                </label>
                <textarea
                  value={selectedScript}
                  onChange={(e) => setSelectedScript(e.target.value)}
                  placeholder="输入视频脚本,留空则自动生成..."
                  rows={3}
                  className="input-field w-full resize-none"
                />
              </div>

              {/* 时长选择 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  视频时长
                </label>
                <div className="flex gap-2">
                  {[15, 30].map(duration => (
                    <button
                      key={duration}
                      onClick={() => setVideoDuration(duration)}
                      className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                        videoDuration === duration
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-500'
                          : 'border-gray-300 hover:border-purple-500/30'
                      }`}
                      style={{ 
                        borderColor: videoDuration === duration ? undefined : 'var(--border-color)',
                        color: videoDuration === duration ? undefined : 'var(--text-secondary)'
                      }}
                    >
                      {duration}秒
                    </button>
                  ))}
                </div>
              </div>

              {/* 生成按钮 */}
              <Button
                onClick={handleGenerateVideo}
                disabled={uploadedImages.length === 0 || iclipLoading}
                loading={iclipLoading}
                variant="secondary"
                className="w-full"
              >
                生成视频
              </Button>

              {/* 结果展示 */}
              {iclipResult && (
                <div className="mt-4 p-4 rounded-lg border bg-purple-500/5" style={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}>
                  <p className="text-sm text-purple-600 mb-2">✅ 视频生成成功</p>
                  {iclipResult.video_url && (
                    <video controls className="w-full rounded-lg mt-2" src={iclipResult.video_url} />
                  )}
                  <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    消耗积分: {iclipResult.token_cost || 0}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 底部提示 */}
        <div className="mt-8 p-4 rounded-xl border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            💡 提示: 先使用ECPro生成商品详情页,再使用iClip基于商品图生成带货视频,实现图文+视频全链路内容生产
          </p>
        </div>
      </div>
    </main>
  )
}
