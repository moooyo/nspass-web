#!/usr/bin/env node

/**
 * Cloudflare Pages 专用构建脚本
 * 创建动态环境变量加载器
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 创建 Cloudflare Pages 动态环境变量加载器...');

// 确保 public 目录存在
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// 创建动态环境变量加载器
const dynamicConfigContent = `
// Cloudflare Pages 动态环境变量加载器
(function() {
  'use strict';
  
  console.log('🚀 正在加载 Cloudflare Pages 环境变量...');
  
  // 获取当前构建时的环境变量
  const BUILD_TIME_API_URL = '${process.env.NEXT_PUBLIC_API_BASE_URL || ''}';
  const BUILD_TIME_NODE_ENV = '${process.env.NODE_ENV || 'production'}';
  
  // 创建运行时配置对象
  window.__RUNTIME_CONFIG__ = {
    NODE_ENV: BUILD_TIME_NODE_ENV,
    BUILD_TIME: '${new Date().toISOString()}',
    // 初始值设为构建时的环境变量
    NEXT_PUBLIC_API_BASE_URL: BUILD_TIME_API_URL || null
  };
  
  // 尝试从不同来源获取环境变量
  function detectApiBaseUrl() {
    console.log('🔍 环境变量检测开始...');
    console.log('  构建时API URL:', BUILD_TIME_API_URL);
    
    // 1. 检查构建时是否已经有有效的环境变量
    if (BUILD_TIME_API_URL && BUILD_TIME_API_URL !== '' && BUILD_TIME_API_URL !== 'null' && BUILD_TIME_API_URL !== 'undefined') {
      console.log('✅ 使用构建时环境变量:', BUILD_TIME_API_URL);
      return BUILD_TIME_API_URL;
    }
    
    // 2. 尝试从 Cloudflare Pages 运行时环境获取
    // Cloudflare Pages 有时会在页面加载后才注入环境变量
    if (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env) {
      const runtimeUrl = globalThis.process.env.NEXT_PUBLIC_API_BASE_URL;
      if (runtimeUrl && runtimeUrl !== '' && runtimeUrl !== 'null') {
        console.log('✅ 使用运行时环境变量:', runtimeUrl);
        return runtimeUrl;
      }
    }
    
    // 3. 尝试从 Cloudflare Pages 特有的环境中获取
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      
      // 如果是 Cloudflare Pages 域名，尝试推断API域名
      if (hostname.includes('.pages.dev') || hostname.includes('cloudflare')) {
        console.log('🔍 检测到 Cloudflare Pages 域名，尝试推断API地址');
        
        // 根据你的域名规则来设置
        if (hostname.includes('nspass')) {
          const inferredUrl = 'https://api.nspass.com';
          console.log('🎯 推断的API地址:', inferredUrl);
          return inferredUrl;
        }
      }
    }
    
    // 4. 开发环境默认值
    if (BUILD_TIME_NODE_ENV === 'development') {
      console.log('🛠️ 开发环境，使用localhost');
      return 'http://localhost:8080';
    }
    
    // 5. 生产环境默认值
    const fallback = 'https://api.nspass.com';
    console.warn('⚠️ 未找到环境变量，使用默认API地址:', fallback);
    console.warn('📝 建议在 Cloudflare Pages 控制台设置 NEXT_PUBLIC_API_BASE_URL');
    return fallback;
  }
  
  // 检测并设置API基础URL
  window.__RUNTIME_CONFIG__.NEXT_PUBLIC_API_BASE_URL = detectApiBaseUrl();
  
  console.log('📦 Cloudflare Pages 运行时配置已加载:', window.__RUNTIME_CONFIG__);
})();
`;

// 写入动态配置文件
const configPath = path.join('public', 'runtime-config.js');
fs.writeFileSync(configPath, dynamicConfigContent);

console.log('✅ 动态环境变量加载器已生成:', configPath);
console.log('🚀 构建优化完成!');
