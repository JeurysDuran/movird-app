// src/components/Layout/BottomDock.js
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const BottomDock = () => {
    const [activeView, setActiveView] = useState('map');
    const { openPanel, currentUser } = useApp();

    const handleClick = (view, panelId) => {
        setActiveView(view);
        if (panelId === 'admin-panel') {
            if (currentUser && currentUser.role === 'driver') {
                panelId = 'driver-panel';
            } else if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'company_admin') {
                panelId = 'profile-panel';
            }
        }
        openPanel(panelId);
    };

    const hasPanel = currentUser && ['admin', 'company_admin', 'driver'].includes(currentUser.role);

    const isDriver = currentUser && currentUser.role === 'driver';
    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'company_admin');
    const isPassenger = !isAdmin && !isDriver;

    return (
    <div id="bottom-dock">
        <div className="dock-inner glass">
            <button className={`dock-btn ${activeView === 'map' ? 'active' : ''}`} onClick={() => handleClick('map', null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21" />
                    <line x1="9" y1="3" x2="9" y2="18" />
                    <line x1="15" y1="6" x2="15" y2="21" />
                </svg>
                Mapa
            </button>
            
            {/* Pagos — solo pasajeros */}
            {isPassenger && (
                <button className={`dock-btn ${activeView === 'pay' ? 'active' : ''}`} onClick={() => handleClick('pay', 'payment-panel')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    Pagos
                </button>
            )}

            {/* Cobro — solo choferes */}
            {isDriver && (
                <button className={`dock-btn ${activeView === 'pay' ? 'active' : ''}`} onClick={() => handleClick('pay', 'cobro-panel')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Cobro
                </button>
            )}

            {/* Buscar Rutas — solo para pasajeros */}
            {isPassenger && (
                <button className={`dock-btn ${activeView === 'search' ? 'active' : ''}`} onClick={() => handleClick('search', 'search')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Rutas
                </button>
            )}

            <button className={`dock-btn ${activeView === 'security' ? 'active' : ''}`} onClick={() => handleClick('security', 'security-panel')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Seguridad
            </button>
            {hasPanel && (
                <button className={`dock-btn ${activeView === 'admin' ? 'active' : ''}`} onClick={() => handleClick('admin', 'admin-panel')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Panel
                </button>
            )}
        </div>
    </div>
);
};

export default BottomDock;