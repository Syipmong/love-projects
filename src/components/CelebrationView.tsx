import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Mail,
  MailOpen,
  Award,
  Calendar,
  Gift,
  CheckCircle2,
  Share2,
  RotateCcw,
  Check,
  Printer,
  MessageCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ProposalConfig } from '../types';
import { CUTE_REACTIONS } from '../config';
import { DynamicIcon } from './IconHelper';
import { SecretDateSurpriseVault } from './SecretDateSurpriseVault';
import { fireGrandCelebration } from '../utils/confetti';
import { playPopSound } from '../utils/audio';

interface CelebrationViewProps {
  config: ProposalConfig;
  onReset: () => void;
  onCreateOwn?: () => void;
}

export const CelebrationView: React.FC<CelebrationViewProps> = ({ config, onReset, onCreateOwn }) => {
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [claimedCoupons, setClaimedCoupons] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleCoupon = (id: string) => {
    playPopSound();
    setClaimedCoupons((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handlePrintCertificate = () => {
    playPopSound();
    window.print();
  };

  const sendWhatsAppNotification = () => {
    playPopSound();
    const phone = config.whatsappPhone?.replace(/[^0-9]/g, '') || '';
    const text = encodeURIComponent(`Hey ${config.senderName}... I just walked through our story, and I said YES! ❤️🥰`);
    const waUrl = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(waUrl, '_blank');
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-3xl mx-auto px-4 py-6 z-10 space-y-8"
    >
      {/* Top Victory Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden border-2 border-rose-200">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-500 text-white font-bold text-sm sm:text-base tracking-wide uppercase mb-4 shadow-lg"
        >
          <Heart className="w-4 h-4 fill-white animate-pulse" />
          <span>SHE SAID YES!</span>
          <Heart className="w-4 h-4 fill-white animate-pulse" />
        </motion.div>

        {/* Happy mascot */}
        <div className="flex justify-center my-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 15 }}
            className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl overflow-hidden bg-rose-100/60 p-3 shadow-md border-2 border-rose-200 flex items-center justify-center"
          >
            <img
              src={CUTE_REACTIONS.celebrating}
              alt="Happy celebrating couple"
              className="w-full h-full object-contain pointer-events-none drop-shadow-md"
            />
          </motion.div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-rose-600 mb-2 font-romantic">
          It's Official!
        </h1>
        <p className="text-slate-700 text-base sm:text-lg max-w-lg mx-auto font-medium">
          {config.partnerName} and {config.senderName} are officially together.
          The best decision ever made.
        </p>

        {/* Celebration Action Buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {/* Send Instant WhatsApp / Text */}
          <button
            onClick={sendWhatsAppNotification}
            className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Tell Him I Said YES! 💌</span>
          </button>

          <button
            onClick={() => {
              playPopSound();
              fireGrandCelebration();
            }}
            className="px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>More Confetti!</span>
          </button>

          <button
            onClick={handlePrintCertificate}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-rose-50 text-slate-700 border border-rose-200 font-semibold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Printer className="w-4 h-4 text-rose-500" />
            <span>Save / Print Certificate</span>
          </button>

          <button
            onClick={copyShareLink}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Page'}</span>
          </button>

          <button
            onClick={onReset}
            className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-sm transition-all flex items-center gap-1.5 cursor-pointer"
            title="Relive the proposal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay</span>
          </button>
        </div>
      </div>

      {/* Secret Date Surprise Mystery Vault */}
      {config.secretDateSurprise && (
        <SecretDateSurpriseVault surprise={config.secretDateSurprise} />
      )}

      {/* Official Certificate of Romance Card */}
      <div
        id="official-certificate"
        className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-pink-200 relative overflow-hidden bg-gradient-to-b from-white/95 to-rose-50/90"
      >
        <div className="flex items-center justify-between border-b border-rose-200 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-romantic">
                Official Relationship Certificate
              </h2>
              <p className="text-xs text-slate-500">Issued with unconditional love and zero expiration</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-rose-100/70 text-rose-700 text-xs font-semibold rounded-full">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayFormatted}</span>
          </div>
        </div>

        <div className="bg-white/80 rounded-2xl p-4 sm:p-6 border border-rose-100 shadow-sm text-center space-y-3 sm:space-y-4">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-rose-400 font-bold">This certifies that</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xl sm:text-3xl font-bold text-rose-600 font-handwriting">
            <span className="underline decoration-rose-300 underline-offset-4">{config.partnerName}</span>
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-rose-500 text-rose-500 shrink-0" />
            <span className="underline decoration-rose-300 underline-offset-4">{config.senderName}</span>
          </div>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed max-w-md mx-auto">
            Have officially agreed to share smiles, laughs, late-night talks, good food,
            and an endless adventure together.
          </p>
          <div className="pt-2 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs text-slate-500">
            <div>
              <div className="font-handwriting text-base sm:text-lg text-rose-600 font-bold">{config.senderName}</div>
              <div className="border-t border-slate-300 pt-0.5 text-[10px]">Signature</div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-rose-300 flex items-center justify-center bg-rose-50 text-rose-500 shadow-inner">
              <span className="text-[8px] sm:text-[10px] font-black uppercase text-center leading-none">SEAL OF<br/>LOVE</span>
            </div>
            <div>
              <div className="font-handwriting text-base sm:text-lg text-rose-600 font-bold">{config.partnerName}</div>
              <div className="border-t border-slate-300 pt-0.5 text-[10px]">Partner in Crime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Love Letter with Envelope */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-pink-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 font-romantic mb-1">
            A Letter For You
          </h2>
          <p className="text-sm text-slate-500">
            {isLetterOpen ? 'Read from my heart' : 'Click the envelope to unseal my letter'}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <motion.button
            onClick={() => {
              playPopSound();
              setIsLetterOpen(!isLetterOpen);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full max-w-md p-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-md ${
              isLetterOpen
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-white hover:bg-rose-50/50 border-rose-200 text-rose-600'
            }`}
          >
            {isLetterOpen ? (
              <>
                <MailOpen className="w-6 h-6 text-rose-500 shrink-0" />
                <span className="font-semibold text-base">Close Letter</span>
              </>
            ) : (
              <>
                <Mail className="w-6 h-6 text-rose-500 shrink-0 animate-bounce" />
                <span className="font-semibold text-base">Open My Heartfelt Letter</span>
              </>
            )}
          </motion.button>

          <AnimatePresence>
            {isLetterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="w-full mt-6 bg-[#fffbf5] border-2 border-[#f3e8d2] rounded-2xl p-6 sm:p-8 shadow-inner font-handwriting text-xl sm:text-2xl leading-relaxed text-slate-800"
              >
                <div className="text-rose-600 font-bold text-2xl sm:text-3xl mb-4 font-romantic">
                  {config.letterTitle || `Dear ${config.partnerName},`}
                </div>
                <div className="space-y-4 font-handwriting text-slate-700">
                  {config.letterBody.map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="mt-8 text-right font-handwriting text-2xl text-rose-600 font-bold">
                  Forever yours,<br />
                  <span className="text-3xl">{config.senderName}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reasons Why I Adore You */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-pink-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-600 font-semibold text-xs tracking-wider uppercase mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>From the bottom of my heart</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 font-romantic">
            Little Things I Love About You
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.reasons.map((reason) => (
            <motion.div
              key={reason.id}
              whileHover={{ y: -3, scale: 1.01 }}
              className="bg-white/80 rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-sm flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-inner">
                <DynamicIcon name={reason.icon} className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1 font-romantic">
                  {reason.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-normal">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Redeemable Date Coupons */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-pink-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold text-xs tracking-wider uppercase mb-2">
            <Gift className="w-3.5 h-3.5" />
            <span>Our Upcoming Adventures</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 font-romantic">
            Your First Date Vouchers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Tap to claim any voucher whenever you wish. No expiration date.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.dateCoupons.map((coupon) => {
            const isClaimed = claimedCoupons.includes(coupon.id);
            return (
              <motion.button
                key={coupon.id}
                onClick={() => toggleCoupon(coupon.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-5 rounded-2xl text-left border-2 transition-all relative overflow-hidden cursor-pointer ${
                  isClaimed
                    ? 'bg-emerald-50 border-emerald-300 shadow-inner'
                    : 'bg-white border-pink-200 hover:border-pink-300 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
                    <DynamicIcon name={coupon.icon} className="w-5 h-5" />
                  </div>
                  <div
                    className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                      isClaimed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-100 text-rose-600'
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Claimed!</span>
                      </>
                    ) : (
                      <span>Redeemable</span>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1 font-romantic">
                  {coupon.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {coupon.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Viral Loop / "Create Your Own" Story CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-3xl p-6 sm:p-10 text-center bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-amber-500/10 border-2 border-rose-300 shadow-xl space-y-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Touched By This Story?</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold font-romantic text-slate-900 leading-tight">
          Create Your Own Proposal For Your Favorite Person 💕
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Make someone feel truly special. Craft your personalized romantic chapters, milestones, polaroids with secret notes, and interactive evasive questions with live analytics.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              if (onCreateOwn) onCreateOwn();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create A Free Proposal Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
