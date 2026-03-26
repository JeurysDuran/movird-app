// src/App.js
import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoadingScreen from './components/Layout/LoadingScreen';
import AuthScreen from './components/Auth/AuthScreen';
import MapComponent from './components/Map/MapComponent';
import Navbar from './components/Layout/Navbar';
import BottomDock from './components/Layout/BottomDock';
import FabStack from './components/Layout/FabStack';
import PanelOverlay from './components/Layout/PanelOverlay';
import Toast from './components/Common/Toast';
import SearchPanel from './components/Panels/SearchPanel';
import RoutesPanel from './components/Panels/RoutesPanel';
import PaymentPanel from './components/Panels/PaymentPanel';
import SecurityPanel from './components/Panels/SecurityPanel';
import ReportsPanel from './components/Panels/ReportsPanel';
import AdminPanel from './components/Panels/AdminPanel';
import ProfilePanel from './components/Panels/ProfilePanel';
import BoardingPanel from './components/Panels/BoardingPanel';

const AppContent = () => {
    const { currentUser, loading, openPanel } = useApp();

    useEffect(() => {
        const handleOpenPanel = (e) => openPanel(e.detail);
        window.addEventListener('openPanel', handleOpenPanel);

        // Cuando el admin marca una zona desde el mapa (clic en mapa)
        const handleDangerZoneForm = (e) => {
            // Si hay un formulario pendiente, se delega al BoardingPanel o AdminPanel
            // según el rol — lo manejamos abriendo el panel correcto
            openPanel('boarding');
        };
        window.addEventListener('openDangerZoneForm', handleDangerZoneForm);

        return () => {
            window.removeEventListener('openPanel', handleOpenPanel);
            window.removeEventListener('openDangerZoneForm', handleDangerZoneForm);
        };
    }, [openPanel]);

    if (loading) return <LoadingScreen / > ;
    if (!currentUser) return <AuthScreen / > ;

    return ( <
        >
        <
        MapComponent / >
        <
        Navbar / >
        <
        BottomDock / >
        <
        FabStack / >
        <
        PanelOverlay / >
        <
        Toast / >
        <
        SearchPanel / >
        <
        RoutesPanel / >
        <
        PaymentPanel / >
        <
        SecurityPanel / >
        <
        ReportsPanel / >
        <
        AdminPanel / >
        <
        ProfilePanel / >
        <
        BoardingPanel / >
        <
        />
    );
};

function App() {
    return ( <
        AppProvider >
        <
        AppContent / >
        <
        /AppProvider>
    );
}

export default App;