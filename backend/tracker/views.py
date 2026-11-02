import os
import requests
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import JobApplication
from .serializers import JobApplicationSerializer

class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    queryset = JobApplication.objects.all()

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get("search", "").strip()
        application_status = self.request.query_params.get("status", "").strip()
        if search:
            from django.db.models import Q
            qs = qs.filter(Q(company__icontains=search) | Q(role__icontains=search) | Q(notes__icontains=search))
        if application_status:
            qs = qs.filter(status=application_status)
        return qs

@api_view(["POST"])
def ai_cover_letter(request):
    job_description = str(request.data.get("job_description", "")).strip()
    role = str(request.data.get("role", "")).strip()
    if not job_description:
        return Response({"error": "Please provide a job description."}, status=status.HTTP_400_BAD_REQUEST)
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return Response(
            {"error": "AI is not configured yet. Add GEMINI_API_KEY to the backend environment, then restart the server."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    prompt = (
        "Write one concise, professional cover-letter paragraph for a job applicant. "
        "Use only the information supplied; do not invent experience, qualifications, or achievements. "
        "Keep it around 100 words and leave placeholders for missing personal details. "
        f"Target role: {role or 'the role described below'}. Job description:\n{job_description}"
    )
    try:
        response = requests.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            params={"key": api_key},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=25,
        )
        response.raise_for_status()
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return Response({"draft": text})
    except (requests.RequestException, KeyError, IndexError, TypeError, ValueError):
        return Response(
            {"error": "The AI request failed. Check the Gemini API key, model availability, and backend logs."},
            status=status.HTTP_502_BAD_GATEWAY,
        )
