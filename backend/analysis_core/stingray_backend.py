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
    import stingray
    from stingray import Lightcurve, AveragedPowerspectrum, Powerspectrum, Crossspectrum
    from stingray.simulator import Simulator
except ImportError:
    raise ImportError("Stingray is required for the StingrayBackend. Please install it with 'pip install stingray'.")

from .base import AnalysisBackendBase, TimeSeriesData
from .param_defs import ANALYSIS_CLASSES

class StingrayBackend(AnalysisBackendBase):
    """
    Implementation of the analysis backend using Stingray.
    """
    
    def read_file(self, file_path):
        """
        Read a time series from a file using Stingray's io.
        
        Args:
            file_path (str): Path to the file to read
            
        Returns:
            TimeSeriesData: The loaded time series data
        """
        # Determine file type based on extension
        _, ext = os.path.splitext(file_path.lower())
        
        # Use appropriate reader based on file type
        if ext == '.fits':
            try:
                # Try to use stingray's FITS readers
                from stingray.io import load_events_fits
                events = load_events_fits(file_path)
                # Convert event list to light curve with reasonable bin size
                dt = self._estimate_bin_time(events.time)
                lc = Lightcurve.make_lightcurve(events.time, dt=dt)
                return TimeSeriesData(
                    time=lc.time,
                    values=lc.counts,
                    metadata={'dt': lc.dt, 'format': 'fits'}
                )
            except Exception as e:
                # Fall back to a more general approach if stingray's reader fails
                raise ValueError(f"Could not read FITS file: {str(e)}")
        
        elif ext in ['.txt', '.csv', '.dat']:
            # Assume simple text format with time in first column and counts in second
            try:
                data = np.loadtxt(file_path)
                time = data[:, 0]
                counts = data[:, 1]
                dt = None  # Will be estimated if needed
                
                return TimeSeriesData(
                    time=time,
                    values=counts,
                    metadata={'format': ext[1:]}
                )
            except Exception as e:
                raise ValueError(f"Could not read text file: {str(e)}")
        
        else:
            raise ValueError(f"Unsupported file format: {ext}")
    
    def _estimate_bin_time(self, time_array):
        """
        Estimate a reasonable bin time from an array of times.
        
        Args:
            time_array (array): Array of time values
            
        Returns:
            float: Estimated bin time
        """
        # If the array is too large, sample it
        if len(time_array) > 10000:
            indices = np.linspace(0, len(time_array)-1, 10000, dtype=int)
            time_array = time_array[indices]
        
        # Sort the array and calculate differences
        sorted_time = np.sort(time_array)
        diffs = np.diff(sorted_time)
        
        # Use the median difference as the bin time
        return np.median(diffs)
    
    def run_analysis(self, analysis_type, data, **params):
        """
        Run a specific type of analysis on the data using Stingray.
        
        Args:
            analysis_type (str): Type of analysis to run (e.g., 'power_spectrum')
            data (TimeSeriesData): Input data for the analysis
            **params: Additional parameters for the analysis
            
        Returns:
            dict: Results of the analysis in a standardized format
        """
        # Create a Stingray Lightcurve object
        dt = params.get('dt', None) or data.metadata.get('dt', self._estimate_bin_time(data.time))
        lc = Lightcurve(data.time, data.values, err=data.errors, dt=dt)
        
        # Dispatch to the appropriate analysis method
        if analysis_type == 'power_spectrum':
            return self._run_power_spectrum(lc, **params)
        elif analysis_type == 'fourier_transform':
            return self._run_fourier_transform(lc, **params)
        elif analysis_type == 'lomb_scargle':
            return self._run_lomb_scargle(lc, **params)
        elif analysis_type == 'rebin':
            return self._run_rebin(lc, **params)
        elif analysis_type == 'pds_simulation':
            return self._run_pds_simulation(**params)
        elif analysis_type == 'cross_spectrum':
            raise ValueError("Cross spectrum analysis requires two light curves")
        else:
            raise ValueError(f"Unsupported analysis type for Stingray: {analysis_type}")
    
    def _run_power_spectrum(self, lc, **params):
        """
        Calculate a power spectrum using Stingray.
        
        Args:
            lc (Lightcurve): Stingray Lightcurve object
            **params: Parameters for the power spectrum
            
        Returns:
            dict: Results containing frequency, power, and metadata
        """
        segment_length = params.get('segment_length', 1024)
        norm = params.get('norm', 'leahy')
        
        try:
            if params.get('average', True):
                # Use AveragedPowerspectrum for multiple segments
                ps = AveragedPowerspectrum(lc, segment_length=segment_length, norm=norm)
            else:
                # Use regular Powerspectrum for a single segment
                ps = Powerspectrum(lc, norm=norm)
            
            # Get frequency range if specified
            freq_range = params.get('freq_range', (0, None))
            if freq_range != (0, None):
                ps = ps.rebin_log() if freq_range[1] is None else ps.rebin_log(f_min=freq_range[0], f_max=freq_range[1])
            
            # Create a DataFrame for easier plotting
            df = pd.DataFrame({
                'frequency': ps.freq,
                'power': ps.power,
                'power_err': ps.power_err
            })
            
            # Return structured results
            return {
                'data': {
                    'frequency': ps.freq.tolist(),
                    'power': ps.power.tolist(),
                    'power_err': ps.power_err.tolist()
                },
                'stats': {
                    'mean_power': float(np.mean(ps.power)),
                    'max_power': float(np.max(ps.power)),
                    'max_power_freq': float(ps.freq[np.argmax(ps.power)]),
                    'n_bins': len(ps.freq)
                },
                'df': df,
                'metadata': {
                    'dt': lc.dt,
                    'n_segments': ps.m if hasattr(ps, 'm') else 1,
                    'norm': norm
                }
            }
        
        except Exception as e:
            raise ValueError(f"Error in power spectrum calculation: {str(e)}")
    
    def _run_fourier_transform(self, lc, **params):
        """
        Calculate a Fourier transform.
        
        Args:
            lc (Lightcurve): Stingray Lightcurve object
            **params: Parameters for the Fourier transform
            
        Returns:
            dict: Results containing frequency, real and imaginary parts, and metadata
        """
        segment_length = params.get('segment_length', 1024)
        window_type = params.get('window', 'hanning')
        detrend = params.get('detrend', True)
        
        # Detrend if requested
        if detrend:
            counts_mean = np.mean(lc.counts)
            detrended_counts = lc.counts - np.mean(lc.counts)
        else:
            detrended_counts = lc.counts
        
        # Apply window function if not 'none'
        if window_type != 'none':
            if window_type == 'hanning':
                window = np.hanning(len(detrended_counts))
            elif window_type == 'hamming':
                window = np.hamming(len(detrended_counts))
            elif window_type == 'blackman':
                window = np.blackman(len(detrended_counts))
            elif window_type == 'bartlett':
                window = np.bartlett(len(detrended_counts))
            
            windowed_counts = detrended_counts * window
        else:
            windowed_counts = detrended_counts
        
        # Compute FFT
        fft_result = np.fft.fft(windowed_counts)
        fft_freq = np.fft.fftfreq(len(windowed_counts), d=lc.dt)
        
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
                'dt': lc.dt,
                'window': window_type,
                'detrended': detrend
            }
        }
    
    def _run_lomb_scargle(self, lc, **params):
        """
        Calculate a Lomb-Scargle periodogram for unevenly sampled data.
        
        Args:
            lc (Lightcurve): Stingray Lightcurve object
            **params: Parameters for the Lomb-Scargle periodogram
            
        Returns:
            dict: Results containing frequency, power, and metadata
        """
        from astropy.timeseries import LombScargle
        
        minimum_frequency = params.get('minimum_frequency')
        maximum_frequency = params.get('maximum_frequency')
        nyquist_factor = params.get('nyquist_factor', 1)
        samples_per_peak = params.get('samples_per_peak', 5)
        normalization = params.get('normalization', 'standard')
        
        # Create a Lomb-Scargle periodogram
        ls = LombScargle(lc.time, lc.counts, normalization=normalization)
        
        # Auto-determine frequency range if not specified
        if minimum_frequency is None or maximum_frequency is None:
            frequency, power = ls.autopower(
                nyquist_factor=nyquist_factor,
                samples_per_peak=samples_per_peak
            )
        else:
            frequency = np.linspace(minimum_frequency, maximum_frequency, 
                                  int((maximum_frequency - minimum_frequency) * samples_per_peak))
            power = ls.power(frequency)
        
        # Create DataFrame for plotting
        df = pd.DataFrame({
            'frequency': frequency,
            'power': power
        })
        
        # For Lomb-Scargle, we might want to identify peaks
        from scipy.signal import find_peaks
        peaks, _ = find_peaks(power, height=0.1*np.max(power))
        peak_freqs = frequency[peaks]
        peak_powers = power[peaks]
        
        # Sort peaks by power
        sorted_peak_idx = np.argsort(peak_powers)[::-1]
        top_peaks = [{
            'frequency': float(peak_freqs[idx]),
            'power': float(peak_powers[idx])
        } for idx in sorted_peak_idx[:5]]  # Return top 5 peaks
        
        return {
            'data': {
                'frequency': frequency.tolist(),
                'power': power.tolist()
            },
            'stats': {
                'max_power': float(np.max(power)),
                'max_power_freq': float(frequency[np.argmax(power)]),
                'n_bins': len(frequency),
                'top_peaks': top_peaks
            },
            'df': df,
            'metadata': {
                'normalization': normalization,
                'samples_per_peak': samples_per_peak
            }
        }
    
    def _run_rebin(self, lc, **params):
        """
        Rebin a light curve to a new time resolution.
        
        Args:
            lc (Lightcurve): Stingray Lightcurve object
            **params: Parameters for rebinning
            
        Returns:
            dict: Results containing rebinned light curve data
        """
        bin_time = params.get('bin_time', 1.0)
        method = params.get('method', 'sum')
        
        # Rebin using Stingray's built-in method
        if method == 'sum':
            rebinned_lc = lc.rebin(bin_time)
        else:
            # For methods Stingray doesn't directly support
            rebinned_lc = lc.rebin(bin_time)
            if method == 'mean' or method == 'average':
                # Convert summed counts to average
                rebinned_lc.counts = rebinned_lc.counts / (bin_time / lc.dt)
        
        # Create DataFrame for plotting
        df = pd.DataFrame({
            'time': rebinned_lc.time,
            'counts': rebinned_lc.counts,
            'counts_err': rebinned_lc.counts_err if hasattr(rebinned_lc, 'counts_err') else None
        })
        
        return {
            'data': {
                'time': rebinned_lc.time.tolist(),
                'counts': rebinned_lc.counts.tolist(),
                'counts_err': rebinned_lc.counts_err.tolist() if hasattr(rebinned_lc, 'counts_err') else None
            },
            'stats': {
                'mean_counts': float(np.mean(rebinned_lc.counts)),
                'total_counts': float(np.sum(rebinned_lc.counts)),
                'n_bins': len(rebinned_lc.time)
            },
            'df': df,
            'metadata': {
                'original_dt': lc.dt,
                'new_dt': rebinned_lc.dt,
                'method': method
            }
        }
    
    def _run_pds_simulation(self, **params):
        """
        Simulate a light curve with a given PDS model.
        
        Args:
            **params: Parameters for the simulation
            
        Returns:
            dict: Results containing simulated light curve data and its power spectrum
        """
        model = params.get('model', 'powerlaw')
        mean = params.get('mean', 100.0)
        rms = params.get('rms', 0.1)
        red_noise_index = params.get('red_noise_index', 1.0)
        dt = params.get('dt', 0.001)
        tlen = params.get('tlen', 1000.0)
        break_freq = params.get('break_freq')
        
        # Initialize the simulator
        sim = Simulator(
            dt=dt,
            mean=mean,
            rms=rms,
            tlen=tlen
        )
        
        # Generate the light curve based on the model type
        if model == 'powerlaw':
            lc = sim.simulate('powerlaw', [red_noise_index])
        elif model == 'broken_powerlaw' and break_freq is not None:
            lc = sim.simulate('broken_powerlaw', [red_noise_index, break_freq])
        elif model == 'lorentzian':
            # For Lorentzian, we need a centroid and width
            centroid = params.get('centroid', 0.1)
            width = params.get('width', 0.01)
            lc = sim.simulate('lorentzian', [centroid, width])
        else:
            raise ValueError(f"Unsupported model type: {model}")
        
        # Calculate the power spectrum of the simulated light curve
        ps = Powerspectrum(lc, norm='leahy')
        
        # Create DataFrames for plotting
        lc_df = pd.DataFrame({
            'time': lc.time,
            'counts': lc.counts
        })
        
        ps_df = pd.DataFrame({
            'frequency': ps.freq,
            'power': ps.power
        })
        
        return {
            'data': {
                'time': lc.time.tolist(),
                'counts': lc.counts.tolist(),
                'frequency': ps.freq.tolist(),
                'power': ps.power.tolist()
            },
            'stats': {
                'mean_counts': float(np.mean(lc.counts)),
                'total_counts': float(np.sum(lc.counts)),
                'rms_measured': float(np.std(lc.counts) / np.mean(lc.counts)),
                'n_bins': len(lc.time)
            },
            'lc_df': lc_df,
            'ps_df': ps_df,
            'metadata': {
                'model': model,
                'dt': dt,
                'tlen': tlen,
                'mean': mean,
                'rms': rms,
                'red_noise_index': red_noise_index
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
        # Use HoloViews with Bokeh backend to create the plot
        if analysis_type == 'power_spectrum':
            return self._plot_power_spectrum(result_data)
        elif analysis_type == 'fourier_transform':
            return self._plot_fourier_transform(result_data)
        elif analysis_type == 'lomb_scargle':
            return self._plot_lomb_scargle(result_data)
        elif analysis_type == 'rebin':
            return self._plot_light_curve(result_data)
        elif analysis_type == 'pds_simulation':
            return self._plot_simulation(result_data)
        else:
            raise ValueError(f"No plotting function for analysis type: {analysis_type}")
    
    def _plot_power_spectrum(self, result_data):
        """
        Plot a power spectrum.
        
        Args:
            result_data (dict): Results from _run_power_spectrum
            
        Returns:
            dict: Plot data
        """
        df = result_data['df']
        
        # Create a HoloViews plot
        plot = df.hvplot.line(
            x='frequency', 
            y='power',
            title='Power Spectrum',
            xlabel='Frequency (Hz)',
            ylabel='Power',
            logx=True,
            logy=True,
            height=400,
            width=700
        )
        
        # Add error bars if available
        if 'power_err' in df.columns and not df['power_err'].isna().all():
            error_bars = hv.ErrorBars(
                (df['frequency'], df['power'], df['power_err'])
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
    
    def _plot_lomb_scargle(self, result_data):
        """
        Plot a Lomb-Scargle periodogram.
        
        Args:
            result_data (dict): Results from _run_lomb_scargle
            
        Returns:
            dict: Plot data
        """
        df = result_data['df']
        top_peaks = result_data['stats']['top_peaks']
        
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
        
        # Add markers for top peaks
        if top_peaks:
            peak_data = pd.DataFrame(top_peaks)
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
            result_data (dict): Results with a light curve (e.g., from rebinning)
            
        Returns:
            dict: Plot data
        """
        df = result_data['df']
        
        # Create a HoloViews plot
        plot = df.hvplot.line(
            x='time', 
            y='counts',
            title='Light Curve',
            xlabel='Time (s)',
            ylabel='Counts',
            height=400,
            width=700
        )
        
        # Add error bars if available
        if 'counts_err' in df.columns and not df['counts_err'].isna().all():
            error_bars = hv.ErrorBars(
                (df['time'], df['counts'], df['counts_err'])
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
    
    def _plot_simulation(self, result_data):
        """
        Plot a simulated light curve and its power spectrum.
        
        Args:
            result_data (dict): Results from _run_pds_simulation
            
        Returns:
            dict: Plot data
        """
        lc_df = result_data['lc_df']
        ps_df = result_data['ps_df']
        
        # Create light curve plot
        lc_plot = lc_df.hvplot.line(
            x='time', 
            y='counts',
            title='Simulated Light Curve',
            xlabel='Time (s)',
            ylabel='Counts',
            height=300,
            width=700
        )
        
        # Create power spectrum plot
        ps_plot = ps_df.hvplot.line(
            x='frequency', 
            y='power',
            title='Power Spectrum of Simulation',
            xlabel='Frequency (Hz)',
            ylabel='Power',
            logx=True,
            logy=True,
            height=300,
            width=700
        )
        
        # Combine the plots
        combined_plot = lc_plot + ps_plot
        
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
