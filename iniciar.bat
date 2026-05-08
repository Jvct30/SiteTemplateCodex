@echo off
title Lunart - Inicializador
echo =========================================
echo   Iniciando Lunart - Ambiente de Desenv.
echo =========================================
echo.

echo [1] Iniciando Backend (FastAPI)...
start "Lunart Backend" cmd /k "cd backend && poetry run python run.py"

echo [2] Iniciando Frontend (Next.js)...
start "Lunart Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================
echo  Servidores iniciados em novas janelas!
echo  Frontend: http://localhost:3000
echo  Backend: http://localhost:8000
echo =========================================
pause
