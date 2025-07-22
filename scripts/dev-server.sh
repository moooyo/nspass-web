#!/bin/bash

# 主开发服务器 - 使用sirv-cli (超快速)
# 优化后的开发环境启动脚本

set -e

echo "🚀 启动开发环境 (sirv)..."

# 检查端口占用（简化版）
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️ 端口3000被占用，尝试终止..."
    pkill -f "sirv.*3000" 2>/dev/null || true
    sleep 0.5
fi

# 清理旧PID文件
[ -f .rolldown.pid ] && rm -f .rolldown.pid
[ -f .serve.pid ] && rm -f .serve.pid

# 创建输出目录
mkdir -p out

# 启动Rolldown watch（后台）
echo "🔨 启动 Rolldown..."
npx rolldown -c rolldown.config.ts -w &
ROLLDOWN_PID=$!

# 等待初始构建（最多3秒）
echo "⏳ 等待构建..."
for i in {1..6}; do
    if [ -f "out/js/main-"*.js ] 2>/dev/null; then
        break
    fi
    sleep 0.5
done

# 复制文件
echo "📄 准备文件..."
cp index.html out/
cp -r public/* out/ 2>/dev/null || true

# 修复HTML
./scripts/fix-html.sh > /dev/null 2>&1

# 启动sirv服务器
echo "⚡ 启动sirv服务器..."
npx sirv out --port 3000 --cors --single --dev --quiet &
SIRV_PID=$!

# 保存PID
echo $ROLLDOWN_PID > .rolldown.pid
echo $SIRV_PID > .serve.pid

echo ""
echo "✅ 开发环境已启动!"
echo "🚀 访问: http://localhost:3000"
echo "⚡ 服务器: sirv"
echo "🛠️ 构建器: Rolldown"
echo ""
echo "按 Ctrl+C 或运行 ./scripts/cleanup-dev.sh 停止"

# 等待用户中断
wait
