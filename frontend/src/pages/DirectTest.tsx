import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { dataService, DataFile } from '../api';

const DirectTest: React.FC = () => {
    const [datasets, setDatasets] = useState<DataFile[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log('Fetching data directly...');
                const data = await dataService.getDataFiles();
                console.log('Direct data received:', data);
                setDatasets(data);
            } catch (err) {
                console.error('Direct fetch failed:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <Box
            sx={{
                width: '100%',
                p: 3,
                bgcolor: '#f5f5f5',
                minHeight: '100vh'
            }}
        >
            <Typography variant="h4" gutterBottom>
                Direct Test Page
            </Typography>

            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <Box>
                    <Typography variant="h6">
                        Data Files ({datasets.length})
                    </Typography>
                    {datasets.map(dataset => (
                        <Paper key={dataset.id} sx={{ p: 2, my: 1 }}>
                            <Typography>{dataset.name}</Typography>
                            <Typography variant="body2">Type: {dataset.file_type}</Typography>
                            <Typography variant="body2">Size: {dataset.size} bytes</Typography>
                        </Paper>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default DirectTest; 