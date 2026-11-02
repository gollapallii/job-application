from django.contrib import admin
from django.urls import include, path
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.urls import path


@api_view(["GET"])
def health(request):
    return Response({"status": "ok", "message": "Django connected"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/", include("tracker.urls")),
     

]

