from decimal import Decimal

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("hrms", "0003_webauthncredential"),
    ]

    operations = [
        migrations.AddField(
            model_name="payroll",
            name="tax",
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal("0"),
                max_digits=12,
            ),
        ),
    ]
