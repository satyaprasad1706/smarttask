const suggestions: Record<string, string[]> = {
  work: ['Prepare meeting agenda', 'Reply to emails', 'Update project status', 'Review pull requests', 'Write weekly report'],
  study: ['Read chapter summary', 'Review notes', 'Practice exercises', 'Watch lecture video', 'Make flashcards'],
  health: ['30 min workout', 'Drink 8 glasses of water', 'Meal prep for the week', 'Schedule doctor appointment', 'Take vitamins'],
  home: ['Clean kitchen', 'Do laundry', 'Vacuum living room', 'Take out trash', 'Organize closet'],
  shop: ['Buy groceries', 'Order online', 'Check wishlist', 'Compare prices', 'Return items'],
  call: ['Call mom', 'Schedule meeting', 'Follow up with client', 'Confirm appointment', 'Check in with team'],
  read: ['Read 20 pages', 'Finish article', 'Review documentation', 'Read newsletter', 'Catch up on news'],
  write: ['Write journal entry', 'Draft email', 'Update resume', 'Write blog post', 'Document findings'],
};

const defaults = [
  'Plan tomorrow\'s schedule',
  'Review goals for the week',
  'Clear inbox',
  'Take a 10-minute break',
  'Organize workspace',
  'Set a new goal',
  'Follow up on pending items',
];

export function getSuggestions(input: string): string[] {
  const lower = input.toLowerCase();
  for (const [key, items] of Object.entries(suggestions)) {
    if (lower.includes(key)) return items;
  }
  if (lower.length === 0) return defaults;
  // fuzzy: return suggestions whose keys partially match any word
  const words = lower.split(/\s+/);
  for (const word of words) {
    for (const [key, items] of Object.entries(suggestions)) {
      if (key.includes(word) || word.includes(key)) return items;
    }
  }
  return defaults;
}
