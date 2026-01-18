// Demo template data definitions
// Provides sample contexts and tasks for users to explore the app

import type { ContextColorName } from './colors';
import type { Context, Task, ImportantDate } from './types';
import { generateId, now } from './storage';

interface DemoContextDef {
  name: string;
  priority: number;
  color: ContextColorName;
  minDuration?: number;
  maxDuration?: number;
  weight: number;
  importantDates?: { label: string; daysFromNow: number }[];
}

interface DemoTaskDef {
  title: string;
  description?: string;
  contextName: string | null; // null = inbox
  daysUntilDeadline?: number; // undefined = no deadline
}

const DEMO_CONTEXTS: DemoContextDef[] = [
  {
    name: 'Work',
    priority: 1,
    color: 'blue',
    minDuration: 30,
    maxDuration: 120,
    weight: 2,
    importantDates: [
      { label: 'Project deadline', daysFromNow: 14 },
      { label: 'Quarterly review', daysFromNow: 30 },
    ],
  },
  {
    name: 'Freelance',
    priority: 2,
    color: 'purple',
    minDuration: 45,
    maxDuration: 90,
    weight: 1.5,
    importantDates: [{ label: 'Client proposal due', daysFromNow: 10 }],
  },
  {
    name: 'Learning',
    priority: 2,
    color: 'green',
    minDuration: 25,
    maxDuration: 60,
    weight: 1,
    importantDates: [{ label: 'Course deadline', daysFromNow: 21 }],
  },
  {
    name: 'Health & Fitness',
    priority: 3,
    color: 'rose',
    minDuration: 20,
    maxDuration: 60,
    weight: 1,
  },
  {
    name: 'Personal',
    priority: 3,
    color: 'amber',
    minDuration: 15,
    maxDuration: 45,
    weight: 1,
    importantDates: [{ label: 'Tax filing', daysFromNow: 30 }],
  },
  {
    name: 'Leisure',
    priority: 4,
    color: 'teal',
    minDuration: 30,
    maxDuration: 120,
    weight: 0.5,
  },
];

const DEMO_TASKS: DemoTaskDef[] = [
  // Work Tasks (8 tasks)
  {
    title: 'Review Q1 roadmap and update priorities',
    description: 'Check the quarterly roadmap document and align team priorities',
    contextName: 'Work',
    daysUntilDeadline: 3,
  },
  {
    title: 'Prepare presentation slides for Monday standup',
    description: 'Weekly sync presentation with key metrics',
    contextName: 'Work',
    daysUntilDeadline: 5,
  },
  {
    title: 'Code review: PR #142 authentication refactor',
    description: 'Review security implications and test coverage',
    contextName: 'Work',
    daysUntilDeadline: 2,
  },
  {
    title: 'Draft technical documentation for API v2',
    description: 'Document new endpoints, request/response formats',
    contextName: 'Work',
    daysUntilDeadline: 7,
  },
  {
    title: '📖 Deep Work by Cal Newport',
    description: 'Resource: Focus techniques for professional productivity',
    contextName: 'Work',
  },
  {
    title: '🔗 Linear - Issue tracking',
    description: 'https://linear.app - Team\'s project management tool',
    contextName: 'Work',
  },
  {
    title: 'Daily standup notes template',
    description: 'Remember: What I did, what I\'m doing, blockers',
    contextName: 'Work',
  },
  {
    title: 'Weekly 1:1 prep',
    description: 'Prepare talking points and updates for manager sync',
    contextName: 'Work',
  },

  // Freelance Tasks (6 tasks)
  {
    title: 'Send invoice for December work',
    description: 'Client: TechStartup Inc. - 40 hours @ agreed rate',
    contextName: 'Freelance',
    daysUntilDeadline: 2,
  },
  {
    title: 'Mockup review with client',
    description: 'Schedule call to review latest design iterations',
    contextName: 'Freelance',
    daysUntilDeadline: 5,
  },
  {
    title: 'Update portfolio with recent project',
    description: 'Add case study for e-commerce redesign project',
    contextName: 'Freelance',
    daysUntilDeadline: 14,
  },
  {
    title: '📖 The Freelance Handbook',
    description: 'Resource: Best practices for independent consulting',
    contextName: 'Freelance',
  },
  {
    title: '🔗 Figma project files',
    description: 'https://figma.com - Current client design workspace',
    contextName: 'Freelance',
  },
  {
    title: 'Check Upwork messages',
    description: 'Daily habit: Respond to potential client inquiries',
    contextName: 'Freelance',
  },

  // Learning Tasks (7 tasks)
  {
    title: 'Complete TypeScript advanced patterns module',
    description: 'Coursera: Advanced TypeScript course - Module 4',
    contextName: 'Learning',
    daysUntilDeadline: 7,
  },
  {
    title: 'Practice algorithm problems (2 medium)',
    description: 'LeetCode daily practice - focus on dynamic programming',
    contextName: 'Learning',
    daysUntilDeadline: 3,
  },
  {
    title: 'Read "Clean Architecture" Chapter 5-6',
    description: 'Robert C. Martin - Understanding boundaries',
    contextName: 'Learning',
    daysUntilDeadline: 5,
  },
  {
    title: '📖 Designing Data-Intensive Applications',
    description: 'Resource: Martin Kleppmann - distributed systems bible',
    contextName: 'Learning',
  },
  {
    title: '📖 The Pragmatic Programmer',
    description: 'Resource: Essential software craftsmanship reading',
    contextName: 'Learning',
  },
  {
    title: '🔗 Exercism.io - Rust Track',
    description: 'https://exercism.io/tracks/rust - Practice problems',
    contextName: 'Learning',
  },
  {
    title: 'Watch conference talk backlog',
    description: 'Remember: Check YouTube "Watch Later" for tech talks',
    contextName: 'Learning',
  },

  // Health & Fitness Tasks (6 tasks)
  {
    title: 'Schedule annual physical checkup',
    description: 'Call doctor\'s office for appointment',
    contextName: 'Health & Fitness',
    daysUntilDeadline: 7,
  },
  {
    title: 'Meal prep for the week',
    description: 'Sunday prep: proteins, grains, vegetables',
    contextName: 'Health & Fitness',
    daysUntilDeadline: 4,
  },
  {
    title: 'Try new yoga routine',
    description: '30-min morning flow from Down Dog app',
    contextName: 'Health & Fitness',
  },
  {
    title: '🏃 5K training plan - Week 3',
    description: 'Resource: Couch to 5K program progression',
    contextName: 'Health & Fitness',
  },
  {
    title: '🔗 MyFitnessPal',
    description: 'https://myfitnesspal.com - Nutrition tracking',
    contextName: 'Health & Fitness',
  },
  {
    title: 'Morning stretch routine',
    description: 'Remember: 10-min mobility before starting work',
    contextName: 'Health & Fitness',
  },

  // Personal Tasks (7 tasks)
  {
    title: 'Renew car registration',
    description: 'DMV online portal - expires end of month',
    contextName: 'Personal',
    daysUntilDeadline: 10,
  },
  {
    title: 'Schedule dentist appointment',
    description: '6-month checkup overdue',
    contextName: 'Personal',
    daysUntilDeadline: 5,
  },
  {
    title: 'Research new phone plans',
    description: 'Compare carriers: coverage, data, international',
    contextName: 'Personal',
    daysUntilDeadline: 14,
  },
  {
    title: 'Organize digital photos backup',
    description: 'Move photos to cloud storage, delete duplicates',
    contextName: 'Personal',
    daysUntilDeadline: 21,
  },
  {
    title: '📋 Monthly budget review',
    description: 'Resource: Spreadsheet template for expense tracking',
    contextName: 'Personal',
  },
  {
    title: '🔗 YNAB',
    description: 'https://youneedabudget.com - Budgeting app',
    contextName: 'Personal',
  },
  {
    title: 'Water the plants',
    description: 'Remember: Every Wednesday and Sunday',
    contextName: 'Personal',
  },

  // Leisure Tasks (6 tasks)
  {
    title: 'Finish "The Last of Us" game',
    description: 'Currently on Chapter 8 - amazing story!',
    contextName: 'Leisure',
  },
  {
    title: 'Plan weekend hiking trip',
    description: 'Research trails within 2 hours, check weather',
    contextName: 'Leisure',
    daysUntilDeadline: 7,
  },
  {
    title: '🎬 Movies to watch',
    description: 'Oppenheimer, Dune Part 2, Past Lives, Poor Things',
    contextName: 'Leisure',
  },
  {
    title: '📺 Series backlog',
    description: 'The Bear S3, Shogun, 3 Body Problem, Fallout',
    contextName: 'Leisure',
  },
  {
    title: '📖 Project Hail Mary by Andy Weir',
    description: 'Resource: Sci-fi novel recommendation',
    contextName: 'Leisure',
  },
  {
    title: '🎮 Game wishlist',
    description: 'Baldur\'s Gate 3, Elden Ring DLC, FF7 Rebirth',
    contextName: 'Leisure',
  },

  // Inbox Tasks (3 tasks - no context)
  {
    title: 'Call mom - catch up',
    description: 'Haven\'t talked in a while',
    contextName: null,
  },
  {
    title: 'Check that interesting article saved in Pocket',
    description: 'Something about productivity systems',
    contextName: null,
  },
  {
    title: 'Idea: Build a CLI tool for note-taking',
    description: 'Quick capture to markdown files',
    contextName: null,
  },
];

/**
 * Helper to add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Generate demo data with proper IDs and timestamps
 * All relative dates are computed from today
 */
export function getDemoData(): { contexts: Context[]; tasks: Task[] } {
  const today = new Date();
  const timestamp = now();

  // Create a map of context names to IDs for task assignment
  const contextNameToId: Record<string, string> = {};

  // Generate contexts with IDs
  const contexts: Context[] = DEMO_CONTEXTS.map((def) => {
    const id = generateId();
    contextNameToId[def.name] = id;

    // Convert important dates from relative days to ISO strings
    const importantDates: ImportantDate[] | undefined = def.importantDates?.map(
      (date) => ({
        id: generateId(),
        label: date.label,
        date: addDays(today, date.daysFromNow).toISOString(),
      })
    );

    return {
      id,
      name: def.name,
      priority: def.priority,
      color: def.color,
      minDuration: def.minDuration,
      maxDuration: def.maxDuration,
      weight: def.weight,
      importantDates,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });

  // Generate tasks with proper context IDs
  const tasks: Task[] = DEMO_TASKS.map((def) => {
    const contextId = def.contextName ? contextNameToId[def.contextName] : null;
    const deadline = def.daysUntilDeadline
      ? addDays(today, def.daysUntilDeadline).toISOString()
      : undefined;

    return {
      id: generateId(),
      title: def.title,
      description: def.description,
      contextId,
      deadline,
      completed: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });

  return { contexts, tasks };
}
