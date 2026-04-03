const Route = require('../models/Route');
const Stop = require('../models/Stop');
const osrmService = require('../services/osrmService');
const simulationEngine = require('../simulation/engine');

exports.createRoute = async (req, res) => {
    try {
        const { name, type, price, stops } = req.body;
        
        if (!name || !stops || stops.length < 2) {
            return res.status(400).json({ message: 'Datos incompletos o insuficientes paradas' });
        }

        // 1. Guardar paradas en local
        const stopIds = [];
        for (const s of stops) {
            const stopDoc = new Stop({ name: s.name, location: { lat: s.lat, lng: s.lng } });
            await stopDoc.save();
            stopIds.push(stopDoc._id);
        }

        // 2. Consultar geometría a OSRM
        const geo = await osrmService.getRouteGeometry(stops, type);

        // 3. Crear el documento
        const routeDoc = new Route({
            name,
            type: type || 'Concho',
            stops: stopIds,
            geometry: geo
        });
        await routeDoc.save();

        // 4. Transformar para inyectar en el Engine
        const newPopulatedRoute = {
            id: routeDoc._id.toString(),
            type: routeDoc.type,
            name: routeDoc.name,
            stops: stops.map(s => ({ name: s.name, lat: s.lat, lng: s.lng })),
            geometry: routeDoc.geometry && routeDoc.geometry.length > 0 ? routeDoc.geometry : stops.map(s => [s.lat, s.lng])
        };

        // 5. Inyectar al motor en vivo
        simulationEngine.injectNewRoute(newPopulatedRoute);

        res.status(201).json(newPopulatedRoute);
    } catch (err) {
        console.error('Error en /api/routes:', err);
        res.status(500).json({ message: 'Error en el servidor al crear la ruta', error: err.message });
    }
};
