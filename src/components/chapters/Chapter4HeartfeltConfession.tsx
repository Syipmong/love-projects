import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquareHeart, CheckCircle2, Lock } from 'lucide-react';
import { ProposalConfig } from '../../types';
import { RomanticQuizCard } from '../RomanticQuizCard';
import { playPopSound } from '../../utils/audio';
import { trackEvent } from '../../services/api';

interface Chapter4HeartfeltConfessionProps {
  config: ProposalConfig;
  onUnlockNext: (unlocked: boolean) => void;
  proposalId?: string;
}

export const Chapter4HeartfeltConfession: React.FC<Chapter4HeartfeltConfessionProps> = ({
  config,
  onUnlockNext,
  proposalId = 'default'
}) => {
  const [heartPumps, setHeartPumps] = useState(1);
  const [hasInteracted, setHasInteracted] = useState(false);

  const pumpHeart = () => {
    playPopSound();
    const nextBeats = heartPumps + 1;
    setHeartPumps(nextBeats);
    setHasInteracted(true);
    onUnlockNext(true);
    trackEvent('heart_tapped', 3, { heart_beats: nextBeats }, proposalId);
  };

  const handleQuizAnswered = (opt: { text: string; icon: string; response: string }) => {
    setHasInteracted(true);
    onUnlockNext(true);
    trackEvent(
      'quiz_answered',
      3,
      {
        question: config.quiz?.prompt,
        selected_option: opt.text,
        reaction: opt.response
      },
      proposalId
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto px-4 z-10"
    >
      <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border-2 border-rose-200/90 text-center">
        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold tracking-wider uppercase mb-3">
          <MessageSquareHeart className="w-3.5 h-3.5" />
          <span>Chapter 4: The Unspoken Feeling</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-romantic mb-3">
          What I've Wanted To Tell You
        </h2>

        {/* Interactive glowing heart tap */}
        <div className="my-4 flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={pumpHeart}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center shadow-lg cursor-pointer glow-pink transition-transform"
            title="Tap my heart"
          >
            <Heart
              className="w-8 h-8 sm:w-10 sm:h-10 fill-white"
              style={{
                transform: `scale(${1 + Math.min(heartPumps * 0.05, 0.4)})`
              }}
            />
          </motion.button>
          <span className="text-[11px] text-rose-500 font-semibold mt-2">
            Tap the heart: {heartPumps} beats for you
          </span>
        </div>

        {/* Narrative Confession text */}
        <div className="space-y-4 text-left bg-white/80 p-6 sm:p-8 rounded-2xl border border-rose-100 shadow-sm leading-relaxed text-slate-700 text-sm sm:text-base font-normal">
          {config.confessionParagraphs.map((para, i) => (
            <p key={i} className="leading-relaxed">
              {para}
            </p>
          ))}
          <div className="pt-2 text-right font-handwriting text-2xl text-rose-600 font-bold">
            — Always, {config.senderName}
          </div>
        </div>

        {/* Interactive Romantic Mini-Quiz */}
        {config.quiz && (
          <RomanticQuizCard quiz={config.quiz} onAnswer={handleQuizAnswered} />
        )}

        {/* Anti-skip indicator */}
        <div className="mt-6 flex justify-center">
          {hasInteracted ? (
            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready for the big question! Proceed below</span>
            </span>
          ) : (
            <span className="text-rose-500 text-xs font-medium flex items-center gap-1 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Answer the question or tap the heart above to unlock the next chapter</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
