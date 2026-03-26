// src/data/mockData.js
// Datos iniciales mínimos — todo lo demás se crea dinámicamente desde la app

export const DEMO_ACCOUNTS = {
    'admin@movird.com': {
        pass: '123456',
        role: 'admin',
        name: 'Carlos Admin',
        phone: '809-111-0001',
        balance: 0,
        trips: 0,
        reports: 0
    },
    'chofer@movird.com': {
        pass: '123456',
        role: 'driver',
        name: 'Pedro Chofer',
        phone: '809-222-0002',
        balance: 0,
        trips: 0,
        reports: 0,
        vehicleId: 'V-0042',
        routeId: 1,
        income: 0,
        passengers: 0
    },
    'usuario@movird.com': {
        pass: '123456',
        role: 'user',
        name: 'Maria Usuario',
        phone: '809-333-0003',
        balance: 250,
        trips: 0,
        reports: 0
    },
};

// Rutas: cada ruta tiene nombre, tipo, paradas y coordenadas de trayecto
export const INITIAL_ROUTES = [{
        id: 1,
        name: 'San Isidro → Parque Independencia',
        type: 'OMSA',
        price: 35,
        stops: [
            { name: 'San Isidro', lat: 18.479, lng: -69.841 },
            { name: 'Las Américas', lat: 18.473, lng: -69.855 },
            { name: 'Venus', lat: 18.470, lng: -69.873 },
            { name: 'Parque Independencia', lat: 18.474, lng: -69.899 }
        ]
    },
    {
        id: 2,
        name: 'Megacentro → UASD',
        type: 'Concho',
        price: 25,
        stops: [
            { name: 'Megacentro', lat: 18.466, lng: -69.923 },
            { name: 'Plaza Central', lat: 18.468, lng: -69.907 },
            { name: 'Máx Gómez', lat: 18.472, lng: -69.895 },
            { name: 'UASD', lat: 18.479, lng: -69.880 }
        ]
    },
    {
        id: 3,
        name: 'Metro L1: Mamá Tingó → Héroes',
        type: 'Metro',
        price: 20,
        stops: [
            { name: 'Mamá Tingó', lat: 18.528, lng: -69.883 },
            { name: 'Juan Bosch', lat: 18.510, lng: -69.883 },
            { name: 'Caamaño', lat: 18.493, lng: -69.883 },
            { name: 'Centro Héroes', lat: 18.476, lng: -69.883 }
        ]
    },
    {
        id: 4,
        name: 'Teleférico: Gualey → Sabana Perdida',
        type: 'Teleferico',
        price: 15,
        stops: [
            { name: 'Gualey', lat: 18.480, lng: -69.907 },
            { name: 'Charles de Gaulle', lat: 18.497, lng: -69.897 },
            { name: 'Sabana Perdida', lat: 18.512, lng: -69.887 }
        ]
    },
    {
        id: 5,
        name: 'Núñez de Cáceres → Churchill',
        type: 'Concho',
        price: 30,
        stops: [
            { name: 'Núñez de Cáceres', lat: 18.480, lng: -69.923 },
            { name: 'Lope de Vega', lat: 18.476, lng: -69.935 },
            { name: 'Churchill', lat: 18.473, lng: -69.946 }
        ]
    }
];

