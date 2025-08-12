import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

export default function SimpleDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '20px'
  }

  const headerStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0'
  }

  const buttonStyle = {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  }

  const cardStyle = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  }

  const statCardStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const
  }

  const statNumberStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#3b82f6',
    margin: '0'
  }

  const statLabelStyle = {
    fontSize: '14px',
    color: '#6b7280',
    margin: '8px 0 0 0'
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>NSPass 管理面板</h1>
        <div>
          <span style={{ marginRight: '16px', color: '#6b7280' }}>
            欢迎，{user?.name || 'User'}
          </span>
          <button style={buttonStyle} onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </div>

      {/* Welcome Card */}
      <div style={cardStyle}>
        <h2 style={{ color: '#1f2937', marginBottom: '16px' }}>欢迎来到 NSPass</h2>
        <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
          您已成功登录到管理系统。这是一个简化的仪表盘页面，使用内联样式确保正常显示。
        </p>
        <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
          <strong>当前用户信息：</strong>
        </p>
        <ul style={{ color: '#6b7280', paddingLeft: '20px' }}>
          <li>用户ID: {user?.id}</li>
          <li>用户名: {user?.name}</li>
          <li>邮箱: {user?.email}</li>
          <li>角色: {user?.role}</li>
          <li>权限: {user?.permissions?.join(', ')}</li>
        </ul>
      </div>

      {/* Stats Grid */}
      <div style={gridStyle}>
        <div style={statCardStyle}>
          <p style={statNumberStyle}>1,234</p>
          <p style={statLabelStyle}>总用户数</p>
        </div>
        <div style={statCardStyle}>
          <p style={statNumberStyle}>8/10</p>
          <p style={statLabelStyle}>在线服务器</p>
        </div>
        <div style={statCardStyle}>
          <p style={statNumberStyle}>2.4TB</p>
          <p style={statLabelStyle}>今日流量</p>
        </div>
        <div style={statCardStyle}>
          <p style={statNumberStyle}>156</p>
          <p style={statLabelStyle}>活跃规则</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={cardStyle}>
        <h3 style={{ color: '#1f2937', marginBottom: '16px' }}>快速操作</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            用户管理
          </button>
          <button style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            服务器配置
          </button>
          <button style={{
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            系统设置
          </button>
        </div>
      </div>
    </div>
  )
}
