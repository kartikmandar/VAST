import React, { useState, useEffect, useContext } from 'react'
import {
    RouterProvider,
    createBrowserRouter
} from 'react-router-dom'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { authService } from './api'
import { ThemeContext, ThemeProvider } from './ThemeContext'

// Layout components
import MainLayout from './components/layout/MainLayout'

// Pages
import HomePage from './pages/home/index.tsx'
import DataIngestionPage from './pages/data-ingestion/index.tsx'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfilePage from './pages/ProfilePage'

// QuickLook Analysis Pages
import EventListPage from './pages/quicklook/event-list/index.tsx'
import LightCurvePage from './pages/quicklook/light-curve/index.tsx'
import PowerSpectrumPage from './pages/quicklook/power-spectrum/index.tsx'
import AvgPowerSpectrumPage from './pages/quicklook/avg-power-spectrum/index.tsx'
import CrossSpectrumPage from './pages/quicklook/cross-spectrum/index.tsx'
import AvgCrossSpectrumPage from './pages/quicklook/avg-cross-spectrum/index.tsx'
import DynamicalPowerSpectrumPage from './pages/quicklook/dynamical-power-spectrum/index.tsx'
import CoherencePage from './pages/quicklook/coherence/index.tsx'
import CrossCorrelationPage from './pages/quicklook/cross-correlation/index.tsx'
import AutoCorrelationPage from './pages/quicklook/auto-correlation/index.tsx'
import DeadTimeCorrectionsPage from './pages/quicklook/dead-time-corrections/index.tsx'
import BispectrumPage from './pages/quicklook/bispectrum/index.tsx'
import CovarianceSpectrumPage from './pages/quicklook/covariance-spectrum/index.tsx'
import AvgCovarianceSpectrumPage from './pages/quicklook/avg-covariance-spectrum/index.tsx'
import VariableEnergySpectrumPage from './pages/quicklook/variable-energy-spectrum/index.tsx'
import RmsEnergySpectrumPage from './pages/quicklook/rms-energy-spectrum/index.tsx'
import LagEnergySpectrumPage from './pages/quicklook/lag-energy-spectrum/index.tsx'
import ExcessVarianceSpectrumPage from './pages/quicklook/excess-variance-spectrum/index.tsx'

// Utilities Pages
import StatisticalFunctionsPage from './pages/utilities/statistical-functions/index.tsx'
import GtiFunctionalityPage from './pages/utilities/gti/index.tsx'
import IoFunctionalityPage from './pages/utilities/io/index.tsx'
import MissionIoPage from './pages/utilities/mission-io/index.tsx'
import MiscPage from './pages/utilities/misc/index.tsx'

// Modeling Pages
import Model1Page from './pages/modeling/model1/index.tsx'
import Model2Page from './pages/modeling/model2/index.tsx'
import Model3Page from './pages/modeling/model3/index.tsx'
import Model4Page from './pages/modeling/model4/index.tsx'
import Model5Page from './pages/modeling/model5/index.tsx'
import Model6Page from './pages/modeling/model6/index.tsx'

// Other Pages
import PulsarPage from './pages/pulsar/index.tsx'
import SimulatorPage from './pages/simulator/index.tsx'

// Create theme
const createAppTheme = (darkMode: boolean) => {
    return darkMode ? darkTheme : lightTheme;
};

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#3f51b5', // Indigo
        },
        secondary: {
            main: '#f50057', // Pink
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    transition: 'background-color 0.3s ease'
                }
            }
        }
    }
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#7986cb', // Lighter Indigo
        },
        secondary: {
            main: '#ff4081', // Lighter Pink
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    transition: 'background-color 0.3s ease'
                }
            }
        }
    }
});

