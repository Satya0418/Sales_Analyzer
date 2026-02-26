@echo off
echo ============================================================
echo  BizAnalystics Django Backend - Full Setup
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/4] Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] pip install failed. Make sure Python is on your PATH.
    pause
    exit /b 1
)

echo.
echo [2/4] Applying database migrations...
python manage.py migrate
if errorlevel 1 (
    echo [ERROR] Migration failed.
    pause
    exit /b 1
)

echo.
echo [3/4] Creating default superuser...
python manage.py create_default_superuser
if errorlevel 1 (
    echo [ERROR] Superuser creation failed.
    pause
    exit /b 1
)

echo.
echo [4/4] Collecting static files...
python manage.py collectstatic --noinput

echo.
echo ============================================================
echo  Setup complete!
echo  Run the server:   python manage.py runserver
echo  Admin panel:      http://127.0.0.1:8000/admin/
echo  Default login:    admin@bizanalytics.com / Admin@123
echo ============================================================
echo.
pause
