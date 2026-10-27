
"""Local development — can point at local Postgres or Neon hrms_db."""
from .base import *  # noqa
from decouple import config
from urllib.parse import urlparse

DEBUG = True
ALLOWED_HOSTS = ["*"]

DATABASE_URL = config("DATABASE_URL", default="")

if DATABASE_URL:
    u = urlparse(DATABASE_URL)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": u.path.lstrip("/") or "hrms_db",
            "USER": u.username,
            "PASSWORD": u.password,
            "HOST": u.hostname,
            "PORT": u.port or 5432,
            "CONN_MAX_AGE": 60,
            "OPTIONS": {"sslmode": "require"},
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": config("DB_NAME", default="hrms_db"),
            "USER": config("DB_USER", default="hrms_user"),
            "PASSWORD": config("DB_PASSWORD", default="hrms_pass"),
            "HOST": config("DB_HOST", default="localhost"),
            "PORT": config("DB_PORT", default="5432"),
            "CONN_MAX_AGE": 60,
            "OPTIONS": {
                "connect_timeout": 10,
                "sslmode": config("DB_SSLMODE", default="prefer"),
            },
        }
    }

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5173,http://127.0.0.1:5173",
).split(",")
CORS_ALLOW_CREDENTIALS = True
