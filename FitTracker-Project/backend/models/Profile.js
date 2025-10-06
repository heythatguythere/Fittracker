const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    first_name: { type: String },
    last_name: { type: String },
    date_of_birth: { type: Date },
    height_cm: { type: Number },
    
    // Fitness Goals
    fitness_goals: { type: String }, // e.g., "Lose 10kg", "Build muscle"
    weight_goal_kg: { type: Number },
    body_fat_goal_percentage: { type: Number },

    // --- NEW: Nutritional Goals ---
    calorie_goal: { type: Number, default: 2000 },
    protein_goal: { type: Number, default: 150 },
    carbs_goal: { type: Number, default: 200 },
    fat_goal: { type: Number, default: 60 },
});

module.exports = mongoose.model('Profile', ProfileSchema);