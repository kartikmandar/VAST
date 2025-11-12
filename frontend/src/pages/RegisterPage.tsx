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
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import { PersonAddOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface RegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    organization: string;
    role: string;
}

interface FormErrors {
    [key: string]: string;
}

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState<number>(0);
    const [formData, setFormData] = useState<RegisterFormData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        organization: '',
        role: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const steps = ['Account Information', 'Personal Details', 'Complete Registration'];

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateStep = (): boolean => {
        const newErrors: FormErrors = {};

        if (activeStep === 0) {
            if (!formData.email) newErrors.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

            if (!formData.password) newErrors.password = 'Password is required';
            else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        } else if (activeStep === 1) {
            if (!formData.firstName) newErrors.firstName = 'First name is required';
            if (!formData.lastName) newErrors.lastName = 'Last name is required';
            if (!formData.organization) newErrors.organization = 'Organization is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateStep()) {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (validateStep()) {
            // In a real app, would submit to API
            console.log('Registration data:', formData);
            navigate('/login');
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 3
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <PersonAddOutlined />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Create an Account
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                    Visual Analytics for Scientific Testing
                </Typography>

                <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Paper
                    component="form"
                    onSubmit={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                    sx={{
                        p: 3,
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: 2
                    }}
                >
                    {activeStep === 0 && (
                        <>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                            />
                        </>
                    )}

                    {activeStep === 1 && (
                        <>
                            <Grid container spacing={2}>
                                <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="firstName"
                                        label="First Name"
                                        name="firstName"
                                        autoComplete="given-name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        error={!!errors.firstName}
                                        helperText={errors.firstName}
                                    />
                                </Grid>
                                <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="lastName"
                                        label="Last Name"
                                        name="lastName"
                                        autoComplete="family-name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        error={!!errors.lastName}
                                        helperText={errors.lastName}
                                    />
                                </Grid>
                            </Grid>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="organization"
                                label="Organization"
                                name="organization"
                                value={formData.organization}
                                onChange={handleChange}
                                error={!!errors.organization}
                                helperText={errors.organization}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                id="role"
                                label="Role/Position"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            />
                        </>
                    )}

                    {activeStep === 2 && (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Review Your Information
                            </Typography>

                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid sx={{ gridColumn: { xs: 'span 6' } }}>
                                    <Typography variant="subtitle2">Name:</Typography>
                                </Grid>
                                <Grid sx={{ gridColumn: { xs: 'span 6' } }}>
                                    <Typography variant="body2">{`${formData.firstName} ${formData.lastName}`}</Typography>
                                </Grid>

                                <Grid sx={{ gridColumn: { xs: 'span 6' } }}>
                                    <Typography variant="subtitle2">Email:</Typography>
                                </Grid>
                                <Grid sx={{ gridColumn: { xs: 'span 6' } }}>
                                    <Typography variant="body2">{formData.email}</Typography>
                                </Grid>

                                <Grid sx={{ gridColumn: { xs: 'span 6' } }}>
                                    <Typography variant="subtitle2">Organization:</Typography>
                                </Grid>
                                <Grid sx={{ gridColumn: { xs: 'span 6' } }}>
                                    <Typography variant="body2">{formData.organization}</Typography>
                                </Grid>

                                {formData.role && (
                                    <>
                                        <Grid sx={{ gridColumn: { xs: 'span 6' } }}>
                                            <Typography variant="subtitle2">Role:</Typography>
                                        </Grid>
                                        <Grid sx={{ gridColumn: { xs: 'span 6' } }}>
                                            <Typography variant="body2">{formData.role}</Typography>
                                        </Grid>
                                    </>
                                )}
                            </Grid>

                            <Typography variant="body2" sx={{ mt: 2 }}>
                                By clicking "Register", you agree to our Terms of Service and Privacy Policy.
                            </Typography>
                        </>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        {activeStep > 0 ? (
                            <Button onClick={handleBack} variant="outlined" type="button">
                                Back
                            </Button>
                        ) : (
                            <Button href="/login" variant="outlined" type="button">
                                Cancel
                            </Button>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                        >
                            {activeStep === steps.length - 1 ? 'Register' : 'Next'}
                        </Button>
                    </Box>

                    {activeStep === 0 && (
                        <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                            <Grid sx={{ gridColumn: 'auto' }}>
                                <Link href="/login" variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default RegisterPage; 