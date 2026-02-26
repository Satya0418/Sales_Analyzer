from django.urls import path
from .views import LandingView, LoginPageView, DashboardView

urlpatterns = [
    path("",          LandingView.as_view(),   name="landing"),
    path("login/",    LoginPageView.as_view(),  name="login-page"),
    path("dashboard/", DashboardView.as_view(), name="dashboard-page"),
]
