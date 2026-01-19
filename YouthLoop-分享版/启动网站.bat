@echo off
echo 🌱 YouthLoop 环保主题网站启动器
echo.
echo 正在启动本地服务器...
echo 请稍等片刻...
echo.

REM 尝试使用Python3启动服务器
python -m http.server 8000 2>nul
if %errorlevel% neq 0 (
    REM 如果Python3失败，尝试Python2
    python -m SimpleHTTPServer 8000 2>nul
    if %errorlevel% neq 0 (
        echo ❌ 未找到Python，请安装Python后重试
        echo.
        echo 或者直接双击 "主页.html" 文件打开网站
        echo.
        pause
        exit /b 1
    )
)

echo ✅ 服务器启动成功！
echo 🌐 请在浏览器中访问：http://localhost:8000/主页.html
echo.
echo 按 Ctrl+C 停止服务器
pause