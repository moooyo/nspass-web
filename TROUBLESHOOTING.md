# 故障排除指南

## Webpack 缓存错误

### 问题描述

启动项目时出现类似以下错误：

```
[webpack.cache.PackFileCacheStrategy] Caching failed for pack: Error: invalid stored block lengths
```

### 问题原因

这种错误通常由以下原因导致：

1. **Webpack 缓存损坏** - 缓存文件在某个时刻被损坏
2. **Next.js 缓存问题** - `.next` 目录缓存不一致
3. **依赖更新后缓存不匹配** - 更新依赖或切换分支后缓存与代码不匹配
4. **磁盘空间不足** - 缓存写入过程中磁盘空间不足导致文件损坏
5. **异常退出** - 开发服务器异常退出导致缓存文件不完整

### 解决方案

#### 方案一：快速清理缓存（推荐）

使用项目内置的清理脚本：

```bash
# 清理所有缓存文件
npm run clean

# 如果问题依然存在，使用完全清理
npm run clean:all
```

#### 方案二：手动清理

如果脚本无法解决问题，可以手动执行以下步骤：

```bash
# 1. 停止开发服务器
# 按 Ctrl+C 停止正在运行的服务器

# 2. 删除 Next.js 缓存
rm -rf .next

# 3. 删除 Node.js 模块缓存
rm -rf node_modules/.cache

# 4. 清理 npm 缓存
npm cache clean --force

# 5. 删除 Turbo 缓存（如果存在）
rm -rf .turbo

# 6. 重新启动开发服务器
npm run dev
```

#### 方案三：完全重装（终极解决方案）

如果上述方法都无法解决问题：

```bash
# 1. 完全清理项目
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json

# 2. 清理 npm 缓存
npm cache clean --force

# 3. 重新安装依赖
npm install

# 4. 启动项目
npm run dev
```

### 预防措施

为了避免类似问题再次发生：

1. **定期清理缓存**
   ```bash
   # 每周或在遇到奇怪问题时运行
   npm run clean
   ```

2. **正确退出开发服务器**
   - 使用 `Ctrl+C` 正常退出，不要强制杀死进程

3. **磁盘空间管理**
   - 确保有足够的磁盘空间（建议至少保留 1GB 空间）

4. **依赖更新后清理**
   ```bash
   # 更新依赖后运行
   npm update && npm run clean
   ```

5. **切换分支后清理**
   ```bash
   # 切换到不同分支后运行
   git checkout <branch> && npm run clean
   ```

### 脚本说明

项目中新增了两个清理脚本：

- **`npm run clean`** - 清理缓存文件（保留 node_modules）
- **`npm run clean:all`** - 完全清理并重新安装依赖

### 其他常见问题

#### 端口占用

如果遇到端口占用问题：

```bash
# 查找占用端口的进程
lsof -ti:3000

# 杀死占用端口的进程
kill $(lsof -ti:3000)

# 或者使用不同端口
npm run dev -- -p 3001
```

#### 权限问题

如果遇到权限问题：

```bash
# 修复 npm 权限
sudo chown -R $(whoami) ~/.npm

# 或者使用 sudo 清理缓存
sudo npm cache clean --force
```

### 联系支持

如果问题仍然存在，请提供以下信息：

1. 操作系统版本
2. Node.js 版本 (`node --version`)
3. npm 版本 (`npm --version`)
4. 完整的错误信息
5. 执行的清理步骤

---

**最后更新**: 2024年最新版本 