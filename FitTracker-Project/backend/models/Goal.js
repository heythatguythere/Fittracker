const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true }, // e.g., "Reach my target weight"
  goal_type: { type: String, enum: ['weight', 'workout_frequency'], required: true },
  start_value: { type: Number }, // For weight goals, the starting weight
  target_value: { type: Number, required: true }, // Target weight or workouts per week
  target_date: { type: Date },
  is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Goal', goalSchema);