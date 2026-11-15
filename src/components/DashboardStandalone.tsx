import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Share2,
  Clock,
  RefreshCw,
  Check,
  BarChart3,
  User,
  Plus,
  LogOut,
  ArrowRight,
  Sliders,
  BookOpen,
  Calendar,
  Camera,
  Eye,
  KeyRound,
  Search,
  AlertTriangle,
  HelpCircle,
  Compass,
  Gift,
  MessageCircle,
  Printer,
  Send,
  Trash2,
  Copy,
  ExternalLink,
  Lock,
  ShieldCheck,
  CheckCheck,
  MessageSquare
} from 'lucide-react';
import { ImagePickerModal } from './ImagePickerModal';
import { CreateProposalModal } from './CreateProposalModal';
import {
  loginUser,
  registerUser,
  getCurrentUserProfile,
  getUserProposals,
  createNewProposal,
  fetchDashboardData,
  fetchAnonymousInbox,
  deleteAnonymousMessage,
  updateUserHandle,
  setStoredToken,
  AuthUser,
  ProposalItem,
  AnonymousMessage
} from '../services/api';
import { ProposalConfig, AppTheme } from '../types';
import { DEFAULT_CONFIG } from '../config';

interface DashboardStandaloneProps {
  onBackToStory: () => void;
  activeProposalSlug?: string;
}

