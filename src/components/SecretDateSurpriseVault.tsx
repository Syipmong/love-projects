import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, KeyRound, MapPin, Compass, Heart, CheckCircle2 } from 'lucide-react';
import { SecretDateSurprise } from '../types';
import { playPopSound, playCelebrationSound } from '../utils/audio';

interface SecretDateSurpriseVaultProps {
  surprise: SecretDateSurprise;
}

export const SecretDateSurpriseVault: React.FC<SecretDateSurpriseVaultProps> = ({ surprise }) => {
  const [inputCode, setInputCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputCode.trim().toLowerCase();
    const validCodes = [surprise.code.toLowerCase(), 'yes', 'forever', 'love'];

    if (validCodes.includes(cleanInput)) {
      playCelebrationSound();
      setIsUnlocked(true);
      setErrorMsg(false);
    } else {
      playPopSound();
      setErrorMsg(true);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/70 to-rose-50/70 my-6">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs tracking-wider uppercase mb-2">
          {isUnlocked ? <Unlock className="w-3.5 h-3.5 text-amber-600" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
          <span>Secret Date Mystery Vault</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 font-romantic">
          {isUnlocked ? "Your Surprise Is Unlocked!" : "A Hidden Surprise Awaits You"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
          {isUnlocked
            ? "Here are the secret details for our very first official date together."
            : surprise.hint}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.form
            key="lock-form"
            onSubmit={handleUnlock}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-sm mx-auto flex flex-col items-center gap-3 mt-4"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  setErrorMsg(false);
                }}
                placeholder="Type 'yes' or secret word..."
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-amber-200 bg-white/90 text-center text-sm font-semibold text-slate-800 focus:outline-none focus:border-amber-400 placeholder:text-slate-400"
              />
              <KeyRound className="w-4 h-4 text-amber-400 absolute right-3.5 top-3" />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-500 font-semibold">
                Try typing "yes" or "forever"
              </p>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Secret Plan</span>
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="unlocked-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white/95 rounded-2xl p-6 border-2 border-amber-200 shadow-md text-left max-w-lg mx-auto space-y-4"
          >
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Reserved With Love</span>
              </div>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-romantic text-slate-800 mb-1">
                {surprise.title}
              </h3>
              <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{surprise.location}</span>
              </p>
            </div>

            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed bg-amber-50/60 p-4 rounded-xl border border-amber-100">
              {surprise.details}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
