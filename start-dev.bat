@echo off
chcp 65001 >nul
title YTM Converter (Dev Mode)
color 0B

echo Đang khởi động chế độ phát triển (Development Mode)...
start "" "http://localhost:3000"
call npm.cmd run dev -- -p 3000
pause
