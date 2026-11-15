import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Send,
  Dice5,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Lock,
  MessageCircle,
  Award,
  Camera
} from 'lucide-react';
import { sendAnonymousMessage, getAnonymousUserInfo } from '../services/api';
import { playPopSound } from '../utils/audio';
import { fireGrandCelebration } from '../utils/confetti';

interface AnonymousMessageViewProps {
  handle: string;
  onOpenDashboard?: () => void;
}

const PROMPT_TEMPLATES = [
  { id: 'confession', label: 'Secret Crush', icon: Heart, prompt: 'I have had a quiet crush on you because...' },
  { id: 'ama', label: 'Ask Me Anything', icon: MessageCircle, prompt: 'Be completely honest: what is one thing...' },
  { id: 'compliment', label: 'Secret Compliment', icon: Award, prompt: 'One thing I truly admire about you is...' },
  { id: 'memory', label: 'A Memory We Share', icon: Camera, prompt: 'Do you remember that time when...' },
  { id: 'random', label: 'Wild Card', icon: Dice5, prompt: 'If we could go anywhere together right now...' }
];

const RANDOM_PROMPTS = [
  'What was your very first impression of me?',
  'What is a secret dream you haven’t told anyone?',
  'If you had to describe me in 3 words, what would they be?',
  'What is the kindest thing someone has done for you recently?',
  'Have you ever felt butterflies around someone unexpected?',
  'What is one song that always makes you think of love?',
  'What is your favorite little thing that brings you peace?'
];

export const AnonymousMessageView: React.FC<AnonymousMessageViewProps> = ({
  handle,
  onOpenDashboard
}) => {
  const [userInfo, setUserInfo] = useState<{ handle: string; name: string; exists: boolean }>({
    handle,
    name: handle,
    exists: true
  });
  const [selectedCategory, setSelectedCategory] = useState('confession');
  const [message, setMessage] = useState('');
  const [senderHint, setSenderHint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (handle) {
      getAnonymousUserInfo(handle).then(setUserInfo);
    }
  }, [handle]);

  const handleShufflePrompt = () => {
    playPopSound();
    const random = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    setMessage(random + ' ');
  };

  const handleSelectCategory = (cat: typeof PROMPT_TEMPLATES[0]) => {
    playPopSound();
    setSelectedCategory(cat.id);
    if (!message || PROMPT_TEMPLATES.some((p) => p.prompt === message.trim())) {
      setMessage(cat.prompt);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Please write a message before sending.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await sendAnonymousMessage({
      recipient_handle: handle,
      message: message.trim(),
      prompt_category: selectedCategory,
      sender_hint: senderHint.trim() || undefined
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSent(true);
      playPopSound();
      fireGrandCelebration();
    } else {
      setErrorMsg(res.error || 'Failed to deliver message. Please try again.');
    }
  };

  const handleReset = () => {
    setMessage('');
    setSenderHint('');
    setIsSent(false);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-rose-950 text-white flex flex-col justify-between safe-top-padding safe-bottom-padding px-4 selection:bg-rose-500 selection:text-white">
      {/* Top Bar Branding */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between py-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-purple-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Heart className="w-4 h-4 fill-white text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-purple-300">
              anonymoux
            </span>
            <span className="text-[10px] text-rose-300/70 block -mt-1 font-mono">
              confidential & secret
            </span>
          </div>
        </div>

        {onOpenDashboard && (
          <button
            onClick={onOpenDashboard}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-md border border-white/15 transition-all cursor-pointer text-slate-200"
          >
            Get My Link →
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full z-10">
        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative overflow-hidden"
            >
              {/* Recipient Profile Card Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 via-pink-400 to-purple-500 p-0.5 mx-auto mb-3 shadow-xl">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-black text-xl text-rose-300 font-romantic">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-rose-200 mb-1 border border-white/10">
                  <Lock className="w-3 h-3 text-rose-400" />
                  <span>100% Anonymous Message</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold font-romantic text-white">
                  Send a secret to @{userInfo.handle}
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  They will never know who sent this unless you leave a hint!
                </p>
              </div>

              {/* Prompt category tags */}
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Choose A Vibe</span>
                  <button
                    type="button"
                    onClick={handleShufflePrompt}
                    className="text-rose-300 hover:text-rose-200 flex items-center gap-1 cursor-pointer lowercase text-xs"
                    title="Get a random question"
                  >
                    <Dice5 className="w-3.5 h-3.5" />
                    <span>shuffle idea</span>
                  </button>
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_TEMPLATES.map((cat) => {
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                          selectedCategory === cat.id
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-md'
                            : 'bg-white/5 hover:bg-white/15 text-slate-300 border-white/10'
                        }`}
                      >
                        <CatIcon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <div className="relative">
                    <textarea
                      rows={4}
                      maxLength={300}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your secret message, confession, or honest question..."
                      className="w-full p-4 rounded-2xl bg-white/90 text-slate-900 placeholder:text-slate-400 border border-white/30 focus:border-rose-400 focus:outline-hidden text-base shadow-inner resize-none transition-all"
                    />
                    <span className="absolute bottom-3 right-3 text-[11px] font-mono font-semibold text-slate-400 bg-white/80 px-2 py-0.5 rounded-md">
                      {message.length}/300
                    </span>
                  </div>
                </div>

                {/* Optional Sender Hint */}
                <div>
                  <input
                    type="text"
                    maxLength={60}
                    value={senderHint}
                    onChange={(e) => setSenderHint(e.target.value)}
                    placeholder="Optional hint about who you are (e.g. 'Coffee lover', 'Your seatmate')"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/15 text-white placeholder:text-slate-400 border border-white/20 focus:border-rose-400 focus:outline-hidden text-sm"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-300 bg-rose-950/80 p-2.5 rounded-xl border border-rose-500/30 text-center font-medium">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Secret Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Anonymously</span>
                    </>
                  )}
                </button>
              </form>

              {/* Security reassurance */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-slate-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero IP tracking • 100% confidential</span>
              </div>
            </motion.div>
          ) : (
            /* Sent Confirmation Screen */
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border border-white/20 shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-romantic text-white flex items-center justify-center gap-2">
                  <Send className="w-6 h-6 text-rose-300" />
                  <span>Message Sent Secretly!</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto mt-2 leading-relaxed">
                  Your anonymous note has been delivered safely to <strong>@{userInfo.handle}</strong>'s inbox.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-all cursor-pointer"
                >
                  Send Another Secret Message
                </button>

                {onOpenDashboard && (
                  <button
                    onClick={onOpenDashboard}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Get Your Own Anonymous Link →</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 space-y-1">
        <p className="flex items-center justify-center gap-1 font-medium">
          Powered by <span className="font-bold text-rose-300">anonymoux</span> • Created with endless care
        </p>
      </footer>
    </div>
  );
};
