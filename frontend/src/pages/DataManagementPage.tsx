import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    CircularProgress,
    Alert
} from '@mui/material';
import { dataService, DataFile } from '../api';

const DataManagementPage: React.FC = () => {
    const [tabValue, setTabValue] = useState<number>(0);
    const [datasets, setDatasets] = useState<DataFile[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data files from the API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching data files...');
                const data = await dataService.getDataFiles();
                console.log('Data files received:', data);
                setDatasets(data);
            } catch (err) {
                console.error('Failed to fetch data files:', err);
                setError('Failed to load data files. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        console.log('Current datasets state:', datasets);
    }, [datasets]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleDeleteDataFile = async (id: number) => {
        try {
            await dataService.deleteDataFile(id.toString());
            // Remove the deleted file from the state
            setDatasets(datasets.filter(dataset => dataset.id !== id));
        } catch (err) {
            console.error('Failed to delete data file:', err);
            setError('Failed to delete data file. Please try again.');
        }
    };

    const handleDownloadDataFile = async (id: number, name: string) => {
        try {
            const blob = await dataService.downloadDataFile(id.toString());
            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Failed to download data file:', err);
            setError('Failed to download data file. Please try again.');
        }
    };

    // Format file size for display
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ border: '1px solid red', p: 2 }}>
                Data Management
            </Typography>

            {/* Debug Information */}
            <Paper sx={{ mb: 3, p: 2, border: '2px solid blue' }}>
                <Typography variant="h6">Debug Info</Typography>
                <Typography>Loading: {loading ? 'Yes' : 'No'}</Typography>
                <Typography>Error: {error ? error : 'None'}</Typography>
                <Typography>Datasets Count: {datasets.length}</Typography>
                <Typography>First dataset: {datasets[0]?.name || 'None'}</Typography>
            </Paper>

            <Box sx={{ mb: 3 }}>
                <Button variant="contained" sx={{ mr: 2 }}>
                    Upload Dataset
                </Button>
                <Button variant="outlined">
                    Import from Source
                </Button>
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="My Datasets" />
                    <Tab label="Shared Datasets" />
                    <Tab label="Public Datasets" />
                </Tabs>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Size</TableCell>
                                <TableCell>Upload Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {datasets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No datasets found. Upload a dataset to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                datasets.map((dataset) => (
                                    <TableRow key={dataset.id}>
                                        <TableCell>{dataset.name}</TableCell>
                                        <TableCell>{dataset.file_type}</TableCell>
                                        <TableCell>{formatFileSize(dataset.size)}</TableCell>
                                        <TableCell>{new Date(dataset.uploaded_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button size="small" sx={{ mr: 1 }} onClick={() => handleDownloadDataFile(dataset.id, dataset.name)}>
                                                Download
                                            </Button>
                                            <Button size="small" sx={{ mr: 1 }}>
                                                Edit
                                            </Button>
                                            <Button size="small" color="error" onClick={() => handleDeleteDataFile(dataset.id)}>
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default DataManagementPage; 