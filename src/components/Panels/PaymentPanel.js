// src/components/Panels/PaymentPanel.js
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

const RECHARGE_METHODS = [
    { id: 'transfer', label: 'Transferencia Bancaria', icon: '🏦', info: 'Transfiere a: BanReservas · Cta: 1234-5678-90\nConcept: Tu email de MoviRD' },
    { id: 'paypal', label: 'PayPal', icon: '🅿️', info: 'Envía a: pagos@movird.app\nIncluye tu email como referencia' },
    { id: 'googlepay', label: 'Google Pay', icon: '🔵', info: 'Número de teléfono: +1 809 000 0000\nIncluye tu email como referencia' },
    { id: 'applepay', label: 'Apple Pay', icon: '🍎', info: 'Disponible próximamente desde la app iOS de MoviRD' },
    { id: 'card', label: 'Tarjeta de Crédito/Débito', icon: '💳', info: 'Próximamente disponible directamente en la app' },
];

const PaymentPanel = () => {
    const { activePanel, closePanel, currentUser, payDriver, transactions, routes, vehicles } = useApp();
    const [tab, setTab] = useState('pay'); // 'pay' | 'recharge' | 'history'
    const [driverCodeInput, setDriverCodeInput] = useState('');
    const [amountInput, setAmountInput] = useState('');
    const [rechargeMethod, setRechargeMethod] = useState(null);
    const [showQRScan, setShowQRScan] = useState(false);
    const [scanStatus, setScanStatus] = useState('idle'); // 'idle' | 'scanning' | 'success' | 'error'
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);
    const isOpen = activePanel === 'payment-panel';

    // Obtener precio sugerido de la ruta/vehículo actual
    const suggestedPrice = (() => {
        for (const v of vehicles) {
            if (v.passengers?.includes(currentUser?.email)) {
                const r = routes.find(r => r.id === v.routeId);
                if (r) return r.price;
            }
        }
        return null;
    })();

    useEffect(() => {
        if (!isOpen) stopQRScan();
    }, [isOpen]);

    const handlePayByCode = () => {
        const code = driverCodeInput.trim().toUpperCase();
        const amount = parseFloat(amountInput) || suggestedPrice;
        if (!code) {
            // no-op, button is disabled
            return;
        }
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('Por favor ingresa el monto a pagar.');
            return;
        }
        const result = payDriver(code, amount);
        if (result) {
            setDriverCodeInput('');
            setAmountInput('');
        }
    };

    const handleQRPayment = (qrData) => {
        try {
            const data = JSON.parse(qrData);
            if (data.v === 'MOVIRD-PAY' && data.driverCode) {
                const amount = data.price || 35;
                const result = payDriver(data.driverCode, amount);
                if (result) {
                    setScanStatus('success');
                    setTimeout(() => stopQRScan(), 1200);
                }
            } else {
                setScanStatus('error');
            }
        } catch {
            setScanStatus('error');
        }
    };

    const startQRScan = () => {
        setShowQRScan(true);
        setScanStatus('scanning');
        if (!navigator.mediaDevices?.getUserMedia) {
            setScanStatus('error');
            return;
        }
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
                intervalRef.current = setInterval(() => {
                    if (!videoRef.current || videoRef.current.readyState < 2) return;
                    const canvas = document.createElement('canvas');
                    canvas.width = videoRef.current.videoWidth;
                    canvas.height = videoRef.current.videoHeight;
                    if (!canvas.width) return;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(videoRef.current, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    if (window.jsQR) {
                        const code = window.jsQR(imageData.data, imageData.width, imageData.height);
                        if (code?.data) { handleQRPayment(code.data); }
                    }
                }, 500);
            })
            .catch(() => setScanStatus('error'));
    };

    const stopQRScan = () => {
        clearInterval(intervalRef.current);
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setShowQRScan(false);
        setScanStatus('idle');
    };

    const userTransactions = transactions.filter(t => t.userEmail === currentUser?.email).slice(0, 10);

    const tabStyle = (t) => ({
        padding: '8px 16px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer',
        background: tab === t ? 'var(--surface2)' : 'transparent',
        color: tab === t ? 'var(--accent)' : 'var(--text2)',
        fontFamily: 'var(--font)', fontWeight: 600, fontSize: 12,
        borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
        whiteSpace: 'nowrap'
    });

    return (
        <>
            <div className={`panel-overlay ${isOpen ? 'open' : ''}`} onClick={closePanel} />
            <div className={`panel glass ${isOpen ? 'open' : ''}`}>
                <div className="panel-handle" />
                <div className="panel-header">
                    <span className="panel-title">💳 Pagos</span>
                    <button className="panel-close" onClick={closePanel}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>

                {/* Saldo */}
                <div style={{ padding: '16px 20px 0', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                        RD$ {((currentUser?.balance) || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>Saldo disponible</div>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button style={tabStyle('pay')} onClick={() => setTab('pay')}>Pagar</button>
                        <button style={tabStyle('recharge')} onClick={() => setTab('recharge')}>Recargar</button>
                        <button style={tabStyle('history')} onClick={() => setTab('history')}>Historial</button>
                    </div>
                </div>

                <div className="panel-body">

                    {/* ── TAB PAGAR ── */}
                    {tab === 'pay' && (
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 12 }}>
                                Pagar con código del chofer
                            </p>
                            <div style={{ marginBottom: 10 }}>
                                <input
                                    placeholder="Código del chofer (ej: PEDRO.JOSE)"
                                    value={driverCodeInput}
                                    onChange={e => setDriverCodeInput(e.target.value.toUpperCase())}
                                    style={{ width: '100%', padding: '11px 12px', borderRadius: 8, border: '1.5px solid var(--border2)', background: 'var(--surface3)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 8, letterSpacing: 2, fontWeight: 700 }}
                                />
                                <input
                                    type="number"
                                    placeholder={suggestedPrice ? `Monto sugerido: RD$ ${suggestedPrice}` : 'Monto a pagar (RD$)'}
                                    value={amountInput}
                                    onChange={e => setAmountInput(e.target.value)}
                                    style={{ width: '100%', padding: '11px 12px', borderRadius: 8, border: '1.5px solid var(--border2)', background: 'var(--surface3)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                                />
                                {suggestedPrice && (
                                    <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                                        {[suggestedPrice, 25, 35, 50].filter((v, i, a) => a.indexOf(v) === i).map(a => (
                                            <button key={a} onClick={() => setAmountInput(String(a))} style={{ flex: 1, minWidth: 60, padding: '8px 4px', border: '1px solid var(--border2)', borderRadius: 8, background: parseFloat(amountInput) === a ? 'var(--accent)' : 'var(--surface2)', color: parseFloat(amountInput) === a ? 'white' : 'var(--text2)', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                                RD$ {a}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <button onClick={handlePayByCode} className="btn btn-accent btn-block" disabled={!driverCodeInput.trim()}>
                                    Pagar al Chofer
                                </button>
                            </div>

                            <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                                <span style={{ fontSize: 11, color: 'var(--text2)' }}>O ESCANEA EL QR</span>
                                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                            </div>

                            <button onClick={startQRScan} style={{ width: '100%', padding: '16px', borderRadius: 12, border: '2px dashed var(--border2)', background: 'var(--surface2)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                                    <rect x="3" y="3" width="5" height="5" /><rect x="16" y="3" width="5" height="5" /><rect x="3" y="16" width="5" height="5" />
                                    <path d="M21 16h-3v3M21 21v.01M16 16v.01M21 10V6" />
                                </svg>
                                Escanear QR del Chofer
                            </button>
                        </div>
                    )}

                    {/* ── TAB RECARGAR ── */}
                    {tab === 'recharge' && (
                        <div>
                            {!rechargeMethod ? (
                                <>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 12 }}>
                                        Selecciona el método de recarga
                                    </p>
                                    {RECHARGE_METHODS.map(m => (
                                        <button key={m.id} onClick={() => setRechargeMethod(m)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 10, textAlign: 'left' }}>
                                            <span style={{ fontSize: 24 }}>{m.icon}</span>
                                            <span style={{ flex: 1 }}>{m.label}</span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M9 18l6-6-6-6"/></svg>
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <div>
                                    <button onClick={() => setRechargeMethod(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, marginBottom: 16 }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M15 18l-6-6 6-6"/></svg>
                                        Volver
                                    </button>
                                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                        <div style={{ fontSize: 40 }}>{rechargeMethod.icon}</div>
                                        <div style={{ fontWeight: 700, fontSize: 17, margin: '8px 0 4px' }}>{rechargeMethod.label}</div>
                                    </div>
                                    <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: 18, border: '1px solid var(--border)', lineHeight: 1.8, fontSize: 14, color: 'var(--text)', whiteSpace: 'pre-line' }}>
                                        {rechargeMethod.info}
                                    </div>
                                    <div style={{ marginTop: 16, background: 'var(--accent)', borderRadius: 10, padding: '12px 16px', color: 'white', fontSize: 13, textAlign: 'center' }}>
                                        Una vez realizada la transferencia, tu saldo se actualizará en un plazo de 30 minutos.
                                    </div>
                                    <p style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'center', marginTop: 12 }}>
                                        Referencia: <strong style={{ color: 'var(--text)' }}>{currentUser?.email}</strong>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB HISTORIAL ── */}
                    {tab === 'history' && (
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 12 }}>
                                Últimas transacciones
                            </p>
                            {userTransactions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text2)' }}>
                                    <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                                    <div style={{ fontSize: 14 }}>Sin transacciones aún</div>
                                </div>
                            ) : userTransactions.map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--danger-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>💸</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{t.type}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{t.driver} · {t.time}</div>
                                    </div>
                                    <div style={{ fontWeight: 800, color: 'var(--danger)', fontSize: 14 }}>-RD$ {t.amount}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* QR Scan Modal */}
            {showQRScan && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass" style={{ width: '90%', maxWidth: 340, borderRadius: 22, padding: 24, textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Escanear QR del Chofer</div>
                        {scanStatus === 'success' ? (
                            <div style={{ padding: 30, color: 'var(--accent)', fontSize: 18, fontWeight: 700 }}>✅ ¡Pago realizado!</div>
                        ) : scanStatus === 'error' ? (
                            <div style={{ padding: 30, color: 'var(--danger)', fontSize: 14 }}>QR inválido. Intenta con el código manual.</div>
                        ) : (
                            <div style={{ position: 'relative', width: '100%', maxWidth: 260, margin: '0 auto', borderRadius: 16, overflow: 'hidden', background: '#000', aspectRatio: '1' }}>
                                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                                        <path d="M10,10 L10,25 M10,10 L25,10" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"/>
                                        <path d="M90,10 L75,10 M90,10 L90,25" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"/>
                                        <path d="M10,90 L10,75 M10,90 L25,90" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"/>
                                        <path d="M90,90 L75,90 M90,90 L90,75" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"/>
                                    </svg>
                                </div>
                            </div>
                        )}
                        <div style={{ fontSize: 12, color: 'var(--text2)', margin: '12px 0' }}>Apunta al código QR del chofer</div>
                        <button onClick={stopQRScan} style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600 }}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default PaymentPanel;