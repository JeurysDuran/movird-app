/**
 * Servicio de enrutamiento mejorado con OSRM
 * Incluye caché, timeout y fallback
 */

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
const TIMEOUT = 8000; // 8 segundos máximo

// Caché de rutas calculadas
const geometryCache = {};

/**
 * Obtiene la geometría (puntos intermedios) de una ruta usando OSRM
 * @param {Array} stops - Array de paradas con {name, lat, lng}
 * @param {String} type - Tipo de transporte (Metro, Teleferico, etc)
 * @returns {Array} Array de [lat, lng] representando la ruta
 */
export async function getRouteGeometry(stops, type = 'driving') {
    // Metro y Teleférico van directos (no siguen calles)
    if (type === 'Metro' || type === 'Teleferico') {
        return stops.map(s => [s.lat, s.lng]);
    }

    if (!stops || stops.length < 2) {
        return stops.map(s => [s.lat, s.lng]);
    }

    // Generar clave de caché
    const cacheKey = stops
        .map(s => `${s.lat.toFixed(5)},${s.lng.toFixed(5)}`)
        .join('|');

    // Retornar del caché si existe
    if (geometryCache[cacheKey]) {
        console.log('✓ Ruta desde caché');
        return geometryCache[cacheKey];
    }

    try {
        // Construir URL para OSRM
        const coords = stops
            .map(s => `${s.lng},${s.lat}`)
            .join(';');
        
        const url = `${OSRM_URL}/${coords}?overview=full&geometries=geojson`;

        // Fetch con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Validar respuesta
        if (data.code === 'Ok' && data.routes && data.routes[0] && data.routes[0].geometry) {
            const coordinates = data.routes[0].geometry.coordinates
                .map(c => [c[1], c[0]]); // Convertir [lng, lat] a [lat, lng]
            
            // Guardar en caché
            geometryCache[cacheKey] = coordinates;
            console.log(`✓ Ruta calculada con OSRM (${coordinates.length} puntos)`);
            return coordinates;
        } else {
            throw new Error(`OSRM retornó: ${data.code || 'invalid response'}`);
        }
    } catch (error) {
        console.warn('⚠ Error en OSRM, usando fallback lineal:', error.message);
        
        // Fallback: línea recta entre paradas
        const fallbackGeometry = stops.map(s => [s.lat, s.lng]);
        geometryCache[cacheKey] = fallbackGeometry;
        return fallbackGeometry;
    }
}

/**
 * Calcula la distancia aproximada entre dos puntos en km
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radio de la Tierra en km
    const toRad = Math.PI / 180;
    const dLat = (lat2 - lat1) * toRad;
    const dLng = (lng2 - lng1) * toRad;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Limpia el caché de rutas (útil después de actualizaciones)
 */
export function clearGeometryCache() {
    Object.keys(geometryCache).forEach(key => delete geometryCache[key]);
    console.log('✓ Caché de geometrías limpiado');
}

/**
 * Retorna estadísticas del caché
 */
export function getCacheStats() {
    return {
        cachedRoutes: Object.keys(geometryCache).length,
        cacheSize: JSON.stringify(geometryCache).length
    };
}
