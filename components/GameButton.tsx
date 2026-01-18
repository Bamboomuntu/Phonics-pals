
import React from 'react';
import { playPop } from '../utils/audio';

interface GameButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  color?: 'yellow' | 'blue' | 'green' | 'red';
  size?: 'md' | 'lg' | 'xl';
  className?: string;
  icon?: React.ReactNode;
}

export const GameButton: React.FC<GameButtonProps> = ({ 
  children, 
  onClick, 
  color = 'blue', 
  size = 'lg',
  className = '',
  icon
}) => {
  const colors = {
    yellow: 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-yellow-600',
    blue: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-700',
    green: 'bg-green-500 hover:bg-green-600 text-white border-green-700',
    red: 'bg-red-500 hover:bg-red-600 text-white border-red-700',
  };

  const sizes = {
    md: 'px-6 py-3 text-lg',
    lg: 'px-10 py-5 text-2xl',
    xl: 'px-14 py-7 text-4xl font-black',
  };

  const handleClick = () => {
    playPop();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${colors[color]} 
        ${sizes[size]} 
        rounded-3xl border-b-8 active:border-b-0 active:translate-y-2 
        transition-all duration-75 flex items-center justify-center gap-3
        bounce-on-hover shadow-xl uppercase tracking-wider font-bold
        ${className}
      `}
    >
      {icon}
      {children}
    </button>
  );
};
