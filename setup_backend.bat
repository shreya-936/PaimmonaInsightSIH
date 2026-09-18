@echo off
cd /d "%~dp0backend"
python -m venv .venv
call .venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
echo.
echo Backend setup complete.
echo Run: uvicorn app.main:app --reload
pause
