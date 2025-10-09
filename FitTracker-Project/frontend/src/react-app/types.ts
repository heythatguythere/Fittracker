// Temporary types file to fix import issues
export interface User {
  _id: string;
  email: string;
  password?: string;
  googleId?: string;
  displayName?: string;
  image?: string;
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  _id: string;
  userId: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  height_cm?: number;
  fitness_goals?: string;
  weight_goal_kg?: number;
  body_fat_goal_percentage?: number;
  calorie_goal?: number;
  protein_goal?: number;
  carbs_goal?: number;
  fat_goal?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Workout {
  _id: string;
  userId: string;
  name: string;
  workout_type?: 'cardio' | 'strength' | 'yoga' | 'group' | null;
  duration_minutes?: number | null;
  calories_burned?: number | null;
  workout_date: string;
  exercises: WorkoutExercise[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutExercise {
  exercise_name: string;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
  duration_minutes?: number | null;
  completed?: boolean[];
}

export interface WorkoutTemplate {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: ExerciseTemplate[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ExerciseTemplate {
  exercise_name: string;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
  duration_minutes?: number | null;
}

export interface Exercise {
  id?: number;
  name?: string;
  exercise_name?: string;
  category?: string;
  muscle_group?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
  weight_kg?: number | null;
  workout_id?: number;
  exercise_id?: number;
  rest_seconds?: number | null;
  notes?: string | null;
  duration_minutes?: number | null;
  met?: number;
  completed?: boolean[];
}

export interface Measurement {
  _id: string;
  userId: string;
  measurement_date: string;
  weight_kg?: number | null;
  body_fat_percentage?: number | null;
  waist_cm?: number | null;
  chest_cm?: number | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DietEntry {
  _id: string;
  userId: string;
  entry_date: string;
  meal_type?: string | null;
  food_name: string;
  quantity?: number | null;
  unit?: string | null;
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  _id: string;
  userId: string;
  description: string;
  goal_type: 'weight' | 'workout_frequency';
  start_value?: number | null;
  target_value: number;
  target_date?: string | null;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
