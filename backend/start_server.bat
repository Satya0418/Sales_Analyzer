@echo off
echo Starting BizAnalystics Django server...
cd /d "%~dp0"
python manage.py runserver 8000
pause
