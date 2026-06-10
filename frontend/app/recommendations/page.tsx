'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { Card, Button, Input, Badge, LoadingSpinner, EmptyState, StatCard } from '../components/UIComponents'

type Recommendation = {
  id: number
  title: string
  recommend_reason?: string
  score?: any
  difficulty?: number
  product_id?: number
  category_id?: number
  source_video_id?: number
  created_at: string
}

export default function RecommendationsPage() {
  const { getToken, logout } = useAuth(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [batchGenerating, setBatchGenerating] = useState(false)
  const [filterProduct, setFilterProduct] = useState('')
  const [stats, setStats] = useState({ total: 0, highScore: 0, avgDifficulty: 0 })

  // 主题颜色
  const pageBg = isDark ? '#0F172A' : '#F8FAFC'
  const textColor = isDark ? '#F1F5F9' : '#1E293B'
  const subTextColor = isDark ? '#94A3B8' : '#64748B'
  const mutedColor = isDark ? '#64748B' : '#94A3B8'
  const borderColor = isDark ? 'rgba(148,163,184,0.12)' : '#E2E8F0'
  const cardHoverBg = isDark ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.04)'

  useEffect(() => {
    fetchRecommendations()
    fetchStats()
  }, [filterProduct])

  async function fetchRecommendations() {
    setLoading(true)
    try {
      const token = getToken()
      const params = new URLSearchParams({ page_size: '50' })
      if (filterProduct) params.set('product_id', filterProduct)
      
      const res = await fetch(`http://localhost:8000/api/recommendations/?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setRecommendations(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/recommendations/stats', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setStats(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  async function handleBatchGenerate() {
    setBatchGenerating(true)
    try {
      const token = getToken()
      // 获取所有商品ID
      const productsRes = await fetch('http://localhost:8000/api/products/?page_size=10', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (!productsRes.ok) throw new Error('Failed to fetch products')
      
      const products = await productsRes.json()
      const productIds = products.map((p: any) => p.id)
      
      if (productIds.length === 0) {
        alert('⚠️ 暂无商品，请先同步ECPro数据')
        return
      }
      
      // 批量生成
      const res = await fetch('http://localhost:8000/api/recommendations/batch-generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({
          product_ids: productIds,
          count_per_product: 3
        }),
      })
      
      if (res.ok) {
        alert('✅ 批量生成任务已启动，请稍后刷新查看结果')
        setTimeout(fetchRecommendations, 5000)
        setTimeout(fetchStats, 5000)
      }
    } catch (error) {
      console.error('Failed to batch generate:', error)
      alert('❌ 批量生成失败，请重试')
    } finally {
      setBatchGenerating(false)
    }
  }

  async function handleExport(recommendationId: number) {
    try {
      const token = getToken()
      const res = await fetch(`http://localhost:8000/api/recommendations/${recommendationId}/export`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        const data = await res.json()
        // 下载Markdown文件
        const blob = new Blob([data.content], { type: 'text/markdown' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `recommendation_${recommendationId}_${new Date().toISOString().split('T')[0]}.md`
        a.click()
        window.URL.revokeObjectURL(url)
        alert('✅ 导出成功')
      }
    } catch (error) {
      console.error('Failed to export:', error)
      alert('❌ 导出失败')
    }
  }

  async function handleDelete(recommendationId: number) {
    if (!confirm('⚠️ 确定删除此选题推荐？')) return
    
    try {
      const token = getToken()
      const res = await fetch(`http://localhost:8000/api/recommendations/${recommendationId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        alert('✅ 已删除')
        fetchRecommendations()
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('❌ 删除失败')
    }
  }

  function getDifficultyBadge(difficulty?: number): { variant: 'success' | 'warning' | 'error'; text: string } {
    if (!difficulty) return { variant: 'success', text: '未知' }
    if (difficulty <= 3) return { variant: 'success', text: `${difficulty}/10 简单` }
    if (difficulty <= 6) return { variant: 'warning', text: `${difficulty}/10 中等` }
    return { variant: 'error', text: `${difficulty}/10 困难` }
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ background: pageBg, color: textColor }}>
      <div className="container-custom py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="page-title">💡 选题推荐</h1>
              <p className="page-subtitle">AI生成的短视频选题建议，关联商品与视频</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleBatchGenerate} disabled={batchGenerating} loading={batchGenerating}>
                🤖 批量生成推荐
              </Button>
              <Link href="/products">
                <Button variant="secondary">🛍️ 返回商品库</Button>
              </Link>
            </div>
          </div>

          {/* Filter */}
          <div className="mt-6">
            <Input
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              placeholder="🔍 按商品ID筛选（留空显示全部）..."
              icon={
                <svg className="w-5 h-5" style={{ color: mutedColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              }
            />
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="推荐总数"
            value={stats.total || recommendations.length}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            color="purple"
          />
          <StatCard
            title="高分推荐"
            value={stats.highScore || 0}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
            color="cyan"
          />
          <StatCard
            title="平均难度"
            value={`${stats.avgDifficulty || 0}/10`}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            color="blue"
          />
        </div>

        {/* Recommendations Grid */}
        <Card>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : recommendations.length === 0 ? (
            <EmptyState
              title="暂无选题推荐"
              description='点击"批量生成推荐"按钮生成AI选题'
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              action={
                <Button onClick={handleBatchGenerate} disabled={batchGenerating}>
                  🤖 立即生成
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {recommendations.map((rec) => {
                const difficultyBadge = getDifficultyBadge(rec.difficulty)
                return (
                  <div key={rec.id} className="glass-card rounded-3xl p-6 hover-card border transition-all duration-300 group"
                    style={{ borderColor: borderColor }}
                  >
                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors" style={{ color: textColor }}>
                      {rec.title}
                    </h3>
                    
                    {/* Reason */}
                    {rec.recommend_reason && (
                      <p className="text-sm mb-4 line-clamp-3 leading-relaxed" style={{ color: subTextColor }}>
                        {rec.recommend_reason}
                      </p>
                    )}
                    
                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {rec.product_id && (
                        <Badge variant="info">
                          🛍️ 商品 #{rec.product_id}
                        </Badge>
                      )}
                      <Badge variant={difficultyBadge.variant}>
                        ⚡ {difficultyBadge.text}
                      </Badge>
                      {rec.category_id && (
                        <Badge variant="success">
                          📂 品类 #{rec.category_id}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Created Time */}
                    <div className="text-xs mb-4" style={{ color: mutedColor }}>
                      📅 {new Date(rec.created_at).toLocaleDateString('zh-CN')}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t" style={{ borderColor: borderColor }}>
                      <Button
                        variant="secondary"
                        onClick={() => handleExport(rec.id)}
                        className="flex-1 px-3 py-2 text-xs"
                      >
                        📥 导出MD
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(rec.id)}
                        className="px-3 py-2 text-xs"
                      >
                        🗑️ 删除
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}
