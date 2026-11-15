import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { ProposalConfig } from '../../types';
import { playPopSound } from '../../utils/audio';

interface Chapter4HeartfeltConfessionProps {
  config: ProposalConfig;
}

export const Chapter4HeartfeltConfession: React.FC<Chapter4HeartfeltConfessionProps> = ({
  config
}) => {
  const [heartPumps, setHeartPumps] = useState(1);

  const pumpHeart = () => {
    playPopSound();
    setHeartPumps((prev) => prev + 1);
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
          <Sparkles className="w-3.5 h-3.5" />
          <span>Chapter 4: The Unspoken Feeling</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-romantic mb-3">
          What I've Wanted To Tell You 💭
        </h2>

        {/* Interactive glowing heart tap */}
        <div className="my-4 flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
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
            Tap the heart: {heartPumps} beats for you 💕
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

        <div className="mt-6 text-xs text-rose-400 font-medium">
          Ready for the next page? Click below... 🌸
        </div>
      </div>
    </motion.div>
  );
};