const AppContent: React.FC = () => {
    const { darkMode } = useContext(ThemeContext);
    const [loggedIn, setLoggedIn] = useState<boolean>(false)
    const [initialCheckDone, setInitialCheckDone] = useState<boolean>(false)

    // Check for authentication on component mount
    useEffect(() => {
        const checkAuth = () => {
            const isAuthenticated = authService.isAuthenticated();
            setLoggedIn(isAuthenticated);
            setInitialCheckDone(true);
        };

        checkAuth();
    }, []);

    const handleLogin = (): void => {
        setLoggedIn(true)
    }

    const handleLogout = (): void => {
        localStorage.removeItem('token');
        setLoggedIn(false)
    }

    if (!initialCheckDone) {
        return null;
    }

    const router = createBrowserRouter(
        loggedIn
            ? [
                {
                    path: "/",
                    element: <MainLayout onLogout={handleLogout}><HomePage /></MainLayout>
                },
                {
                    path: "/data-ingestion",
                    element: <MainLayout onLogout={handleLogout}><DataIngestionPage /></MainLayout>
                },
                // QuickLook Analysis Routes
                {
                    path: "/quicklook/event-list",
                    element: <MainLayout onLogout={handleLogout}><EventListPage /></MainLayout>
                },
                {
                    path: "/quicklook/light-curve",
                    element: <MainLayout onLogout={handleLogout}><LightCurvePage /></MainLayout>
                },
                {
                    path: "/quicklook/power-spectrum",
                    element: <MainLayout onLogout={handleLogout}><PowerSpectrumPage /></MainLayout>
                },
                {
                    path: "/quicklook/avg-power-spectrum",
                    element: <MainLayout onLogout={handleLogout}><AvgPowerSpectrumPage /></MainLayout>
                },
                {
                    path: "/quicklook/cross-spectrum",
                    element: <MainLayout onLogout={handleLogout}><CrossSpectrumPage /></MainLayout>
                },
                {
                    path: "/quicklook/avg-cross-spectrum",
                    element: <MainLayout onLogout={handleLogout}><AvgCrossSpectrumPage /></MainLayout>
                },
                {
                    path: "/quicklook/dynamical-power-spectrum",
                    element: <MainLayout onLogout={handleLogout}><DynamicalPowerSpectrumPage /></MainLayout>
                },
                {
                    path: "/quicklook/coherence",
                    element: <MainLayout onLogout={handleLogout}><CoherencePage /></MainLayout>
                },
                {
                    path: "/quicklook/cross-correlation",
                    element: <MainLayout onLogout={handleLogout}><CrossCorrelationPage /></MainLayout>
                },
                {
                    path: "/quicklook/auto-correlation",
                    element: <MainLayout onLogout={handleLogout}><AutoCorrelationPage /></MainLayout>
                },
                {
                    path: "/quicklook/dead-time-corrections",
                    element: <MainLayout onLogout={handleLogout}><DeadTimeCorrectionsPage /></MainLayout>
                },
                {
                    path: "/quicklook/bispectrum",
                    element: <MainLayout onLogout={handleLogout}><BispectrumPage /></MainLayout>
                },
                {
                    path: "/quicklook/covariance-spectrum",
                    element: <MainLayout onLogout={handleLogout}><CovarianceSpectrumPage /></MainLayout>
                },
                {
                    path: "/quicklook/avg-covariance-spectrum",
                    element: <MainLayout onLogout={handleLogout}><AvgCovarianceSpectrumPage /></MainLayout>
                },
                {
                    path: "/quicklook/variable-energy-spectrum",
                    element: <MainLayout onLogout={handleLogout}><VariableEnergySpectrumPage /></MainLayout>
                },
                {
                    path: "/quicklook/rms-energy-spectrum",
                    element: <MainLayout onLogout={handleLogout}><RmsEnergySpectrumPage /></MainLayout>
                },
                {
                    path: "/quicklook/lag-energy-spectrum",
                    element: <MainLayout onLogout={handleLogout}><LagEnergySpectrumPage /></MainLayout>
                },
                {
                    path: "/quicklook/excess-variance-spectrum",
                    element: <MainLayout onLogout={handleLogout}><ExcessVarianceSpectrumPage /></MainLayout>
                },
                // Utilities Routes
                {
                    path: "/utilities/statistical-functions",
                    element: <MainLayout onLogout={handleLogout}><StatisticalFunctionsPage /></MainLayout>
                },
                {
                    path: "/utilities/gti",
                    element: <MainLayout onLogout={handleLogout}><GtiFunctionalityPage /></MainLayout>
                },
                {
                    path: "/utilities/io",
                    element: <MainLayout onLogout={handleLogout}><IoFunctionalityPage /></MainLayout>
                },
                {
                    path: "/utilities/mission-io",
                    element: <MainLayout onLogout={handleLogout}><MissionIoPage /></MainLayout>
                },
                {
                    path: "/utilities/misc",
                    element: <MainLayout onLogout={handleLogout}><MiscPage /></MainLayout>
                },
                // Modeling Routes
                {
                    path: "/modeling/model1",
                    element: <MainLayout onLogout={handleLogout}><Model1Page /></MainLayout>
                },
                {
                    path: "/modeling/model2",
                    element: <MainLayout onLogout={handleLogout}><Model2Page /></MainLayout>
                },
                {
                    path: "/modeling/model3",
                    element: <MainLayout onLogout={handleLogout}><Model3Page /></MainLayout>
                },
                {
                    path: "/modeling/model4",
                    element: <MainLayout onLogout={handleLogout}><Model4Page /></MainLayout>
                },
                {
                    path: "/modeling/model5",
                    element: <MainLayout onLogout={handleLogout}><Model5Page /></MainLayout>
                },
                {
                    path: "/modeling/model6",
                    element: <MainLayout onLogout={handleLogout}><Model6Page /></MainLayout>
                },
                // Other Routes
                {
                    path: "/pulsar",
                    element: <MainLayout onLogout={handleLogout}><PulsarPage /></MainLayout>
                },
                {
                    path: "/simulator",
                    element: <MainLayout onLogout={handleLogout}><SimulatorPage /></MainLayout>
                },
                {
                    path: "/profile",
                    element: <MainLayout onLogout={handleLogout}><ProfilePage /></MainLayout>
                },
                {
                    path: "*",
                    element: <MainLayout onLogout={handleLogout}><NotFoundPage /></MainLayout>
                }
            ]
            : [
                {
                    path: "/login",
                    element: <LoginPage onLogin={handleLogin} />
                },
                {
                    path: "/register",
                    element: <RegisterPage />
                },
                {
                    path: "*",
                    element: <LoginPage onLogin={handleLogin} />
                }
            ]
    );

    return (
        <MuiThemeProvider theme={createAppTheme(darkMode)}>
            <CssBaseline />
            <RouterProvider router={router} />
        </MuiThemeProvider>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
};

export default App; 