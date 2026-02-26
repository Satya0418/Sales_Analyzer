from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_root(request):
    return JsonResponse({
        "message": "BizAnalystics API",
        "version": "1.0",
        "endpoints": {
            "admin": "/admin/",
            "auth": {
                "register": "/api/users/register/",
                "login": "/api/users/login/",
                "logout": "/api/users/logout/",
                "token_refresh": "/api/users/token/refresh/",
                "profile": "/api/users/profile/",
                "change_password": "/api/users/change-password/",
            },
        },
    })


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/", api_root),
    path("", include("pages.urls")),
]
