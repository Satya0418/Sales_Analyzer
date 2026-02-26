from django.views.generic import TemplateView


class LandingView(TemplateView):
    template_name = "pages/landing.html"


class LoginPageView(TemplateView):
    template_name = "pages/login.html"


class DashboardView(TemplateView):
    template_name = "pages/dashboard.html"
