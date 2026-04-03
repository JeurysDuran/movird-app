// src/components/Layout/Navbar.js
import React from 'react';
import { useApp } from '../../context/AppContext';

const Navbar = () => {
    const { currentUser, openPanel, openSidePanel } = useApp();

    if (!currentUser) return null;

    const initials = currentUser.name ?
        currentUser.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() :
        '?';

    const roleInfo = {
        admin: { bg: 'var(--warn)', icon: <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
        company_admin: { bg: 'var(--accent)', icon: <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M8 14h.01M12 14h.01M16 14h.01" strokeLinecap="round" strokeLinejoin="round"/></svg> },
        driver: { bg: 'var(--blue)', icon: <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14h16M4 14v4a2 2 0 0 0 2 2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h2v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1a2 2 0 0 0 2-2v-4M4 14V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8M8 10h8M6 18h.01M18 18h.01" strokeLinecap="round"/></svg> },
        user: { bg: 'var(--purple)', icon: <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg> },
    };
    const badge = roleInfo[currentUser.role] || roleInfo.user;

    return (
        <div id="top-bar">
            {/* Logo — abre panel de perfil/opciones */}
            <div className="logo-pill glass" onClick={() => openSidePanel('profile-panel')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                <div className="logo-dot" />
                Movi<span>RD</span>
            </div>

            {/* Barra de búsqueda */}
            <div className="search-bar glass" onClick={() => openPanel('search')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="search-bar-text">Busca rutas, paradas…</span>
            </div>

            {/* Avatar — también abre perfil */}
            <div className="user-avatar" onClick={() => openSidePanel('profile-panel')} title={currentUser.name}>
                {initials}
                <div className="role-badge" style={{ background: badge.bg, fontSize: 7, color: '#fff' }}>
                    {badge.icon}
                </div>
            </div>
        </div>
    );
};

export default Navbar;