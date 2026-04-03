const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/context/AppContext.js');
let text = fs.readFileSync(file, 'utf8');

// Insertar import de socket.io-client
if(!text.includes("io from 'socket.io-client'")) {
    text = text.replace(/import React, \{ createContext, useState, useContext, useEffect, useRef, useCallback \} from 'react';/, 
    "import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';\nimport { io } from 'socket.io-client';");
}

const newSimString = `
    useEffect(() => {
        const socket = io('http://localhost:5000');
        socket.on('connect', () => console.log('✅ Conectado al Engine MoviRD Central'));
        
        socket.on('vehicle_positions', (serverVehicles) => {
            setVehicles(serverVehicles);
        });

        if(currentUser?.role === 'driver' && currentUser.vehicleId && userLocation) {
            socket.emit('driver_update_position', {
                vehicleId: currentUser.vehicleId,
                lat: userLocation.lat,
                lng: userLocation.lng
            });
        }

        return () => {
             socket.disconnect();
        }
    }, [currentUser, userLocation]);
`;

// Regex exacto de reemplazo con indexOf
const startIndexSim = text.indexOf('// ── Motor de Simulación');
const endIndexSim = text.indexOf('// ── Toast', startIndexSim);

if (startIndexSim !== -1 && endIndexSim !== -1) {
    const oldSimBlock = text.substring(startIndexSim, endIndexSim);
    text = text.replace(oldSimBlock, newSimString + '\n\n    ');
}

// Regex exacto de reemplazo de setVehicles initial state
const startVehicles = text.indexOf('const [vehicles, setVehicles] = useState(() => {');
const endVehicles = text.indexOf('const [dangerZones', startVehicles);

if (startVehicles !== -1 && endVehicles !== -1) {
    const oldVehiclesBlock = text.substring(startVehicles, endVehicles);
    text = text.replace(oldVehiclesBlock, 'const [vehicles, setVehicles] = useState([]);\n    ');
}

fs.writeFileSync(file, text);
