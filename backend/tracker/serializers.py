from rest_framework import serializers
from .models import JobApplication

class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ["id", "company", "role", "job_url", "status", "applied_date", "notes", "created_at", "updated_at"]
