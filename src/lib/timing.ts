export const ANIMATION_TIMINGS = {
  // Staged reveal sequence (total ~1.4s)
  NODE_STAGGER_MS: 60,
  NODE_SCALE_DURATION_MS: 300,
  EDGE_DRAW_DELAY_MS: 300,
  EDGE_DRAW_DURATION_MS: 400,
  TIMELINE_BAR_STAGGER_MS: 25,
  TIMELINE_BAR_GROW_DURATION_MS: 350,
  TOTAL_REVEAL_MS: 1400,

  // Typewriter
  TYPEWRITER_PRE_DELAY_MS: 700,
  TYPEWRITER_CHAR_MS: 12,

  // Toast
  TOAST_AUTO_DISMISS_MS: 6000,
} as const;

export function checkPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
