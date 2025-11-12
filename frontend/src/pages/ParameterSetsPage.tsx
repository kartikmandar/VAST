import React, { useState } from 'react';
import {
    Typography,
    Box,
    Paper,
    Button,
    Card,
    CardContent,
    CardActions,
    Grid,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';

interface ParameterSet {
    id: string;
    name: string;
    description: string;
    analysisType: string;
    createdAt: string;
}

const ParameterSetsPage: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false);

    // Sample data - would be fetched from API in a real app
    const parameterSets: ParameterSet[] = [
        {
            id: '1',
            name: 'Statistical Analysis Parameters',
            description: 'Default parameters for statistical analysis',
            analysisType: 'Statistical',
            createdAt: '2025-04-10'
        },
        {
            id: '2',
            name: 'Machine Learning Parameters',
            description: 'Optimized parameters for ML model training',
            analysisType: 'Machine Learning',
            createdAt: '2025-04-15'
        },
        {
            id: '3',
            name: 'Visualization Parameters',
            description: 'Custom settings for data visualization',
            analysisType: 'Visualization',
            createdAt: '2025-04-20'
        },
    ];

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Parameter Sets
                </Typography>
                <Button variant="contained" onClick={handleOpen}>
                    Create New Parameter Set
                </Button>
            </Box>

            <Grid container spacing={3}>
                {parameterSets.map((paramSet) => (
                    <Grid
                        sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}
                        key={paramSet.id}
                    >
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    {paramSet.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Type: {paramSet.analysisType}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    {paramSet.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Created: {paramSet.createdAt}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small">View</Button>
                                <Button size="small">Edit</Button>
                                <Button size="small" color="error">Delete</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* New Parameter Set Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Parameter Set</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        variant="outlined"
                        sx={{ mb: 2, mt: 1 }}
                    />
                    <TextField
                        margin="dense"
                        label="Analysis Type"
                        fullWidth
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleClose} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ParameterSetsPage; 