#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 设置开发环境...\n');

// 检测操作系统
const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

console.log(`📱 检测到操作系统: ${process.platform}`);

// 检查 Node.js 版本
const nodeVersion = process.version;
const requiredNodeVersion = '18.0.0';
console.log(`📦 Node.js 版本: ${nodeVersion}`);

// 检查包管理器
let packageManager = 'npm';
if (fs.existsSync('pnpm-lock.yaml')) {
  packageManager = 'pnpm';
} else if (fs.existsSync('yarn.lock')) {
  packageManager = 'yarn';
}

console.log(`📋 使用包管理器: ${packageManager}`);

// 检查环境变量文件
const envLocalPath = '.env.local';
if (!fs.existsSync(envLocalPath)) {
  console.log('📝 创建 .env.local 文件...');
  if (fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', envLocalPath);
    console.log('✅ 已从 .env.example 复制环境变量文件');
  }
}

// 安装依赖
console.log('\n📦 安装依赖...');
try {
  execSync(`${packageManager} install`, { stdio: 'inherit' });
  console.log('✅ 依赖安装完成');
} catch (error) {
  console.error('❌ 依赖安装失败:', error.message);
  process.exit(1);
}

// 平台特定配置
if (isWindows) {
  console.log('\n🪟 Windows 平台配置...');
  // Windows 特定配置
} else if (isMac) {
  console.log('\n🍎 macOS 平台配置...');
  // macOS 特定配置
} else if (isLinux) {
  console.log('\n🐧 Linux 平台配置...');
  // Linux 特定配置
}

console.log('\n✨ 环境设置完成！');
console.log('\n🎯 下一步:');
console.log(`   ${packageManager} run dev    # 启动开发服务器`);
console.log(`   ${packageManager} run build  # 构建生产版本`);
console.log(`   ${packageManager} run start  # 启动生产服务器`);