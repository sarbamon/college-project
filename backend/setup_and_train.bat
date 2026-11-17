@echo off
echo ========================================================
echo   EEG Sleep AI - Backend Environment & Model Training
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Python 3.11+ ...
python --version
if errorlevel 1 (
    echo Python was not found in PATH. Please ensure Python 3.11+ is installed.
    pause
    exit /b 1
)

echo.
echo [2/4] Creating virtual environment (venv) ...
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate

echo.
echo [3/4] Installing required dependencies ...
pip install -r requirements.txt

echo.
echo [4/4] Training Random Forest Sleep-EDF Baseline Classifier ...
python train_model.py

echo.
echo ========================================================
echo Backend environment ready and model trained!
echo Model artifact: backend\models\sleep_stage_model.pkl
echo ========================================================
pause

