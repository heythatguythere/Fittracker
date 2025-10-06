const mongoose = require('mongoose');

// You can reuse the exerciseSchema from your Workout model
const exerciseSchema = new mongoose.Schema({
  exercise_name: { type: String, required: true },
  sets: Number,
  reps: Number,
  weight: Number,
});

const workoutTemplateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // e.g., "Upper Body Day"
  exercises: [exerciseSchema]
});

module.exports = mongoose.model('WorkoutTemplate', workoutTemplateSchema);