export const SCHOOL_CLASSES = [
  '6A1', '6A2', '6A3', '6A4', '6B1', '6B2', '6C1', '6C2', '6D1', '6D2',
  '7A1', '7A2', '7A3', '7A4', '7B1', '7B2', '7C1', '7C2',
  '8A1', '8A2', '8A3', '8A4', '8B1', '8B2', '8C1', '8C2',
  '9A1', '9A2', '9A3', '9A4', '9B1', '9B2', '9C1', '9C2',
] as const;

export type SchoolClass = string;

/**
 * Trích xuất chữ số khối lớp (6, 7, 8, 9) từ bất kỳ chuỗi nào (vd: 'Lớp 6', 'Khối 8', 'Grade 7', '8A1', 'Lớp 9A2')
 */
export function extractGradeDigit(val: string): string {
  const m = String(val || '').match(/([6-9])/);
  return m ? m[1] : '';
}

/**
 * Chuẩn hóa tên lớp bỏ tiền tố 'Lớp', 'Lop' và khoảng trắng (vd: 'Lớp 8A1' -> '8A1')
 */
export function normalizeClassName(className: string): string {
  return String(className || '')
    .trim()
    .toUpperCase()
    .replace(/^(LỚP|LOP|KHỐI|KHOI|CLASS|GRADE)\s*/i, '')
    .replace(/\s+/g, '');
}

export function getClassesByGrade(gradeLevel: string): string[] {
  const digit = extractGradeDigit(gradeLevel);
  if (digit) {
    return SCHOOL_CLASSES.filter((c) => extractGradeDigit(c) === digit);
  }
  return [...SCHOOL_CLASSES];
}
