@echo off
echo ================================================================
echo Starting Python HTTP Server
echo ================================================================
echo.
echo Opening at: http://localhost:8000
echo.
echo To stop the server, press CTRL+C
echo.

where py >nul 2>nul
if not errorlevel 1 (
	py -3 -m http.server 8000
) else (
	python -m http.server 8000
)

pause
