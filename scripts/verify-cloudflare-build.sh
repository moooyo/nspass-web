#!/bin/bash

# Cloudflare Pages 构建验证脚本
# 验证构建输出是否包含正确的环境变量配置

echo "🔍 Cloudflare Pages 构建验证开始..."

# 检查必需的文件是否存在
echo "📁 检查必需文件..."

if [ ! -f "public/cf-pages-env.js" ]; then
    echo "❌ public/cf-pages-env.js 文件缺失"
    exit 1
fi

if [ ! -f "public/runtime-config.js" ]; then
    echo "❌ public/runtime-config.js 文件缺失"
    exit 1
fi

echo "✅ 必需文件存在"

# 检查环境变量脚本内容
echo "🔧 检查环境变量脚本内容..."

if grep -q "__RUNTIME_CONFIG__" public/cf-pages-env.js; then
    echo "✅ 环境变量脚本包含运行时配置"
else
    echo "❌ 环境变量脚本缺少运行时配置"
    exit 1
fi

if grep -q "__GET_API_BASE_URL__" public/cf-pages-env.js; then
    echo "✅ 环境变量脚本包含API URL获取函数"
else
    echo "❌ 环境变量脚本缺少API URL获取函数"
    exit 1
fi

# 检查构建输出目录
if [ -d "out" ]; then
    echo "✅ Next.js 构建输出目录存在"
    
    # 检查关键文件
    if [ -f "out/_next/static/chunks/pages/_app-*.js" ] || [ -f "out/_next/static/chunks/main-*.js" ]; then
        echo "✅ JavaScript 构建文件存在"
    else
        echo "⚠️ JavaScript 构建文件可能缺失"
    fi
    
    # 检查环境变量文件是否被复制到构建输出
    if [ -f "out/cf-pages-env.js" ]; then
        echo "✅ 环境变量脚本已复制到构建输出"
    else
        echo "❌ 环境变量脚本未复制到构建输出"
        echo "🔧 尝试手动复制..."
        cp public/cf-pages-env.js out/cf-pages-env.js
        cp public/runtime-config.js out/runtime-config.js
        echo "✅ 手动复制完成"
    fi
else
    echo "❌ Next.js 构建输出目录不存在"
    echo "💡 请先运行构建命令: npm run build:cloudflare"
    exit 1
fi

echo "🎉 Cloudflare Pages 构建验证完成！"
echo ""
echo "📋 部署检查清单："
echo "  ✅ 环境变量脚本已生成"
echo "  ✅ 运行时配置已创建"
echo "  ✅ Next.js 构建输出存在"
echo "  ✅ 静态文件已准备就绪"
echo ""
echo "🚀 现在可以部署到 Cloudflare Pages 了！"
echo ""
echo "⚠️ 重要提醒："
echo "  1. 确保在 Cloudflare Pages 控制台设置了 NEXT_PUBLIC_API_BASE_URL 环境变量"
echo "  2. 构建命令应该是: npm run build:cloudflare"
echo "  3. 构建输出目录应该是: out"
