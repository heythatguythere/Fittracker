import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Twitter, Facebook, Copy } from 'lucide-react';
import { toPng } from 'html-to-image';
import ShareableImage from './ShareableImage';
import type { Workout, Measurement, DietEntry, Goal, UserProfile } from '../../shared/types';

interface SocialShareProps {
    workouts: Workout[];
    measurements: Measurement[];
    dietEntries: DietEntry[];
    goals: Goal[];
    profile: UserProfile | null;
    onClose: () => void;
}

export default function SocialShare({ workouts, measurements, dietEntries, goals, onClose }: SocialShareProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    const imageRef = useRef<HTMLDivElement>(null);
    
    const shareText = "Check out my latest progress on FitTracker! I'm one step closer to my fitness goals. #fitness #progress #fittracker";

    const generateAndShare = async (platform: 'twitter' | 'facebook' | 'copy') => {
        if (!imageRef.current) return;
        setIsGenerating(true);
        try {
            const imageUrl = await toPng(imageRef.current, { quality: 0.95 });

            let url = '';
            switch (platform) {
                case 'twitter':
                    url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(imageUrl)}`;
                    break;
                case 'facebook':
                    url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}`;
                    break;
                case 'copy':
                     navigator.clipboard.writeText(imageUrl).then(() => {
                        setCopySuccess('Image URL copied to clipboard!');
                        setTimeout(() => setCopySuccess(''), 2000);
                    });
                    setIsGenerating(false);
                    return;
            }
            window.open(url, '_blank', 'noopener,noreferrer');

        } catch (error) {
            console.error('Sharing failed', error);
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X /></button>
                    <h2 className="text-2xl font-bold mb-4 flex items-center"><Share2 className="mr-2"/>Share Your Progress</h2>
                    <p className="text-gray-600 mb-6">Here's a preview of the image that will be shared. Choose a platform below.</p>

                    <div className="absolute -left-[9999px] top-0">
                         <div ref={imageRef}>
                             <ShareableImage workouts={workouts} measurements={measurements} dietEntries={dietEntries} goals={goals} />
                         </div>
                    </div>
                    
                    <div className="space-y-4">
                        <button onClick={() => generateAndShare('twitter')} disabled={isGenerating} className="w-full flex items-center justify-center p-3 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600">
                           <Twitter className="mr-2" /> Share on Twitter
                        </button>
                        <button onClick={() => generateAndShare('facebook')} disabled={isGenerating} className="w-full flex items-center justify-center p-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800">
                            <Facebook className="mr-2" /> Share on Facebook
                        </button>
                        <button onClick={() => generateAndShare('copy')} disabled={isGenerating} className="w-full flex items-center justify-center p-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700">
                           <Copy className="mr-2" /> Copy Image URL
                        </button>
                    </div>

                    {copySuccess && <p className="text-green-600 text-center mt-4">{copySuccess}</p>}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}