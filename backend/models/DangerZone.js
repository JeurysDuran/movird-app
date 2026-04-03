const mongoose = require('mongoose');

const DangerZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  riskLevel: { type: String, enum: ['Bajo', 'Medio', 'Alto', 'Critico'], default: 'Medio' },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date, default: () => Date.now() + 2*60*60*1000 }, // Expira en 2 horas por defecto
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-expiración index (TTL en Mongo)
DangerZoneSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('DangerZone', DangerZoneSchema);
