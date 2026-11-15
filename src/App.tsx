import React, { useState, useEffect } from 'react';
import { Settings, Heart } from 'lucide-react';
import { ProposalConfig } from './types';
import { DEFAULT_CONFIG } from './config';
import { FloatingHearts } from './components/FloatingHearts';
import { ProposalCard } from './components/ProposalCard';
import { CelebrationView } from './components/CelebrationView';
import { CustomizeModal } from './components/CustomizeModal';
import { MusicPlayer } from './components/MusicPlayer';
import { fireGrandCelebration } from './utils/confetti';
import { playCelebrationSound } from './utils/audio';

export const App: React.FC = () => {
  const [config, setConfig] = useState<ProposalConfig>(DEFAULT_CONFIG);
  const [accepted, setAccepted] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Check URL parameters for custom names or questions
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const toParam = params.get('to');
      const fromParam = params.get('from');
      const qParam = params.get('q');

      if (toParam || fromParam || qParam) {
        setConfig((prev) => ({
          ...prev,
          partnerName: toParam || prev.partnerName,
          senderName: fromParam || prev.senderName,
          proposalQuestion: qParam || prev.proposalQuestion
        }));
      }
    } catch (e) {
      console.debug('URL params parsing error', e);
    }
  }, []);

  const handleAccept = () => {
    setAccepted(true);
    playCelebrationSound();
    fireGrandCelebration();
  };

  const handleReset = () => {
    setAccepted(false);
  };

  return (
    <div className="relative min-h-screen bg-hearts-pattern flex flex-col justify-between py-12 px-2 overflow-x-hidden selection:bg-rose-500 selection:text-white">
      {/* Background Floating Hearts */}
      <FloatingHearts />

      {/* Top Controls Bar */}
      <header className="relative z-30 flex items-center justify-between max-w-4xl w-full mx-auto px-4 mb-4">
        {/* Subtle Customize Button */}
        <button
          onClick={() => setIsCustomizeOpen(true)}
          className="p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-rose-600 shadow-md backdrop-blur-md border border-rose-100 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
          title="Customize names and question"
        >
          <Settings className="w-4 h-4 text-rose-500" />
          <span className="hidden sm:inline">Personalize</span>
        </button>

        {/* Music Player */}
        <MusicPlayer />
      </header>

      {/* Main Interactive Stage */}
      <main className="relative z-20 flex-1 flex items-center justify-center py-4">
        {!accepted ? (
          <ProposalCard
            partnerName={config.partnerName}
            senderName={config.senderName}
            question={config.proposalQuestion}
            subheading={config.subheading}
            onAccept={handleAccept}
          />
        ) : (
          <CelebrationView config={config} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-20 text-center py-4 text-xs text-rose-400/80 font-medium">
        <p className="flex items-center justify-center gap-1">
          Crafted with endless love & affection <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
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

