const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  facilities: [String], // Ej: 'Wi-Fi', 'Accesibilidad', 'Boletería'
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Stop', StopSchema);
