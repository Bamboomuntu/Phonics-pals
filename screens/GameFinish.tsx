
import React, { useEffect } from 'react';
import { Topic, WordEntry } from '../types';
import { GameButton } from '../components/GameButton';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { playSuccessFanfare } from '../utils/audio';

interface GameFinishProps {
  topic: Topic;
  stars: number;
  totalPossibleStars: number;
  onRestart: () => void;
  struggledWords: WordEntry[];
  onReview: () => void;
}

export const GameFinish: React.FC<GameFinishProps> = ({ 
  topic, 
  stars, 
  totalPossibleStars, 
  onRestart, 
  struggledWords, 
  onReview 
}) => {
  useEffect(() => {
    // Play fanfare
    playSuccessFanfare();
    
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Fixed topic mapping to match the Topic union type
  const getBadge = () => {
    switch(topic) {
        case 'Science & Space': return { name: 'Science Star', icon: '🧪', color: 'bg-indigo-500' };
        case 'Arts & Sports': return { name: 'Melody Maker', icon: '🎸', color: 'bg-pink-500' };
        case 'History & Adventure': return { name: 'Time Traveler', icon: '🏛️', color: 'bg-orange-500' };
        case 'Nature & Animals': return { name: 'Nature Hero', icon: '🐼', color: 'bg-emerald-500' };
        case 'Daily Life': return { name: 'Life Hero', icon: '🏠', color: 'bg-amber-500' };
        default: return { name: 'Phonic Pal', icon: '🌟', color: 'bg-blue-500' };
    }
  };

  const badge = getBadge();
  const percentage = Math.round((stars / totalPossibleStars) * 100);

  return (
    <div className="flex flex-col items-center justify-start p-6 text-center max-w-4xl w-full h-full overflow-y-auto pb-20 scrollbar-hide">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        className="mb-8 mt-4 shrink-0"
      >
        <div className={`w-48 h-48 md:w-64 md:h-64 ${badge.color} rounded-full border-[10px] md:border-[15px] border-white shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group`}>
            <div className="absolute inset-0 bg-white/20 scale-150 -rotate-45 translate-y-12"></div>
            <span className="text-7xl md:text-9xl z-10 drop-shadow-lg group-hover:scale-110 transition-transform">{badge.icon}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full flex flex-col items-center"
      >
        <h2 className="text-4xl md:text-6xl font-black text-blue-900 mb-2">YOU DID IT!</h2>
        <p className="text-xl md:text-2xl text-blue-900/60 font-bold mb-8">
            You earned the <span className="text-blue-600 font-black">{badge.name}</span> Badge!
        </p>

        <div className="bg-white rounded-[3rem] p-6 md:p-10 shadow-xl border-b-8 border-gray-100 mb-8 w-full max-w-2xl flex flex-col items-center gap-4">
            <div className="flex gap-2 text-4xl md:text-7xl">
                {Array.from({length: 3}).map((_, i) => (
                    <motion.span 
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + (i * 0.2) }}
                    >⭐</motion.span>
                ))}
            </div>
            <div className="text-3xl md:text-5xl font-black text-blue-900">
                {stars} STARS!
            </div>
            <div className="text-sm md:text-lg font-bold text-blue-900/40 uppercase tracking-widest">
                Pronunciation Accuracy: {percentage}%
            </div>
        </div>

        {/* REVIEW SECTION */}
        {struggledWords.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="w-full max-w-2xl mb-12"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-[2px] flex-1 bg-blue-100"></div>
                    <span className="text-blue-900/40 font-black uppercase tracking-widest text-sm">Review Center</span>
                    <div className="h-[2px] flex-1 bg-blue-100"></div>
                </div>
                
                <div className="bg-blue-50/50 rounded-[3rem] p-8 border-2 border-dashed border-blue-200">
                    <h3 className="text-2xl font-black text-blue-800 mb-4 text-left">Tricky Words:</h3>
                    <div className="flex flex-wrap gap-3 justify-center mb-8">
                        {struggledWords.map((word, idx) => (
                            <div key={idx} className="bg-white px-6 py-3 rounded-2xl shadow-sm border-b-4 border-blue-100 font-black text-blue-600 text-lg">
                                {word.word}
                            </div>
                        ))}
                    </div>
                    <GameButton color="blue" size="lg" className="w-full" onClick={onReview}>
                        PRACTICE THESE AGAIN!
                    </GameButton>
                </div>
            </motion.div>
        )}

        <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl">
            <GameButton color="yellow" size="lg" className="flex-1" onClick={onRestart}>
                PLAY AGAIN!
            </GameButton>
            <button 
                onClick={() => window.location.reload()}
                className="flex-1 bg-white py-6 rounded-3xl border-b-8 border-gray-100 font-black text-2xl text-blue-600 hover:bg-gray-50 active:translate-y-2 active:border-b-0 shadow-lg transition-all"
            >
                MAIN MENU
            </button>
        </div>
      </motion.div>
    </div>
  );
};
