#!/usr/bin/env pwsh
# YouthLoop 项目启动脚本
# 用法: .\start-all.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  YouthLoop 项目启动脚本" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 检查 PostgreSQL 服务
Write-Host "[1/5] 检查 PostgreSQL 服务..." -ForegroundColor Yellow
$pgService = Get-Service postgresql* -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq 'Running') {
    Write-Host "✓ PostgreSQL 服务正在运行" -ForegroundColor Green
} else {
    Write-Host "✗ PostgreSQL 服务未运行，请先启动 PostgreSQL" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/5] 检查前端依赖..." -ForegroundColor Yellow
if (Test-Path "apps/web/node_modules") {
    Write-Host "✓ 前端依赖已安装" -ForegroundColor Green
} else {
    Write-Host "⚠ 前端依赖未安装，正在安装..." -ForegroundColor Yellow
    Set-Location apps/web
    pnpm install
    Set-Location ../..
    Write-Host "✓ 前端依赖安装完成" -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/5] 准备启动服务..." -ForegroundColor Yellow
Write-Host "将在新窗口中启动以下服务：" -ForegroundColor White
Write-Host "  - Social API (端口 8080)" -ForegroundColor White
Write-Host "  - Game API (端口 8082)" -ForegroundColor White
Write-Host "  - Social Worker (后台任务)" -ForegroundColor White
Write-Host "  - Web 前端 (端口 8000)" -ForegroundColor White
Write-Host ""

# 启动 Social API
Write-Host "[4/5] 启动 Social API..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PWD/apps/social-api'; Write-Host '启动 Social API (端口 8080)...' -ForegroundColor Cyan; mvn spring-boot:run"
Start-Sleep -Seconds 2

# 启动 Game API
Write-Host "启动 Game API..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PWD/apps/game-api'; Write-Host '启动 Game API (端口 8082)...' -ForegroundColor Cyan; mvn spring-boot:run"
Start-Sleep -Seconds 2

# 启动 Social Worker
Write-Host "启动 Social Worker..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PWD/apps/social-worker'; Write-Host '启动 Social Worker...' -ForegroundColor Cyan; mvn spring-boot:run"
Start-Sleep -Seconds 2

# 启动前端
Write-Host "启动 Web 前端..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PWD/apps/web'; Write-Host '启动 Web 前端 (端口 8000)...' -ForegroundColor Cyan; pnpm dev"

Write-Host ""
Write-Host "[5/5] 所有服务启动命令已执行！" -ForegroundColor Green
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  服务启动中，请等待..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "预计启动时间：20-30 秒" -ForegroundColor White
Write-Host ""
Write-Host "服务地址：" -ForegroundColor White
Write-Host "  - Social API: http://localhost:8080" -ForegroundColor White
Write-Host "  - Game API:   http://localhost:8082" -ForegroundColor White
Write-Host "  - Web 前端:   http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "提示：" -ForegroundColor Yellow
Write-Host "  - 每个服务在独立的窗口中运行" -ForegroundColor White
Write-Host "  - 按 Ctrl+C 可停止对应服务" -ForegroundColor White
Write-Host "  - 关闭窗口也会停止服务" -ForegroundColor White
Write-Host ""
