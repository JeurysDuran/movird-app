// src/components/Layout/Navbar.js
import React from 'react';
import { useApp } from '../../context/AppContext';

const Navbar = () => {
    const { currentUser, openPanel } = useApp();
    if (!currentUser) return null;

    const initials = currentUser.name ?
        currentUser.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() :
        '?';

    const roleBadge = {
        admin: { bg: '#ff9a3c', icon: '⚙️' },
        driver: { bg: '#2a7fff', icon: '🚌' },
        user: { bg: '#9b6dff', icon: '👤' }
    }[currentUser.role] || { bg: '#8899bb', icon: '👤' };

    return ( <
        div id = "top-bar" > { /* Logo */ } <
        div className = "logo-pill glass" >
        <
        div className = "logo-dot" / >
        Movi < span > RD < /span> <
        /div>

        { /* Barra de búsqueda */ } <
        div className = "search-bar glass"
        onClick = {
            () => openPanel('search') } >
        <
        svg viewBox = "0 0 24 24"
        fill = "none"
        stroke = "currentColor"
        strokeWidth = "2" >
        <
        circle cx = "11"
        cy = "11"
        r = "8" / >
        <
        line x1 = "21"
        y1 = "21"
        x2 = "16.65"
        y2 = "16.65" / >
        <
        /svg> <
        span className = "search-bar-text" > Busca rutas, paradas… < /span> <
        /div>

        { /* Avatar usuario */ } <
        div className = "user-avatar"
        onClick = {
            () => openPanel('profile') } > { initials } <
        div className = "role-badge"
        style = {
            { background: roleBadge.bg, fontSize: 7, color: '#fff' } } > { roleBadge.icon } <
        /div> <
        /div> <
        /div>
    );
};

export default Navbar;