"""Local development. Can use local Postgres or Neon via DATABASE_URL."""
from urllib.parse import urlparse

from decouple import config

from .base import *  # noqa: F403

DEBUG = True
ALLOWED_HOSTS = ["*"]

DATABASE_URL = config("DATABASE_URL", default="")

if DATABASE_URL:
    parsed = urlparse(DATABASE_URL)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": parsed.path.lstrip("/") or "hrms_db",
            "USER": parsed.username,
            "PASSWORD": parsed.password,
            "HOST": parsed.hostname,
            "PORT": parsed.port or 5432,
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
