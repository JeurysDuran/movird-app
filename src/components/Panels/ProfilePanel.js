// src/components/Panels/ProfilePanel.js
import React from 'react';
import { useApp } from '../../context/AppContext';

const ProfilePanel = () => {
    const { activeSidePanel, closeSidePanel, currentUser, logout, openPanel } = useApp();
    const isOpen = activeSidePanel === 'profile-panel';

    if (!currentUser) return null;

    const initials = currentUser.name.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2);
    const roleColors = {
        admin: '#ff9a3c',
        driver: '#2a7fff',
        user: '#00d4a0'
    };
    const roleLabels = {
        admin: 'Administrador',
        driver: 'Chofer',
        user: 'Usuario'
    };

    return ( <
        div className = { `side-panel glass ${isOpen ? 'open' : ''}` }
        id = "profile-panel" >
        <
        div style = {
            { padding: '58px 20px 18px', borderBottom: '1px solid var(--border)' } } >
        <
        div className = "flex items-center gap-12" >
        <
        div style = {
            {
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: `linear-gradient(135deg, var(--blue), var(--purple))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 800,
                flexShrink: 0
            }
        } > { initials } <
        /div> <
        div >
        <
        div style = {
            { fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700 } } > { currentUser.name } <
        /div> <
        div className = "text-xs text-muted mt-8" > { roleLabels[currentUser.role] } < /div> <
        div className = "chip mt-8"
        style = {
            { background: `${roleColors[currentUser.role]}33`, color: roleColors[currentUser.role], display: 'inline-flex' } } > { roleLabels[currentUser.role] } <
        /div> <
        /div> <
        /div> <
        /div> <
        div className = "side-panel-body" >
        <
        div style = {
            { padding: '14px 20px' } } >
        <
        div className = "card-title text-muted mb-12" > Mi cuenta < /div> <
        div className = "list-item" >
        <
        div className = "list-icon"
        style = {
            { background: 'var(--surface3)' } } >
        <
        svg viewBox = "0 0 24 24"
        fill = "none"
        stroke = "var(--text2)"
        strokeWidth = "2"
        style = {
            { width: '17px', height: '17px' } } >
        <
        path d = "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" / >
        <
        circle cx = "12"
        cy = "7"
        r = "4" / >
        <
        /svg> <
        /div> <
        div >
        <
        div className = "text-sm font-bold" > { currentUser.name } < /div> <
        div className = "text-xs text-muted" > { currentUser.email } < /div> <
        /div> <
        /div> <
        div className = "list-item" >
        <
        div className = "list-icon"
        style = {
            { background: 'var(--surface3)' } } >
        <
        svg viewBox = "0 0 24 24"
        fill = "none"
        stroke = "var(--text2)"
        strokeWidth = "2"
        style = {
            { width: '17px', height: '17px' } } >
        <
        path d = "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" / >
        <
        /svg> <
        /div> <
        div >
        <
        div className = "text-sm font-bold" > { currentUser.phone } < /div> <
        div className = "text-xs text-muted" > Teléfono < /div> <
        /div> <
        /div> <
        div className = "divider" > < /div>

        <
        div className = "card-title text-muted mb-12" > Estadísticas < /div> <
        div className = "grid-2 mb-12" >
        <
        div className = "card"
        style = {
            { textAlign: 'center', padding: '12px' } } >
        <
        div style = {
            { fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--accent)' } } > { currentUser.trips || 0 } <
        /div> <
        div className = "text-xs text-muted" > Viajes < /div> <
        /div> <
        div className = "card"
        style = {
            { textAlign: 'center', padding: '12px' } } >
        <
        div style = {
            { fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--blue)' } } > { currentUser.reports || 0 } <
        /div> <
        div className = "text-xs text-muted" > Reportes < /div> <
        /div> <
        /div>

        <
        button className = "btn btn-outline btn-block mb-12"
        onClick = {
            () => {
                closeSidePanel();
                openPanel('payment-panel');
            }
        } >
        <
        svg viewBox = "0 0 24 24"
        fill = "none"
        stroke = "currentColor"
        strokeWidth = "2"
        style = {
            { width: '16px', height: '16px' } } >
        <
        rect x = "2"
        y = "5"
        width = "20"
        height = "14"
        rx = "2" / >
        <
        line x1 = "2"
        y1 = "10"
        x2 = "22"
        y2 = "10" / >
        <
        /svg>
        Ver saldo y pagos <
        /button>

        <
        button className = "btn btn-danger btn-block"
        onClick = {
            () => {
                logout();
                closeSidePanel();
            }
        } >
        <
        svg viewBox = "0 0 24 24"
        fill = "none"
        stroke = "currentColor"
        strokeWidth = "2"
        style = {
            { width: '16px', height: '16px' } } >
        <
        path d = "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" / >
        <
        polyline points = "16 17 21 12 16 7" / >
        <
        line x1 = "21"
        y1 = "12"
        x2 = "9"
        y2 = "12" / >
        <
        /svg>
        Cerrar sesión <
        /button> <
        /div> <
        /div> <
        /div>
    );
};

export default ProfilePanel;