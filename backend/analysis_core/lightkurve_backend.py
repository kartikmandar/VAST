import numpy as np
import json
import os
from bokeh.embed import json_item
import holoviews as hv
from holoviews import opts
import hvplot.pandas
import pandas as pd

# Configure Holoviews to use Bokeh
hv.extension('bokeh')

try:
    import lightkurve as lk
except ImportError:
    raise ImportError("Lightkurve is required for the LightkurveBackend. Please install it with 'pip install lightkurve'.")

from .base import AnalysisBackendBase, TimeSeriesData

class LightkurveBackend(AnalysisBackendBase):
    """
    Implementation of the analysis backend using Lightkurve.
    
    Lightkurve is specialized for Kepler, K2, and TESS data analysis.
    """
    
    def read_file(self, file_path):
        """
        Read a time series from a file using Lightkurve.
        
        Args:
            file_path (str): Path to the file to read
            
        Returns:
            TimeSeriesData: The loaded time series data
        """
        # Determine file type based on extension
        _, ext = os.path.splitext(file_path.lower())
        
        try:
            if ext == '.fits':
                # Try Lightkurve's readers for different mission files
                lc = lk.read(file_path)
                
                # Convert to our standard format
                time = lc.time.value
                values = lc.flux.value if hasattr(lc, 'flux') else lc.counts.value
                errors = lc.flux_err.value if hasattr(lc, 'flux_err') else None
                
                # Get metadata
                metadata = {
                    'mission': lc.meta.get('MISSION', 'Unknown'),
                    'target': lc.meta.get('OBJECT', 'Unknown'),
                    'exptime': lc.meta.get('EXPOSURE', None),
                    'format': 'fits'
                }
                
                return TimeSeriesData(
                    time=time,
                    values=values,
                    errors=errors,
                    metadata=metadata
                )
                
            elif ext in ['.txt', '.csv']:
                # Use pandas to read text formats
                df = pd.read_csv(file_path)
                
                # Assume first column is time, second is flux/counts
                time_col = df.columns[0]
                value_col = df.columns[1]
                error_col = df.columns[2] if len(df.columns) > 2 else None
                
                # Convert to LightCurve object
                if error_col:
                    lc = lk.LightCurve(
                        time=df[time_col],
                        flux=df[value_col],
                        flux_err=df[error_col]
                    )
                else:
                    lc = lk.LightCurve(
                        time=df[time_col],
                        flux=df[value_col]
                    )
                
                return TimeSeriesData(
                    time=lc.time.value,
                    values=lc.flux.value,
                    errors=lc.flux_err.value if hasattr(lc, 'flux_err') else None,
                    metadata={'format': ext[1:]}
                )
                
            else:
                raise ValueError(f"Unsupported file format: {ext}")
                
        except Exception as e:
            raise ValueError(f"Error reading file with Lightkurve: {str(e)}")
    
    def run_analysis(self, analysis_type, data, **params):
        """
        Run a specific type of analysis on the data using Lightkurve.
        
        Args:
            analysis_type (str): Type of analysis to run
            data (TimeSeriesData): Input data for the analysis
            **params: Additional parameters for the analysis
            
        Returns:
            dict: Results of the analysis in a standardized format
        """
        # Convert our TimeSeriesData to a Lightkurve LightCurve
        lc = lk.LightCurve(
            time=data.time,
            flux=data.values,
            flux_err=data.errors
        )
        
        # Dispatch to the appropriate analysis method
        if analysis_type == 'power_spectrum' or analysis_type == 'lomb_scargle':
            return self._run_periodogram(lc, **params)
        elif analysis_type == 'fourier_transform':
            # Lightkurve doesn't have a direct FFT method like Stingray,
            # so we'll use the periodogram as a substitute
            return self._run_periodogram(lc, **params)
        elif analysis_type == 'rebin':
            return self._run_rebin(lc, **params)
        else:
            raise ValueError(f"Unsupported analysis type for Lightkurve: {analysis_type}")
    
    def _run_periodogram(self, lc, **params):
        """
        Calculate a periodogram using Lightkurve.
        
        Args:
            lc (LightCurve): Lightkurve LightCurve object
            **params: Parameters for the periodogram
            
        Returns:
            dict: Results containing frequency, power, and metadata
        """
        # Get parameters or use defaults
        minimum_frequency = params.get('minimum_frequency', None)
        maximum_frequency = params.get('maximum_frequency', None)
        normalization = params.get('normalization', 'amplitude')
        
        # Get frequency range
        if minimum_frequency is not None and maximum_frequency is not None:
            freq_range = (minimum_frequency, maximum_frequency)
        else:
            freq_range = None
        
        # Compute the periodogram
        pg = lc.to_periodogram(
            normalization=normalization,
            minimum_frequency=minimum_frequency,
            maximum_frequency=maximum_frequency
        )
        
        # Create DataFrame for plotting
        df = pd.DataFrame({
            'frequency': pg.frequency.value,
            'power': pg.power.value
        })
        
        # Find peaks if available in Lightkurve
        try:
            peaks = pg.find_peaks(method='lomb_scargle', minimum_period=None, maximum_period=None)
            top_peaks = [{'frequency': float(1/p), 'power': float(a), 'period': float(p)} 
                       for p, a in zip(peaks['period'].value, peaks['power'])]
        except:
            # If peak finding fails, create an empty list
            top_peaks = []
        
        return {
            'data': {
                'frequency': pg.frequency.value.tolist(),
                'power': pg.power.value.tolist()
            },
            'stats': {
                'mean_power': float(np.mean(pg.power.value)),
                'max_power': float(np.max(pg.power.value)),
                'max_power_freq': float(pg.frequency.value[np.argmax(pg.power.value)]),
                'n_bins': len(pg.frequency.value),
                'top_peaks': top_peaks
            },
            'df': df,
            'metadata': {
                'normalization': normalization,
                'frequency_range': freq_range
            }
        }
    
    def _run_rebin(self, lc, **params):
        """
        Rebin a light curve to a new time resolution.
        
        Args:
            lc (LightCurve): Lightkurve LightCurve object
            **params: Parameters for rebinning
            
        Returns:
            dict: Results containing rebinned light curve data
        """
        # Get parameters
        bin_time = params.get('bin_time', 1.0)
        method = params.get('method', 'mean')
        
        # Rebin using Lightkurve's method
        rebinned_lc = lc.bin(time_bin_size=bin_time)
        
        # Create DataFrame for plotting
        df = pd.DataFrame({
            'time': rebinned_lc.time.value,
            'flux': rebinned_lc.flux.value,
            'flux_err': rebinned_lc.flux_err.value if hasattr(rebinned_lc, 'flux_err') else None
        })
        
        return {
            'data': {
                'time': rebinned_lc.time.value.tolist(),
                'flux': rebinned_lc.flux.value.tolist(),
                'flux_err': rebinned_lc.flux_err.value.tolist() if hasattr(rebinned_lc, 'flux_err') else None
            },
            'stats': {
                'mean_flux': float(np.mean(rebinned_lc.flux.value)),
                'n_bins': len(rebinned_lc.time.value)
            },
            'df': df,
            'metadata': {
                'bin_size': bin_time,
                'method': method
            }
        }
    
    def generate_plot(self, analysis_type, result_data):
        """
        Generate a plot from analysis results using HoloViews.
        
        Args:
            analysis_type (str): Type of analysis the results are from
            result_data (dict): Results from run_analysis
            
        Returns:
            dict: Plot data, containing keys such as 'html', 'json_data'
        """
        if analysis_type in ['power_spectrum', 'lomb_scargle', 'fourier_transform']:
            return self._plot_periodogram(result_data)
        elif analysis_type == 'rebin':
            return self._plot_light_curve(result_data)
        else:
            raise ValueError(f"No plotting function for analysis type: {analysis_type}")
    
    def _plot_periodogram(self, result_data):
        """
        Plot a periodogram.
        
        Args:
            result_data (dict): Results from _run_periodogram
            
        Returns:
            dict: Plot data
        """
        df = result_data['df']
        
        # Create a HoloViews plot
        plot = df.hvplot.line(
            x='frequency', 
            y='power',
            title='Periodogram',
            xlabel='Frequency (Hz)',
            ylabel='Power',
            logx=True,
            height=400,
            width=700
        )
        
        # Add markers for top peaks if available
        if 'top_peaks' in result_data['stats'] and result_data['stats']['top_peaks']:
            top_peaks = result_data['stats']['top_peaks']
            peak_data = pd.DataFrame(top_peaks)
            
            if 'frequency' in peak_data.columns and 'power' in peak_data.columns:
                peak_markers = hv.Points(
                    (peak_data['frequency'], peak_data['power']),
                    label='Peaks'
                ).opts(
                    color='red',
                    marker='x',
                    size=10,
                    line_width=2
                )
                plot = plot * peak_markers
        
        # Customize the plot
        plot = plot.opts(
            opts.Line(tools=['hover', 'box_zoom', 'reset', 'save'], 
                    active_tools=['box_zoom'])
        )
        
        # Convert to a Bokeh figure
        bokeh_plot = hv.render(plot)
        
        # Return both HTML and JSON representations
        return {
            'html': hv.save(plot, fmt='html'),
            'json_data': json.dumps(json_item(bokeh_plot))
        }
    
    def _plot_light_curve(self, result_data):
        """
        Plot a light curve.
        
        Args:
            result_data (dict): Results with a light curve
            
        Returns:
            dict: Plot data
        """
        df = result_data['df']
        
        # Create a HoloViews plot
        if 'flux' in df.columns:
            y_col = 'flux'
            ylabel = 'Flux'
        else:
            y_col = df.columns[1]  # Fallback to second column
            ylabel = 'Value'
        
        plot = df.hvplot.line(
            x='time', 
            y=y_col,
            title='Light Curve',
            xlabel='Time',
            ylabel=ylabel,
            height=400,
            width=700
        )
        
        # Add error bars if available
        error_col = f"{y_col}_err"
        if error_col in df.columns and not df[error_col].isna().all():
            error_bars = hv.ErrorBars(
                (df['time'], df[y_col], df[error_col])
            ).opts(line_width=1)
            plot = plot * error_bars
        
        # Customize the plot
        plot = plot.opts(
            opts.Line(tools=['hover', 'box_zoom', 'reset', 'save'], 
                    active_tools=['box_zoom'])
        )
        
        # Convert to a Bokeh figure
        bokeh_plot = hv.render(plot)
        
        # Return both HTML and JSON representations
        return {
            'html': hv.save(plot, fmt='html'),
            'json_data': json.dumps(json_item(bokeh_plot))
        }
