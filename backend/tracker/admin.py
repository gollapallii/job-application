from django.contrib import admin
from .models import JobApplication

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("company", "role", "status", "applied_date")
    list_filter = ("status", "applied_date")
    search_fields = ("company", "role", "notes")
