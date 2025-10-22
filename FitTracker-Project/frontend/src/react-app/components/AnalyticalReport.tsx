import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Flame, 
  Dumbbell, 
  Weight, 
  Calendar,
  Award,
  Activity,
  Zap,
  Share2
} from 'lucide-react';
import SocialShare from './SocialShare';
import type { UserProfile, Workout, Measurement, DietEntry, Goal } from '../../shared/types';

interface AnalyticalReportProps {
  profile: UserProfile | null;
  workouts: Workout[];
  measurements: Measurement[];
  dietEntries: DietEntry[];
  goals: Goal[];
}

const AnalyticalReport: React.FC<AnalyticalReportProps> = ({
  profile,
  workouts,
  measurements,
  dietEntries,
  goals
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  // Data processing functions
  const processWorkoutData = () => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const workoutArray = Array.isArray(workouts) ? workouts : [];
    const workoutData = workoutArray
      .filter(w => new Date(w.workout_date) >= last30Days)
      .map(w => ({
        date: new Date(w.workout_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories: w.calories_burned || 0,
        duration: w.duration_minutes || 0,
        exercises: w.exercises?.length || 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return workoutData;
  };

  const processWeightData = () => {
    const measurementArray = Array.isArray(measurements) ? measurements : [];
    return measurementArray
      .filter(m => m.weight_kg !== null)
      .map(m => {
        // Calculate BMI if we have height data (assuming average height for now)
        // In a real app, you'd get height from user profile
        const heightM = 1.75; // Default height in meters
        const bmi = m.weight_kg ? (m.weight_kg / (heightM * heightM)) : 0;
        
        return {
          date: new Date(m.measurement_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weight: m.weight_kg,
          bmi: bmi
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const processCalorieData = () => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const dietArray = Array.isArray(dietEntries) ? dietEntries : [];
    const calorieData = dietArray
      .filter(d => new Date(d.entry_date) >= last7Days)
      .reduce((acc, entry) => {
        const date = new Date(entry.entry_date).toLocaleDateString('en-US', { weekday: 'short' });
        const existing = acc.find(item => item.day === date);
        if (existing) {
          existing.calories += entry.calories || 0;
        } else {
          acc.push({ day: date, calories: entry.calories || 0 });
        }
        return acc;
      }, [] as { day: string; calories: number }[]);

    return calorieData;
  };

  const processExerciseDistribution = () => {
    const exerciseCounts: { [key: string]: number } = {};
    
    const workoutArray = Array.isArray(workouts) ? workouts : [];
    workoutArray.forEach(workout => {
      const exerciseArray = Array.isArray(workout.exercises) ? workout.exercises : [];
      exerciseArray.forEach(exercise => {
        const name = exercise.exercise_name ||'Unknown';
        exerciseCounts[name] = (exerciseCounts[name] || 0) + 1;
      });
    });

    return Object.entries(exerciseCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  const calculateInsights = () => {
    const workoutArray = Array.isArray(workouts) ? workouts : [];
    const measurementArray = Array.isArray(measurements) ? measurements : [];
    
    const totalWorkouts = workoutArray.length;
    const totalCaloriesBurned = workoutArray.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
    const avgWorkoutDuration = workoutArray.length > 0 
      ? workoutArray.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / workoutArray.length 
      : 0;
    
    const weightChange = measurementArray.length >= 2 
      ? (measurementArray[0].weight_kg || 0) - (measurementArray[measurementArray.length - 1].weight_kg || 0)
      : 0;

    const weeklyWorkoutFrequency = workoutArray.filter(w => {
      const workoutDate = new Date(w.workout_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return workoutDate >= weekAgo;
    }).length;

    return {
      totalWorkouts,
      totalCaloriesBurned,
      avgWorkoutDuration: Math.round(avgWorkoutDuration),
      weightChange: Math.round(weightChange * 10) / 10,
      weeklyWorkoutFrequency,
      consistency: weeklyWorkoutFrequency >= 3 ? 'Excellent' : weeklyWorkoutFrequency >= 2 ? 'Good' : 'Needs Improvement'
    };
  };

  const workoutData = processWorkoutData();
  const weightData = processWeightData();
  const calorieData = processCalorieData();
  const exerciseData = processExerciseDistribution();
  const insights = calculateInsights();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  const StatCard = ({ icon, title, value, subtitle, trend, color }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : 
             trend === 'down' ? <TrendingDown className="h-4 w-4 mr-1" /> : 
             <Activity className="h-4 w-4 mr-1" />}
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1"></div>
          <div className="flex-1 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytical Fitness Report</h2>
            <p className="text-gray-600">Comprehensive insights into your fitness journey</p>
          </div>
          <div className="flex-1 flex justify-end">
            <motion.button
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="h-4 w-4" />
              <span>Share Progress</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          icon={<Dumbbell className="h-6 w-6 text-blue-600" />}
          title="Total Workouts"
          value={insights.totalWorkouts}
          subtitle="All time"
          trend="up"
          color="bg-blue-100"
        />
        <StatCard
          icon={<Flame className="h-6 w-6 text-orange-600" />}
          title="Calories Burned"
          value={insights.totalCaloriesBurned.toLocaleString()}
          subtitle="Total"
          trend="up"
          color="bg-orange-100"
        />
        <StatCard
          icon={<Weight className="h-6 w-6 text-purple-600" />}
          title="Weight Change"
          value={`${insights.weightChange > 0 ? '+' : ''}${insights.weightChange} kg`}
          subtitle="Since first measurement"
          trend={insights.weightChange > 0 ? 'up' : insights.weightChange < 0 ? 'down' : 'neutral'}
          color="bg-purple-100"
        />
        <StatCard
          icon={<Target className="h-6 w-6 text-green-600" />}
          title="Consistency"
          value={insights.consistency}
          subtitle={`${insights.weeklyWorkoutFrequency} workouts this week`}
          trend="up"
          color="bg-green-100"
        />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Workout Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Workout Activity (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workoutData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calories" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weight Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Weight className="h-5 w-5 mr-2 text-purple-600" />
            Weight Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#8B5CF6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Exercise Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Dumbbell className="h-5 w-5 mr-2 text-green-600" />
            Exercise Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={exerciseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { name, percent } = props;
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {exerciseData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly Calorie Intake */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Flame className="h-5 w-5 mr-2 text-orange-600" />
            Weekly Calorie Intake
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={calorieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calories" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Goals Progress */}
      {Array.isArray(goals) && goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-600" />
            Goal Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const measurementArray = Array.isArray(measurements) ? measurements : [];
              const progress = goal.goal_type === 'weight' && measurementArray.length > 0
                ? Math.min(100, Math.max(0, ((measurementArray[measurementArray.length - 1].weight_kg || 0) - goal.start_value!) / (goal.target_value - goal.start_value!) * 100))
                : goal.goal_type === 'workout_frequency'
                ? Math.min(100, (insights.weeklyWorkoutFrequency / goal.target_value) * 100)
                : 0;

              return (
                <div key={goal._id} className="text-center">
                 <h4 className="font-semibold text-gray-800 mb-2">{goal.description}</h4>
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: progress }]}>
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar dataKey="value" cornerRadius={10} fill="#3B82F6" />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {goal.goal_type === 'weight' 
                      ? `${goal.start_value}kg → ${goal.target_value}kg`
                      : `${goal.target_value} workouts/week`
                    }
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Insights & Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-blue-600" />
          AI Insights & Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Strengths</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {insights.weeklyWorkoutFrequency >= 3 && (
                <li>• Excellent workout consistency</li>
              )}
              {insights.totalCaloriesBurned > 1000 && (
                <li>• High calorie burn achievement</li>
              )}
              {insights.avgWorkoutDuration >= 30 && (
                <li>• Good workout duration</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Areas for Improvement</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {insights.weeklyWorkoutFrequency < 3 && (
                <li>• Increase workout frequency to 3+ times per week</li>
              )}
              {insights.avgWorkoutDuration < 30 && (
                <li>• Aim for longer workout sessions (30+ minutes)</li>
              )}
              {(!Array.isArray(measurements) || measurements.length < 2) && (
                <li>• Track measurements more regularly</li>
              )}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Social Share Modal */}
      <SocialShare
        profile={profile}
        workouts={workouts}
        measurements={measurements}
        dietEntries={dietEntries}
        goals={goals}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
};

export default AnalyticalReport;