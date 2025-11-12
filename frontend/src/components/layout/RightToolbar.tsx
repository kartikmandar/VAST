import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    IconButton,
    Tooltip,
    Divider,
    Badge,
    CircularProgress,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import OutputIcon from '@mui/icons-material/Terminal';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import BugReportIcon from '@mui/icons-material/BugReport';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HourglassFullIcon from '@mui/icons-material/HourglassFull';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { ThemeContext } from '../../ThemeContext';
import { authService } from '../../api';

// Width of the toolbar
const toolbarWidth = 60;

interface RightToolbarProps {
    darkMode: boolean;
    onToggleDarkMode: () => void;
    onLogout?: () => void;
}

interface ToolbarButton {
    icon: React.ReactNode;
    tooltip: string;
    onClick: (event?: React.MouseEvent<HTMLButtonElement>) => void;
}

const RightToolbar: React.FC<RightToolbarProps> = ({ darkMode, onToggleDarkMode, onLogout }) => {
    const navigate = useNavigate();
    // Get theme context as a fallback (in case props don't update correctly)
    const themeContext = useContext(ThemeContext);

    // Reference for the pipeline button
    const pipelineButtonRef = useRef<HTMLButtonElement>(null);

    // Use context values if props are out of sync
    const isDarkMode = themeContext ? themeContext.darkMode : darkMode;
    const toggleTheme = themeContext ? themeContext.toggleDarkMode : onToggleDarkMode;

    // Busy indicator state
    const [isBusy, setIsBusy] = useState(false);
    const [busyProgress, setBusyProgress] = useState(0);

    // Pipeline recording state
    const [isRecording, setIsRecording] = useState(false);
    const [pipelineMenuAnchor, setPipelineMenuAnchor] = useState<null | HTMLElement>(null);

    // Simulate busy state periodically for demo purposes
    useEffect(() => {
        const simulateBusy = () => {
            const shouldBeBusy = Math.random() > 0.7;
            if (shouldBeBusy) {
                setIsBusy(true);
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 15;
                    if (progress >= 100) {
                        progress = 100;
                        setIsBusy(false);
                        clearInterval(interval);
                    }
                    setBusyProgress(progress);
                }, 500);

                // Safety timeout to ensure it eventually stops
                setTimeout(() => {
                    clearInterval(interval);
                    setIsBusy(false);
                }, 8000);
            }
        };

        // Run the simulation every 20 seconds
        const timer = setInterval(simulateBusy, 20000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        try {
            // Use the auth service to logout (clear token and cookies)
            await authService.logout();

            // Call the logout callback to update app state
            if (onLogout) onLogout();
        } catch (error) {
            console.error('Logout failed:', error);

            // Even if API call fails, still clear local token and redirect
            localStorage.removeItem('token');
            if (onLogout) onLogout();
        }
    };

    const handleProfileClick = () => {
        console.log('Profile button clicked, navigating to /profile');
        navigate('/profile');
    };

    // Analysis pipeline handlers
    const handlePipelineButtonClick = () => {
        if (pipelineButtonRef.current) {
            setPipelineMenuAnchor(pipelineButtonRef.current);
        }
    };

    const handlePipelineMenuClose = () => {
        setPipelineMenuAnchor(null);
    };

    const handleStartRecording = () => {
        setIsRecording(true);
        console.log('Start recording analysis pipeline');
        handlePipelineMenuClose();
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        console.log('Stop recording analysis pipeline');
        handlePipelineMenuClose();
    };

    const handleSavePipeline = () => {
        console.log('Save analysis pipeline');
        handlePipelineMenuClose();
    };

    // Define toolbar buttons
    const toolbarButtons: ToolbarButton[] = [
        {
            icon: <WarningAmberIcon />,
            tooltip: 'Warning Logs',
            onClick: () => console.log('Warning logs clicked')
        },
        {
            icon: <OutputIcon />,
            tooltip: 'Output Logs',
            onClick: () => console.log('Output logs clicked')
        },
        {
            icon: isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />,
            tooltip: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            onClick: () => {
                console.log('Dark mode toggle clicked, current state:', isDarkMode);
                toggleTheme();
            }
        },
        {
            icon: isRecording ? <StopIcon color="error" /> : <SaveIcon />,
            tooltip: isRecording ? 'Recording Analysis Pipeline' : 'Analysis Pipeline Options',
            onClick: handlePipelineButtonClick
        },
        {
            icon: <SettingsIcon />,
            tooltip: 'Settings',
            onClick: () => console.log('Settings clicked')
        },
        {
            icon: <HelpIcon />,
            tooltip: 'Help',
            onClick: () => console.log('Help clicked')
        },
        {
            icon: <BugReportIcon />,
            tooltip: 'Debug Tools',
            onClick: () => console.log('Debug tools clicked')
        },
        {
            icon: <Badge badgeContent={2} color="error"><NotificationsIcon /></Badge>,
            tooltip: 'Notifications',
            onClick: () => console.log('Notifications clicked')
        },
        {
            icon: isBusy ? <CircularProgress size={24} variant="determinate" value={busyProgress} /> : <HourglassFullIcon />,
            tooltip: isBusy ? `Processing... ${Math.round(busyProgress)}%` : 'System Idle',
            onClick: () => {
                if (!isBusy) {
                    setIsBusy(true);
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += Math.random() * 10;
                        if (progress >= 100) {
                            progress = 100;
                            setIsBusy(false);
                            clearInterval(interval);
                        }
                        setBusyProgress(progress);
                    }, 300);
                }
            }
        },
        {
            icon: <AccountCircleIcon />,
            tooltip: 'Profile',
            onClick: handleProfileClick
        },
        {
            icon: <LogoutIcon />,
            tooltip: 'Logout',
            onClick: handleLogout
        }
    ];

    return (
        <Box
            sx={{
                width: toolbarWidth,
                height: '100%',
                backgroundColor: 'background.paper',
                borderLeft: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 2,
                gap: 2,
                position: 'fixed',
                top: 80, // AppBar height updated
                right: 0,
                zIndex: 1100
            }}
        >
            {toolbarButtons.map((button, index) => (
                <React.Fragment key={index}>
                    <Tooltip title={button.tooltip} placement="left">
                        <IconButton
                            onClick={button.onClick}
                            color={index === 2 ? (isDarkMode ? 'warning' : 'primary') :
                                index === 8 && isBusy ? 'secondary' :
                                    index === 3 && isRecording ? 'error' :
                                        index === 3 ? 'success' : 'default'}
                            sx={[
                                index === 2 ? {
                                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                                    '&:hover': {
                                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)',
                                    }
                                } : {},
                                index === 8 ? {
                                    animation: isBusy ? 'pulse 1.5s infinite' : 'none',
                                    '@keyframes pulse': {
                                        '0%': { opacity: 0.6 },
                                        '50%': { opacity: 1 },
                                        '100%': { opacity: 0.6 }
                                    }
                                } : {},
                                index === 3 && isRecording ? {
                                    animation: 'recordingPulse 1.5s infinite',
                                    '@keyframes recordingPulse': {
                                        '0%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.4)' },
                                        '70%': { boxShadow: '0 0 0 10px rgba(255, 0, 0, 0)' },
                                        '100%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)' }
                                    }
                                } : {}
                            ]}
                            ref={index === 3 ? pipelineButtonRef : undefined}
                        >
                            {button.icon}
                        </IconButton>
                    </Tooltip>
                    {index === 1 && <Divider sx={{ width: '70%' }} />}
                    {index === 3 && <Divider sx={{ width: '70%' }} />}
                    {index === 6 && <Divider sx={{ width: '70%' }} />}
                    {index === 8 && <Divider sx={{ width: '70%' }} />}
                </React.Fragment>
            ))}

            {/* Analysis Pipeline Menu */}
            <Menu
                anchorEl={pipelineMenuAnchor}
                open={Boolean(pipelineMenuAnchor)}
                onClose={handlePipelineMenuClose}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'right',
                }}
            >
                {!isRecording ? (
                    <MenuItem onClick={handleStartRecording}>
                        <ListItemIcon>
                            <PlayArrowIcon color="success" />
                        </ListItemIcon>
                        <ListItemText>Start Recording Pipeline</ListItemText>
                    </MenuItem>
                ) : (
                    <MenuItem onClick={handleStopRecording}>
                        <ListItemIcon>
                            <StopIcon color="error" />
                        </ListItemIcon>
                        <ListItemText>Stop Recording Pipeline</ListItemText>
                    </MenuItem>
                )}
                <MenuItem onClick={handleSavePipeline}>
                    <ListItemIcon>
                        <SaveIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText>Save Current Pipeline</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default RightToolbar; 