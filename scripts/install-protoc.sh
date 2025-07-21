#!/bin/bash

# 检查是否已经安装 protoc
if command -v protoc &> /dev/null; then
    echo "protoc is already installed"
    protoc --version
    exit 0
fi

echo "Installing protoc..."

# 创建临时目录
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

# 下载 protoc
PROTOC_VERSION="25.1"
PROTOC_ZIP="protoc-${PROTOC_VERSION}-linux-x86_64.zip"
PROTOC_URL="https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/${PROTOC_ZIP}"

echo "Downloading protoc from $PROTOC_URL"
curl -LO $PROTOC_URL

# 解压到临时目录
unzip $PROTOC_ZIP

# 将 protoc 和 include 目录复制到 /usr/local （如果有权限）或者当前项目的 node_modules/.bin
if [ -w "/usr/local/bin" ]; then
    cp bin/protoc /usr/local/bin/
    cp -r include /usr/local/
    echo "protoc installed to /usr/local/bin/protoc"
else
    # 复制到项目的 node_modules/.bin 目录
    mkdir -p "${OLDPWD}/node_modules/.bin"
    cp bin/protoc "${OLDPWD}/node_modules/.bin/"
    cp -r include "${OLDPWD}/node_modules/.bin/"
    echo "protoc installed to node_modules/.bin/protoc"
fi

# 清理
cd $OLDPWD
rm -rf $TEMP_DIR

echo "protoc installation completed"
protoc --version || echo "protoc not found in PATH, but should be available in node_modules/.bin/"
