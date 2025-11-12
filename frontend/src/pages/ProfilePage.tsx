import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Paper,
    Button,
    Grid,
    TextField,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import {
    Person,
    Security,
    Email,
    History,
    Settings
} from '@mui/icons-material';

interface UserProfile {
    name: string;
    email: string;
    role: string;
    department: string;
    organization: string;
    lastLogin: string;
}

const ProfilePage: React.FC = () => {
    console.log('ProfilePage component rendering');

    useEffect(() => {
        console.log('ProfilePage mounted');
        return () => {
            console.log('ProfilePage unmounted');
        };
    }, []);

    // Sample user data - would be fetched from API in a real app
    const [user, setUser] = useState<UserProfile>({
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'Researcher',
        department: 'Data Science',
        organization: 'ABC Research Lab',
        lastLogin: '2025-04-23 09:30 AM'
    });

    const [editing, setEditing] = useState<boolean>(false);

    const handleEdit = () => {
        setEditing(true);
    };

    const handleSave = () => {
        setEditing(false);
        // Would save changes to API in a real app
    };

    const handleCancel = () => {
        setEditing(false);
        // Reset form data
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                My Profile
            </Typography>

            <Grid container spacing={3}>
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    fontSize: '2.5rem',
                                    bgcolor: 'primary.main',
                                    mb: 2
                                }}
                            >
                                {user.name.split(' ').map(name => name[0]).join('')}
                            </Avatar>
                            <Typography variant="h6">{user.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{user.role}</Typography>
                            <Typography variant="body2" color="text.secondary">{user.organization}</Typography>
                        </Box>

                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <Person />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Account"
                                    secondary="Manage your account details"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <Security />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Security"
                                    secondary="Update password and security settings"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <Email />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Notifications"
                                    secondary="Configure email notifications"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <History />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Activity"
                                    secondary="View account activity"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <Settings />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Preferences"
                                    secondary="Set application preferences"
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6">
                                Personal Information
                            </Typography>
                            {!editing ? (
                                <Button variant="outlined" onClick={handleEdit}>
                                    Edit Profile
                                </Button>
                            ) : (
                                <Box>
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancel}
                                        sx={{ mr: 1 }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                    >
                                        Save Changes
                                    </Button>
                                </Box>
                            )}
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={user.name}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    variant="outlined"
                                    margin="normal"
                                />
                            </Grid>
                            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={user.email}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    variant="outlined"
                                    margin="normal"
                                />
                            </Grid>
                            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                <TextField
                                    fullWidth
                                    label="Role"
                                    name="role"
                                    value={user.role}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    variant="outlined"
                                    margin="normal"
                                />
                            </Grid>
                            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                <TextField
                                    fullWidth
                                    label="Department"
                                    name="department"
                                    value={user.department}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    variant="outlined"
                                    margin="normal"
                                />
                            </Grid>
                            <Grid sx={{ gridColumn: 'span 12' }}>
                                <TextField
                                    fullWidth
                                    label="Organization"
                                    name="organization"
                                    value={user.organization}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    variant="outlined"
                                    margin="normal"
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Account Information
                            </Typography>
                            <Typography variant="body2">
                                Last login: {user.lastLogin}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProfilePage; 