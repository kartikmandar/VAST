import numpy as np
import json
from bokeh.embed import json_item, components
import holoviews as hv
from holoviews import opts
import hvplot.pandas
import pandas as pd

# Configure Holoviews to use Bokeh
hv.extension('bokeh')

def create_light_curve_plot(time, values, errors=None, title="Light Curve", 
                            x_label="Time", y_label="Counts", **kwargs):
    """
    Create a light curve plot using HoloViews.
    
    Args:
        time (array-like): Time values
        values (array-like): Count or flux values
        errors (array-like, optional): Error values
        title (str): Plot title
        x_label (str): X-axis label
        y_label (str): Y-axis label
        **kwargs: Additional parameters for hvplot
        
    Returns:
        holoviews.element: HoloViews plot object
    """
    # Create a DataFrame for plotting
    df = pd.DataFrame({
        'time': time,
        'value': values
    })
    
    if errors is not None:
        df['error'] = errors
    
    # Default plot parameters
    plot_params = {
        'x': 'time',
        'y': 'value',
        'title': title,
        'xlabel': x_label,
        'ylabel': y_label,
        'height': 400,
        'width': 700
    }
    
    # Update with user parameters
    plot_params.update(kwargs)
    
    # Create the plot
    plot = df.hvplot.line(**plot_params)
    
    # Add error bars if available
    if errors is not None:
        error_bars = hv.ErrorBars((df['time'], df['value'], df['error'])).opts(line_width=1)
        plot = plot * error_bars
    
    # Add standard tools
    plot = plot.opts(
        opts.Line(tools=['hover', 'box_zoom', 'reset', 'save'], 
                active_tools=['box_zoom'])
    )
    
    return plot

def create_power_spectrum_plot(frequency, power, errors=None, title="Power Spectrum",
                              x_label="Frequency (Hz)", y_label="Power", log_scale=True, **kwargs):
    """
    Create a power spectrum plot using HoloViews.
    
    Args:
        frequency (array-like): Frequency values
        power (array-like): Power values
        errors (array-like, optional): Error values
        title (str): Plot title
        x_label (str): X-axis label
        y_label (str): Y-axis label
        log_scale (bool): Whether to use log scale for axes
        **kwargs: Additional parameters for hvplot
        
    Returns:
        holoviews.element: HoloViews plot object
    """
    # Create a DataFrame for plotting
    df = pd.DataFrame({
        'frequency': frequency,
        'power': power
    })
    
    if errors is not None:
        df['error'] = errors
    
    # Default plot parameters
    plot_params = {
        'x': 'frequency',
        'y': 'power',
        'title': title,
        'xlabel': x_label,
        'ylabel': y_label,
        'height': 400,
        'width': 700
    }
    
    # Add log scales if requested
    if log_scale:
        plot_params['logx'] = True
        plot_params['logy'] = True
    
    # Update with user parameters
    plot_params.update(kwargs)
    
    # Create the plot
    plot = df.hvplot.line(**plot_params)
    
    # Add error bars if available
    if errors is not None:
        error_bars = hv.ErrorBars((df['frequency'], df['power'], df['error'])).opts(line_width=1)
        plot = plot * error_bars
    
    # Add standard tools
    plot = plot.opts(
        opts.Line(tools=['hover', 'box_zoom', 'reset', 'save'], 
                active_tools=['box_zoom'])
    )
    
    return plot

def create_periodogram_plot(frequency, power, peaks=None, title="Periodogram",
                           x_label="Frequency (Hz)", y_label="Power", **kwargs):
    """
    Create a periodogram plot with optional peak markers.
    
    Args:
        frequency (array-like): Frequency values
        power (array-like): Power values
        peaks (list, optional): List of dicts with 'frequency' and 'power' keys
        title (str): Plot title
        x_label (str): X-axis label
        y_label (str): Y-axis label
        **kwargs: Additional parameters for hvplot
        
    Returns:
        holoviews.element: HoloViews plot object
    """
    # Create a DataFrame for plotting
    df = pd.DataFrame({
        'frequency': frequency,
        'power': power
    })
    
    # Default plot parameters
    plot_params = {
        'x': 'frequency',
        'y': 'power',
        'title': title,
        'xlabel': x_label,
        'ylabel': y_label,
        'height': 400,
        'width': 700
    }
    
    # Update with user parameters
    plot_params.update(kwargs)
    
    # Create the plot
    plot = df.hvplot.line(**plot_params)
    
    # Add peak markers if available
    if peaks is not None and len(peaks) > 0:
        peak_data = pd.DataFrame(peaks)
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
    
    # Add standard tools
    plot = plot.opts(
        opts.Line(tools=['hover', 'box_zoom', 'reset', 'save'], 
                active_tools=['box_zoom'])
    )
    
    return plot

