import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface MacroData {
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionChartProps {
  data: MacroData;
  totalCalories: number;
  type?: 'pie' | 'bar';
}

const COLORS = {
  protein: '#EF4444', // Red
  carbs: '#F59E0B',   // Amber  
  fat: '#8B5CF6'      // Purple
};

const MACRO_CALORIES = {
  protein: 4, // calories per gram
  carbs: 4,   // calories per gram  
  fat: 9      // calories per gram
};

export default function NutritionChart({ data, totalCalories, type = 'pie' }: NutritionChartProps) {
  const proteinCals = data.protein * MACRO_CALORIES.protein;
  const carbsCals = data.carbs * MACRO_CALORIES.carbs;
  const fatCals = data.fat * MACRO_CALORIES.fat;
  
  const chartData = [
    { 
      name: 'Protein', 
      value: data.protein,
      calories: proteinCals,
      percentage: totalCalories > 0 ? Math.round((proteinCals / totalCalories) * 100) : 0
    },
    { 
      name: 'Carbs', 
      value: data.carbs,
      calories: carbsCals,
      percentage: totalCalories > 0 ? Math.round((carbsCals / totalCalories) * 100) : 0
    },
    { 
      name: 'Fat', 
      value: data.fat,
      calories: fatCals,
      percentage: totalCalories > 0 ? Math.round((fatCals / totalCalories) * 100) : 0
    }
  ];

  if (data.protein === 0 && data.carbs === 0 && data.fat === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Macronutrient Breakdown</h3>
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>No nutrition data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Macronutrient Breakdown</h3>
      
      {type === 'pie' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="calories"
                  label={({ percentage }) => `${percentage}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} cal`, 
                    name
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            {chartData.map((macro) => (
              <div key={macro.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[macro.name.toLowerCase() as keyof typeof COLORS] }}
                  />
                  <span className="font-medium text-gray-900">{macro.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{macro.value.toFixed(1)}g</p>
                  <p className="text-sm text-gray-600">{macro.calories} cal ({macro.percentage}%)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                formatter={(value: number, _name: string, props: { payload: { calories: number; name: string } }) => [
                  `${value}g (${props.payload.calories} cal)`, 
                  props.payload.name
                ]}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}