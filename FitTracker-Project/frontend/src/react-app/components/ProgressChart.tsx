import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';

interface DataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

interface ProgressChartProps {
  data: DataPoint[];
  dataKey: string;
  title: string;
  color?: string;
  unit?: string;
  type?: 'line' | 'area';
  formatValue?: (value: number) => string;
  goalLine?: number | null; // New prop for goal line
}

export default function ProgressChart({ 
  data, 
  dataKey, 
  title, 
  color = '#3B82F6', 
  unit = '',
  type = 'line',
  formatValue,
  goalLine
}: ProgressChartProps) {
  const chartData = data
    .filter(item => item[dataKey] !== null && item[dataKey] !== undefined)
    .map(item => ({
      ...item,
      date: format(parseISO(item.date), 'MMM dd'),
      value: item[dataKey]
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const latest = chartData[chartData.length - 1];
  const previous = chartData.length > 1 ? chartData[chartData.length - 2] : null;
  const change = previous && latest.value !== null && previous.value !== null 
    ? latest.value - previous.value 
    : 0;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color }}>
            {formatValue ? formatValue(latest.value || 0) : `${latest.value || 0}${unit}`}
          </p>
          {previous && (
            <p className={`text-sm ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              {change > 0 ? '+' : ''}{formatValue ? formatValue(change) : `${change.toFixed(1)}${unit}`}
            </p>
          )}
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => formatValue ? formatValue(value) : `${value}${unit}`}
              />
              <Tooltip
                formatter={(value: number) => [
                  formatValue ? formatValue(value) : `${value}${unit}`, 
                  title
                ]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={`${color}20`}
                strokeWidth={2}
              />
              {goalLine !== null && goalLine !== undefined && (
                <ReferenceLine y={goalLine} stroke="#F97316" strokeDasharray="3 3" />
              )}
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => formatValue ? formatValue(value) : `${value}${unit}`}
              />
              <Tooltip
                formatter={(value: number) => [
                  formatValue ? formatValue(value) : `${value}${unit}`, 
                  title
                ]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
              {goalLine !== null && goalLine !== undefined && (
                <ReferenceLine y={goalLine} stroke="#F97316" strokeDasharray="3 3" />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}