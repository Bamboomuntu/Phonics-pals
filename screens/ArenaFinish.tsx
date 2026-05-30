
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Team, ArenaRound } from '../types';
import { GameButton } from '../components/GameButton';

interface ArenaFinishProps {
  teams: [Team, Team];
  rounds: ArenaRound[];
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const ArenaFinish: React.FC<ArenaFinishProps> = ({ teams, rounds, onPlayAgain, onMainMenu }) => {
  const winner = teams[0].score > teams[1].score ? teams[0] :
                 teams[1].score > teams[0].score ? teams[1] : null;

  const isTie = winner === null;

  useEffect(() => {
    const duration = 4 * 1000;
    const end = Date.now() + duration;
    const interval = setInterval(() => {
      const left = end - Date.now();
      if (left <= 0) return clearInterval(interval);
      const count = 30 * (left / duration);
      confetti({
        particleCount: count,
        spread: 60,
        origin: { x: 0.3, y: 0.6 },
        colors: ['#3B82F6', '#F59E0B', '#10B981'],
      });
      confetti({
        particleCount: count,
        spread: 60,
        origin: { x: 0.7, y: 0.6 },
        colors: ['#F97316', '#8B5CF6', '#EF4444'],
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Stats
  const totalEnglishAttempts = rounds.filter(r => r.teamARound.englishScore !== null || r.teamBRound.englishScore !== null).length;
  const totalLusogaAttempts = rounds.filter(r => r.teamARound.lusogaRecording || r.teamBRound.lusogaRecording).length;
  const correctLusoga = rounds.filter(r => 
    r.teamARound.lusogaVerdict === 'correct' || r.teamBRound.lusogaVerdict === 'correct'
  ).length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 overflow-y-auto bg-gradient-to-b from-yellow-50 to-orange-50">
      {/* Trophy / Result */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        className="mt-8 mb-8"
      >
        {isTie ? (
          <div className="w-48 h-48 md:w-56 md:h-56 bg-purple-500 rounded-full border-[10px] border-white shadow-2xl flex items-center justify-center">
            <span className="text-7xl md:text-8xl">🤝</span>
          </div>
        ) : (
          <div className={`w-48 h-48 md:w-56 md:h-56 rounded-full border-[10px] border-white shadow-2xl flex items-center justify-center ${
            winner!.id === 0 ? 'bg-blue-500' : 'bg-orange-500'
          }`}>
            <span className="text-7xl md:text-8xl">🏆</span>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center max-w-2xl w-full"
      >
        <h2 className="text-4xl md:text-6xl font-black text-blue-900 mb-2">
          {isTie ? "IT'S A TIE!" : `${winner!.emoji} ${winner!.name} WIN!`}
        </h2>
        <p className="text-lg md:text-xl text-blue-900/50 font-bold mb-8">
          {isTie ? 'Both teams fought hard!' : 'Champions of the Phonic Arena!'}
        </p>

        {/* Score Display */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-500 text-white rounded-[3rem] p-6 border-b-8 border-blue-700 shadow-xl">
            <div className="text-4xl mb-2">{teams[0].emoji}</div>
            <div className="font-black text-2xl">{teams[0].name}</div>
            <div className="text-5xl font-black mt-2">{teams[0].score}</div>
          </div>
          <div className="bg-orange-500 text-white rounded-[3rem] p-6 border-b-8 border-orange-700 shadow-xl">
            <div className="text-4xl mb-2">{teams[1].emoji}</div>
            <div className="font-black text-2xl">{teams[1].name}</div>
            <div className="text-5xl font-black mt-2">{teams[1].score}</div>
          </div>
        </div>

        {/* Data Pipeline Stats */}
        <div className="bg-white rounded-[3rem] p-6 border-b-8 border-gray-100 shadow-xl mb-8">
          <h3 className="font-black text-lg text-blue-900 mb-4 uppercase tracking-wider">📊 Session Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-black text-blue-600">{totalEnglishAttempts}</div>
              <div className="text-xs font-bold text-blue-900/40">English Attempts</div>
            </div>
            <div>
              <div className="text-3xl font-black text-green-600">{totalLusogaAttempts}</div>
              <div className="text-xs font-bold text-blue-900/40">Lusoga Recordings</div>
            </div>
            <div>
              <div className="text-3xl font-black text-amber-600">{correctLusoga}</div>
              <div className="text-xs font-bold text-blue-900/40">Teacher Approved</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-blue-900/30 font-bold">
              {rounds.length} words played • {totalLusogaAttempts} Lusoga samples collected
              {correctLusoga > 0 && ` • ${correctLusoga} teacher-verified`}
            </p>
          </div>
        </div>

        {/* Round Recap */}
        <div className="bg-white rounded-[3rem] p-6 border-b-8 border-gray-100 shadow-xl mb-8 max-h-64 overflow-y-auto">
          <h3 className="font-black text-sm text-blue-900 mb-4 uppercase tracking-wider">📋 Round Recap</h3>
          <div className="space-y-2">
            {rounds.map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-2xl p-3">
                <div className="font-bold text-blue-900 text-sm">{r.word.word}</div>
                <div className="flex gap-4 text-xs">
                  <span className="text-blue-500">
                    {teams[0].name}: {r.teamARound.englishScore !== null ? `${r.teamARound.englishScore}%` : '—'}
                    {r.teamARound.lusogaVerdict === 'correct' ? ' ✅' : r.teamARound.lusogaVerdict === 'incorrect' ? ' ❌' : ''}
                  </span>
                  <span className="text-orange-500">
                    {teams[1].name}: {r.teamBRound.englishScore !== null ? `${r.teamBRound.englishScore}%` : '—'}
                    {r.teamBRound.lusogaVerdict === 'correct' ? ' ✅' : r.teamBRound.lusogaVerdict === 'incorrect' ? ' ❌' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <GameButton color="yellow" size="lg" className="flex-1" onClick={onPlayAgain}>
            PLAY AGAIN!
          </GameButton>
          <button
            onClick={onMainMenu}
            className="flex-1 bg-white py-6 rounded-3xl border-b-8 border-gray-100 font-black text-2xl text-blue-600 hover:bg-gray-50 active:translate-y-2 active:border-b-0 shadow-lg transition-all"
          >
            MAIN MENU
          </button>
        </div>
      </motion.div>
    </div>
  );
};
