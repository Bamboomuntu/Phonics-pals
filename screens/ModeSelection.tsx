
import React from 'react';
import { GameButton } from '../components/GameButton';
import { motion } from 'framer-motion';

interface ModeSelectionProps {
  onSelectSolo: () => void;
  onSelectArena: () => void;
  onSelectRapidFire: () => void;
  onSelectEcho: () => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectSolo, onSelectArena, onSelectRapidFire, onSelectEcho }) => {
  return (
    <div className="relative flex flex-col items-center justify-center text-center p-6 w-full max-w-4xl min-h-screen overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-yellow-200 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-200 rounded-full blur-[100px] opacity-40 animate-pulse delay-700"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 w-full"
      >
        <h1 className="text-4xl md:text-5xl font-black text-blue-900 mb-2">Choose Your Mode</h1>
        <p className="text-lg md:text-xl text-blue-900/50 font-bold mb-12">How do you want to play today?</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {/* Solo Mode */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSelectSolo}
            className="bg-white rounded-[3rem] p-6 border-b-8 border-gray-200 shadow-xl flex flex-col items-center gap-3 group active:translate-y-2 active:border-b-0 transition-all"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              🎮
            </div>
            <h2 className="text-xl font-black text-blue-900">Solo</h2>
            <p className="text-blue-900/50 font-bold text-[10px] max-w-full">
              English pronunciation. Earn stars!
            </p>
            <GameButton color="green" size="md" className="mt-1 text-sm !px-6 !py-3">PLAY</GameButton>
          </motion.button>

          {/* Arena Battle */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSelectArena}
            className="bg-white rounded-[3rem] p-6 border-b-8 border-orange-300 shadow-xl flex flex-col items-center gap-3 group active:translate-y-2 active:border-b-0 transition-all"
          >
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              ⚔️
            </div>
            <h2 className="text-xl font-black text-blue-900">Arena</h2>
            <p className="text-blue-900/50 font-bold text-[10px] max-w-full">
              Teams. English + Lusoga. Teacher umpire.
            </p>
            <GameButton color="yellow" size="md" className="mt-1 text-sm !px-6 !py-3">BATTLE</GameButton>
          </motion.button>

          {/* Rapid Fire */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSelectRapidFire}
            className="bg-white rounded-[3rem] p-6 border-b-8 border-red-300 shadow-xl flex flex-col items-center gap-3 group active:translate-y-2 active:border-b-0 transition-all"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              🔥
            </div>
            <h2 className="text-xl font-black text-blue-900">Rapid Fire</h2>
            <p className="text-blue-900/50 font-bold text-[10px] max-w-full">
              Timed! 5 sec. Steal mechanic. Mixed language.
            </p>
            <GameButton color="red" size="md" className="mt-1 text-sm !px-6 !py-3">RAPID</GameButton>
          </motion.button>

          {/* Echo Challenge */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSelectEcho}
            className="bg-white rounded-[3rem] p-6 border-b-8 border-purple-300 shadow-xl flex flex-col items-center gap-3 group active:translate-y-2 active:border-b-0 transition-all"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              🔊
            </div>
            <h2 className="text-xl font-black text-blue-900">Echo</h2>
            <p className="text-blue-900/50 font-bold text-[10px] max-w-full">
              Record Lusoga. Others guess. Peer-validated data.
            </p>
            <GameButton color="blue" size="md" className="mt-1 text-sm !px-6 !py-3">ECHO</GameButton>
          </motion.button>
        </div>

        <div className="mt-16 text-blue-900/20 font-black tracking-[0.3em] uppercase text-[10px]">
          Gemini Powered • Bilingual Learning
        </div>
      </motion.div>
    </div>
  );
};
