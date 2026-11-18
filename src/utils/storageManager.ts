import { Submission, ClassGradebookDocument, StudentGradebookEntry, StudentProductScoreEntry } from '../types';
import { normalizeClassName } from '../data/classes';

export const STORAGE_KEY_SUBMISSIONS = 'labgrade_submissions_v5';
export const STORAGE_KEY_GRADEBOOKS = 'labgrade_permanent_gradebooks_v1';
export const STORAGE_KEY_OLD_V4 = 'labgrade_submissions_v4';
export const STORAGE_KEY_OLD_V3 = 'labgrade_submissions_v3';
export const STORAGE_KEY_OLD_V2 = 'labgrade_submissions_v2';
export const STORAGE_KEY_OLD_V1 = 'labgrade_submissions_v1';
export const STORAGE_KEY_CLEANED_FLAG = 'labgrade_virtual_data_cleaned_v5';
export const MAX_RETAINED_SUBMISSIONS = 600; // Ngưỡng an toàn lưu trữ nhiều sản phẩm SP1, SP2... across sessions

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

/**
 * Chuẩn hóa khóa học sinh an toàn cho cả Map JS và Firestore field path
 */
export function normalizeGradebookStudentKey(fullName: string): string {
  return (fullName || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[./\[\]~*]/g, '_');
}

/**
 * Chuẩn hóa khóa mã bài tập an toàn cho Firestore field path
 */
export function normalizeGradebookAssignmentKey(assignmentId: string): string {
  return (assignmentId || 'default_sp').trim().replace(/[./\[\]~*]/g, '_');
}

/**
 * Hợp nhất 2 bảng điểm vĩnh viễn theo lớp (luôn lấy điểm cao nhất của từng SP1, SP2,...)
 */
export function mergeGradebooksClient(
  base: Record<string, ClassGradebookDocument> = {},
  incoming: Record<string, ClassGradebookDocument> = {}
): Record<string, ClassGradebookDocument> {
  const result: Record<string, ClassGradebookDocument> = {};

  const applyDoc = (rawDoc: ClassGradebookDocument) => {
    if (!rawDoc || !rawDoc.className) return;
    const normCls = normalizeClassName(rawDoc.className);
    if (!normCls) return;

    if (!result[normCls]) {
      result[normCls] = {
        className: normCls,
        students: {},
        updatedAt: rawDoc.updatedAt || new Date().toISOString(),
      };
    }

    const targetDoc = result[normCls];
    const incomingStudents = rawDoc.students || {};
    Object.values(incomingStudents).forEach((stu) => {
      if (!stu || !stu.fullName) return;
      const key = normalizeGradebookStudentKey(stu.fullName);
      if (!key) return;

      if (!targetDoc.students[key]) {
        targetDoc.students[key] = {
          studentKey: key,
          fullName: stu.fullName.trim(),
          className: normCls,
          scores: {},
          updatedAt: stu.updatedAt || new Date().toISOString(),
        };
      }

      const targetStu = targetDoc.students[key];
      if (stu.fullName.trim().length >= targetStu.fullName.length) {
        targetStu.fullName = stu.fullName.trim();
      }

      Object.entries(stu.scores || {}).forEach(([aId, entry]) => {
        if (!entry) return;
        const safeAId = entry.assignmentId || aId;
        const existingEntry = targetStu.scores[safeAId];
        if (!existingEntry) {
          targetStu.scores[safeAId] = { ...entry, assignmentId: safeAId };
        } else {
          const bestHigh = Math.max(Number(existingEntry.highestScore) || 0, Number(entry.highestScore) || 0);
          const isIncomingNewer = (entry.updatedAt || '') >= (existingEntry.updatedAt || '');
          targetStu.scores[safeAId] = {
            assignmentId: safeAId,
            assignmentTitle: entry.assignmentTitle || existingEntry.assignmentTitle,
            highestScore: bestHigh,
            latestScore: isIncomingNewer ? entry.latestScore : existingEntry.latestScore,
            attemptsCount: Math.max(Number(existingEntry.attemptsCount) || 1, Number(entry.attemptsCount) || 1),
            lastFileName: isIncomingNewer ? (entry.lastFileName || existingEntry.lastFileName) : existingEntry.lastFileName,
            updatedAt: isIncomingNewer ? entry.updatedAt : existingEntry.updatedAt,
          };
        }
      });

      if ((stu.updatedAt || '') > (targetStu.updatedAt || '')) {
        targetStu.updatedAt = stu.updatedAt;
      }
    });

    if ((rawDoc.updatedAt || '') > (targetDoc.updatedAt || '')) {
      targetDoc.updatedAt = rawDoc.updatedAt;
    }
  };

  Object.values(base || {}).forEach(applyDoc);
  Object.values(incoming || {}).forEach(applyDoc);
  return result;
}

/**
 * Cập nhật một bài nộp mới (SP1, SP2,...) vào Bảng Tổng Hợp Điểm Vĩnh Viễn của lớp
 */
export function upsertGradebookFromSubmissionClient(
  current: Record<string, ClassGradebookDocument>,
  sub: Submission
): Record<string, ClassGradebookDocument> {
  if (!sub || !sub.className || !sub.assignmentId) return current;
  const normCls = normalizeClassName(sub.className);
  if (!normCls) return current;

  const participantNames = [
    sub.studentLeader,
    ...(Array.isArray(sub.groupMembers) ? sub.groupMembers : []),
  ]
    .map((n) => (n || '').trim())
    .filter(Boolean);

  if (participantNames.length === 0) return current;

  const nowIso = sub.latestSubmittedAt || new Date().toISOString();
  const latestAtt = Array.isArray(sub.attempts) && sub.attempts.length > 0
    ? sub.attempts[sub.attempts.length - 1]
    : null;

  const studentsMap: Record<string, StudentGradebookEntry> = {};
  participantNames.forEach((fullName) => {
    const key = normalizeGradebookStudentKey(fullName);
    if (!key) return;
    const scoreEntry: StudentProductScoreEntry = {
      assignmentId: sub.assignmentId,
      assignmentTitle: sub.assignmentTitle || 'Sản phẩm thực hành',
      highestScore: typeof sub.highestScore === 'number' ? sub.highestScore : 0,
      latestScore: typeof sub.latestScore === 'number' ? sub.latestScore : (sub.highestScore || 0),
      attemptsCount: Array.isArray(sub.attempts) && sub.attempts.length > 0 ? sub.attempts.length : 1,
      lastFileName: latestAtt?.fileName,
      updatedAt: nowIso,
    };
    studentsMap[key] = {
      studentKey: key,
      fullName,
      className: normCls,
      scores: {
        [sub.assignmentId]: scoreEntry,
      },
      updatedAt: nowIso,
    };
  });

  const delta: Record<string, ClassGradebookDocument> = {
    [normCls]: {
      className: normCls,
      students: studentsMap,
      updatedAt: nowIso,
    },
  };

  return mergeGradebooksClient(current, delta);
}

export function saveGradebooksSafely(gradebooks: Record<string, ClassGradebookDocument>): boolean {
  try {
    if (typeof window === 'undefined') return false;
    localStorage.setItem(STORAGE_KEY_GRADEBOOKS, JSON.stringify(gradebooks || {}));
    return true;
  } catch (err) {
    console.warn('Không thể lưu bảng điểm tổng hợp vào localStorage:', err);
    return false;
  }
}

export function loadGradebooksSafely(): Record<string, ClassGradebookDocument> {
  try {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_KEY_GRADEBOOKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc bảng điểm tổng hợp từ localStorage:', err);
  }
  return {};
}
