#!/usr/bin/env node

/**
 * Cloudflare Pages 构建脚本
 * 在构建时将环境变量注入到静态文件中
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始 Cloudflare Pages 构建优化...');

// 获取环境变量
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const NODE_ENV = process.env.NODE_ENV || 'production';

console.log('📋 当前环境变量:');
console.log('  NODE_ENV:', NODE_ENV);
console.log('  NEXT_PUBLIC_API_BASE_URL:', NEXT_PUBLIC_API_BASE_URL || '❌ 未设置');

// 如果环境变量未设置，创建一个占位符配置
// Cloudflare Pages 有时在构建过程的后期才注入环境变量
if (!NEXT_PUBLIC_API_BASE_URL) {
  console.warn('⚠️ 警告: NEXT_PUBLIC_API_BASE_URL 环境变量未设置');
  console.log('📝 将创建占位符配置，请确保在 Cloudflare Pages 控制台中设置了此变量');
}

// 创建运行时配置文件
const runtimeConfig = {
  NEXT_PUBLIC_API_BASE_URL: NEXT_PUBLIC_API_BASE_URL || null,
  NODE_ENV,
  BUILD_TIME: new Date().toISOString()
};

// 确保 public 目录存在
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// 写入运行时配置文件
const configPath = path.join('public', 'runtime-config.js');
const configContent = `
// Cloudflare Pages 运行时配置
window.__RUNTIME_CONFIG__ = ${JSON.stringify(runtimeConfig, null, 2)};
console.log('📦 已加载运行时配置:', window.__RUNTIME_CONFIG__);
`;

fs.writeFileSync(configPath, configContent);
console.log('✅ 运行时配置已生成:', configPath);

console.log('🚀 构建优化完成!');
