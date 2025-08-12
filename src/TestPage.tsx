import React from 'react'

export default function TestPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#3b82f6', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '32px', 
        borderRadius: '8px', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '16px' 
        }}>
          样式测试页面
        </h1>
        <div className="test-red mb-4">
          这是一个自定义CSS类测试（红色背景）
        </div>
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '16px' 
        }}>
          这个页面使用内联样式显示。如果您能看到蓝色背景和白色卡片，说明基本渲染正常。
        </p>
        <div className="min-h-screen bg-blue-500 flex items-center justify-center">
          <p>这行测试Tailwind类是否工作</p>
        </div>
        <button style={{ 
          backgroundColor: '#2563eb', 
          color: 'white', 
          padding: '8px 16px', 
          borderRadius: '4px', 
          border: 'none',
          cursor: 'pointer'
        }}>
          内联样式按钮
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-4">
          Tailwind样式按钮
        </button>
      </div>
    </div>
  )
}
