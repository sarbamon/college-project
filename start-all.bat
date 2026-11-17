@echo off
echo ========================================================
echo        EEG Sleep AI - Full Stack Platform Launcher
echo ========================================================
echo.

echo Starting FastAPI Backend on http://localhost:8000 ...
start "EEG Sleep AI - FastAPI Backend" cmd /k "cd backend && if exist venv\Scripts\activate (call venv\Scripts\activate) && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Next.js Frontend on http://localhost:3000 ...
start "EEG Sleep AI - Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers have been launched in separate terminal windows:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo ========================================================
pause

