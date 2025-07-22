#!/bin/bash

# 清理开发环境 (sirv)

echo "🧹 清理开发环境..."

# 清理PID文件中的进程
cleanup_pid_file() {
    local pid_file=$1
    local process_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file" 2>/dev/null)
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            echo "终止 $process_name (PID: $pid)..."
            kill "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
        fi
        rm -f "$pid_file"
    fi
}

cleanup_pid_file ".rolldown.pid" "Rolldown"
cleanup_pid_file ".serve.pid" "Sirv"

# 快速清理可能的孤立进程
pkill -f "sirv.*3000" 2>/dev/null || true
pkill -f "rolldown.*watch" 2>/dev/null || true

echo "✅ 清理完成!"
