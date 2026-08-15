from django.shortcuts import render
from django.core.files.base import ContentFile
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from accounts.views import JWTCookieAuthentication

# from .models import # insert models later
# from .serializers import # insert serializers later
# from .services import # for Elevenlabs API later

class OwnedModelViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTCookieAuthentication, JWTAuthentication]   


# Create your views here.