def create_fourier_transform_plot(frequency, amplitude, real=None, imag=None, 
                                 title="Fourier Transform", **kwargs):
    """
    Create a multi-panel Fourier transform plot.
    
    Args:
        frequency (array-like): Frequency values
        amplitude (array-like): Amplitude values
        real (array-like, optional): Real part values
        imag (array-like, optional): Imaginary part values
        title (str): Main plot title
        **kwargs: Additional parameters for hvplot
        
    Returns:
        holoviews.element: HoloViews plot object
    """
    # Create a DataFrame for plotting
    df = pd.DataFrame({
        'frequency': frequency,
        'amplitude': amplitude
    })
    
    if real is not None:
        df['real'] = real
    
    if imag is not None:
        df['imag'] = imag
    
    # Create amplitude plot
    amplitude_plot = df.hvplot.line(
        x='frequency', 
        y='amplitude',
        title=title,
        xlabel='Frequency (Hz)',
        ylabel='Amplitude',
        height=400,
        width=700
    )
    
    # Create combined plot with optional real/imag panels
    if real is not None and imag is not None:
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
    else:
        combined_plot = amplitude_plot
    
    # Add standard tools
    combined_plot = combined_plot.opts(
        opts.Line(tools=['hover', 'box_zoom', 'reset', 'save'], 
                active_tools=['box_zoom'])
    )
    
    return combined_plot

def render_plot_outputs(plot):
    """
    Render a HoloViews plot to multiple output formats.
    
    Args:
        plot (holoviews.element): HoloViews plot object
        
    Returns:
        dict: Dictionary with various output formats
    """
    # Render to Bokeh figure
    bokeh_plot = hv.render(plot)
    
    # Get HTML components
    script, div = components(bokeh_plot)
    
    return {
        'html': hv.save(plot, fmt='html'),
        'json_data': json.dumps(json_item(bokeh_plot)),
        'script': script,
        'div': div
    }

def create_multi_series_plot(data_dict, x_key, title="Multi-Series Plot", 
                            x_label="X", y_label="Y", **kwargs):
    """
    Create a plot with multiple data series.
    
    Args:
        data_dict (dict): Dictionary mapping series names to DataFrames
        x_key (str): Name of x-axis column present in all DataFrames
        title (str): Plot title
        x_label (str): X-axis label
        y_label (str): Y-axis label
        **kwargs: Additional parameters for hvplot
        
    Returns:
        holoviews.element: HoloViews plot object
    """
    # Default plot parameters
    plot_params = {
        'xlabel': x_label,
        'ylabel': y_label,
        'height': 400,
        'width': 700
    }
    
    # Update with user parameters
    plot_params.update(kwargs)
    
    # Create overlay of multiple curves
    curves = []
    
    for name, df in data_dict.items():
        y_key = [col for col in df.columns if col != x_key][0]  # Assume first non-x column is y
        curve = df.hvplot.line(
            x=x_key, 
            y=y_key,
            label=name,
            **plot_params
        )
        curves.append(curve)
    
    # Combine into overlay
    if curves:
        plot = curves[0]
        for curve in curves[1:]:
            plot = plot * curve
    else:
        # If no curves, return an empty plot
        plot = hv.Curve([], x_label, y_label)
    
    # Set title
    plot = plot.relabel(title)
    
    # Add standard tools
    plot = plot.opts(
        opts.Overlay(legend_position='right'),
        opts.Curve(tools=['hover', 'box_zoom', 'reset', 'save'], 
                 active_tools=['box_zoom'])
    )
    
    return plot
