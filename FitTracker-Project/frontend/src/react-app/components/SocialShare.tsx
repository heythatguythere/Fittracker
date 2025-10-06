import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  X, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  MessageCircle,
  Copy,
  Check,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import ShareableImage from './ShareableImage';
import type { UserProfile, Workout, Measurement, DietEntry, Goal } from '../../shared/types';

interface SocialShareProps {
  profile: UserProfile | null;
  workouts: Workout[];
  measurements: Measurement[];
  dietEntries: DietEntry[];
  goals: Goal[];
  isOpen: boolean;
  onClose: () => void;
}

const SocialShare: React.FC<SocialShareProps> = ({
  profile,
  workouts,
  measurements,
  dietEntries,
  goals,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);

  // Generate shareable content
  const generateShareContent = () => {
    const totalWorkouts = workouts.length;
    const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
    const latestWeight = measurements.length > 0 ? measurements[0].weight_kg : null;
    const initialWeight = measurements.length > 0 ? measurements[measurements.length - 1].weight_kg : null;
    const weightChange = latestWeight && initialWeight ? (latestWeight - initialWeight).toFixed(1) : null;
    
    const weeklyWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.workout_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return workoutDate >= weekAgo;
    }).length;

    const userName = profile?.first_name || 'Fitness Enthusiast';
    const currentDate = new Date().toLocaleDateString();

    let content = `🏋️ My Fitness Journey Update - ${currentDate}\n\n`;
    content += `Hey everyone! Here's my progress so far:\n\n`;
    content += `✅ ${totalWorkouts} workouts completed\n`;
    content += `🔥 ${totalCaloriesBurned.toLocaleString()} calories burned\n`;
    content += `📅 ${weeklyWorkouts} workouts this week\n`;
    
    if (weightChange !== null) {
      const changeDirection = parseFloat(weightChange) > 0 ? 'gained' : 'lost';
      content += `⚖️ ${Math.abs(parseFloat(weightChange))}kg ${changeDirection}\n`;
    }
    
    content += `\nConsistency is key! 💪\n`;
    content += `#FitnessJourney #WorkoutMotivation #HealthGoals #FitTracker`;

    return content;
  };

  const generateShortContent = () => {
    const totalWorkouts = workouts.length;
    const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
    
    return `Just completed ${totalWorkouts} workouts and burned ${totalCaloriesBurned.toLocaleString()} calories! 💪 #FitnessJourney #FitTracker`;
  };

  const shareContent = generateShareContent();
  const shortContent = generateShortContent();

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shortContent)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500',
      hoverColor: 'hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortContent)}&url=${encodeURIComponent(window.location.origin)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700',
      hoverColor: 'hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(shortContent)}`
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      url: `https://wa.me/?text=${encodeURIComponent(shareContent)}`
    }
  ];

  const handleShare = (platform: typeof socialPlatforms[0]) => {
    setSelectedPlatform(platform.name);
    window.open(platform.url, '_blank', 'width=600,height=400');
    setTimeout(() => setSelectedPlatform(null), 2000);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Share2 className="h-6 w-6 mr-2 text-blue-600" />
                Share Your Progress
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Preview:</h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{shareContent}</p>
                </div>
              </div>

              {/* Social Media Buttons */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Share on Social Media:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {socialPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatform === platform.name;
                    return (
                      <motion.button
                        key={platform.name}
                        onClick={() => handleShare(platform)}
                        className={`flex items-center justify-center space-x-3 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 ${platform.color} ${platform.hoverColor} ${
                          isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{platform.name}</span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Actions */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Other Options:</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleCopyToClipboard}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowImageGenerator(true)}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-medium transition-colors"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span>Create Shareable Image</span>
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Sharing Tips:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Share your achievements to motivate others</li>
                  <li>• Use relevant hashtags to reach more people</li>
                  <li>• Be consistent with your sharing schedule</li>
                  <li>• Celebrate milestones and progress</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Shareable Image Generator */}
      <ShareableImage
        profile={profile}
        workouts={workouts}
        measurements={measurements}
        dietEntries={dietEntries}
        goals={goals}
        isOpen={showImageGenerator}
        onClose={() => setShowImageGenerator(false)}
      />
    </AnimatePresence>
  );
};

export default SocialShare;
