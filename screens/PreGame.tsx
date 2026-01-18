
import React from 'react';
import { GameButton } from '../components/GameButton';
import { Topic } from '../types';

interface PreGameProps {
  topic: Topic;
  wordCount: number;
  onStart: () => void;
  onBack: () => void;
}

export const PreGame: React.FC<PreGameProps> = ({ topic, wordCount, onStart, onBack }) => {
  const getTopicIcon = () => {
    switch(topic) {
        case 'Nature & Animals': return '🌿';
        case 'Science & Space': return '🚀';
        case 'History & Adventure': return '🏰';
        case 'Arts & Sports': return '🎨';
        case 'Daily Life': return '🏠';
        default: return '🌟';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 max-w-2xl animate-in zoom-in duration-500">
      <div className="text-9xl mb-8 animate-bounce">{getTopicIcon()}</div>
      
      <h2 className="text-5xl font-black text-blue-900 mb-4">
        Ready for {topic}?
      </h2>
      
      <div className="bg-white rounded-3xl p-8 shadow-xl border-b-8 border-gray-100 mb-10 w-full">
        {wordCount > 0 ? (
          <p className="text-2xl text-blue-900/70 font-bold">
              We found <span className="text-blue-600 text-4xl">{wordCount}</span> amazing words for you to learn!
          </p>
        ) : (
          <p className="text-2xl text-blue-900/70 font-bold">
              No words found for this level yet. Try another adventure!
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 w-full">
        <GameButton color="green" size="xl" onClick={onStart} className={wordCount === 0 ? 'opacity-50 pointer-events-none' : ''}>
          START GAME!
        </GameButton>
        <button 
          onClick={onBack}
          className="text-blue-900/40 font-bold hover:text-blue-900/60 transition-colors py-2"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};
