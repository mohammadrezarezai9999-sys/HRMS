from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("hrms", "0002_alter_attendance_unique_together_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="WebAuthnCredential",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("credential_id", models.TextField(unique=True)),
                ("public_key", models.TextField()),
                ("sign_count", models.PositiveIntegerField(default=0)),
                ("device_name", models.CharField(blank=True, default="Platform authenticator", max_length=120)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="webauthn_credentials",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
