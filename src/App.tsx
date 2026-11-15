import React, { useState, useEffect } from 'react';
import { Settings, Heart, BarChart3 } from 'lucide-react';
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
import { CreatorDashboard } from './components/CreatorDashboard';
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
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [proposalId, setProposalId] = useState('default');

  // Anti-skip unlock states for each chapter
  const [canProceedChapter1, setCanProceedChapter1] = useState(false);
  const [canProceedChapter2, setCanProceedChapter2] = useState(false);
  const [canProceedChapter3, setCanProceedChapter3] = useState(false);

  // Check URL parameters on mount
  useEffect(() => {
    const initFromUrl = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const slugParam = params.get('p');
        const toParam = params.get('to');
        const fromParam = params.get('from');
        const qParam = params.get('q');
        const stepParam = params.get('ch');
        const sinceParam = params.get('since');
        const themeParam = params.get('theme') as AppTheme;

        // If unique proposal slug provided (e.g. ?p=for-maya-8k2)
        if (slugParam) {
          setProposalId(slugParam);
          const proposal = await getProposalBySlug(slugParam);
          if (proposal) {
            setConfig((prev) => ({
              ...prev,
              ...(proposal.config_json || {}),
              partnerName: proposal.partner_name || prev.partnerName,
              senderName: proposal.sender_name || prev.senderName,
              proposalQuestion: proposal.question || prev.proposalQuestion
            }));
          }
          trackEvent('page_view', 0, { slug: slugParam }, slugParam);
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

        // Track default initial visit
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

  // Determine if she is allowed to proceed to the next chapter based on engagement
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

  return (
    <div
      className={`relative min-h-screen ${themeClass} flex flex-col justify-between py-6 sm:py-10 px-2 overflow-x-hidden selection:bg-rose-500 selection:text-white transition-colors duration-500`}
    >
      {/* Background Floating Hearts */}
      <FloatingHearts />

      {/* Top Controls Bar */}
      <header className="relative z-30 flex items-center justify-between max-w-2xl w-full mx-auto px-4 mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Personalize Button */}
          <button
            onClick={() => setIsCustomizeOpen(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-rose-600 shadow-sm backdrop-blur-md border border-rose-100 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
            title="Customize names, stories, and question"
          >
            <Settings className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Personalize</span>
          </button>

          {/* Creator Live Analytics Dashboard Button */}
          <button
            onClick={() => setIsDashboardOpen(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 shadow-sm backdrop-blur-md border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
            title="View Live Analytics & Metrics"
          >
            <BarChart3 className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          {/* Theme Selector */}
          <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
        </div>

        {/* Retro Vinyl Music Player */}
        <MusicPlayer />
      </header>

      {/* Main Chapter Content */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center py-2 sm:py-4">
        {isDeclined ? (
          <RespectfulDeclineView config={config} onReset={handleReset} />
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
              <CelebrationView config={config} onReset={handleReset} />
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
      <footer className="relative z-20 text-center py-4 text-xs text-rose-400/80 font-medium">
        <p className="flex items-center justify-center gap-1">
          A story created with endless love <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
        </p>
      </footer>

      {/* Customization Modal */}
      <CustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        config={config}
        onSave={(updated) => setConfig(updated)}
      />

      {/* Creator Analytics Dashboard */}
      <CreatorDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        proposalId={proposalId}
        config={config}
      />
    </div>
  );
};

export default App;
