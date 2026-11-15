import React, { useState, useEffect } from 'react';
import { Heart, BarChart3 } from 'lucide-react';
import { ProposalConfig, AppTheme } from './types';
import { DEFAULT_CONFIG } from './config';
import { FloatingHearts } from './components/FloatingHearts';
import { Chapter1Intro } from './components/chapters/Chapter1Intro';
import { Chapter2Timeline } from './components/chapters/Chapter2Timeline';
import { Chapter3Polaroids } from './components/chapters/Chapter3Polaroids';
import { Chapter4HeartfeltConfession } from './components/chapters/Chapter4HeartfeltConfession';
import { ProposalCard } from './components/ProposalCard';
import { CelebrationView } from './components/CelebrationView';
import { RespectfulDeclineView } from './components/RespectfulDeclineView';
import { StoryNavigation } from './components/StoryNavigation';
import { CustomizeModal } from './components/CustomizeModal';
import { MusicPlayer } from './components/MusicPlayer';
import { ThemeSelector } from './components/ThemeSelector';
import { DashboardStandalone } from './components/DashboardStandalone';
import { fireGrandCelebration } from './utils/confetti';
import { playCelebrationSound } from './utils/audio';
import { recordProposalResponse, trackEvent, getProposalBySlug } from './services/api';

const TOTAL_CHAPTERS = 6;

