import React from 'react';
import { Palette } from 'lucide-react';
import { AppTheme } from '../types';
import { playPopSound } from '../utils/audio';

interface ThemeSelectorProps {
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

const THEMES: { id: AppTheme; label: string; dotColor: string }[] = [
  { id: 'rose', label: 'Rose', dotColor: 'bg-rose-400' },
  { id: 'champagne', label: 'Gold', dotColor: 'bg-amber-400' },
  { id: 'lavender', label: 'Lavender', dotColor: 'bg-purple-400' },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="flex items-center gap-1 bg-white/85 backdrop-blur-md p-1 rounded-full border border-rose-100/90 shadow-xs text-xs">
      <div className="pl-1.5 pr-0.5 text-rose-400">
        <Palette className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center gap-1">
        {THEMES.map((t) => {
          const isActive = currentTheme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                playPopSound();
                onThemeChange(t.id);
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                isActive
                  ? 'bg-rose-500 text-white font-bold shadow-sm scale-105'
                  : 'text-slate-600 hover:bg-rose-50/70'
              }`}
              title={`Switch to ${t.label} theme`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${t.dotColor} ${isActive ? 'ring-1 ring-white' : ''} shrink-0`} />
              <span className="text-[11px] hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

