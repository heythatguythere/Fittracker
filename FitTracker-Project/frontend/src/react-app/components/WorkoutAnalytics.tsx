import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, parseISO, eachWeekOfInterval, subWeeks } from 'date-fns';
import type { Workout } from '@/shared/types';

interface WorkoutAnalyticsProps {
  workouts: Workout[];
}

export default function WorkoutAnalytics({ workouts }: WorkoutAnalyticsProps) {
  // Weekly workout frequency data
  const workoutArray = Array.isArray(workouts) ? workouts : [];
  
  const weeks = eachWeekOfInterval({
    start: subWeeks(new Date(), 12), // Last 12 weeks
    end: new Date()
  });

  const weeklyData = weeks.map(weekStart => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekWorkouts = workoutArray.filter(workout => {
      const workoutDate = parseISO(workout.workout_date);
      return workoutDate >= weekStart && workoutDate <= weekEnd;
    });

    return {
      week: format(weekStart, 'MMM dd'),
      workouts: weekWorkouts.length,
      totalDuration: weekWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0),
      totalCalories: weekWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0)
    };
  });

  // Monthly statistics
  const totalWorkouts = workoutArray.length;
  const avgDuration = workoutArray.length > 0 
    ? workoutArray.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / workoutArray.length 
    : 0;
  const totalCalories = workoutArray.reduce((sum, w) => sum + (w.calories_burned || 0), 0);

  // Recent 4 weeks for comparison
  const recentWeeks = weeklyData.slice(-4);
  const avgWeeklyWorkouts = recentWeeks.reduce((sum, w) => sum + w.workouts, 0) / 4;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Workouts</p>
              <p className="text-2xl font-bold text-gray-900">{totalWorkouts}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold">#{totalWorkouts}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">{avgDuration.toFixed(0)}m</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold">⏱️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calories</p>
              <p className="text-2xl font-bold text-gray-900">{totalCalories.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 font-bold">🔥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Weekly Avg</p>
              <p className="text-2xl font-bold text-gray-900">{avgWeeklyWorkouts.toFixed(1)}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Workout Frequency Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Workout Frequency</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="week" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} ${name === 'workouts' ? 'workouts' : 'minutes'}`, 
                  name === 'workouts' ? 'Workouts' : 'Duration'
                ]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="workouts" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Duration Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Duration Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="week" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `${value}m`}
              />
              <Tooltip
                formatter={(value: number) => [`${value} minutes`, 'Total Duration']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="totalDuration"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}