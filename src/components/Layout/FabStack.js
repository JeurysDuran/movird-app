// src/components/Layout/FabStack.js
import React from 'react';
import { useApp } from '../../context/AppContext';

const FabStack = () => {
    const { openPanel } = useApp();

    const triggerEmergency = () => {
        alert('🚨 EMERGENCIA ACTIVADA 🚨\n\nSe ha notificado a tus contactos de emergencia y a las autoridades.\nPermanece en el lugar si es seguro.');
    };

    const locateMe = () => {
        window.dispatchEvent(new CustomEvent('locateMe'));
    };

    return ( <
        div id = "fab-stack" >
        <
        button className = "fab fab-emergency"
        onClick = { triggerEmergency }
        title = "Emergencia" >
        <
        svg viewBox = "0 0 24 24"
        fill = "white" >
        <
        path d = "M1 21L12 2l11 19H1zm11-3v2h-2v-2h2zm0-8v4h-2v-4h2z" / >
        <
        /svg> <
        /button> <
        button className = "fab glass"
        onClick = {
            () => openPanel('reports-panel') }
        title = "Reportar"
        style = {
            { color: 'var(--warn)' } } >
        <
        svg viewBox = "0 0 24 24"
        fill = "none"
        stroke = "currentColor"
        strokeWidth = "2" >
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
        /button> <
        button className = "fab glass"
        onClick = { locateMe }
        title = "Mi ubicación"
        style = {
            { color: 'var(--blue)' } } >
        <
        svg viewBox = "0 0 24 24"
        fill = "none"
        stroke = "currentColor"
        strokeWidth = "2" >
        <
        circle cx = "12"
        cy = "12"
        r = "3" / >
        <
        path d = "M12 2v3M12 19v3M2 12h3M19 12h3" / >
        <
        /svg> <
        /button> <
        /div>
    );
};

export default FabStack;