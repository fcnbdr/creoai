'use client'

import React from 'react'

// 卡片组件
export function Card({ children, className = '', hover = false }: { 
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div className={`glass-card rounded-3xl p-6 ${hover ? 'hover-card' : ''} ${className}`}>
      {children}
    </div>
  )
}

// 按钮组件
export function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false,
  loading = false,
  className = ''
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>加载中...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

// 输入框组件
export function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onKeyDown,
  icon,
  error,
  className = ''
}: {
  label?: string
  type?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  icon?: React.ReactNode
  error?: string
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-medium text-slate-300 ml-1">{label}</label>}
      <div className="relative group/input">
        {icon && (
          <div className="absolute left-0 pl-4 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`input-field ${icon ? 'pl-12' : 'pl-4'} ${error ? 'border-red-500/50 focus:border-red-500/50' : ''}`}
        />
      </div>
      {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
    </div>
  )
}

// 选择框组件
export function Select({
  label,
  value,
  onChange,
  options,
  className = ''
}: {
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-medium text-slate-300 ml-1">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="input-field cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// 标签组件
export function Badge({ 
  children, 
  variant = 'info' 
}: { 
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info'
}) {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info'
  }

  return (
    <span className={`badge ${variants[variant]}`}>
      {children}
    </span>
  )
}

// 加载状态组件
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`${sizes[size]} loading-spinner`} />
  )
}

// 空状态组件
export function EmptyState({ 
  title, 
  description, 
  icon,
  action 
}: {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-12">
      {icon && <div className="mb-4 flex justify-center text-slate-600">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      {description && <p className="text-slate-500 mb-4">{description}</p>}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  )
}

// 模态框组件
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer
}: {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
            <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && (
          <div className="p-6 border-t border-slate-800/50 bg-slate-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// 进度条组件
export function ProgressBar({ 
  progress, 
  label 
}: { 
  progress: number
  label?: string
}) {
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">{label}</span>
          <span className="text-cyan-400 font-semibold">{progress}%</span>
        </div>
      )}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// 统计卡片组件
export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'cyan'
}: {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: { value: number; label: string }
  color?: 'cyan' | 'blue' | 'purple' | 'green'
}) {
  const colors = {
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
    blue: 'from-blue-500/20 to-purple-500/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30'
  }

  return (
    <div className={`glass-card rounded-3xl p-6 bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-100">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
    </div>
  )
}
