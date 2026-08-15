from django.urls import path
from .views import CreateUser, InfoView, LogIn, LogOut

urlpatterns = [
    path("register/", CreateUser.as_view(), name="register"),
    path("login/", LogIn.as_view(), name="login"),
    path("logout/", LogOut.as_view(), name="logout"),
    path("me/", InfoView.as_view(), name="me"),
]