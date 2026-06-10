'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { Card, Button, Input, Select, Badge, LoadingSpinner, EmptyState, StatCard, Modal } from '../components/UIComponents'

type Video = {
  id: number
  title: string
  author?: string
  platform?: string
  category_id?: number
  status: string
  duration?: number
  cover_url?: string
  created_at: string
}

type Category = {
  id: number
  name: string
}

export default function VideosPage() {
  const { getToken, logout } = useAuth(true)
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  
  // 筛选状态
  const [platform, setPlatform] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  
  // 分页
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  
  // 上传模态框
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [stats, setStats] = useState({ total: 0, processed: 0, processing: 0 })

  useEffect(() => {
    fetchVideos()
    fetchCategories()
    fetchStats()
  }, [page, platform, categoryId, status])

  async function fetchVideos() {
    setLoading(true)
    try {
      const token = getToken()
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      })
      if (platform) params.append('platform', platform)
      if (categoryId) params.append('category_id', categoryId)
      if (status) params.append('status', status)
      if (search) params.append('search', search)
      
      const res = await fetch(`http://localhost:8001/api/videos/?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setVideos(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8001/api/categories', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setCategories(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  async function fetchStats() {
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8001/api/videos/stats', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setStats(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  async function handleSearch() {
    setPage(1)
    fetchVideos()
  }

  async function handleDelete(videoId: number) {
    if (!confirm('⚠️ 确定要删除这个视频吗？此操作不可恢复！')) return
    
    try {
      const token = getToken()
      const res = await fetch(`http://localhost:8001/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        alert('✅ 视频已删除')
        fetchVideos()
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to delete video:', error)
      alert('❌ 删除失败，请重试')
    }
  }

  async function handleProcess(videoId: number) {
    try {
      const token = getToken()
      const res = await fetch(`http://localhost:8001/api/videos/${videoId}/process`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        alert('✅ 视频处理已启动，请稍后刷新查看结果')
        setTimeout(fetchVideos, 2000)
      }
    } catch (error) {
      console.error('Failed to process video:', error)
      alert('❌ 处理失败，请重试')
    }
  }

  function getStatusBadge(status: string): { variant: 'success' | 'warning' | 'error' | 'info'; text: string } {
    switch (status) {
      case 'uploaded':
        return { variant: 'info', text: '已上传' }
      case 'processing':
        return { variant: 'warning', text: '处理中' }
      case 'processed':
        return { variant: 'success', text: '已完成' }
      case 'failed':
        return { variant: 'error', text: '失败' }
      default:
        return { variant: 'info', text: status }
    }
  }

  function getPlatformIcon(platform?: string): string {
    switch (platform) {
      case 'douyin': return '🎵'
      case 'kuaishou': return '📹'
      case 'bilibili': return '📺'
      case 'xiaohongshu': return '📕'
      default: return '🎬'
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container-custom py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="page-title">🎬 视频库</h1>
              <p className="page-subtitle">管理所有视频资源，支持上传、导入和分析</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowUploadModal(true)}>
                📤 上传视频
              </Button>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="视频总数"
            value={stats.total || videos.length}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
            color="cyan"
          />
          <StatCard
            title="已完成"
            value={stats.processed || 0}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
          <StatCard
            title="处理中"
            value={stats.processing || 0}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
            color="blue"
          />
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="平台"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              options={[
                { value: '', label: '全部平台' },
                { value: 'douyin', label: '🎵 抖音' },
                { value: 'kuaishou', label: '📹 快手' },
                { value: 'bilibili', label: '📺 B站' },
                { value: 'xiaohongshu', label: '📕 小红书' },
              ]}
            />
            
            <Select
              label="品类"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={[
                { value: '', label: '全部品类' },
                ...categories.map((cat) => ({ value: cat.id.toString(), label: cat.name })),
              ]}
            />
            
            <Select
              label="状态"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: '', label: '全部状态' },
                { value: 'uploaded', label: '已上传' },
                { value: 'processing', label: '处理中' },
                { value: 'processed', label: '已完成' },
                { value: 'failed', label: '失败' },
              ]}
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">搜索</label>
              <div className="flex gap-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="标题或作者..."
                  className="flex-1"
                />
                <Button onClick={handleSearch} className="px-4 py-3">
                  🔍
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Video List */}
        <Card>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : videos.length === 0 ? (
            <EmptyState
              title="暂无视频"
              description='点击"上传视频"按钮添加第一个视频'
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
              action={
                <Button onClick={() => setShowUploadModal(true)}>
                  📤 立即上传
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-sm text-slate-400">
                      <th className="pb-4 pl-4">封面</th>
                      <th className="pb-4">标题</th>
                      <th className="pb-4">作者</th>
                      <th className="pb-4">平台</th>
                      <th className="pb-4">状态</th>
                      <th className="pb-4">时长</th>
                      <th className="pb-4 pr-4">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {videos.map((video) => {
                      const statusBadge = getStatusBadge(video.status)
                      return (
                        <tr key={video.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 pl-4">
                            {video.cover_url ? (
                              <img
                                src={video.cover_url}
                                alt={video.title}
                                className="h-16 w-28 rounded-xl object-cover border border-slate-700"
                              />
                            ) : (
                              <div className="h-16 w-28 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-slate-700">
                                <span className="text-2xl">{getPlatformIcon(video.platform)}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4">
                            <Link
                              href={`/videos/${video.id}`}
                              className="font-medium text-slate-100 hover:text-cyan-400 transition-colors"
                            >
                              {video.title}
                            </Link>
                            <div className="text-xs text-slate-500 mt-1">
                              {new Date(video.created_at).toLocaleDateString('zh-CN')}
                            </div>
                          </td>
                          <td className="py-4 text-slate-300">{video.author || '-'}</td>
                          <td className="py-4 text-slate-300">
                            {video.platform ? (
                              <span className="flex items-center gap-1">
                                {getPlatformIcon(video.platform)} {video.platform}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="py-4">
                            <Badge variant={statusBadge.variant}>
                              {statusBadge.text}
                            </Badge>
                          </td>
                          <td className="py-4 text-slate-300">
                            {video.duration ? `${Math.round(video.duration)}s` : '-'}
                          </td>
                          <td className="py-4 pr-4">
                            <div className="flex gap-2">
                              {video.status === 'uploaded' && (
                                <Button
                                  variant="primary"
                                  onClick={() => handleProcess(video.id)}
                                  className="px-3 py-1.5 text-xs"
                                >
                                  ⚙️ 处理
                                </Button>
                              )}
                              <Link href={`/videos/${video.id}`}>
                                <Button variant="secondary" className="px-3 py-1.5 text-xs">
                                  👁️ 详情
                                </Button>
                              </Link>
                              <Button
                                variant="danger"
                                onClick={() => handleDelete(video.id)}
                                className="px-3 py-1.5 text-xs"
                              >
                                🗑️ 删除
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm"
                  >
                    ← 上一页
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setPage(page + 1)}
                    disabled={videos.length < pageSize}
                    className="px-4 py-2 text-sm"
                  >
                    下一页 →
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Upload Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="📤 上传视频"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
                取消
              </Button>
              <Button onClick={() => alert('上传功能开发中...')}>
                确认上传
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-slate-400">视频上传功能正在开发中...</p>
            <div className="rounded-xl border-2 border-dashed border-slate-700 p-8 text-center">
              <div className="text-4xl mb-2">📁</div>
              <p className="text-slate-400">拖拽文件到此处或点击选择</p>
              <p className="text-xs text-slate-500 mt-2">支持 MP4, MOV, AVI 格式，最大 200MB</p>
            </div>
          </div>
        </Modal>
      </div>
    </main>
  )
}
