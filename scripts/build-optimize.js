#!/usr/bin/env node

/**
 * 构建优化脚本
 * 分析构建产物，提供优化建议
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

// 文件大小阈值（字节）
const THRESHOLDS = {
  JS_WARNING: 500 * 1024,    // 500KB
  JS_ERROR: 1024 * 1024,     // 1MB
  CSS_WARNING: 100 * 1024,   // 100KB
  CSS_ERROR: 200 * 1024,     // 200KB
  IMAGE_WARNING: 500 * 1024, // 500KB
  IMAGE_ERROR: 1024 * 1024,  // 1MB
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (error) {
    return 0;
  }
}

function analyzeFiles() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ 构建目录不存在，请先运行构建命令');
    process.exit(1);
  }

  const results = {
    js: [],
    css: [],
    images: [],
    other: [],
    total: 0,
    warnings: [],
    errors: [],
  };

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
        continue;
      }
      
      const size = stat.size;
      const ext = path.extname(file).toLowerCase();
      const relativePath = path.relative(DIST_DIR, filePath);
      
      results.total += size;
      
      const fileInfo = {
        name: file,
        path: relativePath,
        size,
        sizeFormatted: formatBytes(size),
      };
      
      // 分类文件
      if (ext === '.js') {
        results.js.push(fileInfo);
        
        if (size > THRESHOLDS.JS_ERROR) {
          results.errors.push(`JS文件过大: ${relativePath} (${formatBytes(size)})`);
        } else if (size > THRESHOLDS.JS_WARNING) {
          results.warnings.push(`JS文件较大: ${relativePath} (${formatBytes(size)})`);
        }
      } else if (ext === '.css') {
        results.css.push(fileInfo);
        
        if (size > THRESHOLDS.CSS_ERROR) {
          results.errors.push(`CSS文件过大: ${relativePath} (${formatBytes(size)})`);
        } else if (size > THRESHOLDS.CSS_WARNING) {
          results.warnings.push(`CSS文件较大: ${relativePath} (${formatBytes(size)})`);
        }
      } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
        results.images.push(fileInfo);
        
        if (size > THRESHOLDS.IMAGE_ERROR) {
          results.errors.push(`图片文件过大: ${relativePath} (${formatBytes(size)})`);
        } else if (size > THRESHOLDS.IMAGE_WARNING) {
          results.warnings.push(`图片文件较大: ${relativePath} (${formatBytes(size)})`);
        }
      } else {
        results.other.push(fileInfo);
      }
    }
  }
  
  scanDirectory(DIST_DIR);
  
  // 排序（按大小降序）
  results.js.sort((a, b) => b.size - a.size);
  results.css.sort((a, b) => b.size - a.size);
  results.images.sort((a, b) => b.size - a.size);
  results.other.sort((a, b) => b.size - a.size);
  
  return results;
}

function generateReport(results) {
  console.log('\n📊 构建产物分析报告');
  console.log('='.repeat(50));
  
  // 总体统计
  console.log(`\n📈 总体统计:`);
  console.log(`总文件大小: ${formatBytes(results.total)}`);
  console.log(`JS文件数量: ${results.js.length}`);
  console.log(`CSS文件数量: ${results.css.length}`);
  console.log(`图片文件数量: ${results.images.length}`);
  console.log(`其他文件数量: ${results.other.length}`);
  
  // JS文件分析
  if (results.js.length > 0) {
    console.log(`\n📦 JavaScript 文件 (前5个最大的):`);
    results.js.slice(0, 5).forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name} - ${file.sizeFormatted}`);
    });
    
    const totalJSSize = results.js.reduce((sum, file) => sum + file.size, 0);
    console.log(`  总计: ${formatBytes(totalJSSize)}`);
  }
  
  // CSS文件分析
  if (results.css.length > 0) {
    console.log(`\n🎨 CSS 文件:`);
    results.css.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name} - ${file.sizeFormatted}`);
    });
    
    const totalCSSSize = results.css.reduce((sum, file) => sum + file.size, 0);
    console.log(`  总计: ${formatBytes(totalCSSSize)}`);
  }
  
  // 图片文件分析
  if (results.images.length > 0) {
    console.log(`\n🖼️  图片文件 (前5个最大的):`);
    results.images.slice(0, 5).forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name} - ${file.sizeFormatted}`);
    });
    
    const totalImageSize = results.images.reduce((sum, file) => sum + file.size, 0);
    console.log(`  总计: ${formatBytes(totalImageSize)}`);
  }
  
  // 警告和错误
  if (results.warnings.length > 0) {
    console.log(`\n⚠️  警告:`);
    results.warnings.forEach(warning => {
      console.log(`  - ${warning}`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log(`\n❌ 错误:`);
    results.errors.forEach(error => {
      console.log(`  - ${error}`);
    });
  }
  
  // 优化建议
  console.log(`\n💡 优化建议:`);
  
  const largeJSFiles = results.js.filter(file => file.size > THRESHOLDS.JS_WARNING);
  if (largeJSFiles.length > 0) {
    console.log(`  - 考虑对大型JS文件进行代码分割`);
    console.log(`  - 使用动态导入(import())延迟加载非关键代码`);
    console.log(`  - 检查是否有未使用的依赖项`);
  }
  
  const largeCSSFiles = results.css.filter(file => file.size > THRESHOLDS.CSS_WARNING);
  if (largeCSSFiles.length > 0) {
    console.log(`  - 考虑使用CSS代码分割`);
    console.log(`  - 移除未使用的CSS规则`);
    console.log(`  - 使用CSS压缩工具`);
  }
  
  const largeImages = results.images.filter(file => file.size > THRESHOLDS.IMAGE_WARNING);
  if (largeImages.length > 0) {
    console.log(`  - 优化图片大小和格式`);
    console.log(`  - 考虑使用WebP格式`);
    console.log(`  - 实现图片懒加载`);
  }
  
  if (results.total > 5 * 1024 * 1024) { // 5MB
    console.log(`  - 总体积较大，考虑启用gzip压缩`);
    console.log(`  - 使用CDN加速静态资源加载`);
  }
  
  console.log(`\n✅ 分析完成！`);
  
  // 返回状态码
  return results.errors.length > 0 ? 1 : 0;
}

function checkGzipSupport() {
  console.log('\n🗜️  检查Gzip压缩支持...');
  
  const jsFiles = fs.readdirSync(ASSETS_DIR).filter(file => file.endsWith('.js'));
  const cssFiles = fs.readdirSync(ASSETS_DIR).filter(file => file.endsWith('.css'));
  
  let gzipSavings = 0;
  let totalSize = 0;
  
  [...jsFiles, ...cssFiles].forEach(file => {
    const filePath = path.join(ASSETS_DIR, file);
    const size = getFileSize(filePath);
    totalSize += size;
    
    // 估算gzip压缩率（通常为70-80%）
    const estimatedGzipSize = size * 0.3;
    gzipSavings += size - estimatedGzipSize;
  });
  
  if (totalSize > 0) {
    console.log(`预估Gzip压缩可节省: ${formatBytes(gzipSavings)} (${((gzipSavings / totalSize) * 100).toFixed(1)}%)`);
  }
}

// 主函数
function main() {
  console.log('🔍 开始分析构建产物...');
  
  const results = analyzeFiles();
  const exitCode = generateReport(results);
  
  checkGzipSupport();
  
  process.exit(exitCode);
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
