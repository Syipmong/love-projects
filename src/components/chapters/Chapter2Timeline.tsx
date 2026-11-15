import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Heart } from 'lucide-react';
import { ProposalConfig, StoryMilestone } from '../../types';
import { playPopSound } from '../../utils/audio';

interface Chapter2TimelineProps {
  config: ProposalConfig;
}

export const Chapter2Timeline: React.FC<Chapter2TimelineProps> = ({ config }) => {
  const [activeMilestone, setActiveMilestone] = useState<StoryMilestone>(
    config.storyMilestones[0]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto px-4 z-10"
    >
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border-2 border-rose-200/90 text-center">
        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Chapter 2: Where It Started</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-romantic mb-2">
          Milestones in My Memory 📖
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mb-6">
          Every love story has turning points. Here are the moments where I quietly fell a little more for you.
        </p>

        {/* Milestone selector pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {config.storyMilestones.map((m, idx) => {
            const isSelected = activeMilestone.id === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  playPopSound();
                  setActiveMilestone(m);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-md scale-105'
                    : 'bg-white hover:bg-rose-50 text-slate-600 border border-rose-200'
                }`}
              >
                <span>{m.emoji}</span>
                <span>{m.tag || `Moment ${idx + 1}`}</span>
              </button>
            );
          })}
        </div>

        {/* Active Milestone Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMilestone.id}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 rounded-2xl p-6 sm:p-8 border border-rose-200 shadow-md text-left relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 mb-3 border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2 text-rose-500">
                <span className="text-2xl">{activeMilestone.emoji}</span>
                <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
                  {activeMilestone.tag}
                </span>
              </div>
              {activeMilestone.date && (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-rose-50 px-2.5 py-1 rounded-full">
                  <Calendar className="w-3 h-3 text-rose-400" />
                  <span>{activeMilestone.date}</span>
                </div>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 font-romantic mb-3">
              {activeMilestone.title}
            </h3>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              {activeMilestone.story}
            </p>

            <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-rose-400">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 fill-rose-400" />
                Held close in my heart
              </span>
              <span className="text-[11px] text-slate-400">Tap other moments above ☝️</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

