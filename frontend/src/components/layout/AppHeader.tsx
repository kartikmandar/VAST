import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Button,
    Menu,
    MenuItem,
    Box,
    Container,
    useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import vastLogo from '../../assets/images/vast-logo.png';
import { ThemeContext } from '../../ThemeContext';

interface AppHeaderProps {
    toggleSidebar: () => void;
    onLogout?: () => void;
}

interface HeaderButton {
    label: string;
    items: string[];
    forPages?: string[];
}

/**
 * Application header component with main navigation controls
 */
const AppHeader: React.FC<AppHeaderProps> = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEls, setAnchorEls] = useState<Record<string, HTMLElement | null>>({});
    const [currentPage, setCurrentPage] = useState<string>('/');
    const { darkMode } = useContext(ThemeContext);
    const theme = useTheme();

    // Update current page based on location
    useEffect(() => {
        setCurrentPage(location.pathname);
    }, [location]);

    // Common buttons that appear on all pages
    const commonButtons: HeaderButton[] = [
        {
            label: "File",
            items: ["New Project", "Open Project", "Save", "Export"]
        },
        {
            label: "Edit",
            items: ["Cut", "Copy", "Paste", "Preferences"]
        },
        {
            label: "View",
            items: ["Parameters", "Console", "Timeline", "Grid"]
        },
    ];

    // Context-specific buttons based on current page
    const pageSpecificButtons: HeaderButton[] = [
        {
            label: "Data Tools",
            items: ["Import Files", "Export Results", "Convert Format", "Batch Process"],
            forPages: ['/data-ingestion']
        },
        {
            label: "Analysis",
            items: ["Run Analysis", "Configure Parameters", "View Results", "Compare"],
            forPages: ['/quicklook/light-curve', '/quicklook/power-spectrum', '/quicklook/dynamical-power-spectrum',
                '/quicklook/cross-spectrum', '/quicklook/coherence', '/quicklook/cross-correlation']
        },
        {
            label: "Modeling",
            items: ["Select Model", "Fit Parameters", "MC Simulation", "Evaluate Fit"],
            forPages: ['/modeling/model1', '/modeling/model2', '/modeling/model3',
                '/modeling/model4', '/modeling/model5', '/modeling/model6']
        },
        {
            label: "Visualization",
            items: ["Plot Options", "Export Figure", "Color Schemes", "3D View"],
            forPages: ['/quicklook']
        },
        {
            label: "Pulsar",
            items: ["Period Search", "Phase Folding", "TOA Analysis", "Ephemeris"],
            forPages: ['/pulsar']
        },
        {
            label: "Simulator",
            items: ["Light Curve", "Power Spectrum", "Noise Models", "Run Simulation"],
            forPages: ['/simulator']
        },
        {
            label: "Tools",
            items: ["Calculator", "Editor", "Converter", "Utilities"],
            forPages: ['/']
        },
        {
            label: "Help",
            items: ["Documentation", "Tutorials", "About", "Support"],
        }
    ];

    // Get visible buttons based on current page
    const getVisibleButtons = () => {
        const buttons = [...commonButtons];

        pageSpecificButtons.forEach(button => {
            // Always include buttons without specific pages
            if (!button.forPages) {
                buttons.push(button);
                return;
            }

            // Include buttons for the current page
            if (button.forPages.some(page => currentPage.startsWith(page))) {
                buttons.push(button);
            }
        });

        return buttons;
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, label: string) => {
        setAnchorEls({
            ...anchorEls,
            [label]: event.currentTarget
        });
    };

    const handleMenuClose = (label: string) => {
        setAnchorEls({
            ...anchorEls,
            [label]: null
        });
    };

    const handleMenuItemClick = (label: string, item: string) => {
        console.log(`Clicked ${item} from ${label} menu`);
        handleMenuClose(label);
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                bgcolor: darkMode ? 'grey.800' : 'grey.300', // Use theme-based colors
                color: theme.palette.text.primary
            }}
            elevation={1} // Subtle shadow
        >
            <Container maxWidth={false}>
                <Toolbar sx={{ height: 80, px: 2 }}>
                    <IconButton
                        color="inherit"
                        aria-label="toggle sidebar"
                        onClick={toggleSidebar}
                        edge="start"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ cursor: 'pointer', mr: 2 }}
                        onClick={() => navigate('/')}
                    >
                        VA ST² : Variable Analysis System for Time Series & Transients
                    </Typography>

                    <Box sx={{ display: 'flex', flexGrow: 1 }}>
                        {getVisibleButtons().map((button) => (
                            <Box key={button.label} sx={{ position: 'relative' }}>
                                <Button
                                    color="inherit"
                                    aria-controls={`${button.label}-menu`}
                                    aria-haspopup="true"
                                    onClick={(e) => handleMenuOpen(e, button.label)}
                                    endIcon={<KeyboardArrowDownIcon />}
                                    sx={{
                                        mx: 0.5,
                                        border: '1px solid',
                                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                                        borderRadius: 1,
                                        px: 1.5
                                    }}
                                >
                                    {button.label}
                                </Button>
                                <Menu
                                    id={`${button.label}-menu`}
                                    anchorEl={anchorEls[button.label]}
                                    keepMounted
                                    open={Boolean(anchorEls[button.label])}
                                    onClose={() => handleMenuClose(button.label)}
                                >
                                    {button.items.map((item) => (
                                        <MenuItem
                                            key={item}
                                            onClick={() => handleMenuItemClick(button.label, item)}
                                        >
                                            {item}
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Box>
                        ))}
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            ml: 2
                        }}
                        onClick={() => navigate('/')}
                    >
                        <img
                            src={vastLogo}
                            alt="VAST Logo"
                            style={{
                                height: '40px'
                            }}
                        />
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default AppHeader; 