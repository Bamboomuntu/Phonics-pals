
import React from 'react';
import { GameButton } from '../components/GameButton';
import { AgeGroup } from '../types';

interface ParentDashboardProps {
  onSelectAge: (age: AgeGroup) => void;
  onBack: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onSelectAge, onBack }) => {
  const levels = [
    { title: AgeGroup.PRESCHOOL, icon: '🐣', desc: 'Letters & Sounds', color: 'bg-green-100 border-green-300', btnColor: 'green' as const },
    { title: AgeGroup.GRADE_1, icon: '🦁', desc: 'Simple Words', color: 'bg-blue-100 border-blue-300', btnColor: 'blue' as const },
    { title: AgeGroup.GRADE_2, icon: '🚀', desc: 'Fun Sentences', color: 'bg-yellow-100 border-yellow-300', btnColor: 'yellow' as const },
    { title: AgeGroup.GRADE_3, icon: '🦉', desc: 'Explorer Level', color: 'bg-indigo-100 border-indigo-300', btnColor: 'blue' as const },
    { title: AgeGroup.GRADE_4, icon: '🌋', desc: 'Adventure Level', color: 'bg-orange-100 border-orange-300', btnColor: 'yellow' as const },
    { title: AgeGroup.GRADE_5, icon: '🛸', desc: 'Hero Level', color: 'bg-pink-100 border-pink-300', btnColor: 'green' as const },
    { title: AgeGroup.GRADE_6, icon: '💎', desc: 'Mastery Level', color: 'bg-cyan-100 border-cyan-300', btnColor: 'blue' as const },
  ];

  return (
    <div className="w-full max-w-6xl p-6 flex flex-col items-center animate-in slide-in-from-bottom duration-500 overflow-y-auto">
      <div className="w-full flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="bg-white p-4 rounded-2xl shadow-md border-b-4 border-gray-200 hover:bg-gray-50 active:translate-y-1 active:border-b-0 transition-all font-bold text-blue-600 flex items-center gap-2"
        >
          ← BACK
        </button>
        <div className="text-right">
          <span className="text-blue-900/50 font-bold uppercase tracking-widest text-xs">Level Selection</span>
        </div>
      </div>

      <h2 className="text-4xl md:text-5xl font-black text-blue-800 mb-2 text-center">
        Who is playing today?
      </h2>
      <p className="text-xl text-blue-900/60 mb-10 text-center font-bold">
        Choose a level to start the adventure!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full pb-10">
        {levels.map((lvl) => (
          <AgeCard 
            key={lvl.title}
            title={lvl.title} 
            icon={lvl.icon} 
            desc={lvl.desc} 
            color={lvl.color} 
            btnColor={lvl.btnColor}
            onClick={() => onSelectAge(lvl.title)} 
          />
        ))}
      </div>
    </div>
  );
};

const AgeCard: React.FC<{ 
    title: string; 
    icon: string; 
    desc: string; 
    color: string; 
    btnColor: 'green' | 'blue' | 'yellow';
    onClick: () => void 
}> = ({ title, icon, desc, color, btnColor, onClick }) => (
  <div 
    onClick={onClick}
    className={`${color} border-b-8 rounded-[2.5rem] p-6 flex flex-col items-center justify-center cursor-pointer bounce-on-hover transition-all group shadow-lg min-h-[320px]`}
  >
    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{icon}</div>
    <h3 className="text-2xl font-black text-blue-900 mb-1 uppercase tracking-tight">{title}</h3>
    <p className="text-blue-900/60 font-bold mb-6 text-sm">{desc}</p>
    <GameButton size="md" color={btnColor} onClick={onClick} className="w-full">
        PLAY!
    </GameButton>
  </div>
);
