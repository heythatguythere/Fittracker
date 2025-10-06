const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  exercise_name: { type: String, required: true },
  sets: Number,
  reps: Number,
  weight: Number,
});

const workoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  workout_type: { type: String, enum: ['cardio', 'strength', 'yoga', 'group'] },
  duration_minutes: Number,
  calories_burned: Number,
  workout_date: { type: Date, default: Date.now },
  exercises: [exerciseSchema]
});

module.exports = mongoose.model('Workout', workoutSchema);
