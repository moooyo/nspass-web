#!/usr/bin/env node

/**
 * Cloudflare Pages 专用构建脚本
 * 处理环境变量的多种情况
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始 Cloudflare Pages 构建流程...');

// 获取环境变量
const NODE_ENV = process.env.NODE_ENV || 'production';
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const CF_PAGES = process.env.CF_PAGES; // Cloudflare Pages 标识
const CF_PAGES_BRANCH = process.env.CF_PAGES_BRANCH;

console.log('🔍 环境检测:');
console.log('  NODE_ENV:', NODE_ENV);
console.log('  CF_PAGES:', CF_PAGES || 'false');
console.log('  CF_PAGES_BRANCH:', CF_PAGES_BRANCH || 'N/A');
console.log('  NEXT_PUBLIC_API_BASE_URL:', NEXT_PUBLIC_API_BASE_URL || '❌ 未设置');

// 确保 public 目录存在
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// 创建环境变量注入脚本
const envInjectionScript = `
// Cloudflare Pages 环境变量注入脚本
(function() {
  'use strict';
  
  console.log('🔧 Cloudflare Pages 环境变量初始化...');
  
  // 构建时环境变量
  const buildTimeVars = {
    NODE_ENV: '${NODE_ENV}',
    NEXT_PUBLIC_API_BASE_URL: '${NEXT_PUBLIC_API_BASE_URL || ''}',
    CF_PAGES: '${CF_PAGES || 'false'}',
    CF_PAGES_BRANCH: '${CF_PAGES_BRANCH || ''}',
    BUILD_TIME: '${new Date().toISOString()}'
  };
  
  // 初始化运行时配置
  window.__RUNTIME_CONFIG__ = {
    ...buildTimeVars,
    DETECTED_API_URL: null
  };
  
  // API URL 检测和设置函数
  function detectAndSetApiUrl() {
    let detectedUrl = null;
    
    // 1. 优先使用构建时设置的环境变量
    if (buildTimeVars.NEXT_PUBLIC_API_BASE_URL && 
        buildTimeVars.NEXT_PUBLIC_API_BASE_URL !== '' && 
        buildTimeVars.NEXT_PUBLIC_API_BASE_URL !== 'undefined') {
      detectedUrl = buildTimeVars.NEXT_PUBLIC_API_BASE_URL;
      console.log('✅ 使用构建时环境变量:', detectedUrl);
    }
    // 2. 如果是开发环境
    else if (buildTimeVars.NODE_ENV === 'development') {
      detectedUrl = 'http://localhost:8080';
      console.log('🛠️ 开发环境默认API:', detectedUrl);
    }
    // 3. 根据域名推断（生产环境）
    else if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      if (hostname.includes('nspass')) {
        detectedUrl = 'https://api.nspass.com';
        console.log('🎯 根据域名推断API:', detectedUrl);
      }
    }
    
    // 4. 最后的默认值
    if (!detectedUrl) {
      detectedUrl = 'https://api.nspass.com';
      console.warn('⚠️ 使用默认API地址:', detectedUrl);
      console.warn('💡 建议在 Cloudflare Pages 控制台设置 NEXT_PUBLIC_API_BASE_URL 环境变量');
    }
    
    // 设置到全局配置
    window.__RUNTIME_CONFIG__.DETECTED_API_URL = detectedUrl;
    window.__RUNTIME_CONFIG__.NEXT_PUBLIC_API_BASE_URL = detectedUrl;
    
    console.log('📦 最终运行时配置:', window.__RUNTIME_CONFIG__);
    
    return detectedUrl;
  }
  
  // 立即执行检测
  detectAndSetApiUrl();
  
  // 提供全局访问函数
  window.__GET_API_BASE_URL__ = function() {
    return window.__RUNTIME_CONFIG__.DETECTED_API_URL;
  };
  
  console.log('✅ 环境变量初始化完成');
})();
`;

// 写入环境变量脚本
const envScriptPath = path.join('public', 'cf-pages-env.js');
fs.writeFileSync(envScriptPath, envInjectionScript);
console.log('✅ 环境变量脚本已生成:', envScriptPath);

// 创建备用的运行时配置文件（兼容性）
const backupConfig = {
  NODE_ENV,
  NEXT_PUBLIC_API_BASE_URL: NEXT_PUBLIC_API_BASE_URL || null,
  BUILD_TIME: new Date().toISOString(),
  CF_PAGES: CF_PAGES || 'false',
  CF_PAGES_BRANCH: CF_PAGES_BRANCH || ''
};

const backupConfigPath = path.join('public', 'runtime-config.js');
const backupConfigContent = `
// 运行时配置备份文件
window.__RUNTIME_CONFIG__ = window.__RUNTIME_CONFIG__ || ${JSON.stringify(backupConfig, null, 2)};
console.log('📋 备用运行时配置已加载:', window.__RUNTIME_CONFIG__);
`;

fs.writeFileSync(backupConfigPath, backupConfigContent);
console.log('✅ 备用配置文件已生成:', backupConfigPath);

// 如果没有 protoc，创建 fallback types
try {
  execSync('which protoc', { stdio: 'ignore' });
  console.log('✅ protoc 可用');
} catch (error) {
  console.log('⚠️ protoc 不可用，将创建 fallback types');
  try {
    execSync('./scripts/create-fallback-types.sh', { stdio: 'inherit' });
  } catch (fallbackError) {
    console.warn('⚠️ 无法创建 fallback types，但构建将继续');
  }
}

console.log('🎉 Cloudflare Pages 构建准备完成！');
