// Web Audio API Synthesizer for rich romantic & playful sound effects
let audioCtx: AudioContext | null = null;
let bgMusicInterval: number | null = null;
let isMusicPlaying = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Playful cartoon boing/whoosh sound when "No" runs away or is pressed
 */
export function playEvasionSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    
    // Frequency slide upwards then down (cartoon boing)
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    console.debug('Audio error', e);
  }
}

/**
 * Gentle click / pop sound
 */
export function playPopSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch (e) {
    console.debug('Audio error', e);
  }
}

/**
 * Celebration fanfare / romantic harp sparkle when "YES" is clicked
 */
export function playCelebrationSound() {
  try {
    const ctx = getAudioContext();
    const notes = [
      523.25, // C5
      659.25, // E5
      783.99, // G5
      987.77, // B5
      1046.50, // C6
      1318.51, // E6
      1567.98  // G6
    ];

    const now = ctx.currentTime;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = now + index * 0.09;
      const duration = 0.8;

      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (e) {
    console.debug('Celebration audio error', e);
  }
}

/**
 * Warm, gentle music-box style romantic loop
 */
export function startBackgroundMelody(onStateChange?: (playing: boolean) => void) {
  if (isMusicPlaying) return;
  try {
    const ctx = getAudioContext();
    isMusicPlaying = true;
    onStateChange?.(true);

    // Warm chords in C Major / F Major romantic progression
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];

    let chordIdx = 0;
    const playChordStep = () => {
      if (!isMusicPlaying) return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.value = 1200;

        const startTime = ctx.currentTime + (i * 0.22);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 1.5, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.04, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.25);
      });
    };

    playChordStep();
    bgMusicInterval = window.setInterval(playChordStep, 2400);
  } catch (e) {
    console.debug('Background music error', e);
    isMusicPlaying = false;
    onStateChange?.(false);
  }
}

export function stopBackgroundMelody(onStateChange?: (playing: boolean) => void) {
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval);
    bgMusicInterval = null;
  }
  isMusicPlaying = false;
  onStateChange?.(false);
}

export function toggleBackgroundMusic(onStateChange?: (playing: boolean) => void) {
  if (isMusicPlaying) {
    stopBackgroundMelody(onStateChange);
  } else {
    startBackgroundMelody(onStateChange);
  }
}

