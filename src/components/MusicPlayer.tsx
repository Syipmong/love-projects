import React, { useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { toggleBackgroundMusic } from '../utils/audio';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = () => {
    toggleBackgroundMusic((playing) => {
      setIsPlaying(playing);
    });
  };

  return (
    <button
      onClick={handleToggle}
      className={`fixed top-4 right-4 z-40 p-3 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
        isPlaying
          ? 'bg-rose-500 text-white border-rose-400 glow-pink'
          : 'bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500 border-rose-100'
      }`}
      title={isPlaying ? 'Mute romantic melody' : 'Play romantic melody'}
    >
      {isPlaying ? (
        <>
          <Music className="w-4 h-4 animate-bounce" />
          <span className="text-xs font-semibold pr-1 hidden sm:inline">Melody On</span>
          <Volume2 className="w-4 h-4" />
        </>
      ) : (
        <>
          <Music className="w-4 h-4" />
          <span className="text-xs font-semibold pr-1 hidden sm:inline">Play Music</span>
          <VolumeX className="w-4 h-4 opacity-70" />
        </>
      )}
    </button>
  );
};

