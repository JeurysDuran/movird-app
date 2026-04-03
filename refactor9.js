const fs = require('fs');
const path = require('path');

const mapFile = path.join(__dirname, 'src/components/Map/MapComponent.js');
let mapText = fs.readFileSync(mapFile, 'utf8');

// Modificar drawRoutes
const oldCoordsLine = "var coords = route.stops.map(function(s) { return [s.lat, s.lng]; });";
const newCoordsLine = "var coords = route.geometry || route.stops.map(function(s) { return [s.lat, s.lng]; });";

mapText = mapText.replace(oldCoordsLine, newCoordsLine);
fs.writeFileSync(mapFile, mapText);

// Ahora AppContext.js para que reciba las rutas emitidas por el backend
const contextFile = path.join(__dirname, 'src/context/AppContext.js');
let ctxText = fs.readFileSync(contextFile, 'utf8');

const oldSocketCode = "socket.on('vehicle_positions', (serverVehicles) => {\n            setVehicles(serverVehicles);\n        });";
const newSocketCode = "socket.on('vehicle_positions', (serverVehicles) => {\n            setVehicles(serverVehicles);\n        });\n\n        socket.on('routes_geometry', (serverRoutes) => {\n            setRoutes(serverRoutes);\n        });";

if(!ctxText.includes("socket.on('routes_geometry'")) {
    ctxText = ctxText.replace(oldSocketCode, newSocketCode);
    fs.writeFileSync(contextFile, ctxText);
}
console.log("Successfully patched MapComponent and AppContext for OSRM");
