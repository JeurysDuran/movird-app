const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Passenger', 'Driver', 'Admin', 'Company'], 
    default: 'Passenger' 
  },
  walletBalance: { type: Number, default: 0 }, // MoviRD Card Balance
  favoriteRoutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
  tripHistory: [{
      routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
      vehicleId: { type: String },
      boardedAt: { type: Date, default: Date.now },
      alightedAt: { type: Date }
  }],
  // Sólo para choferes
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
