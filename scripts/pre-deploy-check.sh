#!/bin/bash

# Cloudflare Pages 部署前检查脚本
# 用于验证环境变量和构建配置

echo "🚀 开始部署前检查..."

# 检查环境变量
echo "📋 检查环境变量:"
echo "  NODE_ENV: ${NODE_ENV:-'未设置'}"
echo "  NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL:-'未设置'}"
echo "  SKIP_TYPE_CHECK: ${SKIP_TYPE_CHECK:-'未设置'}"

# 验证 NEXT_PUBLIC_API_BASE_URL
if [ -z "$NEXT_PUBLIC_API_BASE_URL" ]; then
    echo "❌ 错误: NEXT_PUBLIC_API_BASE_URL 环境变量未设置"
    echo "📝 请在 Cloudflare Pages 控制台中设置 NEXT_PUBLIC_API_BASE_URL"
    echo "📝 例如: https://your-api-domain.com"
    exit 1
fi

# 验证 URL 格式
if [[ ! "$NEXT_PUBLIC_API_BASE_URL" =~ ^https?:// ]]; then
    echo "❌ 错误: NEXT_PUBLIC_API_BASE_URL 必须是完整的URL (包含 http:// 或 https://)"
    echo "📝 当前值: $NEXT_PUBLIC_API_BASE_URL"
    exit 1
fi

# 检查是否指向 localhost
if [[ "$NEXT_PUBLIC_API_BASE_URL" == *"localhost"* ]] || [[ "$NEXT_PUBLIC_API_BASE_URL" == *"127.0.0.1"* ]]; then
    echo "⚠️  警告: NEXT_PUBLIC_API_BASE_URL 指向 localhost，这在生产环境中不会工作"
    echo "📝 当前值: $NEXT_PUBLIC_API_BASE_URL"
    if [ "$NODE_ENV" = "production" ]; then
        echo "❌ 错误: 生产环境不能使用 localhost"
        exit 1
    fi
fi

# 检查配置文件
echo "📋 检查配置文件:"

if [ ! -f "next.config.ts" ]; then
    echo "❌ 错误: next.config.ts 文件不存在"
    exit 1
fi
echo "  ✅ next.config.ts 存在"

if [ ! -f "wrangler.toml" ]; then
    echo "❌ 错误: wrangler.toml 文件不存在"
    exit 1
fi
echo "  ✅ wrangler.toml 存在"

if [ ! -f "package.json" ]; then
    echo "❌ 错误: package.json 文件不存在"
    exit 1
fi
echo "  ✅ package.json 存在"

# 检查构建脚本
echo "📋 检查构建脚本:"
if grep -q "build:cloudflare" package.json; then
    echo "  ✅ build:cloudflare 脚本存在"
else
    echo "  ❌ 警告: build:cloudflare 脚本不存在"
fi

# 输出最终的API URL配置
echo "🎯 最终API配置:"
echo "  API Base URL: $NEXT_PUBLIC_API_BASE_URL"

echo "✅ 部署前检查完成!"
echo ""
echo "📝 部署建议:"
echo "  1. 确保在 Cloudflare Pages 控制台中设置了 NEXT_PUBLIC_API_BASE_URL"
echo "  2. 使用正确的构建命令: npm run build:cloudflare"
echo "  3. 检查部署后的浏览器控制台输出以验证环境变量"
