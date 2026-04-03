// src/components/Panels/AdminPanel.js
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSPORT_TYPES } from '../../data/mockData';

const TABS = ['Choferes', 'Rutas', 'Vehículos'];

const inp = {
    width: '100%', padding: '9px 12px', background: 'var(--surface3)',
    border: '1.5px solid var(--border2)', borderRadius: 8, color: 'var(--text)',
    fontFamily: 'var(--font)', fontSize: 13, outline: 'none',
    marginBottom: 8, boxSizing: 'border-box'
};
const secTitle = { fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10, marginTop: 16 };
const row = { display: 'flex', gap: 8, marginBottom: 8 };
const tableRow = { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: '1px solid var(--border)' };

const AdminPanel = () => {
    const {
        activePanel, closePanel, routes, vehicles, users, dangerZones,
        createRoute, deleteRoute, createVehicle, deleteVehicle, createDriver,
        setVehicles, showToast
    } = useApp();


    const [tab, setTab] = useState('Choferes');


    // Route form
    const [newRoute, setNewRoute] = useState({ name: '', type: 'OMSA', price: 25, stops: [] });
    const [assignDriver, setAssignDriver] = useState(''); // email to assign to new vehicle for route
    const [creating, setCreating] = useState(false);

    // Stop search state
    const [stopSearch, setStopSearch] = useState('');
    const [stopSuggestions, setStopSuggestions] = useState([]);
    const [loadingStops, setLoadingStops] = useState(false);
    const stopSearchTimer = useRef(null);

    // Vehicle form
    const [newVehicle, setNewVehicle] = useState({ type: 'OMSA', routeId: '', driverEmail: '' });

    // Driver form
    const [newDriver, setNewDriver] = useState({ name: '', email: '', phone: '', password: '' });
    const [showCreatePass, setShowCreatePass] = useState(false);
    const [revealPassFor, setRevealPassFor] = useState(null); // email of driver whose pass is shown

    // Map click handler for stop picking (fallback)
    const [isPickingMap, setIsPickingMap] = useState(false);
    useEffect(() => {
        const handler = (e) => {
            if (isPickingMap) {
                const stopName = prompt('Nombre de la parada:') || ('Parada ' + (newRoute.stops.length + 1));
                setNewRoute(prev => {
                    const stops = [...prev.stops, { name: stopName, lat: Number(e.detail.lat.toFixed(5)), lng: Number(e.detail.lng.toFixed(5)) }];
                    return { ...prev, stops };
                });
                setIsPickingMap(false);
                showToast('Parada añadida al mapa.', 'accent');
                // Re-open panel
                window.dispatchEvent(new CustomEvent('openPanel', { detail: 'admin-panel' }));
            }
        };
        window.addEventListener('mapClickAnywhere', handler);
        return () => window.removeEventListener('mapClickAnywhere', handler);
    }, [isPickingMap, showToast, newRoute.stops.length]);

    const isOpen = activePanel === 'admin' || activePanel === 'admin-panel';
    const drivers = Object.entries(users).filter(([, u]) => u.role === 'driver');

    // ── CHOFERES ─────────────────────────────────────────────────
    const handleCreateDriver = () => {
        if (!newDriver.name || !newDriver.email || !newDriver.password) {
            showToast('Nombre, usuario y contraseña requeridos', 'danger'); return;
        }
        const ok = createDriver({ name: newDriver.name, username: newDriver.email, password: newDriver.password, phone: newDriver.phone });
        if (ok) setNewDriver({ name: '', email: '', phone: '', password: '' });
    };

    // ── RUTAS ───────────────────────────────────────────────────
    // Búsqueda de parada con Nominatim
    const handleStopSearchChange = (val) => {
        setStopSearch(val);
        setStopSuggestions([]);
        if (stopSearchTimer.current) clearTimeout(stopSearchTimer.current);
        if (!val.trim() || val.length < 2) return;
        setLoadingStops(true);
        stopSearchTimer.current = setTimeout(() => {
            fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&countrycodes=do&limit=5`)
                .then(r => r.json())
                .then(data => { setStopSuggestions(data); setLoadingStops(false); })
                .catch(() => { setStopSuggestions([]); setLoadingStops(false); });
        }, 600);
    };

    const handleSelectStopSuggestion = (place) => {
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        const name = place.display_name.split(',')[0].trim();
        setNewRoute(r => ({ ...r, stops: [...r.stops, { name, lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) }] }));
        // Marcar en el mapa
        window.dispatchEvent(new CustomEvent('focusZone', { detail: { lat, lng } }));
        setStopSearch('');
        setStopSuggestions([]);
        showToast('Parada "' + name + '" añadida al mapa ✅', 'accent');
    };

    const handlePickFromMap = () => {
        setIsPickingMap(true);
        closePanel();
        showToast('Toca cualquier punto en el mapa para añadir parada', 'info');
    };

    const handleCreateRoute = async () => {
        if (!newRoute.name.trim()) { showToast('Nombre de ruta requerido', 'danger'); return; }
        if (newRoute.stops.length < 2) { showToast('Mínimo 2 paradas', 'danger'); return; }
        setCreating(true);
        const created = await createRoute({ ...newRoute, assignDriverEmail: assignDriver || undefined });
        setCreating(false);
        if (created) {
            // Si se asignó chofer, actualizar su vehicle
            if (assignDriver && created) {
                const newVeh = vehicles[vehicles.length - 1] || null;
                // el vehículo de la nueva ruta es el último creado por createRoute
                // Asignamos el chofer a ese vehículo
                setVehicles(prev => {
                    const lastV = [...prev].reverse().find(v => v.routeId === created.id);
                    if (!lastV) return prev;
                    return prev.map(v => v.id === lastV.id ? { ...v, driverEmail: assignDriver } : v);
                });
                showToast('Chofer asignado a la ruta', 'accent');
            }
            setNewRoute({ name: '', type: 'OMSA', price: 25, stops: [] });
            setAssignDriver('');
            // Mostrar ruta en el mapa
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('selectRoute', { detail: created }));
            }, 500);
        }
    };

    const handleDeleteRoute = (id) => {
        if (window.confirm('¿Eliminar esta ruta?')) deleteRoute(id);
    };

    const handleShowOnMap = (route) => {
        window.dispatchEvent(new CustomEvent('selectRoute', { detail: route }));
        closePanel();
        showToast('Mostrando ruta en el mapa', 'accent');
    };

    // Asignar chofer a ruta/vehículo existente
    const handleAssignDriverToRoute = (vehicleId, driverEmail) => {
        setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, driverEmail } : v));
        showToast('Chofer asignado al vehículo', 'accent');
    };

    // ── VEHÍCULOS ───────────────────────────────────────────────
    const handleCreateVehicle = () => {
        const routeId = newVehicle.routeId ? Number(newVehicle.routeId) : null;
        createVehicle({ type: newVehicle.type, routeId, driverEmail: newVehicle.driverEmail || null });
        setNewVehicle({ type: 'OMSA', routeId: '', driverEmail: '' });
    };

    const tabStyle = (t) => ({
        padding: '7px 14px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer',
        background: tab === t ? 'var(--surface2)' : 'transparent',
        color: tab === t ? 'var(--accent)' : 'var(--text2)',
        fontFamily: 'var(--font)', fontWeight: 600, fontSize: 12,
        borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
        whiteSpace: 'nowrap'
    });

    return (
        <>
            <div className={`panel-overlay ${isOpen ? 'open' : ''}`} onClick={closePanel} />
            <div className={`panel glass ${isOpen ? 'open' : ''}`} style={{ maxHeight: '90vh' }}>
                <div className="panel-handle" />
                <div className="panel-header">
                    <span className="panel-title">⚙️ Panel Admin</span>
                    <button className="panel-close" onClick={closePanel}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, padding: '8px 16px 0', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
                    {TABS.map(t => <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>{t}</button>)}
                </div>

                <div className="panel-body">

                    {/* ── TAB CHOFERES ── */}
                    {tab === 'Choferes' && (
                        <div>
                            <p style={secTitle}>Crear cuenta de chofer</p>
                            <input style={inp} placeholder="Nombre completo" value={newDriver.name} onChange={e => setNewDriver(d => ({ ...d, name: e.target.value }))} />
                            <input style={inp} placeholder="Usuario (sin espacios, ej: pedro.jose)" value={newDriver.email} onChange={e => setNewDriver(d => ({ ...d, email: e.target.value.toLowerCase().replace(/\s/g, '.') }))} />
                            <input style={inp} placeholder="Teléfono (opcional)" value={newDriver.phone} onChange={e => setNewDriver(d => ({ ...d, phone: e.target.value }))} />
                            <div style={{ position: 'relative', marginBottom: 8 }}>
                                <input
                                    style={{ ...inp, marginBottom: 0, paddingRight: 40 }}
                                    type={showCreatePass ? 'text' : 'password'}
                                    placeholder="Contraseña temporal"
                                    value={newDriver.password}
                                    onChange={e => setNewDriver(d => ({ ...d, password: e.target.value }))}
                                />
                                <button
                                    onClick={() => setShowCreatePass(p => !p)}
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', fontSize: 16, padding: 0 }}
                                    title={showCreatePass ? 'Ocultar' : 'Mostrar'}
                                >
                                    {showCreatePass ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <button onClick={handleCreateDriver} className="btn btn-accent btn-block">✅ Crear cuenta de chofer</button>

                            <p style={{ ...secTitle, marginTop: 20 }}>Choferes registrados ({drivers.length})</p>
                            {drivers.length === 0 && <div style={{ color: 'var(--text2)', fontSize: 13, padding: 12, textAlign: 'center' }}>Sin choferes aún</div>}
                            {drivers.map(([email, u]) => {
                                const vehicle = vehicles.find(v => v.driverEmail === email || v.id === u.vehicleId);
                                const route = vehicle ? routes.find(r => r.id === vehicle?.routeId) : null;
                                const code = (u.username || email.replace('driver.', '').split('@')[0]).toUpperCase();
                                const isRevealed = revealPassFor === email;
                                return (
                                    <div key={email} style={tableRow}>
                                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--blue),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                                            {u.name.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                                                Código: <strong style={{ color: 'var(--accent)' }}>{code}</strong>
                                                {route ? ` · ${route.name}` : ' · Sin ruta'}
                                            </div>
                                            <div style={{ fontSize: 10, color: 'var(--text2)' }}>
                                                Pasajeros: {u.passengers || 0} · Ingresos: RD$ {(u.income || 0).toLocaleString()}
                                            </div>
                                            {/* Contraseña visible para el admin */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                <span style={{ fontSize: 10, color: 'var(--text2)' }}>Clave:</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: isRevealed ? 0 : 3, color: 'var(--text)', fontFamily: 'monospace', background: 'var(--surface3)', padding: '2px 8px', borderRadius: 6, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {isRevealed ? (u.pass || '—') : '••••••••'}
                                                </span>
                                                <button
                                                    onClick={() => setRevealPassFor(isRevealed ? null : email)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '2px 4px', color: 'var(--text2)', flexShrink: 0 }}
                                                    title={isRevealed ? 'Ocultar' : 'Ver contraseña'}
                                                >
                                                    {isRevealed ? '🙈' : '👁️'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── TAB RUTAS ── */}
                    {tab === 'Rutas' && (
                        <div>
                            <p style={secTitle}>Crear nueva ruta</p>
                            <input style={inp} placeholder="Nombre de la ruta (ej: San Isidro → UASD)" value={newRoute.name} onChange={e => setNewRoute(r => ({ ...r, name: e.target.value }))} />
                            <div style={row}>
                                <select style={{ ...inp, flex: 1, marginBottom: 0 }} value={newRoute.type} onChange={e => setNewRoute(r => ({ ...r, type: e.target.value }))}>
                                    {TRANSPORT_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                                <input style={{ ...inp, flex: 1, marginBottom: 0 }} type="number" placeholder="Precio RD$" value={newRoute.price} onChange={e => setNewRoute(r => ({ ...r, price: e.target.value }))} />
                            </div>

                            {/* Asignar chofer */}
                            <select style={inp} value={assignDriver} onChange={e => setAssignDriver(e.target.value)}>
                                <option value="">Sin chofer asignado (opcional)</option>
                                {drivers.map(([email, u]) => <option key={email} value={email}>{u.name}</option>)}
                            </select>


                            {/* Añadir parada con buscador real */}
                            <p style={{ ...secTitle, marginTop: 14 }}>Añadir Paradas ({newRoute.stops.length})</p>

                            {/* Lista de paradas ya añadidas */}
                            {newRoute.stops.length > 0 && (
                                <div style={{ marginBottom: 12 }}>
                                    {newRoute.stops.map((s, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', marginBottom: 4, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', fontSize: 12 }}>
                                            <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                                            <span style={{ flex: 1, fontWeight: 600 }}>{s.name}</span>
                                            <span style={{ color: 'var(--text2)', fontSize: 10 }}>{s.lat?.toFixed(4)}, {s.lng?.toFixed(4)}</span>
                                            <button onClick={() => {
                                                window.dispatchEvent(new CustomEvent('focusZone', { detail: { lat: s.lat, lng: s.lng } }));
                                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--blue)', padding: '2px 4px' }}>📍</button>
                                            <button onClick={() => setNewRoute(r => ({ ...r, stops: r.stops.filter((_, idx) => idx !== i) }))}
                                                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Buscador de parada */}
                            <div style={{ position: 'relative', marginBottom: 6 }}>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: 14 }}>🔍</span>
                                        <input
                                            style={{ ...inp, paddingLeft: 32, marginBottom: 0 }}
                                            placeholder="Buscar parada (ej: Malecón, UASD...)"
                                            value={stopSearch}
                                            onChange={e => handleStopSearchChange(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Sugerencias */}
                                {(loadingStops || stopSuggestions.length > 0) && (
                                    <div style={{
                                        position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 200,
                                        background: 'var(--surface)', border: '1.5px solid var(--border2)',
                                        borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', overflow: 'hidden'
                                    }}>
                                        {loadingStops && (
                                            <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text2)' }}>Buscando lugares...</div>
                                        )}
                                        {!loadingStops && stopSuggestions.map(place => (
                                            <div key={place.place_id}
                                                onClick={() => handleSelectStopSuggestion(place)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 10,
                                                    padding: '10px 14px', cursor: 'pointer',
                                                    borderBottom: '1px solid var(--border)',
                                                    transition: 'background 0.15s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <span style={{ fontSize: 16, flexShrink: 0 }}>📍</span>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                                                        {place.display_name.split(',')[0]}
                                                    </div>
                                                    <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                                                        {place.display_name}
                                                    </div>
                                                </div>
                                                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>+ Añadir</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button onClick={handlePickFromMap} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px dashed var(--border2)', background: 'var(--surface2)', color: 'var(--text2)', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                📌 O toca el mapa directamente para poner una parada
                            </button>

                            <button onClick={handleCreateRoute} className="btn btn-accent btn-block" disabled={creating} style={{ marginTop: 4 }}>
                                {creating ? '⏳ Calculando ruta...' : '✅ Crear ruta en el mapa'}
                            </button>
                            <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'center', marginTop: 6 }}>La ruta respetará las calles vía OSRM y aparecerá en el mapa</div>


                            {/* Lista de rutas */}
                            <p style={{ ...secTitle, marginTop: 20 }}>Rutas activas ({routes.length})</p>
                            {routes.length === 0 && <div style={{ color: 'var(--text2)', fontSize: 13, padding: 12, textAlign: 'center' }}>Sin rutas creadas. ¡Crea la primera!</div>}
                            {routes.map(r => {
                                const routeVehicles = vehicles.filter(v => v.routeId === r.id);
                                return (
                                    <div key={r.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</span>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => handleShowOnMap(r)} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }}>🗺 Ver</button>
                                                <button onClick={() => handleDeleteRoute(r.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 11 }}>✕</button>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'var(--blue-dim)', color: 'var(--blue)' }}>{r.type}</span>
                                            <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>RD$ {r.price}</span>
                                            <span style={{ fontSize: 11, color: 'var(--text2)' }}>{r.stops?.length || 0} paradas</span>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>
                                            {r.stops?.map(s => s.name).join(' → ')}
                                        </div>
                                        {/* Asignar chofer a vehículo de esta ruta */}
                                        {routeVehicles.map(v => (
                                            <div key={v.id} style={{ display: 'flex', gap: 6, alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                                                <span style={{ fontSize: 11, color: 'var(--text2)', flex: 1 }}>🚌 {v.id}</span>
                                                <select
                                                    value={v.driverEmail || ''}
                                                    onChange={e => handleAssignDriverToRoute(v.id, e.target.value)}
                                                    style={{ ...inp, marginBottom: 0, flex: 2, fontSize: 11, padding: '5px 8px' }}
                                                >
                                                    <option value="">Sin chofer</option>
                                                    {drivers.map(([email, u]) => <option key={email} value={email}>{u.name}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── TAB VEHÍCULOS ── */}
                    {tab === 'Vehículos' && (
                        <div>
                            <p style={secTitle}>Registrar nuevo vehículo</p>
                            <select style={inp} value={newVehicle.type} onChange={e => setNewVehicle(v => ({ ...v, type: e.target.value }))}>
                                {TRANSPORT_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                            <select style={inp} value={newVehicle.routeId} onChange={e => setNewVehicle(v => ({ ...v, routeId: e.target.value }))}>
                                <option value="">Sin ruta asignada</option>
                                {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                            <select style={inp} value={newVehicle.driverEmail} onChange={e => setNewVehicle(v => ({ ...v, driverEmail: e.target.value }))}>
                                <option value="">Sin chofer asignado</option>
                                {drivers.map(([email, u]) => <option key={email} value={email}>{u.name}</option>)}
                            </select>
                            <button onClick={handleCreateVehicle} className="btn btn-accent btn-block">✅ Registrar vehículo</button>

                            <p style={{ ...secTitle, marginTop: 20 }}>Flota ({vehicles.length} vehículos)</p>
                            {vehicles.length === 0 && <div style={{ color: 'var(--text2)', fontSize: 13, padding: 12, textAlign: 'center' }}>Sin vehículos registrados</div>}
                            {vehicles.map(v => {
                                const route = routes.find(r => r.id === v.routeId);
                                const driver = v.driverEmail ? users[v.driverEmail] : null;
                                const occColor = { Vacio: '#00d4a0', Medio: '#ff9a3c', Lleno: '#ff3b5c' }[v.occupancy] || '#8899bb';
                                return (
                                    <div key={v.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--accent)' }}>{v.id}</span>
                                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: occColor + '22', color: occColor, fontWeight: 700 }}>{v.occupancy}</span>
                                            <span style={{ flex: 1, fontSize: 11, color: 'var(--text2)' }}>{v.type}</span>
                                            <button onClick={() => { if (v.lat && v.lng) { window.dispatchEvent(new CustomEvent('focusVehicle', { detail: v })); closePanel(); } else showToast('Sin GPS aún', 'warn'); }}
                                                className="btn btn-ghost" style={{ padding: '3px 7px', fontSize: 11 }}>📍</button>
                                            <button onClick={() => { if (window.confirm(`¿Eliminar ${v.id}?`)) deleteVehicle(v.id); }}
                                                className="btn btn-danger" style={{ padding: '3px 7px', fontSize: 11 }}>✕</button>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 6 }}>
                                            {driver ? `👤 ${driver.name}` : '👤 Sin chofer'} · {route ? route.name : 'Sin ruta'} · {v.passengers?.length || 0} a bordo
                                        </div>
                                        {/* Asignar chofer inline */}
                                        <div style={{ marginTop: 8 }}>
                                            <select
                                                value={v.driverEmail || ''}
                                                onChange={e => handleAssignDriverToRoute(v.id, e.target.value)}
                                                style={{ ...inp, marginBottom: 0, fontSize: 11, padding: '5px 8px' }}
                                            >
                                                <option value="">Sin chofer</option>
                                                {drivers.map(([email, u]) => <option key={email} value={email}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminPanel;