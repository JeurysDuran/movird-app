import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OCCUPANCY_LEVELS } from '../../data/mockData';

const BusSvg = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14h16M4 14v4a2 2 0 0 0 2 2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h2v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1a2 2 0 0 0 2-2v-4M4 14V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8M8 10h8M6 18h.01M18 18h.01" strokeLinecap="round"/></svg>;
const CheckSvg = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>;
const AlertSvg = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01"/></svg>;

const BoardingPanel = () => {
    const {
        activePanel, closePanel, currentUser, vehicles, routes,
        boardVehicle, alightVehicle, updateOccupancy, getETAToUser,
        addDangerZone, userLocation, showToast
    } = useApp();

    const [dangerForm, setDangerForm] = useState(false);
    const [dangerName, setDangerName] = useState('');
    const [dangerRisk, setDangerRisk] = useState('Medio');

    const isOpen = activePanel === 'boarding';
    const onBoard = currentUser ? currentUser.onBoard : null;

    const myVehicle = onBoard ? vehicles.find(v => v.id === onBoard) : null;
    const myRoute = myVehicle ? routes.find(r => r.id === myVehicle.routeId) : null;

    const handleBoard = (vehicleId) => { boardVehicle(vehicleId); };

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
        width: '100%', padding: '9px 12px', background: 'var(--surface3)',
        border: '1.5px solid var(--border2)', borderRadius: 8, color: 'var(--text)',
        fontFamily: 'var(--font)', fontSize: 13, outline: 'none', marginBottom: 8,
        boxSizing: 'border-box'
    };

    const occColors = { Vacio: '#15cc79', Medio: '#ffb020', Lleno: '#ff3b5c' };

    return (
        <>
            <div className={`panel-overlay ${isOpen ? 'open' : ''}`} onClick={closePanel} />
            <div className={`panel glass ${isOpen ? 'open' : ''}`}>
                <div className="panel-handle" />
                <div className="panel-header">
                    <span className="panel-title" style={{display: 'flex', alignItems: 'center', gap: 6}}>
                        <BusSvg /> Viaje en Curso
                    </span>
                    <button className="panel-close" onClick={closePanel}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="panel-body">

                    {myVehicle ? (
                        <div>
                            <div style={{ background: 'var(--blue-dim)', border: '1.5px solid var(--blue)', borderRadius: 12, padding: 16, marginBottom: 16, textAlign: 'center' }}>
                                <div style={{ fontSize: 28, marginBottom: 6, color: 'var(--blue)', display: 'flex', justifyContent: 'center' }}>
                                    <BusSvg />
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--blue)' }}>
                                    {myVehicle.type} · {myVehicle.id}
                                </div>
                                {myRoute && (
                                    <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
                                        {myRoute.name}
                                    </div>
                                )}
                                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
                                    {myVehicle.passengers.length} pasajero{myVehicle.passengers.length !== 1 ? 's' : ''} a bordo
                                </div>
                            </div>

                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10 }}>
                                ¿Cómo va la guagua?
                            </p>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                {OCCUPANCY_LEVELS.map(o => {
                                    const isActive = myVehicle.occupancy === o.value;
                                    return (
                                        <button key={o.value} onClick={() => updateOccupancy(myVehicle.id, o.value)} style={{ flex: 1, padding: '12px 6px', borderRadius: 10, border: `2px solid ${isActive ? o.color : 'var(--border2)'}`, background: isActive ? o.color + '22' : 'var(--surface2)', color: isActive ? o.color : 'var(--text2)', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                            <div style={{width: 14, height: 14, borderRadius: '50%', background: o.color}} />
                                            {o.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {myRoute && myRoute.stops.length > 0 && (
                                <>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10 }}>Paradas de la ruta</p>
                                    <div style={{maxHeight: 180, overflowY: 'auto', marginBottom: 16, pr: 12}}>
                                    {myRoute.stops.map((stop, i) => {
                                        const eta = getETAToUser ? getETAToUser(myVehicle.id) : null;
                                        return (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--blue-dim)', border: '1.5px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--blue)', flexShrink: 0 }}>
                                                    {i + 1}
                                                </div>
                                                <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>
                                                    {stop.name}
                                                </span>
                                                {i === 0 && eta !== null && (
                                                    <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>~{eta} min</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                    </div>
                                </>
                            )}

                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', margin: '16px 0 10px' }}>Finalizar viaje</p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {OCCUPANCY_LEVELS.map(o => (
                                    <button key={o.value} onClick={() => handleAlight(o.value)} className="btn btn-ghost" style={{ flex: 1, fontSize: 11 }}>
                                        Bajo ({o.label})
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>Selecciona el transporte al que vas a subir:</p>
                            {vehicles.map(v => {
                                const route = routes.find(r => r.id === v.routeId);
                                const occColor = occColors[v.occupancy] || 'var(--text2)';
                                const eta = getETAToUser ? getETAToUser(v.id) : null;
                                return (
                                    <div key={v.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 42, height: 42, borderRadius: 10, background: occColor + '22', border: `2px solid ${occColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: occColor, flexShrink: 0 }}>
                                            <BusSvg />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{v.type} · {v.id}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{route ? route.name : 'Sin ruta'}</div>
                                            <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                                                <span style={{ fontSize: 11, color: occColor, fontWeight: 700 }}>● {v.occupancy}</span>
                                                {eta !== null && (
                                                    <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>~{eta} min</span>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => handleBoard(v.id)} className="btn btn-accent" style={{ fontSize: 12, padding: '8px 12px', flexShrink: 0 }}>
                                            Subir
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertSvg /> Reportar Incidente
                        </p>
                        {!dangerForm ? (
                            <button onClick={() => setDangerForm(true)} className="btn btn-danger btn-block" style={{ fontSize: 13, display: 'flex', justifyContent: 'center', gap: 6 }}>
                                <AlertSvg /> Marcar Zona Peligrosa
                            </button>
                        ) : (
                            <div>
                                <input style={inputStyle} placeholder="Lugar (ej: Intersección Churchill)" value={dangerName} onChange={e => setDangerName(e.target.value)} />
                                <select style={inputStyle} value={dangerRisk} onChange={e => setDangerRisk(e.target.value)}>
                                    <option value="Bajo">Riesgo Bajo</option>
                                    <option value="Medio">Riesgo Medio</option>
                                    <option value="Alto">Riesgo Alto</option>
                                </select>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={handleMarkDanger} className="btn btn-danger" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 4 }}>
                                        <CheckSvg /> Confirmar
                                    </button>
                                    <button onClick={() => setDangerForm(false)} className="btn btn-ghost" style={{ flex: 1 }}>
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default BoardingPanel;