
import React, { useState } from 'react';
import { GameButton } from '../components/GameButton';
import { Team } from '../types';

interface TeamSetupProps {
  onConfirm: (teams: [Team, Team]) => void;
  onBack: () => void;
}

const TEAM_PRESETS = [
  { name: 'Eagles', emoji: '🦅', color: 'bg-blue-500 border-blue-700' },
  { name: 'Lions', emoji: '🦁', color: 'bg-yellow-500 border-yellow-700' },
  { name: 'Leopards', emoji: '🐆', color: 'bg-orange-500 border-orange-700' },
  { name: 'Elephants', emoji: '🐘', color: 'bg-purple-500 border-purple-700' },
  { name: 'Hawks', emoji: '🦅', color: 'bg-red-500 border-red-700' },
  { name: 'Buffaloes', emoji: '🐃', color: 'bg-green-500 border-green-700' },
];

export const TeamSetup: React.FC<TeamSetupProps> = ({ onConfirm, onBack }) => {
  const [teamA, setTeamA] = useState({ name: 'Eagles', emoji: '🦅' });
  const [teamB, setTeamB] = useState({ name: 'Lions', emoji: '🦁' });
  const [step, setStep] = useState<'A' | 'B'>('A');

  const handleConfirm = () => {
    const teams: [Team, Team] = [
      { id: 0, name: teamA.name, score: 0, color: 'bg-blue-500', emoji: teamA.emoji },
      { id: 1, name: teamB.name, score: 0, color: 'bg-orange-500', emoji: teamB.emoji },
    ];
    onConfirm(teams);
  };

  const current = step === 'A' ? teamA : teamB;
  const setCurrent = step === 'A' ? setTeamA : setTeamB;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <button
          onClick={onBack}
          className="bg-white px-5 py-3 rounded-2xl shadow-md border-b-4 border-gray-200 hover:bg-gray-50 active:translate-y-1 active:border-b-0 transition-all font-black text-blue-600 mb-10 text-sm"
        >
          ← BACK TO MODE SELECT
        </button>

        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black text-blue-900 mb-3">
            {step === 'A' ? 'Pick Team ' : 'Pick Team '}
            <span className={step === 'A' ? 'text-blue-500' : 'text-orange-500'}>
              {step === 'A' ? 'A' : 'B'}
            </span>
          </h2>
          <p className="text-blue-900/50 font-bold text-lg">
            {step === 'A' ? 'First team to play!' : 'Now the challengers!'}
          </p>
        </div>

        {/* Team Preview */}
        <div className={`bg-white rounded-[3rem] p-10 border-b-8 ${step === 'A' ? 'border-blue-200' : 'border-orange-200'} shadow-xl mb-10 text-center`}>
          <div className="text-8xl mb-4">{current.emoji}</div>
          <input
            type="text"
            value={current.name}
            onChange={(e) => setCurrent(prev => ({ ...prev, name: e.target.value.slice(0, 15) }))}
            className="text-3xl font-black text-blue-900 text-center bg-transparent border-b-4 border-dashed border-gray-300 focus:border-blue-400 outline-none w-full max-w-xs px-4 py-2 transition-colors"
            placeholder="Team name..."
            maxLength={15}
          />
          <p className="text-blue-900/30 font-bold text-sm mt-2 uppercase tracking-wider">
            Tap name to edit • max 15 letters
          </p>
        </div>

        {/* Emoji Grid */}
        <div className="mb-10">
          <p className="text-blue-900/40 font-black uppercase tracking-widest text-xs mb-4 text-center">Choose Mascot</p>
          <div className="grid grid-cols-3 gap-4">
            {TEAM_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setCurrent({ name: preset.name, emoji: preset.emoji })}
                disabled={step === 'B' && preset.name === teamA.name && preset.emoji === teamA.emoji}
                className={`
                  ${preset.color} text-white p-6 rounded-[2rem] border-b-6 shadow-lg
                  flex flex-col items-center gap-2 transition-all
                  active:translate-y-1 active:border-b-0
                  ${current.name === preset.name && current.emoji === preset.emoji ? 'ring-4 ring-white ring-offset-4 scale-105' : ''}
                  ${step === 'B' && preset.name === teamA.name && preset.emoji === teamA.emoji ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105'}
                `}
              >
                <span className="text-4xl">{preset.emoji}</span>
                <span className="font-black text-sm uppercase tracking-wide">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-center">
          {step === 'A' ? (
            <GameButton color="blue" size="xl" onClick={() => setStep('B')}>
              NEXT → TEAM B
            </GameButton>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-4 items-center text-xl font-bold text-blue-900/60">
                <span className="text-blue-500">{teamA.emoji} {teamA.name}</span>
                <span>vs</span>
                <span className="text-orange-500">{teamB.emoji} {teamB.name}</span>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep('A')}
                  className="bg-white px-6 py-4 rounded-2xl border-b-4 border-gray-200 font-bold text-blue-600 active:translate-y-1 transition-all"
                >
                  ← CHANGE TEAM A
                </button>
                <GameButton color="yellow" size="xl" onClick={handleConfirm}>
                  ⚔️ START BATTLE!
                </GameButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
