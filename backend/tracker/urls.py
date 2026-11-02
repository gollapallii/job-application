from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import JobApplicationViewSet, ai_cover_letter

router = DefaultRouter()
router.register("applications", JobApplicationViewSet, basename="application")

urlpatterns = [
    path("", include(router.urls)),
    path("ai/cover-letter/", ai_cover_letter, name="ai-cover-letter"),
]
