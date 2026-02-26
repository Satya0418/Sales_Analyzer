from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Fully-featured admin panel for the custom User model."""

    # ------------------------------------------------------------------
    # List view
    # ------------------------------------------------------------------
    list_display = ("email", "full_name", "role", "is_active", "is_staff", "is_superuser", "date_joined")
    list_filter = ("role", "is_active", "is_staff", "is_superuser")
    search_fields = ("email", "full_name")
    ordering = ("-date_joined",)
    list_per_page = 25

    # ------------------------------------------------------------------
    # Detail / edit view
    # ------------------------------------------------------------------
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("full_name",)}),
        (_("Role & permissions"), {
            "fields": ("role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions"),
        }),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "full_name", "role", "password1", "password2", "is_staff", "is_superuser"),
        }),
    )

    readonly_fields = ("date_joined", "last_login")

    # Use email as the unique identifier in the admin
    filter_horizontal = ("groups", "user_permissions")
