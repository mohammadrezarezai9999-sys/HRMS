# config/settings/development.py
"""محیط توسعهٔ محلی — PostgreSQL، DEBUG روشن."""
from .base import *  # noqa
from decouple import config

DEBUG = True
ALLOWED_HOSTS = ['*']

# PostgreSQL (same engine as production for consistency)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='hrms'),
        'USER': config('DB_USER', default='hrms_user'),
        'PASSWORD': config('DB_PASS', default='reza@456'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
        'CONN_MAX_AGE': 60,
        'OPTIONS': {
            'connect_timeout': 10,
        },
    }
}

CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS', default='http://localhost:5173,http://127.0.0.1:5173'
).split(',')

CORS_ALLOW_CREDENTIALS = True
