import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function ConfigTab() {
    const { showToast } = useApp();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/config');
            if(res.ok) {
                const data = await res.json();
                setConfig(data);
            }
        } catch(err) {
            console.error('Error fetching config', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleSave = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    globalSpeed: config.globalSpeed,
                    basePrices: config.basePrices,
                    availableVehicles: config.availableVehicles
                })
            });
            if(res.ok) {
                showToast('Configuración global actualizada en el Motor', 'accent');
            } else {
                showToast('Error al guardar configuración', 'danger');
            }
        } catch(err) {
            showToast('Error al conectar con backend', 'danger');
        }
    };

    const handlePriceChange = (type, value) => {
        setConfig(prev => ({
            ...prev,
            basePrices: {
                ...prev.basePrices,
                [type]: Number(value)
            }
        }));
    };

    if(loading) return <div style={{padding: 20, textAlign: 'center', color: 'var(--text2)'}}>Cargando configuraciones...</div>;
    if(!config) return <div style={{padding: 20, textAlign: 'center', color: 'var(--danger)'}}>No se pudo cargar la configuración de la BD.</div>;

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
    
    return (
        <div style={{ paddingBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Configuración / Motor OSRM</h3>
                <button onClick={handleSave} className="btn btn-accent">💾 Guardar Cambios</button>
            </div>

            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                <h4 style={{ marginTop: 0, marginBottom: 15, fontSize: 14 }}>Velocidad Global del Motor (Multiplicador)</h4>
                <div>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Valor actual: {config.globalSpeed}x</label>
                    <input 
                        type="range" 
                        min="0.1" max="5.0" step="0.1" 
                        style={{width: '100%', marginTop: 8}}
                        value={config.globalSpeed}
                        onChange={e => setConfig({...config, globalSpeed: Number(e.target.value)})}
                    />
                </div>

                <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }}></div>

                <h4 style={{ marginTop: 0, marginBottom: 15, fontSize: 14 }}>Precios Base por Defecto (RD$)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                    {Object.keys(config.basePrices).map(type => (
                        <div key={type}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>{type}</label>
                            <input 
                                type="number" 
                                style={inputStyle}
                                value={config.basePrices[type]} 
                                onChange={e => handlePriceChange(type, e.target.value)} 
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
