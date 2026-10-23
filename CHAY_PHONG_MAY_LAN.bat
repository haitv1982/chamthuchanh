@echo off
chcp 65001 >nul
title HE THONG CHAM THUC HANH TIN HOC - PHONG MAY THCS
color 0A

echo =========================================================================
echo       HỆ THỐNG CHẤM ĐIỂM THỰC HÀNH TIN HỌC PHÒNG MÁY LABGRADE AI
echo =========================================================================
echo.
echo [1/3] Đang kiểm tra môi trường Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LỖI] Máy tính chưa cài đặt Node.js!
    echo Vui lòng tải và cài đặt Node.js tại: https://nodejs.org (chọn bản LTS)
    echo Sau khi cài xong, vui lòng khởi động lại file này.
    pause
    exit /b
)

if not exist node_modules (
    echo [2/3] Đang cài đặt thư viện phòng máy (chỉ chạy lần đầu tiên)...
    call npm install --legacy-peer-deps
) else (
    echo [2/3] Thư viện hệ thống đã sẵn sàng.
)

echo.
echo [3/3] ĐỊA CHỈ TRUY CẬP CHO HỌC SINH VÀ MÁY CHIẾU:
echo -------------------------------------------------------------------------
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    call :print_ip %%a
)
goto :start_server

:print_ip
set CLEAN_IP=%*
echo 👉 Cho học sinh vào link: http://%CLEAN_IP%:3000
exit /b

:start_server
echo -------------------------------------------------------------------------
echo 💡 Bấm Ctrl + C nếu muốn tắt hệ thống khi hết buổi dạy.
echo.
echo Đang khởi chạy máy chủ CSDL phòng thực hành (Port 3000)...
call npm start
pause
