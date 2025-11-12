import React, { useState } from 'react';
import {
    Typography,
    Box,
    Paper,
    Grid,
    Button,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { useParams } from 'react-router-dom';

interface Result {
    id: string;
    name: string;
    date: string;
    dataset: string;
    status: string;
}

const ResultsPage: React.FC = () => {
    const { resultId } = useParams();
    const [tabValue, setTabValue] = useState<number>(0);

    // Sample data - would be fetched from API in a real app
    const results: Result[] = [
        {
            id: '1',
            name: 'Statistical Analysis Result 1',
            date: '2025-04-23',
            dataset: 'Sample Dataset 1',
            status: 'Completed'
        },
        {
            id: '2',
            name: 'Machine Learning Model 1',
            date: '2025-04-22',
            dataset: 'Sample Dataset 2',
            status: 'Completed'
        },
        {
            id: '3',
            name: 'Data Visualization 1',
            date: '2025-04-20',
            dataset: 'Sample Dataset 3',
            status: 'Failed'
        },
    ];

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Show result details if resultId is provided
    if (resultId) {
        const result = results.find(r => r.id === resultId) || {
            id: '',
            name: '',
            date: '',
            dataset: '',
            status: ''
        };

        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        {result.name || 'Result Details'}
                    </Typography>
                    <Button variant="outlined" href="/results">
                        Back to Results
                    </Button>
                </Box>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={3}>
                        <Grid sx={{ gridColumn: 'span 6' }}>
                            <Typography variant="subtitle1">Dataset:</Typography>
                            <Typography paragraph>{result.dataset || 'Unknown'}</Typography>

                            <Typography variant="subtitle1">Date:</Typography>
                            <Typography paragraph>{result.date || 'Unknown'}</Typography>

                            <Typography variant="subtitle1">Status:</Typography>
                            <Typography paragraph>{result.status || 'Unknown'}</Typography>
                        </Grid>

                        <Grid sx={{ gridColumn: 'span 6' }}>
                            <Paper
                                sx={{
                                    height: 300,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'grey.100'
                                }}
                            >
                                <Typography variant="subtitle1" color="text.secondary">
                                    Visualization placeholder
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid sx={{ gridColumn: 'span 12' }}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Analysis Summary
                            </Typography>
                            <Typography paragraph>
                                This is a placeholder for the analysis results summary. In a real application,
                                this would contain charts, tables, and visualizations of the analysis results.
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        );
    }

    // Show results list if no resultId is provided
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Analysis Results
            </Typography>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="My Results" />
                    <Tab label="Shared Results" />
                </Tabs>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Dataset</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.map((result) => (
                            <TableRow key={result.id}>
                                <TableCell>{result.name}</TableCell>
                                <TableCell>{result.dataset}</TableCell>
                                <TableCell>{result.date}</TableCell>
                                <TableCell>{result.status}</TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        href={`/results/${result.id}`}
                                        sx={{ mr: 1 }}
                                    >
                                        View
                                    </Button>
                                    {result.status === 'Completed' && (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="secondary"
                                            href={`/timeseries/${result.id}`}
                                            sx={{ mr: 1 }}
                                        >
                                            Visualize
                                        </Button>
                                    )}
                                    <Button
                                        size="small"
                                        color="error"
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ResultsPage; 