import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Activity,
  Heart,
  Mail,
  Share2,
  Clock,
  CheckCircle2,
  RefreshCw,
  Check,
  BarChart3
} from 'lucide-react';
import { fetchDashboardData, saveProposal } from '../services/api';
import { ProposalConfig } from '../types';

interface CreatorDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId?: string;
  config: ProposalConfig;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  isOpen,
  onClose,
  proposalId = 'default',
  config
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [creatorEmail, setCreatorEmail] = useState('');
  const [savedEmailMsg, setSavedEmailMsg] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchDashboardData(proposalId);
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, proposalId]);

  if (!isOpen) return null;

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorEmail) return;

    await saveProposal({
      id: proposalId,
      creator_email: creatorEmail,
      partner_name: config.partnerName,
      sender_name: config.senderName,
      question: config.proposalQuestion
    });

    setSavedEmailMsg(true);
    setTimeout(() => setSavedEmailMsg(false), 3000);
    loadData();
  };

  const shareUrl = window.location.origin + window.location.pathname;

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isAccepted = data?.latestResponse?.answer === 'yes';
  const isDeclined = data?.latestResponse?.answer === 'no';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-rose-200 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-6 shrink-0">
          <div className="flex items-center gap-2 text-rose-600">
            <BarChart3 className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-xl font-bold font-romantic text-slate-800">
                Creator Live Analytics & Metrics
              </h2>
              <p className="text-xs text-slate-500">Live PostgreSQL Database & Activity Feed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Refresh metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-6 pr-1">
          {/* Main Status Banner */}
          <div
            className={`p-5 rounded-2xl border-2 flex items-center justify-between gap-4 ${
              isAccepted
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : isDeclined
                ? 'bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                Current Outcome Status
              </span>
              <div className="text-xl sm:text-2xl font-black font-romantic mt-0.5">
                {isAccepted
                  ? 'SHE SAID YES! 🎉🥰'
                  : isDeclined
                  ? 'Responded: Respectful Decline'
                  : 'In Progress / Still Exploring'}
              </div>
              <p className="text-xs mt-1 opacity-90">
                {isAccepted
                  ? 'Congratulations! Her response was recorded in PostgreSQL.'
                  : isDeclined
                  ? 'Honest, caring response recorded.'
                  : 'She has opened the page or is currently reading your story chapters.'}
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-2xl shadow-sm shrink-0">
              {isAccepted ? <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" /> : <Activity className="w-6 h-6 text-rose-400" />}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
              <div className="text-2xl font-black font-romantic text-slate-800">
                {data?.totalEvents || 0}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mt-1">
                Interactions
              </div>
            </div>

            <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 text-center">
              <div className="text-2xl font-black font-romantic text-rose-600">
                {data?.latestResponse?.tease_attempts || 0}
              </div>
              <div className="text-[11px] font-semibold text-rose-500 uppercase tracking-wide mt-1">
                "NO" Tease Chases
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center">
              <div className="text-2xl font-black font-romantic text-emerald-700">
                {isAccepted ? '100%' : 'Reading'}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide mt-1">
                Story Progress
              </div>
            </div>
          </div>

          {/* ZeptoMail Email Notification Setup */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Mail className="w-4 h-4 text-rose-500" />
              <span>ZeptoMail Instant Notifications</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your email below. When she answers or makes a choice, you will receive an immediate transactional email via ZeptoMail!
            </p>
            <form onSubmit={handleSaveEmail} className="flex gap-2">
              <input
                type="email"
                value={creatorEmail}
                onChange={(e) => setCreatorEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
              >
                Save Alert Email
              </button>
            </form>
            {savedEmailMsg && (
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Alert email saved to PostgreSQL database!</span>
              </span>
            )}
          </div>

          {/* Live Activity Timeline */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-800 font-romantic flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>Recent Activity Feed</span>
            </h3>

            <div className="max-h-52 overflow-y-auto space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              {data?.timeline && data.timeline.length > 0 ? (
                data.timeline.map((ev: any) => (
                  <div
                    key={ev.id}
                    className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-slate-700"
                  >
                    <span className="font-semibold text-rose-600">
                      {ev.event_type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ev.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-center py-4">
                  No interactions recorded yet. Send your link to see live events appear here!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-rose-100 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={copyUrl}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Proposal Link'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

