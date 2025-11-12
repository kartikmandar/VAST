from abc import ABC, abstractmethod

class TimeSeriesData:
    """
    Standardized container for time series data.
    
    This class serves as a common interface for various data formats
    used by different backends.
    """
    
    def __init__(self, time, values, errors=None, metadata=None):
        """
        Initialize time series data.
        
        Args:
            time (array-like): Time values
            values (array-like): Data values at each time point
            errors (array-like, optional): Error values at each time point
            metadata (dict, optional): Additional metadata about the time series
        """
        self.time = time
        self.values = values
        self.errors = errors
        self.metadata = metadata or {}

class AnalysisBackendBase(ABC):
    """
    Abstract base class defining the interface for analysis backends.
    
    Each concrete backend (e.g., Stingray, Lightkurve) must implement
    these methods.
    """
    
    @abstractmethod
    def read_file(self, file_path):
        """
        Read a time series from a file.
        
        Args:
            file_path (str): Path to the file to read
            
        Returns:
            TimeSeriesData: The loaded time series data
        """
        pass
    
    @abstractmethod
    def run_analysis(self, analysis_type, data, **params):
        """
        Run a specific type of analysis on the data.
        
        Args:
            analysis_type (str): Type of analysis to run (e.g., 'power_spectrum')
            data (TimeSeriesData): Input data for the analysis
            **params: Additional parameters for the analysis
            
        Returns:
            dict: Results of the analysis in a standardized format
        """
        pass
    
    @abstractmethod
    def generate_plot(self, analysis_type, result_data):
        """
        Generate a plot from analysis results.
        
        Args:
            analysis_type (str): Type of analysis the results are from
            result_data (dict): Results from run_analysis
            
        Returns:
            dict: Plot data, containing keys such as 'html', 'json_data'
        """
        pass

# Factory function to get the appropriate backend
def get_backend(backend_name):
    """
    Get an instance of a specific backend by name.
    
    Args:
        backend_name (str): Name of the backend to use ('stingray', 'lightkurve', 'astropy')
        
    Returns:
        AnalysisBackendBase: An instance of the requested backend
    
    Raises:
        ValueError: If the backend name is not recognized
    """
    if backend_name == 'stingray':
        from .stingray_backend import StingrayBackend
        return StingrayBackend()
    elif backend_name == 'lightkurve':
        from .lightkurve_backend import LightkurveBackend
        return LightkurveBackend()
    elif backend_name == 'astropy':
        from .astropy_backend import AstropyBackend
        return AstropyBackend()
    else:
        raise ValueError(f"Unknown backend: {backend_name}")