export const App: React.FC = () => {
  const [config, setConfig] = useState<ProposalConfig>(DEFAULT_CONFIG);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isDeclined, setIsDeclined] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(config.theme || 'rose');
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'story' | 'dashboard'>('story');
  const [proposalId, setProposalId] = useState('default');

  // Anti-skip unlock states for each chapter
  const [canProceedChapter1, setCanProceedChapter1] = useState(false);
  const [canProceedChapter2, setCanProceedChapter2] = useState(false);
  const [canProceedChapter3, setCanProceedChapter3] = useState(false);
  const [totalTeases, setTotalTeases] = useState(0);

  // Inaction & Dwell Time Tracker: Records when the partner pauses / hesitates on any chapter
  useEffect(() => {
    if (viewMode !== 'story') return;

    const chapterTitles = [
      'Chapter 1: The Sealed Letter',
      'Chapter 2: Milestones in My Memory',
      'Chapter 3: Polaroid Memories',
      'Chapter 4: What I’ve Wanted To Tell You',
      'Chapter 5: The Proposal Question',
      'Chapter 6: Celebration & Vows'
    ];

    const currentTitle = chapterTitles[currentChapter] || `Chapter ${currentChapter + 1}`;
    let secondsOnChapter = 0;
    let secondsIdle = 0;
    let loggedHesitation25s = false;
    let loggedHesitation60s = false;
    let loggedLinger120s = false;

    const resetIdleTimer = () => {
      secondsIdle = 0;
    };

    window.addEventListener('mousemove', resetIdleTimer, { passive: true });
    window.addEventListener('touchstart', resetIdleTimer, { passive: true });
    window.addEventListener('scroll', resetIdleTimer, { passive: true });
    window.addEventListener('click', resetIdleTimer, { passive: true });

    const interval = setInterval(() => {
      secondsOnChapter += 5;
      secondsIdle += 5;

      // Noticeable hesitation: 25s without touch/click/scroll
      if (secondsIdle >= 25 && !loggedHesitation25s && secondsOnChapter >= 25) {
        loggedHesitation25s = true;
        trackEvent(
          'inaction_dwell',
          currentChapter,
          {
            chapter_name: currentTitle,
            idle_seconds: secondsIdle,
            chapter_duration: secondsOnChapter,
            status: 'Hesitating / viewing without clicking'
          },
          proposalId
        );
      }
      // Deep hesitation: 60s idle
      else if (secondsIdle >= 60 && !loggedHesitation60s) {
        loggedHesitation60s = true;
        trackEvent(
          'inaction_dwell',
          currentChapter,
          {
            chapter_name: currentTitle,
            idle_seconds: secondsIdle,
            chapter_duration: secondsOnChapter,
            status: 'Deep hesitation / Paused for over 1 minute'
          },
          proposalId
        );
      }
      // Deep contemplation on chapter (2+ minutes spent reading)
      else if (secondsOnChapter >= 120 && !loggedLinger120s) {
        loggedLinger120s = true;
        trackEvent(
          'inaction_dwell',
          currentChapter,
          {
            chapter_name: currentTitle,
            idle_seconds: secondsIdle,
            chapter_duration: secondsOnChapter,
            status: 'Careful contemplation (spent 2+ mins reading)'
          },
          proposalId
        );
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
      window.removeEventListener('scroll', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
    };
  }, [currentChapter, viewMode, proposalId]);

  // Check URL parameters on mount
  useEffect(() => {
    const initFromUrl = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const codeParam = params.get('p');
        const dashboardParam = params.get('dashboard');
        const toParam = params.get('to');
        const fromParam = params.get('from');
        const qParam = params.get('q');
        const stepParam = params.get('ch');
        const sinceParam = params.get('since');
        const themeParam = params.get('theme') as AppTheme;

        // If URL requests dashboard directly
        if (dashboardParam === 'true' || window.location.pathname === '/dashboard') {
          setViewMode('dashboard');
        }

        // If 6-character proposal code provided (e.g. ?p=K9X2M4)
        if (codeParam) {
          setProposalId(codeParam);
          const proposal = await getProposalBySlug(codeParam);
          if (proposal) {
            setConfig((prev) => ({
              ...prev,
              ...(proposal.config_json || {}),
              partnerName: proposal.partner_name || prev.partnerName,
              senderName: proposal.sender_name || prev.senderName,
              proposalQuestion: proposal.question || prev.proposalQuestion
            }));
          }
          trackEvent('page_view', 0, { code: codeParam }, codeParam);
          return;
        }

        if (toParam || fromParam || qParam || sinceParam || themeParam) {
          setConfig((prev) => ({
            ...prev,
            partnerName: toParam || prev.partnerName,
            senderName: fromParam || prev.senderName,
            proposalQuestion: qParam || prev.proposalQuestion,
            startDate: sinceParam || prev.startDate,
            theme: themeParam || prev.theme
          }));
        }

        if (themeParam && ['rose', 'champagne', 'lavender'].includes(themeParam)) {
          setCurrentTheme(themeParam);
        }

        if (stepParam) {
          const stepNum = parseInt(stepParam, 10);
          if (!isNaN(stepNum) && stepNum >= 0 && stepNum < TOTAL_CHAPTERS) {
            setCurrentChapter(stepNum);
          }
        }

        trackEvent('page_view', 0, { to: toParam || config.partnerName }, 'default');
      } catch (e) {
        console.debug('URL params parsing error', e);
      }
    };

    initFromUrl();
  }, []);

  const handleNext = () => {
    if (currentChapter < TOTAL_CHAPTERS - 1) {
      const nextCh = currentChapter + 1;
      setCurrentChapter(nextCh);
      trackEvent('chapter_navigated', nextCh, { chapter: nextCh }, proposalId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentChapter > 0) {
      const prevCh = currentChapter - 1;
      setCurrentChapter(prevCh);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAcceptProposal = () => {
    setIsDeclined(false);
    setCurrentChapter(5);
    playCelebrationSound();
    fireGrandCelebration();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    recordProposalResponse({
      proposal_id: proposalId,
      answer: 'yes',
      tease_attempts: 1
    }, proposalId);

    trackEvent('proposal_accepted', 5, { answer: 'yes' }, proposalId);
  };

  const handleDeclineProposal = () => {
    setIsDeclined(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    recordProposalResponse({
      proposal_id: proposalId,
      answer: 'no',
      tease_attempts: 5
    }, proposalId);

    trackEvent('proposal_declined', 4, { answer: 'no' }, proposalId);
  };

  const handleReset = () => {
    setIsDeclined(false);
    setCurrentChapter(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine if allowed to proceed based on engagement
  const isNextAllowed = () => {
    if (currentChapter === 0) return true;
    if (currentChapter === 1) return canProceedChapter1;
    if (currentChapter === 2) return canProceedChapter2;
    if (currentChapter === 3) return canProceedChapter3;
    return true;
  };

  const themeClass =
    currentTheme === 'champagne'
      ? 'bg-theme-champagne'
      : currentTheme === 'lavender'
      ? 'bg-theme-lavender'
      : 'bg-theme-rose';

  // If in Dashboard Standalone Page View
  if (viewMode === 'dashboard') {
    return (
      <DashboardStandalone
        onBackToStory={() => setViewMode('story')}
        activeProposalSlug={proposalId}
      />
    );
  }

  // Otherwise, Story Experience View
  return (
    <div
      className={`relative min-h-screen ${themeClass} flex flex-col justify-between pt-3 sm:pt-6 pb-6 sm:pb-10 px-3 sm:px-6 overflow-x-hidden selection:bg-rose-500 selection:text-white transition-colors duration-500`}
    >
      {/* Background Floating Hearts */}
      <FloatingHearts />

      {/* Ultra-Sleek Top Navigation Bar with Mobile Safe Area */}
      <header className="relative z-30 w-full max-w-2xl mx-auto px-1 sm:px-2 mb-4 flex items-center justify-between gap-2.5">
        {/* Left Side: Recipient Experience vs Creator Tools */}
        {proposalId !== 'default' ? (
          /* Romantic Recipient Badge (Pure & Magical for Partner) */
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-rose-100/90 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-xs font-romantic font-bold text-rose-700">
              For {config.partnerName}
            </span>
          </div>
        ) : (
          /* Creator Mode Preview Controls (Clean, Compact, No-Cramming) */
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setViewMode('dashboard')}
              className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600 shadow-xs backdrop-blur-md border border-rose-200/80 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold shrink-0"
              title="Open Creator Studio & Dashboard"
            >
              <BarChart3 className="w-3.5 h-3.5 text-rose-500" />
              <span>Studio</span>
            </button>

            <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
          </div>
        )}

        {/* Right Side: Retro Vinyl Music Player (Always Fits Comfortably) */}
        <MusicPlayer />
      </header>

      {/* Main Chapter Content */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center py-2 sm:py-4">
        {isDeclined ? (
          <RespectfulDeclineView
            config={config}
            onReset={handleReset}
            onCreateOwn={() => {
              setViewMode('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <>
            {currentChapter === 0 && (
              <Chapter1Intro config={config} onBegin={handleNext} />
            )}

            {currentChapter === 1 && (
              <Chapter2Timeline
                config={config}
                onUnlockNext={setCanProceedChapter1}
              />
            )}

            {currentChapter === 2 && (
              <Chapter3Polaroids
                config={config}
                onUnlockNext={setCanProceedChapter2}
              />
            )}

            {currentChapter === 3 && (
              <Chapter4HeartfeltConfession
                config={config}
                onUnlockNext={setCanProceedChapter3}
              />
            )}

            {currentChapter === 4 && (
              <ProposalCard
                partnerName={config.partnerName}
                senderName={config.senderName}
                question={config.proposalQuestion}
                subheading={config.subheading}
                onAccept={handleAcceptProposal}
                onDecline={handleDeclineProposal}
              />
            )}

            {currentChapter === 5 && (
              <CelebrationView
                config={config}
                onReset={handleReset}
                onCreateOwn={() => {
                  setViewMode('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* Story Navigation: Shown on chapters 0 through 3 with strict Anti-Skip enforcement */}
            {currentChapter < 4 && currentChapter > 0 && (
              <StoryNavigation
                currentChapter={currentChapter}
                totalChapters={TOTAL_CHAPTERS}
                onNext={handleNext}
                onPrev={handlePrev}
                canNext={isNextAllowed()}
                nextLabel={currentChapter === 3 ? "The Important Question" : "Next Chapter"}
              />
            )}

            {/* Subtle back button on chapter 4 */}
            {currentChapter === 4 && (
              <div className="w-full max-w-xl mx-auto px-4 mt-6 text-center z-20">
                <button
                  onClick={handlePrev}
                  className="text-xs text-rose-500/80 hover:text-rose-600 underline underline-offset-4 font-medium cursor-pointer"
                >
                  ← Reread our story chapters
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-20 text-center py-4 text-xs text-rose-400/80 font-medium space-y-1.5">
        <p className="flex items-center justify-center gap-1">
          A story created with endless love <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
        </p>
        {proposalId !== 'default' && (
          <p>
            <button
              onClick={() => {
                setViewMode('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[11px] text-rose-500/80 hover:text-rose-600 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Create your own proposal for someone special →
            </button>
          </p>
        )}
      </footer>

      {/* Quick Customization Modal */}
      <CustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        config={config}
        onSave={(updated) => setConfig(updated)}
      />
    </div>
  );
};

export default App;
