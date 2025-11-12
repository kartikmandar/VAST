from django.db import models
from django.contrib.auth.models import User

class DataFile(models.Model):
    """Model for storing time-series data files."""
    
    # File types available for analysis
    FILE_TYPE_CHOICES = [
        ('FITS', 'FITS File'),
        ('CSV', 'CSV File'),
        ('TXT', 'Text File'),
        ('ASCII', 'ASCII File'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='data_files')
    name = models.CharField(max_length=255)
    file_path = models.FileField(upload_to='datafiles/')
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES)
    size = models.PositiveBigIntegerField(help_text='File size in bytes')
    metadata = models.JSONField(default=dict, blank=True, 
                               help_text='Additional metadata about the file')
    is_public = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.file_type})"
    
    class Meta:
        ordering = ['-uploaded_at']
