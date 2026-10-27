from django.apps import AppConfig


class HrmsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "hrms"

    def ready(self):
        # Register domain signals
        import hrms.signals  # noqa: F401
