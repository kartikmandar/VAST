from rest_framework import serializers
from .models import AnalysisJob, AnalysisResult, ParameterSet
from data_app.serializers import DataFileSerializer

class AnalysisResultSerializer(serializers.ModelSerializer):
    """Serializer for AnalysisResult model."""
    
    class Meta:
        model = AnalysisResult
        fields = ['id', 'result_type', 'file_path', 'content', 'created_at']

class AnalysisJobSerializer(serializers.ModelSerializer):
    """Serializer for AnalysisJob model."""
    
    user = serializers.ReadOnlyField(source='user.username')
    results = AnalysisResultSerializer(many=True, read_only=True)
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = AnalysisJob
        fields = [
            'id', 'user', 'data_file', 'analysis_type', 'backend',
            'parameters', 'status', 'error_message', 'submitted_at',
            'started_at', 'finished_at', 'duration', 'results'
        ]
        read_only_fields = ['user', 'status', 'error_message', 'submitted_at', 
                           'started_at', 'finished_at', 'duration']
    
    def get_duration(self, obj):
        """Calculate the duration of the analysis if complete."""
        if obj.started_at and obj.finished_at:
            duration = obj.finished_at - obj.started_at
            return duration.total_seconds()
        return None
    
class AnalysisJobDetailSerializer(AnalysisJobSerializer):
    """Detailed serializer for AnalysisJob model including related data."""
    
    data_file = DataFileSerializer(read_only=True)

class ParameterSetSerializer(serializers.ModelSerializer):
    """Serializer for ParameterSet model."""
    
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = ParameterSet
        fields = ['id', 'name', 'user', 'analysis_type', 'parameters', 
                 'is_public', 'created_at']
        read_only_fields = ['user', 'created_at'] 