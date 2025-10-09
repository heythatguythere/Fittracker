import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Loader2, BarChart3, TrendingUp, Flame, Zap } from 'lucide-react';
import { useAuth } from '../AuthContext';
import type { Workout, Measurement, DietEntry, Goal } from '../../shared/types';

interface ShareableImageProps {
    workouts: Workout[];
    measurements: Measurement[];
    dietEntries: DietEntry[];
    goals: Goal[];
}

export default function ShareableImage({ workouts, measurements }: ShareableImageProps) {
    const { user } = useAuth();
    const imageRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // --- Data Aggregation ---
    const totalWorkouts = workouts.length;
    const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.calories_burned ?? 0), 0);
    
    const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;
    const initialMeasurement = measurements.length > 0 ? measurements[0] : null;
    const weightChange = initialMeasurement && latestMeasurement ? (latestMeasurement.weight_kg ?? 0) - (initialMeasurement.weight_kg ?? 0) : 0;
    
    const handleDownload = async () => {
        if (!imageRef.current) return;
        setIsGenerating(true);
        try {
            const dataUrl = await toPng(imageRef.current, { cacheBust: true, quality: 0.95, backgroundColor: '#ffffff' });
            const link = document.createElement('a');
            link.download = `fittracker-progress-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to generate image', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 rounded-2xl border">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Share Your Progress</h2>
            <p className="text-gray-600 mb-6">Download a shareable image of your latest stats to post on social media or send to friends!</p>
            
            <div ref={imageRef} className="p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg w-[400px]">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-black tracking-wider">FitTracker</h1>
                    <Zap className="h-8 w-8 text-yellow-300" />
                </div>
                <div className="flex items-center space-x-4 mb-8">
                    <img 
                        src={user?.image || `https://ui-avatars.com/api/?name=${user?.displayName || user?.email}`} 
                        alt="User" 
                        className="w-16 h-16 rounded-full object-cover border-4 border-white/50"
                    />
                    <div>
                        <h2 className="text-2xl font-bold">{user?.displayName || 'Fitness Enthusiast'}</h2>
                        <p className="text-blue-200">Weekly Progress Report</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <BarChart3 className="h-6 w-6 text-cyan-300"/>
                            <span className="font-semibold">Total Workouts</span>
                        </div>
                        <span className="text-2xl font-bold">{totalWorkouts}</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Flame className="h-6 w-6 text-orange-300"/>
                            <span className="font-semibold">Calories Burned</span>
                        </div>
                        <span className="text-2xl font-bold">{totalCaloriesBurned.toLocaleString()}</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <TrendingUp className={`h-6 w-6 ${weightChange <= 0 ? 'text-green-300' : 'text-red-300'}`}/>
                            <span className="font-semibold">Weight Change</span>
                        </div>
                        <span className={`text-2xl font-bold ${weightChange <= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {weightChange.toFixed(1)} kg
                        </span>
                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-blue-200">
                    <p>Generated on {new Date().toLocaleDateString()} | Keep up the great work!</p>
                </div>
            </div>

            <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400"
            >
                {isGenerating ? <Loader2 className="h-5 w-5 animate-spin"/> : <Download className="h-5 w-5"/>}
                <span>{isGenerating ? 'Generating...' : 'Download Image'}</span>
            </button>
        </div>
    );
}