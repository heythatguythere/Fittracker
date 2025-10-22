import { useEffect, useState, useRef, FormEvent, ChangeEvent } from "react";
import { useAuth } from "../AuthContext";
import Layout from "../components/Layout";
import { Plus, X, Pencil, Loader2, Dumbbell, Clock, Flame, Zap, Save, Play, Pause, Square, CheckSquare, Timer, ArrowLeft, History, BarChart, Wind, BrainCircuit, ChevronRight, Trash2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import type { Workout, Exercise, UserProfile, WorkoutTemplate } from "../../shared/types";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

// --- HELPER DATA & DEFAULTS ---
const workoutTypeIcons: { [key: string]: React.ElementType } = { cardio: Zap, strength: Dumbbell, yoga: BrainCircuit, hiit: Wind, default: Dumbbell };
const MET_VALUES: { [key:string]: number } = { strength: 5.0, cardio: 7.0, hiit: 8.0, yoga: 2.5, default: 4.0 };
const initialWorkoutState: Partial<Workout> = { name: "", workout_type: "strength", workout_date: new Date().toISOString().split('T')[0], duration_minutes: 0, exercises: [{ exercise_name: "", sets: 3, reps: 10, weight: 0 }]};

// Enhanced workout types with exercise libraries
const WORKOUT_TYPES = [
    { id: 'strength', name: 'Strength Training', icon: Dumbbell, color: 'bg-red-500', description: 'Build muscle and strength' },
    { id: 'cardio', name: 'Cardio', icon: Zap, color: 'bg-blue-500', description: 'Improve cardiovascular fitness' },
    { id: 'hiit', name: 'HIIT', icon: Wind, color: 'bg-orange-500', description: 'High-intensity interval training' },
    { id: 'yoga', name: 'Yoga', icon: BrainCircuit, color: 'bg-purple-500', description: 'Flexibility and mindfulness' }
];

const EXERCISE_LIBRARY = {
    strength: [
        { name: "Bench Press", category: "Chest", sets: 4, reps: 8, weight_kg: 60, met: 6.0 },
        { name: "Squats", category: "Legs", sets: 5, reps: 5, weight_kg: 80, met: 7.0 },
        { name: "Deadlift", category: "Back", sets: 4, reps: 6, weight_kg: 100, met: 8.0 },
        { name: "Pull-ups", category: "Back", sets: 4, reps: 8, weight_kg: 0, met: 7.0 },
        { name: "Overhead Press", category: "Shoulders", sets: 4, reps: 8, weight_kg: 40, met: 6.0 },
        { name: "Barbell Row", category: "Back", sets: 4, reps: 8, weight_kg: 50, met: 6.0 },
        { name: "Bicep Curls", category: "Arms", sets: 3, reps: 12, weight_kg: 12, met: 4.0 },
        { name: "Tricep Dips", category: "Arms", sets: 3, reps: 10, weight_kg: 0, met: 5.0 },
        { name: "Lunges", category: "Legs", sets: 3, reps: 12, weight_kg: 20, met: 5.0 },
        { name: "Push-ups", category: "Chest", sets: 3, reps: 15, weight_kg: 0, met: 4.0 }
    ],
    cardio: [
        { name: "Running", category: "Cardio", duration_minutes: 30, met: 8.0 },
        { name: "Cycling", category: "Cardio", duration_minutes: 45, met: 7.0 },
        { name: "Swimming", category: "Cardio", duration_minutes: 30, met: 9.0 },
        { name: "Rowing", category: "Cardio", duration_minutes: 20, met: 8.0 },
        { name: "Elliptical", category: "Cardio", duration_minutes: 30, met: 6.0 },
        { name: "Stair Climbing", category: "Cardio", duration_minutes: 20, met: 9.0 }
    ],
    hiit: [
        { name: "Burpees", category: "HIIT", sets: 5, reps: 15, duration_minutes: 1, met: 10.0 },
        { name: "Jump Squats", category: "HIIT", sets: 5, reps: 20, duration_minutes: 1, met: 9.0 },
        { name: "Mountain Climbers", category: "HIIT", sets: 5, duration_minutes: 1, met: 8.0 },
        { name: "High Knees", category: "HIIT", sets: 5, duration_minutes: 1, met: 8.0 },
        { name: "Jumping Jacks", category: "HIIT", sets: 5, reps: 30, duration_minutes: 1, met: 7.0 },
        { name: "Plank Jacks", category: "HIIT", sets: 5, duration_minutes: 1, met: 8.0 }
    ],
    yoga: [
        { name: "Sun Salutation", category: "Yoga", sets: 10, reps: 1, duration_minutes: 5, met: 2.5 },
        { name: "Warrior II", category: "Yoga", sets: 3, reps: 1, duration_minutes: 2, met: 2.0 },
        { name: "Downward Dog", category: "Yoga", sets: 5, duration_minutes: 1, met: 2.0 },
        { name: "Tree Pose", category: "Yoga", sets: 3, duration_minutes: 2, met: 2.0 },
        { name: "Child's Pose", category: "Yoga", sets: 3, duration_minutes: 1, met: 1.5 },
        { name: "Corpse Pose", category: "Yoga", sets: 1, duration_minutes: 5, met: 1.0 }
    ]
} as const;

const WORKOUT_LIBRARY: Partial<WorkoutTemplate>[] = [
    { name: "Chest Day", description: "strength", exercises: [{ exercise_name: "Bench Press", sets: 4, reps: 8, weight: 60 }, { exercise_name: "Incline Dumbbell Press", sets: 4, reps: 10, weight: 20 }, { exercise_name: "Cable Fly", sets: 3, reps: 12, weight: 15 }, { exercise_name: "Push-ups", sets: 3, reps: 15, weight: 0 }]},
    { name: "Back & Biceps", description: "strength", exercises: [{ exercise_name: "Pull-ups", sets: 4, reps: 8, weight: 0 }, { exercise_name: "Barbell Row", sets: 4, reps: 8, weight: 50 }, { exercise_name: "Lat Pulldown", sets: 3, reps: 10, weight: 50 }, { exercise_name: "Bicep Curls", sets: 3, reps: 12, weight: 12 }]},
    { name: "Leg Day", description: "strength", exercises: [{ exercise_name: "Squats", sets: 5, reps: 5, weight: 80 }, { exercise_name: "Leg Press", sets: 4, reps: 10, weight: 120 }, { exercise_name: "Romanian Deadlift", sets: 3, reps: 10, weight: 60 }, { exercise_name: "Calf Raises", sets: 5, reps: 15, weight: 40 }]},
    { name: "30-Min Cardio", description: "cardio", exercises: [{ exercise_name: "Treadmill Run", sets: null, reps: null, weight: null, duration_minutes: 30 }]},
    { name: "Full Body HIIT", description: "hiit", exercises: [{ exercise_name: "Burpees", sets: 5, reps: 15, weight: 0 }, { exercise_name: "Jump Squats", sets: 5, reps: 20, weight: 0 }, { exercise_name: "Mountain Climbers", sets: 5, reps: null, weight: 0, duration_minutes: 1 }]},
    { name: "Morning Yoga Flow", description: "yoga", exercises: [{ exercise_name: "Sun Salutation", sets: 10, reps: 1, weight: 0 }, { exercise_name: "Warrior II", sets: 3, reps: 1, weight: 0 }, { exercise_name: "Downward Dog", sets: 5, reps: null, weight: 0, duration_minutes: 1 }]},
];

// --- MAIN PAGE COMPONENT ---
export default function Workouts() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'selection' | 'type' | 'exercises' | 'detail' | 'active' | 'summary'>('selection');
    const [selectedWorkoutType, setSelectedWorkoutType] = useState<string | null>(null);
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
    const [finishedWorkout, setFinishedWorkout] = useState<Workout | null>(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => { if (user) { fetchInitialData(); } return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [user]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [workoutsRes, templatesRes, profileRes] = await Promise.all([
                axios.get("/api/workouts", { withCredentials: true }),
                axios.get("/api/templates", { withCredentials: true }),
                axios.get("/api/profile", { withCredentials: true })
            ]);
            setWorkouts(workoutsRes.data);
            setTemplates(templatesRes.data);
            setProfile(profileRes.data);
        } catch (error) { console.error("Failed to fetch initial data:", error); } 
        finally { setLoading(false); }
    };

    const startTimer = () => { 
        if (!isTimerRunning) { 
            setIsTimerRunning(true); 
            timerRef.current = setInterval(() => setTimeElapsed(p => p + 1), 1000); 
        }
    };
    const pauseTimer = () => { 
        if (timerRef.current) { 
            clearInterval(timerRef.current); 
            setIsTimerRunning(false); 
        }
    };
    const formatTime = (s: number) => `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
    
    // New workout flow handlers
    const handleSelectWorkoutType = (type: string) => {
        setSelectedWorkoutType(type);
        setSelectedExercises([]);
        setView('exercises');
    };
    
    const handleSelectExercise = (exercise: Exercise) => {
        const isSelected = selectedExercises.some(ex => ex.exercise_name === exercise.name);
        if (isSelected) {
            setSelectedExercises(prev => prev.filter(ex => ex.exercise_name !== exercise.name));
        } else {
            const setsCount = 'sets' in exercise ? (exercise.sets || 0) : 0;
            setSelectedExercises(prev => [...prev, { 
                ...exercise, 
                exercise_name: exercise.name, 
                completed: Array(setsCount).fill(false) as boolean[],
                sets: exercise.sets || null,
                reps: exercise.reps || null,
                weight: exercise.weight || exercise.weight_kg || null,
                duration_minutes: exercise.duration_minutes || null
            }]);
        }
    };
    
    const handleCreateWorkout = () => {
        const workoutType = WORKOUT_TYPES.find(t => t.id === selectedWorkoutType);
        const workout: Workout = {
            _id: '',
            userId: user?._id || '',
            name: `${workoutType?.name} Workout`,
            workout_type: selectedWorkoutType as "cardio" | "strength" | "yoga" | "group" | null,
            exercises: selectedExercises.map(ex => ({
                exercise_name: ex.exercise_name || ex.name || '',
                sets: ex.sets || null,
                reps: ex.reps || null,
                weight: ex.weight || null,
                duration_minutes: ex.duration_minutes || null
            })),
            workout_date: new Date().toISOString().split('T')[0],
            duration_minutes: null,
            calories_burned: null
        };
        setSelectedWorkout(workout);
        setView('detail');
    };
    
    const handleSelectWorkout = (workout: Partial<WorkoutTemplate>) => { 
        const workoutData: Workout = {
            _id: workout._id || '',
            userId: user?._id || '',
            name: workout.name || '',
            workout_type: workout.workout_type || null,
            exercises: workout.exercises?.map(ex => ({
                exercise_name: ex.exercise_name || '',
                sets: ex.sets || null,
                reps: ex.reps || null,
                weight: ex.weight || null,
                duration_minutes: ex.duration_minutes || null
            })) || [],
            workout_date: new Date().toISOString().split('T')[0],
            duration_minutes: null,
            calories_burned: null
        };
        setSelectedWorkout(workoutData); 
        setView('detail'); 
    };
    const handleStartSession = () => { 
        setView('active'); 
        startTimer();
    };
    const handleToggleSet = (exIndex: number, setIndex: number) => { 
        if (!selectedWorkout) return;
        const newExercises = [...selectedWorkout.exercises]; 
        if (newExercises[exIndex]) {
            const exercise = newExercises[exIndex];
            const completed = exercise.completed || Array(exercise.sets || 0).fill(false);
            completed[setIndex] = !completed[setIndex];
            newExercises[exIndex] = { ...exercise, completed };
            setSelectedWorkout({ ...selectedWorkout, exercises: newExercises }); 
        }
    };
    
    const calculateCaloriesBurned = (exercises: Exercise[], durationMinutes: number, weightKg: number) => {
        let totalCalories = 0;
        
        const exerciseArray = Array.isArray(exercises) ? exercises : [];
        exerciseArray.forEach(exercise => {
            const metValue = exercise.met || MET_VALUES[selectedWorkoutType || 'default'] || MET_VALUES.default;
            let exerciseDuration = durationMinutes;
            
            // For exercises with specific duration, use that instead of total workout duration
            if (exercise.duration_minutes) {
                exerciseDuration = exercise.duration_minutes;
            } else if (exercise.sets && exercise.reps) {
                // Estimate duration based on sets and reps (assuming 30 seconds per set)
                exerciseDuration = (exercise.sets * 0.5);
            }
            
            const exerciseCalories = metValue * weightKg * (exerciseDuration / 60);
            totalCalories += exerciseCalories;
        });
        
        return Math.round(totalCalories);
    };
    
    const handleFinishWorkout = async () => {
        if (!selectedWorkout) return;
        pauseTimer();
        const durationMinutes = Math.max(1, Math.round(timeElapsed / 60));
        const weightKg = profile?.weight_goal_kg || 70; // Use weight goal or default to 70kg
        const caloriesBurned = calculateCaloriesBurned(selectedWorkout.exercises, durationMinutes, weightKg);
        
        const finalWorkout: Partial<Workout> = { 
            ...selectedWorkout, 
            workout_type: selectedWorkout.workout_type, 
            duration_minutes: durationMinutes, 
            calories_burned: caloriesBurned, 
            workout_date: new Date().toISOString() 
        };
        // Remove completed arrays from exercises before saving
        finalWorkout.exercises = finalWorkout.exercises?.map((exercise) => {
            const { completed: _, ...rest } = exercise;
            return rest;
        });

        try {
            await axios.post("/api/workouts", finalWorkout, { withCredentials: true });
            setFinishedWorkout(finalWorkout as Workout);
            setView('summary');
        } catch (error) { console.error("Failed to save workout:", error); }
    };
    
    const handleCloseSummary = () => {
        setFinishedWorkout(null); 
        setSelectedWorkout(null); 
        setSelectedWorkoutType(null);
        setSelectedExercises([]);
        setTimeElapsed(0);
        setIsTimerRunning(false);
        fetchInitialData();
        setView('selection');
    };
    
    const handleBackToSelection = () => {
        setSelectedWorkoutType(null);
        setSelectedExercises([]);
        setSelectedWorkout(null);
        setTimeElapsed(0);
        setIsTimerRunning(false);
        setView('selection');
    };
    
    const handleUpdateExercise = (exIndex: number, updatedExercise: Partial<Exercise>) => {
        if (!selectedWorkout) return;
        const newExercises = [...selectedWorkout.exercises];
        if (newExercises[exIndex]) {
            newExercises[exIndex] = { 
                ...newExercises[exIndex], 
                ...updatedExercise,
                exercise_name: updatedExercise.exercise_name || newExercises[exIndex].exercise_name,
                sets: updatedExercise.sets ?? newExercises[exIndex].sets,
                reps: updatedExercise.reps ?? newExercises[exIndex].reps,
                weight: updatedExercise.weight ?? newExercises[exIndex].weight,
                duration_minutes: updatedExercise.duration_minutes ?? newExercises[exIndex].duration_minutes
            };
            setSelectedWorkout({...selectedWorkout, exercises: newExercises});
        }
    };

    if (loading) { return <Layout><div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div></Layout>; }
    
    return (
        <Layout>
            <AnimatePresence mode="wait">
                {view === 'selection' && <SelectionView key="selection" workouts={workouts} templates={templates} navigate={navigate} onSelectWorkout={handleSelectWorkout} onSelectWorkoutType={handleSelectWorkoutType} onLogManual={() => setShowLogModal(true)} />}
                {view === 'type' && <WorkoutTypeView key="type" onSelectType={handleSelectWorkoutType} onBack={handleBackToSelection} />}
                {view === 'exercises' && <ExerciseSelectionView key="exercises" workoutType={selectedWorkoutType || ''} selectedExercises={selectedExercises} onSelectExercise={handleSelectExercise} onCreateWorkout={handleCreateWorkout} onBack={() => setView('type')} />}
                {view === 'detail' && selectedWorkout && <DetailView key="detail" workout={selectedWorkout} onStart={handleStartSession} onBack={handleBackToSelection} onUpdateExercise={handleUpdateExercise} />}
                {view === 'active' && selectedWorkout && <ActiveView key="active" workout={selectedWorkout} timeElapsed={timeElapsed} isTimerRunning={isTimerRunning} formatTime={formatTime} onPause={pauseTimer} onPlay={startTimer} onToggleSet={handleToggleSet} onFinish={handleFinishWorkout} onBack={() => setView('detail')} />}
                {view === 'summary' && finishedWorkout && <SummaryView key="summary" workout={finishedWorkout} onClose={handleCloseSummary} dailyGoal={profile?.calorie_goal || 2000} />}
            </AnimatePresence>
            <AnimatePresence>{showLogModal && <ManualLogModal onClose={() => setShowLogModal(false)} onSave={() => { setShowLogModal(false); if(user) fetchInitialData(); }} />}</AnimatePresence>
        </Layout>
    );
}


// --- INTERNAL SUB-COMPONENTS ---

const pageVariants = { initial: { opacity: 0, x: 50 }, in: { opacity: 1, x: 0 }, out: { opacity: 0, x: -50 } };

interface SelectionViewProps {
    workouts: Workout[];
    templates: WorkoutTemplate[];
    navigate: (view: 'type' | 'exercises' | 'detail' | 'active' | 'summary') => void;
    onSelectWorkout: (workout: WorkoutTemplate) => void;
    onSelectWorkoutType: (type: string) => void;
    onLogManual: () => void;
}

function SelectionView({ workouts, templates, navigate, onSelectWorkout, onSelectWorkoutType, onLogManual }: SelectionViewProps) {
    const processWorkoutDataForChart = () => {
        const last7Days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return { date: d.toISOString().split('T')[0], name: d.toLocaleDateString('en-US', { weekday: 'short' }), workouts: 0 }; }).reverse();
        const workoutArray = Array.isArray(workouts) ? workouts : [];
        workoutArray.forEach((w: Workout) => { const d = new Date(w.workout_date).toISOString().split('T')[0]; const day = last7Days.find(day => day.date === d); if (day) day.workouts++; });
        return last7Days;
    };
    return (
        <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="space-y-8">
            <div className="text-center"><h1 className="text-5xl font-bold">Start Session</h1><p className="text-gray-600 mt-2 text-lg">Choose a workout type, use a template, or log a workout you've already completed.</p></div>
            
            {/* New Workout Type Selection */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6">
                <h2 className="text-2xl font-bold mb-4">Create New Workout</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {WORKOUT_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                            <motion.button
                                key={type.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSelectWorkoutType(type.id)}
                                className={`${type.color} text-white p-6 rounded-xl text-left transition-all hover:shadow-lg`}
                            >
                                <Icon className="h-8 w-8 mb-3" />
                                <h3 className="font-bold text-lg">{type.name}</h3>
                                <p className="text-sm opacity-90">{type.description}</p>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.button whileHover={{ scale: 1.02 }} onClick={() => navigate('type')} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-8 text-left"><h2 className="text-2xl font-bold flex items-center">Manage Templates <ChevronRight className="ml-2"/></h2><p className="text-gray-600 mt-2">Create and edit your own reusable workout plans.</p></motion.button>
                <motion.button whileHover={{ scale: 1.02 }} onClick={onLogManual} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-8 text-left"><h2 className="text-2xl font-bold flex items-center">Log a Past Workout <Pencil className="ml-2 text-blue-500"/></h2><p className="text-gray-600 mt-2">Manually enter the details of a workout you've already completed.</p></motion.button>
            </div>
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6"><h2 className="text-2xl font-bold mb-4">Workout Library</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{[...WORKOUT_LIBRARY, ...templates].map((w, i) => { const Icon = workoutTypeIcons[w.description || 'default']; return (<button key={i} onClick={() => onSelectWorkout(w as WorkoutTemplate)} className="p-4 bg-gray-50 hover:bg-blue-50 border rounded-lg text-left transition-colors"><Icon className="h-8 w-8 text-blue-500 mb-2" /><p className="font-bold text-lg">{w.name}</p><p className="text-sm text-gray-500">{w.exercises?.length} exercises</p></button>)})}</div></div>
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6"><h2 className="text-2xl font-bold mb-4 flex items-center"><BarChart className="mr-3"/>Weekly Activity</h2><div style={{width: '100%', height: 300}}><ResponsiveContainer><RechartsBarChart data={processWorkoutDataForChart()}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="workouts" fill="#3B82F6" radius={[4, 4, 0, 0]} /></RechartsBarChart></ResponsiveContainer></div></div>
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6"><h2 className="text-2xl font-bold mb-4 flex items-center"><History className="mr-3"/>Workout History</h2>{workouts.length > 0 ? (<div className="space-y-3">{workouts.map((w: Workout) => (<div key={w._id} className="bg-white/80 p-3 rounded-lg border flex justify-between items-center"><div><p className="font-semibold">{w.name || w.workout_type}</p><p className="text-xs text-gray-500">{new Date(w.workout_date).toLocaleDateString()}</p></div><div className="text-right text-sm"><p className="font-semibold">{w.duration_minutes} min</p><p className="text-gray-500">{w.calories_burned || 'N/A'} kcal</p></div></div>))}</div>) : (<p className="text-gray-500 text-center py-4">No workouts logged yet.</p>)}</div>
        </motion.div>
    );
}

interface WorkoutTypeViewProps {
    onSelectType: (type: string) => void;
    onBack: () => void;
}

function WorkoutTypeView({ onSelectType, onBack }: WorkoutTypeViewProps) {
    return (
        <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="space-y-8">
            <div className="flex items-center space-x-4 mb-6">
                <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 font-semibold">
                    <ArrowLeft/><span>Back</span>
                </button>
                <h1 className="text-3xl font-bold">Choose Workout Type</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {WORKOUT_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                        <motion.button
                            key={type.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectType(type.id)}
                            className={`${type.color} text-white p-8 rounded-2xl text-left transition-all hover:shadow-lg`}
                        >
                            <Icon className="h-12 w-12 mb-4" />
                            <h2 className="text-2xl font-bold mb-2">{type.name}</h2>
                            <p className="text-lg opacity-90">{type.description}</p>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
}

interface ExerciseSelectionViewProps {
    workoutType: string;
    selectedExercises: Exercise[];
    onSelectExercise: (exercise: Exercise) => void;
    onCreateWorkout: () => void;
    onBack: () => void;
}

function ExerciseSelectionView({ workoutType, selectedExercises, onSelectExercise, onCreateWorkout, onBack }: ExerciseSelectionViewProps) {
    const exercises = EXERCISE_LIBRARY[workoutType as keyof typeof EXERCISE_LIBRARY] || [];
    const workoutTypeInfo = WORKOUT_TYPES.find(t => t.id === workoutType);
    
    return (
        <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 font-semibold">
                    <ArrowLeft/><span>Back</span>
                </button>
                <div>
                    <h1 className="text-3xl font-bold">Select Exercises</h1>
                    <p className="text-gray-600">{workoutTypeInfo?.name} - Choose your exercises</p>
                </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Available Exercises ({exercises.length})</h2>
                    <div className="text-sm text-gray-600">
                        Selected: {selectedExercises.length} exercises
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto">
                    {exercises.map((exercise: Exercise, index: number) => {
                        const isSelected = selectedExercises.some((ex: Exercise) => ex.exercise_name === exercise.name);
                        return (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSelectExercise(exercise)}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${
                                    isSelected 
                                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-lg">{exercise.name}</h3>
                                    {isSelected && <CheckSquare className="h-5 w-5 text-blue-500" />}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{exercise.category}</p>
                                <div className="text-xs text-gray-500 space-y-1">
                                    {'sets' in exercise && exercise.sets && <p>Sets: {exercise.sets}</p>}
                                    {'reps' in exercise && exercise.reps && <p>Reps: {exercise.reps}</p>}
                                    {exercise.weight && <p>Weight: {exercise.weight}kg</p>}
                                    {'duration_minutes' in exercise && exercise.duration_minutes && <p>Duration: {exercise.duration_minutes}min</p>}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                    <button 
                        onClick={onBack} 
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Back
                    </button>
                    <button 
                        onClick={onCreateWorkout}
                        disabled={selectedExercises.length === 0}
                        className={`px-8 py-3 rounded-lg font-bold transition-colors ${
                            selectedExercises.length > 0
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        Create Workout ({selectedExercises.length} exercises)
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

interface DetailViewProps {
    workout: Partial<Workout>;
    onStart: () => void;
    onBack: () => void;
    onUpdateExercise: (exIndex: number, updatedExercise: Partial<Exercise>) => void;
}

function DetailView({ workout, onStart, onBack, onUpdateExercise }: DetailViewProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [tempExercise, setTempExercise] = useState<Partial<Exercise>>({});
    
    const handleEditClick = (exercise: Exercise, index: number) => { 
        setEditingIndex(index); 
        setTempExercise({ ...exercise }); 
    };
    
    const handleSaveEdit = (index: number) => { 
        onUpdateExercise(index, tempExercise); 
        setEditingIndex(null); 
    };
    
    const handleCancelEdit = () => {
        setEditingIndex(null);
        setTempExercise({});
    };
    
    const handleInputChange = (field: string, value: string | number) => { 
        setTempExercise(prev => ({ ...prev, [field]: value })); 
    };

    return (
        <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6">
            <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 font-semibold mb-4">
                <ArrowLeft/><span>Back to Workouts</span>
            </button>
            
            <div className="mb-6">
            <h1 className="text-3xl font-bold">{workout.name || 'Untitled Workout'}</h1>
                <p className="text-gray-500">{workout.exercises?.length || 0} Exercises • {workout.workout_type ? workout.workout_type.charAt(0).toUpperCase() + workout.workout_type.slice(1) : 'Unknown'}</p>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {workout.exercises?.map((ex, i: number) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg border">
                    {editingIndex === i ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg">{ex.exercise_name}</h3>
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => handleSaveEdit(i)} 
                                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                        >
                                            <Save size={16} className="inline mr-1"/>
                                            Save
                                        </button>
                                        <button 
                                            onClick={handleCancelEdit} 
                                            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sets</label>
                                        <input 
                                            type="number" 
                                            value={tempExercise.sets || ''} 
                                            onChange={e => handleInputChange('sets', parseInt(e.target.value) || 0)} 
                                            className="w-full border rounded-lg p-2 text-center focus:ring-2 focus:ring-blue-500" 
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reps</label>
                                        <input 
                                            type="number" 
                                            value={tempExercise.reps || ''} 
                                            onChange={e => handleInputChange('reps', parseInt(e.target.value) || 0)} 
                                            className="w-full border rounded-lg p-2 text-center focus:ring-2 focus:ring-blue-500" 
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                        <input 
                                            type="number" 
                                            value={tempExercise.weight || ''} 
                                            onChange={e => handleInputChange('weight', parseFloat(e.target.value) || 0)} 
                                            className="w-full border rounded-lg p-2 text-center focus:ring-2 focus:ring-blue-500" 
                                            min="0"
                                            step="0.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                                        <input 
                                            type="number" 
                                            value={tempExercise.duration_minutes || ''} 
                                            onChange={e => handleInputChange('duration_minutes', parseInt(e.target.value) || 0)} 
                                            className="w-full border rounded-lg p-2 text-center focus:ring-2 focus:ring-blue-500" 
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center">
                                    <Dumbbell className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-lg">{ex.exercise_name}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                                        {ex.sets && <span>{ex.sets} Sets</span>}
                                        {ex.reps && <span>{ex.reps} Reps</span>}
                                        {ex.weight && <span>{ex.weight}kg</span>}
                                        {ex.duration_minutes && <span>{ex.duration_minutes}min</span>}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleEditClick(ex, i)} 
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <Pencil size={18}/>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="mt-8 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Ready to Start?</h3>
                    <p className="text-blue-700 text-sm">Review your exercises above. You can edit them during your workout if needed.</p>
                </div>
                <button 
                    onClick={onStart} 
                    className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                    <Play size={20}/>
                    <span>START WORKOUT</span>
                </button>
            </div>
        </motion.div>
    );
}

interface ActiveViewProps {
    workout: Partial<Workout>;
    timeElapsed: number;
    isTimerRunning: boolean;
    formatTime: (seconds: number) => string;
    onPause: () => void;
    onPlay: () => void;
    onToggleSet: (exIndex: number, setIndex: number) => void;
    onFinish: () => void;
    onBack: () => void;
}

function ActiveView({ workout, timeElapsed, isTimerRunning, formatTime, onPause, onPlay, onToggleSet, onFinish, onBack }: ActiveViewProps) {
    return (
        <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4"><h1 className="text-3xl font-bold">{workout.name || 'Untitled Workout'}</h1><div className="flex items-center space-x-4 p-4 bg-gray-900 text-white rounded-xl shadow-2xl"><Timer size={32} /><div className="text-4xl font-mono">{formatTime(timeElapsed)}</div>{isTimerRunning ? (<button onClick={onPause} className="p-3 bg-yellow-400 text-yellow-900 rounded-full"><Pause size={24} /></button>) : (<button onClick={onPlay} className="p-3 bg-green-400 text-green-900 rounded-full"><Play size={24} /></button>)}</div></div>
            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">{workout.exercises?.map((ex, exIndex: number) => (<motion.div key={exIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: exIndex * 0.1 }} className="bg-white/50 p-4 rounded-lg shadow"><h3 className="font-bold text-xl">{ex.exercise_name}</h3><p className="text-sm text-gray-500">{ex.sets} sets x {ex.reps} reps</p><div className="flex flex-wrap gap-3 mt-4">{(ex.completed || Array(ex.sets || 0).fill(false)).map((isDone: boolean, setIndex: number) => (<motion.button key={setIndex} onClick={() => onToggleSet(exIndex, setIndex)} className={`w-14 h-14 rounded-full flex items-center justify-center font-bold border-2 ${isDone ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`} whileTap={{ scale: 0.9 }}>{isDone ? <CheckSquare size={24} /> : setIndex + 1}</motion.button>))}</div></motion.div>))}</div>
            <div className="mt-8 flex justify-between items-center"><button onClick={onBack} className="text-gray-600 font-semibold">Back</button><button onClick={onFinish} className="bg-green-600 text-white font-bold px-8 py-4 rounded-lg flex items-center space-x-2 shadow-lg hover:scale-105 transition-transform"><Square size={20} /><span>Finish & Save</span></button></div>
        </motion.div>
    );
}

interface SummaryViewProps {
    workout: Workout;
    onClose: () => void;
    dailyGoal: number;
}

function SummaryView({ workout, onClose, dailyGoal }: SummaryViewProps) {
    const totalVolume = workout.exercises?.reduce((sum: number, ex) => {
        const sets = ex.sets || 0;
        const reps = ex.reps || 0;
        const weight = ex.weight || 0;
        return sum + (sets * reps * weight);
    }, 0) || 0;
    const totalSets = workout.exercises?.reduce((sum: number, ex) => sum + (ex.sets || 0), 0) || 0;
    const completedSets = workout.exercises?.reduce((sum: number, ex) => sum + (ex.completed?.filter((c: boolean) => c).length || 0), 0) || 0;
    
    const chartData = [
        { name: 'Calories Burned', value: workout.calories_burned || 0, fill: '#3B82F6' },
        { name: 'Remaining Goal', value: Math.max(0, dailyGoal - (workout.calories_burned || 0)), fill: '#E5E7EB' }
    ];
    
    const exerciseData = workout.exercises?.map((ex) => {
        const sets = ex.sets || 0;
        const reps = ex.reps || 0;
        const weight = ex.weight || 0;
        return {
            name: ex.exercise_name,
            sets: sets,
            reps: reps,
            weight: weight,
            volume: sets * reps * weight
        };
    }) || [];
    
    return (
        <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.4 }} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Workout Complete! 🎉</h1>
                <p className="text-gray-600 text-lg">Great job! Here's a detailed summary of your session.</p>
            </div>
            
            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm opacity-90">Duration</p>
                    <p className="text-2xl font-bold">{workout.duration_minutes} min</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl text-center">
                    <Dumbbell className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm opacity-90">Volume</p>
                    <p className="text-2xl font-bold">{totalVolume.toLocaleString()} kg</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl text-center">
                    <Flame className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm opacity-90">Calories</p>
                    <p className="text-2xl font-bold">{workout.calories_burned || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl text-center">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm opacity-90">Sets</p>
                    <p className="text-2xl font-bold">{completedSets}/{totalSets}</p>
                </div>
            </div>
            
            {/* Exercise Breakdown */}
            <div className="bg-white/80 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <BarChart className="mr-2" />
                    Exercise Breakdown
                </h2>
                <div className="space-y-3">
                    {exerciseData.map((ex, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold">{ex.name}</h3>
                                <p className="text-sm text-gray-600">{ex.sets} sets × {ex.reps} reps @ {ex.weight}kg</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg">{ex.volume.toLocaleString()} kg</p>
                                <p className="text-sm text-gray-600">total volume</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Calorie Progress */}
            <div className="bg-white/80 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Flame className="mr-2" />
                    Calorie Progress
                </h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart innerRadius="60%" outerRadius="90%" data={chartData} startAngle={90} endAngle={-270} barSize={20}>
                            <PolarAngleAxis type="number" domain={[0, dailyGoal]} angleAxisId={0} tick={false} />
                            <RadialBar background dataKey="value" cornerRadius={10} angleAxisId={0} />
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold fill-gray-900">
                                {workout.calories_burned || 0}
                            </text>
                            <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-lg fill-gray-500">
                                kcal burned
                            </text>
                            <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-gray-400">
                                of {dailyGoal} goal
                            </text>
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <button 
                onClick={onClose} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg py-4 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
                Done
            </button>
        </motion.div>
    );
}

// --- THIS IS THE FIX: The full ManualLogModal component is now included and functional ---
interface ManualLogModalProps {
    onClose: () => void;
    onSave: () => void;
}

function ManualLogModal({ onClose, onSave }: ManualLogModalProps) {
    const [manualData, setManualData] = useState<Partial<Workout>>(initialWorkoutState);
    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement;
        const rawValue = target.value;
        const value = target.type === 'number' ? (rawValue === '' ? undefined : Number(rawValue)) : rawValue;
        setManualData(p => ({ ...p, [target.name]: value }));
    };
    const handleExChange = (i: number, f: string, v: string | number) => { 
        const exs = [...(manualData.exercises || [])]; 
        exs[i] = { ...exs[i], [f]: v }; 
        setManualData(p => ({ ...p, exercises: exs })); 
    };
    const addEx = () => setManualData(p => ({ ...p, exercises: [...(p.exercises || []), { exercise_name: "", sets: 3, reps: 10, weight: 0 }] }));
    const removeEx = (i: number) => setManualData(p => ({ ...p, exercises: (p.exercises || []).filter((_, idx) => i !== idx) }));
    const handleSave = async (e: FormEvent) => { 
        e.preventDefault(); 
        try { 
            await axios.post("/api/workouts", manualData, { withCredentials: true }); 
            onSave(); 
        } catch (e) { 
            console.error(e); 
        } 
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3 mb-4"><h2 className="text-2xl font-semibold">Log a Past Workout</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X/></button></div>
                <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <input name="name" type="text" required placeholder="Workout Name (e.g., Evening Run)" onChange={handleFormChange} className="w-full border-gray-300 rounded-lg p-2 shadow-sm" />
                    <input name="workout_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} onChange={handleFormChange} className="w-full border-gray-300 rounded-lg p-2 shadow-sm" />
                    <div className="grid grid-cols-2 gap-4"><input name="duration_minutes" type="number" placeholder="Duration (minutes)" onChange={handleFormChange} className="w-full border-gray-300 rounded-lg p-2 shadow-sm" /><input name="calories_burned" type="number" placeholder="Calories Burned (optional)" onChange={handleFormChange} className="w-full border-gray-300 rounded-lg p-2 shadow-sm" /></div>
                    <h3 className="text-lg font-semibold pt-2">Exercises</h3>
                    {(manualData.exercises || []).map((ex, i) => (
                        <div key={i} className="grid grid-cols-5 gap-2 items-center">
                            <input type="text" placeholder="Exercise Name" value={ex.exercise_name || ''} onChange={e => handleExChange(i, 'exercise_name', e.target.value)} className="col-span-5 border-gray-300 rounded-lg p-2 shadow-sm" />
                            <input type="number" placeholder="Sets" value={ex.sets || ''} onChange={e => handleExChange(i, 'sets', parseInt(e.target.value) || 0)} className="w-full border-gray-300 rounded-lg p-2 shadow-sm" />
                            <input type="number" placeholder="Reps" value={ex.reps || ''} onChange={e => handleExChange(i, 'reps', parseInt(e.target.value) || 0)} className="w-full border-gray-300 rounded-lg p-2 shadow-sm" />
                            <input type="number" placeholder="kg" value={ex.weight || ''} onChange={e => handleExChange(i, 'weight', parseFloat(e.target.value) || 0)} className="w-full border-gray-300 rounded-lg p-2 shadow-sm" />
                            <button type="button" onClick={() => removeEx(i)} className="text-red-500 hover:text-red-700 justify-self-end p-2"><Trash2 size={20}/></button>
                        </div>
                    ))}
                    <button type="button" onClick={addEx} className="text-blue-600 font-semibold flex items-center"><Plus size={20} className="mr-2"/>Add Exercise</button>
                    <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Workout</button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}