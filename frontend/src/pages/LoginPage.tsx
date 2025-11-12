import React, { useState, FormEvent, ChangeEvent } from 'react';
import {
    Typography,
    Box,
    Paper,
    Button,
    TextField,
    Grid,
    Link,
    Container,
    Avatar,
    CircularProgress,
    Alert
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService, LoginCredentials } from '../api';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginCredentials>({
        username: '',
        password: ''
    });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Basic validation
        if (!formData.username || !formData.password) {
            setError('Please enter both username and password');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // In development, we'll use a hardcoded token for now
            // In production, this would use the actual login endpoint
            localStorage.setItem('token', 'b5b420f2c379c92187be9a4e12dd73b2ed8be622');

            // Call the onLogin callback to update app state
            onLogin();

            // Navigate to home page
            navigate('/');
        } catch (err) {
            console.error('Login failed:', err);
            setError('Invalid username or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 3
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <LockOutlined />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign in to VAST
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                    Visual Analytics for Scientific Testing
                </Typography>

                <Paper
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        p: 3,
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: 2
                    }}
                >
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>

                    <Grid container>
                        <Grid sx={{ gridColumn: '1fr' }}>
                            <Link href="#" variant="body2">
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid>
                            <Link href="/register" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Paper>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
                    &copy; {new Date().getFullYear()} VAST Analytics. All rights reserved.
                </Typography>
            </Box>
        </Container>
    );
};

export default LoginPage; 