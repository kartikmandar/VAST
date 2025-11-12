from django.shortcuts import render
import os
from django.http import FileResponse
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DataFile
from .serializers import DataFileSerializer
from .permissions import IsOwnerOrReadOnly

# Create your views here.

class DataFileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing data files.
    """
    queryset = DataFile.objects.all()
    serializer_class = DataFileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """Filter files to return only user's files and public files."""
        user = self.request.user
        return DataFile.objects.filter(user=user) | DataFile.objects.filter(is_public=True)
    
    def perform_create(self, serializer):
        """Set the user when saving the file."""
        # Get the uploaded file
        file_obj = self.request.FILES.get('file_path')
        
        if file_obj:
            # Get file size and determine file type
            file_size = file_obj.size
            file_name = file_obj.name
            file_type = self._determine_file_type(file_name)
            
            # Create the DataFile instance
            serializer.save(
                user=self.request.user,
                size=file_size,
                file_type=file_type
            )
        else:
            # File not provided, handle the error
            raise serializers.ValidationError("No file was provided.")
    
    def _determine_file_type(self, file_name):
        """Determine file type based on extension."""
        extension = os.path.splitext(file_name)[1].lower()
        if extension == '.fits':
            return 'FITS'
        elif extension == '.csv':
            return 'CSV'
        elif extension == '.txt':
            return 'TXT'
        else:
            return 'ASCII'  # Default
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Endpoint to download a file."""
        data_file = self.get_object()
        file_path = data_file.file_path.path
        
        if os.path.exists(file_path):
            return FileResponse(
                open(file_path, 'rb'),
                as_attachment=True,
                filename=data_file.name
            )
        else:
            return Response(
                {'detail': 'File not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
