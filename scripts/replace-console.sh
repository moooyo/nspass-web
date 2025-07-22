#!/bin/bash

# 批量替换 console.log 为 logger 调用的脚本
# 该脚本将替换项目中所有的 console 调用

echo "开始批量替换 console 调用..."

# 定义文件列表
files=(
    "src/components/MSWProvider.tsx"
    "src/components/EnvInitializer.tsx"
    "src/components/hooks/useAuth.ts"
    "src/components/hooks/useApiOnce.ts"
    "src/components/MainLayoutFixed.tsx" 
    "src/components/SimpleMainLayout.tsx"
    "src/components/content/RoutesSummary.tsx"
    "src/components/content/LeafletWrapper.tsx"
    "src/components/MainLayout.tsx"
    "src/login/LoginPageFixed.tsx"
    "src/services/auth.ts"
    "src/services/base.ts"
    "src/services/index.ts"
    "src/services/dnsConfig.ts"
    "src/services/userGroups.ts"
    "src/hooks/useApiErrorHandler.ts"
    "src/utils/performance.ts"
    "src/index.js"
)

# 对每个文件进行处理
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "处理文件: $file"
        
        # 检查是否已经导入 logger
        if ! grep -q "import.*logger" "$file"; then
            # 添加 logger 导入
            if [[ $file == *.ts ]] || [[ $file == *.tsx ]]; then
                # TypeScript 文件
                sed -i '1i import { logger, createLogger } from "@/utils/logger";' "$file"
            fi
        fi
        
        # 替换 console 调用
        sed -i 's/console\.log(/logger.debug(/g' "$file"
        sed -i 's/console\.info(/logger.info(/g' "$file" 
        sed -i 's/console\.warn(/logger.warn(/g' "$file"
        sed -i 's/console\.error(/logger.error(/g' "$file"
        
        echo "✅ 已处理: $file"
    else
        echo "⚠️ 文件不存在: $file"
    fi
done

echo "批量替换完成！"
