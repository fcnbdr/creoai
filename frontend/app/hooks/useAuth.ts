'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth(required = true) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    
    if (required && !token) {
      // 没有token，重定向到登录页
      router.push('/login')
    }
  }, [required, router])
  
  const getToken = () => {
    return localStorage.getItem('access_token')
  }
  
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)
      
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || '登录失败')
      }
      
      const data = await response.json()
      
      // 保存Token
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('token_type', data.token_type)
      
      // 跳转到Dashboard
      router.push('/dashboard')
      
      return true
    } catch (err: any) {
      setError(err.message || '登录失败，请检查网络连接')
      return false
    } finally {
      setLoading(false)
    }
  }
  
  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_type')
    router.push('/login')
  }
  
  return { getToken, login, logout, loading, error }
}
