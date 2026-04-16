require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// 🔥 Socket.io config (IMPORTANTE PARA RENDER)
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Middleware
app.use(cors());
app.use(express.json());

// 🔥 MongoDB Atlas (CORRECTO PARA RENDER)
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ ERROR: MONGODB_URI no está definida en variables de entorno');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB conectado correctamente'))
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });

// Ruta base
app.get('/', (req, res) => {
  res.json({ message: 'MoviRD 2.0 Backend & Real-Time Engine Active 🚀' });
});
app.get('/test', (req, res) => {
  res.send('Test route working');
});
// 🔥 Rutas API (asegúrate que estos archivos existan)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/config', require('./routes/config'));
app.use('/api/routes', require('./routes/routesApi'));

// 🔥 Motor de simulación
const simulationEngine = require('./simulation/engine');

// Usuarios activos
const activeUsers = new Map();

// 🔥 SOCKET.IO (tiempo real)
io.on('connection', (socket) => {
  console.log('🔗 Cliente conectado: ' + socket.id);

  // Enviar estado actual
  socket.emit('vehicle_positions', simulationEngine.getGlobalVehicles());

  activeUsers.set(socket.id, Date.now());

  // Driver updates
  socket.on('driver_update_position', (data) => {
    simulationEngine.updateHumanDriverPosition(
      data.vehicleId,
      data.lat,
      data.lng
    );
  });

  socket.on('disconnect', () => {
    activeUsers.delete(socket.id);
    console.log('❌ Cliente desconectado: ' + socket.id);
  });
});

// 🔥 Iniciar simulación
simulationEngine.startEngine(io);

// 🔥 Puerto (Render usa process.env.PORT)
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

module.exports = { io };