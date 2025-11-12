import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Paper,
    Grid,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Tabs,
    Tab,
    Divider,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Share as ShareIcon,
    Download as DownloadIcon,
    Fullscreen as FullscreenIcon,
    Settings as SettingsIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { analysisService, dataService } from '../api';
// Use direct file paths if TypeScript can't find modules
import TimeSeriesChart from '../components/TimeSeriesChart.tsx';
import TimeSeriesEditor from '../components/TimeSeriesEditor.tsx';

const TimeSeriesVisualizationPage: React.FC = () => {
    const { analysisId } = useParams<{ analysisId: string }>();
    const navigate = useNavigate();

    // State for the analysis details
    const [analysisName, setAnalysisName] = useState<string>('Time Series Analysis');
    const [analysisDate, setAnalysisDate] = useState<string>(new Date().toISOString());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for charts
    const [charts, setCharts] = useState<any[]>([
        { id: 1, title: 'Chart 1', plots: 3 },
        { id: 2, title: 'Chart 2', plots: 1 },
        { id: 3, title: 'Chart 3', plots: 1 },
        { id: 4, title: 'Chart 4', plots: 2 },
        { id: 5, title: 'Chart 5', plots: 2 },
        { id: 6, title: 'Chart 6', plots: 1 }
    ]);

    // State for the editor UI
    const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
    const [selectedChart, setSelectedChart] = useState<number | null>(null);

    // Menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        const fetchAnalysisData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                if (analysisId) {
                    // Fetch the analysis details
                    // Replace with actual API call when ready
                    setTimeout(() => {
                        setAnalysisName('Time Series Analysis Created on 2018-01-30 02:06:45 PM (PST)');
                        setAnalysisDate('2018-01-30T14:06:45');
                        setIsLoading(false);
                    }, 1000);
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Failed to fetch analysis data:', err);
                setError('Failed to load analysis data. Please try again later.');
                setIsLoading(false);
            }
        };

        fetchAnalysisData();
    }, [analysisId]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleAddChart = () => {
        const newChartId = Math.max(...charts.map(chart => chart.id)) + 1;
        setCharts([...charts, { id: newChartId, title: `Chart ${newChartId}`, plots: 0 }]);
    };

    const handleOpenEditor = (chartId: number) => {
        setSelectedChart(chartId);
        setIsEditorOpen(true);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setSelectedChart(null);
    };

    const handleAddPlot = (chartId: number) => {
        setCharts(charts.map(chart =>
            chart.id === chartId
                ? { ...chart, plots: chart.plots + 1 }
                : chart
        ));
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isEditorOpen && selectedChart !== null) {
        return (
            <TimeSeriesEditor
                chartId={selectedChart}
                onClose={handleCloseEditor}
                onSave={() => {
                    handleCloseEditor();
                    // Add save logic here
                }}
            />
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">{analysisName}</Typography>
                <Box>
                    <Tooltip title="Share">
                        <IconButton>
                            <ShareIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="New Chart">
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddChart}
                            sx={{ mx: 1 }}
                        >
                            New Chart
                        </Button>
                    </Tooltip>
                    <Tooltip title="More options">
                        <IconButton onClick={handleMenuOpen}>
                            <MoreVertIcon />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleMenuClose}>Export All Charts</MenuItem>
                        <MenuItem onClick={handleMenuClose}>Download Data</MenuItem>
                        <MenuItem onClick={handleMenuClose}>Save Analysis</MenuItem>
                        <Divider />
                        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>Delete Analysis</MenuItem>
                    </Menu>
                </Box>
            </Box>

            {/* Charts Grid */}
            <Grid container spacing={2}>
                {charts.map(chart => (
                    <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} key={chart.id}>
                        <Paper sx={{ p: 2, height: '350px', position: 'relative' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1">Chart {chart.id}</Typography>
                                <Box>
                                    <Tooltip title="Add Plot">
                                        <IconButton size="small" onClick={() => handleAddPlot(chart.id)}>
                                            <AddIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit Chart">
                                        <IconButton size="small" onClick={() => handleOpenEditor(chart.id)}>
                                            <SettingsIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Fullscreen">
                                        <IconButton size="small">
                                            <FullscreenIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Download">
                                        <IconButton size="small">
                                            <DownloadIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton size="small">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <TimeSeriesChart
                                chartId={chart.id}
                                height={300}
                                plotCount={chart.plots}
                            />
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default TimeSeriesVisualizationPage; 