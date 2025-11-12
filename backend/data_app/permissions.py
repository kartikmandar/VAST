from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            # Check if the file is public or owned by the user
            return obj.is_public or obj.user == request.user
        
        # Write permissions are only allowed to the owner
        return obj.user == request.user 