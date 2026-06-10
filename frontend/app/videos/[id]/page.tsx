'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Video = {
  id: number
  title: string
  author?: string
  platform?: string
  category_id?: number
  status: string
  duration?: number
  cover_url?: string
  file_path?: string
  source_url?: string
  created_at: string
}

type VideoAsset = {
  id: number
  video_id: number
  audio_url?: string
  keyframe_urls?: string[]
  transcript_text?: string
  ocr_text?: string
}

type Analysis = {
  id: number
  video_id: number
  hook_analysis?: any
  script_structure?: any
  spoken_copy?: string
  camera_analysis?: any
  viral_reason?: string
  replication_score?: number
  created_at: string
}

export default function VideoDetailPage() {
  const params = useParams()
  const videoId = params.id as string
  
  const [video, setVideo] = useState<Video | null>(null)
  const [asset, setAsset] = useState<VideoAsset | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const [activeTab, setActiveTab] = useState<'info' | 'transcript' | 'hook' | 'structure' | 'camera'>('info')

  useEffect(() => {
    fetchVideoDetail()
    fetchAnalysis()
  }, [videoId])

  async function fetchVideoDetail() {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8001/api/videos/${videoId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        const data = await res.json()
        setVideo(data)
        // TODO: 获取视频资源
      }
    } catch (error) {
      console.error('Failed to fetch video detail:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAnalysis() {
    try {
      const res = await fetch(`http://localhost:8001/api/analyses/videos/${videoId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        setAnalysis(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch analysis:', error)
    }
  }

  async function handleProcess() {
    if (!video) return
    try {
      const res = await fetch(`http://localhost:8001/api/videos/${video.id}/process`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        alert('视频处理任务已启动')
        fetchVideoDetail()
      }
    } catch (error) {
      console.error('Failed to process video:', error)
    }
  }

  async function handleFullAnalysis() {
    if (!video) return
    
    try {
      const res = await fetch(`http://localhost:8001/api/analyses/videos/${video.id}/full-analysis`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        alert('AI分析已启动，请稍后刷新查看结果')
        setTimeout(fetchAnalysis, 5000)
      }
    } catch (error) {
      console.error('Failed to start analysis:', error)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="text-slate-400">加载中...</div>
      </main>
    )
  }

  if (!video) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="text-slate-400">视频不存在</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-semibold">{video.title}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                {video.author && <span>作者: {video.author}</span>}
                {video.platform && <span>平台: {video.platform}</span>}
                {video.duration && <span>时长: {Math.round(video.duration)}s</span>}
                <span>状态: {video.status}</span>
              </div>
            </div>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="API Token"
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {video.status === 'uploaded' && (
              <button
                onClick={handleProcess}
                className="rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-500"
              >
                处理视频
              </button>
            )}
            <button 
              onClick={handleFullAnalysis}
              className="rounded-2xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
            >
              AI分析
            </button>
            <button className="rounded-2xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400">
              生成脚本
            </button>
          </div>
        </section>

        {/* Content */}
        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          {/* Left: Video Player & Keyframes */}
          <div className="space-y-6">
            {/* Video Player */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold mb-4">视频预览</h2>
              <div className="aspect-video rounded-2xl bg-slate-950 flex items-center justify-center">
                {video.file_path ? (
                  <video controls className="w-full h-full rounded-2xl">
                    <source src={`/uploads/${video.file_path.split('/').pop()}`} type="video/mp4" />
                  </video>
                ) : (
                  <div className="text-slate-600">
                    {video.source_url ? '外部链接视频' : '无视频文件'}
                  </div>
                )}
              </div>
            </div>

            {/* Keyframes Gallery */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold mb-4">关键帧</h2>
              {asset?.keyframe_urls && asset.keyframe_urls.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {asset.keyframe_urls.map((url, index) => (
                    <div key={index} className="aspect-video rounded-xl bg-slate-950 overflow-hidden">
                      <img src={url} alt={`Frame ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  暂无关键帧，请先处理视频
                </div>
              )}
            </div>
          </div>

          {/* Right: Info & Tabs */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-800 mb-6 overflow-x-auto">
              {[
                { key: 'info', label: '基本信息' },
                { key: 'transcript', label: '口播转写' },
                { key: 'hook', label: '钩子画面' },
                { key: 'structure', label: '爆款结构' },
                { key: 'camera', label: '运镜分析' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-b-2 border-cyan-500 text-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-400 mb-1">标题</label>
                  <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100">
                    {video.title}
                  </div>
                </div>
                
                <div>
                  <label className="block text-slate-400 mb-1">作者</label>
                  <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100">
                    {video.author || '-'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-slate-400 mb-1">平台</label>
                  <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100">
                    {video.platform || '-'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-slate-400 mb-1">状态</label>
                  <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100">
                    {video.status}
                  </div>
                </div>
                
                <div>
                  <label className="block text-slate-400 mb-1">创建时间</label>
                  <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100">
                    {new Date(video.created_at).toLocaleString('zh-CN')}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transcript' && (
              <div className="space-y-4">
                {!analysis ? (
                  <div className="text-center text-slate-400 py-8">
                    <p>暂无转写文本</p>
                    <button
                      onClick={handleFullAnalysis}
                      className="mt-4 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-500"
                    >
                      启动AI分析
                    </button>
                  </div>
                ) : analysis.spoken_copy ? (
                  <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 whitespace-pre-wrap text-slate-100">
                    {analysis.spoken_copy}
                  </div>
                ) : asset?.transcript_text ? (
                  <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 whitespace-pre-wrap text-slate-100">
                    {asset.transcript_text}
                  </div>
                ) : (
                  <p className="text-slate-400">等待音频转写完成...</p>
                )}
              </div>
            )}

            {activeTab === 'hook' && (
              <div className="space-y-4">
                {!analysis ? (
                  <div className="text-center text-slate-400 py-8">
                    <p>暂无钩子画面分析</p>
                    <button
                      onClick={handleFullAnalysis}
                      className="mt-4 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-500"
                    >
                      启动AI分析
                    </button>
                  </div>
                ) : analysis.hook_analysis ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                      <h3 className="font-semibold text-cyan-400 mb-2">钩子分析</h3>
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(analysis.hook_analysis, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400">等待AI分析完成...</p>
                )}
              </div>
            )}

            {activeTab === 'structure' && (
              <div className="space-y-4">
                {!analysis ? (
                  <div className="text-center text-slate-400 py-8">
                    <p>暂无爆款结构分析</p>
                    <button
                      onClick={handleFullAnalysis}
                      className="mt-4 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-500"
                    >
                      启动AI分析
                    </button>
                  </div>
                ) : analysis.script_structure ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                      <h3 className="font-semibold text-cyan-400 mb-2">脚本结构</h3>
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(analysis.script_structure, null, 2)}
                      </pre>
                    </div>
                    
                    {analysis.viral_reason && (
                      <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                        <h3 className="font-semibold text-green-400 mb-2">爆款原因</h3>
                        <p className="text-sm text-slate-300">{analysis.viral_reason}</p>
                      </div>
                    )}
                    
                    {analysis.replication_score && (
                      <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                        <h3 className="font-semibold text-yellow-400 mb-2">复刻难度评分</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-red-500"
                              style={{ width: `${(analysis.replication_score / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-lg font-bold text-slate-100">{analysis.replication_score}/10</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400">等待AI分析完成...</p>
                )}
              </div>
            )}

            {activeTab === 'camera' && (
              <div className="space-y-4">
                {!analysis ? (
                  <div className="text-center text-slate-400 py-8">
                    <p>暂无运镜分析</p>
                    <button
                      onClick={handleFullAnalysis}
                      className="mt-4 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-500"
                    >
                      启动AI分析
                    </button>
                  </div>
                ) : analysis.camera_analysis ? (
                  <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                    <h3 className="font-semibold text-purple-400 mb-2">运镜分析</h3>
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(analysis.camera_analysis, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-slate-400">等待AI分析完成...</p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
