import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import { playPopSound } from '../utils/audio';

interface StoryNavigationProps {
  currentChapter: number;
  totalChapters: number;
  onNext: () => void;
  onPrev: () => void;
  canNext?: boolean;
  nextLabel?: string;
  hideNext?: boolean;
}

const CHAPTER_NAMES = [
  "An Invitation",
  "How It Began",
  "The Little Things",
  "Unspoken Words",
  "The Question",
  "Our Forever"
];

export const StoryNavigation: React.FC<StoryNavigationProps> = ({
  currentChapter,
  totalChapters,
  onNext,
  onPrev,
  canNext = true,
  nextLabel = "Next Chapter",
  hideNext = false
}) => {
  const progressPercent = ((currentChapter + 1) / totalChapters) * 100;

  return (
    <div className="w-full max-w-xl mx-auto px-4 mt-6 z-20">
      {/* Chapter pill indicator & Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-rose-500 font-semibold mb-1.5 px-1">
          <span className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            Chapter {currentChapter + 1} of {totalChapters}: {CHAPTER_NAMES[currentChapter] || "Story"}
          </span>
          <span>{Math.round(progressPercent)}% completed</span>
        </div>

        {/* Progress track */}
        <div className="h-1.5 w-full bg-rose-200/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4">
        {currentChapter > 0 ? (
          <button
            onClick={() => {
              playPopSound();
              onPrev();
            }}
            className="px-4 py-2 rounded-full bg-white/80 hover:bg-white text-slate-600 border border-rose-200 text-xs sm:text-sm font-medium shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:text-rose-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
        ) : (
          <div />
        )}

        {!hideNext && (
          <button
            disabled={!canNext}
            onClick={() => {
              playPopSound();
              onNext();
            }}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
              canNext
                ? 'bg-rose-500 hover:bg-rose-600 text-white hover:scale-105 active:scale-95'
                : 'bg-rose-200 text-rose-400 cursor-not-allowed'
            }`}
          >
            <span>{nextLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

