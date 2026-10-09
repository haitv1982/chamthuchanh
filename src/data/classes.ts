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
