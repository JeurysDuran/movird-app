import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';

// Mini bar chart component using SVG (no external libs needed)
const BarChart = ({ data, color = 'var(--accent)', label }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    const barW = 100 / data.length;
    return (
        <div>
            {label && <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 64, marginBottom: 6 }}>
                {data.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                            <div style={{
                                width: '100%', backgroundColor: color,
                                height: `${(d.value / max) * 56 + 4}px`,
                                borderRadius: '4px 4px 0 0',
                                opacity: d.value === 0 ? 0.2 : 0.9,
                                transition: 'height 0.3s ease',
                                minHeight: 4
                            }} />
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
                {data.map((d, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--text2)', overflow: 'hidden' }}>
                        {d.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProfilePanel = () => {
    const { activeSidePanel, closeSidePanel, currentUser, logout, openPanel, transactions, users, driverCode } = useApp();
    const isOpen = activeSidePanel === 'profile-panel';

    // Chart data: last 7 days activity — must be before any early return
    const isDriver = currentUser?.role === 'driver';
    const chartData = useMemo(() => {
        const days = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dayKey = d.toLocaleDateString('es-DO', { weekday: 'short' });
            const dateStr = d.toDateString();
            const count = transactions.filter(t => {
                if (!t.id) return false;
                const td = new Date(t.id);
                return td.toDateString() === dateStr &&
                    (isDriver ? t.driverEmail === currentUser?.email : t.userEmail === currentUser?.email);
            }).length;
            days.push({ label: dayKey, value: count });
        }
        return days;
    }, [transactions, currentUser, isDriver]);

    if (!currentUser) return null;

    const initials = currentUser.name.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2);
    const roleColors = { admin: '#ff9a3c', company_admin: '#ff9a3c', driver: '#2a7fff', user: '#00d4a0', Passenger: '#00d4a0' };
    const roleLabels = { admin: 'Admin Global', company_admin: 'Admin Compañía', driver: 'Chofer', user: 'Pasajero', Passenger: 'Pasajero' };
    const roleColor = roleColors[currentUser.role] || '#888';

    const isPassenger = currentUser.role === 'user' || currentUser.role === 'Passenger';
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'company_admin';

    // Last transactions
    const myTxns = transactions.filter(t =>
        isDriver ? t.driverEmail === currentUser.email : t.userEmail === currentUser.email
    ).slice(0, 5);

    const liveUser = users[currentUser.email] || currentUser;

    return (
        <div className={`side-panel glass ${isOpen ? 'open' : ''}`} id="profile-panel">
            {/* Header */}
            <div style={{ padding: '58px 20px 18px', borderBottom: '1px solid var(--border)', background: `linear-gradient(180deg, ${roleColor}15 0%, transparent 100%)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 18,
                        background: `linear-gradient(135deg, var(--blue), ${roleColor})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, flexShrink: 0, color: 'white',
                        boxShadow: `0 4px 16px ${roleColor}40`
                    }}>{initials}</div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>{currentUser.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>{currentUser.email}</div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: 5, padding: '2px 10px', borderRadius: 100, background: roleColor + '22', color: roleColor, fontSize: 11, fontWeight: 700 }}>
                            {roleLabels[currentUser.role] || currentUser.role}
                        </div>
                    </div>
                </div>
            </div>

            <div className="side-panel-body">
                <div style={{ padding: '14px 20px' }}>

                    {/* Stats grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: isDriver ? '1fr 1fr 1fr' : '1fr 1fr', gap: 10, marginBottom: 16 }}>
                        {isPassenger && (
                            <>
                                <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px 10px', textAlign: 'center', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>RD$ {((liveUser.balance) || 0).toLocaleString()}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 3 }}>Saldo</div>
                                </div>
                                <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px 10px', textAlign: 'center', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--blue)', fontFamily: 'var(--font-display)' }}>{liveUser.trips || 0}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 3 }}>Viajes</div>
                                </div>
                            </>
                        )}
                        {isDriver && (
                            <>
                                <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 8px', textAlign: 'center', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>RD$ {(liveUser.income || 0).toLocaleString()}</div>
                                    <div style={{ fontSize: 9, color: 'var(--text2)', marginTop: 3 }}>Ingresos</div>
                                </div>
                                <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 8px', textAlign: 'center', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--blue)', fontFamily: 'var(--font-display)' }}>{liveUser.passengers || 0}</div>
                                    <div style={{ fontSize: 9, color: 'var(--text2)', marginTop: 3 }}>Pasajeros</div>
                                </div>
                                <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 8px', textAlign: 'center', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--purple)', fontFamily: 'var(--font-display)' }}>{liveUser.trips || 0}</div>
                                    <div style={{ fontSize: 9, color: 'var(--text2)', marginTop: 3 }}>Viajes</div>
                                </div>
                            </>
                        )}
                        {isAdmin && (
                            <>
                                <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px 10px', textAlign: 'center', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: '#ff9a3c', fontFamily: 'var(--font-display)' }}>{Object.values(users).filter(u => u.role === 'driver').length}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 3 }}>Choferes</div>
                                </div>
                                <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px 10px', textAlign: 'center', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--blue)', fontFamily: 'var(--font-display)' }}>{transactions.length}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 3 }}>Transacciones</div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Gráfica de actividad */}
                    {(isPassenger || isDriver) && (
                        <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: 16, marginBottom: 16, border: '1px solid var(--border)' }}>
                            <BarChart
                                data={chartData}
                                color={isDriver ? 'var(--blue)' : 'var(--accent)'}
                                label={isDriver ? 'Pasajeros cobrados esta semana' : 'Pagos esta semana'}
                            />
                        </div>
                    )}

                    {/* Código del chofer visible en perfil */}
                    {isDriver && driverCode && (
                        <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, textAlign: 'center', border: '1.5px solid var(--blue)' }}>
                            <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1 }}>Tu código de cobro</div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--blue)', letterSpacing: 4, fontFamily: 'var(--font-display)', marginTop: 4 }}>{driverCode}</div>
                        </div>
                    )}

                    {/* Últimas transacciones */}
                    {myTxns.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 10 }}>
                                Últimas transacciones
                            </div>
                            {myTxns.map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 16 }}>{isDriver ? '💰' : '💸'}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600 }}>{isDriver ? `De: ${t.user}` : `A: ${t.driver}`}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text2)' }}>{t.time}</div>
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: 12, color: isDriver ? 'var(--accent)' : 'var(--danger)' }}>
                                        {isDriver ? '+' : '-'}RD$ {t.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Buttons */}
                    {isPassenger && (
                        <button className="btn btn-outline btn-block mb-12" onClick={() => { closeSidePanel(); openPanel('payment-panel'); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, marginRight: 8 }}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                            Pagos y Recarga de Saldo
                        </button>
                    )}

                    {isDriver && (
                        <button className="btn btn-outline btn-block mb-12" onClick={() => { closeSidePanel(); openPanel('cobro-panel'); }} style={{ color: 'var(--blue)', borderColor: 'var(--blue)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, marginRight: 8 }}><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/></svg>
                            Panel de Cobro (QR + Código)
                        </button>
                    )}

                    {isAdmin && (
                        <button className="btn btn-outline btn-block mb-12" onClick={() => { closeSidePanel(); openPanel('admin'); }} style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, marginRight: 8 }}><path d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2z"/></svg>
                            Gestión de Flota (Admin Panel)
                        </button>
                    )}

                    <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />

                    <button className="btn btn-danger btn-block" onClick={() => { logout(); closeSidePanel(); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, marginRight: 8 }}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePanel;