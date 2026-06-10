'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { Card, Button, Badge, LoadingSpinner, EmptyState, StatCard, Modal } from '../components/UIComponents'

type Replication = {
  id: number
  video_id: number
  product_id?: number
  script_15s?: any
  script_30s?: any
  shot_list?: any[]
  spoken_copy?: string
  shooting_notes?: string
  created_at: string
}

export default function ReplicationsPage() {
  const { getToken, logout } = useAuth(true)
  const [replications, setReplications] = useState<Replication[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState<number | null>(null)
  const [stats, setStats] = useState({ total: 0, withScripts: 0, avgShots: 0 })
  const [selectedReplication, setSelectedReplication] = useState<Replication | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchReplications()
    fetchStats()
  }, [])

  async function fetchReplications() {
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/replications/?page_size=50', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setReplications(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch replications:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/replications/stats', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setStats(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  async function handleCreateReplication() {
    try {
      const token = getToken()
      const res = await fetch('http://localhost:8000/api/replications/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({
          video_id: 1,
          product_id: 1
        }),
      })
      if (res.ok) {
        alert('✅ 复刻脚本已创建')
        fetchReplications()
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to create replication:', error)
      alert('❌ 创建失败，请重试')
    }
  }

  async function handleGenerateScript(replicationId: number, duration: string) {
    setGenerating(replicationId)
    try {
      const token = getToken()
      const res = await fetch(`http://localhost:8000/api/replications/${replicationId}/generate-script?duration=${duration}`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        alert(`✅ ${duration}脚本生成任务已启动，请稍后刷新查看结果`)
        setTimeout(fetchReplications, 3000)
      }
    } catch (error) {
      console.error('Failed to generate script:', error)
      alert('❌ 生成失败，请重试')
    } finally {
      setGenerating(null)
    }
  }

  async function handleExport(replicationId: number) {
    try {
      const token = getToken()
      const res = await fetch(`http://localhost:8000/api/replications/${replicationId}/export`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        const data = await res.json()
        const blob = new Blob([data.content], { type: 'text/markdown' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `replication_${replicationId}_${new Date().toISOString().split('T')[0]}.md`
        a.click()
        window.URL.revokeObjectURL(url)
        alert('✅ 导出成功')
      }
    } catch (error) {
      console.error('Failed to export:', error)
      alert('❌ 导出失败')
    }
  }

  async function handleDelete(replicationId: number) {
    if (!confirm('⚠️ 确定删除此复刻脚本？')) return
    
    try {
      const token = getToken()
      const res = await fetch(`http://localhost:8000/api/replications/${replicationId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        alert('✅ 已删除')
        fetchReplications()
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('❌ 删除失败')
    }
  }

  function viewDetail(replication: Replication) {
    setSelectedReplication(replication)
    setShowDetailModal(true)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container-custom py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="page-title">📝 复刻脚本管理</h1>
              <p className="page-subtitle">AI生成15秒/30秒短视频脚本和分镜列表，支持导出和编辑</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateReplication}>
                ➕ 创建新脚本
              </Button>
              <Link href="/videos">
                <Button variant="secondary">🎬 返回视频库</Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="脚本总数"
            value={stats.total || replications.length}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            color="cyan"
          />
          <StatCard
            title="已生成脚本"
            value={stats.withScripts || 0}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
          <StatCard
            title="平均分镜数"
            value={stats.avgShots || 0}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            }
            color="purple"
          />
        </div>

        {/* Replications List */}
        <Card>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : replications.length === 0 ? (
            <EmptyState
              title="暂无复刻脚本"
              description='点击"创建新脚本"按钮开始'
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              action={
                <Button onClick={handleCreateReplication}>
                  ➕ 立即创建
                </Button>
              }
            />
          ) : (
            <div className="space-y-6">
              {replications.map((rep) => (
                <div key={rep.id} className="glass-card rounded-3xl p-6 border border-slate-800/50 hover-card transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-100 mb-2">📝 复刻脚本 #{rep.id}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <Badge variant="info">🎬 视频 #{rep.video_id}</Badge>
                        {rep.product_id && <Badge variant="success">🛍️ 商品 #{rep.product_id}</Badge>}
                        <span className="text-xs">📅 {new Date(rep.created_at).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => viewDetail(rep)} className="px-4 py-2 text-xs">
                        👁️ 查看详情
                      </Button>
                      <Button variant="secondary" onClick={() => handleExport(rep.id)} className="px-4 py-2 text-xs">
                        📥 导出MD
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(rep.id)} className="px-4 py-2 text-xs">
                        🗑️ 删除
                      </Button>
                    </div>
                  </div>

                  {/* Script Generation Buttons */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* 15s Script */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-cyan-400 flex items-center gap-2">
                          ⏱️ 15秒脚本
                        </h4>
                        {rep.script_15s ? (
                          <Badge variant="success">✅ 已生成</Badge>
                        ) : (
                          <Badge variant="warning">⏳ 未生成</Badge>
                        )}
                      </div>
                      
                      {rep.script_15s ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">字数:</span>
                            <span className="text-cyan-400 font-semibold">{rep.script_15s.word_count}</span>
                          </div>
                          <p className="text-slate-300 line-clamp-2 leading-relaxed">
                            <strong className="text-slate-400">内容:</strong> {rep.script_15s.content}
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleGenerateScript(rep.id, '15s')}
                          disabled={generating === rep.id}
                          loading={generating === rep.id}
                          className="w-full"
                        >
                          ⚙️ 生成15秒脚本
                        </Button>
                      )}
                    </div>

                    {/* 30s Script */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-purple-400 flex items-center gap-2">
                          ⏱️ 30秒脚本
                        </h4>
                        {rep.script_30s ? (
                          <Badge variant="success">✅ 已生成</Badge>
                        ) : (
                          <Badge variant="warning">⏳ 未生成</Badge>
                        )}
                      </div>
                      
                      {rep.script_30s ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">字数:</span>
                            <span className="text-purple-400 font-semibold">{rep.script_30s.word_count}</span>
                          </div>
                          <p className="text-slate-300 line-clamp-2 leading-relaxed">
                            <strong className="text-slate-400">内容:</strong> {rep.script_30s.content}
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleGenerateScript(rep.id, '30s')}
                          disabled={generating === rep.id}
                          loading={generating === rep.id}
                          className="w-full"
                          variant="secondary"
                        >
                          ⚙️ 生成30秒脚本
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Shot List Preview */}
                  {rep.shot_list && rep.shot_list.length > 0 && (
                    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                      <h4 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
                        🎬 分镜列表 ({rep.shot_list.length}个镜头)
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {rep.shot_list.slice(0, 3).map((shot, index) => (
                          <div key={index} className="rounded-xl bg-slate-900 p-4 border border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="info">镜头 {shot.shot_number}</Badge>
                              <span className="text-xs text-slate-500">{shot.time_range}</span>
                            </div>
                            <div className="space-y-1 text-xs">
                              <p className="text-slate-300"><strong className="text-slate-400">画面:</strong> {shot.visual_description}</p>
                              <p className="text-slate-400"><strong className="text-slate-500">运镜:</strong> {shot.camera_movement}</p>
                              <p className="text-slate-400"><strong className="text-slate-500">音频:</strong> {shot.audio}</p>
                            </div>
                          </div>
                        ))}
                        {rep.shot_list.length > 3 && (
                          <Button variant="secondary" onClick={() => viewDetail(rep)} className="w-full text-xs">
                            查看全部 {rep.shot_list.length} 个分镜 →
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`📝 复刻脚本 #${selectedReplication?.id} 详情`}
        >
          {selectedReplication && (
            <div className="space-y-6">
              {/* Scripts */}
              <div className="grid gap-4 md:grid-cols-2">
                {selectedReplication.script_15s && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <h4 className="font-semibold text-cyan-400 mb-3">15秒脚本</h4>
                    <p className="text-sm text-slate-300 whitespace-pre-line">
                      {selectedReplication.script_15s.content}
                    </p>
                  </div>
                )}
                {selectedReplication.script_30s && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <h4 className="font-semibold text-purple-400 mb-3">30秒脚本</h4>
                    <p className="text-sm text-slate-300 whitespace-pre-line">
                      {selectedReplication.script_30s.content}
                    </p>
                  </div>
                )}
              </div>

              {/* Shot List */}
              {selectedReplication.shot_list && selectedReplication.shot_list.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-400 mb-3">完整分镜列表</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {selectedReplication.shot_list.map((shot, index) => (
                      <div key={index} className="rounded-xl bg-slate-900 p-4 border border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="info">镜头 {shot.shot_number}</Badge>
                          <span className="text-xs text-slate-500">{shot.time_range}</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-300"><strong className="text-slate-400">画面:</strong> {shot.visual_description}</p>
                          <p className="text-slate-400"><strong className="text-slate-500">运镜:</strong> {shot.camera_movement}</p>
                          <p className="text-slate-400"><strong className="text-slate-500">音频:</strong> {shot.audio}</p>
                          <p className="text-slate-400"><strong className="text-slate-500">字幕:</strong> {shot.text_overlay}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spoken Copy & Notes */}
              {(selectedReplication.spoken_copy || selectedReplication.shooting_notes) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedReplication.spoken_copy && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                      <h4 className="font-semibold text-yellow-400 mb-3">口播文案</h4>
                      <p className="text-sm text-slate-300 whitespace-pre-line">
                        {selectedReplication.spoken_copy}
                      </p>
                    </div>
                  )}
                  {selectedReplication.shooting_notes && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                      <h4 className="font-semibold text-orange-400 mb-3">拍摄备注</h4>
                      <p className="text-sm text-slate-300 whitespace-pre-line">
                        {selectedReplication.shooting_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </main>
  )
}
