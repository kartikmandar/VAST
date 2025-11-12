import React from 'react';
import { Typography, Box, Paper, Grid, Button } from '@mui/material';

const HomePage: React.FC = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Welcome to VAST
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                Visual Analytics for Scientific Testing
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Data Management
                        </Typography>
                        <Typography sx={{ mb: 2 }}>
                            Upload, manage, and explore your scientific datasets.
                        </Typography>
                        <Button variant="contained" href="/data">
                            Manage Data
                        </Button>
                    </Paper>
                </Grid>

                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Analysis
                        </Typography>
                        <Typography sx={{ mb: 2 }}>
                            Run analyses and visualize results on your datasets.
                        </Typography>
                        <Button variant="contained" href="/analyze">
                            Run Analysis
                        </Button>
                    </Paper>
                </Grid>

                <Grid sx={{ gridColumn: 'span 12' }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Activity
                        </Typography>
                        <Typography sx={{ mb: 2 }}>
                            No recent activity to display.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default HomePage; 