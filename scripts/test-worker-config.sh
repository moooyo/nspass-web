#!/bin/bash

# 测试 Cloudflare Workers 本地开发环境
set -e

echo "🧪 测试 Cloudflare Workers 配置..."

# 检查必要文件
echo "📁 检查必要文件..."
if [ ! -f "src/index.js" ]; then
    echo "❌ Workers 入口文件 src/index.js 不存在"
    exit 1
fi

if [ ! -f "wrangler.toml" ]; then
    echo "❌ Wrangler 配置文件 wrangler.toml 不存在"
    exit 1
fi

if [ ! -d "out" ]; then
    echo "❌ 构建输出目录 out/ 不存在"
    echo "🔧 请先运行: npm run worker:build"
    exit 1
fi

echo "✅ 所有必要文件都存在"

# 检查 wrangler 是否可用
echo "🔍 检查 Wrangler CLI..."
if command -v npx wrangler &> /dev/null; then
    echo "✅ Wrangler CLI 可用"
    npx wrangler --version
else
    echo "❌ Wrangler CLI 不可用"
    echo "🔧 请运行: npm install -g wrangler"
    exit 1
fi

echo ""
echo "🎉 所有测试通过！"
echo "🚀 现在可以运行以下命令:"
echo "   npm run worker:dev    # 本地开发"
echo "   npm run worker:deploy # 部署到 Cloudflare Workers"
