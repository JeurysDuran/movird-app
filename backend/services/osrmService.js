// backend/services/osrmService.js

/**
 * Obtiene la geometría (ruta real de calles) de OSRM dadas las paradas.
 * OSRM la formatea como lng,lat;lng,lat...
 */
exports.getRouteGeometry = async (stops, type) => {
    // Si es Metro o Teleferico, generamos polilínea directa (vuelan o van por túnel)
    if (type === 'Metro' || type === 'Teleferico') {
        return stops.map(s => [s.lat, s.lng]); 
    }

    try {
        // Formato para OSRM: lon,lat;lon,lat;...
        const coordinatesStr = stops.map(s => `${s.lng},${s.lat}`).join(';');
        
        // Pedirle la ruta a OSRM
        const url = `http://router.project-osrm.org/route/v1/driving/${coordinatesStr}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            // OSRM devuelve las coordenadas en [lng, lat], nosotros usamos [lat, lng] por defecto para Leaflet
            const geojsonCoords = data.routes[0].geometry.coordinates;
            const fullPolylines = geojsonCoords.map(coord => [coord[1], coord[0]]); // Invertir a lat, lng
            return fullPolylines;
        }

        console.log('Falló OSRM, devolviendo rectas para fallback');
        return stops.map(s => [s.lat, s.lng]); 
    } catch (err) {
        console.error('Error contactando OSRM API:', err);
        return stops.map(s => [s.lat, s.lng]); 
    }
};
