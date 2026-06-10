'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { Card, StatCard, LoadingSpinner, EmptyState } from '../components/UIComponents'

type DashboardStats = {
  today_analyzed_videos: number
  today_recommendations: number
  today_ai_cost: number
  iclip_remaining_quota: number
}

type RecentRecommendation = {
  id: number
  title: string
  score: number
  product_name?: string
}

type FailedJob = {
  id: number
  job_type: string
  error_message: string
  created_at: string
}

export default function DashboardPage() {
  const { getToken, logout } = useAuth(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    today_analyzed_videos: 0,
    today_recommendations: 0,
    today_ai_cost: 0,
    iclip_remaining_quota: 0,
  })
  const [recentRecommendations, setRecentRecommendations] = useState<RecentRecommendation[]>([])
  const [failedJobs, setFailedJobs] = useState<FailedJob[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)
    try {
      const token = getToken()
      
      // 获取统计数据
      const statsRes = await fetch('http://localhost:8000/api/dashboard/stats', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (statsRes.ok) {
        setStats(await statsRes.json())
      }

      // 获取最近推荐
      const recommendationsRes = await fetch('http://localhost:8000/api/recommendations/?page_size=5', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (recommendationsRes.ok) {
        setRecentRecommendations(await recommendationsRes.json())
      }

      // 获取失败任务
      const jobsRes = await fetch('http://localhost:8000/api/jobs/?status=failed&page_size=5', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (jobsRes.ok) {
        setFailedJobs(await jobsRes.json())
      }

      // 获取AI调用趋势数据（模拟数据，实际应从后端获取）
      setChartData([
        { date: '周一', calls: 12, cost: 2.5 },
        { date: '周二', calls: 19, cost: 3.8 },
        { date: '周三', calls: 15, cost: 3.0 },
        { date: '周四', calls: 22, cost: 4.5 },
        { date: '周五', calls: 18, cost: 3.6 },
        { date: '周六', calls: 25, cost: 5.2 },
        { date: '周日', calls: 20, cost: 4.0 },
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#7C3AED' }}>📊 仪表盘</h1>
            <p className="text-sm mt-1" style={{ color: subColor }}>系统概览与关键指标</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="btn-secondary px-4 py-2"
          >
            🔄 刷新数据
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="今日分析视频"
                value={stats.today_analyzed_videos.toString()}
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                }
                color="cyan"
              />
              <StatCard
                title="今日推荐选题"
                value={stats.today_recommendations.toString()}
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                }
                color="purple"
              />
              <StatCard
                title="今日AI成本"
                value={`￥${stats.today_ai_cost.toFixed(2)}`}
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="green"
              />
              <StatCard
                title="iClip剩余积分"
                value={`${stats.iclip_remaining_quota} / 1000`}
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }
                color="blue"
              />
            </div>

            {/* Chart Section */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: textColor }}>📈 近7天AI调用趋势</h2>
                <div className="flex gap-2 text-sm">
                  <span className="text-blue-500">● 调用次数</span>
                  <span className="text-blue-400">● 成本(￥)</span>
                </div>
              </div>
              
              {/* Simple Bar Chart */}
              <div className="h-64 flex items-end justify-between gap-2 px-4">
                {chartData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col gap-1">
                      <div 
                        className="w-full bg-gradient-to-t from-[#3B82F6] to-[#60A5FA] rounded-t-lg transition-all duration-500 hover:opacity-80"
                        style={{ height: `${(item.calls / 30) * 150}px` }}
                        title={`调用: ${item.calls}`}
                      />
                      <div 
                        className="w-full bg-gradient-to-t from-[#60A5FA] to-[#93C5FD] rounded-t-lg transition-all duration-500 hover:opacity-80"
                        style={{ height: `${(item.cost / 6) * 150}px` }}
                        title={`成本: ¥${item.cost}`}
                      />
                    </div>
                    <span className="text-xs" style={{ color: subColor }}>{item.date}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Bottom Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Recommendations */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold" style={{ color: textColor }}>💡 最近选题推荐</h2>
                  <Link href="/recommendations">
                    <button className="text-sm text-blue-500 hover:text-blue-600 transition">
                      查看全部 →
                    </button>
                  </Link>
                </div>
                
                {recentRecommendations.length === 0 ? (
                  <EmptyState
                    title="暂无推荐"
                    description="前往选题中心生成AI推荐"
                    icon={
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {recentRecommendations.map((rec) => (
                      <div key={rec.id} className="rounded-xl border p-4 hover:shadow-md transition-all duration-300 group" style={{ borderColor, background: cardBg }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-medium group-hover:text-purple-500 transition-colors line-clamp-2" style={{ color: textColor }}>
                              {rec.title}
                            </h3>
                            {rec.product_name && (
                              <p className="text-xs mt-1" style={{ color: subColor }}>
                                🛍️ {rec.product_name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>评分</span>
                            <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-semibold">
                              {rec.score}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Link href={`/replications/new?recommendation_id=${rec.id}`}>
                            <button className="px-3 py-1.5 text-xs rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition">
                              生成脚本
                            </button>
                          </Link>
                          <Link href={`/content-production?type=text&recommendation_id=${rec.id}`}>
                            <button className="px-3 py-1.5 text-xs rounded-lg bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 transition">
                              生成图文
                            </button>
                          </Link>
                          <Link href={`/content-production?type=video&recommendation_id=${rec.id}`}>
                            <button className="px-3 py-1.5 text-xs rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition">
                              生成视频
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Failed Jobs */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold" style={{ color: textColor }}>⚠️ 最近失败任务</h2>
                  <Link href="/job-logs">
                    <button className="text-sm text-blue-500 hover:text-blue-600 transition">
                      查看全部 →
                    </button>
                  </Link>
                </div>
                
                {failedJobs.length === 0 ? (
                  <EmptyState
                    title="无失败任务"
                    description="所有任务运行正常"
                    icon={
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {failedJobs.map((job) => (
                      <div key={job.id} className="rounded-xl border p-4" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-mono" style={{ color: subColor }}>任务 #{job.id}</span>
                              <span className="px-2 py-1 rounded-lg bg-red-100 text-red-600 text-xs">
                                {job.job_type}
                              </span>
                            </div>
                            <p className="text-sm text-red-700 line-clamp-2">
                              {job.error_message}
                            </p>
                            <p className="text-xs mt-2" style={{ color: subColor }}>
                              {new Date(job.created_at).toLocaleString('zh-CN')}
                            </p>
                          </div>
                          <button
                            onClick={() => alert(`重试任务 #${job.id}`)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                          >
                            🔄 重试
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
