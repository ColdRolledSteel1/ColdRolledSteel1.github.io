@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

set "PY="
if exist "%USERPROFILE%\.workbuddy\binaries\python\envs\default\Scripts\python.exe" (
  set "PY=%USERPROFILE%\.workbuddy\binaries\python\envs\default\Scripts\python.exe"
)
if not defined PY set "PY=python"

echo 正在构建静态站点到 site\ ...
echo.

"%PY%" -m mkdocs build --clean
if errorlevel 1 (
  echo.
  echo [提示] 构建失败。若提示 No module named mkdocs，请先执行：
  echo        pip install -r requirements.txt
  pause
  exit /b 1
)

echo.
echo 构建完成。site\ 目录可直接上传到任意静态托管
echo （GitHub Pages / Netlify / Vercel / 自己的服务器）。
pause
