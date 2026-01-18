// Context color palette definitions
// 8 distinct colors for context differentiation

export const CONTEXT_COLORS = ['blue', 'green', 'purple', 'amber', 'rose', 'teal', 'orange', 'slate'] as const;

export type ContextColorName = typeof CONTEXT_COLORS[number];

export interface ContextColor {
  bg: string;       // Light background class
  text: string;     // Readable text class
  border: string;   // Accent border class
  dot: string;      // Solid color for dots/indicators
}

// Color definitions using OKLCH values for perceptual uniformity
// Each color provides: bg (10% opacity), text (readable), border (accent), dot (solid)
export const contextColors: Record<ContextColorName, ContextColor> = {
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-400/15',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500 dark:border-blue-400',
    dot: 'bg-blue-500 dark:bg-blue-400',
  },
  green: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-400/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500 dark:border-emerald-400',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  purple: {
    bg: 'bg-violet-500/10 dark:bg-violet-400/15',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-500 dark:border-violet-400',
    dot: 'bg-violet-500 dark:bg-violet-400',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-400/15',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500 dark:border-amber-400',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  rose: {
    bg: 'bg-rose-500/10 dark:bg-rose-400/15',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500 dark:border-rose-400',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
  teal: {
    bg: 'bg-teal-500/10 dark:bg-teal-400/15',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-500 dark:border-teal-400',
    dot: 'bg-teal-500 dark:bg-teal-400',
  },
  orange: {
    bg: 'bg-orange-500/10 dark:bg-orange-400/15',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-500 dark:border-orange-400',
    dot: 'bg-orange-500 dark:bg-orange-400',
  },
  slate: {
    bg: 'bg-slate-500/10 dark:bg-slate-400/15',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-500 dark:border-slate-400',
    dot: 'bg-slate-500 dark:bg-slate-400',
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
