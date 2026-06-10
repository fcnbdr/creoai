'use client'

import { useTheme } from '../hooks/useTheme'

export default function HelpPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const bg = isDark ? '#0F172A' : '#F1F5F9'
  const cardBg = isDark ? '#1E293B' : '#FFFFFF'
  const border = isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0'
  const text = isDark ? '#E2E8F0' : '#1E293B'
  const subText = isDark ? '#94A3B8' : '#64748B'

  const sections = [
    {
      title: '🚀 快速入门',
      items: [
        { q: '如何开始使用 CreoAI？', a: '登录后，从左侧菜单进入"创作中心"，选择需要的功能（精修/扩充/详情页等），上传图片并配置参数即可生成内容。' },
        { q: '积分如何获取？', a: '新用户注册赠送 1000 积分。可通过充值、邀请好友（双方各得200积分）获取更多积分。' },
        { q: '支持哪些电商平台？', a: '详情页生成支持淘宝、天猫、京东、拼多多、抖音、快手、小红书、1688、Shopee、Lazada 等 16+ 平台。' },
      ]
    },
    {
      title: '🖼️ ECPro 图片处理',
      items: [
        { q: '什么是智能精修？', a: '上传商品图片并输入 Prompt 指令，AI 自动进行图片精修，支持与原图对比。' },
        { q: '图片扩充支持多少张？', a: '最多可同时上传 10 张图片，每张图片可生成多张补充图片。' },
        { q: 'AI 详情页生成如何操作？', a: '输入商品信息（类目/卖点/人群/场景），系统自动生成适配多平台的详情页。' },
        { q: 'KOC 种草是什么？', a: '输入商品信息，AI 自动生成种草图文，包含排版和推荐文案，支持导出为图片或 Markdown。' },
      ]
    },
    {
      title: '🎬 Video AI 视频生成',
      items: [
        { q: '视频生成需要哪些信息？', a: '输入商品类别、卖点、使用场景，AI 会自动生成 6 种风格共 21 条 Prompt 供选择。' },
        { q: '微详情短视频如何使用？', a: '选择已有商品（输入商品ID），系统自动抓取商品主图和详情图，批量生成短视频。' },
        { q: '直播切片如何操作？', a: '输入直播回放链接，选择切片时长（15秒/30秒）和数量，AI 自动检测高光片段并生成切片。' },
        { q: '视频生成的安全限制？', a: '不能生成真人面孔、版权角色、版权音乐、成人内容。图生视频不支持人脸输入图像。' },
      ]
    },
    {
      title: '🔑 API 集成',
      items: [
        { q: '如何获取 API Token？', a: '前往"API 令牌"页面，点击新建令牌，复制 Token Key 即可。' },
        { q: 'API 支持哪些功能？', a: '支持图片精修、图片扩充、详情页生成、视频生成、Prompt 生成等全部核心功能。' },
        { q: 'API 调用限制？', a: '根据套餐不同有不同的调用次数限制。个人版 500次/月，专业版 2000次/月，企业版 10000次/月。' },
      ]
    },
  ]

  return (
    <div className="min-h-screen p-6 transition-colors duration-300" style={{ background: bg }}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl p-6 mb-6" style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h1 className="text-xl font-bold mb-2" style={{ color: text }}>📖 使用帮助</h1>
          <p className="text-sm" style={{ color: subText }}>CreoAI · 为电商而生 — 常见问题与使用指南</p>
        </div>

        <div className="space-y-4">
          {sections.map((section, si) => (
            <div key={si} className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: text }}>{section.title}</h2>
              <div className="space-y-4">
                {section.items.map((item, ii) => (
                  <div key={ii} className="rounded-xl p-4 border" style={{ borderColor: border, background: isDark ? 'rgba(148,163,184,0.03)' : '#F8FAFC' }}>
                    <p className="text-sm font-medium mb-1.5" style={{ color: text }}>{item.q}</p>
                    <p className="text-sm leading-relaxed" style={{ color: subText }}>{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6 mt-4 text-center" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <p className="text-sm" style={{ color: subText }}>
            更多问题请联系客服：
            <a href="mailto:support@creoai.com" className="ml-1 font-medium hover:underline" style={{ color: '#7C3AED' }}>support@creoai.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}
