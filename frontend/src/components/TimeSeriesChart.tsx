import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';

// Define the interface for time series data point
interface TimeSeriesDataPoint {
    date: string;
    value: number;
}

// Mock data - In a real application, this would come from your backend
const generateTimeSeriesData = (points: number, seed: number = 0): TimeSeriesDataPoint[] => {
    const data: TimeSeriesDataPoint[] = [];
    const today = new Date();

    for (let i = 0; i < points; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (points - i));

        // Generate a "random" value based on seed and i
        const value = 500 + 300 * Math.sin(i * 0.1 + seed) + Math.random() * 50;

        data.push({
            date: date.toISOString().split('T')[0],
            value: Math.round(value)
        });
    }

    return data;
};

// Available colors for plots
const plotColors = ['#3f51b5', '#f50057', '#ff9800', '#4caf50', '#2196f3', '#9c27b0'];

interface TimeSeriesChartProps {
    chartId: number;
    height: number;
    plotCount: number;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ chartId, height, plotCount }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // In a real application, you would use a charting library like Chart.js, Recharts, or D3.js
        // For this example, we'll just render a placeholder

        if (chartRef.current) {
            const ctx = chartRef.current;

            // Clear previous content
            ctx.innerHTML = '';

            if (plotCount === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-chart-message';
                emptyMessage.style.display = 'flex';
                emptyMessage.style.alignItems = 'center';
                emptyMessage.style.justifyContent = 'center';
                emptyMessage.style.height = '100%';
                emptyMessage.style.color = '#666';
                emptyMessage.textContent = 'Add a plot to display data';

                ctx.appendChild(emptyMessage);
                return;
            }

            // Create a simple visualization
            const chartContainer = document.createElement('div');
            chartContainer.style.position = 'relative';
            chartContainer.style.height = '100%';
            chartContainer.style.width = '100%';

            // Create X-axis (time)
            const xAxis = document.createElement('div');
            xAxis.style.position = 'absolute';
            xAxis.style.bottom = '20px';
            xAxis.style.left = '40px';
            xAxis.style.right = '20px';
            xAxis.style.height = '1px';
            xAxis.style.backgroundColor = '#ddd';

            // Add month labels
            const months = ['October', 'November', 'December', '2017', 'February'];
            months.forEach((month, index) => {
                const label = document.createElement('div');
                label.style.position = 'absolute';
                label.style.bottom = '0';
                label.style.left = `${index * 25}%`;
                label.style.transform = 'translateX(-50%)';
                label.style.fontSize = '10px';
                label.style.color = '#666';
                label.textContent = month;

                xAxis.appendChild(label);
            });

            chartContainer.appendChild(xAxis);

            // Create Y-axis
            const yAxis = document.createElement('div');
            yAxis.style.position = 'absolute';
            yAxis.style.left = '40px';
            yAxis.style.top = '20px';
            yAxis.style.bottom = '20px';
            yAxis.style.width = '1px';
            yAxis.style.backgroundColor = '#ddd';

            // Add value labels
            const maxValue = 900;
            const minValue = 700;
            const valueStep = (maxValue - minValue) / 4;

            for (let i = 0; i <= 4; i++) {
                const label = document.createElement('div');
                label.style.position = 'absolute';
                label.style.right = '5px';
                label.style.top = `${100 - i * 25}%`;
                label.style.transform = 'translateY(-50%)';
                label.style.fontSize = '10px';
                label.style.color = '#666';
                label.textContent = (minValue + i * valueStep).toString();

                yAxis.appendChild(label);
            }

            chartContainer.appendChild(yAxis);

            // Create plot areas with different colors
            for (let i = 0; i < plotCount; i++) {
                const color = plotColors[i % plotColors.length];
                const data = generateTimeSeriesData(100, i);

                // Draw a simple line representing the data
                const plotContainer = document.createElement('div');
                plotContainer.style.position = 'absolute';
                plotContainer.style.left = '40px';
                plotContainer.style.right = '20px';
                plotContainer.style.top = '20px';
                plotContainer.style.bottom = '20px';
                plotContainer.style.pointerEvents = 'none';

                // Create a colored box to indicate highlight zones (like in the screenshot)
                if (i === 0 && chartId === 1) {
                    const highlightZone = document.createElement('div');
                    highlightZone.style.position = 'absolute';
                    highlightZone.style.left = '40%';
                    highlightZone.style.width = '20%';
                    highlightZone.style.top = '20%';
                    highlightZone.style.bottom = '30%';
                    highlightZone.style.backgroundColor = `${color}22`;
                    highlightZone.style.border = `1px solid ${color}`;

                    plotContainer.appendChild(highlightZone);
                }

                if (i === 1 && chartId === 1) {
                    const highlightZone = document.createElement('div');
                    highlightZone.style.position = 'absolute';
                    highlightZone.style.left = '60%';
                    highlightZone.style.width = '20%';
                    highlightZone.style.top = '40%';
                    highlightZone.style.bottom = '20%';
                    highlightZone.style.backgroundColor = `${color}22`;
                    highlightZone.style.border = `1px solid ${color}`;

                    plotContainer.appendChild(highlightZone);
                }

                // Create simple SVG line
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');

                let pathData = '';
                data.forEach((point, index) => {
                    const x = (index / (data.length - 1)) * 100;
                    const normalizedValue = (point.value - minValue) / (maxValue - minValue);
                    const y = 100 - normalizedValue * 100;

                    if (index === 0) {
                        pathData = `M ${x} ${y}`;
                    } else {
                        pathData += ` L ${x} ${y}`;
                    }
                });

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', pathData);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', '2');

                svg.appendChild(path);
                plotContainer.appendChild(svg);

                // Add colored label on the right side
                const label = document.createElement('div');
                label.style.position = 'absolute';
                label.style.top = '5px';
                label.style.right = '-15px';
                label.style.backgroundColor = color;
                label.style.color = 'white';
                label.style.padding = '2px 5px';
                label.style.borderRadius = '3px';
                label.style.fontSize = '10px';
                label.textContent = ['A', 'B', 'C'][i % 3];

                plotContainer.appendChild(label);

                chartContainer.appendChild(plotContainer);
            }

            // For Chart 2, create a different style chart (like the yellow area in the screenshot)
            if (chartId === 2) {
                const areaContainer = document.createElement('div');
                areaContainer.style.position = 'absolute';
                areaContainer.style.left = '40px';
                areaContainer.style.right = '20px';
                areaContainer.style.top = '20px';
                areaContainer.style.bottom = '20px';

                // Create simple SVG area
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');

                const data = generateTimeSeriesData(100, 5);

                let pathData = '';
                data.forEach((point, index) => {
                    const x = (index / (data.length - 1)) * 100;
                    const normalizedValue = Math.min(0.8, Math.max(0.1, (point.value - 700) / 200));
                    const y = 100 - normalizedValue * 100;

                    if (index === 0) {
                        pathData = `M ${x} ${y}`;
                    } else {
                        pathData += ` L ${x} ${y}`;
                    }
                });

                // Close the path to create an area
                pathData += ` L 100 100 L 0 100 Z`;

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', pathData);
                path.setAttribute('fill', 'rgba(255, 193, 7, 0.2)');
                path.setAttribute('stroke', '#ffc107');
                path.setAttribute('stroke-width', '2');

                svg.appendChild(path);
                areaContainer.appendChild(svg);

                // Create highlight zone (like in the screenshot)
                const highlightZone = document.createElement('div');
                highlightZone.style.position = 'absolute';
                highlightZone.style.left = '30%';
                highlightZone.style.width = '25%';
                highlightZone.style.top = '10%';
                highlightZone.style.bottom = '30%';
                highlightZone.style.backgroundColor = 'rgba(255, 193, 7, 0.2)';
                highlightZone.style.border = '1px solid #ffc107';

                areaContainer.appendChild(highlightZone);

                // Add colored label on the right
                const label = document.createElement('div');
                label.style.position = 'absolute';
                label.style.top = '5px';
                label.style.right = '-15px';
                label.style.backgroundColor = '#ffc107';
                label.style.color = 'white';
                label.style.padding = '2px 5px';
                label.style.borderRadius = '3px';
                label.style.fontSize = '10px';
                label.textContent = 'C';

                areaContainer.appendChild(label);

                chartContainer.appendChild(areaContainer);
            }

            // For Chart 3, create a different style chart (purple line)
            if (chartId === 3) {
                const lineContainer = document.createElement('div');
                lineContainer.style.position = 'absolute';
                lineContainer.style.left = '40px';
                lineContainer.style.right = '20px';
                lineContainer.style.top = '20px';
                lineContainer.style.bottom = '20px';

                // Create simple SVG line
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');

                const data = generateTimeSeriesData(100, 3);

                let pathData = '';
                data.forEach((point, index) => {
                    const x = (index / (data.length - 1)) * 100;
                    // Generate more extreme values for this chart
                    const normalizedValue = (Math.sin(index * 0.2) + 1) / 2;
                    const y = 100 - normalizedValue * 100;

                    if (index === 0) {
                        pathData = `M ${x} ${y}`;
                    } else {
                        pathData += ` L ${x} ${y}`;
                    }
                });

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', pathData);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', '#9c27b0');
                path.setAttribute('stroke-width', '2');

                svg.appendChild(path);
                lineContainer.appendChild(svg);

                // Create reference line
                const referenceLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                referenceLine.setAttribute('x1', '0');
                referenceLine.setAttribute('y1', '70');
                referenceLine.setAttribute('x2', '100');
                referenceLine.setAttribute('y2', '70');
                referenceLine.setAttribute('stroke', '#9c27b0');
                referenceLine.setAttribute('stroke-width', '1');
                referenceLine.setAttribute('stroke-dasharray', '4');

                svg.appendChild(referenceLine);

                // Add value tooltip near the reference line
                const tooltip = document.createElement('div');
                tooltip.style.position = 'absolute';
                tooltip.style.top = '65%';
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translate(-50%, -50%)';
                tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                tooltip.style.color = 'white';
                tooltip.style.padding = '2px 6px';
                tooltip.style.borderRadius = '3px';
                tooltip.style.fontSize = '10px';
                tooltip.textContent = '4.77002';

                lineContainer.appendChild(tooltip);

                // Add colored label on the right
                const label = document.createElement('div');
                label.style.position = 'absolute';
                label.style.top = '5px';
                label.style.right = '-15px';
                label.style.backgroundColor = '#9c27b0';
                label.style.color = 'white';
                label.style.padding = '2px 5px';
                label.style.borderRadius = '3px';
                label.style.fontSize = '10px';
                label.textContent = 'E';

                lineContainer.appendChild(label);

                chartContainer.appendChild(lineContainer);
            }

            // For Chart 5, create a scatter plot
            if (chartId === 5) {
                const scatterContainer = document.createElement('div');
                scatterContainer.style.position = 'absolute';
                scatterContainer.style.left = '40px';
                scatterContainer.style.right = '20px';
                scatterContainer.style.top = '20px';
                scatterContainer.style.bottom = '20px';

                // Create simple SVG for scatter plot
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');

                // Create 50 random dots
                for (let i = 0; i < 50; i++) {
                    const x = Math.random() * 100;
                    const y = Math.random() * 100;

                    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    dot.setAttribute('cx', x.toString());
                    dot.setAttribute('cy', y.toString());
                    dot.setAttribute('r', '3');
                    dot.setAttribute('fill', '#8bc34a');

                    svg.appendChild(dot);
                }

                // Add trend line
                const trendLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                trendLine.setAttribute('x1', '20');
                trendLine.setAttribute('y1', '80');
                trendLine.setAttribute('x2', '80');
                trendLine.setAttribute('y2', '30');
                trendLine.setAttribute('stroke', '#795548');
                trendLine.setAttribute('stroke-width', '2');

                svg.appendChild(trendLine);

                scatterContainer.appendChild(svg);

                // Add colored labels on the right
                const label1 = document.createElement('div');
                label1.style.position = 'absolute';
                label1.style.top = '5px';
                label1.style.right = '-15px';
                label1.style.backgroundColor = '#8bc34a';
                label1.style.color = 'white';
                label1.style.padding = '2px 5px';
                label1.style.borderRadius = '3px';
                label1.style.fontSize = '10px';
                label1.textContent = 'SH';

                const label2 = document.createElement('div');
                label2.style.position = 'absolute';
                label2.style.top = '30px';
                label2.style.right = '-15px';
                label2.style.backgroundColor = '#795548';
                label2.style.color = 'white';
                label2.style.padding = '2px 5px';
                label2.style.borderRadius = '3px';
                label2.style.fontSize = '10px';
                label2.textContent = 'R';

                scatterContainer.appendChild(label1);
                scatterContainer.appendChild(label2);

                chartContainer.appendChild(scatterContainer);
            }

            // For Chart 6, create a histogram
            if (chartId === 6) {
                const histogramContainer = document.createElement('div');
                histogramContainer.style.position = 'absolute';
                histogramContainer.style.left = '40px';
                histogramContainer.style.right = '20px';
                histogramContainer.style.top = '20px';
                histogramContainer.style.bottom = '20px';

                // Create simple SVG for histogram
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');

                // Create histogram bars
                const numBars = 15;
                const barWidth = 100 / numBars;

                for (let i = 0; i < numBars; i++) {
                    // Generate random height but with a bell curve distribution
                    const height = 80 * Math.exp(-0.5 * Math.pow((i - numBars / 2) / (numBars / 5), 2)) + Math.random() * 10;

                    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    bar.setAttribute('x', (i * barWidth).toString());
                    bar.setAttribute('y', (100 - height).toString());
                    bar.setAttribute('width', (barWidth * 0.8).toString());
                    bar.setAttribute('height', height.toString());
                    bar.setAttribute('fill', '#9575cd');

                    svg.appendChild(bar);
                }

                histogramContainer.appendChild(svg);

                // Add colored label on the right
                const label = document.createElement('div');
                label.style.position = 'absolute';
                label.style.top = '5px';
                label.style.right = '-15px';
                label.style.backgroundColor = '#9575cd';
                label.style.color = 'white';
                label.style.padding = '2px 5px';
                label.style.borderRadius = '3px';
                label.style.fontSize = '10px';
                label.textContent = 'D';

                histogramContainer.appendChild(label);

                chartContainer.appendChild(histogramContainer);
            }

            ctx.appendChild(chartContainer);
        }
    }, [chartId, height, plotCount]);

    return (
        <Box
            ref={chartRef}
            sx={{
                width: '100%',
                height: `${height}px`,
                bgcolor: 'background.paper',
                borderRadius: 1,
                overflow: 'hidden'
            }}
        />
    );
};

export default TimeSeriesChart; 