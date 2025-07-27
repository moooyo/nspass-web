#!/bin/bash

# Optimized development server using Rolldown + sirv
# Clean and efficient development environment

set -e

# Set development environment variables
export NODE_ENV=development
export VITE_ENABLE_MSW=true

echo "🚀 Starting Rolldown development environment..."

# Clean up previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

echo "✅ Cleanup completed"

# Check port availability
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is in use, attempting to terminate existing processes..."
    pkill -f "sirv.*3000" 2>/dev/null || true
    sleep 0.5
fi

# Clean up old PID files
[ -f .rolldown.pid ] && rm -f .rolldown.pid
[ -f .serve.pid ] && rm -f .serve.pid

# Create output directory
mkdir -p dist

# Start Rolldown in watch mode
echo "🔨 Starting Rolldown in watch mode..."
npx rolldown -c rolldown.config.ts -w &
ROLLDOWN_PID=$!

# Wait for initial build (max 3 seconds)
echo "⏳ Waiting for initial build..."
for i in {1..6}; do
    if [ -f "dist/assets/main-"*.js ] 2>/dev/null; then
        break
    fi
    sleep 0.5
done

# Copy files
echo "📄 Preparing files..."
cp index.html dist/
cp -r public/* dist/ 2>/dev/null || true

# Fix HTML references
node scripts/process-html.js > /dev/null 2>&1

# Start sirv server
echo "⚡ Starting sirv server..."
npx sirv dist --port 3000 --cors --single --dev --quiet &
SIRV_PID=$!

# Save PIDs for cleanup
echo $ROLLDOWN_PID > .rolldown.pid
echo $SIRV_PID > .serve.pid

echo ""
echo "🎉 Development server ready!"
echo "📱 Local: http://localhost:3000"
echo "🌍 Network: http://$(ip route get 1.1.1.1 | grep -oP 'src \K\S+' 2>/dev/null || echo 'localhost'):3000"
echo ""
echo "💡 Tips:"
echo "   - Use Ctrl+C to stop"
echo "   - Rolldown will automatically rebuild on file changes"
echo "   - Check the terminal for any errors"
echo ""

# Wait for user interrupt
trap 'echo "🛑 Stopping servers..."; kill $ROLLDOWN_PID $SIRV_PID 2>/dev/null; rm -f .rolldown.pid .serve.pid; echo "✅ Development server stopped"; exit' INT

wait

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
