// backend/models/Measurement.js
const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  measurement_date: { type: Date, required: true },
  weight_kg: Number,
  body_fat_percentage: Number,
  waist_cm: Number,
  chest_cm: Number,
  notes: String,
});

module.exports = mongoose.model('Measurement', measurementSchema);