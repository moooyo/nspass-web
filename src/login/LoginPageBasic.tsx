import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/hooks/use-toast'

export default function LoginPageBasic() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "请输入邮箱和密码",
      })
      return
    }

    setIsLoading(true)
    
    try {
      // 模拟登录（在mock模式下）
      const mockUser = {
        id: '1',
        name: '管理员',
        email: email,
        permissions: ['admin'],
        role: 'admin',
        provider: 'local'
      }

      await login(mockUser, 'email')
      
      toast({
        title: "登录成功",
        description: `欢迎回来，${mockUser.name}！`,
      })
      
      navigate('/')
    } catch (error) {
      console.error('登录失败:', error)
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "登录失败，请重试",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  }

  const cardStyle = {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
  }

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
    textAlign: 'center' as const
  }

  const subtitleStyle = {
    color: '#6b7280',
    marginBottom: '32px',
    textAlign: 'center' as const
  }

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '16px',
    marginBottom: '20px',
    boxSizing: 'border-box' as const
  }

  const buttonStyle = {
    width: '100%',
    backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: isLoading ? 'not-allowed' : 'pointer'
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>NSPass</h1>
        <p style={subtitleStyle}>登录到您的管理面板</p>
        
        <form onSubmit={handleLogin}>
          <div>
            <label style={labelStyle}>邮箱</label>
            <input
              type="email"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              style={inputStyle}
              required
            />
          </div>
          
          <div>
            <label style={labelStyle}>密码</label>
            <input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={buttonStyle}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: '#fef3c7', 
          border: '1px solid #f59e0b', 
          borderRadius: '6px' 
        }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#92400e', 
            margin: '0' 
          }}>
            <strong>测试模式：</strong> 您可以使用任意邮箱和密码登录
          </p>
        </div>
      </div>
    </div>
  )
}
