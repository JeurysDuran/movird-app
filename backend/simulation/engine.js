// backend/simulation/engine.js
const mongoose = require('mongoose');
const osrmService = require('../services/osrmService');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const SystemConfig = require('../models/SystemConfig');

const SEED_ROUTES = [
    {
        id: 1, type: 'Metro',
        stops: [
            { name: "Mamá Tingó", lat: 18.547514, lng: -69.897371 },
            { name: "Gregorio Urbano Gilbert", lat: 18.536733, lng: -69.896173 },
            { name: "Los Tainos", lat: 18.507421, lng: -69.912630 },
            { name: "Juan Pablo Duarte (Transbordo)", lat: 18.484218, lng: -69.932029 },
            { name: "Amín Abel", lat: 18.461664, lng: -69.916172 },
            { name: "Centro de los Héroes", lat: 18.450371, lng: -69.923485 }
        ]
    },
    {
        id: 2, type: 'Metro',
        stops: [
            { name: "María Montez", lat: 18.475470, lng: -69.967814 },
            { name: "Pedro Mir", lat: 18.480036, lng: -69.941655 },
            { name: "Juan Pablo Duarte (Transbordo)", lat: 18.484218, lng: -69.932029 },
            { name: "Coronel Rafael Tomás", lat: 18.490050, lng: -69.913725 },
            { name: "Eduardo Brito", lat: 18.508569, lng: -69.880556 },
            { name: "Concepción Bona", lat: 18.513437, lng: -69.851608 }
        ]
    },
    {
        id: 3, type: 'OMSA',
        stops: [
            { name: "Pintura", lat: 18.457813, lng: -69.975452 },
            { name: "Plaza de la Bandera", lat: 18.452655, lng: -69.965313 },
            { name: "Churchill Sur", lat: 18.458994, lng: -69.940798 },
            { name: "Jiménez Moya", lat: 18.462791, lng: -69.930412 },
            { name: "Máximo Gómez (Centro Olímpico)", lat: 18.471850, lng: -69.914447 },
            { name: "Parque Independencia", lat: 18.471926, lng: -69.892040 }
        ]
    },
    {
        id: 4, type: 'Concho',
        stops: [
            { name: "JFK (Multicentro)", lat: 18.478794, lng: -69.939227 },
            { name: "Blue Mall", lat: 18.472147, lng: -69.941190 },
            { name: "Acropolis Center", lat: 18.466453, lng: -69.941655 },
            { name: "Sarasota", lat: 18.457613, lng: -69.940428 },
            { name: "Rómulo Betancourt / 27", lat: 18.450417, lng: -69.940608 }
        ]
    }
];

let globalVehicles = [];
let populatedRoutes = [];
let systemSpeed = 1.0;

const initSimulation = async () => {
    try {
        let routesCount = await Route.countDocuments();

        if (routesCount === 0) {
            console.log("OSRM Engine: Realizando seeding inicial de rutas en Base de Datos...");
            for (const sr of SEED_ROUTES) {
                const stopIds = [];
                for (const s of sr.stops) {
                    const stopDoc = new Stop({ name: s.name, location: { lat: s.lat, lng: s.lng } });
                    await stopDoc.save();
                    stopIds.push(stopDoc._id);
                }
                const geo = await osrmService.getRouteGeometry(sr.stops, sr.type);
                const routeDoc = new Route({
                    name: 'Ruta ' + sr.type + ' ' + sr.id,
                    type: sr.type,
                    stops: stopIds,
                    geometry: geo
                });
                await routeDoc.save();
            }
            console.log("OSRM Engine: Seeding completado con exito.");
        }

        const routesInDb = await Route.find().populate('stops');
        populatedRoutes = routesInDb.map(r => {
            return {
                id: r._id.toString(),
                type: r.type,
                name: r.name,
                stops: r.stops.map(s => ({ name: s.name, lat: s.location.lat, lng: s.location.lng })),
                geometry: r.geometry && r.geometry.length > 0 ? r.geometry : r.stops.map(s => [s.location.lat, s.location.lng])
            };
        });

        // Crear vehículos sobre la geometría
        populatedRoutes.forEach(route => {
            const numVehicles = route.type === 'Metro' ? 2 : 3;
            for (let i = 0; i < numVehicles; i++) {
                const startGeoIdx = Math.floor(Math.random() * (Math.max(1, route.geometry.length - 10)));
                const point = route.geometry[startGeoIdx];
                if (!point) continue;
                
                globalVehicles.push({
                    id: 'V-' + (Math.floor(Math.random() * 9000) + 1000),
                    routeId: route.id,
                    type: route.type,
                    occupancy: ['Vacio', 'Medio', 'Lleno'][Math.floor(Math.random() * 3)],
                    lat: point[0],
                    lng: point[1],
                    passengers: [],
                    _targetGeoIndex: startGeoIdx + 1,
                    _forward: true
                });
            }
        });
        console.log("OSRM Engine Started: Geometrias y Autobuses preparados desde DB.");
    } catch(err) {
        console.error("Error al iniciar el Engine de Simulacion:", err);
    }
};

