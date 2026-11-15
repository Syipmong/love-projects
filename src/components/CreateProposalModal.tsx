import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, User, ArrowRight, RefreshCw, MessageSquareHeart } from 'lucide-react';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (partnerName: string, senderName: string, question: string) => Promise<void>;
  defaultSenderName?: string;
}

const QUESTION_PRESETS = [
  "Will you be my girlfriend?",
  "Will you go out with me?",
  "Will you be my Valentine?",
  "Will you marry me?",
  "Can I call you mine forever?"
];

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultSenderName = 'Yours Truly'
}) => {
  const [partnerName, setPartnerName] = useState('');
  const [senderName, setSenderName] = useState(defaultSenderName);
  const [question, setQuestion] = useState('Will you be my girlfriend?');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      setError("Please enter your partner's name or nickname.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(partnerName.trim(), senderName.trim() || 'Yours Truly', question.trim());
      setPartnerName('');
      onClose();
    } catch {
      setError('Failed to create proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.35 }}
          className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg font-romantic text-slate-900 leading-tight">
                  Create New Proposal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate a unique 6-character story link
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={submitting}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Partner Name Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Partner's Name / Nickname <strong className="text-rose-500">*</strong></span>
              </label>
              <input
                type="text"
                autoFocus
                required
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g. Maya, Sophia, My Princess..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-900 transition-all font-medium"
              />
            </div>

            {/* Sender Name Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Your Name / Nickname</span>
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Liam, Yours Truly..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-900 transition-all"
              />
            </div>

            {/* Proposal Question */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MessageSquareHeart className="w-3.5 h-3.5 text-rose-500" />
                <span>The Big Question</span>
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-900 transition-all font-semibold"
              />

              {/* Question Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUESTION_PRESETS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuestion(q)}
                    className={`px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
                      question === q
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/60'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Proposal...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Generate Proposal Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

