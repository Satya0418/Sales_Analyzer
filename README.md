# BizAnalystics - Sales Analyzer

A full-stack web analytics platform built with **Django** (backend + page serving) and **vanilla JS + Chart.js** (frontend). Features JWT authentication, a Blinkit grocery dataset dashboard with 7 interactive charts, and three separate pages: Landing, Login, and Dashboard.

---

## Project Structure

```
Sales_Analyzer/
|-- index.html              # Legacy (unused after Django refactor)
|-- script.js               # Legacy (unused after Django refactor)
|-- styles.css              # Legacy (unused after Django refactor)
|-- .gitignore
|-- README.md
`-- backend/
    |-- manage.py
    |-- requirements.txt
    |-- setup.bat           # One-click full setup (Windows)
    |-- start_server.bat    # One-click server start (Windows)
    |-- db.sqlite3          # Auto-created after migrations
    |-- .env                # YOU MUST CREATE THIS (see Step 3)
    |-- .env.example        # Template for .env
    |-- bizanalytics/       # Django project config
    |-- users/              # Auth app (register, login, JWT)
    |-- pages/              # Page-serving app (landing, login, dashboard)
    |-- templates/          # Django HTML templates
    `-- static/             # CSS and JS served by Django
```

---

## Prerequisites

| Tool   | Version        | Check               |
|--------|----------------|---------------------|
| Python | 3.10 or higher | `python --version`  |
| pip    | latest         | `pip --version`     |

> No Node.js, no npm, no Docker required.

---

## First-Time Setup (Step by Step)

### Step 1 - Clone or download the project

```bash
git clone https://github.com/shaniyadav24/Sales_Analyzer.git
cd Sales_Analyzer
```

Or if you already have the folder, just open a terminal inside `D:\Sales_Analyzer`.

---

### Step 2 - Create a virtual environment (recommended)

```bash
# Windows - PowerShell
python -m venv venv
venv\Scripts\activate

# Windows - Command Prompt
python -m venv venv
venv\Scripts\activate.bat
```

You should see `(venv)` appear at the start of your terminal prompt.

---

### Step 3 - Create the .env file

Navigate into the backend folder and create `.env` from the example template:

```bash
cd backend
copy .env.example .env
```

Then open `.env` in any text editor and set your values:

```
SECRET_KEY=your-very-long-random-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

SUPERUSER_EMAIL=admin@bizanalytics.com
SUPERUSER_PASSWORD=Admin@123
SUPERUSER_FIRST_NAME=Admin
SUPERUSER_LAST_NAME=User
```

> **How to generate a real SECRET_KEY (run in terminal):**
> ```bash
> python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
> ```
> Copy the printed value and paste it as your `SECRET_KEY`.

---

### Step 4 - Install Python dependencies

Make sure you are inside the `backend/` folder with the virtualenv activated:

```bash
# If you are not already in backend/
cd backend

pip install -r requirements.txt
```

Packages that will be installed:
- Django 5.0.4
- djangorestframework 3.15.1
- djangorestframework-simplejwt 5.3.1
- django-cors-headers 4.3.1
- python-decouple 3.8
- Pillow 11.0.0

---

### Step 5 - Run database migrations

```bash
python manage.py migrate
```

This creates `db.sqlite3` and sets up all tables (users, JWT token blacklist, etc.).

---

### Step 6 - Create the default superuser

```bash
python manage.py create_default_superuser
```

This creates an admin account using the credentials from your `.env` file.

Default credentials (using the example .env values):
- **Email:** `admin@bizanalytics.com`
- **Password:** `Admin@123`

---

### Step 7 - Collect static files

```bash
python manage.py collectstatic --noinput
```

This copies all CSS and JS files from `backend/static/` into `backend/staticfiles/` so Django can serve them.

---

### Step 8 - Verify configuration

```bash
python manage.py check
```

Expected output: `System check identified no issues (0 silenced).`

---

### Step 9 - Start the development server

```bash
python manage.py runserver 8000
```

Expected output:

```
System check identified no issues (0 silenced).
Django version 5.0.4, using settings 'bizanalytics.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

---

## Accessing the App

Open your browser and go to:

| URL                               | Page                              |
|-----------------------------------|-----------------------------------|
| http://127.0.0.1:8000/            | Landing page                      |
| http://127.0.0.1:8000/login/      | Login / Register                  |
| http://127.0.0.1:8000/dashboard/  | Analytics Dashboard (login first) |
| http://127.0.0.1:8000/admin/      | Django Admin Panel                |

**User flow:** Landing --> Login --> Dashboard --> Logout --> Landing

---

## One-Click Setup (Windows only)

If you prefer not to run commands manually, use the provided batch files:

| File | What it does |
|------|-------------|
| `backend\setup.bat` | Installs deps, runs migrations, creates superuser, collects static |
| `backend\start_server.bat` | Starts the server on port 8000 |

Double-click `setup.bat` first (only needed once), then `start_server.bat` each time you want to run the app.

---

## Stopping the Server

Press `Ctrl + C` in the terminal where the server is running.

If the server is stuck, force-kill all Python processes (PowerShell):

```powershell
Get-Process -Name python | Stop-Process -Force
```

---

## API Endpoints

All API routes are under `/api/users/`:

| Method | Endpoint                        | Description               |
|--------|---------------------------------|---------------------------|
| POST   | `/api/users/register/`          | Create new account        |
| POST   | `/api/users/login/`             | Login, returns JWT tokens |
| POST   | `/api/users/logout/`            | Blacklist refresh token   |
| POST   | `/api/users/token/refresh/`     | Get new access token      |
| GET    | `/api/users/profile/`           | Get logged-in user info   |
| PUT    | `/api/users/change-password/`   | Change password           |

Example login request (PowerShell):

```powershell
$body = '{"email":"admin@bizanalytics.com","password":"Admin@123"}'
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/users/login/" -Method POST -Body $body -ContentType "application/json"
```

---

## Everyday Development Commands

```bash
# 1. Open terminal in Sales_Analyzer folder
# 2. Activate virtualenv
venv\Scripts\activate

# 3. Go to backend
cd backend

# 4. Start server
python manage.py runserver 8000

# --- Other useful commands ---

# Stop server
Ctrl + C

# Create new migrations after editing models.py
python manage.py makemigrations

# Apply pending migrations
python manage.py migrate

# Open Django interactive shell
python manage.py shell

# Check for configuration errors
python manage.py check

# Collect static files again (after adding/editing CSS or JS)
python manage.py collectstatic --noinput
```

---

## Common Errors and Fixes

| Error Message | Cause | Fix |
|---------------|-------|-----|
| `No module named 'decouple'` | Dependencies not installed | `pip install -r requirements.txt` |
| `SECRET_KEY not set` or `ImproperlyConfigured` | Missing/empty `.env` | Complete Step 3 |
| `OperationalError: no such table` | Migrations not applied | `python manage.py migrate` |
| `Address already in use` / `Port 8000 in use` | Old server still running | `Get-Process python | Stop-Process -Force` |
| `TemplateDoesNotExist` | Static files not collected | `python manage.py collectstatic --noinput` |
| `403 Forbidden` on API calls | Missing or expired JWT token | Log in again at `/login/` |
| `CORS error` in browser console | Wrong origin or CORS not configured | Ensure you access via `http://127.0.0.1:8000`, not a file |

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Python 3, Django 5.0.4            |
| REST API  | Django REST Framework + SimpleJWT |
| Database  | SQLite (development)              |
| Frontend  | Vanilla HTML, CSS, JavaScript     |
| Charts    | Chart.js 4.4.2 (via CDN)          |
| Auth      | JWT tokens stored in localStorage |
| Config    | python-decouple (.env file)       |
| CORS      | django-cors-headers               |

---

## Default Login Credentials

```
Email:    admin@bizanalytics.com
Password: Admin@123
```

> Change these in `backend/.env` before deploying to production.
