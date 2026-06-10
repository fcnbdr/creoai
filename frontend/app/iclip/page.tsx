'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { Card, Button, Badge, LoadingSpinner, EmptyState, StatCard, ProgressBar } from '../components/UIComponents'

type IClipJob = {
  id: number
  script_id?: number
  product_id?: number
  video_type: string
  status: string
  video_url?: string
  token_cost?: number
  created_at: string
}

export default function IClipPage() {
  const { getToken, logout } = useAuth(true)
  const [jobs, setJobs] = useState<IClipJob[]>([])
  const [loading, setLoading] = useState(false)
  const [batchGenerating, setBatchGenerating] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [stats, setStats] = useState({ total: 0, completed: 0, processing: 0 })

  useEffect(() => {
    fetchJobs()
    fetchStats()
    // 每5秒轮询一次更新状态
    const interval = setInterval(fetchJobs, 5000)
    return () => clearInterval(interval)
  }, [filterStatus])

  async function fetchJobs() {
    try {
      const token = getToken()
      const params = new URLSearchParams({ page_size: '50' })
      if (filterStatus) params.set('status', filterStatus)
      
      const res = await fetch(`http://localhost:8000/api/iclip/?${params}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setJobs(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    }
  }

  async function fetchStats() {
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/iclip/stats', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setStats(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  async function handleSubmitJob() {
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/iclip/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({
          product_id: 1,
          video_type: 'short'
        }),
      })
      if (res.ok) {
        alert('✅ 视频生成任务已提交')
        fetchJobs()
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to submit job:', error)
      alert('❌ 提交失败，请重试')
    }
  }

  async function handleBatchGenerate() {
    setBatchGenerating(true)
    try {
      const token = getToken()
      const replicationIds = [1, 2, 3]
      
      const res = await fetch('http://localhost:8000/api/iclip/batch-generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({
          replication_ids: replicationIds,
          video_type: 'short'
        }),
      })
      
      if (res.ok) {
        alert('✅ 批量生成任务已启动，请稍后刷新查看结果')
        setTimeout(fetchJobs, 3000)
        setTimeout(fetchStats, 3000)
      }
    } catch (error) {
      console.error('Failed to batch generate:', error)
      alert('❌ 批量生成失败，请重试')
    } finally {
      setBatchGenerating(false)
    }
  }

  async function handleDelete(jobId: number) {
    if (!confirm('⚠️ 确定删除此任务？')) return
    
    try {
      const token = getToken()
      const res = await fetch(`http://localhost:8000/api/iclip/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        alert('✅ 已删除')
        fetchJobs()
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('❌ 删除失败')
    }
  }

  function getStatusBadge(status: string): { variant: 'success' | 'warning' | 'error' | 'info'; text: string } {
    switch (status) {
      case 'pending': return { variant: 'warning', text: '等待中' }
      case 'processing': return { variant: 'info', text: '处理中' }
      case 'completed': return { variant: 'success', text: '已完成' }
      case 'failed': return { variant: 'error', text: '失败' }
      default: return { variant: 'info', text: status }
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container-custom py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="page-title">🎥 IClip视频复刻</h1>
              <p className="page-subtitle">AI自动生成短视频，支持批量处理和进度追踪</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSubmitJob}>
                ➕ 提交单个任务
              </Button>
              <Button onClick={handleBatchGenerate} disabled={batchGenerating} loading={batchGenerating} variant="secondary">
                🤖 批量生成
              </Button>
              <Link href="/products">
                <Button variant="secondary">🛍️ 返回商品库</Button>
              </Link>
            </div>
          </div>

          {/* Filter */}
          <div className="mt-6">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field cursor-pointer"
            >
              <option value="">全部状态</option>
              <option value="pending">等待中</option>
              <option value="processing">处理中</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
            </select>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="任务总数"
            value={stats.total || jobs.length}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
            color="cyan"
          />
          <StatCard
            title="已完成"
            value={stats.completed || 0}
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

        {/* Jobs Grid */}
        <Card>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              title="暂无视频生成任务"
              description='点击"提交单个任务"或"批量生成"按钮开始'
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
              action={
                <div className="flex gap-3">
                  <Button onClick={handleSubmitJob}>➕ 提交任务</Button>
                  <Button variant="secondary" onClick={handleBatchGenerate}>🤖 批量生成</Button>
                </div>
              }
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => {
                const statusBadge = getStatusBadge(job.status)
                return (
                  <div key={job.id} className="glass-card rounded-3xl p-6 border border-slate-800/50 hover-card transition-all duration-300 group">
                    {/* Job ID & Status */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-slate-500 font-mono">任务 #{job.id}</span>
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.text}
                      </Badge>
                    </div>
                    
                    {/* Video Type */}
                    <div className="mb-4">
                      <span className="text-sm text-slate-300">
                        📹 视频类型: {job.video_type === 'short' ? '15秒短片' : '30秒长片'}
                      </span>
                    </div>
                    
                    {/* Progress Bar for processing */}
                    {job.status === 'processing' && (
                      <div className="mb-4">
                        <ProgressBar progress={66} label="生成进度" />
                      </div>
                    )}
                    
                    {/* Completed: Show Video Preview */}
                    {job.status === 'completed' && job.video_url && (
                      <div className="mb-4">
                        <div className="aspect-video rounded-xl bg-slate-800 overflow-hidden border border-slate-700">
                          <video 
                            src={job.video_url}
                            controls
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {job.token_cost && (
                          <p className="text-xs text-slate-400 mt-2">
                            💰 Token消耗: {job.token_cost}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Meta Info */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      {job.product_id && (
                        <Badge variant="info">🛍️ 商品 #{job.product_id}</Badge>
                      )}
                      <span>📅 {new Date(job.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-slate-800/50">
                      {job.status === 'completed' && job.video_url && (
                        <a
                          href={job.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 btn-secondary px-3 py-2 text-xs text-center block"
                        >
                          📥 下载视频
                        </a>
                      )}
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(job.id)}
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
