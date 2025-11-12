import param

class BaseAnalysis(param.Parameterized):
    """
    Base class for all analysis operations using Param.
    
    This provides common methods and utilities for all analysis types.
    """
    # Metadata
    description = param.String(default="", doc="Description of this analysis")
    name = param.String(default="", doc="Name of this analysis")
    
    def get_param_schema(self):
        """
        Return a description of this class's parameters suitable for UI generation.
        
        Returns:
            dict: Schema of parameters for this analysis
        """
        schema = {}
        for name, p in self.param.objects().items():
            if name in ['name', 'description']:
                continue
                
            param_schema = {
                'type': p.__class__.__name__,
                'default': p.default,
                'doc': p.doc,
            }
            
            # Add bounds for numeric parameters
            if hasattr(p, 'bounds'):
                param_schema['min'] = p.bounds[0] if p.bounds[0] is not None else None
                param_schema['max'] = p.bounds[1] if p.bounds[1] is not None else None
                
            # Add allowed values for selectors
            if hasattr(p, 'objects') and p.objects:
                param_schema['allowed_values'] = p.objects
                
            schema[name] = param_schema
            
        return schema

class PowerSpectrumAnalysis(BaseAnalysis):
    """
    Configuration for power spectrum analysis.
    """
    segment_length = param.Integer(default=1024, bounds=(1, None), 
                                  doc="Segment length for Fourier transform")
    norm = param.ObjectSelector(default='leahy', objects=['leahy', 'rms', 'none'], 
                              doc="Normalization method")
    dt = param.Number(default=None, allow_None=True,
                     doc="Time resolution of the light curve")
    gti = param.Array(default=None, allow_None=True,
                    doc="Good Time Intervals")
    average = param.Boolean(default=True,
                          doc="Average the segments to produce a smoother spectrum")
    freq_range = param.Range(default=(0, None), 
                           doc="Frequency range to calculate (min, max)")

class FourierTransformAnalysis(BaseAnalysis):
    """
    Configuration for basic Fourier transform.
    """
    segment_length = param.Integer(default=1024, bounds=(1, None),
                                  doc="Segment length for Fourier transform")
    window = param.ObjectSelector(default='hanning', 
                                objects=['hanning', 'hamming', 'blackman', 'bartlett', 'none'],
                                doc="Window function to apply")
    detrend = param.Boolean(default=True, 
                          doc="Whether to detrend the data before transform")

class LombScargleAnalysis(BaseAnalysis):
    """
    Configuration for Lomb-Scargle periodogram analysis.
    """
    minimum_frequency = param.Number(default=None, allow_None=True, 
                                    doc="Minimum frequency to analyze")
    maximum_frequency = param.Number(default=None, allow_None=True,
                                    doc="Maximum frequency to analyze")
    nyquist_factor = param.Number(default=1, bounds=(0.1, 10),
                                 doc="Multiple of Nyquist frequency to use as maximum")
    samples_per_peak = param.Integer(default=5, bounds=(1, 100),
                                   doc="Number of samples per peak")
    normalization = param.ObjectSelector(default='standard', 
                                       objects=['standard', 'model', 'log', 'psd'],
                                       doc="Normalization method")

class RebinAnalysis(BaseAnalysis):
    """
    Configuration for rebinning a time series.
    """
    bin_time = param.Number(default=1.0, bounds=(0, None),
                          doc="New time bin size")
    method = param.ObjectSelector(default='sum', objects=['sum', 'mean', 'average'],
                                doc="Method for combining values")

class PDSSimulationAnalysis(BaseAnalysis):
    """
    Configuration for Power Density Spectrum simulation.
    """
    model = param.ObjectSelector(default='powerlaw', 
                               objects=['powerlaw', 'broken_powerlaw', 'lorentzian'],
                               doc="PDS model type")
    mean = param.Number(default=100.0, doc="Mean count rate")
    rms = param.Number(default=0.1, bounds=(0, 1), 
                     doc="Fractional RMS amplitude")
    red_noise_index = param.Number(default=1.0, 
                                 doc="Power-law index")
    dt = param.Number(default=0.001, bounds=(0, None),
                    doc="Time resolution")
    tlen = param.Number(default=1000.0, bounds=(0, None),
                      doc="Length of light curve to simulate")
    break_freq = param.Number(default=None, allow_None=True,
                            doc="Break frequency for broken power law")
    
class CrossSpectrumAnalysis(BaseAnalysis):
    """
    Configuration for cross-spectrum analysis.
    """
    segment_length = param.Integer(default=1024, bounds=(1, None),
                                 doc="Segment length for Fourier transform")
    norm = param.ObjectSelector(default='none', objects=['none', 'leahy', 'frac'],
                              doc="Normalization method")
    gti = param.Array(default=None, allow_None=True,
                    doc="Good Time Intervals")
    dt = param.Number(default=None, allow_None=True,
                     doc="Time resolution")
    
# Dictionary mapping analysis types to their parameter classes
ANALYSIS_CLASSES = {
    'power_spectrum': PowerSpectrumAnalysis,
    'fourier_transform': FourierTransformAnalysis,
    'lomb_scargle': LombScargleAnalysis,
    'rebin': RebinAnalysis,
    'pds_simulation': PDSSimulationAnalysis,
    'cross_spectrum': CrossSpectrumAnalysis
}

def get_analysis_params(analysis_type):
    """
    Get the parameter schema for a specific analysis type.
    
    Args:
        analysis_type (str): The type of analysis to get parameters for
        
    Returns:
        dict: Schema of parameters for this analysis
        
    Raises:
        ValueError: If the analysis type is not recognized
    """
    if analysis_type not in ANALYSIS_CLASSES:
        raise ValueError(f"Unknown analysis type: {analysis_type}")
        
    analysis_class = ANALYSIS_CLASSES[analysis_type]
    instance = analysis_class()
    return instance.get_param_schema()
