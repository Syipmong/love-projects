import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Heart, Eye, CheckCircle2, Lock } from 'lucide-react';
import { ProposalConfig, MemoryPolaroid } from '../../types';
import { playPopSound } from '../../utils/audio';
import { trackEvent } from '../../services/api';

interface Chapter3PolaroidsProps {
  config: ProposalConfig;
  onUnlockNext: (unlocked: boolean) => void;
  proposalId?: string;
}

export const Chapter3Polaroids: React.FC<Chapter3PolaroidsProps> = ({ config, onUnlockNext, proposalId = 'default' }) => {
  const [selectedPolaroid, setSelectedPolaroid] = useState<MemoryPolaroid | null>(null);
  const [openedIds, setOpenedIds] = useState<string[]>([]);

  const handleSelect = (p: MemoryPolaroid) => {
    playPopSound();
    const isOpening = selectedPolaroid?.id !== p.id;
    setSelectedPolaroid(isOpening ? p : null);
    if (isOpening) {
      trackEvent(
        'polaroid_opened',
        2,
        { polaroidId: p.id, title: p.title, secret_note_revealed: p.secretNote },
        proposalId
      );
    }

    if (!openedIds.includes(p.id)) {
      const updated = [...openedIds, p.id];
      setOpenedIds(updated);
      if (updated.length >= config.polaroids.length) {
        onUnlockNext(true);
      }
    }
  };

  const isAllOpened = openedIds.length >= config.polaroids.length;

  useEffect(() => {
    onUnlockNext(isAllOpened);
  }, [isAllOpened, onUnlockNext]);

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
          <Camera className="w-3.5 h-3.5" />
          <span>Chapter 3: The Little Things</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-romantic mb-2">
          What My Heart Remembers
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mb-4">
          It is rarely the grand gestures. It's the small, quiet things you do that captured me completely.
        </p>

        {/* Anti-skip pacing banner */}
        <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 border border-rose-200">
          {isAllOpened ? (
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All 4 secret notes unlocked! You can now turn the page</span>
            </span>
          ) : (
            <span className="text-rose-600 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Tap all 4 polaroids to unlock the next chapter ({openedIds.length}/{config.polaroids.length})</span>
            </span>
          )}
        </div>

        {/* Polaroids Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
          {config.polaroids.map((p) => {
            const isSelected = selectedPolaroid?.id === p.id;
            const hasOpened = openedIds.includes(p.id);

            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(p)}
                className={`bg-white rounded-2xl p-3 sm:p-4 shadow-md border-2 transition-all cursor-pointer flex flex-col text-left relative ${
                  isSelected
                    ? 'border-rose-500 ring-2 ring-rose-200'
                    : 'border-rose-100 hover:border-rose-300'
                }`}
              >
                {hasOpened && (
                  <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="w-full h-28 sm:h-36 rounded-xl overflow-hidden mb-2.5 bg-rose-50 relative group">
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-2">
                    <span className="text-white text-[11px] font-bold flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{isSelected ? 'Open' : hasOpened ? 'Read again' : 'Tap to read'}</span>
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
                  className="text-xs text-rose-400 hover:text-rose-600 font-bold cursor-pointer"
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
