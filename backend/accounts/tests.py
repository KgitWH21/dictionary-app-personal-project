from django.test import TestCase
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.test import APIClient

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
    
    def assertAuthCookiesSet(self, response):
        for name in ("access", "refresh"):
            self.assertIn(name, response.cookies)
            self.assertTrue(response.cookies[name]["httponly"])
            self.assertEqual(
                response.cookies[name]["samesite"], settings.AUTH_COOKIE_SAMESITE
            )
        self.assertNotIn("access", response.data or {})
        self.assertNotIn("refresh", response.data or {})
    
    def test_login_sets_cookies_and_me_confirm(self):
        User.objects.create_user(username="reader", password="reader")
        login = self.client.post(
            "/api/auth/login/",
            {"username": "reader", "password": "reader"},
            format="json",
        )
        self.assertEqual(login.status_code, 200)
        self.assertAuthCookiesSet(login)
        
        me = self.client.get("/api/auth/me/")
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.data["username"], "reader")
    


# Create your tests here.
