// src/data/mockData.js

// ── Sindicatos / Compañías reales de RD ───────────────────────────────────────
export const SINDICATOS = [
    { id: 'omsa', name: 'OMSA', fullName: 'Oficina Metropolitana de Servicios de Autobuses', type: 'Autobús', color: '#2a7fff', logo: 'bus' },
    { id: 'fenatrado', name: 'FENATRADO', fullName: 'Federación Nacional de Transporte Dominicano', type: 'Concho / Público', color: '#ff9a3c', logo: 'taxi' },
    { id: 'sitrafusa', name: 'SITRAFUSA', fullName: 'Sindicato de Transportistas Fusionados', type: 'Concho / Público', color: '#9b6dff', logo: 'taxi' },
    { id: 'conatra', name: 'CONATRA', fullName: 'Confederación Nacional de Transportistas Dominicanos', type: 'Mixto', color: '#00d4a0', logo: 'bus' },
    { id: 'cooptrapu', name: 'COOPTRAPU', fullName: 'Cooperativa de Transporte Público', type: 'Concho / Público', color: '#ff3b5c', logo: 'car' },
    { id: 'metro_sd', name: 'Metro de SD', fullName: 'Metro de Santo Domingo (OPRET)', type: 'Metro', color: '#00b4d8', logo: 'train' },
    { id: 'teleferico_sd', name: 'Teleférico SD', fullName: 'Teleférico de Santo Domingo', type: 'Teleférico', color: '#43aa8b', logo: 'cable' },
    { id: 'fedotrazona', name: 'FEDOTRAZONA', fullName: 'Federación Dominicana de Transportistas de Zonas', type: 'Concho / Público', color: '#f77f00', logo: 'taxi' },
    { id: 'asonahores_trans', name: 'Trans Turístico', fullName: 'Transporte Turístico ASONAHORES', type: 'Turístico', color: '#e9c46a', logo: 'tourist' },
    { id: 'sintracom', name: 'SINTRACOM', fullName: 'Sindicato de Transporte Comunitario', type: 'Comunitario', color: '#6d6875', logo: 'bus' },
];

// ── Tipos de transporte ────────────────────────────────────────────────────────
export const TRANSPORT_TYPES = ['OMSA', 'Concho', 'Metro', 'Teleferico', 'Motoconcho'];

// ── Tipos de reporte ───────────────────────────────────────────────────────────
export const REPORT_TYPES = [
    { id: 'traffic', label: 'Tapón', icon: 'car' },
    { id: 'accident', label: 'Accidente', icon: 'warning' },
    { id: 'strike', label: 'Huelga', icon: 'construction' },
    { id: 'closed', label: 'Ruta cerrada', icon: 'construction' },
    { id: 'police', label: 'Policía', icon: 'police' },
    { id: 'price', label: 'Precio alto', icon: 'money' },
    { id: 'nopass', label: 'No paró', icon: 'bus' },
    { id: 'theft', label: 'Robo', icon: 'warning' },
    { id: 'empty', label: 'Poca gente', icon: 'people' },
];

// ── Niveles ────────────────────────────────────────────────────────────────────
export const OCCUPANCY_LEVELS = [
    { value: 'Vacio', label: 'Vacío', color: '#00d4a0', pct: 10 },
    { value: 'Medio', label: 'Medio', color: '#ff9a3c', pct: 55 },
    { value: 'Lleno', label: 'Lleno', color: '#ff3b5c', pct: 95 },
];

export const RISK_LEVELS = [
    { value: 'Bajo', label: 'Bajo', color: '#00d4a0' },
    { value: 'Medio', label: 'Medio', color: '#ff9a3c' },
    { value: 'Alto', label: 'Alto', color: '#ff3b5c' },
];

// ── Generadores de ID ──────────────────────────────────────────────────────────
export const generateVehicleId = () => 'V-' + (Math.floor(Math.random() * 9000) + 1000);
export const generateRouteId = (routes) => routes && routes.length ? Math.max(...routes.map(r => r.id)) + 1 : 1;

// ── Estado inicial vacío ───────────────────────────────────────────────────────
export const INITIAL_STATE = {
    users: {},
    routes: [],
    vehicles: [],
    dangerZones: [],
    reports: [],
    transactions: [],
};


// ── Rutas de prueba para llenar el sistema ─────────────────────────────────────
export const SEED_ROUTES = [];