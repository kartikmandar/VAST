from django.shortcuts import render
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse
import os

from .models import AnalysisJob, AnalysisResult, ParameterSet
from .serializers import (
    AnalysisJobSerializer,
    AnalysisJobDetailSerializer,
    AnalysisResultSerializer,
    ParameterSetSerializer
)
from .tasks import run_analysis
from data_app.permissions import IsOwnerOrReadOnly

class AnalysisJobViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing analysis jobs.
    """
    queryset = AnalysisJob.objects.all()
    serializer_class = AnalysisJobSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        """Use the detailed serializer for retrieve action."""
        if self.action == 'retrieve':
            return AnalysisJobDetailSerializer
        return AnalysisJobSerializer
    
    def get_queryset(self):
        """Filter jobs to return only user's jobs."""
        return AnalysisJob.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Create the job and enqueue a Celery task."""
        # Save the job with the current user
        job = serializer.save(user=self.request.user, status='PENDING')
        
        # Enqueue the Celery task for this job
        task = run_analysis.delay(job.id)
        
        # Update the job with the task ID
        job.task_id = task.id
        job.save()
    
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """Get the current status of an analysis job."""
        job = self.get_object()
        return Response({
            'status': job.status,
            'started_at': job.started_at,
            'finished_at': job.finished_at,
            'error_message': job.error_message
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a running job."""
        job = self.get_object()
        
        if job.status in ['PENDING', 'RUNNING']:
            # TODO: Implement task cancellation with Celery
            # For now, just mark it as failed
            job.status = 'FAILED'
            job.error_message = 'Job cancelled by user'
            job.finished_at = timezone.now()
            job.save()
            return Response({'status': 'Job cancelled'})
        
        return Response(
            {'detail': 'Cannot cancel a job that is not pending or running'},
            status=status.HTTP_400_BAD_REQUEST
        )

class AnalysisResultViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for accessing analysis results.
    """
    queryset = AnalysisResult.objects.all()
    serializer_class = AnalysisResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter results to return only those from user's jobs."""
        return AnalysisResult.objects.filter(job__user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download a result file if it exists."""
        result = self.get_object()
        
        # Check if this result has a file
        if not result.file_path:
            return Response(
                {'detail': 'This result does not have a downloadable file.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the file path and check if it exists
        file_path = result.file_path.path
        if not os.path.exists(file_path):
            return Response(
                {'detail': 'Result file not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Return the file
        filename = os.path.basename(file_path)
        return FileResponse(
            open(file_path, 'rb'),
            as_attachment=True,
            filename=filename
        )

class ParameterSetViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing parameter sets.
    """
    queryset = ParameterSet.objects.all()
    serializer_class = ParameterSetSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """
        Return the user's parameter sets plus any public ones.
        """
        user = self.request.user
        return (ParameterSet.objects.filter(user=user) | 
                ParameterSet.objects.filter(is_public=True))
    
    def perform_create(self, serializer):
        """Set the current user as the owner."""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def available_for_analysis(self, request):
        """
        Get parameter sets available for a specific analysis type.
        """
        analysis_type = request.query_params.get('analysis_type')
        if not analysis_type:
            return Response(
                {'detail': 'analysis_type parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Filter parameter sets by analysis type
        parameter_sets = self.get_queryset().filter(analysis_type=analysis_type)
        serializer = self.get_serializer(parameter_sets, many=True)
        return Response(serializer.data)
