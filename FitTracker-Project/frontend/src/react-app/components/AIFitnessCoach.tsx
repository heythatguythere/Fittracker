import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Bot, 
  User,
  Dumbbell
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import type { UserProfile, Workout } from '../../shared/types';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIFitnessCoachProps {
  userProfile?: UserProfile | null;
  recentWorkouts?: Workout[];
}

const AIFitnessCoach: React.FC<AIFitnessCoachProps> = ({ 
  userProfile, 
  recentWorkouts = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: `Hey ${user?.displayName || 'there'}! 👋 I'm your AI fitness coach. I'm here to help you with workout advice, nutrition tips, motivation, and answering any fitness questions you have. What can I help you with today?`,
        timestamp: new Date(),
        suggestions: [
          "Give me a workout plan",
          "How many calories should I eat?",
          "Motivate me to exercise",
          "Check my progress"
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, user?.displayName]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    setIsTyping(true);
    
    try {
      // Call the Groq API endpoint
      const response = await axios.post('/api/chatbot', {
        message: userMessage,
        userProfile,
        recentWorkouts
      }, {
        withCredentials: true
      });

      const aiResponse = response.data.response;
      
      // Generate contextual suggestions based on the response
      const suggestions = generateSuggestions(userMessage, aiResponse);
      
      setIsTyping(false);
      
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        suggestions
      };
    } catch (error) {
      console.error('Error calling AI API:', error);
      
      // Fallback response if API fails
      const fallbackResponse = "I'm having trouble connecting to my AI brain right now. Please try again in a moment! In the meantime, I can help you with workout planning, nutrition advice, or motivation. What would you like to know?";
      
      setIsTyping(false);
      
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: fallbackResponse,
        timestamp: new Date(),
        suggestions: ["Plan a workout", "Nutrition advice", "Get motivated", "Try again"]
      };
    }
  };

  const generateSuggestions = (userMessage: string, aiResponse: string): string[] => {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    
    if (lowerMessage.includes('workout') || lowerResponse.includes('workout')) {
      return ["Plan my next workout", "Track my progress", "Increase intensity"];
    } else if (lowerMessage.includes('calorie') || lowerMessage.includes('eat') || lowerResponse.includes('nutrition')) {
      return ["Plan my meals", "Adjust calorie goals", "Track nutrition"];
    } else if (lowerMessage.includes('motivat') || lowerResponse.includes('motivat')) {
      return ["Set a new goal", "Plan my workout", "Check progress"];
    } else if (lowerMessage.includes('progress') || lowerResponse.includes('progress')) {
      return ["Analyze my data", "Set new goals", "Plan next steps"];
    } else {
      return ["Plan a workout", "Nutrition advice", "Get motivated", "Track progress"];
    }
  };



  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const aiResponse = await generateAIResponse(inputValue);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="relative">
          {isOpen ? <X size={24} /> : <Dumbbell size={24} />}
          {!isOpen && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </div>
        {!isOpen && (
          <motion.div
            className="absolute -top-2 -right-2 bg-white text-blue-600 text-xs px-2 py-1 rounded-full shadow-lg whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3 }}
          >
            Ask me anything!
          </motion.div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
                  <Bot size={20} />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Fitness Coach</h3>
                  <p className="text-sm opacity-90">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'ai' && (
                        <Bot size={16} className="mt-1 flex-shrink-0" />
                      )}
                      {message.type === 'user' && (
                        <User size={16} className="mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="block w-full text-left text-xs bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Bot size={16} />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-gray-200">
              <div className="flex space-x-2 overflow-x-auto">
                <button
                  onClick={() => handleSuggestionClick("Plan my workout")}
                  className="flex-shrink-0 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs hover:bg-blue-100 transition-colors"
                >
                  🏋️ Workout
                </button>
                <button
                  onClick={() => handleSuggestionClick("Check my progress")}
                  className="flex-shrink-0 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs hover:bg-green-100 transition-colors"
                >
                  📊 Progress
                </button>
                <button
                  onClick={() => handleSuggestionClick("Nutrition advice")}
                  className="flex-shrink-0 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs hover:bg-orange-100 transition-colors"
                >
                  🥗 Nutrition
                </button>
                <button
                  onClick={() => handleSuggestionClick("Motivate me")}
                  className="flex-shrink-0 bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs hover:bg-purple-100 transition-colors"
                >
                  💪 Motivate
                </button>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about fitness..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIFitnessCoach;