"""
setup_superuser.py
------------------
Run this script once after `python manage.py migrate` to create the
superuser account automatically without an interactive prompt.

Usage:
    python setup_superuser.py

Or set your own values via environment variables / .env:
    DJANGO_SUPERUSER_EMAIL, DJANGO_SUPERUSER_PASSWORD, DJANGO_SUPERUSER_FULLNAME
"""

import os
import sys
import django

# ── Bootstrap Django ──────────────────────────────────────────────────────────

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bizanalytics.settings")
django.setup()

# ── After setup, import the model ─────────────────────────────────────────────

from decouple import config
from django.contrib.auth import get_user_model

User = get_user_model()

# ── Config (reads from .env or environment) ───────────────────────────────────

SUPERUSER_EMAIL = config("DJANGO_SUPERUSER_EMAIL", default="admin@bizanalytics.com")
SUPERUSER_PASSWORD = config("DJANGO_SUPERUSER_PASSWORD", default="Admin@123")
SUPERUSER_FULLNAME = config("DJANGO_SUPERUSER_FULLNAME", default="BizAnalystics Admin")


def create_superuser():
    if User.objects.filter(email=SUPERUSER_EMAIL).exists():
        print(f"[INFO]  Superuser '{SUPERUSER_EMAIL}' already exists – skipping creation.")
        return

    User.objects.create_superuser(
        email=SUPERUSER_EMAIL,
        password=SUPERUSER_PASSWORD,
        full_name=SUPERUSER_FULLNAME,
    )
    print(f"[OK]    Superuser created successfully!")
    print(f"        Email    : {SUPERUSER_EMAIL}")
    print(f"        Password : {SUPERUSER_PASSWORD}")
    print(f"        Name     : {SUPERUSER_FULLNAME}")
    print()
    print("  ➜  Open http://127.0.0.1:8000/admin/ and log in.")


if __name__ == "__main__":
    create_superuser()
