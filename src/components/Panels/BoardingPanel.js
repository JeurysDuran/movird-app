// src/components/Panels/BoardingPanel.js
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OCCUPANCY_LEVELS } from '../../data/mockData';

const BoardingPanel = () => {
    const {
        activePanel,
        closePanel,
        currentUser,
        vehicles,
        routes,
        boardVehicle,
        alightVehicle,
        updateOccupancy,
        getETAToUser,
        addDangerZone,
        userLocation,
        showToast
    } = useApp();

    const [dangerForm, setDangerForm] = useState(false);
    const [dangerName, setDangerName] = useState('');
    const [dangerRisk, setDangerRisk] = useState('Medio');

    const isOpen = activePanel === 'boarding';
    const onBoard = currentUser ? currentUser.onBoard : null;

    // Vehículo en el que el usuario está montado
    const myVehicle = onBoard ? vehicles.find(v => v.id === onBoard) : null;
    const myRoute = myVehicle ? routes.find(r => r.id === myVehicle.routeId) : null;

    const handleBoard = (vehicleId) => {
        boardVehicle(vehicleId);
    };

    const handleAlight = (level) => {
        if (!onBoard) return;
        alightVehicle(onBoard, level);
    };

    const handleMarkDanger = () => {
        if (!dangerName.trim()) { showToast('Escribe un nombre para la zona', 'danger'); return; }
        const lat = userLocation ? userLocation.lat : null;
        const lng = userLocation ? userLocation.lng : null;
        if (!lat || !lng) { showToast('No se detectó tu ubicación GPS', 'danger'); return; }
        addDangerZone(dangerName, dangerRisk, lat, lng);
        setDangerForm(false);
        setDangerName('');
    };

    const inputStyle = {
        width: '100%',
        padding: '9px 12px',
        background: 'var(--surface3)',
        border: '1.5px solid var(--border2)',
        borderRadius: 8,
        color: 'var(--text)',
        fontFamily: 'var(--font)',
        fontSize: 13,
        outline: 'none',
        marginBottom: 8,
        boxSizing: 'border-box'
    };

    const occColors = { Vacio: '#00d4a0', Medio: '#ff9a3c', Lleno: '#ff3b5c' };

    return ( <
        >
        <
        div className = { `panel-overlay ${isOpen ? 'open' : ''}` }
        onClick = { closePanel }
        /> <
        div className = { `panel glass ${isOpen ? 'open' : ''}` } >
        <
        div className = "panel-handle" / >
        <
        div className = "panel-header" >
        <
        span className = "panel-title" > 🚌A bordo < /span> <
        button className = "panel-close"
        onClick = { closePanel } >
        <
        svg viewBox = "0 0 24 24"
        fill = "none"
        stroke = "currentColor"
        strokeWidth = "2" > < line x1 = "18"
        y1 = "6"
        x2 = "6"
        y2 = "18" / > < line x1 = "6"
        y1 = "6"
        x2 = "18"
        y2 = "18" / > < /svg> <
        /button> <
        /div> <
        div className = "panel-body" >

        { /* Estado actual: a bordo */ } {
            myVehicle ? ( <
                div >
                <
                div style = {
                    {
                        background: 'var(--accent-dim)',
                        border: '1.5px solid var(--accent)',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 16,
                        textAlign: 'center'
                    }
                } >
                <
                div style = {
                    { fontSize: 28, marginBottom: 6 } } > 🚌 < /div> <
                div style = {
                    { fontWeight: 800, fontSize: 16, color: 'var(--accent)' } } > { myVehicle.type }· { myVehicle.id } <
                /div> {
                    myRoute && ( <
                        div style = {
                            { fontSize: 13, color: 'var(--text2)', marginTop: 4 } } > { myRoute.name } < /div>
                    )
                } <
                div style = {
                    { fontSize: 12, color: 'var(--text2)', marginTop: 4 } } > { myVehicle.passengers.length }
                pasajero { myVehicle.passengers.length !== 1 ? 's' : '' }
                a bordo <
                /div> <
                /div>

                { /* Actualizar ocupación */ } <
                p style = {
                    { fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10 } } > ¿Cómo va la guagua ?
                <
                /p> <
                div style = {
                    { display: 'flex', gap: 8, marginBottom: 16 } } > {
                    OCCUPANCY_LEVELS.map(o => ( <
                        button key = { o.value }
                        onClick = {
                            () => updateOccupancy(myVehicle.id, o.value) }
                        style = {
                            {
                                flex: 1,
                                padding: '12px 6px',
                                borderRadius: 10,
                                border: `2px solid ${myVehicle.occupancy === o.value ? o.color : 'var(--border2)'}`,
                                background: myVehicle.occupancy === o.value ? o.color + '22' : 'var(--surface2)',
                                color: myVehicle.occupancy === o.value ? o.color : 'var(--text2)',
                                fontFamily: 'var(--font)',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4
                            }
                        } >
                        <
                        span style = {
                            { fontSize: 18 } } > { o.value === 'Vacio' ? '🟢' : o.value === 'Medio' ? '🟡' : '🔴' } < /span> { o.label } <
                        /button>
                    ))
                } <
                /div>

                { /* Paradas de la ruta */ } {
                    myRoute && myRoute.stops.length > 0 && ( <
                        >
                        <
                        p style = {
                            { fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10 } } >
                        Paradas de la ruta <
                        /p> {
                            myRoute.stops.map((stop, i) => {
                                const eta = getETAToUser ? getETAToUser(myVehicle.id) : null;
                                return ( <
                                    div key = { i }
                                    style = {
                                        { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' } } >
                                    <
                                    div style = {
                                        { width: 22, height: 22, borderRadius: '50%', background: 'var(--blue-dim)', border: '1.5px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--blue)', flexShrink: 0 } } > { i + 1 } < /div> <
                                    span style = {
                                        { flex: 1, fontSize: 13 } } > { stop.name } < /span> {
                                        i === 0 && eta !== null && ( <
                                            span style = {
                                                { fontSize: 11, color: 'var(--accent)', fontWeight: 700 } } > ~{ eta }
                                            min < /span>
                                        )
                                    } <
                                    /div>
                                );
                            })
                        } <
                        />
                    )
                }

                { /* Bajarse */ } <
                p style = {
                    { fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', margin: '16px 0 10px' } } >
                Bajarse <
                /p> <
                div style = {
                    { display: 'flex', gap: 8 } } > {
                    OCCUPANCY_LEVELS.map(o => ( <
                        button key = { o.value }
                        onClick = {
                            () => handleAlight(o.value) }
                        className = "btn btn-ghost"
                        style = {
                            { flex: 1, fontSize: 11 } } >
                        Bajo({ o.label }) <
                        /button>
                    ))
                } <
                /div> <
                /div>
            ) : (
                /* Sin vehículo — elegir guagua */
                <
                div >
                <
                p style = {
                    { fontSize: 13, color: 'var(--text2)', marginBottom: 14 } } >
                Selecciona la guagua en la que te vas a montar:
                <
                /p> {
                    vehicles.map(v => {
                        const route = routes.find(r => r.id === v.routeId);
                        const occColor = occColors[v.occupancy] || '#8899bb';
                        const eta = getETAToUser ? getETAToUser(v.id) : null;
                        return ( <
                            div key = { v.id }
                            style = {
                                {
                                    background: 'var(--surface2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 12,
                                    padding: 12,
                                    marginBottom: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12
                                }
                            } >
                            <
                            div style = {
                                {
                                    width: 42,
                                    height: 42,
                                    borderRadius: 10,
                                    background: occColor + '22',
                                    border: `2px solid ${occColor}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 20,
                                    flexShrink: 0
                                }
                            } > { v.type === 'OMSA' ? '🚌' : v.type === 'Metro' ? '🚇' : v.type === 'Teleferico' ? '🚡' : '🚕' } <
                            /div> <
                            div style = {
                                { flex: 1, minWidth: 0 } } >
                            <
                            div style = {
                                { fontWeight: 700, fontSize: 13 } } > { v.type }· { v.id } < /div> <
                            div style = {
                                { fontSize: 11, color: 'var(--text2)', marginTop: 2 } } > { route ? route.name : 'Sin ruta' } <
                            /div> <
                            div style = {
                                { display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' } } >
                            <
                            span style = {
                                { fontSize: 11, color: occColor, fontWeight: 700 } } > ●{ v.occupancy } < /span> {
                                eta !== null && ( <
                                    span style = {
                                        { fontSize: 11, color: 'var(--accent)', fontWeight: 600 } } > 🕐~{ eta }
                                    min < /span>
                                )
                            } <
                            /div> <
                            /div> <
                            button onClick = {
                                () => handleBoard(v.id) }
                            className = "btn btn-accent"
                            style = {
                                { fontSize: 12, padding: '8px 12px', flexShrink: 0 } } >
                            Montar <
                            /button> <
                            /div>
                        );
                    })
                } <
                /div>
            )
        }

        { /* Marcar zona peligrosa (disponible siempre) */ } <
        div style = {
            { marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 } } >
        <
        p style = {
            { fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10 } } > ⚠️Zona peligrosa aquí <
        /p> {
            !dangerForm ? ( <
                button onClick = {
                    () => setDangerForm(true) }
                className = "btn btn-danger btn-block"
                style = {
                    { fontSize: 13 } } >
                Marcar este lugar como peligroso <
                /button>
            ) : ( <
                div >
                <
                input style = { inputStyle }
                placeholder = "Nombre del lugar (ej: Callejón de Capotillo)"
                value = { dangerName }
                onChange = { e => setDangerName(e.target.value) }
                /> <
                select style = { inputStyle }
                value = { dangerRisk }
                onChange = { e => setDangerRisk(e.target.value) } >
                <
                option value = "Bajo" > Riesgo Bajo < /option> <
                option value = "Medio" > Riesgo Medio < /option> <
                option value = "Alto" > Riesgo Alto < /option> <
                /select> <
                div style = {
                    { display: 'flex', gap: 8 } } >
                <
                button onClick = { handleMarkDanger }
                className = "btn btn-danger"
                style = {
                    { flex: 1 } } > ✅Confirmar < /button> <
                button onClick = {
                    () => setDangerForm(false) }
                className = "btn btn-ghost"
                style = {
                    { flex: 1 } } > Cancelar < /button> <
                /div> <
                /div>
            )
        } <
        /div>

        <
        /div> <
        /div> <
        />
    );
};

export default BoardingPanel;