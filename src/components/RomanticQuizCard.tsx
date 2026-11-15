import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Heart, CheckCircle2 } from 'lucide-react';
import { RomanticQuiz } from '../types';
import { DynamicIcon } from './IconHelper';
import { playPopSound } from '../utils/audio';

interface RomanticQuizCardProps {
  quiz: RomanticQuiz;
  onAnswer?: (option: { text: string; icon: string; response: string }, index: number) => void;
}

export const RomanticQuizCard: React.FC<RomanticQuizCardProps> = ({ quiz, onAnswer }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleSelect = (idx: number) => {
    playPopSound();
    setSelectedIdx(idx);
    if (onAnswer && quiz.options[idx]) {
      onAnswer(quiz.options[idx], idx);
    }
  };

  return (
    <div className="bg-rose-50/70 border border-rose-200/90 rounded-2xl p-5 sm:p-6 shadow-sm text-left my-6 max-w-xl mx-auto">
      <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-2">
        <HelpCircle className="w-4 h-4 text-rose-500" />
        <span>A Little Question For You</span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-800 font-romantic mb-4">
        {quiz.prompt}
      </h3>

      <div className="space-y-2.5">
        {quiz.options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelect(idx)}
              className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                  : 'bg-white hover:bg-rose-50/80 text-slate-700 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  <DynamicIcon name={opt.icon} className="w-4 h-4" />
                </div>
                <span>{opt.text}</span>
              </div>
              {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 rounded-xl bg-white border border-rose-200 text-slate-700 text-xs sm:text-sm leading-relaxed"
          >
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0 mt-0.5" />
              <p className="font-handwriting text-lg sm:text-xl text-rose-700">
                "{quiz.options[selectedIdx].response}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

