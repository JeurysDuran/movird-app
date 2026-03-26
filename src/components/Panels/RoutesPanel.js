// src/components/Panels/RoutesPanel.js
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../Common/Card';

const RoutesPanel = () => {
    const { activePanel, closePanel, routes, vehicles } = useApp();
    const [filter, setFilter] = useState('all');
    const isOpen = activePanel === 'routes-panel';

    const filteredRoutes = filter === 'all' ? routes : routes.filter(r => r.type === filter);

    const getOccupancyClass = (routeId) => {
        const vehicle = vehicles.find(v => v.routeId === routeId);
        if (!vehicle) return 'chip-green';
        const occ = vehicle.occupancy;
        if (occ === 'Vacio' || occ === 'Vacío') return 'chip-green';
        if (occ === 'Medio') return 'chip-yellow';
        return 'chip-red';
    };

    const getOccupancyBar = (routeId) => {
        const vehicle = vehicles.find(v => v.routeId === routeId);
        if (!vehicle) return { width: '15%', color: 'var(--accent)' };
        const occ = vehicle.occupancy;
        if (occ === 'Vacio' || occ === 'Vacío') return { width: '15%', color: 'var(--accent)' };
        if (occ === 'Medio') return { width: '55%', color: 'var(--warn)' };
        return { width: '95%', color: 'var(--danger)' };
    };

    const getTagClass = (type) => {
        const map = {
            'OMSA': 'tag-omsa',
            'Metro': 'tag-metro',
            'Concho': 'tag-concho',
            'Teleferico': 'tag-teleferico'
        };
        return map[type] || 'tag-concho';
    };

    const selectRoute = (route) => {
        window.dispatchEvent(new CustomEvent('selectRoute', { detail: route }));
        closePanel();
    };

    const filters = [
        { id: 'all', label: 'Todas' },
        { id: 'OMSA', label: 'OMSA' },
        { id: 'Metro', label: 'Metro' },
        { id: 'Concho', label: 'Concho' }
    ];

    return ( <
        div className = { `panel glass ${isOpen ? 'open' : ''}` }
        id = "routes-panel" >
        <
        div className = "panel-handle" > < /div> <
        div className = "panel-header" >
        <
        div className = "panel-title" > Rutas de transporte < /div> <
        button className = "panel-close"
        onClick = { closePanel } >
        <
        svg viewBox = "0 0 24 24"
        fill = "none"
        stroke = "currentColor"
        strokeWidth = "2" >
        <
        line x1 = "18"
        y1 = "6"
        x2 = "6"
        y2 = "18" / >
        <
        line x1 = "6"
        y1 = "6"
        x2 = "18"
        y2 = "18" / >
        <
        /svg> <
        /button> <
        /div> <
        div className = "panel-body" >
        <
        div className = "flex gap-8 mb-12" > {
            filters.map(f => ( <
                button key = { f.id }
                className = { `btn ${filter === f.id ? 'btn-accent' : 'btn-ghost'}` }
                style = {
                    { fontSize: '11px' } }
                onClick = {
                    () => setFilter(f.id) } >
                { f.label } <
                /button>
            ))
        } <
        /div> <
        div id = "routes-list" > {
            filteredRoutes.map(route => {
                const occClass = getOccupancyClass(route.id);
                const occBar = getOccupancyBar(route.id);
                // Reemplazar optional chaining con verificación tradicional
                const vehicle = vehicles.find(v => v.routeId === route.id);
                const occText = vehicle ? vehicle.occupancy : 'Vacio';
                return ( <
                    Card key = { route.id }
                    onClick = {
                        () => selectRoute(route) } >
                    <
                    div className = "flex items-center justify-between mb-8" >
                    <
                    span className = { `transport-tag ${getTagClass(route.type)}` } > { route.type } < /span> <
                    span className = { `chip ${occClass}` } > { occText } < /span> <
                    /div> <
                    div className = "font-bold text-sm mb-8" > { route.name } < /div> <
                    div className = "text-xs text-muted mb-8" > { route.stops.join(' → ') } < /div> <
                    div className = "occ-bar-wrap" >
                    <
                    div className = "occ-bar"
                    style = {
                        { width: occBar.width, background: occBar.color } } > < /div> <
                    /div> <
                    div className = "flex justify-between mt-8" >
                    <
                    span className = "text-xs text-muted" > { route.duration } < /span> <
                    span className = "text-xs text-accent font-bold" > RD$ { route.price } < /span> <
                    /div> <
                    /Card>
                );
            })
        } <
        /div> <
        /div> <
        /div>
    );
};

export default RoutesPanel;