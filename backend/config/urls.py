from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# AddWord - Step 11. Django takes api/ strips it and gives the rest to dictionary/urls.py

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("dictionary.urls")),
]

#during dev django serves the generated audio files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
