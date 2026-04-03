import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import html2pdf from 'html2pdf.js';

export default function ReportsTab() {
    const { reports, transactions, routes } = useApp();
    const printRef = useRef();

    // Simular datos de flujo de pasajeros
    const passengerData = routes.map((r, i) => ({
        name: r.name.substring(0, 10) + '...',
        pasajeros: Math.floor(Math.random() * 500) + 100,
        ingresos: Math.floor(Math.random() * 10000) + 2000
    }));

    // Simular hora por hora (Heatmap/Demand)
    const hourlyData = [
        { hora: '06:00', demanda: 300 },
        { hora: '08:00', demanda: 850 },
        { hora: '10:00', demanda: 400 },
        { hora: '12:00', demanda: 550 },
        { hora: '14:00', demanda: 450 },
        { hora: '17:00', demanda: 950 },
        { hora: '19:00', demanda: 600 },
        { hora: '21:00', demanda: 200 },
    ];

    const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0) + passengerData.reduce((acc, r) => acc + r.ingresos, 0);
    const totalIncidents = reports.length;

    const handleExportPDF = () => {
        const element = printRef.current;
        const opt = {
            margin:       10,
            filename:     'MoviRD_Reporte_Gerencial.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    return (
        <div style={{ paddingBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Dashboard Analítico</h3>
                <button 
                    onClick={handleExportPDF}
                    style={{ background: '#2a7fff', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}
                >
                    📄 Descargar PDF
                </button>
            </div>

            <div ref={printRef} style={{ background: '#fff' }}>
                {/* KPIs */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <div style={{ flex: 1, background: 'var(--surface2)', padding: 15, borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text2)' }}>Ingresos Estimados</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#00d4a0' }}>RD$ {totalRevenue.toLocaleString()}</div>
                    </div>
                    <div style={{ flex: 1, background: 'var(--surface2)', padding: 15, borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text2)' }}>Incidentes (24h)</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#ff3b5c' }}>{totalIncidents}</div>
                    </div>
                </div>

                {/* Grafica 1: Ingresos por Ruta */}
                <div style={{ marginBottom: 30 }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 700 }}>Flujo de Pasajeros por Ruta</p>
                    <div style={{ height: 200, width: '100%', background: 'var(--surface2)', borderRadius: 12, padding: 10 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={passengerData}>
                                <XAxis dataKey="name" fontSize={10} angle={-15} textAnchor="end" />
                                <YAxis fontSize={10} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="pasajeros" fill="#9b6dff" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grafica 2: Demanda Horaria */}
                <div style={{ marginBottom: 20 }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 700 }}>Predicción de Congestión (Demanda x Hora)</p>
                    <div style={{ height: 200, width: '100%', background: 'var(--surface2)', borderRadius: 12, padding: 10 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="hora" fontSize={10} />
                                <YAxis fontSize={10} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="demanda" stroke="#ff9a3c" strokeWidth={3} dot={{r: 4, fill: '#ff9a3c'}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Listados Originales compactos */}
                <div style={{ display: 'flex', gap: 15 }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: 12, fontWeight: 700 }}>Últimos Incidentes</p>
                        {reports.slice(-3).map(r => (
                            <div key={r.id} style={{ background: 'var(--surface2)', borderRadius: 8, padding: 8, marginBottom: 5, fontSize: 11 }}>
                                <strong>{r.label}</strong> - {r.user}
                            </div>
                        ))}
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: 12, fontWeight: 700 }}>Transacciones (MoviRD Card)</p>
                        {transactions.slice(-3).map(t => (
                            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--surface2)', borderRadius: 8, padding: 8, marginBottom: 5, fontSize: 11 }}>
                                <span>{t.user}</span>
                                <strong style={{color: '#00d4a0'}}>+RD${t.amount}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