const tickSimulation = async () => {
    // Check config for dynamic speed multiplier
    try {
        let conf = await SystemConfig.findOne();
        if(conf) {
            systemSpeed = conf.globalSpeed;
        }
    } catch(e) {}

    globalVehicles = globalVehicles.map(v => {
        const route = populatedRoutes.find(r => r.id === v.routeId);
        if(!route || !route.geometry || route.geometry.length < 2) return v;

        const targetPoint = route.geometry[v._targetGeoIndex];
        if(!targetPoint) return v;

        const distLat = targetPoint[0] - v.lat;
        const distLng = targetPoint[1] - v.lng;

        if (Math.abs(distLat) < 0.0003 && Math.abs(distLng) < 0.0003) {
            let nextIdx = v._forward ? v._targetGeoIndex + 1 : v._targetGeoIndex - 1;
            let newForward = v._forward;
            
            if (nextIdx >= route.geometry.length) {
                nextIdx = route.geometry.length - 2;
                newForward = false;
            } else if (nextIdx < 0) {
                nextIdx = 1;
                newForward = true;
            }
            
            return {
                ...v,
                lat: targetPoint[0],
                lng: targetPoint[1],
                _targetGeoIndex: nextIdx,
                _forward: newForward
            };
        }

        let speedMult = v.type === 'Metro' ? 0.35 : (v.type === 'Teleferico' ? 0.25 : 0.8);
        if (route.type === 'Metro' || route.type === 'Teleferico') speedMult = 0.05;

        // Apply Global Config Speed
        speedMult *= systemSpeed;

        return {
            ...v,
            lat: v.lat + distLat * speedMult,
            lng: v.lng + distLng * speedMult
        };
    });
};

exports.startEngine = async (io) => {
    await initSimulation();
    
    // Motor tic-tac cada 2 segundos
    setInterval(async () => {
        await tickSimulation();
        io.emit('vehicle_positions', globalVehicles);
        io.emit('routes_geometry', populatedRoutes);
    }, 2000);
};

exports.getGlobalVehicles = () => globalVehicles;
exports.getPopulatedRoutes = () => populatedRoutes;

exports.updateHumanDriverPosition = (vehicleId, lat, lng) => {
    const v = globalVehicles.find(v => v.id === vehicleId);
    if(v) {
        v.lat = lat;
        v.lng = lng;
    }
};

exports.injectNewRoute = (routeData) => {
    populatedRoutes.push(routeData);

    // Create 1 virtual vehicle for the new route automatically
    if (routeData.geometry && routeData.geometry.length > 2) {
        const startGeoIdx = Math.floor(Math.random() * (Math.max(1, routeData.geometry.length - 10)));
        const point = routeData.geometry[startGeoIdx];
        if (point) {
            globalVehicles.push({
                id: 'V-' + (Math.floor(Math.random() * 9000) + 1000),
                routeId: routeData.id,
                type: routeData.type,
                occupancy: ['Vacio', 'Medio', 'Lleno'][Math.floor(Math.random() * 3)],
                lat: point[0],
                lng: point[1],
                passengers: [],
                _targetGeoIndex: startGeoIdx + 1,
                _forward: true
            });
            console.log(`OSRM Engine: Vehículo auto-pilloteado en nueva ruta: ${routeData.name}`);
        }
    }
};