export const DashboardStandalone: React.FC<DashboardStandaloneProps> = ({
  onBackToStory,
  activeProposalSlug
}) => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Tabs: 'proposals' | 'anonymous' | 'editor' | 'analytics'
  const [activeTab, setActiveTab] = useState<'proposals' | 'anonymous' | 'editor' | 'analytics'>('proposals');

  // Proposals State
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ProposalItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Editor Form State (deep customization of all messages, milestones, polaroids, theme)
  const [editConfig, setEditConfig] = useState<ProposalConfig>(DEFAULT_CONFIG);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [activePickerIndex, setActivePickerIndex] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Anonymous Messages (anonymoux) State
  const [anonymousMessages, setAnonymousMessages] = useState<AnonymousMessage[]>([]);
  const [loadingAnonymous, setLoadingAnonymous] = useState(false);
  const [handleInput, setHandleInput] = useState('');
  const [isSavingHandle, setIsSavingHandle] = useState(false);
  const [handleStatusMsg, setHandleStatusMsg] = useState<string | null>(null);
  const [copiedAnonLink, setCopiedAnonLink] = useState(false);
  const [copiedStoryCardId, setCopiedStoryCardId] = useState<number | null>(null);
  const [showSocialModal, setShowSocialModal] = useState<string | null>(null);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [isLiveAutoRefresh, setIsLiveAutoRefresh] = useState(true);

  // Real-time telemetry auto-polling every 4 seconds when viewing Analytics
  useEffect(() => {
    if (activeTab !== 'analytics' || !selectedProposal || !isLiveAutoRefresh) return;

    const interval = setInterval(async () => {
      const data = await fetchDashboardData(selectedProposal.slug);
      if (data) {
        setAnalyticsData(data);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeTab, selectedProposal, isLiveAutoRefresh]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getCurrentUserProfile();
    setCurrentUser(user);
    if (user) {
      if (user.handle) {
        setHandleInput(user.handle);
      }
      const list = await getUserProposals();
      setProposals(list);
      if (list.length > 0) {
        const target = list.find((p) => p.slug === activeProposalSlug) || list[0];
        selectProposal(target);
      }
      loadAnonymousInbox();
    }
  };

  const loadAnonymousInbox = async () => {
    setLoadingAnonymous(true);
    const data = await fetchAnonymousInbox();
    setAnonymousMessages(data.messages || []);
    if (data.handle && !handleInput) {
      setHandleInput(data.handle);
    }
    setLoadingAnonymous(false);
  };

  const handleSaveHandle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim()) return;
    setIsSavingHandle(true);
    setHandleStatusMsg(null);
    const res = await updateUserHandle(handleInput.trim());
    setIsSavingHandle(false);
    if (res.success && res.handle) {
      setHandleStatusMsg(`Handle updated to @${res.handle}!`);
      if (currentUser) {
        setCurrentUser({ ...currentUser, handle: res.handle });
      }
      setTimeout(() => setHandleStatusMsg(null), 3000);
    } else {
      setHandleStatusMsg(res.error || 'Failed to update handle');
    }
  };

  const handleDeleteAnonMessage = async (id: number) => {
    await deleteAnonymousMessage(id);
    setAnonymousMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const copyAnonymousLink = () => {
    const activeHandle = currentUser?.handle || handleInput || 'user';
    const link = `https://anonymoux.aetechlabs.com/u/${activeHandle}`;
    navigator.clipboard.writeText(link);
    setCopiedAnonLink(true);
    setTimeout(() => setCopiedAnonLink(false), 2500);
  };

  const copyStoryReplyText = (msg: AnonymousMessage) => {
    const text = `🤫 Secret message received on Anonymoux:\n"${msg.message}"\n\n👉 Send me yours: https://anonymoux.aetechlabs.com/u/${currentUser?.handle || handleInput || 'user'}`;
    navigator.clipboard.writeText(text);
    setCopiedStoryCardId(msg.id);
    setTimeout(() => setCopiedStoryCardId(null), 2500);
  };

  const selectProposal = (prop: ProposalItem) => {
    setSelectedProposal(prop);
    // If proposal has stored config_json, merge it
    const storedConfig = (prop as any).config_json;
    if (storedConfig) {
      setEditConfig({
        ...DEFAULT_CONFIG,
        ...storedConfig,
        partnerName: prop.partner_name,
        senderName: prop.sender_name,
        proposalQuestion: prop.question
      });
    } else {
      setEditConfig({
        ...DEFAULT_CONFIG,
        partnerName: prop.partner_name,
        senderName: prop.sender_name,
        proposalQuestion: prop.question
      });
    }
    loadAnalytics(prop.slug);
  };

  const loadAnalytics = async (code: string) => {
    setAnalyticsLoading(true);
    const data = await fetchDashboardData(code);
    setAnalyticsData(data);
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
      const list = await getUserProposals();
      setProposals(list);
      if (list.length > 0) {
        selectProposal(list[0]);
      }
    }
  };

  const handleLogout = () => {
    setStoredToken(null);
    setCurrentUser(null);
    setProposals([]);
    setSelectedProposal(null);
  };

  const handleCreateNewProposal = () => {
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreateProposal = async (partner: string, sender: string, question: string) => {
    const res = await createNewProposal({
      partner_name: partner.trim(),
      sender_name: sender.trim(),
      question: question.trim() || "Will you be my girlfriend?",
      config_json: DEFAULT_CONFIG as unknown as Record<string, unknown>
    });

    if (res.success && res.proposal) {
      const list = await getUserProposals();
      setProposals(list);
      selectProposal(res.proposal);
      setActiveTab('editor');
    }
  };

  const handleSaveCustomization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposal) return;

    try {
      const res = await fetch(`/api/proposals/${selectedProposal.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_name: editConfig.partnerName,
          sender_name: editConfig.senderName,
          question: editConfig.proposalQuestion,
          config_json: editConfig
        })
      });

      if (res.ok) {
        setSaveStatus('Changes saved successfully to database!');
        setTimeout(() => setSaveStatus(null), 3000);
        const list = await getUserProposals();
        setProposals(list);
      }
    } catch {
      setSaveStatus('Error saving changes');
    }
  };

  const copyShareLink = (code: string) => {
    const link = `${window.location.origin}${window.location.pathname}?p=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Standalone Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl w-full mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg font-romantic text-slate-900 leading-tight">
                Love Story Studio
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500">Proposal Platform & Live Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToStory}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Proposal Experience</span>
              <span className="sm:hidden">View Story</span>
            </button>

            {currentUser && (
              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1">
        {!currentUser ? (
          /* Authentication Screen */
          <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
              <User className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-2xl font-bold font-romantic text-slate-800">
                {authMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Create and manage personalized proposal links with 6-character codes and live interaction tracking.
              </p>
            </div>

            {authError && (
              <div className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-left">
              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{authLoading ? 'Verifying...' : authMode === 'login' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-xs text-slate-500">
              {authMode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setAuthMode('register')}
                    className="text-rose-600 font-bold underline cursor-pointer"
                  >
                    Sign up now
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
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
          /* Standalone Dashboard Workspace */
          <div className="space-y-6">
            {/* Top Workspace Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <span className="text-xs uppercase font-bold text-rose-500 tracking-wider">Creator Workspace</span>
                <h2 className="text-2xl font-bold font-romantic text-slate-900 mt-0.5">
                  Welcome, {currentUser.name || currentUser.email}!
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your proposals, customize every message and memory, and track your partner's live responses.
                </p>
              </div>

              <button
                onClick={handleCreateNewProposal}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Proposal</span>
              </button>
            </div>

            {/* Ultra-Modern Segmented Capsule Navigation */}
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <nav aria-label="Dashboard sections" className="p-1.5 bg-slate-200/60 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-inner inline-flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
                {/* Tab 1: Proposals */}
                <button
                  type="button"
                  onClick={() => setActiveTab('proposals')}
                  className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer select-none shrink-0 ${
                    activeTab === 'proposals'
                      ? 'text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  {activeTab === 'proposals' && (
                    <motion.div
                      layoutId="activeDashboardTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/70"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <BookOpen className={`w-4 h-4 transition-colors ${activeTab === 'proposals' ? 'text-rose-500' : 'text-slate-500'}`} />
                    <span>My Proposals</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                        activeTab === 'proposals'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {proposals.length}
                    </span>
                  </span>
                </button>

                {/* Tab 2: Story Customizer */}
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer select-none shrink-0 ${
                    activeTab === 'editor'
                      ? 'text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  {activeTab === 'editor' && (
                    <motion.div
                      layoutId="activeDashboardTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/70"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Sliders className={`w-4 h-4 transition-colors ${activeTab === 'editor' ? 'text-rose-500' : 'text-slate-500'}`} />
                    <span>Customize Story</span>
                    {selectedProposal && (
                      <span className="hidden md:inline text-[11px] font-normal text-slate-400">
                        • {selectedProposal.partner_name}
                      </span>
                    )}
                  </span>
                </button>

                {/* Tab 3: Live Telemetry */}
                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer select-none shrink-0 ${
                    activeTab === 'analytics'
                      ? 'text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  {activeTab === 'analytics' && (
                    <motion.div
                      layoutId="activeDashboardTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/70"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <BarChart3 className={`w-4 h-4 transition-colors ${activeTab === 'analytics' ? 'text-rose-500' : 'text-slate-500'}`} />
                    <span>Live Analytics</span>
                    <span className="relative flex h-2 w-2 ml-0.5" title="Real-time live telemetry">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </span>
                </button>
              </nav>

              {/* Active Proposal Quick Indicator Pill */}
              {selectedProposal && (
                <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs text-slate-600 self-center">
                  <span className="text-slate-400">Selected:</span>
                  <span className="font-semibold text-slate-800">{selectedProposal.partner_name}</span>
                  <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg text-[11px] border border-rose-100">
                    {selectedProposal.slug}
                  </span>
                </div>
              )}
            </div>

            {/* TAB 1: PROPOSALS LIST */}
            {activeTab === 'proposals' && (
              <div className="space-y-4">
                {proposals.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                    <Heart className="w-10 h-10 text-rose-400 mx-auto" />
                    <h3 className="text-lg font-bold font-romantic text-slate-800">No Proposals Created Yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Click the button below to create your very first personalized proposal with a unique 6-character code!
                    </p>
                    <button
                      onClick={handleCreateNewProposal}
                      className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-bold shadow transition-all cursor-pointer"
                    >
                      Create First Proposal
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {proposals.map((prop) => {
                      const isSelected = selectedProposal?.slug === prop.slug;
                      return (
                        <div
                          key={prop.id}
                          className={`bg-white p-6 rounded-3xl border-2 transition-all space-y-4 ${
                            isSelected ? 'border-rose-400 shadow-md ring-2 ring-rose-100' : 'border-slate-200 hover:border-rose-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                                6-Char Code: <span className="font-mono text-xs bg-rose-100 px-2 py-0.5 rounded-full text-rose-700 font-black tracking-widest">{prop.slug}</span>
                              </span>
                              <h3 className="text-xl font-bold font-romantic text-slate-900 mt-1">
                                For {prop.partner_name}
                              </h3>
                              <p className="text-xs text-slate-500">From {prop.sender_name}</p>
                            </div>

                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${
                                prop.latest_answer === 'yes'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : prop.latest_answer === 'no'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {prop.latest_answer === 'yes'
                                ? 'SAID YES! ❤️'
                                : prop.latest_answer === 'no'
                                ? 'Declined'
                                : 'In Progress'}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500 truncate mr-2 font-mono">
                              ?p={prop.slug}
                            </span>
                            <button
                              onClick={() => copyShareLink(prop.slug)}
                              className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              {copiedCode === prop.slug ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                              <span>{copiedCode === prop.slug ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                            <button
                              onClick={() => {
                                selectProposal(prop);
                                setActiveTab('editor');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Sliders className="w-3.5 h-3.5 text-rose-500" />
                              <span>Customize</span>
                            </button>

                            <button
                              onClick={() => {
                                selectProposal(prop);
                                setActiveTab('analytics');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <BarChart3 className="w-3.5 h-3.5" />
                              <span>View Analytics</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FULL STORY & MESSAGES CUSTOMIZER */}
            {activeTab === 'editor' && selectedProposal && (
              <form onSubmit={handleSaveCustomization} className="space-y-6">
                <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200">
                  <div>
                    <h3 className="font-bold text-base text-slate-800 font-romantic">
                      Customizing Proposal: {selectedProposal.partner_name}
                    </h3>
                    <p className="text-xs text-slate-500">6-Character Unique Code: <strong className="font-mono text-rose-600">{selectedProposal.slug}</strong></p>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    Save All Changes
                  </button>
                </div>

                {saveStatus && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                    {saveStatus}
                  </div>
                )}

                {/* Section A: Names, Question, Theme */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    <span>General Settings & Theme</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Partner's Name</label>
                      <input
                        type="text"
                        value={editConfig.partnerName}
                        onChange={(e) => setEditConfig({ ...editConfig, partnerName: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Your Name</label>
                      <input
                        type="text"
                        value={editConfig.senderName}
                        onChange={(e) => setEditConfig({ ...editConfig, senderName: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">The Proposal Question</label>
                    <input
                      type="text"
                      value={editConfig.proposalQuestion}
                      onChange={(e) => setEditConfig({ ...editConfig, proposalQuestion: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Color Theme</label>
                      <select
                        value={editConfig.theme || 'rose'}
                        onChange={(e) => setEditConfig({ ...editConfig, theme: e.target.value as AppTheme })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                      >
                        <option value="rose">Blush Rose (Classic Romantic)</option>
                        <option value="champagne">Champagne Gold (Warm Candlelit)</option>
                        <option value="lavender">Midnight Lavender (Starry Twilight)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date You Met (For Live Timer)</label>
                      <input
                        type="date"
                        value={editConfig.startDate || '2024-06-01'}
                        onChange={(e) => setEditConfig({ ...editConfig, startDate: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Chapter 2 Milestones */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Chapter 2: The 4 Memory Milestones</span>
                  </h4>
                  <p className="text-xs text-slate-500">These are the 4 milestones she must click through to unlock the next chapter.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editConfig.storyMilestones.map((m, idx) => (
                      <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-[10px] font-bold text-rose-500 uppercase">Milestone {idx + 1}</span>
                        <input
                          type="text"
                          value={m.title}
                          onChange={(e) => {
                            const updated = [...editConfig.storyMilestones];
                            updated[idx].title = e.target.value;
                            setEditConfig({ ...editConfig, storyMilestones: updated });
                          }}
                          placeholder="Milestone Title"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 font-bold"
                        />
                        <textarea
                          rows={3}
                          value={m.story}
                          onChange={(e) => {
                            const updated = [...editConfig.storyMilestones];
                            updated[idx].story = e.target.value;
                            setEditConfig({ ...editConfig, storyMilestones: updated });
                          }}
                          placeholder="What happened on that day..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section C: Chapter 3 Polaroids with Pexels Search */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                        <Camera className="w-4 h-4" />
                        <span>Chapter 3: The 4 Memory Polaroids & Secret Notes</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pick photos from Pexels or enter your own romantic pictures
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editConfig.polaroids.map((p, idx) => (
                      <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                            Polaroid {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActivePickerIndex(idx)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                            title="Search Pexels photos"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Search Photos</span>
                          </button>
                        </div>

                        {/* Visual Polaroid Photo Preview */}
                        <div
                          onClick={() => setActivePickerIndex(idx)}
                          className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 cursor-pointer group shadow-2xs"
                        >
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold backdrop-blur-2xs">
                            <Camera className="w-4 h-4" />
                            <span>Change Photo</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Card Title
                          </label>
                          <input
                            type="text"
                            value={p.title}
                            onChange={(e) => {
                              const updated = [...editConfig.polaroids];
                              updated[idx].title = e.target.value;
                              setEditConfig({ ...editConfig, polaroids: updated });
                            }}
                            placeholder="e.g. That Unmatched Smile"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Secret Tap Note
                          </label>
                          <textarea
                            rows={2}
                            value={p.secretNote}
                            onChange={(e) => {
                              const updated = [...editConfig.polaroids];
                              updated[idx].secretNote = e.target.value;
                              setEditConfig({ ...editConfig, polaroids: updated });
                            }}
                            placeholder="Secret note revealed when tapped..."
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                            Image URL (Direct link or selected via search)
                          </label>
                          <input
                            type="text"
                            value={p.imageUrl}
                            onChange={(e) => {
                              const updated = [...editConfig.polaroids];
                              updated[idx].imageUrl = e.target.value;
                              setEditConfig({ ...editConfig, polaroids: updated });
                            }}
                            placeholder="Image URL"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono bg-white text-slate-600 truncate"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section D: Secret Date Surprise */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    <span>Chapter 6: Mystery Date Surprise Vault</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Secret Date Plan Title</label>
                      <input
                        type="text"
                        value={editConfig.secretDateSurprise?.title || ''}
                        onChange={(e) =>
                          setEditConfig({
                            ...editConfig,
                            secretDateSurprise: {
                              ...editConfig.secretDateSurprise!,
                              title: e.target.value
                            }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Location</label>
                      <input
                        type="text"
                        value={editConfig.secretDateSurprise?.location || ''}
                        onChange={(e) =>
                          setEditConfig({
                            ...editConfig,
                            secretDateSurprise: {
                              ...editConfig.secretDateSurprise!,
                              location: e.target.value
                            }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Itinerary / What She Needs To Know</label>
                    <textarea
                      rows={2}
                      value={editConfig.secretDateSurprise?.details || ''}
                      onChange={(e) =>
                        setEditConfig({
                          ...editConfig,
                          secretDateSurprise: {
                            ...editConfig.secretDateSurprise!,
                            details: e.target.value
                          }
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-bold shadow-lg cursor-pointer transition-all"
                  >
                    Save All Customizations
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: LIVE ANALYTICS */}
            {activeTab === 'analytics' && selectedProposal && (() => {
              const timeline: any[] = analyticsData?.timeline || [];
              const hesitationEvents = timeline.filter(
                (e) => e.event_type === 'inaction_dwell' || e.event_type === 'user_hesitation'
              );
              const quizEvents = timeline.filter((e) => e.event_type === 'quiz_answered');
              const latestQuiz = quizEvents[0]?.data_json;
              const polaroidsOpened = timeline.filter((e) => e.event_type === 'polaroid_opened');
              const milestonesViewed = timeline.filter((e) => e.event_type === 'milestone_viewed');
              const vouchersClaimed = timeline.filter((e) => e.event_type === 'love_voucher_claimed');
              const maxChapter = timeline.reduce(
                (max: number, ev: any) => Math.max(max, typeof ev.chapter === 'number' ? ev.chapter : 0),
                0
              );

              return (
                <div className="space-y-5">
                  {/* Top Bar with Live Polling Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-800 font-romantic">
                          Live Telemetry: {selectedProposal.partner_name}
                        </h3>
                        <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                          {selectedProposal.slug}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Real-time telemetry of her responses, choices, and hesitation signals
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsLiveAutoRefresh(!isLiveAutoRefresh)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                          isLiveAutoRefresh
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                        title="Toggle 4-second live auto-refresh"
                      >
                        <span className="relative flex h-2 w-2">
                          {isLiveAutoRefresh && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          )}
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                              isLiveAutoRefresh ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          ></span>
                        </span>
                        <span>{isLiveAutoRefresh ? 'Live Auto-Refresh (ON)' : 'Auto-Refresh Paused'}</span>
                      </button>

                      <button
                        onClick={() => loadAnalytics(selectedProposal.slug)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        title="Refresh now"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>

                  {/* Outcome Banner */}
                  <div
                    className={`p-6 rounded-3xl border-2 flex items-center justify-between gap-4 transition-all ${
                      analyticsData?.latestResponse?.answer === 'yes'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : analyticsData?.latestResponse?.answer === 'no'
                        ? 'bg-slate-100 border-slate-300 text-slate-700'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                        Current Proposal Status
                      </span>
                      <div className="text-2xl font-black font-romantic mt-0.5">
                        {analyticsData?.latestResponse?.answer === 'yes'
                          ? 'SHE SAID YES! 🎉🥰'
                          : analyticsData?.latestResponse?.answer === 'no'
                          ? 'Responded: Respectful Decline 🕊️'
                          : 'In Progress • She is exploring your story chapters right now'}
                      </div>
                      <p className="text-xs opacity-80 mt-1">
                        {analyticsData?.latestResponse?.answer === 'yes'
                          ? `Proposal accepted! "NO" button chased ${analyticsData?.teaseAttempts || 0} times before saying yes.`
                          : analyticsData?.latestResponse?.answer === 'no'
                          ? 'She completed the story and chose the respectful decline option.'
                          : `Currently active on or reached Chapter ${maxChapter + 1} of 6.`}
                      </p>
                    </div>
                    <Heart
                      className={`w-10 h-10 ${
                        analyticsData?.latestResponse?.answer === 'yes'
                          ? 'text-emerald-500 fill-emerald-500'
                          : analyticsData?.latestResponse?.answer === 'no'
                          ? 'text-slate-400 fill-slate-400'
                          : 'text-rose-500 fill-rose-500 animate-pulse'
                      }`}
                    />
                  </div>

                  {/* Quick stats (4 columns) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 text-center shadow-xs">
                      <div className="text-2xl sm:text-3xl font-black font-romantic text-slate-800">
                        {analyticsData?.totalEvents || 0}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase mt-1">
                        Total Interactions
                      </div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 text-center shadow-xs">
                      <div className="text-2xl sm:text-3xl font-black font-romantic text-rose-600">
                        {analyticsData?.teaseAttempts || 0}
                      </div>
                      <div className="text-[11px] font-bold text-rose-500 uppercase mt-1">
                        "NO" Button Chases
                      </div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 text-center shadow-xs">
                      <div className="text-2xl sm:text-3xl font-black font-romantic text-amber-600">
                        {hesitationEvents.length}
                      </div>
                      <div className="text-[11px] font-bold text-amber-500 uppercase mt-1">
                        Inaction & Pauses
                      </div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 text-center shadow-xs">
                      <div className="text-2xl sm:text-3xl font-black font-romantic text-emerald-600">
                        Ch. {maxChapter + 1}
                      </div>
                      <div className="text-[11px] font-bold text-emerald-600 uppercase mt-1">
                        Progress (of 6)
                      </div>
                    </div>
                  </div>

                  {/* Partner Inaction & Hesitation Signals Card */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>Hesitation & Inaction Signals (Viewing Without Clicking)</span>
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {hesitationEvents.length} detected
                      </span>
                    </div>

                    {hesitationEvents.length > 0 ? (
                      <div className="space-y-2">
                        {hesitationEvents.map((hEv: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4"
                          >
                            <div className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-semibold text-amber-950">
                                  {hEv.data_json?.chapter_name || `Chapter ${hEv.chapter + 1}`}:
                                </strong>{' '}
                                <span>{hEv.data_json?.status || 'Lingering without action'}</span>
                                <span className="ml-1 text-amber-700 font-mono text-[11px]">
                                  (Paused for ~{hEv.data_json?.idle_seconds || 25}s)
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] text-amber-600 font-mono shrink-0 sm:text-right">
                              {new Date(hEv.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                        ✨ No extended inaction detected yet — she moved smoothly through unlocked chapters without lingering!
                      </div>
                    )}
                  </div>

                  {/* Partner Responses & Choices Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mini-Quiz Response */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
                      <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" />
                        <span>Romantic Mini-Quiz Response</span>
                      </h4>

                      {latestQuiz ? (
                        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-purple-600 uppercase">Question Asked</span>
                            <p className="font-semibold text-slate-800 text-xs sm:text-sm mt-0.5">
                              "{latestQuiz.question || 'Mini-Quiz'}"
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-purple-600 uppercase">Her Selected Answer</span>
                            <p className="font-bold text-purple-700 text-sm mt-0.5">
                              👉 "{latestQuiz.selected_option || latestQuiz.option}"
                            </p>
                          </div>
                          {latestQuiz.reaction && (
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Her Prompt Reaction</span>
                              <p className="text-slate-600 italic mt-0.5">
                                "{latestQuiz.reaction || latestQuiz.response}"
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-400 text-center">
                          Mini-quiz has not been answered yet.
                        </div>
                      )}
                    </div>

                    {/* Unlocked Notes & Milestones Summary */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
                      <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Camera className="w-4 h-4" />
                        <span>Polaroids & Milestones Explored</span>
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-600">Polaroid secret notes revealed:</span>
                          <span className="font-bold text-rose-600 font-mono">
                            {polaroidsOpened.length} notes
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-600">Story milestones read:</span>
                          <span className="font-bold text-blue-600 font-mono">
                            {milestonesViewed.length} moments
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-600">Love coupons claimed:</span>
                          <span className="font-bold text-emerald-600 font-mono">
                            {vouchersClaimed.length} coupons
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chronological Event Activity Feed */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-rose-500" />
                        <span>Chronological Event Activity Feed</span>
                      </h4>
                      <span className="text-xs text-slate-400 font-medium">
                        Showing all {timeline.length} events
                      </span>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 text-xs">
                      {timeline.length > 0 ? (
                        timeline.map((ev: any) => {
                          // Format nice labels and badge styles
                          let icon = <Clock className="w-4 h-4 text-slate-500" />;
                          let title = ev.event_type.replace(/_/g, ' ').toUpperCase();
                          let subtitle: string | null = null;
                          let badgeBg = 'bg-white border-slate-200';

                          if (ev.event_type === 'no_button_evaded') {
                            icon = <Heart className="w-4 h-4 text-rose-500" />;
                            badgeBg = 'bg-rose-50 border-rose-200';
                            title = `Dodged "NO" Button (Chase #${ev.data_json?.tease_attempts || '?'})`;
                            if (ev.data_json?.speech_reaction) {
                              subtitle = `Reaction: "${ev.data_json?.speech_reaction}"`;
                            }
                          } else if (ev.event_type === 'inaction_dwell') {
                            icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
                            badgeBg = 'bg-amber-50 border-amber-200';
                            title = `Inaction / Hesitation on ${ev.data_json?.chapter_name || `Chapter ${ev.chapter + 1}`}`;
                            subtitle = `Paused for ~${ev.data_json?.idle_seconds || 25}s (${ev.data_json?.status || 'Lingering'})`;
                          } else if (ev.event_type === 'quiz_answered') {
                            icon = <HelpCircle className="w-4 h-4 text-purple-500" />;
                            badgeBg = 'bg-purple-50 border-purple-200';
                            title = `Answered Mini-Quiz: Selected "${ev.data_json?.selected_option || ev.data_json?.option}"`;
                            if (ev.data_json?.reaction) {
                              subtitle = `Shown: "${ev.data_json?.reaction}"`;
                            }
                          } else if (ev.event_type === 'polaroid_opened') {
                            icon = <Camera className="w-4 h-4 text-pink-500" />;
                            badgeBg = 'bg-pink-50 border-pink-200';
                            title = `Unlocked Polaroid Secret Note: "${ev.data_json?.title}"`;
                            if (ev.data_json?.secret_note_revealed) {
                              subtitle = `Note revealed: "${ev.data_json?.secret_note_revealed}"`;
                            }
                          } else if (ev.event_type === 'milestone_viewed') {
                            icon = <Compass className="w-4 h-4 text-blue-500" />;
                            badgeBg = 'bg-blue-50 border-blue-200';
                            title = `Explored Milestone: "${ev.data_json?.title}"`;
                          } else if (ev.event_type === 'heart_tapped') {
                            icon = <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
                            badgeBg = 'bg-rose-50 border-rose-200';
                            title = `Tapped Heart Pulse (${ev.data_json?.heart_beats || ev.data_json?.heartPumps} beats)`;
                          } else if (ev.event_type === 'envelope_opened') {
                            icon = <BookOpen className="w-4 h-4 text-rose-500" />;
                            badgeBg = 'bg-rose-50 border-rose-200';
                            title = `Opened Proposal Letter Envelope`;
                          } else if (ev.event_type === 'story_started') {
                            icon = <BookOpen className="w-4 h-4 text-emerald-500" />;
                            badgeBg = 'bg-emerald-50 border-emerald-200';
                            title = `Began Romantic Story Walkthrough`;
                          } else if (ev.event_type === 'chapter_navigated') {
                            icon = <ArrowRight className="w-4 h-4 text-slate-500" />;
                            badgeBg = 'bg-slate-100 border-slate-200';
                            title = `Turned Page to Chapter ${(ev.chapter || 0) + 1}`;
                          } else if (ev.event_type === 'proposal_accepted') {
                            icon = <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />;
                            badgeBg = 'bg-emerald-100 border-emerald-300';
                            title = `🎉 SAID YES! Proposal Accepted!`;
                          } else if (ev.event_type === 'proposal_declined') {
                            icon = <Heart className="w-4 h-4 text-slate-500" />;
                            badgeBg = 'bg-slate-100 border-slate-300';
                            title = `Respectfully Declined`;
                          } else if (ev.event_type === 'love_voucher_claimed') {
                            icon = <Gift className="w-4 h-4 text-amber-500" />;
                            badgeBg = 'bg-amber-50 border-amber-200';
                            title = `Claimed Love Coupon: "${ev.data_json?.voucher_title || ev.data_json?.voucher_id}"`;
                          } else if (ev.event_type === 'certificate_printed') {
                            icon = <Printer className="w-4 h-4 text-sky-500" />;
                            badgeBg = 'bg-sky-50 border-sky-200';
                            title = `Printed / Saved Official Love Certificate`;
                          } else if (ev.event_type === 'whatsapp_alert_clicked') {
                            icon = <MessageCircle className="w-4 h-4 text-emerald-600" />;
                            badgeBg = 'bg-emerald-50 border-emerald-300';
                            title = `Clicked WhatsApp Button to Message You!`;
                          }

                          return (
                            <div
                              key={ev.id}
                              className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 ${badgeBg}`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 shrink-0">{icon}</div>
                                <div>
                                  <div className="font-semibold text-slate-800">{title}</div>
                                  {subtitle && (
                                    <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                      {subtitle}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                {new Date(ev.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-slate-400 text-center py-8 text-xs space-y-1">
                          <p className="font-semibold text-slate-600">No telemetry activity recorded yet</p>
                          <p className="text-[11px]">
                            Share your link with your partner to start tracking every tap, choice, and reaction live!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* Pexels Photo Search & Selection Modal */}
      {activePickerIndex !== null && (
        <ImagePickerModal
          isOpen={true}
          onClose={() => setActivePickerIndex(null)}
          targetTitle={`Polaroid ${activePickerIndex + 1}: ${editConfig.polaroids[activePickerIndex]?.title || 'Memory'}`}
          currentImageUrl={editConfig.polaroids[activePickerIndex]?.imageUrl}
          onSelectImage={(imageUrl) => {
            const updated = [...editConfig.polaroids];
            if (updated[activePickerIndex]) {
              updated[activePickerIndex].imageUrl = imageUrl;
              setEditConfig({ ...editConfig, polaroids: updated });
            }
            setActivePickerIndex(null);
          }}
        />
      )}

      {/* Create New Proposal In-App Modal (Zero native alerts/prompts) */}
      <CreateProposalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultSenderName={currentUser?.name || 'Yours Truly'}
        onSubmit={handleConfirmCreateProposal}
      />
    </div>
  );
};
