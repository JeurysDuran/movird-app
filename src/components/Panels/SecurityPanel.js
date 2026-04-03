// src/components/Panels/SecurityPanel.js
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const PASSENGER_INCIDENT_TYPES = [
    { id: 'theft', label: 'Robo / Asalto', icon: '⚠️' },
    { id: 'accident', label: 'Accidente', icon: '💥' },
    { id: 'harassment', label: 'Acoso', icon: '🚫' },
    { id: 'traffic', label: 'Tapón grave', icon: '🚗' },
    { id: 'overcharge', label: 'Cobro excesivo', icon: '💸' },
    { id: 'notstop', label: 'Chofer no paró', icon: '🛑' },
];

const DRIVER_REPORT_TYPES = [
    { id: 'aggressive', label: 'Pasajero agresivo', icon: '😠' },
    { id: 'nopay', label: 'No pagó el pasaje', icon: '💸' },
    { id: 'vandalism', label: 'Daños al vehículo', icon: '🔨' },
    { id: 'drugs', label: 'Sospecha de drogas', icon: '🚨' },
    { id: 'weapon', label: 'Portación de arma', icon: '⚠️' },
    { id: 'other', label: 'Otro incidente', icon: '📋' },
];

const SecurityPanel = () => {
    const { activePanel, closePanel, currentUser, dangerZones, addReport, reports, vehicles } = useApp();
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [incidentNote, setIncidentNote] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const isOpen = activePanel === 'security-panel';

    const role = currentUser?.role;
    const isDriver = role === 'driver';
    const isAdmin = role === 'admin' || role === 'company_admin';
    const isPassenger = !isDriver && !isAdmin;

    const handleSubmitReport = () => {
        if (!selectedIncident) return;
        addReport(selectedIncident.id, selectedIncident.label + (incidentNote ? ': ' + incidentNote : ''), null, null);
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); setSelectedIncident(null); setIncidentNote(''); }, 3000);
    };

    const handleEmergency = () => {
        addReport('emergency', '🚨 EMERGENCIA activada', null, null);
        alert('🚨 EMERGENCIA ACTIVADA\n\nSe ha notificado a las autoridades.\nPermanece en un lugar seguro.');
    };

    const getRiskColor = (risk) => ({ Alto: '#ff3b5c', Medio: '#ff9a3c', Bajo: '#00d4a0' }[risk] || '#888');

    const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border2)', background: 'var(--surface3)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginTop: 10, resize: 'none' };

    const allReports = [...reports].slice(0, 20);

    return (
        <>
            <div className={`panel-overlay ${isOpen ? 'open' : ''}`} onClick={closePanel} />
            <div className={`panel glass ${isOpen ? 'open' : ''}`}>
                <div className="panel-handle" />
                <div className="panel-header">
                    <span className="panel-title">🛡️ {isDriver ? 'Reportar Incidente' : isAdmin ? 'Seguridad & Reportes' : 'Seguridad'}</span>
                    <button className="panel-close" onClick={closePanel}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>

                <div className="panel-body">

                    {/* ── PASAJERO ── */}
                    {isPassenger && (
                        <div>
                            {/* Botón de emergencia */}
                            <button onClick={handleEmergency} style={{ width: '100%', padding: '18px', borderRadius: 14, border: 'none', background: 'var(--danger)', color: 'white', fontFamily: 'var(--font)', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M1 21L12 2l11 19H1zm11-3v2h-2v-2h2zm0-8v4h-2v-4h2z"/></svg>
                                BOTÓN DE EMERGENCIA
                            </button>
                            <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'center', marginBottom: 20 }}>Solo en caso de peligro real</div>

                            {submitted ? (
                                <div style={{ background: 'var(--accent)', borderRadius: 12, padding: 20, textAlign: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>
                                    ✅ Reporte enviado correctamente
                                </div>
                            ) : (
                                <>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 12 }}>
                                        Reportar incidente
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                                        {PASSENGER_INCIDENT_TYPES.map(inc => (
                                            <button key={inc.id} onClick={() => setSelectedIncident(inc)} style={{ padding: '12px 8px', borderRadius: 10, border: `2px solid ${selectedIncident?.id === inc.id ? 'var(--accent)' : 'var(--border2)'}`, background: selectedIncident?.id === inc.id ? 'var(--accent-dim)' : 'var(--surface2)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                                <span style={{ fontSize: 20 }}>{inc.icon}</span>
                                                {inc.label}
                                            </button>
                                        ))}
                                    </div>
                                    {selectedIncident && (
                                        <>
                                            <textarea rows={2} placeholder="Detalles adicionales (opcional)..." value={incidentNote} onChange={e => setIncidentNote(e.target.value)} style={inputStyle} />
                                            <button onClick={handleSubmitReport} className="btn btn-accent btn-block" style={{ marginTop: 10 }}>
                                                Enviar Reporte
                                            </button>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Zonas de riesgo */}
                            {dangerZones.length > 0 && (
                                <div style={{ marginTop: 24 }}>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10 }}>Zonas de riesgo cercanas</p>
                                    {dangerZones.slice(0, 4).map(z => (
                                        <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: getRiskColor(z.risk), flexShrink: 0 }} />
                                            <div style={{ flex: 1, fontSize: 13 }}>{z.name}</div>
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: getRiskColor(z.risk) + '22', color: getRiskColor(z.risk) }}>{z.risk}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── CHOFER ── */}
                    {isDriver && (
                        <div>
                            {submitted ? (
                                <div style={{ background: 'var(--accent)', borderRadius: 12, padding: 20, textAlign: 'center', color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
                                    ✅ Reporte de pasajero enviado
                                </div>
                            ) : (
                                <>
                                    <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
                                        ¿Tuviste algún problema con un pasajero? Reporta el incidente para mantener un registro.
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                                        {DRIVER_REPORT_TYPES.map(inc => (
                                            <button key={inc.id} onClick={() => setSelectedIncident(inc)} style={{ padding: '12px 8px', borderRadius: 10, border: `2px solid ${selectedIncident?.id === inc.id ? 'var(--danger)' : 'var(--border2)'}`, background: selectedIncident?.id === inc.id ? '#ff3b5c22' : 'var(--surface2)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                                <span style={{ fontSize: 20 }}>{inc.icon}</span>
                                                {inc.label}
                                            </button>
                                        ))}
                                    </div>
                                    {selectedIncident && (
                                        <>
                                            <textarea rows={2} placeholder="Describe brevemente lo ocurrido..." value={incidentNote} onChange={e => setIncidentNote(e.target.value)} style={inputStyle} />
                                            <button onClick={handleSubmitReport} style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: 'var(--danger)', color: 'white', fontWeight: 700, fontFamily: 'var(--font)', fontSize: 14, cursor: 'pointer', marginTop: 10 }}>
                                                🚨 Enviar Reporte de Pasajero
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ── ADMIN ── */}
                    {isAdmin && (
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 12 }}>
                                Todos los reportes ({allReports.length})
                            </p>
                            {allReports.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text2)', fontSize: 14 }}>Sin reportes registrados</div>
                            ) : allReports.map(r => (
                                <div key={r.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <div style={{ fontSize: 20, marginTop: 2 }}>{r.typeId === 'emergency' ? '🚨' : '⚠️'}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.label}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>Por: {r.user} · {r.time}</div>
                                    </div>
                                </div>
                            ))}

                            {dangerZones.length > 0 && (
                                <div style={{ marginTop: 20 }}>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10 }}>
                                        Zonas Peligrosas ({dangerZones.length})
                                    </p>
                                    {dangerZones.map(z => (
                                        <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: getRiskColor(z.risk), flexShrink: 0 }} />
                                            <div style={{ flex: 1, fontSize: 13 }}>{z.name}</div>
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: getRiskColor(z.risk) + '22', color: getRiskColor(z.risk) }}>{z.risk}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SecurityPanel;