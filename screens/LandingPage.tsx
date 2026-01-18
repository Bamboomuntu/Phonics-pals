
import React from 'react';
import { GameButton } from '../components/GameButton';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="relative flex flex-col items-center justify-center text-center p-6 w-full max-w-4xl min-h-screen overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-yellow-200 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-200 rounded-full blur-[100px] opacity-40 animate-pulse delay-700"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10"
      >
        <div className="mb-10">
          <h1 className="text-7xl md:text-[10rem] font-black tracking-tight leading-none mb-4 select-none drop-shadow-sm">
            <span className="text-yellow-400">P</span>
            <span className="text-green-500">H</span>
            <span className="text-red-500">O</span>
            <span className="text-blue-500">N</span>
            <span className="text-yellow-500">I</span>
            <span className="text-green-600">C</span>
          </h1>
          <h2 className="text-4xl md:text-6xl font-black text-blue-900 tracking-widest mt-[-1rem] md:mt-[-2rem] drop-shadow-md">
            PALS!
          </h2>
        </div>

        <p className="text-xl md:text-2xl text-blue-900/60 font-bold mb-12 max-w-lg mx-auto leading-relaxed">
          Master your words with your favorite new study buddies! 🌟
        </p>

        <div className="flex flex-col gap-8 w-full items-center">
          <GameButton color="yellow" size="xl" onClick={onStart} className="w-full md:w-auto px-16">
            START ADVENTURE
          </GameButton>
          
          <div className="flex gap-6 items-center justify-center">
              {[
                  { icon: '🚀', rot: 'rotate-3' },
                  { icon: '🎨', rot: '-rotate-6' },
                  { icon: '🦁', rot: 'rotate-12' },
                  { icon: '🧪', rot: '-rotate-12' }
              ].map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5, scale: 1.1 }}
                    className={`w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg transform ${item.rot} cursor-default border-2 border-blue-50 text-3xl`}
                  >
                      {item.icon}
                  </motion.div>
              ))}
          </div>
        </div>
      </motion.div>

      <div className="fixed bottom-4 text-blue-900/20 font-black tracking-[0.3em] uppercase text-[10px] pointer-events-none">
        Gemini Powered Mastery
      </div>
    </div>
  );
};