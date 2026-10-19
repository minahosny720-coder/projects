import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  if (typeof window === 'undefined') return;

  confetti({
    particleCount: 40,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#2563eb', '#10b981', '#f59e0b', '#6366f1', '#ec4899'],
    disableForReducedMotion: true,
  });
}
