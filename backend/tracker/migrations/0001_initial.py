from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="JobApplication",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("company", models.CharField(max_length=120)),
                ("role", models.CharField(max_length=120)),
                ("job_url", models.URLField(blank=True)),
                ("status", models.CharField(choices=[("Applied", "Applied"), ("Assessment", "Assessment"), ("Interview", "Interview"), ("Offer", "Offer"), ("Rejected", "Rejected")], default="Applied", max_length=20)),
                ("applied_date", models.DateField()),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["-applied_date", "-created_at"]},
        ),
    ]
