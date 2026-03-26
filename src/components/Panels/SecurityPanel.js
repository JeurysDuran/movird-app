// src/components/Panels/SecurityPanel.js
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../Common/Card';

const SecurityPanel = () => {
    const { activePanel, closePanel, dangerZones } = useApp();
    const [sharingRoute, setSharingRoute] = useState(false);
    const [rating, setRating] = useState(0);
    const [driverId, setDriverId] = useState('');
    const isOpen = activePanel === 'security-panel';

    const triggerEmergency = () => {
        alert('🚨 EMERGENCIA ACTIVADA 🚨\n\nSe ha notificado a tus contactos de emergencia y a las autoridades.\nPermanece en el lugar si es seguro.');
    };

    const shareRoute = () => {
        setSharingRoute(!sharingRoute);
        alert(sharingRoute ? 'Has dejado de compartir tu ubicación' : '📍 Compartiendo ubicación en tiempo real\nTus contactos de emergencia pueden ver tu ruta.');
    };

    const rateStar = (star) => {
        setRating(star);
        const stars = document.querySelectorAll('#star-rating .star');
        stars.forEach((s, i) => {
            s.style.color = i < star ? 'var(--warn)' : 'var(--text2)';
        });
    };

    const submitRating = () => {
        if (!driverId) {
            alert('Ingresa el ID del chofer');
            return;
        }
        if (!rating) {
            alert('Selecciona una calificación');
            return;
        }
        alert(`✅ Calificación de ${rating} estrellas enviada para el chofer ${driverId}`);
        setDriverId('');
        setRating(0);
        const stars = document.querySelectorAll('#star-rating .star');
        stars.forEach(s => s.style.color = 'var(--text2)');
    };

    const getRiskColor = (risk) => {
        if (risk === 'Alto') return 'chip-red';
        if (risk === 'Medio') return 'chip-yellow';
        return 'chip-green';
    };

    const focusZone = (zone) => {
        window.dispatchEvent(new CustomEvent('focusZone', { detail: zone }));
        closePanel();
    };

    return ( <
        div className = { `panel glass ${isOpen ? 'open' : ''}` }
        id = "security-panel" >
        <
        div className = "panel-handle" > < /div> <
        div className = "panel-header" >
        <
        div className = "panel-title" > Seguridad < /div> <
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
        button className = "btn btn-danger btn-block"
        style = {
            { padding: '18px', fontSize: '16px', borderRadius: '14px', marginBottom: '6px' } }
        onClick = { triggerEmergency } >
        <
        svg viewBox = "0 0 24 24"
        fill = "white"
        style = {
            { width: '20px', height: '20px' } } >
        <
        path d = "M1 21L12 2l11 19H1zm11-3v2h-2v-2h2zm0-8v4h-2v-4h2z" / >
        <
        /svg>
        BOTÓN DE EMERGENCIA <
        /button> <
        div className = "text-xs text-muted text-center mb-12"
        style = {
            { marginTop: '-4px' } } >
        Solo en caso de peligro real.Notifica a contactos y autoridades. <
        /div>

        <
        Card title = "Compartir ruta" >
        <
        div className = "text-sm text-muted mb-12" >
        Comparte tu ubicación en tiempo real con tus contactos. <
        /div> <
        button className = "btn btn-blue btn-block"
        onClick = { shareRoute } >
        <
        svg viewBox = "0 0 24 24"
        fill = "none"
        stroke = "currentColor"
        strokeWidth = "2"
        style = {
            { width: '16px', height: '16px' } } >
        <
        path d = "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" / >
        <
        polyline points = "16,6 12,2 8,6" / >
        <
        line x1 = "12"
        y1 = "2"
        x2 = "12"
        y2 = "15" / >
        <
        /svg> { sharingRoute ? 'Detener compartición de ruta' : 'Iniciar compartición de ruta' } <
        /button> <
        /Card>

        <
        Card title = "Calificar chofer" >
        <
        div className = "input-wrap mb-12" >
        <
        svg viewBox = "0 0 24 24"
        fill = "none"
        stroke = "currentColor"
        strokeWidth = "2" >
        <
        path d = "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" / >
        <
        circle cx = "12"
        cy = "7"
        r = "4" / >
        <
        /svg> <
        input className = "input-field"
        id = "driver-id-input"
        placeholder = "ID o nombre del chofer"
        value = { driverId }
        onChange = {
            (e) => setDriverId(e.target.value) }
        /> <
        /div> <
        div className = "stars mb-12"
        id = "star-rating" > {
            [1, 2, 3, 4, 5].map(star => ( <
                span key = { star }
                className = "star"
                onClick = {
                    () => rateStar(star) } > ★ < /span>
            ))
        } <
        /div> <
        button className = "btn btn-accent btn-block"
        onClick = { submitRating } > Enviar calificación < /button> <
        /Card>

        <
        Card title = "Zonas de riesgo" > {
            dangerZones.map(zone => ( <
                div key = { zone.id }
                className = "list-item"
                style = {
                    { cursor: 'pointer' } }
                onClick = {
                    () => focusZone(zone) } >
                <
                div className = "list-icon"
                style = {
                    { background: 'var(--danger-dim)' } } >
                <
                svg viewBox = "0 0 24 24"
                fill = "none"
                stroke = "var(--danger)"
                strokeWidth = "2"
                style = {
                    { width: '16px', height: '16px' } } >
                <
                path d = "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" / >
                <
                line x1 = "12"
                y1 = "9"
                x2 = "12"
                y2 = "13" / >
                <
                line x1 = "12"
                y1 = "17"
                x2 = "12.01"
                y2 = "17" / >
                <
                /svg> <
                /div> <
                div style = {
                    { flex: 1 } } >
                <
                div className = "text-sm font-bold" > { zone.name } < /div> <
                div className = "text-xs text-muted" > { zone.incidents }
                incidentes < /div> <
                /div> <
                span className = { `chip ${getRiskColor(zone.risk)}` } > Riesgo { zone.risk } < /span> <
                /div>
            ))
        } <
        /Card>

        <
        Card title = "Consejos de seguridad" >
        <
        div className = "text-sm text-muted"
        style = {
            { lineHeight: 1.8 } } > ✓Espera el transporte en paradas iluminadas < br / > ✓Mantén tus pertenencias a la vista < br / > ✓Comparte tu ruta con familiares < br / > ✓Reporta cualquier incidente sospechoso < br / > ✓Evita mostrar objetos de valor en el vehículo <
        /div> <
        /Card> <
        /div> <
        /div>
    );
};

export default SecurityPanel;