#!/usr/bin/env pwsh
# YouthLoop 项目停止脚本
# 用法: .\stop-all.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  YouthLoop 项目停止脚本" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "正在查找并停止服务..." -ForegroundColor Yellow
Write-Host ""

# 停止占用 8080 端口的进程 (Social API)
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) {
    $pid = $port8080.OwningProcess
    Write-Host "停止 Social API (PID: $pid, 端口 8080)..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Social API 已停止" -ForegroundColor Green
} else {
    Write-Host "○ Social API 未运行" -ForegroundColor Gray
}

# 停止占用 8082 端口的进程 (Game API)
$port8082 = Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue
if ($port8082) {
    $pid = $port8082.OwningProcess
    Write-Host "停止 Game API (PID: $pid, 端口 8082)..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Game API 已停止" -ForegroundColor Green
} else {
    Write-Host "○ Game API 未运行" -ForegroundColor Gray
}

# 停止占用 8000 端口的进程 (Web 前端)
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    $pid = $port8000.OwningProcess
    Write-Host "停止 Web 前端 (PID: $pid, 端口 8000)..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Web 前端已停止" -ForegroundColor Green
} else {
    Write-Host "○ Web 前端未运行" -ForegroundColor Gray
}

# 停止所有 Maven 进程 (Social Worker 和其他可能的 Maven 进程)
$mavenProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*maven*" -or $_.CommandLine -like "*spring-boot*"
}
if ($mavenProcesses) {
    Write-Host "停止 Maven/Java 进程..." -ForegroundColor Yellow
    $mavenProcesses | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✓ Maven/Java 进程已停止" -ForegroundColor Green
} else {
    Write-Host "○ 没有运行中的 Maven/Java 进程" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  所有服务已停止" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
