#!/bin/bash

# 修复HTML文件中的script引用
# 这个脚本会找到构建后的main文件并更新HTML中的引用

set -e

OUT_DIR="out"
HTML_FILE="$OUT_DIR/index.html"

if [ ! -f "$HTML_FILE" ]; then
    echo "❌ HTML文件不存在: $HTML_FILE"
    exit 1
fi

# 找到main-*.js文件
MAIN_JS=$(ls $OUT_DIR/js/main-*.js 2>/dev/null | head -1)

if [ -z "$MAIN_JS" ]; then
    echo "❌ 没有找到main-*.js文件"
    exit 1
fi

# 找到CSS文件
MAIN_CSS=$(ls $OUT_DIR/main.css 2>/dev/null | head -1)
LEAFLET_CSS=$(ls $OUT_DIR/leaflet-*.css 2>/dev/null | head -1)

# 获取相对路径
MAIN_JS_REL=$(echo "$MAIN_JS" | sed "s|$OUT_DIR||")

echo "🔧 更新HTML文件..."
echo "  找到主文件: $MAIN_JS_REL"

# 使用sed替换script标签
sed -i 's|<script type="module" src="/src/main.tsx"></script>|<script type="module" src="'$MAIN_JS_REL'"></script>|g' "$HTML_FILE"

# 添加CSS链接（如果不存在的话）
if [ -n "$MAIN_CSS" ]; then
    MAIN_CSS_REL=$(echo "$MAIN_CSS" | sed "s|$OUT_DIR||")
    echo "  添加主CSS文件: $MAIN_CSS_REL"
    
    # 检查是否已经存在CSS链接
    if ! grep -q "main.css" "$HTML_FILE"; then
        # 在</head>之前插入CSS链接
        sed -i 's|</head>|  <link rel="stylesheet" href="'$MAIN_CSS_REL'">\n</head>|g' "$HTML_FILE"
    fi
fi

if [ -n "$LEAFLET_CSS" ]; then
    LEAFLET_CSS_REL=$(echo "$LEAFLET_CSS" | sed "s|$OUT_DIR||")
    echo "  添加Leaflet CSS文件: $LEAFLET_CSS_REL"
    
    # 检查是否已经存在Leaflet CSS链接
    if ! grep -q "leaflet.*\.css" "$HTML_FILE"; then
        # 在</head>之前插入CSS链接
        sed -i 's|</head>|  <link rel="stylesheet" href="'$LEAFLET_CSS_REL'">\n</head>|g' "$HTML_FILE"
    fi
fi

echo "✅ HTML文件更新完成!"
