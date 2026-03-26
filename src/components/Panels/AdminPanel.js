// src/components/Panels/AdminPanel.js
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSPORT_TYPES, RISK_LEVELS } from '../../data/mockData';

const TABS = ['Rutas', 'Vehículos', 'Choferes', 'Zonas', 'Reportes'];

const AdminPanel = () => {
        const {
            activePanel,
            closePanel,
            routes,
            vehicles,
            users,
            dangerZones,
            reports,
            transactions,
            addRoute,
            updateRoute,
            deleteRoute,
            addVehicle,
            deleteVehicle,
            updateVehicle,
            createDriverAccount,
            addDangerZone,
            deleteDangerZone,
            showToast
        } = useApp();

        const [tab, setTab] = useState('Rutas');

        // -- estado formulario nueva ruta --
        const [newRoute, setNewRoute] = useState({ name: '', type: 'OMSA', price: 25, stops: [] });
        const [newStop, setNewStop] = useState({ name: '', lat: '', lng: '' });
        const [editingRoute, setEditingRoute] = useState(null);

        // -- estado formulario nuevo vehículo --
        const [newVehicle, setNewVehicle] = useState({ type: 'OMSA', routeId: '', driverEmail: '' });

        // -- estado formulario nuevo chofer --
        const [newDriver, setNewDriver] = useState({ name: '', email: '', password: '', phone: '' });

        // -- estado formulario nueva zona peligro --
        const [newZone, setNewZone] = useState({ name: '', risk: 'Medio', lat: '', lng: '' });

        const isOpen = activePanel === 'admin';
        const drivers = Object.entries(users).filter(([, u]) => u.role === 'driver');

        // ── RUTAS ──────────────────────────────────────────────────────
        const handleAddStop = () => {
            const lat = parseFloat(newStop.lat);
            const lng = parseFloat(newStop.lng);
            if (!newStop.name || isNaN(lat) || isNaN(lng)) {
                showToast('Nombre y coordenadas válidas requeridas', 'danger');
                return;
            }
            setNewRoute(r => ({...r, stops: [...r.stops, { name: newStop.name, lat, lng }] }));
            setNewStop({ name: '', lat: '', lng: '' });
        };

        const handleRemoveStop = (idx) => {
            setNewRoute(r => ({...r, stops: r.stops.filter((_, i) => i !== idx) }));
        };

        const handleCreateRoute = () => {
            if (!newRoute.name.trim()) { showToast('Nombre de ruta requerido', 'danger'); return; }
            if (newRoute.stops.length < 2) { showToast('Mínimo 2 paradas', 'danger'); return; }
            addRoute(newRoute);
            setNewRoute({ name: '', type: 'OMSA', price: 25, stops: [] });
        };

        const handleDeleteRoute = (id) => {
            if (window.confirm('¿Eliminar esta ruta?')) deleteRoute(id);
        };

        const handleShowOnMap = (route) => {
            window.dispatchEvent(new CustomEvent('selectRoute', { detail: route }));
            closePanel();
            showToast(`Mostrando: ${route.name}`, 'accent');
        };

        // ── VEHÍCULOS ─────────────────────────────────────────────────
        const handleCreateVehicle = () => {
            const routeId = newVehicle.routeId ? parseInt(newVehicle.routeId) : null;
            const driverUser = newVehicle.driverEmail ? users[newVehicle.driverEmail] : null;
            addVehicle({
                type: newVehicle.type,
                routeId,
                driverEmail: newVehicle.driverEmail || null,
                driverName: driverUser ? driverUser.name : 'Sin chofer'
            });
            setNewVehicle({ type: 'OMSA', routeId: '', driverEmail: '' });
        };

        const handleDeleteVehicle = (id) => {
            if (window.confirm(`¿Eliminar vehículo ${id}?`)) deleteVehicle(id);
        };

        const handleFocusVehicle = (v) => {
            if (!v.lat || !v.lng) { showToast('Vehículo sin ubicación GPS aún', 'warn'); return; }
            window.dispatchEvent(new CustomEvent('focusVehicle', { detail: v }));
            closePanel();
        };

        // ── CHOFERES ──────────────────────────────────────────────────
        const handleCreateDriver = () => {
            if (!newDriver.name || !newDriver.email || !newDriver.password) {
                showToast('Nombre, correo y contraseña requeridos', 'danger');
                return;
            }
            const ok = createDriverAccount(newDriver.name, newDriver.email, newDriver.password, newDriver.phone);
            if (ok) setNewDriver({ name: '', email: '', password: '', phone: '' });
        };

        // ── ZONAS DE PELIGRO ─────────────────────────────────────────
        const handleMarkOnMap = () => {
            window.dispatchEvent(new Event('enableDangerMode'));
            closePanel();
        };

        const handleAddZoneManual = () => {
            const lat = parseFloat(newZone.lat);
            const lng = parseFloat(newZone.lng);
            if (!newZone.name || isNaN(lat) || isNaN(lng)) {
                showToast('Nombre y coordenadas requeridas', 'danger');
                return;
            }
            addDangerZone(newZone.name, newZone.risk, lat, lng);
            setNewZone({ name: '', risk: 'Medio', lat: '', lng: '' });
        };

        const handleDeleteZone = (id) => {
            if (window.confirm('¿Eliminar zona de peligro?')) deleteDangerZone(id);
        };

        // ── ESTILOS INLINE ────────────────────────────────────────────
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
        const selectStyle = {...inputStyle };
        const rowStyle = { display: 'flex', gap: 8, marginBottom: 8 };
        const sectionTitle = { fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10, marginTop: 16 };
        const badgeStyle = (color) => ({
            padding: '2px 7px',
            borderRadius: 100,
            fontSize: 10,
            fontWeight: 700,
            background: color + '22',
            color
        });
        const tableRow = { display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0', borderBottom: '1px solid var(--border)' };

        return ( <
                >
                <
                div className = { `panel-overlay ${isOpen ? 'open' : ''}` }
                onClick = { closePanel }
                /> <
                div className = { `panel glass ${isOpen ? 'open' : ''}` }
                style = {
                    { maxHeight: '90vh' } } >
                <
                div className = "panel-handle" / >
                <
                div className = "panel-header" >
                <
                span className = "panel-title" > ⚙️Panel Admin < /span> <
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
                /div>

                { /* Tabs */ } <
                div style = {
                    { display: 'flex', gap: 4, padding: '8px 16px 0', borderBottom: '1px solid var(--border)', overflowX: 'auto' } } > {
                    TABS.map(t => ( <
                        button key = { t }
                        onClick = {
                            () => setTab(t) }
                        style = {
                            {
                                padding: '7px 14px',
                                borderRadius: '8px 8px 0 0',
                                border: 'none',
                                background: tab === t ? 'var(--surface2)' : 'transparent',
                                color: tab === t ? 'var(--accent)' : 'var(--text2)',
                                fontFamily: 'var(--font)',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                                whiteSpace: 'nowrap'
                            }
                        } > { t } < /button>
                    ))
                } <
                /div>

                <
                div className = "panel-body" >

                { /* ── TAB RUTAS ─────────────────────────────── */ } {
                    tab === 'Rutas' && ( <
                            div >
                            <
                            p style = { sectionTitle } > Crear nueva ruta < /p> <
                            input style = { inputStyle }
                            placeholder = "Nombre de la ruta (ej: San Isidro → UASD)"
                            value = { newRoute.name }
                            onChange = { e => setNewRoute(r => ({...r, name: e.target.value })) }
                            /> <
                            div style = { rowStyle } >
                            <
                            select style = {
                                {...selectStyle, flex: 1, marginBottom: 0 } }
                            value = { newRoute.type }
                            onChange = { e => setNewRoute(r => ({...r, type: e.target.value })) } > {
                                TRANSPORT_TYPES.map(t => < option key = { t } > { t } < /option>)} <
                                    /select> <
                                    input style = {
                                        {...inputStyle, flex: 1, marginBottom: 0 } }
                                    type = "number"
                                    placeholder = "Precio RD$"
                                    value = { newRoute.price }
                                    onChange = { e => setNewRoute(r => ({...r, price: e.target.value })) }
                                    /> <
                                    /div>

                                    <
                                    p style = {
                                        {...sectionTitle, marginTop: 14 } } > Paradas({ newRoute.stops.length }) < /p> {
                                        newRoute.stops.map((s, i) => ( <
                                            div key = { i }
                                            style = {
                                                {...tableRow, fontSize: 12 } } >
                                            <
                                            span style = {
                                                { color: 'var(--accent)', fontWeight: 700, minWidth: 18 } } > { i + 1 } < /span> <
                                            span style = {
                                                { flex: 1 } } > { s.name } < /span> <
                                            span style = {
                                                { color: 'var(--text2)', fontSize: 11 } } > { s.lat.toFixed(4) }, { s.lng.toFixed(4) } < /span> <
                                            button onClick = {
                                                () => handleRemoveStop(i) }
                                            style = {
                                                {
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--danger)',
                                                    cursor: 'pointer',
                                                    fontSize: 14,
                                                    padding: '0 4px'
                                                }
                                            } > ✕ < /button> <
                                            /div>
                                        ))
                                    } <
                                    div style = { rowStyle } >
                                    <
                                    input style = {
                                        {...inputStyle, flex: 2, marginBottom: 0 } }
                                    placeholder = "Nombre parada"
                                    value = { newStop.name }
                                    onChange = { e => setNewStop(s => ({...s, name: e.target.value })) }
                                    /> <
                                    input style = {
                                        {...inputStyle, flex: 1, marginBottom: 0 } }
                                    placeholder = "Lat"
                                    value = { newStop.lat }
                                    onChange = { e => setNewStop(s => ({...s, lat: e.target.value })) }
                                    /> <
                                    input style = {
                                        {...inputStyle, flex: 1, marginBottom: 0 } }
                                    placeholder = "Lng"
                                    value = { newStop.lng }
                                    onChange = { e => setNewStop(s => ({...s, lng: e.target.value })) }
                                    /> <
                                    button onClick = { handleAddStop }
                                    className = "btn btn-ghost"
                                    style = {
                                        { marginBottom: 0, height: 38 } } > + < /button> <
                                    /div> <
                                    button onClick = { handleCreateRoute }
                                    className = "btn btn-accent btn-block"
                                    style = {
                                        { marginTop: 10 } } > ✅Crear ruta <
                                    /button>

                                    <
                                    p style = {
                                        {...sectionTitle, marginTop: 20 } } > Rutas existentes({ routes.length }) < /p> {
                                        routes.map(r => ( <
                                            div key = { r.id }
                                            style = {
                                                { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 10 } } >
                                            <
                                            div style = {
                                                { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 } } >
                                            <
                                            span style = {
                                                { fontWeight: 700, fontSize: 13 } } > { r.name } < /span> <
                                            div style = {
                                                { display: 'flex', gap: 6 } } >
                                            <
                                            button onClick = {
                                                () => handleShowOnMap(r) }
                                            className = "btn btn-ghost"
                                            style = {
                                                { padding: '4px 8px', fontSize: 11 } } > 🗺Ver < /button> <
                                            button onClick = {
                                                () => handleDeleteRoute(r.id) }
                                            className = "btn btn-danger"
                                            style = {
                                                { padding: '4px 8px', fontSize: 11 } } > ✕ < /button> <
                                            /div> <
                                            /div> <
                                            div style = {
                                                { display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 } } >
                                            <
                                            span className = { `transport-tag tag-${r.type.toLowerCase()}` } > { r.type } < /span> <
                                            span style = {
                                                { color: 'var(--accent)', fontSize: 12, fontWeight: 700 } } > RD$ { r.price } < /span> <
                                            /div> <
                                            div style = {
                                                { fontSize: 11, color: 'var(--text2)' } } > { r.stops.map(s => s.name).join(' → ') } <
                                            /div> <
                                            /div>
                                        ))
                                    } <
                                    /div>
                                )
                            }

                            { /* ── TAB VEHÍCULOS ─────────────────────────── */ } {
                                tab === 'Vehículos' && ( <
                                        div >
                                        <
                                        p style = { sectionTitle } > Registrar nuevo vehículo < /p> <
                                        select style = { selectStyle }
                                        value = { newVehicle.type }
                                        onChange = { e => setNewVehicle(v => ({...v, type: e.target.value })) } > {
                                            TRANSPORT_TYPES.map(t => < option key = { t } > { t } < /option>)} <
                                                /select> <
                                                select style = { selectStyle }
                                                value = { newVehicle.routeId }
                                                onChange = { e => setNewVehicle(v => ({...v, routeId: e.target.value })) } >
                                                <
                                                option value = "" > Sin ruta asignada < /option> {
                                                    routes.map(r => < option key = { r.id }
                                                        value = { r.id } > { r.name } < /option>)} <
                                                        /select> <
                                                        select style = { selectStyle }
                                                        value = { newVehicle.driverEmail }
                                                        onChange = { e => setNewVehicle(v => ({...v, driverEmail: e.target.value })) } >
                                                        <
                                                        option value = "" > Sin chofer asignado < /option> {
                                                            drivers.map(([email, u]) => ( <
                                                                option key = { email }
                                                                value = { email } > { u.name }({ email }) < /option>
                                                            ))
                                                        } <
                                                        /select> <
                                                        button onClick = { handleCreateVehicle }
                                                        className = "btn btn-accent btn-block" > ✅Registrar vehículo(ID auto) <
                                                        /button>

                                                        <
                                                        p style = {
                                                            {...sectionTitle, marginTop: 20 } } > Flota({ vehicles.length }
                                                            vehículos) < /p> {
                                                            vehicles.map(v => {
                                                                const route = routes.find(r => r.id === v.routeId);
                                                                const occColor = { Vacio: '#00d4a0', Medio: '#ff9a3c', Lleno: '#ff3b5c' }[v.occupancy] || '#8899bb';
                                                                return ( <
                                                                    div key = { v.id }
                                                                    style = {
                                                                        {...tableRow, alignItems: 'flex-start', flexDirection: 'column', padding: '10px 0' } } >
                                                                    <
                                                                    div style = {
                                                                        { display: 'flex', width: '100%', alignItems: 'center', gap: 8 } } >
                                                                    <
                                                                    span style = {
                                                                        { fontWeight: 800, fontSize: 13, color: 'var(--accent)' } } > { v.id } < /span> <
                                                                    span className = { `transport-tag tag-${v.type.toLowerCase()}` } > { v.type } < /span> <
                                                                    span style = { badgeStyle(occColor) } > { v.occupancy } < /span> <
                                                                    span style = {
                                                                        { marginLeft: 'auto', display: 'flex', gap: 6 } } >
                                                                    <
                                                                    button onClick = {
                                                                        () => handleFocusVehicle(v) }
                                                                    className = "btn btn-ghost"
                                                                    style = {
                                                                        { padding: '3px 7px', fontSize: 11 } } > 📍 < /button> <
                                                                    button onClick = {
                                                                        () => handleDeleteVehicle(v.id) }
                                                                    className = "btn btn-danger"
                                                                    style = {
                                                                        { padding: '3px 7px', fontSize: 11 } } > ✕ < /button> <
                                                                    /span> <
                                                                    /div> <
                                                                    div style = {
                                                                        { fontSize: 11, color: 'var(--text2)', marginTop: 4 } } > 👤{ v.driver }· { route ? route.name : 'Sin ruta' }· { v.passengers ? v.passengers.length : 0 }
                                                                    a bordo <
                                                                    /div> <
                                                                    /div>
                                                                );
                                                            })
                                                        } <
                                                        /div>
                                                    )
                                                }

                                                { /* ── TAB CHOFERES ──────────────────────────── */ } {
                                                    tab === 'Choferes' && ( <
                                                        div >
                                                        <
                                                        p style = { sectionTitle } > Crear cuenta de chofer < /p> <
                                                        input style = { inputStyle }
                                                        placeholder = "Nombre completo"
                                                        value = { newDriver.name }
                                                        onChange = { e => setNewDriver(d => ({...d, name: e.target.value })) }
                                                        /> <
                                                        input style = { inputStyle }
                                                        placeholder = "Correo electrónico"
                                                        value = { newDriver.email }
                                                        onChange = { e => setNewDriver(d => ({...d, email: e.target.value })) }
                                                        /> <
                                                        input style = { inputStyle }
                                                        placeholder = "Teléfono (opcional)"
                                                        value = { newDriver.phone }
                                                        onChange = { e => setNewDriver(d => ({...d, phone: e.target.value })) }
                                                        /> <
                                                        input style = { inputStyle }
                                                        type = "password"
                                                        placeholder = "Contraseña temporal"
                                                        value = { newDriver.password }
                                                        onChange = { e => setNewDriver(d => ({...d, password: e.target.value })) }
                                                        /> <
                                                        button onClick = { handleCreateDriver }
                                                        className = "btn btn-accent btn-block" > ✅Crear cuenta de chofer <
                                                        /button>

                                                        <
                                                        p style = {
                                                            {...sectionTitle, marginTop: 20 } } > Choferes registrados({ drivers.length }) < /p> {
                                                            drivers.map(([email, u]) => {
                                                                const vehicle = vehicles.find(v => v.driverEmail === email || v.id === u.vehicleId);
                                                                return ( <
                                                                    div key = { email }
                                                                    style = { tableRow } >
                                                                    <
                                                                    div style = {
                                                                        {
                                                                            width: 36,
                                                                            height: 36,
                                                                            borderRadius: '50%',
                                                                            background: 'linear-gradient(135deg,var(--blue),var(--purple))',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            fontWeight: 700,
                                                                            fontSize: 13,
                                                                            flexShrink: 0
                                                                        }
                                                                    } > { u.name.charAt(0) } < /div> <
                                                                    div style = {
                                                                        { flex: 1, minWidth: 0 } } >
                                                                    <
                                                                    div style = {
                                                                        { fontWeight: 600, fontSize: 13 } } > { u.name } < /div> <
                                                                    div style = {
                                                                        { fontSize: 11, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis' } } > { email }· { vehicle ? vehicle.id : 'Sin vehículo' } <
                                                                    /div> <
                                                                    /div> <
                                                                    /div>
                                                                );
                                                            })
                                                        } <
                                                        /div>
                                                    )
                                                }

                                                { /* ── TAB ZONAS PELIGRO ─────────────────────── */ } {
                                                    tab === 'Zonas' && ( <
                                                        div >
                                                        <
                                                        p style = { sectionTitle } > Marcar zona peligrosa < /p> <
                                                        button onClick = { handleMarkOnMap }
                                                        className = "btn btn-danger btn-block"
                                                        style = {
                                                            { marginBottom: 14 } } > 📍Tocar el mapa para marcar <
                                                        /button>

                                                        <
                                                        p style = {
                                                            {...sectionTitle, marginTop: 2 } } > O ingresa coordenadas manualmente < /p> <
                                                        input style = { inputStyle }
                                                        placeholder = "Nombre del lugar"
                                                        value = { newZone.name }
                                                        onChange = { e => setNewZone(z => ({...z, name: e.target.value })) }
                                                        /> <
                                                        select style = { selectStyle }
                                                        value = { newZone.risk }
                                                        onChange = { e => setNewZone(z => ({...z, risk: e.target.value })) } > {
                                                            RISK_LEVELS.map(r => < option key = { r.value }
                                                                value = { r.value } > { r.label } < /option>)} <
                                                                /select> <
                                                                div style = { rowStyle } >
                                                                <
                                                                input style = {
                                                                    {...inputStyle, flex: 1, marginBottom: 0 } }
                                                                placeholder = "Latitud"
                                                                value = { newZone.lat }
                                                                onChange = { e => setNewZone(z => ({...z, lat: e.target.value })) }
                                                                /> <
                                                                input style = {
                                                                    {...inputStyle, flex: 1, marginBottom: 0 } }
                                                                placeholder = "Longitud"
                                                                value = { newZone.lng }
                                                                onChange = { e => setNewZone(z => ({...z, lng: e.target.value })) }
                                                                /> <
                                                                /div> <
                                                                button onClick = { handleAddZoneManual }
                                                                className = "btn btn-warn btn-block"
                                                                style = {
                                                                    { marginTop: 10 } } > ✅Añadir zona <
                                                                /button>

                                                                <
                                                                p style = {
                                                                    {...sectionTitle, marginTop: 20 } } > Zonas registradas({ dangerZones.length }) < /p> {
                                                                    dangerZones.map(z => {
                                                                        const rc = RISK_LEVELS.find(r => r.value === z.risk);
                                                                        const color = rc ? rc.color : '#ff9a3c';
                                                                        return ( <
                                                                            div key = { z.id }
                                                                            style = {
                                                                                {...tableRow } } >
                                                                            <
                                                                            div style = {
                                                                                {
                                                                                    width: 10,
                                                                                    height: 10,
                                                                                    borderRadius: '50%',
                                                                                    background: color,
                                                                                    flexShrink: 0
                                                                                }
                                                                            }
                                                                            /> <
                                                                            div style = {
                                                                                { flex: 1 } } >
                                                                            <
                                                                            div style = {
                                                                                { fontWeight: 600, fontSize: 13 } } > { z.name } < /div> <
                                                                            div style = {
                                                                                { fontSize: 11, color: 'var(--text2)' } } >
                                                                            Riesgo { z.risk }· { z.incidents }
                                                                            incidentes <
                                                                            /div> <
                                                                            /div> <
                                                                            div style = {
                                                                                { display: 'flex', gap: 6 } } >
                                                                            <
                                                                            button onClick = {
                                                                                () => {
                                                                                    window.dispatchEvent(new CustomEvent('focusZone', { detail: z }));
                                                                                    closePanel();
                                                                                }
                                                                            }
                                                                            className = "btn btn-ghost"
                                                                            style = {
                                                                                { padding: '3px 7px', fontSize: 11 } } > 📍 < /button> <
                                                                            button onClick = {
                                                                                () => handleDeleteZone(z.id) }
                                                                            className = "btn btn-danger"
                                                                            style = {
                                                                                { padding: '3px 7px', fontSize: 11 } } > ✕ < /button> <
                                                                            /div> <
                                                                            /div>
                                                                        );
                                                                    })
                                                                } <
                                                                /div>
                                                            )
                                                        }

                                                        { /* ── TAB REPORTES ──────────────────────────── */ } {
                                                            tab === 'Reportes' && ( <
                                                                div >
                                                                <
                                                                p style = { sectionTitle } > Incidentes reportados({ reports.length }) < /p> {
                                                                    reports.length === 0 && ( <
                                                                        p style = {
                                                                            { color: 'var(--text2)', fontSize: 13, textAlign: 'center', marginTop: 20 } } > Sin reportes aún < /p>
                                                                    )
                                                                } {
                                                                    reports.map(r => ( <
                                                                            div key = { r.id }
                                                                            style = {
                                                                                { background: 'var(--surface2)', borderRadius: 10, padding: 10, marginBottom: 8, border: '1px solid var(--border)' } } >
                                                                            <
                                                                            div style = {
                                                                                { fontWeight: 700, fontSize: 13 } } > { r.label } < /div> <
                                                                            div style = {
                                                                                { fontSize: 11, color: 'var(--text2)', marginTop: 3 } } > 👤{ r.user }· { r.time } {
                                                                                r.lat && < span > ·{ r.lat.toFixed(4) }, { r.lng.toFixed(4) } < /span>} <
                                                                                    /div> <
                                                                                    /div>
                                                                            ))
                                                                    }

                                                                    <
                                                                    p style = {
                                                                            {...sectionTitle, marginTop: 20 } } > Transacciones({ transactions.length }) < /p> {
                                                                            transactions.length === 0 && ( <
                                                                                p style = {
                                                                                    { color: 'var(--text2)', fontSize: 13, textAlign: 'center' } } > Sin transacciones aún < /p>
                                                                            )
                                                                        } {
                                                                            transactions.map(t => ( <
                                                                                div key = { t.id }
                                                                                style = {
                                                                                    {...tableRow, fontSize: 12 } } >
                                                                                <
                                                                                span style = {
                                                                                    { flex: 1 } } > { t.user } < /span> <
                                                                                span style = {
                                                                                    { color: 'var(--accent)', fontWeight: 700 } } > RD$ { t.amount } < /span> <
                                                                                span style = {
                                                                                    { color: 'var(--text2)' } } > { t.type } < /span> <
                                                                                /div>
                                                                            ))
                                                                        } <
                                                                        /div>
                                                                )
                                                            }

                                                            <
                                                            /div> <
                                                            /div> <
                                                            />
                                                        );
                                                    };

                                                    export default AdminPanel;