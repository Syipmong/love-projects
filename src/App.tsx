import React, { useState, useEffect } from 'react';
import { Settings, Heart } from 'lucide-react';
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
import { fireGrandCelebration } from './utils/confetti';
import { playCelebrationSound } from './utils/audio';
import { recordProposalResponse } from './services/api';

const TOTAL_CHAPTERS = 6;

export const App: React.FC = () => {
  const [config, setConfig] = useState<ProposalConfig>(DEFAULT_CONFIG);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isDeclined, setIsDeclined] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(config.theme || 'rose');
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Check URL parameters for custom names, questions, or starting chapter
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const toParam = params.get('to');
      const fromParam = params.get('from');
      const qParam = params.get('q');
      const stepParam = params.get('ch');
      const sinceParam = params.get('since');
      const themeParam = params.get('theme') as AppTheme;

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
    } catch (e) {
      console.debug('URL params parsing error', e);
    }
  }, []);

  const handleNext = () => {
    if (currentChapter < TOTAL_CHAPTERS - 1) {
      setCurrentChapter((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentChapter > 0) {
      setCurrentChapter((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAcceptProposal = () => {
    setIsDeclined(false);
    setCurrentChapter(5); // Jump to Celebration Chapter
    playCelebrationSound();
    fireGrandCelebration();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Record response to local storage / backend server
    recordProposalResponse({
      to: config.partnerName,
      from: config.senderName,
      question: config.proposalQuestion,
      answer: 'yes',
      teaseAttempts: 1,
      timestamp: new Date().toISOString()
    });
  };

  const handleDeclineProposal = () => {
    setIsDeclined(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Record response to local storage / backend server
    recordProposalResponse({
      to: config.partnerName,
      from: config.senderName,
      question: config.proposalQuestion,
      answer: 'no',
      teaseAttempts: 5,
      timestamp: new Date().toISOString()
    });
  };

  const handleReset = () => {
    setIsDeclined(false);
    setCurrentChapter(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              <Chapter2Timeline config={config} />
            )}

            {currentChapter === 2 && (
              <Chapter3Polaroids config={config} />
            )}

            {currentChapter === 3 && (
              <Chapter4HeartfeltConfession config={config} />
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

            {/* Story Navigation: Shown on chapters 0 through 3 */}
            {currentChapter < 4 && (
              <StoryNavigation
                currentChapter={currentChapter}
                totalChapters={TOTAL_CHAPTERS}
                onNext={handleNext}
                onPrev={handlePrev}
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
    </div>
  );
};

export default App;
