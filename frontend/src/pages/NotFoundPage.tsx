import React from 'react';
import {
    Typography,
    Box,
    Button,
    Container,
    Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container component="main" maxWidth="md">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3
                }}
            >
                <Paper sx={{ p: 5, borderRadius: 2, width: '100%' }}>
                    <Typography variant="h1" sx={{ fontSize: 120, fontWeight: 700, color: 'primary.main' }}>
                        404
                    </Typography>

                    <Typography variant="h4" gutterBottom>
                        Page Not Found
                    </Typography>

                    <Typography variant="body1" paragraph color="text.secondary">
                        The page you are looking for might have been removed, had its name changed,
                        or is temporarily unavailable.
                    </Typography>

                    <Box sx={{ mt: 4 }}>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/')}
                            sx={{ mr: 2 }}
                        >
                            Go to Homepage
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default NotFoundPage; 