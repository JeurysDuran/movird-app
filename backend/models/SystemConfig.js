const mongoose = require('mongoose');

const SystemConfigSchema = new mongoose.Schema({
  globalSpeed: { type: Number, default: 1.0 },
  basePrices: {
    Metro: { type: Number, default: 35 },
    Teleferico: { type: Number, default: 35 },
    OMSA: { type: Number, default: 15 },
    Concho: { type: Number, default: 35 },
    Motoconcho: { type: Number, default: 50 },
    'Carros Ligeros': { type: Number, default: 100 }
  },
  availableVehicles: { 
    type: [String], 
    default: ['Metro', 'Teleferico', 'OMSA', 'Concho', 'Motoconcho', 'Carros Ligeros'] 
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', SystemConfigSchema);
