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
    <div className="flex items-center shrink-0">
      {/* Vinyl Disc Animation */}
      <button
        type="button"
        onClick={handleToggle}
        className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full shadow-xs backdrop-blur-md transition-all duration-300 flex items-center gap-2 cursor-pointer border shrink-0 ${
          isPlaying
            ? 'bg-rose-500 text-white border-rose-400 shadow-rose-200'
            : 'bg-white/85 hover:bg-white text-slate-700 hover:text-rose-500 border-rose-100/90'
        }`}
        title={isPlaying ? 'Pause melody' : 'Play romantic melody'}
      >
        {/* Spinning Vinyl Record Icon */}
        <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shrink-0">
          <Disc
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              isPlaying ? 'animate-spin text-white' : 'text-slate-500'
            }`}
            style={{ animationDuration: '3s' }}
          />
        </div>

        <span className="text-xs font-semibold hidden md:inline">
          {isPlaying ? 'Melody Playing' : 'Play Melody'}
        </span>

        {/* Audio Wave Visualizer Bars */}
        {isPlaying ? (
          <div className="flex items-end gap-0.5 h-3 px-0.5">
            <span className="w-0.5 bg-white rounded-full animate-pulse h-2" />
            <span className="w-0.5 bg-white rounded-full animate-pulse h-3" style={{ animationDelay: '0.15s' }} />
            <span className="w-0.5 bg-white rounded-full animate-pulse h-1.5" style={{ animationDelay: '0.3s' }} />
          </div>
        ) : (
          <VolumeX className="w-3.5 h-3.5 opacity-60" />
        )}
      </button>
    </div>
  );
};
