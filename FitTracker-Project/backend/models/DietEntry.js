// backend/models/DietEntry.js
const mongoose = require('mongoose');

const dietEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entry_date: { type: Date, required: true },
  food_name: { type: String, required: true },
  meal_type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
  calories: Number,
  protein_g: Number,
  carbs_g: Number,
  fat_g: Number,
  notes: String,
});

module.exports = mongoose.model('DietEntry', dietEntrySchema);