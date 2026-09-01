@echo off
setlocal
cd /d "%~dp0"

title YTM MV to Album Converter
color 0A

echo ===================================================
echo       YTM MV TO ALBUM / SONG CONVERTER
echo ===================================================
echo.

echo [1/3] Kiem tra Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [LOI] May tinh chua cai dat Node.js.
    echo Vui long tai va cai dat Node.js tu: https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [2/3] Dang cai dat thu vien npm...
    call npm.cmd install
)

if not exist ".next\BUILD_ID" (
    echo [2/3] Dang build ung dung Next.js...
    call npm.cmd run build
)

echo [3/3] Dang mo trinh duyet tai http://localhost:3000 ...
start "" "http://localhost:3000"

echo.
echo ===================================================
echo   Ung dung dang chay tai: http://localhost:3000
echo   De dung may chu, nhan to hop phim Ctrl + C
echo ===================================================
echo.

call npm.cmd run start -- -p 3000

if %errorlevel% neq 0 (
    echo.
    echo [Thong bao] Dang chuyen sang che do Dev Mode...
    call npm.cmd run dev -- -p 3000
)

pause
