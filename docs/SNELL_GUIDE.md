# Snell 协议配置指南

## 📖 协议简介

[Snell](https://manual.nssurge.com/others/snell.html) 是由 Surge 团队开发的轻量级高性能加密代理协议。

### 🚀 核心特性

- **极致性能** - 专为高性能设计的加密代理协议
- **UDP 支持** - 支持 UDP over TCP 中继
- **零依赖** - 单个二进制文件，除 glibc 外无其他依赖
- **简单部署** - 内置向导帮助快速启动
- **错误报告** - 代理服务器会向客户端报告远程错误

## 🔧 配置参数

在 NSPass Web 中配置 Snell 出口时，需要提供以下参数：

| 参数 | 说明 | 示例 | 必填 |
|------|------|------|------|
| **服务器地址** | Snell 服务器的 IP 地址或域名 | `1.2.3.4` 或 `snell.example.com` | ✅ |
| **端口** | Snell 服务器监听端口 | `6333` | ✅ |
| **PSK** | 预共享密钥，用于加密通信 | `RANDOM_KEY_HERE` | ✅ |
| **版本** | 协议版本，v4为稳定版，v5为最新版 | `4` 或 `5` | ✅ |

## 🛠️ 服务器部署

### 下载服务器

根据您的服务器架构下载对应版本：

```bash
# Linux AMD64
wget https://dl.nssurge.com/snell/snell-server-v4.1.1-linux-amd64.zip

# Linux ARM64
wget https://dl.nssurge.com/snell/snell-server-v4.1.1-linux-aarch64.zip

# Linux ARM v7
wget https://dl.nssurge.com/snell/snell-server-v4.1.1-linux-armv7l.zip

# Linux i386
wget https://dl.nssurge.com/snell/snell-server-v4.1.1-linux-i386.zip
```

### 解压和配置

```bash
# 解压服务器
unzip snell-server-v4.1.1-linux-amd64.zip

# 移动到系统目录
sudo mv snell-server /usr/local/bin/

# 赋予执行权限
sudo chmod +x /usr/local/bin/snell-server
```

### 生成配置文件

```bash
# 创建配置目录
sudo mkdir -p /etc/snell

# 生成随机PSK密钥
PSK=$(openssl rand -base64 32)
echo "Generated PSK: $PSK"

# 创建配置文件
sudo tee /etc/snell/snell-server.conf << EOF
[snell-server]
listen = 0.0.0.0:6333
psk = $PSK
ipv6 = false
EOF
```

### 创建系统服务

```bash
# 创建systemd服务文件
sudo tee /etc/systemd/system/snell.service << EOF
[Unit]
Description=Snell Proxy Server
After=network.target

[Service]
Type=simple
User=nobody
Group=nogroup
LimitNOFILE=32768
ExecStart=/usr/local/bin/snell-server -c /etc/snell/snell-server.conf
AmbientCapabilities=CAP_NET_BIND_SERVICE
StandardOutput=journal
StandardError=journal
SyslogIdentifier=snell-server

[Install]
WantedBy=multi-user.target
EOF

# 重载systemd并启动服务
sudo systemctl daemon-reload
sudo systemctl enable snell
sudo systemctl start snell

# 检查服务状态
sudo systemctl status snell
```

## 🔒 安全配置

### 防火墙设置

```bash
# 允许 Snell 端口（示例使用6333端口）
sudo ufw allow 6333/tcp
sudo ufw reload
```

### PSK 密钥管理

#### 在 NSPass Web 中生成（推荐）

在配置界面中，PSK 输入框旁边有一个 ⚡ 按钮，点击即可自动生成 100-128 位（随机长度）安全随机密钥。每次生成的密钥长度都不相同，增强安全性。

#### 命令行生成

```bash
# 生成强随机密钥
openssl rand -base64 32

# 生成100-128位随机长度密钥
LENGTH=$((100 + RANDOM % 29)); cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w $LENGTH | head -n 1

# Python 生成100-128位随机长度密钥
python3 -c "import secrets, string, random; length=random.randint(100,128); print(''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(length)))"
```

## 📋 NSPass Web 配置示例

在 NSPass Web 的出口配置中：

1. **选择出口模式**: `Snell Surge`
2. **服务器地址**: `your-server-ip` (如: `1.2.3.4`)
3. **端口**: `6333` (或您配置的端口)
4. **PSK**: 您生成的预共享密钥 (可点击⚡按钮自动生成100-128位随机密钥)
5. **协议版本**: `4` (稳定版) 或 `5` (最新版)

配置完成后，系统会生成如下格式的配置：

```
# v4 协议示例
Snell v4: 1.2.3.4:6333

# v5 协议示例  
Snell v5: 2.3.4.5:8443
```

## 🚨 故障排除

### 常见问题

1. **连接超时**
   ```bash
   # 检查服务状态
   sudo systemctl status snell
   
   # 检查端口监听
   sudo netstat -tlnp | grep 6333
   
   # 检查防火墙
   sudo ufw status
   ```

2. **认证失败**
   - 检查 PSK 密钥是否一致
   - 确认协议版本匹配

3. **性能问题**
   ```bash
   # 检查服务器资源
   htop
   
   # 检查网络连接
   iftop
   ```

### 日志查看

```bash
# 查看服务日志
sudo journalctl -u snell -f

# 查看最近的错误
sudo journalctl -u snell --since "1 hour ago" -p err
```

## 🔄 升级维护

### 升级服务器

```bash
# 停止服务
sudo systemctl stop snell

# 下载新版本
wget https://dl.nssurge.com/snell/snell-server-v4.1.1-linux-amd64.zip

# 替换二进制文件
sudo unzip -o snell-server-v4.1.1-linux-amd64.zip -d /usr/local/bin/
sudo chmod +x /usr/local/bin/snell-server

# 重启服务
sudo systemctl start snell
```

### 配置备份

```bash
# 备份配置
sudo cp /etc/snell/snell-server.conf /etc/snell/snell-server.conf.bak

# 备份PSK密钥
grep "psk" /etc/snell/snell-server.conf > ~/snell-psk-backup.txt
```

## 📚 参考资料

- [Snell Protocol 官方文档](https://manual.nssurge.com/others/snell.html)
- [Surge 官方网站](https://nssurge.com/)
- [下载页面](https://dl.nssurge.com/snell/)

## ⚠️ 重要说明

> **注意**: Snell 协议专为 Surge 用户设计。请不要逆向分析协议或制作兼容客户端。团队希望保持较小的用户群体，感谢您的理解。

---

**最后更新**: 2024年最新版本 (Snell v4.1.1) 