/**
 * School class levels for Atlas Academy
 * Moroccan curriculum structure
 */
export const SCHOOL_CYCLES = {
  primaire: {
    label: 'Primaire',
    levels: ['CP', 'CE1', 'CE2', 'CM1', 'CM2']
  },
  college: {
    label: 'Collège',
    levels: [
      '1ère année collège',
      '2ème année collège',
      '3ème année collège'
    ]
  },
  lycee: {
    label: 'Lycée',
    levels: [
      'T.C',
      '1ère année S.M',
      '1ère année S.Ex',
      '2ème année S.M',
      '2ème année SVT',
      '2ème année PC'
    ]
  }
};

// Flat list of all school levels
export const ALL_LEVELS = [
  ...SCHOOL_CYCLES.primaire.levels,
  ...SCHOOL_CYCLES.college.levels,
  ...SCHOOL_CYCLES.lycee.levels
];

// Helper to get cycle name from level
export function getCycleForLevel(level) {
  for (const [key, cycle] of Object.entries(SCHOOL_CYCLES)) {
    if (cycle.levels.includes(level)) return cycle.label;
  }
  return null;
}
