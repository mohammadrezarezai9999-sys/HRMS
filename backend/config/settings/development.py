# config/settings/development.py
"""محیط توسعهٔ محلی — دیتابیس سبک SQLite، DEBUG روشن."""
from .base import *  # noqa
from decouple import config

DEBUG = True
ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS', default='http://localhost:5173'
).split(',')