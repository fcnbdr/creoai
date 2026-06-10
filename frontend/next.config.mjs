/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vercel 部署时使用 standalone 输出模式
  output: 'standalone',
  // 开发环境：将 /api/* 请求转发到本地后端 (http://localhost:8000)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? '/api/:path*'  // 生产环境由 vercel.json routes 处理
          : 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
