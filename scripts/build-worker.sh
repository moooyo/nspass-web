#!/bin/bash

# Cloudflare Workers 构建脚本
set -e

echo "🚀 开始构建 NSPass Web for Cloudflare Workers..."

# 1. 清理之前的构建
echo "🧹 清理之前的构建文件..."
rm -rf out dist .next

# 2. 生成 Proto 文件
echo "📦 生成 Proto 类型定义..."
npm run proto:clean
npm run proto:generate

# 3. 构建 Next.js 应用为静态站点
echo "🔨 构建 Next.js 应用..."
SKIP_TYPE_CHECK=true npm run build

# 4. 检查构建输出
if [ ! -d "out" ]; then
    echo "❌ 构建失败：未找到 out 目录"
    exit 1
fi

echo "✅ 构建完成！"
echo "📁 静态文件位于: ./out"
echo "🔧 Workers 入口文件: ./src/index.js"
echo ""
echo "🚀 运行以下命令部署到 Cloudflare Workers:"
echo "   npm run worker:deploy"
echo ""
echo "🔍 运行以下命令本地测试:"
echo "   npm run worker:dev"
