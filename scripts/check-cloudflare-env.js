#!/usr/bin/env node

/**
 * Cloudflare Pages 环境变量检测工具
 * 用于调试和验证环境变量配置
 */

console.log('🔍 Cloudflare Pages 环境变量检测工具');
console.log('=====================================');

// 获取所有相关环境变量
const envVars = {
  // Node.js 基础环境变量
  NODE_ENV: process.env.NODE_ENV,
  
  // Next.js 相关环境变量
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PHASE: process.env.NEXT_PHASE,
  
  // Cloudflare Pages 相关环境变量
  CF_PAGES: process.env.CF_PAGES,
  CF_PAGES_BRANCH: process.env.CF_PAGES_BRANCH,
  CF_PAGES_COMMIT_SHA: process.env.CF_PAGES_COMMIT_SHA,
  CF_PAGES_URL: process.env.CF_PAGES_URL,
  
  // 其他可能相关的环境变量
  VERCEL: process.env.VERCEL,
  NETLIFY: process.env.NETLIFY,
  BUILD_ID: process.env.BUILD_ID,
  
  // TypeScript/构建相关
  SKIP_TYPE_CHECK: process.env.SKIP_TYPE_CHECK,
};

console.log('📊 检测到的环境变量:');
Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  console.log(`  ${status} ${key}: ${value || '(未设置)'}`);
});

console.log('\n🎯 关键检查项:');

// 检查是否在 Cloudflare Pages 环境
if (process.env.CF_PAGES) {
  console.log('✅ 检测到 Cloudflare Pages 环境');
  console.log(`   分支: ${process.env.CF_PAGES_BRANCH || '未知'}`);
  console.log(`   URL: ${process.env.CF_PAGES_URL || '未知'}`);
} else {
  console.log('❌ 未检测到 Cloudflare Pages 环境');
}

// 检查关键的API URL环境变量
if (process.env.NEXT_PUBLIC_API_BASE_URL) {
  console.log('✅ NEXT_PUBLIC_API_BASE_URL 已设置');
  console.log(`   值: ${process.env.NEXT_PUBLIC_API_BASE_URL}`);
} else {
  console.log('❌ NEXT_PUBLIC_API_BASE_URL 未设置');
  console.log('💡 需要在 Cloudflare Pages 控制台设置此环境变量');
}

// 检查构建模式
if (process.env.NODE_ENV === 'production') {
  console.log('✅ 生产环境构建模式');
} else {
  console.log(`ℹ️ 当前环境: ${process.env.NODE_ENV || '未设置'}`);
}

console.log('\n📝 建议操作:');
console.log('1. 在 Cloudflare Pages 控制台中设置以下环境变量:');
console.log('   - NEXT_PUBLIC_API_BASE_URL: https://api.nspass.com');
console.log('   - NODE_ENV: production');
console.log('');
console.log('2. 确保构建命令使用: npm run build:cloudflare');
console.log('');
console.log('3. 如果问题仍然存在，检查构建日志中的环境变量输出');

console.log('\n=====================================');
