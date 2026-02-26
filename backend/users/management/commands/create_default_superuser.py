"""
Management command: create_default_superuser
--------------------------------------------
Creates the superuser non-interactively.

Usage:
    python manage.py create_default_superuser
    python manage.py create_default_superuser --email admin@example.com --password MyPass@1 --name "John Doe"
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from decouple import config


class Command(BaseCommand):
    help = "Create the default superuser for BizAnalystics (non-interactive)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            default=config("DJANGO_SUPERUSER_EMAIL", default="admin@bizanalytics.com"),
            help="Superuser email (default: admin@bizanalytics.com)",
        )
        parser.add_argument(
            "--password",
            default=config("DJANGO_SUPERUSER_PASSWORD", default="Admin@123"),
            help="Superuser password (default: Admin@123)",
        )
        parser.add_argument(
            "--name",
            default=config("DJANGO_SUPERUSER_FULLNAME", default="BizAnalystics Admin"),
            help="Superuser full name (default: BizAnalystics Admin)",
        )

    def handle(self, *args, **options):
        User = get_user_model()
        email = options["email"]
        password = options["password"]
        full_name = options["name"]

        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f"Superuser '{email}' already exists – skipping.")
            )
            return

        User.objects.create_superuser(
            email=email,
            password=password,
            full_name=full_name,
        )
        self.stdout.write(self.style.SUCCESS(f"Superuser '{email}' created successfully!"))
        self.stdout.write(f"  Password : {password}")
        self.stdout.write(f"  Name     : {full_name}")
        self.stdout.write(f"  Admin    : http://127.0.0.1:8000/admin/")
