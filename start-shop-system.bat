@echo off
title Hari Om Traders - Shop Operations System
echo ========================================================
echo Starting Hari Om Traders Integrated Shop Management System
echo ========================================================

cd /d D:\hariom-traders\server
start "Hari Om Traders Backend Service" cmd /k "node index.js"

timeout /t 2 /nobreak > nul

cd /d D:\hariom-traders\client
start "Hari Om Traders Web App" cmd /k "npm run dev"

echo.
echo System Started Successfully!
echo Counter / Desktop Access: http://localhost:3000
echo Mobile Phone (Wi-Fi) Access: Run 'ipconfig' to check your local IP or check the client console.
echo ========================================================
pause
