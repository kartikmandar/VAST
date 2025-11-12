from rest_framework import serializers
from .models import DataFile

class DataFileSerializer(serializers.ModelSerializer):
    """Serializer for DataFile model."""
    
    user = serializers.ReadOnlyField(source='user.username')
    file_size_display = serializers.SerializerMethodField()
    
    class Meta:
        model = DataFile
        fields = [
            'id', 'user', 'name', 'file_path', 'file_type',
            'size', 'file_size_display', 'metadata', 'is_public',
            'uploaded_at'
        ]
        read_only_fields = ['user', 'size', 'uploaded_at']
    
    def get_file_size_display(self, obj):
        """Return a human-readable file size."""
        size = obj.size
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        return f"{size:.2f} PB" 