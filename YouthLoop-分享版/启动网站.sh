#!/bin/bash

echo "🌱 YouthLoop 环保主题网站启动器"
echo ""
echo "正在启动本地服务器..."
echo "请稍等片刻..."
echo ""

# 检查Python3是否可用
if command -v python3 &> /dev/null; then
    echo "✅ 使用Python3启动服务器"
    echo "🌐 请在浏览器中访问：http://localhost:8000/主页.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ 使用Python启动服务器"
    echo "🌐 请在浏览器中访问：http://localhost:8000/主页.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    python -m http.server 8000
else
    echo "❌ 未找到Python，请安装Python后重试"
    echo ""
    echo "或者直接双击 '主页.html' 文件打开网站"
    echo ""
    read -p "按回车键退出..."
fi