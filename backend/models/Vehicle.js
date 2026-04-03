const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  plateRecord: { type: String, required: true, unique: true }, // Placa o código único (ej: MTR-01)
  type: { 
    type: String, 
    enum: ['Metro', 'Teleferico', 'OMSA', 'Concho', 'Motoconcho'],
    required: true
  },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Si es control humano
  
  // Real-time parameters
  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  currentStopIndex: { type: Number, default: 0 },
  occupancyLevel: { 
    type: String, 
    enum: ['Vacio', 'Medio', 'Lleno', 'Aglomerado'], 
    default: 'Vacio' 
  },
  passengersOnBoard: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Pasajeros actuales
  isSimulated: { type: Boolean, default: true }, // Si es movido por IA / loop interpolador
  isActive: { type: Boolean, default: true },
  maintenanceStatus: { type: String, enum: ['Ok', 'Mantenimiento'], default: 'Ok' }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
