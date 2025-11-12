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
    import astropy
    from astropy.io import fits
    from astropy.timeseries import TimeSeries
    from astropy.stats import LombScargle
except ImportError:
    raise ImportError("Astropy is required for the AstropyBackend. Please install it with 'pip install astropy'.")

from .base import AnalysisBackendBase, TimeSeriesData

class AstropyBackend(AnalysisBackendBase):
    """
    Implementation of the analysis backend using Astropy.
    
    Astropy provides general-purpose astronomical utilities.
    """
    
    def read_file(self, file_path):
        """
        Read a time series from a file using Astropy.
        
        Args:
            file_path (str): Path to the file to read
            
        Returns:
            TimeSeriesData: The loaded time series data
        """
        # Determine file type based on extension
        _, ext = os.path.splitext(file_path.lower())
        
        try:
            if ext == '.fits':
                # Use Astropy's FITS reader
                with fits.open(file_path) as hdul:
                    # Extract data from first table HDU
                    for hdu in hdul:
                        if isinstance(hdu, fits.BinTableHDU):
                            data_table = hdu.data
                            break
                    else:
                        # If no table HDU is found
                        raise ValueError("No table HDU found in FITS file")
                
                # Try to identify time and flux columns
                columns = data_table.columns.names
                time_col = next((col for col in columns if 'TIME' in col.upper()), columns[0])
                flux_col = next((col for col in columns if 'FLUX' in col.upper() or 'COUNTS' in col.upper()), columns[1])
                
                # Extract data
                time = data_table[time_col]
                values = data_table[flux_col]
                
                # Look for error column
                error_col = next((col for col in columns if 'ERR' in col.upper() or 'ERROR' in col.upper()), None)
                errors = data_table[error_col] if error_col else None
                
                # Get metadata from header
                primary_header = hdul[0].header
                metadata = {
                    'telescope': primary_header.get('TELESCOP', 'Unknown'),
                    'target': primary_header.get('OBJECT', 'Unknown'),
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
                
                # Assume first column is time, second is values
                time_col = df.columns[0]
                value_col = df.columns[1]
                error_col = df.columns[2] if len(df.columns) > 2 else None
                
                # Create TimeSeries object
                time = df[time_col].values
                values = df[value_col].values
                errors = df[error_col].values if error_col else None
                
                return TimeSeriesData(
                    time=time,
                    values=values,
                    errors=errors,
                    metadata={'format': ext[1:]}
                )
            
            else:
                raise ValueError(f"Unsupported file format: {ext}")
        
        except Exception as e:
            raise ValueError(f"Error reading file with Astropy: {str(e)}")
    
    def run_analysis(self, analysis_type, data, **params):
        """
        Run a specific type of analysis on the data using Astropy.
        
        Args:
            analysis_type (str): Type of analysis to run
            data (TimeSeriesData): Input data for the analysis
            **params: Additional parameters for the analysis
            
        Returns:
            dict: Results of the analysis in a standardized format
        """
        # Dispatch to the appropriate analysis method
        if analysis_type == 'lomb_scargle' or analysis_type == 'power_spectrum':
            return self._run_lomb_scargle(data, **params)
        elif analysis_type == 'fourier_transform':
            return self._run_fourier_transform(data, **params)
        elif analysis_type == 'rebin':
            return self._run_rebin(data, **params)
        else:
            raise ValueError(f"Unsupported analysis type for Astropy: {analysis_type}")
    
    def _run_lomb_scargle(self, data, **params):
        """
        Calculate a Lomb-Scargle periodogram using Astropy.
        
        Args:
            data (TimeSeriesData): Input data
            **params: Parameters for the periodogram
            
        Returns:
            dict: Results containing frequency, power, and metadata
        """
        from astropy import units as u
        
        # Get parameters
        minimum_frequency = params.get('minimum_frequency')
        maximum_frequency = params.get('maximum_frequency')
        normalization = params.get('normalization', 'standard')
        samples_per_peak = params.get('samples_per_peak', 5)
        
        # Create a LombScargle object
        ls = LombScargle(data.time, data.values, dy=data.errors)
        
        # Determine frequency grid
        if minimum_frequency is not None and maximum_frequency is not None:
            n_samples = int((maximum_frequency - minimum_frequency) * samples_per_peak)
            frequency = np.linspace(minimum_frequency, maximum_frequency, n_samples)
        else:
            # Auto determine frequency grid
            frequency, power = ls.autopower(normalization=normalization)
            frequency = frequency.value
            power = power.value
        
        # Calculate power if we haven't already
        if 'power' not in locals():
            power = ls.power(frequency, normalization=normalization)
        
        # Find peaks
        from scipy.signal import find_peaks
        peaks, _ = find_peaks(power, height=0.1*np.max(power))
        peak_freqs = frequency[peaks]
        peak_powers = power[peaks]
        
        # Sort peaks by power
        sorted_peak_idx = np.argsort(peak_powers)[::-1]
        top_peaks = [{
            'frequency': float(peak_freqs[idx]),
            'power': float(peak_powers[idx]),
            'period': float(1/peak_freqs[idx]) if peak_freqs[idx] > 0 else float('inf')
        } for idx in sorted_peak_idx[:5] if idx < len(sorted_peak_idx)]  # Return top 5 peaks
        
        # Create DataFrame for plotting
        df = pd.DataFrame({
            'frequency': frequency,
            'power': power
        })
        
        return {
            'data': {
                'frequency': frequency.tolist(),
                'power': power.tolist()
            },
            'stats': {
                'mean_power': float(np.mean(power)),
                'max_power': float(np.max(power)),
                'max_power_freq': float(frequency[np.argmax(power)]),
                'n_bins': len(frequency),
                'top_peaks': top_peaks
            },
            'df': df,
            'metadata': {
                'normalization': normalization
            }
        }
    
    def _run_fourier_transform(self, data, **params):
        """
        Calculate a Fourier transform using numpy.
        
        Args:
            data (TimeSeriesData): Input data
            **params: Parameters for the Fourier transform
            
        Returns:
            dict: Results containing frequency, real and imaginary parts
        """
        # Get parameters
        window_type = params.get('window', 'hanning')
        detrend = params.get('detrend', True)
        
        # Get the values
        values = data.values
        
        # Calculate mean time step (assuming regularly sampled data)
        dt = np.median(np.diff(data.time))
        
        # Detrend if requested
        if detrend:
            from scipy import signal
            values = signal.detrend(values)
        
        # Apply window function if not 'none'
        if window_type != 'none':
            from scipy import signal
            if window_type == 'hanning':
                window = signal.hann(len(values))
            elif window_type == 'hamming':
                window = signal.hamming(len(values))
            elif window_type == 'blackman':
                window = signal.blackman(len(values))
            elif window_type == 'bartlett':
                window = signal.bartlett(len(values))
            
            values = values * window
        
        # Compute FFT
        fft_result = np.fft.fft(values)
        fft_freq = np.fft.fftfreq(len(values), d=dt)
        
        # Sort by frequency for better visualization
        sorted_idx = np.argsort(fft_freq)
        fft_freq = fft_freq[sorted_idx]
        fft_result = fft_result[sorted_idx]
        
        # Create DataFrame for plotting
        df = pd.DataFrame({
            'frequency': fft_freq,
            'real': fft_result.real,
            'imag': fft_result.imag,
            'amplitude': np.abs(fft_result)
        })
        
        return {
            'data': {
                'frequency': fft_freq.tolist(),
                'real': fft_result.real.tolist(),
                'imag': fft_result.imag.tolist(),
                'amplitude': np.abs(fft_result).tolist()
            },
            'stats': {
                'max_amplitude': float(np.max(np.abs(fft_result))),
                'max_amplitude_freq': float(fft_freq[np.argmax(np.abs(fft_result))]),
                'n_bins': len(fft_freq)
            },
            'df': df,
            'metadata': {
                'dt': float(dt),
                'window': window_type,
                'detrended': detrend
            }
        }
    
    def _run_rebin(self, data, **params):
        """
        Rebin a time series to a new time resolution.
        
        Args:
            data (TimeSeriesData): Input data
            **params: Parameters for rebinning
            
        Returns:
            dict: Results containing rebinned time series data
        """
        from astropy.timeseries import aggregate_downsample
        from astropy import units as u
        from astropy.time import Time
        
        # Get parameters
        bin_time = params.get('bin_time', 1.0)
        method = params.get('method', 'mean')
        
        # Create time series
        ts = TimeSeries(time=Time(data.time, format='unix'),
                       data={'flux': data.values})
        
        # Determine appropriate aggregation function
        if method == 'mean' or method == 'average':
            agg_func = np.mean
        elif method == 'sum':
            agg_func = np.sum
        else:
            agg_func = np.mean  # Default
        
        # Rebin the time series
        try:
            binned_ts = aggregate_downsample(ts, time_bin_size=bin_time * u.second,
                                            aggregate_func=agg_func)
            
            # Extract rebinned data
            rebinned_time = binned_ts.time.unix
            rebinned_values = binned_ts['flux'].data
            
            # Create DataFrame for plotting
            df = pd.DataFrame({
                'time': rebinned_time,
                'flux': rebinned_values
            })
            
            return {
                'data': {
                    'time': rebinned_time.tolist(),
                    'flux': rebinned_values.tolist()
                },
                'stats': {
                    'mean_flux': float(np.mean(rebinned_values)),
                    'n_bins': len(rebinned_time)
                },
                'df': df,
                'metadata': {
                    'bin_size': bin_time,
                    'method': method
                }
            }
            
        except Exception as e:
            # If binning fails with astropy, do a simple binning using pandas
            df = pd.DataFrame({'time': data.time, 'flux': data.values})
            bin_edges = np.arange(min(data.time), max(data.time) + bin_time, bin_time)
            df['bin'] = pd.cut(df['time'], bins=bin_edges)
            
            # Apply aggregation
            if method == 'sum':
                binned_df = df.groupby('bin')['flux'].sum().reset_index()
            else:  # mean or average
                binned_df = df.groupby('bin')['flux'].mean().reset_index()
            
            # Use bin midpoints as new time values
            binned_df['time'] = binned_df['bin'].apply(lambda x: x.mid)
            binned_df = binned_df.drop('bin', axis=1)
            
            return {
                'data': {
                    'time': binned_df['time'].tolist(),
                    'flux': binned_df['flux'].tolist()
                },
                'stats': {
                    'mean_flux': float(np.mean(binned_df['flux'])),
                    'n_bins': len(binned_df)
                },
                'df': binned_df,
                'metadata': {
                    'bin_size': bin_time,
                    'method': method,
                    'note': 'Fallback binning method used'
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
        if analysis_type in ['lomb_scargle', 'power_spectrum']:
            return self._plot_periodogram(result_data)
        elif analysis_type == 'fourier_transform':
            return self._plot_fourier_transform(result_data)
        elif analysis_type == 'rebin':
            return self._plot_light_curve(result_data)
        else:
            raise ValueError(f"No plotting function for analysis type: {analysis_type}")
    
    def _plot_periodogram(self, result_data):
        """
        Plot a periodogram.
        
        Args:
            result_data (dict): Results from _run_lomb_scargle
            
        Returns:
            dict: Plot data
        """
        df = result_data['df']
        
        # Create a HoloViews plot
        plot = df.hvplot.line(
            x='frequency', 
            y='power',
            title='Lomb-Scargle Periodogram',
            xlabel='Frequency (Hz)',
            ylabel='Power',
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
    
    def _plot_fourier_transform(self, result_data):
        """
        Plot a Fourier transform.
        
        Args:
            result_data (dict): Results from _run_fourier_transform
            
        Returns:
            dict: Plot data
        """
        df = result_data['df']
        
        # Create a HoloViews plot with amplitude
        amplitude_plot = df.hvplot.line(
            x='frequency', 
            y='amplitude',
            title='Fourier Transform',
            xlabel='Frequency (Hz)',
            ylabel='Amplitude',
            height=400,
            width=700
        )
        
        # Create plots for real and imaginary parts
        real_plot = df.hvplot.line(
            x='frequency', 
            y='real',
            title='Real Part',
            xlabel='Frequency (Hz)',
            ylabel='Value',
            height=300,
            width=700,
            color='blue'
        )
        
        imag_plot = df.hvplot.line(
            x='frequency', 
            y='imag',
            title='Imaginary Part',
            xlabel='Frequency (Hz)',
            ylabel='Value',
            height=300,
            width=700,
            color='red'
        )
        
        # Combine the plots
        combined_plot = amplitude_plot + (real_plot + imag_plot).cols(1)
        
        # Customize the plot
        combined_plot = combined_plot.opts(
            opts.Line(tools=['hover', 'box_zoom', 'reset', 'save'], 
                    active_tools=['box_zoom'])
        )
        
        # Convert to a Bokeh figure
        bokeh_plot = hv.render(combined_plot)
        
        # Return both HTML and JSON representations
        return {
            'html': hv.save(combined_plot, fmt='html'),
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
        
        # Determine which column to use for y-axis
        y_col = 'flux' if 'flux' in df.columns else df.columns[1]
        
        # Create a HoloViews plot
        plot = df.hvplot.line(
            x='time', 
            y=y_col,
            title='Binned Light Curve',
            xlabel='Time',
            ylabel=y_col.capitalize(),
            height=400,
            width=700
        )
        
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
