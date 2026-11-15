import React, { useEffect, useState } from 'react';
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
  KeyRound
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

  // Tabs: 'proposals' | 'editor' | 'analytics'
  const [activeTab, setActiveTab] = useState<'proposals' | 'editor' | 'analytics'>('proposals');

  // Proposals State
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ProposalItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Editor Form State (deep customization of all messages, milestones, polaroids, theme)
  const [editConfig, setEditConfig] = useState<ProposalConfig>(DEFAULT_CONFIG);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getCurrentUserProfile();
    setCurrentUser(user);
    if (user) {
      const list = await getUserProposals();
      setProposals(list);
      if (list.length > 0) {
        const target = list.find((p) => p.slug === activeProposalSlug) || list[0];
        selectProposal(target);
      }
    }
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

  const handleCreateNewProposal = async () => {
    const partner = prompt("Enter your partner's name / nickname (e.g. Maya):");
    if (!partner) return;
    const sender = prompt("Enter your name / nickname:", currentUser?.name || "Yours Truly") || "Yours Truly";

    const res = await createNewProposal({
      partner_name: partner.trim(),
      sender_name: sender.trim(),
      question: "Will you be my girlfriend?",
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
        <div className="max-w-6xl w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg font-romantic text-slate-900 leading-tight">
                Love Story Studio
              </h1>
              <p className="text-[11px] text-slate-500">Proposal Platform & Live Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStory}
              className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Back to Proposal Experience</span>
            </button>

            {currentUser && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
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

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-4">
              <button
                onClick={() => setActiveTab('proposals')}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'proposals'
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>My Proposals ({proposals.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('editor')}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'editor'
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Customize Story & Messages</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Live Analytics & Telemetry</span>
              </button>
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

                {/* Section C: Chapter 3 Polaroids */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                    <Camera className="w-4 h-4" />
                    <span>Chapter 3: The 4 Memory Polaroids & Secret Notes</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editConfig.polaroids.map((p, idx) => (
                      <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-[10px] font-bold text-rose-500 uppercase">Polaroid {idx + 1}</span>
                        <input
                          type="text"
                          value={p.title}
                          onChange={(e) => {
                            const updated = [...editConfig.polaroids];
                            updated[idx].title = e.target.value;
                            setEditConfig({ ...editConfig, polaroids: updated });
                          }}
                          placeholder="Card Title"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 font-bold"
                        />
                        <input
                          type="text"
                          value={p.imageUrl}
                          onChange={(e) => {
                            const updated = [...editConfig.polaroids];
                            updated[idx].imageUrl = e.target.value;
                            setEditConfig({ ...editConfig, polaroids: updated });
                          }}
                          placeholder="Image URL"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                        />
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
            {activeTab === 'analytics' && selectedProposal && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200">
                  <div>
                    <h3 className="font-bold text-base text-slate-800 font-romantic">
                      Live Telemetry for: {selectedProposal.partner_name}
                    </h3>
                    <p className="text-xs text-slate-500">6-Character Code: <strong className="font-mono text-rose-600">{selectedProposal.slug}</strong></p>
                  </div>
                  <button
                    onClick={() => loadAnalytics(selectedProposal.slug)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Outcome Banner */}
                <div
                  className={`p-6 rounded-3xl border-2 flex items-center justify-between gap-4 ${
                    analyticsData?.latestResponse?.answer === 'yes'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : analyticsData?.latestResponse?.answer === 'no'
                      ? 'bg-slate-100 border-slate-300 text-slate-700'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-75">Proposal Response</span>
                    <div className="text-2xl font-black font-romantic mt-0.5">
                      {analyticsData?.latestResponse?.answer === 'yes'
                        ? 'SHE SAID YES! 🎉🥰'
                        : analyticsData?.latestResponse?.answer === 'no'
                        ? 'Responded: Respectful Decline'
                        : 'In Progress / Reading Story Chapters'}
                    </div>
                  </div>
                  <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center">
                    <div className="text-3xl font-black font-romantic text-slate-800">
                      {analyticsData?.totalEvents || 0}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 uppercase mt-1">Interactions</div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center">
                    <div className="text-3xl font-black font-romantic text-rose-600">
                      {analyticsData?.teaseAttempts || 0}
                    </div>
                    <div className="text-xs font-semibold text-rose-500 uppercase mt-1">"NO" Tease Chases</div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center">
                    <div className="text-3xl font-black font-romantic text-emerald-600">
                      {analyticsData?.latestResponse?.answer === 'yes' ? '100%' : 'Active'}
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 uppercase mt-1">Status</div>
                  </div>
                </div>

                {/* Event Activity Feed */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-500" />
                    <span>Chronological Event Activity Feed</span>
                  </h4>

                  <div className="max-h-72 overflow-y-auto space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                    {analyticsData?.timeline && analyticsData.timeline.length > 0 ? (
                      analyticsData.timeline.map((ev: any) => (
                        <div
                          key={ev.id}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-slate-700"
                        >
                          <span className="font-semibold text-rose-600">
                            {ev.event_type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(ev.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 text-center py-6 text-xs">
                        No activity recorded yet for this 6-character code. Send the link to start tracking!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
