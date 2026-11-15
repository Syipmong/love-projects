import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Eye } from 'lucide-react';
import { ProposalConfig, MemoryPolaroid } from '../../types';
import { playPopSound } from '../../utils/audio';

interface Chapter3PolaroidsProps {
  config: ProposalConfig;
}

export const Chapter3Polaroids: React.FC<Chapter3PolaroidsProps> = ({ config }) => {
  const [selectedPolaroid, setSelectedPolaroid] = useState<MemoryPolaroid | null>(null);

  const handleSelect = (p: MemoryPolaroid) => {
    playPopSound();
    setSelectedPolaroid(selectedPolaroid?.id === p.id ? null : p);
  };

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
          <span>Chapter 3: The Little Things</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-romantic mb-2">
          What My Heart Remembers 📸
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mb-6">
          It’s rarely the grand gestures. It's the small, quiet things you do that captured me completely.
          <span className="block text-rose-500 font-semibold mt-1">Tap each memory card to reveal my secret note!</span>
        </p>

        {/* Polaroids Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
          {config.polaroids.map((p) => {
            const isSelected = selectedPolaroid?.id === p.id;
            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(p)}
                className={`bg-white rounded-2xl p-3 sm:p-4 shadow-md border-2 transition-all cursor-pointer flex flex-col text-left ${
                  isSelected
                    ? 'border-rose-500 ring-2 ring-rose-200'
                    : 'border-rose-100 hover:border-rose-300'
                }`}
              >
                <div className="w-full h-28 sm:h-36 rounded-xl overflow-hidden mb-2.5 bg-rose-50 relative group">
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-2">
                    <span className="text-white text-[11px] font-bold flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{isSelected ? 'Open' : 'Tap to read'}</span>
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-xs sm:text-sm font-romantic mb-0.5">
                  {p.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {p.caption}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Secret Note Modal / Drawer */}
        <AnimatePresence>
          {selectedPolaroid && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-rose-50/90 rounded-2xl p-4 sm:p-5 border border-rose-200 text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  Note for: {selectedPolaroid.title}
                </span>
                <button
                  onClick={() => setSelectedPolaroid(null)}
                  className="text-xs text-rose-400 hover:text-rose-600 font-bold"
                >
                  Close ✕
                </button>
              </div>
              <p className="text-slate-700 font-handwriting text-lg sm:text-xl leading-relaxed">
                "{selectedPolaroid.secretNote}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

