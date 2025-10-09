import z from "zod";

// Updated types to match backend MongoDB schema

// User Schema
export const UserSchema = z.object({
  _id: z.string(),
  email: z.string(),
  password: z.string().nullable(),
  googleId: z.string().nullable(),
  displayName: z.string().nullable(),
  image: z.string().nullable(),
  role: z.enum(['user', 'admin']),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// User Profile Schema
export const UserProfileSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  date_of_birth: z.string().nullable(),
  height_cm: z.number().nullable(),
  fitness_goals: z.string().nullable(),
  weight_goal_kg: z.number().nullable(),
  body_fat_goal_percentage: z.number().nullable(),
  calorie_goal: z.number().nullable(),
  protein_goal: z.number().nullable(),
  carbs_goal: z.number().nullable(),
  fat_goal: z.number().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// Workout Schema
export const WorkoutExerciseSchema = z.object({
  exercise_name: z.string(),
  sets: z.number().nullable(),
  reps: z.number().nullable(),
  weight: z.number().nullable(),
});

export const WorkoutSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
  workout_type: z.enum(['cardio', 'strength', 'yoga', 'group']).nullable(),
  duration_minutes: z.number().nullable(),
  calories_burned: z.number().nullable(),
  workout_date: z.string(),
  exercises: z.array(WorkoutExerciseSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Workout = z.infer<typeof WorkoutSchema>;

// Exercise Schema
export const ExerciseSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  exercise_name: z.string().optional(),
  category: z.string().nullable().optional(),
  muscle_group: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  // Workout exercise specific fields
  sets: z.number().nullable().optional(),
  reps: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  weight_kg: z.number().nullable().optional(),
  workout_id: z.number().optional(),
  exercise_id: z.number().optional(),
  rest_seconds: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  duration_minutes: z.number().nullable().optional(),
  met: z.number().optional(),
  completed: z.array(z.boolean()).optional(),
});

export type Exercise = z.infer<typeof ExerciseSchema>;

// Workout Exercise Schema - Extended version for workout templates
export const WorkoutExerciseExtendedSchema = z.object({
  id: z.number().optional(),
  workout_id: z.number().optional(),
  exercise_id: z.number().optional(),
  sets: z.number().nullable().optional(),
  reps: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  weight_kg: z.number().nullable().optional(),
  rest_seconds: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  name: z.string().optional(),
  exercise_name: z.string().optional(),
  duration_minutes: z.number().nullable().optional(),
  met: z.number().optional(),
  completed: z.array(z.boolean()).optional(),
});

export type WorkoutExerciseExtended = z.infer<typeof WorkoutExerciseExtendedSchema>;

// Measurement Schema
export const MeasurementSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  measurement_date: z.string(),
  weight_kg: z.number().nullable(),
  body_fat_percentage: z.number().nullable(),
  waist_cm: z.number().nullable(),
  chest_cm: z.number().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Measurement = z.infer<typeof MeasurementSchema>;

// Diet Entry Schema - Updated to match MongoDB backend
export const DietEntrySchema = z.object({
  _id: z.string(),
  userId: z.string(),
  entry_date: z.string(),
  meal_type: z.string().nullable(),
  food_name: z.string(),
  quantity: z.number().nullable(),
  unit: z.string().nullable(),
  calories: z.number().nullable(),
  protein_g: z.number().nullable(),
  carbs_g: z.number().nullable(),
  fat_g: z.number().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type DietEntry = z.infer<typeof DietEntrySchema>;

// Force TypeScript refresh

// API Request Schemas
export const CreateUserProfileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  date_of_birth: z.string().optional(),
  height_cm: z.number().optional(),
  activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']).optional(),
  fitness_goals: z.string().optional(),
});

export const CreateWorkoutSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  workout_date: z.string(),
  duration_minutes: z.number().optional(),
  calories_burned: z.number().optional(),
});

export const CreateWorkoutExerciseSchema = z.object({
  exercise_id: z.number(),
  sets: z.number().optional(),
  reps: z.number().optional(),
  weight_kg: z.number().optional(),
  rest_seconds: z.number().optional(),
  notes: z.string().optional(),
});

export const CreateMeasurementSchema = z.object({
  measurement_date: z.string(),
  weight_kg: z.number().optional(),
  body_fat_percentage: z.number().optional(),
  muscle_mass_kg: z.number().optional(),
  waist_cm: z.number().optional(),
  chest_cm: z.number().optional(),
  arm_cm: z.number().optional(),
  thigh_cm: z.number().optional(),
  notes: z.string().optional(),
});

export const CreateDietEntrySchema = z.object({
  entry_date: z.string(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  food_name: z.string(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  calories: z.number().optional(),
  protein_g: z.number().optional(),
  carbs_g: z.number().optional(),
  fat_g: z.number().optional(),
  notes: z.string().optional(),
});

export type CreateUserProfile = z.infer<typeof CreateUserProfileSchema>;
export type CreateWorkout = z.infer<typeof CreateWorkoutSchema>;
export type CreateWorkoutExercise = z.infer<typeof CreateWorkoutExerciseSchema>;
export type CreateMeasurement = z.infer<typeof CreateMeasurementSchema>;
export type CreateDietEntry = z.infer<typeof CreateDietEntrySchema>;

// Meal Suggestion Schema
export const MealSuggestionSchema = z.object({
  meal_name: z.string(),
  description: z.string(),
  calories: z.number(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
});

export type MealSuggestion = z.infer<typeof MealSuggestionSchema>;

// Goal Schema
export const GoalSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  description: z.string(),
  goal_type: z.enum(['weight', 'workout_frequency']),
  start_value: z.number().nullable(),
  target_value: z.number(),
  target_date: z.string().nullable(),
  is_active: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Goal = z.infer<typeof GoalSchema>;

// Workout Template Schema
export const ExerciseTemplateSchema = z.object({
  exercise_name: z.string(),
  sets: z.number().nullable(),
  reps: z.number().nullable(),
  weight: z.number().nullable(),
  duration_minutes: z.number().nullable().optional(),
});

export const WorkoutTemplateSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  exercises: z.array(ExerciseTemplateSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type WorkoutTemplate = z.infer<typeof WorkoutTemplateSchema>;
export type ExerciseTemplate = z.infer<typeof ExerciseTemplateSchema>;