
import React from 'react';

interface MozaAvatarProps {
  isTalking?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const MozaAvatar: React.FC<MozaAvatarProps> = ({ isTalking = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center transition-all duration-300 ${isTalking ? 'scale-110' : 'scale-100'}`}>
      <div className="absolute inset-0 bg-yellow-400 rounded-full comic-border overflow-hidden">
        {/* Simple Banana SVG shape representation */}
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <path 
            d="M30 10 Q 50 0 70 10 Q 90 40 70 80 Q 50 95 30 85 Q 15 70 30 10" 
            fill="#facc15" 
            stroke="black" 
            strokeWidth="3"
          />
          {/* Eyes */}
          <circle cx="45" cy="35" r="5" fill="black" />
          <circle cx="65" cy="35" r="5" fill="black" />
          {/* Mouth */}
          {isTalking ? (
            <path d="M45 60 Q 55 75 65 60" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
          ) : (
            <path d="M45 60 Q 55 65 65 60" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
          )}
          {/* Blush */}
          <circle cx="40" cy="50" r="3" fill="#f87171" opacity="0.6" />
          <circle cx="70" cy="50" r="3" fill="#f87171" opacity="0.6" />
        </svg>
      </div>
      {isTalking && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-bounce">
          TALKING!
        </div>
      )}
    </div>
  );
};

export default MozaAvatar;
