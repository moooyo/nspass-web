#!/bin/bash

# Optimized development server using Vite
# Clean and efficient development environment

set -e

# Set development environment variables
export NODE_ENV=development
export VITE_ENABLE_MSW=true

echo "🚀 Starting Vite development environment..."

# Clean up previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

echo "✅ Cleanup completed"

# Check protobuf types
echo "🔍 Checking protobuf types..."
npm run proto:check

echo "✅ Protobuf types ready"

# Start Vite development server
echo "⚡ Starting Vite development server..."
echo ""
echo "🎉 Development server starting!"
echo "📱 Local: http://localhost:3000"
echo "🌍 Network: Available on your local network"
echo ""
echo "💡 Tips:"
echo "   - Use Ctrl+C to stop"
echo "   - Vite will automatically reload on file changes"
echo "   - Check the terminal for any errors"
echo ""

# Start Vite (this will block until interrupted)
npx vite --port 3000 --host
