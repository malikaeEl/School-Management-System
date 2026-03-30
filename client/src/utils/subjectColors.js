/**
 * Deterministic color mapping for subjects in the timetable.
 * Uses inline hex styles to avoid Tailwind purging dynamic class names.
 */

// 10 highly distinct, vibrant colors
const SUBJECT_COLORS = [
  { main: '#16a34a', light: '#bbf7d0', dark: '#15803d' }, // vivid green
  { main: '#2563eb', light: '#bfdbfe', dark: '#1d4ed8' }, // vivid blue
  { main: '#dc2626', light: '#fecaca', dark: '#b91c1c' }, // vivid red
  { main: '#d97706', light: '#fde68a', dark: '#b45309' }, // vivid amber
  { main: '#7c3aed', light: '#ddd6fe', dark: '#6d28d9' }, // vivid violet
  { main: '#0891b2', light: '#a5f3fc', dark: '#0e7490' }, // vivid cyan
  { main: '#db2777', light: '#fbcfe8', dark: '#be185d' }, // vivid pink
  { main: '#65a30d', light: '#d9f99d', dark: '#4d7c0f' }, // vivid lime
  { main: '#ea580c', light: '#fed7aa', dark: '#c2410c' }, // vivid orange
  { main: '#0f766e', light: '#99f6e4', dark: '#0f5a54' }, // vivid teal
];

/**
 * Stable hash: same subject name → same index, every time.
 */
function hashSubject(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % SUBJECT_COLORS.length;
  }
  return hash;
}

/**
 * Returns the color entry for a given subject name.
 */
export function getSubjectColor(subjectName = '') {
  return SUBJECT_COLORS[hashSubject(subjectName)];
}

/**
 * Returns an inline style object for the FULL slot card (gradient background).
 * Used in the main Admin timetable grid.
 */
export function getSubjectGradientStyle(subjectName = '') {
  const c = getSubjectColor(subjectName);
  return {
    background: `linear-gradient(135deg, ${c.main}, ${c.dark})`,
  };
}

/**
 * Returns inline style for a colored left border accent bar.
 * Used in TeacherDashboard list and ParentDashboard cards.
 */
export function getSubjectAccentStyle(subjectName = '') {
  const c = getSubjectColor(subjectName);
  return { color: c.main };
}

/**
 * Returns inline style for a colored left border on a card.
 */
export function getSubjectBorderStyle(subjectName = '') {
  const c = getSubjectColor(subjectName);
  return { borderLeftColor: c.main };
}

/**
 * Returns inline style for a colored accent bar (vertical strip).
 */
export function getSubjectBarStyle(subjectName = '') {
  const c = getSubjectColor(subjectName);
  return { backgroundColor: c.main };
}

