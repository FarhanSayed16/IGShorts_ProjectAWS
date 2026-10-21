/**
 * Motion constants and transitions catalog (§9 Motion System)
 */

export const MOTION = {
  durations: {
    instant: 80,
    fast: 150,
    normal: 250,
    slow: 400,
    dramatic: 600,
    pageFade: 280,
    routeFade: 200,
    navSlide: 180,
    rowHover: 150,
    chipPop: 250,
    cascadeStagger: 30,
    modalScale: 200,
  },
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easings: {
    out: 'cubic-bezier(0.22, 1, 0.36, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    decel: 'cubic-bezier(0, 0, 0.2, 1)',
  },
} as const;

export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
