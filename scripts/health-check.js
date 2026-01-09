#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 环境健康检查...\n');

const checks = [];

// 检查 Node.js 版本
try {
  const nodeVersion = process.version;
  const requiredVersion = '18.0.0';
  const current = nodeVersion.slice(1).split('.').map(Number);
  const required = requiredVersion.split('.').map(Number);
  
  const isVersionValid = current[0] > required[0] || 
    (current[0] === required[0] && current[1] >= required[1]);
  
  checks.push({
    name: 'Node.js 版本',
    status: isVersionValid ? 'pass' : 'fail',
    message: `当前版本: ${nodeVersion}, 要求: >= ${requiredVersion}`,
    critical: true
  });
} catch (error) {
  checks.push({
    name: 'Node.js',
    status: 'fail',
    message: 'Node.js 未安装',
    critical: true
  });
}

// 检查包管理器
let packageManager = 'npm';
try {
  if (fs.existsSync('pnpm-lock.yaml')) {
    execSync('pnpm --version', { stdio: 'ignore' });
    packageManager = 'pnpm';
  } else if (fs.existsSync('yarn.lock')) {
    execSync('yarn --version', { stdio: 'ignore' });
    packageManager = 'yarn';
  }
  
  checks.push({
    name: '包管理器',
    status: 'pass',
    message: `使用 ${packageManager}`,
    critical: false
  });
} catch (error) {
  checks.push({
    name: '包管理器',
    status: 'warn',
    message: `${packageManager} 可能未正确安装`,
    critical: false
  });
}

// 检查依赖
const nodeModulesExists = fs.existsSync('node_modules');
checks.push({
  name: '项目依赖',
  status: nodeModulesExists ? 'pass' : 'warn',
  message: nodeModulesExists ? '依赖已安装' : '需要运行 npm install',
  critical: false
});

// 检查环境变量文件
const envExists = fs.existsSync('.env.local');
checks.push({
  name: '环境变量',
  status: envExists ? 'pass' : 'warn',
  message: envExists ? '.env.local 文件存在' : '建议创建 .env.local 文件',
  critical: false
});

// 检查 Git
try {
  execSync('git --version', { stdio: 'ignore' });
  checks.push({
    name: 'Git',
    status: 'pass',
    message: 'Git 已安装',
    critical: false
  });
} catch (error) {
  checks.push({
    name: 'Git',
    status: 'warn',
    message: 'Git 未安装或不在 PATH 中',
    critical: false
  });
}

// 输出结果
let hasErrors = false;
let hasWarnings = false;

checks.forEach(check => {
  const icon = check.status === 'pass' ? '✅' : 
               check.status === 'warn' ? '⚠️' : '❌';
  
  console.log(`${icon} ${check.name}: ${check.message}`);
  
  if (check.status === 'fail' && check.critical) {
    hasErrors = true;
  } else if (check.status === 'warn' || (check.status === 'fail' && !check.critical)) {
    hasWarnings = true;
  }
});

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('❌ 发现关键问题，请先解决后再继续');
  console.log('📖 查看 SETUP_GUIDE.md 获取详细安装指南');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  发现一些警告，建议处理后再继续');
  console.log('🚀 可以尝试运行: npm run setup');
} else {
  console.log('🎉 环境检查通过！可以开始开发了');
  console.log('🚀 运行 npm run dev 启动开发服务器');
}

console.log('\n💡 提示: 运行 npm run setup 进行自动配置');