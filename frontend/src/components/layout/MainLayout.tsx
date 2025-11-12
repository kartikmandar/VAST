import React, { useState, useCallback, ReactNode, useContext } from 'react';
import { Box, CssBaseline } from '@mui/material';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import RightToolbar from './RightToolbar';
import Footer from './Footer';
import { ThemeContext } from '../../ThemeContext';

interface MainLayoutProps {
    children: ReactNode;
    onLogout: () => void;
}

/**
 * Main layout wrapper component that manages the app header and sidebar
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout }) => {
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);
    const [open, setOpen] = useState<boolean>(true);
    const [submenuOpen, setSubmenuOpen] = useState<boolean>(false);
    const mainDrawerWidth = 240;
    const subDrawerWidth = 240;
    const rightToolbarWidth = 60;

    // Toggle sidebar open/closed
    const toggleSidebar = useCallback(() => {
        setOpen(prevOpen => !prevOpen);
    }, []);

    // Handle submenu state changes
    const handleSubmenuStateChange = useCallback((isOpen: boolean) => {
        setSubmenuOpen(isOpen);
    }, []);

    // Calculate left margin for main content based on sidebar states
    const calculateLeftMargin = () => {
        if (open && submenuOpen) return `${mainDrawerWidth + subDrawerWidth}px`;
        if (open) return `${mainDrawerWidth}px`;
        return 0;
    };

    // Handle footer button clicks
    const handleTerminalClick = useCallback(() => {
        console.log('Terminal clicked');
        // Add implementation here
    }, []);

    const handleScienceClick = useCallback(() => {
        console.log('Science clicked');
        // Add implementation here
    }, []);

    const handleSearchClick = useCallback(() => {
        console.log('Search clicked');
        // Add implementation here
    }, []);

    const handleAcknowledgmentsClick = useCallback(() => {
        console.log('Acknowledgments clicked');
        // Add implementation here
    }, []);

    const handleContactClick = useCallback(() => {
        console.log('Contact clicked');
        // Add implementation here
    }, []);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <CssBaseline />
            <AppHeader toggleSidebar={toggleSidebar} onLogout={onLogout} />

            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    mt: '80px',
                    mb: '48px', // Add bottom margin for footer
                    position: 'relative'
                }}
            >
                <Sidebar
                    open={open}
                    onSubmenuStateChange={handleSubmenuStateChange}
                />

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        minHeight: 'calc(100vh - 128px)', // Account for header (80px) and footer (48px)
                        backgroundColor: 'background.default',
                        transition: theme => theme.transitions.create(['margin', 'width'], {
                            easing: theme.transitions.easing.easeInOut,
                            duration: theme.transitions.duration.standard,
                        }),
                        width: 'auto', // Let the margins control width
                        mr: `${rightToolbarWidth}px`,
                        ml: calculateLeftMargin()
                    }}
                >
                    {children}
                </Box>

                <RightToolbar
                    darkMode={darkMode}
                    onToggleDarkMode={toggleDarkMode}
                    onLogout={onLogout}
                />
            </Box>

            <Footer
                onTerminalClick={handleTerminalClick}
                onScienceClick={handleScienceClick}
                onSearchClick={handleSearchClick}
                onAcknowledgmentsClick={handleAcknowledgmentsClick}
                onContactClick={handleContactClick}
            />
        </Box>
    );
};

export default MainLayout;