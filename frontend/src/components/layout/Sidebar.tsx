import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    IconButton,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BuildIcon from '@mui/icons-material/Build';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScienceIcon from '@mui/icons-material/Science';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import { ThemeContext } from '../../ThemeContext';

// Sidebar widths
const mainDrawerWidth = 240;
const subDrawerWidth = 240;

interface SidebarProps {
    open: boolean;
    onSubmenuStateChange: (isOpen: boolean) => void;
}

interface SubmenuItem {
    text: string;
    path: string;
}

interface MenuItem {
    text: string;
    icon: React.ReactNode;
    path: string;
    hasSubmenu?: boolean;
    submenuItems?: SubmenuItem[];
}

/**
 * Sidebar navigation component
 */
const Sidebar: React.FC<SidebarProps> = ({ open, onSubmenuStateChange }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { darkMode } = useContext(ThemeContext);
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const [showSubmenu, setShowSubmenu] = useState(true);

    // Get theme-aware scrollbar colors
    const scrollbarThumbColor = darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';
    const scrollbarThumbHoverColor = darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)';

    // Notify parent component of submenu state changes
    useEffect(() => {
        onSubmenuStateChange(!!activeSubmenu && showSubmenu);
    }, [activeSubmenu, showSubmenu, onSubmenuStateChange]);

    // Navigation items configuration
    const menuItems: MenuItem[] = [
        {
            text: 'Home',
            icon: <HomeIcon />,
            path: '/',
        },
        {
            text: 'Data Ingestion',
            icon: <UploadFileIcon />,
            path: '/data-ingestion',
        },
        {
            text: 'QuickLook Analysis',
            icon: <AnalyticsIcon />,
            path: '/quicklook',
            hasSubmenu: true,
            submenuItems: [
                { text: 'Event List', path: '/quicklook/event-list' },
                { text: 'Light Curve', path: '/quicklook/light-curve' },
                { text: 'Power Spectrum', path: '/quicklook/power-spectrum' },
                { text: 'Average Power Spectrum', path: '/quicklook/avg-power-spectrum' },
                { text: 'Cross Spectrum', path: '/quicklook/cross-spectrum' },
                { text: 'Average Cross Spectrum', path: '/quicklook/avg-cross-spectrum' },
                { text: 'Dynamical Power Spectrum', path: '/quicklook/dynamical-power-spectrum' },
                { text: 'Coherence', path: '/quicklook/coherence' },
                { text: 'Cross Correlation', path: '/quicklook/cross-correlation' },
                { text: 'Auto Correlation', path: '/quicklook/auto-correlation' },
                { text: 'Dead Time Corrections', path: '/quicklook/dead-time-corrections' },
                { text: 'Bispectrum', path: '/quicklook/bispectrum' },
                { text: 'Covariance Spectrum', path: '/quicklook/covariance-spectrum' },
                { text: 'Average Covariance Spectrum', path: '/quicklook/avg-covariance-spectrum' },
                { text: 'Variable Energy Spectrum', path: '/quicklook/variable-energy-spectrum' },
                { text: 'RMS Energy Spectrum', path: '/quicklook/rms-energy-spectrum' },
                { text: 'Lag Energy Spectrum', path: '/quicklook/lag-energy-spectrum' },
                { text: 'Excess Variance Spectrum', path: '/quicklook/excess-variance-spectrum' },
            ]
        },
        {
            text: 'Utilities',
            icon: <BuildIcon />,
            path: '/utilities',
            hasSubmenu: true,
            submenuItems: [
                { text: 'Statistical Functions', path: '/utilities/statistical-functions' },
                { text: 'GTI Functionality', path: '/utilities/gti' },
                { text: 'I/O Functionality', path: '/utilities/io' },
                { text: 'Mission Specific I/O', path: '/utilities/mission-io' },
                { text: 'Misc', path: '/utilities/misc' },
            ]
        },
        {
            text: 'Modeling',
            icon: <ModelTrainingIcon />,
            path: '/modeling',
            hasSubmenu: true,
            submenuItems: [
                { text: 'Model 1', path: '/modeling/model1' },
                { text: 'Model 2', path: '/modeling/model2' },
                { text: 'Model 3', path: '/modeling/model3' },
                { text: 'Model 4', path: '/modeling/model4' },
                { text: 'Model 5', path: '/modeling/model5' },
                { text: 'Model 6', path: '/modeling/model6' },
            ]
        },
        {
            text: 'Pulsar',
            icon: <AccessTimeIcon />,
            path: '/pulsar',
        },
        {
            text: 'Simulator',
            icon: <ScienceIcon />,
            path: '/simulator',
        },
    ];

    const getActiveMenuItem = () => {
        return menuItems.find(item => item.text === activeSubmenu);
    };

    const handleMenuClick = (item: MenuItem) => {
        if (item.hasSubmenu) {
            setActiveSubmenu(item.text);
            setShowSubmenu(true);
        } else {
            setActiveSubmenu(null);
            setShowSubmenu(false);
            navigate(item.path);
        }
    };

    const renderMainMenu = () => (
        <List>
            {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                    <ListItemButton
                        onClick={() => handleMenuClick(item)}
                        selected={!item.hasSubmenu && location.pathname === item.path}
                        sx={{
                            backgroundColor: !item.hasSubmenu && location.pathname === item.path ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                            borderLeft: !item.hasSubmenu && location.pathname === item.path ? '4px solid' : 'none',
                            borderColor: 'primary.main',
                        }}
                    >
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                        {item.hasSubmenu && <ChevronRightIcon />}
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );

    const renderSubmenu = () => {
        const activeItem = getActiveMenuItem();
        if (!activeItem?.submenuItems) return null;

        // For QuickLook Analysis, group items into categories
        if (activeItem.text === 'QuickLook Analysis') {
            const categories = {
                'Time Domain': [
                    'Event List',
                    'Light Curve',
                ],
                'Frequency Domain': [
                    'Power Spectrum',
                    'Average Power Spectrum',
                    'Cross Spectrum',
                    'Average Cross Spectrum',
                    'Dynamical Power Spectrum',
                    'Coherence',
                ],
                'Correlation Analysis': [
                    'Cross Correlation',
                    'Auto Correlation',
                ],
                'Advanced Analysis': [
                    'Dead Time Corrections',
                    'Bispectrum',
                    'Covariance Spectrum',
                    'Average Covariance Spectrum',
                ],
                'Energy Dependent Analysis': [
                    'Variable Energy Spectrum',
                    'RMS Energy Spectrum',
                    'Lag Energy Spectrum',
                    'Excess Variance Spectrum',
                ]
            };

            return (
                <>
                    <Box sx={{
                        p: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Typography variant="subtitle1">
                            {activeItem.text}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => setShowSubmenu(false)}
                            sx={{ ml: 1 }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    {Object.entries(categories).map(([category, items]) => (
                        <React.Fragment key={category}>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    px: 2,
                                    py: 1,
                                    fontWeight: 'bold',
                                    backgroundColor: _ => darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    mt: 1
                                }}
                            >
                                {category}
                            </Typography>
                            <List dense>
                                {activeItem.submenuItems
                                    ?.filter(subItem => items.includes(subItem.text))
                                    .map(subItem => (
                                        <ListItem key={subItem.text} disablePadding>
                                            <ListItemButton
                                                onClick={() => navigate(subItem.path)}
                                                selected={location.pathname === subItem.path}
                                                sx={{
                                                    pl: 2,
                                                    backgroundColor: location.pathname === subItem.path ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                                                    borderLeft: location.pathname === subItem.path ? '4px solid' : 'none',
                                                    borderColor: 'primary.main',
                                                }}
                                            >
                                                <ListItemText primary={subItem.text} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                            </List>
                        </React.Fragment>
                    ))}
                </>
            );
        }

        // Default rendering for other submenus
        return (
            <>
                <Box sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Typography variant="subtitle1">
                        {activeItem.text}
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={() => setShowSubmenu(false)}
                        sx={{ ml: 1 }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
                <List>
                    {activeItem.submenuItems.map((subItem) => (
                        <ListItem key={subItem.text} disablePadding>
                            <ListItemButton
                                onClick={() => navigate(subItem.path)}
                                selected={location.pathname === subItem.path}
                                sx={{
                                    pl: 2,
                                    backgroundColor: location.pathname === subItem.path ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                                    borderLeft: location.pathname === subItem.path ? '4px solid' : 'none',
                                    borderColor: 'primary.main',
                                }}
                            >
                                <ListItemText primary={subItem.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </>
        );
    };

    return (
        <>
            {/* Main Sidebar */}
            <Box
                sx={{
                    position: 'fixed',
                    top: '80px', // Match the mt value from MainLayout
                    left: 0,
                    height: 'calc(100vh - 128px)', // Account for header (80px) and footer (48px)
                    overflow: 'hidden',
                    transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
                    display: 'flex',
                    flexShrink: 0,
                    willChange: 'width',
                    flexDirection: 'column',
                    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                    width: open ? mainDrawerWidth : 0,
                    zIndex: (theme) => theme.zIndex.drawer
                }}
            >
                <Box sx={{
                    overflow: 'auto',
                    opacity: open ? 1 : 0,
                    transition: 'opacity 150ms',
                    minWidth: mainDrawerWidth,
                    height: '100%',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                        backgroundColor: 'transparent'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: scrollbarThumbColor,
                        borderRadius: '6px',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        '&:hover': {
                            backgroundColor: scrollbarThumbHoverColor
                        }
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'transparent'
                    },
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${scrollbarThumbColor} transparent`,
                    '&:hover::-webkit-scrollbar-thumb': {
                        opacity: 1
                    },
                    '&:not(:hover)::-webkit-scrollbar-thumb': {
                        opacity: 0
                    }
                }}>
                    {renderMainMenu()}
                </Box>
            </Box>

            {/* Submenu Sidebar */}
            <Box
                sx={{
                    position: 'fixed',
                    top: '80px', // Match the mt value from MainLayout
                    left: open ? mainDrawerWidth : 0,
                    height: 'calc(100vh - 128px)', // Account for header (80px) and footer (48px)
                    overflow: 'hidden',
                    transition: 'all 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
                    display: 'flex',
                    flexShrink: 0,
                    willChange: 'width',
                    flexDirection: 'column',
                    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                    width: open && !!activeSubmenu && showSubmenu ? subDrawerWidth : 0,
                    zIndex: (theme) => theme.zIndex.drawer
                }}
            >
                <Box sx={{
                    overflow: 'auto',
                    opacity: open && !!activeSubmenu && showSubmenu ? 1 : 0,
                    transition: 'opacity 150ms',
                    minWidth: subDrawerWidth,
                    height: '100%',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                        backgroundColor: 'transparent'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: scrollbarThumbColor,
                        borderRadius: '6px',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        '&:hover': {
                            backgroundColor: scrollbarThumbHoverColor
                        }
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'transparent'
                    },
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${scrollbarThumbColor} transparent`,
                    '&:hover::-webkit-scrollbar-thumb': {
                        opacity: 1
                    },
                    '&:not(:hover)::-webkit-scrollbar-thumb': {
                        opacity: 0
                    }
                }}>
                    {renderSubmenu()}
                </Box>
            </Box>
        </>
    );
};

export default Sidebar; 