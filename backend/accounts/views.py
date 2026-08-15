from django.shortcuts import render
from django.conf import settings
from rest_framework import status as s
from django.contrib.auth import login, authenticate, logout
from .models import # add models here later
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings
from .serializers import UserSerializer, RegisterSerializer

ACCESS_MAX_AGE = int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())
REFRESH_MAX_AGE = int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]).total_seconds())
REFRESH_COOKIE_PATH = "/api/auth/"
# Create your views here.

def set_auth_cookies(response, access=None, refresh=None):
    common = {
        "httponly":True,
        "secure": settings.AUTH_COOKIE_SECURE,
        "samesite":settings.AUTH_COOKIE_SAMESITE,
    }
    if access:
        response.set_cookie(
            "access", access, max_age=ACCESS_MAX_AGE, path="/", **common
            )
    if refresh:
        response.set_cookie(
            "refresh",
            refresh,
            max_age=REFRESH_MAX_AGE, 
            path=REFRESH_COOKIE_PATH, 
            **common
            )
    return response

def clear_auth_cookies(response):
    response.delete_cookie("access", path"/")
    response.delete_cookie("refresh", path=REFRESH_COOKIE_PATH)
    return response

def tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), str(refresh)

#finish writing cookie logic later
class JWTCookieAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get("access")
        if raw_token is None:
            return None          # "no opinion" — DRF tries the next class
        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token


class UserView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

class CreateUser(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        create_ser = RegisterSerializer(data=request.data)
        create_ser.is_valid(raise_exception=True)
        user = create_ser.save()
        access, refresh = tokens_for(user)
        response = Response(
            {"user": UserSerializer(user).data}, status=s.HTTP_201_CREATED
        )
        return set_auth_cookies(response, access, refresh)

class LogIn(APIView):
    authentication_classes = []
    permission_classes = []
    
    def post(self, request):
        data = request.data
        user = authenticate(
            username=data.get("username"), password=data.get("password")
        )   
        if user:
            access, refresh = tokens_for(user)
            response = Response({"user": UserSerializer(user).data})
            return Response(
                {"detail": "No user matching credentials"}, status=s.HTTP_401_UNAUTHORIZED
            )

class RefreshView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        raw_refresh = request.COOKIES.get("refresh")
        if not raw_refresh:
            return Response(
                {"detail": "No refresh Token"}, status=s.HTTP_401_UNAUTHORIZED
            )
        try:
            refresh = RefreshToken(raw_refresh)
        except TokenError:
            #if there's anything wrong with the cookies, we clear them 
            return clear_auth_cookies(
                Response(
                    {"detail": "Invalid or expired refresh Token"},
                    status=s.HTTP_401_UNAUTHORIZED,
                )
            )
        access = str(refresh.access_token)

        new_refresh = None

        if api_settings.ROTATE_REFRESH_TOKENS:
            if api_settings.BLACKLIST_AFTER_ROTATION:
                try:
                    refresh.blacklist()
                except AttributeError:
                    pass

            refresh.set_jti()
            refresh.set_exp()
            refresh.set_iat()
            new_refresh = str(refresh)
        response = Response({"refreshed": True})
        return set_auth_cookies(response, access, new_refresh)    

class UserView(APIView):
    authentication_classes = [JWTCookieAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticated]

class InfoView(UserView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

class LogOut(UserView):
    def post(self, request):
        raw_refresh = request.COOKIES.get("refresh")
        if raw_refresh:
            try:
                RefreshToken(raw_refresh).blacklist()
            except TokenError:
                #this is for if the token is already expired or blacklisted: do nothing
                pass
        return clear_auth_cookies(Response({"detail": "logged out"}))
    

