import React from 'react'

export default function TailwindTestPage() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Tailwind CSS 测试
        </h1>
        <p className="text-gray-600 mb-6">
          如果您能看到蓝色背景和这个白色卡片，说明 Tailwind CSS 正在工作。
        </p>
        <div className="space-y-3">
          <div className="w-full h-4 bg-red-500 rounded"></div>
          <div className="w-3/4 h-4 bg-green-500 rounded"></div>
          <div className="w-1/2 h-4 bg-purple-500 rounded"></div>
        </div>
        <button className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
          测试按钮
        </button>
      </div>
    </div>
  )
}
