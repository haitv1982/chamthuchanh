import { Assignment } from '../types';
import { GRADE_6_PRODUCTS } from './grade6Products';
import { GRADE_7_PRODUCTS } from './grade7Products';
import { GRADE_8_PRODUCTS } from './grade8Products';
import { GRADE_9_PRODUCTS } from './grade9Products';

// Danh mục sản phẩm thực hành chính thức: Khối 6, Khối 7, Khối 8 & Khối 9
export const DEFAULT_ASSIGNMENTS: Assignment[] = [
  ...GRADE_6_PRODUCTS,
  ...GRADE_7_PRODUCTS,
  ...GRADE_8_PRODUCTS,
  ...GRADE_9_PRODUCTS,
];

export { GRADE_6_PRODUCTS, GRADE_7_PRODUCTS, GRADE_8_PRODUCTS, GRADE_9_PRODUCTS };

