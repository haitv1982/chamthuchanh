export const SCHOOL_CLASSES = [
  '6A2',
  '6B2',
  '6C2',
  '6D2',
  '7A2',
  '7B2',
  '7C2',
  '8A2',
  '8B2',
  '8C2',
  '9A2',
  '9B2',
  '9C2',
] as const;

export type SchoolClass = typeof SCHOOL_CLASSES[number];

export function getClassesByGrade(gradeLevel: string): string[] {
  if (gradeLevel === 'Lớp 6' || gradeLevel === 'Khối 6' || gradeLevel === '6') {
    return SCHOOL_CLASSES.filter((c) => c.startsWith('6'));
  }
  if (gradeLevel === 'Lớp 7' || gradeLevel === 'Khối 7' || gradeLevel === '7') {
    return SCHOOL_CLASSES.filter((c) => c.startsWith('7'));
  }
  if (gradeLevel === 'Lớp 8' || gradeLevel === 'Khối 8' || gradeLevel === '8') {
    return SCHOOL_CLASSES.filter((c) => c.startsWith('8'));
  }
  if (gradeLevel === 'Lớp 9' || gradeLevel === 'Khối 9' || gradeLevel === '9') {
    return SCHOOL_CLASSES.filter((c) => c.startsWith('9'));
  }
  return [...SCHOOL_CLASSES];
}
