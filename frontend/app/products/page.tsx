'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { Card, Button, Input, Badge, LoadingSpinner, EmptyState, StatCard } from '../components/UIComponents'

type Product = {
  id: number
  name: string
  target_audience?: string
  selling_points?: string[]
  pain_points?: string[]
  usage_scenes?: string[]
  image_url?: string
  created_at: string
}

export default function ProductsPage() {
  const { getToken, logout } = useAuth(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [stats, setStats] = useState({ total: 0, withSellingPoints: 0, withPainPoints: 0 })

  useEffect(() => {
    fetchProducts()
    fetchStats()
  }, [page, search])

  async function fetchProducts() {
    setLoading(true)
    try {
      const token = getToken()
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      })
      if (search) params.set('search', search)
      
      const res = await fetch(`http://localhost:8000/api/products/?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/products/stats', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setStats(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/products/sync-from-ecpro?limit=50', {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        alert('✅ ECPro同步任务已启动，请稍后刷新查看结果')
        setTimeout(fetchProducts, 3000)
        setTimeout(fetchStats, 3000)
      }
    } catch (error) {
      console.error('Failed to sync:', error)
      alert('❌ 同步失败，请检查网络连接')
    } finally {
      setSyncing(false)
    }
  }

  async function handleExport() {
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/products/export/csv', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `products_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        alert('✅ 导出成功')
      }
    } catch (error) {
      console.error('Failed to export:', error)
      alert('❌ 导出失败')
    }
  }

  const bgColor = isDark ? '#0F172A' : '#F1F5F9'
  const cardBg = isDark ? '#1E293B' : '#FFFFFF'
  const borderColor = isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0'
  const textColor = isDark ? '#E2E8F0' : '#1E293B'
  const subColor = isDark ? '#94A3B8' : '#64748B'

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ background: bgColor }}>
      <div className="container-custom py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="page-title">🛍️ 商品库</h1>
              <p className="page-subtitle">管理ECPro商品数据，支持同步、搜索、导出</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSync} disabled={syncing} loading={syncing}>
                🔄 从ECPro同步
              </Button>
              <Button variant="secondary" onClick={handleExport}>
                📥 导出CSV
              </Button>
              <Link href="/recommendations">
                <Button variant="secondary">💡 选题推荐</Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 搜索商品名称..."
              icon={
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="商品总数"
            value={stats.total || products.length}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            color="cyan"
          />
          <StatCard
            title="含卖点商品"
            value={stats.withSellingPoints || 0}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
          <StatCard
            title="含痛点商品"
            value={stats.withPainPoints || 0}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            color="purple"
          />
        </div>

        {/* Products List */}
        <Card>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="暂无商品数据"
              description={'点击「从ECPro同步」按钮导入商品'}
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              }
              action={
                <Button onClick={handleSync} disabled={syncing}>
                  🔄 立即同步
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-slate-400">
                      <th className="pb-3 pl-4">ID</th>
                      <th className="pb-3">商品信息</th>
                      <th className="pb-3">目标人群</th>
                      <th className="pb-3">卖点</th>
                      <th className="pb-3">痛点</th>
                      <th className="pb-3">创建时间</th>
                      <th className="pb-3 pr-4">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 pl-4 text-slate-500 font-mono">{product.id}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-slate-700">
                                <span className="text-2xl">🛍️</span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-slate-100">{product.name}</div>
                              {product.usage_scenes && product.usage_scenes.length > 0 && (
                                <div className="text-xs text-slate-500 mt-1">
                                  {product.usage_scenes.slice(0, 2).join(' · ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-slate-300 max-w-xs truncate">
                          {product.target_audience || '-'}
                        </td>
                        <td className="py-4">
                          <Badge variant="success">
                            {product.selling_points?.length || 0} 个
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Badge variant="warning">
                            {product.pain_points?.length || 0} 个
                          </Badge>
                        </td>
                        <td className="py-4 text-slate-400 text-xs">
                          {new Date(product.created_at).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="py-4 pr-4">
                          <Link href={`/products/${product.id}`}>
                            <Button variant="secondary" className="px-3 py-1.5 text-xs">
                              查看详情
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-800/50">
                <div className="text-sm text-slate-400">
                  第 <span className="text-cyan-400 font-semibold">{page}</span> 页
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm"
                  >
                    ← 上一页
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setPage(p => p + 1)}
                    disabled={products.length < pageSize}
                    className="px-4 py-2 text-sm"
                  >
                    下一页 →
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </main>
  )
}
