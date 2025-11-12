from django.db import models
from django.contrib.auth.models import User
from data_app.models import DataFile

class AnalysisJob(models.Model):
    """Model for tracking analysis tasks."""
    
    # Status choices for tracking job progress
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('RUNNING', 'Running'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    ]
    
    # Common analysis types
    ANALYSIS_TYPE_CHOICES = [
        ('power_spectrum', 'Power Spectrum'),
        ('fourier_transform', 'Fourier Transform'),
        ('light_curve', 'Light Curve'),
        ('rebin', 'Rebin'),
        ('cross_spectrum', 'Cross Spectrum'),
        ('pds_simulation', 'PDS Simulation'),
        ('lomb_scargle', 'Lomb-Scargle Periodogram'),
        ('custom', 'Custom Pipeline'),
    ]
    
    # Backend choices
    BACKEND_CHOICES = [
        ('stingray', 'Stingray'),
        ('lightkurve', 'Lightkurve'),
        ('astropy', 'Astropy'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analysis_jobs')
    data_file = models.ForeignKey(DataFile, on_delete=models.PROTECT, related_name='analysis_jobs')
    analysis_type = models.CharField(max_length=50, choices=ANALYSIS_TYPE_CHOICES)
    backend = models.CharField(max_length=20, choices=BACKEND_CHOICES, default='stingray')
    parameters = models.JSONField(default=dict, blank=True,
                                 help_text='Analysis parameters in JSON format')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    error_message = models.TextField(blank=True, null=True)
    
    # Timestamps for tracking
    submitted_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    
    # Task identifier from Celery
    task_id = models.CharField(max_length=255, blank=True, null=True,
                              help_text='Celery task ID for this job')
    
    def __str__(self):
        return f"{self.analysis_type} on {self.data_file.name} ({self.status})"
    
    class Meta:
        ordering = ['-submitted_at']

class AnalysisResult(models.Model):
    """Model for storing analysis results."""
    
    # Result types
    RESULT_TYPE_CHOICES = [
        ('plot', 'Plot'),
        ('data', 'Data'),
        ('stats', 'Statistics'),
    ]
    
    job = models.ForeignKey(AnalysisJob, on_delete=models.CASCADE, related_name='results')
    result_type = models.CharField(max_length=10, choices=RESULT_TYPE_CHOICES)
    file_path = models.FileField(upload_to='results/', null=True, blank=True,
                               help_text='Path to result file if stored as a file')
    content = models.JSONField(null=True, blank=True, 
                              help_text='Result data if stored as JSON')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.result_type} for {self.job.analysis_type}"
    
    class Meta:
        ordering = ['-created_at']

class ParameterSet(models.Model):
    """Model for storing reusable parameter configurations."""
    
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parameter_sets', 
                            null=True, blank=True)
    analysis_type = models.CharField(max_length=50, choices=AnalysisJob.ANALYSIS_TYPE_CHOICES)
    parameters = models.JSONField(default=dict)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('name', 'user', 'analysis_type')