// Vehículos: ligados a una ruta por routeId, con chofer asignado
export const INITIAL_VEHICLES = [{
        id: 'V-0042',
        routeId: 1,
        type: 'OMSA',
        occupancy: 'Medio',
        lastUpdated: Date.now(),
        driverEmail: 'chofer@movird.com',
        driver: 'Pedro Chofer',
        lat: 18.474,
        lng: -69.860,
        passengers: [], // emails de pasajeros a bordo
        active: true
    },
    {
        id: 'V-0015',
        routeId: 1,
        type: 'OMSA',
        occupancy: 'Lleno',
        lastUpdated: Date.now() - 300000,
        driverEmail: null,
        driver: 'Luis García',
        lat: 18.471,
        lng: -69.848,
        passengers: [],
        active: true
    },
    {
        id: 'V-0078',
        routeId: 2,
        type: 'Concho',
        occupancy: 'Vacio',
        lastUpdated: Date.now() - 60000,
        driverEmail: null,
        driver: 'Rosa Marte',
        lat: 18.467,
        lng: -69.915,
        passengers: [],
        active: true
    },
    {
        id: 'V-0033',
        routeId: 3,
        type: 'Metro',
        occupancy: 'Medio',
        lastUpdated: Date.now() - 180000,
        driverEmail: null,
        driver: 'OMSA Metro',
        lat: 18.510,
        lng: -69.883,
        passengers: [],
        active: true
    },
    {
        id: 'V-0061',
        routeId: 5,
        type: 'Concho',
        occupancy: 'Lleno',
        lastUpdated: Date.now() - 60000,
        driverEmail: null,
        driver: 'Juan Bautista',
        lat: 18.476,
        lng: -69.940,
        passengers: [],
        active: true
    }
];

// Zonas de peligro — pueden añadirse dinámicamente desde la app
export const INITIAL_DANGER_ZONES = [
    { id: 1, name: 'Capotillo', risk: 'Alto', incidents: 3, lat: 18.487, lng: -69.895, reportedBy: 'admin@movird.com', createdAt: Date.now() },
    { id: 2, name: 'Gualey', risk: 'Medio', incidents: 1, lat: 18.480, lng: -69.907, reportedBy: 'admin@movird.com', createdAt: Date.now() },
    { id: 3, name: 'Sabana Perdida', risk: 'Bajo', incidents: 0, lat: 18.513, lng: -69.886, reportedBy: 'admin@movird.com', createdAt: Date.now() },
    { id: 4, name: 'La Zurza', risk: 'Medio', incidents: 2, lat: 18.490, lng: -69.916, reportedBy: 'admin@movird.com', createdAt: Date.now() }
];

// Tipos de reporte de incidentes en ruta
export const REPORT_TYPES = [
    { id: 'traffic', label: 'Tapón', icon: '🚗' },
    { id: 'accident', label: 'Accidente', icon: '💥' },
    { id: 'strike', label: 'Huelga', icon: '✊' },
    { id: 'closed', label: 'Ruta cerrada', icon: '🚧' },
    { id: 'police', label: 'Policía', icon: '👮' },
    { id: 'price', label: 'Precio alto', icon: '💰' },
    { id: 'nopass', label: 'No paró', icon: '🚌' },
    { id: 'theft', label: 'Robo', icon: '⚠️' },
    { id: 'empty', label: 'Poca gente', icon: '👥' }
];

// Tipos de transporte disponibles para crear rutas/vehículos
export const TRANSPORT_TYPES = ['OMSA', 'Concho', 'Metro', 'Teleferico', 'Motoconcho'];

// Niveles de ocupación
export const OCCUPANCY_LEVELS = [
    { value: 'Vacio', label: 'Vacío', color: '#00d4a0', pct: 10 },
    { value: 'Medio', label: 'Medio', color: '#ff9a3c', pct: 55 },
    { value: 'Lleno', label: 'Lleno', color: '#ff3b5c', pct: 95 }
];

// Niveles de riesgo para zonas de peligro
export const RISK_LEVELS = [
    { value: 'Bajo', label: 'Bajo', color: '#00d4a0' },
    { value: 'Medio', label: 'Medio', color: '#ff9a3c' },
    { value: 'Alto', label: 'Alto', color: '#ff3b5c' }
];

// Genera un ID único de vehículo
export const generateVehicleId = () => {
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `V-${num}`;
};

// Genera un ID único de ruta
export const generateRouteId = (routes) => {
    const max = routes.reduce((m, r) => Math.max(m, r.id), 0);
    return max + 1;
};