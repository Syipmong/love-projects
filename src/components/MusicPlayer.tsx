import React, { useState } from 'react';
import { VolumeX, Disc } from 'lucide-react';
import { toggleBackgroundMusic } from '../utils/audio';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = () => {
    toggleBackgroundMusic((playing) => {
      setIsPlaying(playing);
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Vinyl Disc Animation */}
      <button
        onClick={handleToggle}
        className={`p-2.5 sm:px-3.5 sm:py-2 rounded-full shadow-md backdrop-blur-md transition-all duration-300 flex items-center gap-2.5 cursor-pointer border ${
          isPlaying
            ? 'bg-rose-500 text-white border-rose-400 glow-pink'
            : 'bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500 border-rose-100'
        }`}
        title={isPlaying ? 'Pause melody' : 'Play romantic melody'}
      >
        {/* Spinning Vinyl Record Icon */}
        <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
          <Disc
            className={`w-5 h-5 ${
              isPlaying ? 'animate-spin text-white' : 'text-slate-500'
            }`}
            style={{ animationDuration: '3s' }}
          />
        </div>

        <span className="text-xs font-semibold hidden sm:inline">
          {isPlaying ? 'Our Melody Playing' : 'Play Melody'}
        </span>

        {/* Audio Wave Visualizer Bars */}
        {isPlaying ? (
          <div className="flex items-end gap-0.5 h-3.5 px-0.5">
            <span className="w-0.5 bg-white rounded-full animate-pulse h-2" />
            <span className="w-0.5 bg-white rounded-full animate-pulse h-3.5" style={{ animationDelay: '0.15s' }} />
            <span className="w-0.5 bg-white rounded-full animate-pulse h-1.5" style={{ animationDelay: '0.3s' }} />
          </div>
        ) : (
          <VolumeX className="w-4 h-4 opacity-70" />
        )}
      </button>
    </div>
  );
};
