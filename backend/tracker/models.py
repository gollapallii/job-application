from django.db import models

class JobApplication(models.Model):
    STATUS_CHOICES = [
        ("Applied", "Applied"),
        ("Assessment", "Assessment"),
        ("Interview", "Interview"),
        ("Offer", "Offer"),
        ("Rejected", "Rejected"),
    ]
    company = models.CharField(max_length=120)
    role = models.CharField(max_length=120)
    job_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Applied")
    applied_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-applied_date", "-created_at"]

    def __str__(self):
        return f"{self.role} at {self.company}"
