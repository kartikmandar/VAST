from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import UserProfile

class GroupSerializer(serializers.ModelSerializer):
    """Serializer for Django Group model."""
    
    class Meta:
        model = Group
        fields = ['id', 'name']

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model."""
    
    class Meta:
        model = UserProfile
        fields = ['institution', 'bio', 'created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    """Serializer for Django User model."""
    
    profile = UserProfileSerializer(read_only=True)
    groups = GroupSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'groups', 'is_staff', 'profile', 'date_joined', 'last_login']
        read_only_fields = ['is_staff', 'date_joined', 'last_login']

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with password confirmation."""
    
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name']
    
    def validate(self, data):
        """Check that passwords match."""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        """Create user with encrypted password and return it."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    
    class Meta:
        model = UserProfile
        fields = ['institution', 'bio', 'first_name', 'last_name', 'email']
    
    def update(self, instance, validated_data):
        """Update user profile and related user fields."""
        user_data = validated_data.pop('user', {})
        
        # Update the related User instance
        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        
        # Update the UserProfile instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance 