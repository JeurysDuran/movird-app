const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Metro', 'Teleferico', 'OMSA', 'Concho', 'Motoconcho'],
    required: true
  },
  stops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stop' }],
  geometry: { type: [[Number]], default: [] }, // Array de [lat, lng] desde OSRM
  color: { type: String, default: '#00d4a0' },
  isActive: { type: Boolean, default: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Transport Company Profile
}, { timestamps: true });

module.exports = mongoose.model('Route', RouteSchema);
