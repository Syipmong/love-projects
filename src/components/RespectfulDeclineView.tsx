import React from 'react';
import { motion } from 'framer-motion';
import { Heart, RotateCcw, Sparkles } from 'lucide-react';
import { ProposalConfig } from '../types';

interface RespectfulDeclineViewProps {
  config: ProposalConfig;
  onReset: () => void;
  onCreateOwn?: () => void;
}

export const RespectfulDeclineView: React.FC<RespectfulDeclineViewProps> = ({ config, onReset, onCreateOwn }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto px-4 z-10 text-center"
    >
      <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border-2 border-rose-200/90 text-left">
        <div className="flex items-center justify-center my-3">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shadow-inner">
            <Heart className="w-8 h-8 fill-rose-200 text-rose-500" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 font-romantic text-center mb-4">
          My Respect For You Is Always First
        </h1>

        <div className="space-y-4 bg-white/80 p-6 rounded-2xl border border-rose-100 text-slate-700 text-sm sm:text-base leading-relaxed">
          {config.respectfulRejectionMessage?.map((para, i) => (
            <p key={i}>{para}</p>
          )) || (
            <p>
              I want you to know how deeply I appreciate your honesty. Real care and affection
              can never be pressured. Thank you for walking through this story with me, and
              thank you for being such a wonderful person.
            </p>
          )}

          <div className="pt-2 text-right font-handwriting text-2xl text-rose-600 font-bold">
            — With all my care, {config.senderName}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={onReset}
            className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Return to Start</span>
          </button>
        </div>

        {/* Create Your Own Invitation */}
        {onCreateOwn && (
          <div className="mt-8 pt-6 border-t border-rose-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Want to create a personal love story or proposal for someone special?
            </p>
            <button
              onClick={onCreateOwn}
              className="px-5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Your Own Proposal</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
