"""
WSGI config for bizanalytics project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bizanalytics.settings")

application = get_wsgi_application()
