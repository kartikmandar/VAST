import React, { useContext, useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Tooltip, useTheme, Menu, MenuItem, ListItemText, ListItemIcon, Slider, Divider, Stack } from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import SearchIcon from '@mui/icons-material/Search';
import ScienceIcon from '@mui/icons-material/Science';
import InfoIcon from '@mui/icons-material/Info';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import StorageIcon from '@mui/icons-material/Storage';
import CheckIcon from '@mui/icons-material/Check';
import MemoryIcon from '@mui/icons-material/Memory';
import { ThemeContext } from '../../ThemeContext';
import { BackendContext, BackendType } from '../../BackendContext';

interface FooterProps {
    onTerminalClick?: () => void;
    onScienceClick?: () => void;
    onSearchClick?: () => void;
    onAcknowledgmentsClick?: () => void;
    onContactClick?: () => void;
}

/**
 * Fixed footer component for the application
 */
const Footer: React.FC<FooterProps> = ({
    onTerminalClick,
    onScienceClick,
    onSearchClick,
    onAcknowledgmentsClick,
    onContactClick
}) => {
    const theme = useTheme();
    const { darkMode } = useContext(ThemeContext);
    const { backend, setBackend } = useContext(BackendContext);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // CPU and RAM settings
    const [resourcesAnchorEl, setResourcesAnchorEl] = useState<null | HTMLElement>(null);
    const [cpuThreads, setCpuThreads] = useState<number>(4);
    const [maxRam, setMaxRam] = useState<number>(8);

    // Demo values for current usage
    const [currentCpuUsage, setCurrentCpuUsage] = useState<number>(0);
    const [currentRamUsage, setCurrentRamUsage] = useState<number>(0);

    // Simulate changing usage for demo purposes
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentCpuUsage(Math.floor(Math.random() * (cpuThreads + 1)));
            setCurrentRamUsage(Math.floor(Math.random() * (maxRam + 1)));
        }, 2000);

        return () => clearInterval(interval);
    }, [cpuThreads, maxRam]);

    // Calculate CPU usage percentage
    const cpuPercentage = Math.round((currentCpuUsage / cpuThreads) * 100);

    const handleBackendClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleBackendClose = () => {
        setAnchorEl(null);
    };

    const handleBackendChange = (newBackend: BackendType) => {
        setBackend(newBackend);
        handleBackendClose();
    };

    // Resources menu handlers
    const handleResourcesClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setResourcesAnchorEl(event.currentTarget);
    };

    const handleResourcesClose = () => {
        setResourcesAnchorEl(null);
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '48px',
                backgroundColor: darkMode ? 'grey.800' : 'grey.300',
                color: theme.palette.text.primary,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                zIndex: theme => theme.zIndex.drawer + 1, // Same z-index as AppBar
                boxShadow: '0px -1px 3px rgba(0, 0, 0, 0.1)'
            }}
        >
            {/* Left side buttons */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {/* Combined Resources Button */}
                <Tooltip title="Configure System Resources for Analysis">
                    <Button
                        startIcon={<MemoryIcon />}
                        size="small"
                        onClick={handleResourcesClick}
                        variant="text"
                        color="inherit"
                    >
                        Total Resources: {cpuPercentage}% CPU, {currentRamUsage}/{maxRam} GB
                    </Button>
                </Tooltip>
                <Menu
                    anchorEl={resourcesAnchorEl}
                    open={Boolean(resourcesAnchorEl)}
                    onClose={handleResourcesClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    PaperProps={{
                        sx: { width: 350, p: 2 }
                    }}
                >
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                CPU Threads for Analysis: {cpuThreads}
                            </Typography>
                            <Slider
                                value={cpuThreads}
                                onChange={(_, value) => setCpuThreads(value as number)}
                                step={1}
                                marks
                                min={1}
                                max={16}
                                valueLabelDisplay="auto"
                            />
                            <Typography variant="caption" color="text.secondary">
                                Total system usage: {currentCpuUsage}/{cpuThreads} threads ({cpuPercentage}%)
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Max RAM for Analysis: {maxRam} GB
                            </Typography>
                            <Slider
                                value={maxRam}
                                onChange={(_, value) => setMaxRam(value as number)}
                                step={1}
                                marks
                                min={1}
                                max={64}
                                valueLabelDisplay="auto"
                            />
                            <Typography variant="caption" color="text.secondary">
                                Total system usage: {currentRamUsage}/{maxRam} GB
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">
                                System resources available for analysis tasks
                            </Typography>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={handleResourcesClose}
                            >
                                Apply
                            </Button>
                        </Box>
                    </Stack>
                </Menu>

                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                <Tooltip title="Terminal">
                    <Button
                        startIcon={<TerminalIcon />}
                        size="small"
                        onClick={onTerminalClick}
                        variant="text"
                        color="inherit"
                    >
                        Terminal
                    </Button>
                </Tooltip>
                <Tooltip title="Science">
                    <Button
                        startIcon={<ScienceIcon />}
                        size="small"
                        onClick={onScienceClick}
                        variant="text"
                        color="inherit"
                    >
                        Science
                    </Button>
                </Tooltip>
            </Box>

            {/* Center - Copyright information */}
            <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                Copyright © {new Date().getFullYear()} Kartik Mandar
            </Typography>

            {/* Right side buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Acknowledgments">
                    <Button
                        startIcon={<InfoIcon />}
                        size="small"
                        onClick={onAcknowledgmentsClick}
                        variant="text"
                        color="inherit"
                    >
                        Acknowledgments
                    </Button>
                </Tooltip>
                <Tooltip title="Contact">
                    <Button
                        startIcon={<ContactSupportIcon />}
                        size="small"
                        onClick={onContactClick}
                        variant="text"
                        color="inherit"
                    >
                        Contact
                    </Button>
                </Tooltip>

                {/* Backend Selection */}
                <Tooltip title="Select Backend">
                    <Button
                        startIcon={<StorageIcon />}
                        size="small"
                        onClick={handleBackendClick}
                        variant="text"
                        color="inherit"
                        sx={{ textTransform: 'capitalize' }}
                    >
                        Backend: {backend}
                    </Button>
                </Tooltip>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleBackendClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    slotProps={{
                        paper: {
                            sx: {
                                overflow: 'visible',
                                mt: -1
                            }
                        }
                    }}
                    disableScrollLock={true}
                    disablePortal={false}
                    MenuListProps={{
                        sx: { py: 0 }
                    }}
                >
                    <MenuItem onClick={() => handleBackendChange('stingray')}>
                        <ListItemIcon>
                            {backend === 'stingray' && <CheckIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>Stingray</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleBackendChange('lightkurve')}>
                        <ListItemIcon>
                            {backend === 'lightkurve' && <CheckIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>Lightkurve</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleBackendChange('astropy')}>
                        <ListItemIcon>
                            {backend === 'astropy' && <CheckIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>Astropy</ListItemText>
                    </MenuItem>
                </Menu>

                <Tooltip title="Search">
                    <IconButton
                        size="small"
                        onClick={onSearchClick}
                        color="inherit"
                    >
                        <SearchIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default Footer; 