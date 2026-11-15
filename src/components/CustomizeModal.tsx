import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Copy, Check, Heart } from 'lucide-react';
import { ProposalConfig } from '../types';

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProposalConfig;
  onSave: (updated: ProposalConfig) => void;
}

const QUESTION_PRESETS = [
  "Will you be my girlfriend?",
  "Will you go out with me?",
  "Will you be my Valentine?",
  "Will you marry me?",
  "Can I be the luckiest person and call you mine?"
];

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [partnerName, setPartnerName] = useState(config.partnerName);
  const [senderName, setSenderName] = useState(config.senderName);
  const [question, setQuestion] = useState(config.proposalQuestion);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...config,
      partnerName: partnerName.trim() || "My Dearest",
      senderName: senderName.trim() || "Yours Truly",
      proposalQuestion: question.trim() || "Will you be my girlfriend?"
    });
    onClose();
  };

  const getShareableUrl = () => {
    const origin = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    if (partnerName) params.set('to', partnerName);
    if (senderName) params.set('from', senderName);
    if (question) params.set('q', question);
    return `${origin}?${params.toString()}`;
  };

  const copyCustomUrl = () => {
    const url = getShareableUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-rose-200 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-6">
            <div className="flex items-center gap-2 text-rose-600">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-bold font-romantic text-slate-800">
                Personalize Your Proposal 💕
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Her Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Her Name / Nickname
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g. Maya, Sophia, My Princess..."
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 text-sm"
              />
            </div>

            {/* Your Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Your Name / Nickname
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Alex, Yours Truly..."
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 text-sm"
              />
            </div>

            {/* The Question */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                The Big Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Will you be my girlfriend?"
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 text-sm mb-2"
              />

              {/* Preset quick buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUESTION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuestion(preset)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                      question === preset
                        ? 'bg-rose-500 text-white border-rose-500 font-semibold'
                        : 'bg-rose-50/70 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Shareable URL quick generator */}
            <div className="pt-2 bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100">
              <div className="flex items-center justify-between text-xs font-semibold text-rose-700 mb-1.5">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  Instant Shareable Link
                </span>
                <span className="text-[10px] text-slate-400">Contains these custom names</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareableUrl()}
                  className="w-full bg-white px-3 py-1.5 rounded-lg border border-rose-200 text-xs text-slate-600 select-all"
                />
                <button
                  type="button"
                  onClick={copyCustomUrl}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-rose-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold shadow-md transition-all"
              >
                Apply Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

