@echo off
chcp 65001 >nul
echo ========================================================
echo 台灣薪資背離與人口死亡交叉戰情室 - GitHub 一鍵部署腳本
echo ========================================================
git add .
git commit -m "Update dashboard"
git push -u origin main
echo.
echo [完成] 已推送至 https://github.com/goldmund517-cpu/Taiwan_Living_Paradox_Dashboard
echo 線上戰情室網址: https://goldmund517-cpu.github.io/Taiwan_Living_Paradox_Dashboard/dashboard/index.html
pause
