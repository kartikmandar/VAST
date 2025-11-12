import React from 'react';
import { Box, Typography } from '@mui/material';

const HomePage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4">Welcome to VA ST²</Typography>
            <Typography variant="body1">Variable Analysis System for Time Series & Transients</Typography>
        </Box>
    );
};

export default HomePage; 