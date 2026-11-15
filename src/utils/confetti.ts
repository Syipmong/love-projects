import confetti from 'canvas-confetti';

/**
 * Triggers a multi-stage celebration explosion with heart shapes and bright colors
 */
export function fireGrandCelebration() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: ['#f43f5e', '#ec4899', '#f472b6', '#fb7185', '#fda4af', '#fde047', '#a855f7']
    });
  }

  // Left cannon
  confetti({
    particleCount: 80,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.65 },
    colors: ['#f43f5e', '#fb7185', '#ec4899', '#ffffff']
  });

  // Right cannon
  confetti({
    particleCount: 80,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.65 },
    colors: ['#f43f5e', '#fb7185', '#ec4899', '#ffffff']
  });

  // Staggered sequence
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });

  // Continuous rain for 3 seconds
  const end = Date.now() + 3000;
  const interval: ReturnType<typeof setInterval> = setInterval(function () {
    if (Date.now() > end) {
      return clearInterval(interval);
    }

    confetti({
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      colors: ['#f43f5e', '#fda4af', '#fb7185', '#ffffff']
    });
  }, 350);
}

