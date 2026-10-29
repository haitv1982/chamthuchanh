@echo off
title HE THONG CHAM THUC HANH TIN HOC - PHONG MAY THCS
color 0A
cd /d "%~dp0"

echo =========================================================================
echo       HE THONG CHAM DIEM THUC HANH TIN HOC PHONG MAY - LABGRADE AI
echo =========================================================================
echo.

echo [1/3] Kiem tra Node.js...
where node >nul 2>nul
if %errorlevel% equ 0 goto node_ok

if exist "C:\Program Files\nodejs\node.exe" (
    path C:\Program Files\nodejs;%PATH%
    goto node_ok
)
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    path C:\Program Files (x86)\nodejs;%PATH%
    goto node_ok
)

echo [LOI] May tinh chua cai dat Node.js!
echo.
echo Huong dan xu ly trong 1 phut:
echo 1. Vao trang web: https://nodejs.org
echo 2. Tai ban LTS (file cai dat co duoi .msi)
echo 3. Nhay dup vao file .msi vua tai, bam Next - Next - Install.
echo 4. Sau khi cai xong, mo lai file nay.
echo.
pause
exit /b

:node_ok
echo Node.js: DA SAN SANG!
call node -v
echo.

echo [2/3] Kiem tra thu vien he thong (node_modules)...
if not exist "node_modules\vite" goto do_install
if not exist "node_modules\tsx" goto do_install
if not exist "node_modules\express" goto do_install
goto modules_ok

:do_install
echo.
echo =========================================================================
echo [THONG BAO] He thong phat hien chua cai thu vien phong may (node_modules).
echo Dang tu dong cai dat thu vien (chi mat 1-2 phut, vui long cho)...
echo =========================================================================
echo.
call npm install
if %errorlevel% neq 0 (
    echo [CANH BAO] npm install gap loi nhe, dang thu cai lai voi --legacy-peer-deps...
    call npm install --legacy-peer-deps
)

:modules_ok
echo Thu vien: DA SAN SANG!
echo.

echo [3/3] DIA CHI TRUY CAP:
echo -------------------------------------------------------------------------
echo  * Tren may Giao vien: http://localhost:3000
echo.
echo  * Dia chi cho may hoc sinh va may chieu (IP mang LAN phong may):
ipconfig | findstr /i "IPv4"
echo -------------------------------------------------------------------------
echo (Hoc sinh mo trinh duyet go dia chi IP o tren them :3000)
echo Vi du neu IPv4 la 192.168.1.15 thi link la: http://192.168.1.15:3000
echo.
echo Dang khoi dong may chu... Vui long khong tat cua so nay trong tiet hoc!
echo -------------------------------------------------------------------------
call npx tsx server.ts

echo.
pause


