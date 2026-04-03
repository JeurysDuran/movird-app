require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configurar Socket.io
// backend/server.js
// Triggering backend restarter
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Middleware
app.use(cors());
app.use(express.json());

// Conexión MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/movird';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Conectado (MoviRD Atlas)'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// Rutas base
app.get('/', (req, res) => {
  res.json({ message: 'MoviRD 2.0 Backend & Real-Time Engine Active' });
});

// Rutas Autenticación
app.use('/api/auth', require('./routes/auth'));
app.use('/api/config', require('./routes/config'));
app.use('/api/routes', require('./routes/routesApi'));

// Cargar motor de simulación
const simulationEngine = require('./simulation/engine');

const activeUsers = new Map();

// Eventos de Socket.io (Motor de movilidad urbana y alertas en tiempo real)
io.on('connection', (socket) => {
  console.log('🔗 Cliente conectado: ' + socket.id);

  // Enviarle estado actual de vehículos de inmediato
  socket.emit('vehicle_positions', simulationEngine.getGlobalVehicles());

  // Conteo de usuarios viéndolo
  activeUsers.set(socket.id, Date.now());

  // Driver Check-ins (Actualizaciones manuales)
  socket.on('driver_update_position', (data) => {
     // El chofer reportó llegada a siguiente parada!
     simulationEngine.updateHumanDriverPosition(data.vehicleId, data.lat, data.lng);
  });

  socket.on('disconnect', () => {
    activeUsers.delete(socket.id);
    console.log('❌ Cliente desconectado: ' + socket.id);
  });
});

// Arrancar Engine de Simulación Global MoviRD
simulationEngine.startEngine(io);

// Iniciar aplicación
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor en ejecución en puerto ${PORT}`);
});

module.exports = { io };
