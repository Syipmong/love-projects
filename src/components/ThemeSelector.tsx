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
    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md p-1 rounded-full border border-rose-100 shadow-sm text-xs">
      <div className="pl-2 pr-1 text-slate-400">
        <Palette className="w-3.5 h-3.5" />
      </div>
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => {
            playPopSound();
            onThemeChange(t.id);
          }}
          className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
            currentTheme === t.id
              ? 'bg-rose-500 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title={`Switch to ${t.label} theme`}
        >
          <span className={`w-2 h-2 rounded-full ${t.dotColor}`} />
          <span className="text-[11px]">{t.label}</span>
        </button>
      ))}
    </div>
  );
};

