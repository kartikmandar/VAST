import os
import json
import sys
import logging
import traceback
from datetime import datetime
from django.utils import timezone
from django.conf import settings
from celery import shared_task
from .models import AnalysisJob, AnalysisResult

# Add the analysis_core directory to the Python path
# analysis_core is now located in the backend directory
sys.path.append(str(settings.BASE_DIR))

# Import the analysis core components after path adjustment
from analysis_core.base import get_backend

logger = logging.getLogger(__name__)

@shared_task
def run_analysis(job_id):
    """Execute an analysis job asynchronously."""
    try:
        # Get the job from the database
        job = AnalysisJob.objects.get(pk=job_id)
        
        # Update job status to running
        job.status = 'RUNNING'
        job.started_at = timezone.now()
        job.save()
        
        # Get the data file path
        data_file_path = job.data_file.file_path.path
        
        # Get the selected backend (e.g., Stingray, Lightkurve)
        backend_name = job.backend
        analysis_type = job.analysis_type
        parameters = job.parameters
        
        # Get the appropriate backend instance
        backend = get_backend(backend_name)
        
        # Load the data
        logger.info(f"Loading data from file: {data_file_path}")
        data = backend.read_file(data_file_path)
        
        # Run the analysis
        logger.info(f"Running {analysis_type} analysis with {backend_name} backend")
        result_data = backend.run_analysis(analysis_type, data, **parameters)
        
        # Generate a plot from the results
        logger.info("Generating plot")
        plot_result = backend.generate_plot(analysis_type, result_data)
        
        # Save the plot as a file
        plot_filename = f"{job_id}_{analysis_type}_{datetime.now().strftime('%Y%m%d%H%M%S')}.html"
        plot_path = os.path.join(settings.MEDIA_ROOT, 'results', plot_filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(plot_path), exist_ok=True)
        
        # Save the plot
        with open(plot_path, 'w') as f:
            f.write(plot_result['html'])
        
        # Create a result record for the plot
        plot_result = AnalysisResult.objects.create(
            job=job,
            result_type='plot',
            file_path=os.path.join('results', plot_filename),
            content=plot_result.get('json_data')
        )
        
        # If there's numerical data, save it too
        if 'data' in result_data:
            data_filename = f"{job_id}_{analysis_type}_{datetime.now().strftime('%Y%m%d%H%M%S')}.json"
            data_path = os.path.join(settings.MEDIA_ROOT, 'results', data_filename)
            
            with open(data_path, 'w') as f:
                json.dump(result_data['data'], f)
            
            AnalysisResult.objects.create(
                job=job,
                result_type='data',
                file_path=os.path.join('results', data_filename)
            )
        
        # If there are stats, save them directly in the DB
        if 'stats' in result_data:
            AnalysisResult.objects.create(
                job=job,
                result_type='stats',
                content=result_data['stats']
            )
        
        # Update job status to success
        job.status = 'SUCCESS'
        job.finished_at = timezone.now()
        job.save()
        
        return job.id
        
    except Exception as e:
        logger.error(f"Error in analysis job {job_id}: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Update job status to failed
        try:
            job = AnalysisJob.objects.get(pk=job_id)
            job.status = 'FAILED'
            job.error_message = str(e)
            job.finished_at = timezone.now()
            job.save()
        except Exception as nested_e:
            logger.error(f"Failed to update job status: {str(nested_e)}")
        
        raise 