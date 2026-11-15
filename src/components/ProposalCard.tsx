import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, AlertCircle, Bookmark } from 'lucide-react';
import { NO_BUTTON_TEXTS, CUTE_REACTIONS } from '../config';
import { playEvasionSound, playPopSound } from '../utils/audio';

interface ProposalCardProps {
  partnerName: string;
  senderName: string;
  question: string;
  subheading?: string;
  onAccept: () => void;
  onDecline: () => void;
  onTease?: (attempts: number, speech?: string) => void;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  partnerName,
  senderName,
  question,
  subheading,
  onAccept,
  onDecline,
  onTease,
}) => {
  const [noCount, setNoCount] = useState(0);
  const [noPosition, setNoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDodging, setIsDodging] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const yesBtnRef = useRef<HTMLButtonElement>(null);

  // Mascot progression
  const getMascot = () => {
    if (noCount === 0) return CUTE_REACTIONS.asking;
    if (noCount <= 2) return CUTE_REACTIONS.pleading1;
    if (noCount <= 5) return CUTE_REACTIONS.pleading2;
    if (noCount <= 8) return CUTE_REACTIONS.pleading3;
    return CUTE_REACTIONS.surprised;
  };

  useEffect(() => {
    if (noCount === 0) {
      setSpeechBubble(null);
    } else if (noCount === 1) {
      setSpeechBubble("Wait, did your finger slip?");
    } else if (noCount === 2) {
      setSpeechBubble("Look how big that YES button is!");
    } else if (noCount === 3) {
      setSpeechBubble("I promise unlimited snacks and cozy talks!");
    } else if (noCount === 5) {
      setSpeechBubble("You are making the little bear cry!");
    } else if (noCount >= 7) {
      setSpeechBubble("It's almost covering the whole screen!");
    }
  }, [noCount]);

  // Evasive movement across mobile and desktop viewport (rendered via Portal to prevent container clipping)
  const dodgeButton = () => {
    setIsDodging(true);
    playEvasionSound();
    const nextCount = noCount + 1;
    setNoCount(nextCount);

    if (onTease) {
      onTease(nextCount, speechBubble || undefined);
    }

    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;

    // Approximate button bounds
    const btnW = 95;
    const btnH = 40;

    // Safe margins on mobile (clear notch, bottom bar, and side edges)
    const minX = 20;
    const maxX = Math.max(minX + 30, vpWidth - btnW - 20);
    const minY = 85;
    const maxY = Math.max(minY + 30, vpHeight - btnH - 85);

    let randomX = Math.random() * (maxX - minX) + minX;
    let randomY = Math.random() * (maxY - minY) + minY;

    // Detect YES button position so NO NEVER overlaps or hides behind it
    if (yesBtnRef.current) {
      const yesRect = yesBtnRef.current.getBoundingClientRect();
      const bufLeft = Math.max(0, yesRect.left - 40);
      const bufRight = Math.min(vpWidth, yesRect.right + 40);
      const bufTop = Math.max(0, yesRect.top - 40);
      const bufBottom = Math.min(vpHeight, yesRect.bottom + 40);

      if (
        randomX + btnW > bufLeft &&
        randomX < bufRight &&
        randomY + btnH > bufTop &&
        randomY < bufBottom
      ) {
        // If overlapping YES button, steer NO to outer screen perimeter
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) {
          randomY = minY + Math.random() * 30;
        } else if (edge === 1) {
          randomY = maxY - Math.random() * 30;
        } else if (edge === 2) {
          randomX = minX + Math.random() * 30;
        } else {
          randomX = maxX - Math.random() * 30;
        }
      }
    }

    setNoPosition({
      x: Math.round(Math.max(minX, Math.min(maxX, randomX))),
      y: Math.round(Math.max(minY, Math.min(maxY, randomY)))
    });
  };

  // Dynamic sizing clamped for mobile responsiveness
  const yesScale = 1 + Math.min(noCount * 0.28, 3.8);
  const noScale = Math.max(0.42, 1 - noCount * 0.07);
  const noText = NO_BUTTON_TEXTS[Math.min(noCount, NO_BUTTON_TEXTS.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto px-3 sm:px-4 z-10 relative"
    >
      <div className="glass-card rounded-3xl p-5 sm:p-10 shadow-2xl relative overflow-hidden text-center border-2 border-pink-200/80">
        {/* Top badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] sm:text-xs font-semibold tracking-wide uppercase mb-3 shadow-sm">
          <Bookmark className="w-3 h-3 text-rose-500" />
          <span>Chapter 5: The Question for {partnerName}</span>
          <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
        </div>

        {/* Mascot with Speech Bubble */}
        <div className="relative flex flex-col items-center justify-center my-2 sm:my-4 min-h-[140px] sm:min-h-[160px]">
          <AnimatePresence>
            {speechBubble && (
              <motion.div
                key={speechBubble}
                initial={{ opacity: 0, y: 8, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.85 }}
                className="absolute -top-7 sm:-top-8 bg-white/95 px-3.5 py-1 rounded-2xl shadow-lg border border-pink-200 text-rose-600 font-semibold text-[11px] sm:text-xs flex items-center gap-1.5 z-20 pointer-events-none max-w-[90vw]"
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate">{speechBubble}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            key={getMascot()}
            initial={{ scale: 0.85, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl flex items-center justify-center overflow-hidden bg-rose-50/50 p-2 shadow-inner border border-rose-100"
          >
            <img
              src={getMascot()}
              alt="Cute mascot"
              className="w-full h-full object-contain pointer-events-none select-none drop-shadow-md"
              loading="eager"
            />
          </motion.div>
        </div>

        {/* Romantic Proposal Question */}
        <div className="space-y-1.5 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-rose-600 tracking-tight leading-tight drop-shadow-sm font-romantic px-1">
            {question}
          </h1>
          {subheading && (
            <p className="text-slate-600 text-xs sm:text-base font-medium max-w-md mx-auto px-2">
              {subheading}
            </p>
          )}
        </div>

        {/* Interactive Buttons Arena */}
        <div className="relative min-h-[130px] sm:min-h-[150px] flex items-center justify-center pt-2">
          {/* YES BUTTON */}
          <motion.button
            ref={yesBtnRef}
            onClick={() => {
              playPopSound();
              onAccept();
            }}
            animate={{
              scale: yesScale,
            }}
            whileHover={{ scale: yesScale * 1.03 }}
            whileTap={{ scale: yesScale * 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            className="relative z-10 px-7 py-3.5 sm:px-10 sm:py-4 rounded-full font-bold text-white shadow-2xl flex items-center justify-center gap-2 sm:gap-3 cursor-pointer transition-colors max-w-[85vw]"
            style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
              boxShadow: `0 12px 35px rgba(244, 63, 94, ${Math.min(0.4 + noCount * 0.08, 0.85)})`,
              fontSize: `${Math.min(1.1 + noCount * 0.12, 1.8)}rem`,
            }}
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white animate-pulse shrink-0" />
            <span className="tracking-wide">YES!</span>
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white shrink-0" />
          </motion.button>

          {/* INLINE NO BUTTON (Initial resting state) */}
          {!isDodging && (
            <motion.button
              ref={noButtonRef}
              onClick={dodgeButton}
              onMouseEnter={dodgeButton}
              onTouchStart={dodgeButton}
              className="ml-4 sm:ml-6 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-medium text-slate-700 bg-white/95 hover:bg-slate-50 border border-slate-300 shadow-md cursor-pointer select-none whitespace-nowrap transition-colors"
              style={{
                fontSize: '0.9rem',
              }}
            >
              {noText}
            </motion.button>
          )}
        </div>

        {/* RUNAWAY NO BUTTON: Mounted directly to document.body via Portal so it NEVER gets trapped in card transform/overflow-hidden */}
        {typeof document !== 'undefined' && isDodging && createPortal(
          <motion.button
            ref={noButtonRef}
            onClick={dodgeButton}
            onMouseEnter={dodgeButton}
            onTouchStart={dodgeButton}
            animate={{
              left: `${noPosition.x}px`,
              top: `${noPosition.y}px`,
              scale: noScale,
            }}
            transition={{
              type: 'spring',
              stiffness: 480,
              damping: 24,
              mass: 0.4
            }}
            className="fixed px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-rose-700 bg-white/95 hover:bg-rose-50 border-2 border-rose-300 shadow-2xl cursor-pointer select-none whitespace-nowrap transition-colors touch-none"
            style={{
              zIndex: 999999,
              fontSize: `${Math.max(0.68, 0.9 - noCount * 0.04)}rem`,
            }}
          >
            {noText}
          </motion.button>,
          document.body
        )}

        {/* Footer info */}
        <div className="mt-6 pt-3 sm:pt-4 border-t border-rose-100/80 flex items-center justify-between text-[11px] sm:text-xs text-rose-400 font-medium">
          <span>From: {senderName}</span>
          <span>{noCount > 0 ? `Teases: ${noCount}` : 'Choose with your heart'}</span>
        </div>
      </div>

      {/* ROMANTIC RESPECTFUL ESCAPE HATCH */}
      <AnimatePresence>
        {noCount >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 sm:mt-6 text-center z-30 px-2"
          >
            <div className="inline-block bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-rose-200 shadow-md text-[11px] sm:text-xs text-slate-600 max-w-sm mx-auto">
              <p className="mb-1 text-slate-500 font-normal">
                I never want to force you. If your heart is truly saying no, I promise to always respect and care for you.
              </p>
              <button
                onClick={() => {
                  playPopSound();
                  onDecline();
                }}
                className="text-rose-600 font-bold underline underline-offset-4 hover:text-rose-700 cursor-pointer flex items-center justify-center gap-1 mx-auto"
              >
                <span>Tap here to decline gently</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
