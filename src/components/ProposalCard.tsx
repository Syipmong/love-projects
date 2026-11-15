import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, AlertCircle } from 'lucide-react';
import { NO_BUTTON_TEXTS, CUTE_REACTIONS } from '../config';
import { playEvasionSound, playPopSound } from '../utils/audio';

interface ProposalCardProps {
  partnerName: string;
  senderName: string;
  question: string;
  subheading?: string;
  onAccept: () => void;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  partnerName,
  senderName,
  question,
  subheading,
  onAccept,
}) => {
  const [noCount, setNoCount] = useState(0);
  const [noPosition, setNoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDodging, setIsDodging] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  // Determine current mascot based on tease count
  const getMascot = () => {
    if (noCount === 0) return CUTE_REACTIONS.asking;
    if (noCount <= 2) return CUTE_REACTIONS.pleading1;
    if (noCount <= 5) return CUTE_REACTIONS.pleading2;
    if (noCount <= 8) return CUTE_REACTIONS.pleading3;
    return CUTE_REACTIONS.surprised;
  };

  // Teasing speech bubble text
  useEffect(() => {
    if (noCount === 0) {
      setSpeechBubble(null);
    } else if (noCount === 1) {
      setSpeechBubble("Wait, did your finger slip? 🥺");
    } else if (noCount === 2) {
      setSpeechBubble("Look how pretty that YES button is! ✨");
    } else if (noCount === 3) {
      setSpeechBubble("I promise unlimited snacks and cuddles! 🍩");
    } else if (noCount === 5) {
      setSpeechBubble("You're making the bear cry! 😭");
    } else if (noCount >= 7) {
      setSpeechBubble("Resistance is futile, say YES! 💕");
    }
  }, [noCount]);

  // Evasive run-away movement logic
  const dodgeButton = () => {
    setIsDodging(true);
    playEvasionSound();
    setNoCount((prev) => prev + 1);

    // Calculate boundary limits relative to the card container
    if (containerRef.current && noButtonRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const btnRect = noButtonRef.current.getBoundingClientRect();

      // Safe bounds within the interactive container
      const padding = 20;
      const maxX = (containerRect.width / 2) - (btnRect.width / 2) - padding;
      const maxY = 130;

      // Generate a new offset away from the current one
      const randomX = (Math.random() * 2 - 1) * maxX;
      const randomY = (Math.random() * 2 - 1) * maxY;

      setNoPosition({
        x: Math.round(randomX),
        y: Math.round(randomY)
      });
    } else {
      // Fallback relative dodge
      const randomX = (Math.random() - 0.5) * 240;
      const randomY = (Math.random() - 0.5) * 160;
      setNoPosition({ x: randomX, y: randomY });
    }
  };

  // Dynamic sizing based on evasions
  const yesScale = 1 + Math.min(noCount * 0.22, 2.5);
  const noScale = Math.max(0.65, 1 - noCount * 0.05);
  const noText = NO_BUTTON_TEXTS[Math.min(noCount, NO_BUTTON_TEXTS.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto px-4 z-10"
    >
      <div
        ref={containerRef}
        className="glass-card rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center border-2 border-pink-200/80"
      >
        {/* Soft top accent badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Chapter 5: The Question for {partnerName}</span>
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
        </div>

        {/* Mascot with Speech Bubble */}
        <div className="relative flex flex-col items-center justify-center my-3 sm:my-4 min-h-[160px]">
          <AnimatePresence>
            {speechBubble && (
              <motion.div
                key={speechBubble}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.8 }}
                className="absolute -top-6 sm:-top-8 bg-white/95 px-4 py-1.5 rounded-2xl shadow-lg border border-pink-200 text-rose-600 font-semibold text-xs sm:text-sm flex items-center gap-1.5 z-20 pointer-events-none"
              >
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{speechBubble}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            key={getMascot()}
            initial={{ scale: 0.85, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl flex items-center justify-center overflow-hidden bg-rose-50/50 p-2 shadow-inner border border-rose-100"
          >
            <img
              src={getMascot()}
              alt="Cute love mascot"
              className="w-full h-full object-contain pointer-events-none select-none drop-shadow-md"
              loading="eager"
            />
          </motion.div>
        </div>

        {/* Romantic Proposal Question */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-rose-600 tracking-tight leading-tight drop-shadow-sm font-romantic">
            {question}
          </h1>
          {subheading && (
            <p className="text-slate-600 text-sm sm:text-base font-medium max-w-md mx-auto">
              {subheading}
            </p>
          )}
        </div>

        {/* Interactive Buttons Playground */}
        <div className="relative min-h-[140px] flex items-center justify-center gap-6 sm:gap-8 flex-wrap pt-2">
          {/* YES BUTTON */}
          <motion.button
            onClick={() => {
              playPopSound();
              onAccept();
            }}
            animate={{
              scale: yesScale,
            }}
            whileHover={{ scale: yesScale * 1.05 }}
            whileTap={{ scale: yesScale * 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="relative z-10 px-8 py-3.5 sm:px-10 sm:py-4 rounded-full font-bold text-white shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200"
            style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
              boxShadow: '0 10px 30px rgba(244, 63, 94, 0.45)',
              fontSize: `${Math.min(1.1 + noCount * 0.12, 1.8)}rem`,
            }}
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white animate-pulse" />
            <span className="tracking-wide">YES!</span>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>

          {/* RUNAWAY NO BUTTON */}
          <motion.button
            ref={noButtonRef}
            onClick={dodgeButton}
            onMouseEnter={dodgeButton}
            onTouchStart={(e) => {
              e.preventDefault();
              dodgeButton();
            }}
            animate={{
              x: noPosition.x,
              y: noPosition.y,
              scale: noScale,
            }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 24,
              mass: 0.5
            }}
            className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-medium text-slate-600 bg-white/90 hover:bg-slate-50 border border-slate-200 shadow-md cursor-pointer transition-colors duration-150 select-none whitespace-nowrap ${
              isDodging ? 'absolute' : 'relative'
            }`}
            style={{
              zIndex: 5,
              fontSize: '0.95rem',
            }}
          >
            {noText}
          </motion.button>
        </div>

        {/* Footer gentle hint */}
        <div className="mt-8 pt-4 border-t border-rose-100/80 flex items-center justify-between text-xs text-rose-400 font-medium">
          <span>From: {senderName}</span>
          <span>{noCount > 0 ? `Attempts to resist: ${noCount} 🤭` : 'Choose wisely 💕'}</span>
        </div>
      </div>
    </motion.div>
  );
};

