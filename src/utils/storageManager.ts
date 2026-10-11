import { Submission } from '../types';

export const STORAGE_KEY_SUBMISSIONS = 'labgrade_submissions_v2';
export const STORAGE_KEY_OLD_V1 = 'labgrade_submissions_v1';
export const MAX_RETAINED_SUBMISSIONS = 120; // Ngưỡng an toàn lưu trữ lịch sử

/**
 * Lấy chuỗi ngày YYYY-MM-DD theo giờ địa phương Việt Nam
 */
export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Định dạng hiển thị ngày tiếng Việt (DD/MM/YYYY)
 */
export function formatPracticeDateVi(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Kiểm tra xem một thời điểm nộp bài có thuộc ngày hôm nay hay không
 */
export function isSubmittedToday(submittedAt: string, todayStr: string = getTodayDateString()): boolean {
  if (!submittedAt) return false;
  return submittedAt.slice(0, 10) === todayStr;
}

/**
 * Kiểm tra tính hợp lệ của Họ và Tên tiếng Việt:
 * Bắt buộc phải có cả Họ và Tên (tối thiểu 2 từ), không được chỉ nhập mỗi Tên.
 */
export function validateVietnameseFullName(rawName: string): {
  isValid: boolean;
  cleanName: string;
  error?: string;
} {
  const cleanName = (rawName || '').trim().replace(/\s+/g, ' ');
  if (!cleanName) {
    return {
      isValid: false,
      cleanName: '',
      error: 'Vui lòng nhập Họ và tên (không được để trống).',
    };
  }

  const words = cleanName.split(' ');
  if (words.length < 2) {
    return {
      isValid: false,
      cleanName,
      error: `Em mới chỉ nhập tên "${cleanName}". Vui lòng nhập đầy đủ cả Họ và Tên (ví dụ: "Nguyễn Văn ${cleanName}")!`,
    };
  }

  // Mỗi từ phải có ít nhất 1 ký tự chữ
  if (words.some((w) => w.length < 1)) {
    return {
      isValid: false,
      cleanName,
      error: 'Họ và tên không hợp lệ. Vui lòng nhập đúng định dạng.',
    };
  }

  return {
    isValid: true,
    cleanName,
  };
}

/**
 * Tự động cắt tỉa và dọn dẹp các bản ghi cũ khi đầy bộ nhớ (Auto-pruning / cleanup on full)
 * Giữ lại tất cả các bản ghi ngày hôm nay và những ngày gần nhất, tự động xóa các ngày cũ nhất.
 */
export function pruneOldSubmissions(submissions: Submission[], maxCount: number = MAX_RETAINED_SUBMISSIONS): Submission[] {
  if (submissions.length <= maxCount) {
    return submissions;
  }

  const todayStr = getTodayDateString();

  // Tách nhóm: Ngày hôm nay vs Các ngày trước đó
  const todayList = submissions.filter((s) => s.practiceDate === todayStr || isSubmittedToday(s.latestSubmittedAt, todayStr));
  const pastList = submissions.filter((s) => s.practiceDate !== todayStr && !isSubmittedToday(s.latestSubmittedAt, todayStr));

  // Sắp xếp ngày cũ từ mới nhất đến cũ nhất
  pastList.sort((a, b) => {
    const tA = new Date(a.latestSubmittedAt || a.practiceDate || 0).getTime();
    const tB = new Date(b.latestSubmittedAt || b.practiceDate || 0).getTime();
    return tB - tA;
  });

  // Số lượng ngày cũ được phép giữ lại
  const allowedPast = Math.max(10, maxCount - todayList.length);
  const retainedPast = pastList.slice(0, allowedPast);

  // Thu nhỏ dữ liệu của các bản ghi cũ: gọt bớt fileContent lớn để giải phóng bộ nhớ
  const lightenedPast = retainedPast.map((sub) => ({
    ...sub,
    attempts: sub.attempts.map((att) => ({
      ...att,
      fileContent: undefined, // Xóa nội dung nặng của các ngày cũ để tiết kiệm 95% bộ nhớ
    })),
  }));

  return [...todayList, ...lightenedPast];
}

/**
 * Lưu danh sách bài nộp vào localStorage với cơ chế chống tràn bộ nhớ (Quota Protection)
 */
export function saveSubmissionsSafely(submissions: Submission[]): boolean {
  try {
    const pruned = pruneOldSubmissions(submissions);
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(pruned));
    return true;
  } catch (err: any) {
    console.warn('Lưu trữ localStorage bị đầy, đang tự động dọn dẹp các ngày cũ:', err);
    try {
      // Dọn dẹp mạnh: chỉ giữ lại 30 bài gần nhất
      const aggressivePrune = pruneOldSubmissions(submissions, 30);
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(aggressivePrune));
      return true;
    } catch (criticalErr) {
      console.error('Không thể lưu vào localStorage sau khi dọn dẹp:', criticalErr);
      return false;
    }
  }
}

/**
 * Tải danh sách bài nộp từ localStorage (có tương thích ngược với v1)
 */
export function loadSubmissionsSafely(): Submission[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
    // Kiểm tra v1 cũ nếu chưa có v2
    const oldV1 = localStorage.getItem(STORAGE_KEY_OLD_V1);
    if (oldV1) {
      const parsedOld = JSON.parse(oldV1);
      if (Array.isArray(parsedOld)) return parsedOld;
    }
  } catch (e) {
    console.warn('Lỗi đọc submissions từ localStorage:', e);
  }
  return [];
}
