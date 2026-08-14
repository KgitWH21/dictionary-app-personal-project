from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "password_confirm"]
    
    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("That username is taken.")
        return value
    
    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            #raising this against the confirm field so the UI can highlight it
            raise serializers.ValidationError(
                {"password_confirm": "Passwords don't match"}
            )   
        return attrs
    
    def create(self, validated_data):
        validated_data.pop("password_confirm")
        # this hashes the password and removes it from the response
        return User.objects.create_user(**validated_data)