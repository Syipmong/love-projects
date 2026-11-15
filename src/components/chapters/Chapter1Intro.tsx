import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, BookOpen } from 'lucide-react';
import { ProposalConfig } from '../../types';
import { playPopSound } from '../../utils/audio';

interface Chapter1IntroProps {
  config: ProposalConfig;
  onBegin: () => void;
}

export const Chapter1Intro: React.FC<Chapter1IntroProps> = ({ config, onBegin }) => {
  const [openedEnvelope, setOpenedEnvelope] = useState(false);

  const handleOpen = () => {
    playPopSound();
    setOpenedEnvelope(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto px-4 z-10 text-center"
    >
      <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border-2 border-rose-200/90">
        {/* Soft tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>{config.introBadge}</span>
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
        </div>

        {!openedEnvelope ? (
          /* Sealed Envelope View */
          <div className="py-6 flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.04, rotate: 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpen}
              className="w-64 sm:w-72 bg-gradient-to-br from-rose-100 to-pink-200 p-8 rounded-3xl border-2 border-rose-300 shadow-xl cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/40 border-b border-rose-200/60 [clip-path:polygon(0_0,50%_100%,100%_0)]" />
              
              <div className="my-6 relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                  <Heart className="w-7 h-7 fill-white" />
                </div>
                <p className="mt-3 text-xs uppercase tracking-widest text-rose-700 font-bold">
                  For {config.partnerName}
                </p>
              </div>

              <div className="text-[11px] text-rose-600 font-medium">
                Tap to open this letter 💌
              </div>
            </motion.div>
          </div>
        ) : (
          /* Opened Introduction Letter */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-rose-600 font-romantic leading-tight">
              {config.introTitle}
            </h1>

            <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-normal max-w-md mx-auto">
              {config.introSubtitle}
            </p>

            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-700 text-sm font-handwriting text-xl sm:text-2xl leading-normal">
              "I didn't want to just send a plain text. I wanted to take you on a little walk through what you've meant to me..."
            </div>

            <div className="pt-2">
              <button
                onClick={onBegin}
                className="px-8 py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm sm:text-base shadow-lg transition-all flex items-center gap-2 mx-auto cursor-pointer hover:scale-105 active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>Walk Through Our Story</span>
              </button>
            </div>
          </motion.div>
        )}

        <div className="mt-6 pt-4 border-t border-rose-100 flex items-center justify-between text-xs text-rose-400 font-medium">
          <span>A message from {config.senderName}</span>
          <span>Chapter 1</span>
        </div>
      </div>
    </motion.div>
  );
};

