import React, { useState, useEffect } from 'react';
import { Settings, Heart } from 'lucide-react';
import { ProposalConfig } from './types';
import { DEFAULT_CONFIG } from './config';
import { FloatingHearts } from './components/FloatingHearts';
import { Chapter1Intro } from './components/chapters/Chapter1Intro';
import { Chapter2Timeline } from './components/chapters/Chapter2Timeline';
import { Chapter3Polaroids } from './components/chapters/Chapter3Polaroids';
import { Chapter4HeartfeltConfession } from './components/chapters/Chapter4HeartfeltConfession';
import { ProposalCard } from './components/ProposalCard';
import { CelebrationView } from './components/CelebrationView';
import { StoryNavigation } from './components/StoryNavigation';
import { CustomizeModal } from './components/CustomizeModal';
import { MusicPlayer } from './components/MusicPlayer';
import { fireGrandCelebration } from './utils/confetti';
import { playCelebrationSound } from './utils/audio';

const TOTAL_CHAPTERS = 6;

export const App: React.FC = () => {
  const [config, setConfig] = useState<ProposalConfig>(DEFAULT_CONFIG);
  const [currentChapter, setCurrentChapter] = useState(0);
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

      if (toParam || fromParam || qParam || sinceParam) {
        setConfig((prev) => ({
          ...prev,
          partnerName: toParam || prev.partnerName,
          senderName: fromParam || prev.senderName,
          proposalQuestion: qParam || prev.proposalQuestion,
          startDate: sinceParam || prev.startDate
        }));
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
    setCurrentChapter(5); // Jump to Celebration Chapter
    playCelebrationSound();
    fireGrandCelebration();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setCurrentChapter(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-hearts-pattern flex flex-col justify-between py-6 sm:py-10 px-2 overflow-x-hidden selection:bg-rose-500 selection:text-white">
      {/* Background Floating Hearts */}
      <FloatingHearts />

      {/* Top Controls Bar */}
      <header className="relative z-30 flex items-center justify-between max-w-2xl w-full mx-auto px-4 mb-4">
        {/* Subtle Customize Button */}
        <button
          onClick={() => setIsCustomizeOpen(true)}
          className="p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-rose-600 shadow-md backdrop-blur-md border border-rose-100 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
          title="Customize names, stories, and question"
        >
          <Settings className="w-4 h-4 text-rose-500" />
          <span className="hidden sm:inline">Personalize Story</span>
        </button>

        {/* Music Player */}
        <MusicPlayer />
      </header>

      {/* Main Chapter Content */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center py-2 sm:py-4">
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
          />
        )}

        {currentChapter === 5 && (
          <CelebrationView config={config} onReset={handleReset} />
        )}

        {/* Story Navigation: Shown on chapters 0 through 3 (on chapter 4 she must click YES to reach chapter 5!) */}
        {currentChapter < 4 && (
          <StoryNavigation
            currentChapter={currentChapter}
            totalChapters={TOTAL_CHAPTERS}
            onNext={handleNext}
            onPrev={handlePrev}
            nextLabel={currentChapter === 3 ? "The Important Question 💖" : "Next Chapter"}
          />
        )}

        {/* Show a subtle back button on chapter 4 in case she wants to reread the stories */}
        {currentChapter === 4 && (
          <div className="w-full max-w-xl mx-auto px-4 mt-6 text-center z-20">
            <button
              onClick={handlePrev}
              className="text-xs text-rose-500/80 hover:text-rose-600 underline underline-offset-4 font-medium"
            >
              ← Reread our story chapters
            </button>
          </div>
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
