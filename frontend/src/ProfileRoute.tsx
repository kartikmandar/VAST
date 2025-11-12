import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';
import MainLayout from './components/layout/MainLayout';

// This is a dedicated route component for the profile page
const ProfileRoute: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    return (
        <MainLayout onLogout={onLogout}>
            <ProfilePage />
        </MainLayout>
    );
};

export default ProfileRoute; 