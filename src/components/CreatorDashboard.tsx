import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Activity,
  Heart,
  Share2,
  Clock,
  RefreshCw,
  Check,
  BarChart3,
  User,
  Plus,
  LogOut,
  ArrowRight
} from 'lucide-react';
import {
  loginUser,
  registerUser,
  getCurrentUserProfile,
  getUserProposals,
  createNewProposal,
  fetchDashboardData,
  setStoredToken,
  AuthUser,
  ProposalItem
} from '../services/api';
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
  // Auth State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // User Proposals State
  const [userProposals, setUserProposals] = useState<ProposalItem[]>([]);
  const [selectedProposalSlug, setSelectedProposalSlug] = useState<string>(proposalId);
  const [activeAnalytics, setActiveAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // New Proposal Form
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newSenderName, setNewSenderName] = useState('');
  const [newQuestion, setNewQuestion] = useState('Will you be my girlfriend?');
  const [newCustomSlug, setNewCustomSlug] = useState('');
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  // Copy URL
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Load session on open
  useEffect(() => {
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  const checkAuth = async () => {
    const user = await getCurrentUserProfile();
    setCurrentUser(user);
    if (user) {
      loadProposals();
    }
    loadAnalytics(selectedProposalSlug);
  };

  const loadProposals = async () => {
    const list = await getUserProposals();
    setUserProposals(list);
  };

  const loadAnalytics = async (slugOrId: string) => {
    setAnalyticsLoading(true);
    const data = await fetchDashboardData(slugOrId);
    setActiveAnalytics(data);
    setAnalyticsLoading(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const res =
      authMode === 'login'
        ? await loginUser(emailInput, passwordInput)
        : await registerUser(emailInput, passwordInput, nameInput);

    setAuthLoading(false);

    if (!res.success) {
      setAuthError(res.error || 'Authentication failed');
    } else {
      setCurrentUser(res.user || null);
      loadProposals();
    }
  };

  const handleLogout = () => {
    setStoredToken(null);
    setCurrentUser(null);
    setUserProposals([]);
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName) return;

    const res = await createNewProposal({
      partner_name: newPartnerName,
      sender_name: newSenderName || config.senderName,
      question: newQuestion || config.proposalQuestion,
      custom_slug: newCustomSlug || undefined,
      config_json: config as unknown as Record<string, unknown>
    });

    if (res.success && res.proposal) {
      setCreateMsg('Unique proposal created successfully!');
      setTimeout(() => {
        setCreateMsg(null);
        setIsCreatingNew(false);
      }, 1800);
      loadProposals();
      if (res.proposal.slug) {
        setSelectedProposalSlug(res.proposal.slug);
        loadAnalytics(res.proposal.slug);
      }
    }
  };

  const copyProposalUrl = (slug: string) => {
    const fullUrl = `${window.location.origin}${window.location.pathname}?p=${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  if (!isOpen) return null;

  const isAccepted = activeAnalytics?.latestResponse?.answer === 'yes';
  const isDeclined = activeAnalytics?.latestResponse?.answer === 'no';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-rose-200 my-8 max-h-[92vh] flex flex-col"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-6 shrink-0">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-romantic text-slate-800">
                Creator Dashboard & Proposals
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser ? `Signed in as ${currentUser.name || currentUser.email}` : 'Monitor your unique proposal links & live responses'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-6 pr-1">
          {/* USER NOT LOGGED IN: Authentication Prompt */}
          {!currentUser ? (
            <div className="bg-rose-50/60 p-6 rounded-3xl border border-rose-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <User className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold font-romantic text-slate-800">
                  {authMode === 'login' ? 'Log In to Your Creator Account' : 'Create Your Creator Account'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Create unique personalized links, receive email alerts, and monitor live responses.
                </p>
              </div>

              {authError && (
                <div className="text-xs text-rose-600 font-semibold bg-rose-100 p-2.5 rounded-xl border border-rose-200">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="max-w-xs mx-auto space-y-3 text-left">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-rose-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{authLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Create Free Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="pt-2 text-xs text-slate-500">
                {authMode === 'login' ? (
                  <span>
                    New here?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-rose-600 font-bold underline cursor-pointer"
                    >
                      Create an account
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-rose-600 font-bold underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* USER LOGGED IN: Manage Proposals */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-romantic">
                  Your Unique Proposals ({userProposals.length})
                </h3>
                <button
                  onClick={() => setIsCreatingNew(!isCreatingNew)}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isCreatingNew ? 'Cancel' : 'Create New Proposal'}</span>
                </button>
              </div>

              {/* Create New Proposal Form */}
              <AnimatePresence>
                {isCreatingNew && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleCreateProposal}
                    className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3"
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      Create a Unique Proposal Link
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Partner's Name</label>
                        <input
                          type="text"
                          required
                          value={newPartnerName}
                          onChange={(e) => setNewPartnerName(e.target.value)}
                          placeholder="e.g. Maya"
                          className="w-full px-3 py-1.5 rounded-lg border border-rose-200 text-xs bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Your Name</label>
                        <input
                          type="text"
                          value={newSenderName}
                          onChange={(e) => setNewSenderName(e.target.value)}
                          placeholder={config.senderName}
                          className="w-full px-3 py-1.5 rounded-lg border border-rose-200 text-xs bg-white text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Proposal Question</label>
                      <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Will you be my girlfriend?"
                        className="w-full px-3 py-1.5 rounded-lg border border-rose-200 text-xs bg-white text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Custom Link Slug (Optional)</label>
                      <input
                        type="text"
                        value={newCustomSlug}
                        onChange={(e) => setNewCustomSlug(e.target.value)}
                        placeholder="e.g. for-maya-special"
                        className="w-full px-3 py-1.5 rounded-lg border border-rose-200 text-xs bg-white text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
                    >
                      Generate Unique Link
                    </button>

                    {createMsg && (
                      <p className="text-xs text-emerald-600 font-bold">{createMsg}</p>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Proposals Cards List */}
              <div className="space-y-2">
                {userProposals.map((prop) => {
                  const isSelected = selectedProposalSlug === prop.slug;
                  return (
                    <div
                      key={prop.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-rose-50/80 border-rose-400 shadow-sm'
                          : 'bg-white hover:bg-rose-50/40 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800 font-romantic">
                            For: {prop.partner_name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              prop.latest_answer === 'yes'
                                ? 'bg-emerald-100 text-emerald-700'
                                : prop.latest_answer === 'no'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {prop.latest_answer === 'yes' ? (
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3 fill-rose-600 text-rose-600" />
                                <span>SAID YES!</span>
                              </span>
                            ) : prop.latest_answer === 'no' ? (
                              'Declined'
                            ) : (
                              'In Progress'
                            )}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Link Slug: <code className="text-rose-600 font-mono">?p={prop.slug}</code>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyProposalUrl(prop.slug)}
                          className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedSlug === prop.slug ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                          <span>{copiedSlug === prop.slug ? 'Copied!' : 'Copy Link'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProposalSlug(prop.slug);
                            loadAnalytics(prop.slug);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          View Analytics
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* LIVE ANALYTICS CARD for Selected Proposal */}
          <div className="pt-2 border-t border-rose-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-romantic flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                <span>Live Metrics for: {activeAnalytics?.proposal?.partner_name || 'Selected Proposal'}</span>
              </h3>
              <button
                onClick={() => loadAnalytics(selectedProposalSlug)}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Status Outcome Banner */}
            <div
              className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 ${
                isAccepted
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : isDeclined
                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                  Current Status
                </span>
                <div className="text-lg sm:text-xl font-black font-romantic mt-0.5 flex items-center gap-2">
                  {isAccepted ? (
                    <>
                      <Heart className="w-5 h-5 fill-rose-600 text-rose-600" />
                      <span>SHE SAID YES!</span>
                    </>
                  ) : isDeclined ? (
                    'Responded: Respectful Decline'
                  ) : (
                    'In Progress / Reading Story'
                  )}
                </div>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm shrink-0">
                {isAccepted ? <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" /> : <Activity className="w-5 h-5 text-rose-400" />}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <div className="text-xl font-black font-romantic text-slate-800">
                  {activeAnalytics?.totalEvents || 0}
                </div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Interactions
                </div>
              </div>

              <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-200 text-center">
                <div className="text-xl font-black font-romantic text-rose-600">
                  {activeAnalytics?.teaseAttempts || 0}
                </div>
                <div className="text-[10px] font-semibold text-rose-500 uppercase tracking-wide">
                  "NO" Tease Chases
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-center">
                <div className="text-xl font-black font-romantic text-emerald-700">
                  {isAccepted ? '100%' : 'In Flow'}
                </div>
                <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">
                  Story Progress
                </div>
              </div>
            </div>

            {/* Recent Activity Timeline Feed */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700 font-romantic flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>Live Event Feed</span>
              </h4>

              <div className="max-h-44 overflow-y-auto space-y-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-xs">
                {activeAnalytics?.timeline && activeAnalytics.timeline.length > 0 ? (
                  activeAnalytics.timeline.map((ev: any) => (
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
                  <div className="text-slate-400 text-center py-3 text-[11px]">
                    No activity recorded yet for this link. Share the link to begin!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-rose-100 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => copyProposalUrl(selectedProposalSlug)}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy Active Link</span>
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
