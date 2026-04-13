@echo off
echo ================================================================
echo Starting Python HTTP Server
echo ================================================================
echo.
echo Opening at: http://localhost:8000
echo.
echo To stop the server, press CTRL+C
echo.
python -m http.server 8000
pause
