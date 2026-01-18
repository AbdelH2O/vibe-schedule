// Context color palette definitions
// 8 distinct colors for context differentiation

export const CONTEXT_COLORS = ['blue', 'green', 'purple', 'amber', 'rose', 'teal', 'orange', 'slate'] as const;

export type ContextColorName = typeof CONTEXT_COLORS[number];

export interface ContextColor {
  bg: string;       // Light background class
  text: string;     // Readable text class
  border: string;   // Accent border class
  dot: string;      // Solid color for dots/indicators (Tailwind class)
  dotColor: string; // OKLCH color for dot (matches gradient/accent for consistency)
  // Immersive working mode colors
  gradient: string; // OKLCH color for CSS gradients
  accent: string;   // OKLCH color for accents
  cardBg: string;   // Tinted card background class
  containerBg: string;  // Container tint
  hue: number;          // Hue value for dynamic calculations
}

// Color definitions using OKLCH values for perceptual uniformity
// Each color provides: bg (10% opacity), text (readable), border (accent), dot (solid)
// Plus immersive working mode colors: gradient (OKLCH), accent (OKLCH), cardBg (tinted), containerBg
export const contextColors: Record<ContextColorName, ContextColor> = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700',
    border: 'border-blue-500',
    dot: 'bg-blue-500',
    dotColor: 'oklch(0.60 0.18 250)',
    gradient: 'oklch(0.60 0.18 250)',
    accent: 'oklch(0.55 0.20 250)',
    cardBg: 'bg-blue-500/8',
    containerBg: 'oklch(0.96 0.015 250)',
    hue: 250,
  },
  green: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700',
    border: 'border-emerald-500',
    dot: 'bg-emerald-500',
    dotColor: 'oklch(0.60 0.17 145)',
    gradient: 'oklch(0.60 0.17 145)',
    accent: 'oklch(0.55 0.19 145)',
    cardBg: 'bg-emerald-500/8',
    containerBg: 'oklch(0.96 0.015 145)',
    hue: 145,
  },
  purple: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-700',
    border: 'border-violet-500',
    dot: 'bg-violet-500',
    dotColor: 'oklch(0.55 0.20 300)',
    gradient: 'oklch(0.55 0.20 300)',
    accent: 'oklch(0.50 0.22 300)',
    cardBg: 'bg-violet-500/8',
    containerBg: 'oklch(0.96 0.015 300)',
    hue: 300,
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-700',
    border: 'border-amber-500',
    dot: 'bg-amber-500',
    dotColor: 'oklch(0.75 0.16 80)',
    gradient: 'oklch(0.75 0.16 80)',
    accent: 'oklch(0.70 0.18 80)',
    cardBg: 'bg-amber-500/8',
    containerBg: 'oklch(0.96 0.015 80)',
    hue: 80,
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-700',
    border: 'border-rose-500',
    dot: 'bg-rose-500',
    dotColor: 'oklch(0.60 0.20 15)',
    gradient: 'oklch(0.60 0.20 15)',
    accent: 'oklch(0.55 0.22 15)',
    cardBg: 'bg-rose-500/8',
    containerBg: 'oklch(0.96 0.015 15)',
    hue: 15,
  },
  teal: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-700',
    border: 'border-teal-500',
    dot: 'bg-teal-500',
    dotColor: 'oklch(0.60 0.14 185)',
    gradient: 'oklch(0.60 0.14 185)',
    accent: 'oklch(0.55 0.16 185)',
    cardBg: 'bg-teal-500/8',
    containerBg: 'oklch(0.96 0.015 185)',
    hue: 185,
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-700',
    border: 'border-orange-500',
    dot: 'bg-orange-500',
    dotColor: 'oklch(0.70 0.18 50)',
    gradient: 'oklch(0.70 0.18 50)',
    accent: 'oklch(0.65 0.20 50)',
    cardBg: 'bg-orange-500/8',
    containerBg: 'oklch(0.96 0.015 50)',
    hue: 50,
  },
  slate: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-700',
    border: 'border-slate-500',
    dot: 'bg-slate-500',
    dotColor: 'oklch(0.55 0.03 250)',
    gradient: 'oklch(0.55 0.03 250)',
    accent: 'oklch(0.50 0.04 250)',
    cardBg: 'bg-slate-500/8',
    containerBg: 'oklch(0.96 0.01 250)',
    hue: 250,
  },
};

/**
 * Get color classes for a context color name
 * @param colorName - The color name from ContextColorName type
 * @returns ContextColor object with bg, text, border, and dot classes
 */
export function getContextColor(colorName: ContextColorName): ContextColor {
  return contextColors[colorName] || contextColors.blue;
}

/**
 * Get a default color for a new context based on index
 * Cycles through the color palette
 * @param index - The index to use for color selection
 * @returns A ContextColorName
 */
export function getDefaultColorByIndex(index: number): ContextColorName {
  return CONTEXT_COLORS[index % CONTEXT_COLORS.length];
}
