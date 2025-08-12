import React from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }
  
  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  )
}

interface LoadingPageProps {
  message?: string
  showLogo?: boolean
}

export function LoadingPage({ message = '正在加载...', showLogo = true }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            {showLogo && (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-2">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            )}
            
            <LoadingSpinner size="lg" className="text-primary" />
            
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">{message}</p>
              <p className="text-sm text-muted-foreground">
                请稍候，正在为您准备最佳体验...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface LoadingSkeletonProps {
  rows?: number
  className?: string
}

export function LoadingSkeleton({ rows = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
}

interface LoadingCardProps {
  title?: string
  description?: string
}

export function LoadingCard({ title = '加载中', description = '正在获取数据...' }: LoadingCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <LoadingSpinner />
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
