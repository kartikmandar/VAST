import React, { createContext, useState, useEffect, ReactNode } from 'react';

export type BackendType = 'stingray' | 'lightkurve' | 'astropy';

interface BackendContextType {
    backend: BackendType;
    setBackend: (backend: BackendType) => void;
}

export const BackendContext = createContext<BackendContextType>({
    backend: 'stingray',
    setBackend: () => { },
});

interface BackendProviderProps {
    children: ReactNode;
}

export const BackendProvider: React.FC<BackendProviderProps> = ({ children }) => {
    const [backend, setBackendState] = useState<BackendType>('stingray');

    // Load backend preference from localStorage on mount
    useEffect(() => {
        const savedBackend = localStorage.getItem('backend') as BackendType;
        if (savedBackend && ['stingray', 'lightkurve', 'astropy'].includes(savedBackend)) {
            setBackendState(savedBackend);
        }
    }, []);

    const setBackend = (newBackend: BackendType) => {
        setBackendState(newBackend);
        localStorage.setItem('backend', newBackend);
    };

    return (
        <BackendContext.Provider value={{ backend, setBackend }}>
            {children}
        </BackendContext.Provider>
    );
};

export const useBackend = () => React.useContext(BackendContext); 