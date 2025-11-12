import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Paper,
    Grid,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Stepper,
    Step,
    StepLabel,
    SelectChangeEvent,
    CircularProgress,
    Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService, analysisService, DataFile, ParameterSet, AnalysisJob, CreateAnalysisJob } from '../api';

const AnalysisPage: React.FC = () => {
    const { jobId } = useParams<'jobId'>() || {};
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState<number>(jobId ? 2 : 0);
    const [selectedDataset, setSelectedDataset] = useState<string>('');
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('');
    const [selectedParameterSet, setSelectedParameterSet] = useState<string>('');
    const [analysisName, setAnalysisName] = useState<string>('');
    const [analysisDescription, setAnalysisDescription] = useState<string>('');

    // State for API data
    const [datasets, setDatasets] = useState<DataFile[]>([]);
    const [parameterSets, setParameterSets] = useState<ParameterSet[]>([]);
    const [currentJob, setCurrentJob] = useState<AnalysisJob | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Analysis types - these are constants in our app
    const analysisTypes = [
        { id: 'power_spectrum', name: 'Power Spectrum' },
        { id: 'fourier_transform', name: 'Fourier Transform' },
        { id: 'light_curve', name: 'Light Curve' },
    ];

    // Fetch data when component mounts
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch datasets
                console.log('Fetching datasets...');
                const datasetsResult = await dataService.getDataFiles();
                console.log('Datasets received:', datasetsResult);
                setDatasets(datasetsResult);

                // Fetch parameter sets
                console.log('Fetching parameter sets...');
                const parameterSetsResult = await analysisService.getParameterSets();
                console.log('Parameter sets received:', parameterSetsResult);
                setParameterSets(parameterSetsResult);

                // If jobId is provided, fetch the job details
                if (jobId) {
                    console.log('Fetching job details for:', jobId);
                    const job = await analysisService.getAnalysisJob(jobId);
                    console.log('Job details received:', job);
                    setCurrentJob(job);
                    setSelectedDataset(String(job.data_file));
                    setSelectedAnalysisType(job.analysis_type);
                    // Set default values for other fields
                    setAnalysisName("Analysis " + job.id);
                    setAnalysisDescription("");
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load necessary data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [jobId]);

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleDatasetChange = (event: SelectChangeEvent) => {
        setSelectedDataset(event.target.value as string);
    };

    const handleAnalysisTypeChange = (event: SelectChangeEvent) => {
        const newAnalysisType = event.target.value as string;
        setSelectedAnalysisType(newAnalysisType);

        // Filter parameter sets by analysis type
        const compatibleParameterSets = parameterSets.filter(
            ps => ps.analysis_type === newAnalysisType
        );

        // If there's a default parameter set, select it
        // Compatibility: checking is_public instead of is_default
        const defaultParameterSet = compatibleParameterSets.find(ps => ps.is_public);
        if (defaultParameterSet) {
            setSelectedParameterSet(String(defaultParameterSet.id));
        } else if (compatibleParameterSets.length > 0) {
            // Otherwise select the first one
            setSelectedParameterSet(String(compatibleParameterSets[0].id));
        } else {
            // Clear selection if no compatible parameter sets
            setSelectedParameterSet('');
        }
    };

    const handleParameterSetChange = (event: SelectChangeEvent) => {
        setSelectedParameterSet(event.target.value as string);
    };

    const handleRunAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!selectedDataset || !selectedAnalysisType || !selectedParameterSet || !analysisName) {
                setError('Please fill in all required fields.');
                return;
            }

            const analysisJob: CreateAnalysisJob = {
                name: analysisName,
                description: analysisDescription || undefined,
                data_file: selectedDataset,
                parameter_set: selectedParameterSet,
                analysis_type: selectedAnalysisType
            };

            const newJob = await analysisService.createAnalysisJob(analysisJob);

            // Navigate to the results page or job details
            navigate(`/results/${newJob.id}`);
        } catch (err) {
            console.error('Failed to start analysis:', err);
            setError('Failed to start analysis. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Select Dataset', 'Configure Analysis', 'Run Analysis'];

    if (loading && !datasets.length) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {jobId ? 'Analysis Job Details' : 'New Analysis'}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {activeStep === 0 && (
                    <Grid container spacing={3}>
                        <Grid sx={{ gridColumn: 'span 12' }}>
                            <FormControl fullWidth>
                                <InputLabel>Select Dataset</InputLabel>
                                <Select
                                    value={selectedDataset}
                                    onChange={handleDatasetChange}
                                    label="Select Dataset"
                                >
                                    {datasets.length === 0 ? (
                                        <MenuItem disabled>No datasets available</MenuItem>
                                    ) : (
                                        datasets.map((dataset) => (
                                            <MenuItem key={dataset.id} value={dataset.id}>
                                                {dataset.name} ({dataset.file_type})
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid sx={{ gridColumn: 'span 12', mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={!selectedDataset}
                            >
                                Next
                            </Button>
                        </Grid>
                    </Grid>
                )}

                {activeStep === 1 && (
                    <Grid container spacing={3}>
                        <Grid sx={{ gridColumn: 'span 12' }}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Analysis Type</InputLabel>
                                <Select
                                    value={selectedAnalysisType}
                                    onChange={handleAnalysisTypeChange}
                                    label="Analysis Type"
                                >
                                    {analysisTypes.map((type) => (
                                        <MenuItem key={type.id} value={type.id}>
                                            {type.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {selectedAnalysisType && (
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <InputLabel>Parameter Set</InputLabel>
                                    <Select
                                        value={selectedParameterSet}
                                        onChange={handleParameterSetChange}
                                        label="Parameter Set"
                                        disabled={!selectedAnalysisType}
                                    >
                                        {parameterSets
                                            .filter(ps => ps.analysis_type === selectedAnalysisType)
                                            .map((ps) => (
                                                <MenuItem key={ps.id} value={ps.id}>
                                                    {ps.name} {ps.is_public ? '(Default)' : ''}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            )}

                            <TextField
                                fullWidth
                                label="Analysis Name"
                                variant="outlined"
                                value={analysisName}
                                onChange={(e) => setAnalysisName(e.target.value)}
                                sx={{ mb: 3 }}
                            />

                            <TextField
                                fullWidth
                                label="Description"
                                variant="outlined"
                                multiline
                                rows={3}
                                value={analysisDescription}
                                onChange={(e) => setAnalysisDescription(e.target.value)}
                                sx={{ mb: 3 }}
                            />
                        </Grid>
                        <Grid sx={{ gridColumn: 'span 12' }}>
                            <Button
                                variant="outlined"
                                onClick={handleBack}
                                sx={{ mr: 2 }}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={!selectedAnalysisType || !selectedParameterSet || !analysisName}
                            >
                                Next
                            </Button>
                        </Grid>
                    </Grid>
                )}

                {activeStep === 2 && (
                    <Grid container spacing={3}>
                        <Grid sx={{ gridColumn: 'span 12' }}>
                            <Typography variant="h6" gutterBottom>
                                Analysis Ready to Run
                            </Typography>

                            {currentJob ? (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Job Status: {currentJob.status}
                                    </Typography>
                                    <Typography paragraph>
                                        This analysis job is {currentJob.status.toLowerCase()}.
                                        {currentJob.status === 'SUCCESS' && ' You can view the results by clicking the button below.'}
                                    </Typography>

                                    {currentJob.status === 'SUCCESS' && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => navigate(`/results/${currentJob.id}`)}
                                            sx={{ mr: 2 }}
                                        >
                                            View Results
                                        </Button>
                                    )}
                                </Box>
                            ) : (
                                <Box>
                                    <Typography paragraph>
                                        Your analysis job is configured and ready to run.
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleRunAnalysis}
                                        disabled={loading}
                                        sx={{ mr: 2 }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'Start Analysis'}
                                    </Button>
                                </Box>
                            )}

                            <Button
                                variant="outlined"
                                onClick={handleBack}
                                disabled={loading}
                            >
                                Back
                            </Button>
                        </Grid>
                    </Grid>
                )}
            </Paper>
        </Box>
    );
};

export default AnalysisPage; 