import { Submission } from '../types';

export const STORAGE_KEY_SUBMISSIONS = 'labgrade_submissions_v5';
export const STORAGE_KEY_OLD_V4 = 'labgrade_submissions_v4';
export const STORAGE_KEY_OLD_V3 = 'labgrade_submissions_v3';
export const STORAGE_KEY_OLD_V2 = 'labgrade_submissions_v2';
export const STORAGE_KEY_OLD_V1 = 'labgrade_submissions_v1';
export const STORAGE_KEY_CLEANED_FLAG = 'labgrade_virtual_data_cleaned_v5';
export const MAX_RETAINED_SUBMISSIONS = 120; // Ngưỡng an toàn lưu trữ lịch sử

/**
 * Xóa sạch toàn bộ kết quả chấm ảo các ngày trước đây và các bài nộp cũ trong localStorage
 */
export function purgeAllLegacySubmissions(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY_SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEY_OLD_V4);
    localStorage.removeItem(STORAGE_KEY_OLD_V3);
    localStorage.removeItem(STORAGE_KEY_OLD_V2);
    localStorage.removeItem(STORAGE_KEY_OLD_V1);
    localStorage.removeItem('labgrade_submissions');
    localStorage.removeItem('labgrade_pending_sync_queue_v1');
    localStorage.setItem(STORAGE_KEY_CLEANED_FLAG, 'true');
    console.log('[Bộ nhớ phòng máy] ✅ Đã xóa sạch toàn bộ kết quả chấm ảo các ngày trước đây trên trình duyệt.');
  } catch {}
}

// Tự động dọn dẹp sạch sẽ các bản ghi ảo cũ khi người dùng mở trang
if (typeof window !== 'undefined') {
  try {
    const isCleaned = localStorage.getItem(STORAGE_KEY_CLEANED_FLAG);
    if (!isCleaned) {
      purgeAllLegacySubmissions();
    }
  } catch {}
}

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
 * Chuẩn hóa và làm sạch bản ghi bài nộp, đảm bảo không bao giờ bị lỗi undefined property gây màn hình trắng
 */
export function sanitizeSubmission(raw: any): Submission {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 'sub-' + Math.random().toString(36).substring(2, 9),
      assignmentId: '',
      assignmentTitle: '',
      className: '',
      machineNumber: 'Máy 01',
      studentLeader: 'Học sinh',
      groupMembers: [],
      attempts: [],
      highestScore: 0,
      latestScore: 0,
      latestSubmittedAt: new Date().toISOString(),
      status: 'graded',
    };
  }

  const rawMembers = Array.isArray(raw.groupMembers)
    ? raw.groupMembers.filter((m: any) => typeof m === 'string' && m.trim()).map((m: any) => m.trim())
    : [];

  const rawAttempts = Array.isArray(raw.attempts)
    ? raw.attempts.map((att: any, idx: number) => ({
        attemptNumber: typeof att?.attemptNumber === 'number' ? att.attemptNumber : idx + 1,
        timestamp: att?.timestamp || new Date().toISOString(),
        fileName: att?.fileName || 'bai_thuc_hanh',
        fileSize: typeof att?.fileSize === 'number' ? att.fileSize : 0,
        fileLastModified: typeof att?.fileLastModified === 'number' ? att.fileLastModified : undefined,
        fileContent: att?.fileContent || '',
        fileDataUrl: att?.fileDataUrl || undefined,
        imageBase64: att?.imageBase64 || undefined,
        score: typeof att?.score === 'number' ? att.score : 0,
        aiComparisonDetails: att?.aiComparisonDetails || '',
        criteriaResults: Array.isArray(att?.criteriaResults) ? att.criteriaResults : [],
        strengths: Array.isArray(att?.strengths) ? att.strengths : [],
        weaknesses: Array.isArray(att?.weaknesses) ? att.weaknesses : [],
        howToGetTen: Array.isArray(att?.howToGetTen) ? att.howToGetTen : [],
        stepEvaluations: Array.isArray(att?.stepEvaluations) ? att.stepEvaluations : [],
        inspectionSummary: att?.inspectionSummary || undefined,
        plagiarismAlert: att?.plagiarismAlert || undefined,
        teacherNote: att?.teacherNote || '',
      }))
    : [];

  const highestScore = typeof raw.highestScore === 'number'
    ? raw.highestScore
    : rawAttempts.reduce((max: number, a: any) => Math.max(max, a.score || 0), 0);

  return {
    id: String(raw.id || 'sub-' + Math.random().toString(36).substring(2, 9)),
    assignmentId: String(raw.assignmentId || ''),
    assignmentTitle: String(raw.assignmentTitle || ''),
    className: String(raw.className || ''),
    machineNumber: String(raw.machineNumber || 'Máy 01'),
    studentLeader: String(raw.studentLeader || '').trim(),
    groupMembers: rawMembers,
    attempts: rawAttempts,
    highestScore,
    latestScore: typeof raw.latestScore === 'number' ? raw.latestScore : highestScore,
    latestSubmittedAt: String(raw.latestSubmittedAt || new Date().toISOString()),
    practiceDate: raw.practiceDate ? String(raw.practiceDate) : undefined,
    status: raw.status || 'graded',
  };
}

/**
 * Tải danh sách bài nộp từ localStorage (an toàn 100%, tự động làm sạch và hỗ trợ fallback)
 */
export function loadSubmissionsSafely(fallback: Submission[] = []): Submission[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((s) => s && !String(s.id).startsWith('mock-'))
          .map(sanitizeSubmission);
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc submissions từ localStorage:', e);
  }
  return Array.isArray(fallback)
    ? fallback.filter((s) => s && !String(s.id).startsWith('mock-')).map(sanitizeSubmission)
    : [];
}

const STORAGE_KEY_PENDING_SYNC = 'labgrade_pending_sync_queue_v1';

/**
 * Xếp hàng bài nộp vào hàng đợi offline nếu mất kết nối tạm thời tới CSDL máy chủ
 */
export function queuePendingSync(sub: Submission): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENDING_SYNC);
    const queue: Submission[] = raw ? JSON.parse(raw) : [];
    const idx = queue.findIndex((item) => item.id === sub.id);
    if (idx >= 0) {
      queue[idx] = sub;
    } else {
      queue.push(sub);
    }
    localStorage.setItem(STORAGE_KEY_PENDING_SYNC, JSON.stringify(queue));
  } catch (e) {
    console.warn('Lỗi xếp hàng offline sync:', e);
  }
}

/**
 * Lấy danh sách bài nộp đang chờ đồng bộ vào CSDL
 */
export function getPendingSyncQueue(): Submission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENDING_SYNC);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(sanitizeSubmission);
    }
  } catch {}
  return [];
}

/**
 * Xóa hàng đợi bài nộp sau khi đã đồng bộ thành công vào CSDL
 */
export function clearPendingSyncQueue(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PENDING_SYNC);
  } catch {}
}
