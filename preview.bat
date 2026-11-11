@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

rem 优先用本机已装好 MkDocs 的 Python，找不到就退回 PATH 里的 python
set "PY="
if exist "%USERPROFILE%\.workbuddy\binaries\python\envs\default\Scripts\python.exe" (
  set "PY=%USERPROFILE%\.workbuddy\binaries\python\envs\default\Scripts\python.exe"
)
if not defined PY set "PY=python"

rem 4 秒后自动用默认浏览器打开
start "" cmd /c "timeout /t 4 >nul & explorer http://127.0.0.1:8000/"

echo 正在启动本地预览，浏览器会自动打开 http://127.0.0.1:8000/
echo 改完 Markdown 或 CSS 会自动刷新。关闭本窗口即停止服务。
echo.

"%PY%" -m mkdocs serve -a 127.0.0.1:8000
if errorlevel 1 (
  echo.
  echo [提示] 启动失败。若提示 No module named mkdocs，请先执行：
  echo        pip install -r requirements.txt
  pause
)
