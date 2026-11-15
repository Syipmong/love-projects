import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, AlertCircle, Bookmark, ShieldAlert } from 'lucide-react';
import { NO_BUTTON_TEXTS, CUTE_REACTIONS } from '../config';
import { playEvasionSound, playPopSound } from '../utils/audio';

interface ProposalCardProps {
  partnerName: string;
  senderName: string;
  question: string;
  subheading?: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  partnerName,
  senderName,
  question,
  subheading,
  onAccept,
  onDecline,
}) => {
  const [noCount, setNoCount] = useState(0);
  const [noPosition, setNoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDodging, setIsDodging] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

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

  // Evasive movement across the whole screen ensuring it NEVER hides behind YES
  const dodgeButton = () => {
    setIsDodging(true);
    playEvasionSound();
    setNoCount((prev) => prev + 1);

    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;

    // Button dimensions estimate
    const btnW = 100;
    const btnH = 40;

    // Safe bounds across viewport
    const minX = 24;
    const maxX = Math.max(minX + 50, vpWidth - btnW - 24);
    const minY = 80; // keep below top bar
    const maxY = Math.max(minY + 50, vpHeight - btnH - 60);

    // Pick random position across viewport
    let randomX = Math.random() * (maxX - minX) + minX;
    let randomY = Math.random() * (maxY - minY) + minY;

    // When YES gets huge in center screen, push NO towards edges/corners so it's clearly visible
    if (noCount >= 4) {
      const centerX = vpWidth / 2;
      const centerY = vpHeight / 2;
      // If generated coord is too close to center, push to one of the 4 outer perimeter zones
      if (Math.abs(randomX - centerX) < 140 && Math.abs(randomY - centerY) < 140) {
        randomX = Math.random() > 0.5 ? Math.random() * 120 + minX : maxX - Math.random() * 120;
        randomY = Math.random() > 0.5 ? Math.random() * 80 + minY : maxY - Math.random() * 80;
      }
    }

    setNoPosition({
      x: Math.round(randomX),
      y: Math.round(randomY)
    });
  };

  // Yes grows massive to outgrow and cover the screen
  const yesScale = 1 + Math.min(noCount * 0.38, 5.5);
  // No gets tinier and tinier
  const noScale = Math.max(0.35, 1 - noCount * 0.08);
  const noText = NO_BUTTON_TEXTS[Math.min(noCount, NO_BUTTON_TEXTS.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto px-4 z-10 relative"
    >
      <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center border-2 border-pink-200/80">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm">
          <Bookmark className="w-3.5 h-3.5 text-rose-500" />
          <span>Chapter 5: The Question for {partnerName}</span>
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
        </div>

        {/* Mascot */}
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
              alt="Cute mascot"
              className="w-full h-full object-contain pointer-events-none select-none drop-shadow-md"
              loading="eager"
            />
          </motion.div>
        </div>

        {/* Question */}
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

        {/* The Action Arena */}
        <div className="relative min-h-[160px] flex items-center justify-center pt-2">
          {/* YES BUTTON: Expands and outgrows */}
          <motion.button
            onClick={() => {
              playPopSound();
              onAccept();
            }}
            animate={{
              scale: yesScale,
            }}
            whileHover={{ scale: yesScale * 1.04 }}
            whileTap={{ scale: yesScale * 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            className="relative z-10 px-8 py-4 sm:px-10 sm:py-5 rounded-full font-bold text-white shadow-2xl flex items-center justify-center gap-3 cursor-pointer transition-colors duration-200"
            style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
              boxShadow: `0 15px 40px rgba(244, 63, 94, ${Math.min(0.4 + noCount * 0.08, 0.9)})`,
              fontSize: `${Math.min(1.2 + noCount * 0.15, 2.4)}rem`,
              maxWidth: noCount >= 8 ? '90vw' : 'auto',
            }}
          >
            <Heart className="w-6 h-6 fill-white animate-pulse" />
            <span className="tracking-wide">YES!</span>
            <Heart className="w-6 h-6 fill-white" />
          </motion.button>

          {/* RUNAWAY NO BUTTON: Positioned with FIXED so it's always in front and never hidden */}
          <motion.button
            ref={noButtonRef}
            onClick={dodgeButton}
            onMouseEnter={dodgeButton}
            onTouchStart={(e) => {
              e.preventDefault();
              dodgeButton();
            }}
            animate={
              isDodging
                ? {
                    left: `${noPosition.x}px`,
                    top: `${noPosition.y}px`,
                    scale: noScale,
                  }
                : {
                    scale: 1,
                  }
            }
            transition={{
              type: 'spring',
              stiffness: 480,
              damping: 24,
              mass: 0.4
            }}
            className={`px-4 py-2 rounded-full font-medium text-slate-700 bg-white/95 hover:bg-slate-50 border border-slate-300 shadow-xl cursor-pointer select-none whitespace-nowrap transition-colors ${
              isDodging ? 'fixed' : 'ml-6'
            }`}
            style={{
              zIndex: 9999, // ALWAYS above the Yes button, never hidden behind
              fontSize: `${Math.max(0.7, 0.95 - noCount * 0.05)}rem`,
            }}
          >
            {noText}
          </motion.button>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-rose-100/80 flex items-center justify-between text-xs text-rose-400 font-medium">
          <span>From: {senderName}</span>
          <span>{noCount > 0 ? `Playful teases: ${noCount}` : 'Choose with your heart'}</span>
        </div>
      </div>

      {/* ROMANTIC RESPECTFUL ESCAPE HATCH (when she genuinely wants to say no) */}
      <AnimatePresence>
        {noCount >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="mt-6 text-center z-30"
          >
            <div className="inline-block bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl border border-rose-200 shadow-lg text-xs text-slate-600 max-w-md mx-auto">
              <p className="mb-1.5 text-slate-500 font-normal">
                I never want to force you. If your heart is truly saying no, I promise to always respect and cherish you.
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
