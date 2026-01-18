
import React from 'react';
import { Topic, AgeGroup } from '../types';
import { dictionary } from '../data/dictionary';

interface TopicSelectionProps {
  selectedAge?: AgeGroup;
  onSelectTopic: (topic: Topic) => void;
  onBack: () => void;
}

export const TopicSelection: React.FC<TopicSelectionProps> = ({ selectedAge, onSelectTopic, onBack }) => {
  const getCount = (topic: Topic) => dictionary.filter(w => w.topic === topic && w.level === selectedAge).length;

  const topics: { id: Topic; name: string; icon: string; color: string; border: string; hover: string }[] = [
    { id: 'Nature & Animals', name: 'Nature', icon: '🌿', color: 'bg-emerald-500', border: 'border-emerald-700', hover: 'hover:bg-emerald-600' },
    { id: 'Science & Space', name: 'Science', icon: '🚀', color: 'bg-indigo-500', border: 'border-indigo-700', hover: 'hover:bg-indigo-600' },
    { id: 'History & Adventure', name: 'History', icon: '🏰', color: 'bg-orange-500', border: 'border-orange-700', hover: 'hover:bg-orange-600' },
    { id: 'Arts & Sports', name: 'Arts', icon: '🎨', color: 'bg-pink-500', border: 'border-pink-700', hover: 'hover:bg-pink-600' },
    { id: 'Daily Life', name: 'Life', icon: '🏠', color: 'bg-amber-500', border: 'border-amber-700', hover: 'hover:bg-amber-600' },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-6 max-w-6xl animate-in fade-in slide-in-from-right duration-500 overflow-y-auto scrollbar-hide">
      <header className="w-full flex justify-between items-center mb-10 mt-4 shrink-0">
        <button 
          onClick={onBack}
          className="bg-white px-5 py-3 rounded-2xl shadow-md border-b-4 border-gray-200 hover:bg-gray-50 active:translate-y-1 active:border-b-0 transition-all font-black text-blue-600 flex items-center gap-2 uppercase text-xs tracking-wider"
        >
          ← Change Age
        </button>
        <div className="flex flex-col items-end">
            <span className="text-blue-900/30 font-black uppercase text-[10px] tracking-widest mb-1">Explorer Mode</span>
            <div className="bg-white text-blue-600 border-2 border-blue-50 px-4 py-1.5 rounded-full font-black text-sm shadow-sm">
                {selectedAge || 'Genius'}
            </div>
        </div>
      </header>

      <div className="text-center mb-12 shrink-0">
        <h2 className="text-5xl md:text-6xl font-black text-blue-900 mb-4 tracking-tight">
          Pick an Adventure!
        </h2>
        <p className="text-xl md:text-2xl text-blue-900/50 font-bold">
          What do you want to talk about today? 🗺️
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full flex-1">
        {topics.map((topic) => {
          const count = getCount(topic.id);
          return (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              className={`
                ${topic.color} ${topic.hover} 
                p-8 rounded-[3rem] border-b-[12px] ${topic.border}
                flex flex-col items-center justify-center gap-4 
                bounce-on-hover transition-all duration-300
                active:translate-y-3 active:border-b-0
                group relative overflow-hidden shadow-xl min-h-[280px]
              `}
            >
              <div className="absolute top-4 right-4 text-white/10 text-8xl font-black pointer-events-none select-none">
                  {topic.icon}
              </div>
              <div className="text-8xl z-10 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
                {topic.icon}
              </div>
              <span className="text-2xl font-black text-white z-10 tracking-wide uppercase drop-shadow-md">
                {topic.name}
              </span>
              <div className="bg-black/10 px-4 py-1 rounded-full text-white font-black text-[10px] z-10 group-hover:bg-black/20 transition-colors uppercase tracking-widest">
                  {count} Challenges
              </div>
            </button>
          );
        })}
      </div>

      <footer className="mt-16 text-center text-blue-900/20 font-black uppercase text-[10px] tracking-widest pb-8">
        Phonic Pals Adventure Hub • v1.3
      </footer>
    </div>
  );
};
