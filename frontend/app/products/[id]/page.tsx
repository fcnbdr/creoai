'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Product = {
  id: number
  name: string
  target_audience?: string
  selling_points?: string[]
  pain_points?: string[]
  usage_scenes?: string[]
  forbidden_claims?: string[]
  tone_style?: string
  image_url?: string
  created_at: string
}

type Recommendation = {
  id: number
  title: string
  recommend_reason?: string
  score?: any
  difficulty?: number
  created_at: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [token, setToken] = useState('')

  useEffect(() => {
    fetchProductDetail()
    fetchRecommendations()
  }, [productId])

  async function fetchProductDetail() {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8000/api/products/${productId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setProduct(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchRecommendations() {
    try {
      const res = await fetch(`http://localhost:8000/api/recommendations/?product_id=${productId}&page_size=10`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setRecommendations(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    }
  }

  async function handleGenerateRecommendations() {
    setGenerating(true)
    try {
      const res = await fetch('http://localhost:8000/api/recommendations/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({
          product_id: parseInt(productId),
          count: 5
        }),
      })
      if (res.ok) {
        alert('选题推荐生成成功')
        fetchRecommendations()
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="text-slate-400">加载中...</div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="text-slate-400">商品不存在</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
          <div className="flex items-start gap-6">
            {product.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-32 h-32 rounded-2xl object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-semibold">{product.name}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                {product.target_audience && <span>目标人群: {product.target_audience}</span>}
                {product.tone_style && <span>风格: {product.tone_style}</span>}
                <span>创建时间: {new Date(product.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="API Token"
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleGenerateRecommendations}
              disabled={generating}
              className="rounded-2xl bg-purple-600 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-purple-500 disabled:opacity-50"
            >
              {generating ? '生成中...' : '生成选题推荐'}
            </button>
            <Link href="/products">
              <button className="rounded-2xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400">
                返回商品库
              </button>
            </Link>
          </div>
        </section>

        {/* Product Info Tabs */}
        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          {/* Left: Product Details */}
          <div className="space-y-6">
            {/* Selling Points */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">卖点</h2>
              {product.selling_points && product.selling_points.length > 0 ? (
                <ul className="space-y-2">
                  {product.selling_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-cyan-500">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">暂无卖点数据</p>
              )}
            </div>

            {/* Pain Points */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-400">痛点</h2>
              {product.pain_points && product.pain_points.length > 0 ? (
                <ul className="space-y-2">
                  {product.pain_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-red-500">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">暂无痛点数据</p>
              )}
            </div>

            {/* Usage Scenes */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold mb-4 text-green-400">使用场景</h2>
              {product.usage_scenes && product.usage_scenes.length > 0 ? (
                <ul className="space-y-2">
                  {product.usage_scenes.map((scene, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-green-500">•</span>
                      <span>{scene}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">暂无使用场景数据</p>
              )}
            </div>

            {/* Forbidden Claims */}
            {product.forbidden_claims && product.forbidden_claims.length > 0 && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="text-xl font-semibold mb-4 text-yellow-400">禁止宣称</h2>
                <ul className="space-y-2">
                  {product.forbidden_claims.map((claim, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-yellow-500">⚠</span>
                      <span>{claim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Recommendations */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">选题推荐</h2>
            
            {recommendations.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <p>暂无选题推荐</p>
                <button
                  onClick={handleGenerateRecommendations}
                  disabled={generating}
                  className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-purple-500 disabled:opacity-50"
                >
                  {generating ? '生成中...' : '立即生成'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                    <h3 className="font-medium text-slate-100 mb-2">{rec.title}</h3>
                    {rec.recommend_reason && (
                      <p className="text-xs text-slate-400 mb-2">{rec.recommend_reason}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      {rec.difficulty && (
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-400">
                          难度: {rec.difficulty}/10
                        </span>
                      )}
                      <span className="text-slate-500">
                        {new Date(rec.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                ))}
                
                <Link href="/recommendations">
                  <button className="w-full mt-4 rounded-xl border border-purple-500/50 px-4 py-2 text-sm text-purple-400 transition hover:bg-purple-500/10">
                    查看全部推荐 →
                  </button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
