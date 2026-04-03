import React from 'react';
import { useApp } from '../../context/AppContext';

const DriverPanel = () => {
    const { currentUser, vehicles, routes } = useApp();

    if (!currentUser || currentUser.role !== 'driver') return null;

    const myVehicle = vehicles.find(v => v.id === currentUser.vehicleId) || vehicles.find(v => v.driver === currentUser.id);
    const myRoute = myVehicle ? routes.find(r => r.id === myVehicle.routeId) : null;

    if (!myVehicle || !myRoute) return null;

    return (
        <div style={{
            position: 'absolute',
            bottom: '100px',
            left: '20px',
            right: '20px',
            zIndex: 1000,
            background: 'var(--surface)',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Ruta Activa</div>
                <h3 style={{ margin: '0 0 12px', color: 'var(--blue)', fontSize: 18 }}>{myRoute.name}</h3>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {myRoute.stops && myRoute.stops.map((s, i) => (
                        <span key={i} style={{
                            fontSize: 11, background: 'var(--surface2)', borderRadius: 8,
                            padding: '4px 10px', color: 'var(--text2)', border: '1px solid var(--border)'
                        }}>
                            {i + 1}. {s.name}
                        </span>
                    ))}
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text2)' }}>
                    {myRoute.stops?.length || 0} paradas · RD$ {myRoute.price}
                </div>
            </div>
        </div>
    );
};

export default DriverPanel;
