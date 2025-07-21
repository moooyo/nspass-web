#!/bin/bash

# 本地测试 Cloudflare Pages 构建脚本

echo "🧪 开始本地测试 Cloudflare Pages 构建..."

# 设置测试环境变量
export NEXT_PUBLIC_API_BASE_URL="https://api.nspass.xforward.de"
export NODE_ENV="production"
export SKIP_TYPE_CHECK="true"

echo "📋 测试环境变量:"
echo "  NEXT_PUBLIC_API_BASE_URL: $NEXT_PUBLIC_API_BASE_URL"
echo "  NODE_ENV: $NODE_ENV"
echo "  SKIP_TYPE_CHECK: $SKIP_TYPE_CHECK"

# 运行构建
echo ""
echo "🔨 开始构建..."
npm run build:cloudflare

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 构建成功!"
    echo ""
    echo "📋 构建结果:"
    echo "  输出目录: out/"
    echo "  运行时配置: public/runtime-config.js"
    
    # 检查生成的文件
    if [ -f "public/runtime-config.js" ]; then
        echo ""
        echo "📄 运行时配置文件内容:"
        cat public/runtime-config.js
    fi
    
    if [ -d "out" ]; then
        echo ""
        echo "📁 静态导出文件结构:"
        find out -name "*.html" -o -name "*.js" | head -10
    fi
    
    echo ""
    echo "🚀 构建测试完成! 可以部署到 Cloudflare Pages 了。"
else
    echo ""
    echo "❌ 构建失败! 请检查错误信息。"
    exit 1
fi
