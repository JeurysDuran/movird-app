import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';

const CobroPanel = () => {
    const { activePanel, closePanel, currentUser, driverCode, routes, vehicles, showToast, users } = useApp();
    const canvasRef = useRef(null);
    const [qrReady, setQrReady] = useState(false);
    const isOpen = activePanel === 'cobro-panel';

    // Obtener ruta y precio del vehículo del chofer
    const myVehicle = vehicles.find(v => v.id === currentUser?.vehicleId) || vehicles.find(v => v.driverEmail === currentUser?.email);
    const myRoute = myVehicle ? routes.find(r => r.id === myVehicle.routeId) : null;
    const price = myRoute?.price || 35;

    useEffect(() => {
        if (isOpen && canvasRef.current && currentUser && driverCode) {
            const qrData = JSON.stringify({
                v: 'MOVIRD-PAY',
                driverCode: driverCode,
                driverEmail: currentUser.email,
                driverName: currentUser.name,
                price: price,
                ts: Date.now()
            });
            QRCode.toCanvas(canvasRef.current, qrData, {
                width: 220,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' }
            }, (err) => {
                if (err) {
                    console.error('QR error:', err);
                    setQrReady(false);
                } else {
                    setQrReady(true);
                }
            });
        }
    }, [isOpen, currentUser, driverCode, price]);

    const income = users[currentUser?.email]?.income || 0;
    const passengersCount = users[currentUser?.email]?.passengers || 0;

    return (
        <>
            <div className={`panel-overlay ${isOpen ? 'open' : ''}`} onClick={closePanel} />
            <div className={`panel glass ${isOpen ? 'open' : ''}`}>
                <div className="panel-handle" />
                <div className="panel-header">
                    <span className="panel-title">💰 Panel de Cobro</span>
                    <button className="panel-close" onClick={closePanel}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>

                <div className="panel-body" style={{ padding: '20px' }}>
                    {/* Stats de hoy */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <div style={{ flex: 1, background: 'var(--surface2)', borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>RD$ {income.toLocaleString()}</div>
                            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>Ingresos acumulados</div>
                        </div>
                        <div style={{ flex: 1, background: 'var(--surface2)', borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue)' }}>{passengersCount}</div>
                            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>Pasajeros cobrados</div>
                        </div>
                    </div>

                    {/* Código del chofer */}
                    <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'center', border: '1.5px solid var(--border2)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                            Tu Código de Chofer
                        </div>
                        <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: 6, color: 'var(--accent)', fontFamily: 'var(--font-display)', background: 'var(--surface3)', padding: '12px 20px', borderRadius: 10 }}>
                            {driverCode || '---'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 8 }}>
                            El pasajero puede ingresar este código para pagarte
                        </div>
                    </div>

                    {/* QR real */}
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                            O escanea este QR para pagar · RD$ {price}
                        </div>
                        <div style={{ display: 'inline-block', background: 'white', padding: 14, borderRadius: 16, border: '3px solid var(--accent)', boxShadow: '0 4px 20px rgba(0,212,160,0.2)' }}>
                            <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 8 }} />
                            {!qrReady && (
                                <div style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 13 }}>
                                    Generando QR...
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 10 }}>
                            Muéstrale este QR al pasajero para que escanee y pague
                        </div>
                    </div>

                    {myRoute && (
                        <div style={{ background: 'var(--blue-dim)', border: '1px solid var(--blue)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>
                                Ruta: {myRoute.name} · RD$ {price}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CobroPanel;
