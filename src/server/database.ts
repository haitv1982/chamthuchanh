import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_SUBMISSIONS } from '../data/mockSubmissions';
import { Submission, SubmissionAttempt, StudentRecord } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Thư mục và tệp lưu trữ CSDL bài nộp phòng máy
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'submissions_database.json');
const BACKUP_FILE = path.join(DATA_DIR, 'submissions_database.backup.json');
const ROSTER_FILE = path.join(DATA_DIR, 'student_roster.json');

export interface DatabaseState {
  version: string;
  lastUpdated: string;
  allowSubmission: boolean;
  teacherPin: string;
  submissions: Submission[];
}

let dbState: DatabaseState = {
  version: '2.0.0',
  lastUpdated: new Date().toISOString(),
  allowSubmission: true,
  teacherPin: '1234',
  submissions: [],
};

// Đảm bảo thư mục data tồn tại
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Lưu CSDL an toàn ra đĩa (Ghi atomic qua tệp tạm + sao lưu)
function flushDatabaseToDisk(): boolean {
  try {
    ensureDataDir();
    dbState.lastUpdated = new Date().toISOString();
    const dataStr = JSON.stringify(dbState, null, 2);

    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, dataStr, 'utf-8');
    fs.renameSync(tempFile, DB_FILE);

    // Lưu một bản sao lưu an toàn phòng trường hợp mất điện
    try {
      fs.writeFileSync(BACKUP_FILE, dataStr, 'utf-8');
    } catch {}

    return true;
  } catch (err) {
    console.error('[CSDL Thực Hành] Lỗi khi ghi dữ liệu ra đĩa:', err);
    return false;
  }
}

// Khởi động CSDL khi máy chủ khởi chạy
export function initLabDatabase(): DatabaseState {
  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.submissions)) {
        dbState = {
          version: parsed.version || '2.0.0',
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
          allowSubmission: typeof parsed.allowSubmission === 'boolean' ? parsed.allowSubmission : true,
          teacherPin: typeof parsed.teacherPin === 'string' && parsed.teacherPin ? parsed.teacherPin : '1234',
          submissions: parsed.submissions,
        };
        console.log(`[CSDL Thực Hành] Khôi phục thành công ${dbState.submissions.length} bài nộp từ CSDL đĩa: ${DB_FILE} (Cho phép nộp: ${dbState.allowSubmission ? 'BẬT' : 'KHÓA'})`);
        return dbState;
      }
    } catch (err) {
      console.warn('[CSDL Thực Hành] Không đọc được tệp CSDL chính, kiểm tra tệp backup:', err);
      if (fs.existsSync(BACKUP_FILE)) {
        try {
          const rawBackup = fs.readFileSync(BACKUP_FILE, 'utf-8');
          const parsed = JSON.parse(rawBackup);
          if (parsed && Array.isArray(parsed.submissions)) {
            dbState = {
              version: parsed.version || '2.0.0',
              lastUpdated: parsed.lastUpdated || new Date().toISOString(),
              allowSubmission: typeof parsed.allowSubmission === 'boolean' ? parsed.allowSubmission : true,
              teacherPin: typeof parsed.teacherPin === 'string' ? parsed.teacherPin : '1234',
              submissions: parsed.submissions,
            };
            console.log(`[CSDL Thực Hành] Đã khôi phục ${dbState.submissions.length} bản ghi từ tệp sao lưu.`);
            flushDatabaseToDisk();
            return dbState;
          }
        } catch {}
      }
    }
  }

  // Khởi tạo mới với mock submissions nếu chưa có dữ liệu
  dbState = {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    allowSubmission: true,
    teacherPin: '1234',
    submissions: [...INITIAL_SUBMISSIONS],
  };

  flushDatabaseToDisk();
  console.log(`[CSDL Thực Hành] Đã khởi tạo mới CSDL với ${dbState.submissions.length} bài nộp tại ${DB_FILE}`);
  return dbState;
}

// Lấy toàn bộ bài nộp trong CSDL thời gian thực
export function getAllSubmissions(): Submission[] {
  return dbState.submissions;
}

// Trạng thái cho phép nộp bài
export function getAllowSubmission(): boolean {
  return dbState.allowSubmission;
}

export function setAllowSubmission(allow: boolean): void {
  dbState.allowSubmission = allow;
  flushDatabaseToDisk();
}

// Mã PIN Giáo viên
export function getTeacherPin(): string {
  return dbState.teacherPin;
}

export function setTeacherPin(newPin: string): void {
  dbState.teacherPin = newPin;
  flushDatabaseToDisk();
}

// Tự động lưu và cập nhật kết quả nộp bài của học sinh ngay lập tức vào CSDL
export function upsertSubmission(newSub: any): { success: boolean; submission: Submission; totalCount: number } {
  if (!newSub || !newSub.className || !newSub.machineNumber) {
    throw new Error('Dữ liệu bài nộp thiếu thông tin lớp hoặc số máy');
  }

  const cleanLeader = (newSub.studentLeader || '').trim().toLowerCase();
  const subPracticeDate = newSub.practiceDate || (newSub.latestSubmittedAt ? newSub.latestSubmittedAt.slice(0, 10) : new Date().toISOString().slice(0, 10));

  // Tìm bản ghi trùng: cùng ID HOẶC cùng lớp + cùng máy + cùng ngày thực hành (hoặc cùng tên trưởng nhóm)
  const existingIdx = dbState.submissions.findIndex((s) => {
    if (!s) return false;
    if (newSub.id && s.id === newSub.id) return true;

    const sDate = s.practiceDate || (s.latestSubmittedAt ? s.latestSubmittedAt.slice(0, 10) : '');
    const isSameDate = !subPracticeDate || !sDate || subPracticeDate === sDate;

    if (s.className === newSub.className && s.machineNumber === newSub.machineNumber && isSameDate) {
      return true;
    }

    if (s.className === newSub.className && (s.studentLeader || '').trim().toLowerCase() === cleanLeader && isSameDate) {
      return true;
    }

    return false;
  });

  let finalizedSub: Submission;

  if (existingIdx >= 0) {
    const existing = dbState.submissions[existingIdx];

    // Gom nhóm và hợp nhất các lần nộp (attempts) tránh trùng lặp
    const attemptMap = new Map<number, SubmissionAttempt>();
    (existing.attempts || []).forEach((a) => attemptMap.set(a.attemptNumber, a));
    (newSub.attempts || []).forEach((a: SubmissionAttempt) => attemptMap.set(a.attemptNumber, a));

    const mergedAttempts = Array.from(attemptMap.values()).sort((a, b) => a.attemptNumber - b.attemptNumber);
    const highestScore = mergedAttempts.length > 0
      ? Math.max(...mergedAttempts.map((a) => a.score))
      : Math.max(existing.highestScore || 0, newSub.highestScore || 0);

    const latestAttempt = mergedAttempts[mergedAttempts.length - 1];

    finalizedSub = {
      ...existing,
      ...newSub,
      id: existing.id || newSub.id,
      assignmentId: newSub.assignmentId || existing.assignmentId,
      assignmentTitle: newSub.assignmentTitle || existing.assignmentTitle,
      className: newSub.className,
      machineNumber: newSub.machineNumber,
      studentLeader: newSub.studentLeader || existing.studentLeader,
      groupMembers: Array.isArray(newSub.groupMembers) && newSub.groupMembers.length > 0 ? newSub.groupMembers : existing.groupMembers,
      attempts: mergedAttempts,
      highestScore,
      latestScore: latestAttempt ? latestAttempt.score : (newSub.latestScore ?? highestScore),
      latestSubmittedAt: latestAttempt ? latestAttempt.timestamp : (newSub.latestSubmittedAt || new Date().toISOString()),
      practiceDate: subPracticeDate,
      status: highestScore >= 10 ? 'perfect' : highestScore >= 7 ? 'graded' : 'needs_improvement',
    };

    dbState.submissions[existingIdx] = finalizedSub;
  } else {
    const attempts = Array.isArray(newSub.attempts) ? newSub.attempts : [];
    const highestScore = attempts.length > 0
      ? Math.max(...attempts.map((a: any) => a.score))
      : (typeof newSub.highestScore === 'number' ? newSub.highestScore : 0);

    finalizedSub = {
      id: newSub.id || `sub-${newSub.className}-${newSub.machineNumber.replace(/\s+/g, '_')}-${Date.now()}`,
      assignmentId: newSub.assignmentId || '',
      assignmentTitle: newSub.assignmentTitle || 'Bài thực hành',
      className: newSub.className,
      machineNumber: newSub.machineNumber,
      studentLeader: newSub.studentLeader || 'Học sinh',
      groupMembers: Array.isArray(newSub.groupMembers) ? newSub.groupMembers : [],
      attempts: attempts,
      highestScore,
      latestScore: typeof newSub.latestScore === 'number' ? newSub.latestScore : highestScore,
      latestSubmittedAt: newSub.latestSubmittedAt || new Date().toISOString(),
      practiceDate: subPracticeDate,
      status: highestScore >= 10 ? 'perfect' : highestScore >= 7 ? 'graded' : 'needs_improvement',
    };

    dbState.submissions.unshift(finalizedSub);
  }

  // Ghi tức thời ra đĩa CSDL
  const saved = flushDatabaseToDisk();
  console.log(`[CSDL Thực Hành] ✅ Tự động lưu bài nộp: ${finalizedSub.studentLeader} - Lớp ${finalizedSub.className} (${finalizedSub.machineNumber}) -> Điểm: ${finalizedSub.highestScore}. Tổng CSDL: ${dbState.submissions.length}`);

  return {
    success: saved,
    submission: finalizedSub,
    totalCount: dbState.submissions.length,
  };
}

// Đồng bộ hàng loạt nhiều bài nộp (ví dụ khi kết nối lại hoặc nộp từ bộ nhớ đệm)
export function batchSyncSubmissions(list: any[]): { success: boolean; count: number } {
  if (!Array.isArray(list)) return { success: false, count: 0 };
  let addedOrUpdated = 0;
  for (const item of list) {
    try {
      upsertSubmission(item);
      addedOrUpdated++;
    } catch {}
  }
  flushDatabaseToDisk();
  return { success: true, count: addedOrUpdated };
}

// Xóa bài nộp theo lớp
export function deleteSubmissions(className?: string): number {
  if (className) {
    dbState.submissions = dbState.submissions.filter((s) => s.className !== className);
  } else {
    dbState.submissions = [];
  }
  flushDatabaseToDisk();
  return dbState.submissions.length;
}

// Thống kê trạng thái CSDL thời gian thực
export function getDatabaseMetrics() {
  const classCounts: Record<string, number> = {};
  let totalAttempts = 0;

  dbState.submissions.forEach((s) => {
    if (s && s.className) {
      classCounts[s.className] = (classCounts[s.className] || 0) + 1;
    }
    if (Array.isArray(s?.attempts)) {
      totalAttempts += s.attempts.length;
    }
  });

  return {
    status: 'connected',
    isPersistent: true,
    storageFile: DB_FILE,
    lastUpdated: dbState.lastUpdated,
    totalSubmissions: dbState.submissions.length,
    totalAttempts,
    allowSubmission: dbState.allowSubmission,
    classes: classCounts,
    timestamp: new Date().toISOString(),
  };
}

// ==============================================================
// QUẢN LÝ DANH SÁCH HỌC SINH TỪNG LỚP (TẢI LÊN TỪ EXCEL)
// ==============================================================
let studentRosterState: StudentRecord[] = [];

// Khởi tạo danh sách học sinh từ đĩa
function loadStudentRoster(): StudentRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(ROSTER_FILE)) {
      const raw = fs.readFileSync(ROSTER_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        studentRosterState = parsed;
        console.log(`[CSDL Học Sinh] Đã tải ${studentRosterState.length} học sinh từ tệp: ${ROSTER_FILE}`);
        return studentRosterState;
      }
    }
  } catch (err) {
    console.warn('[CSDL Học Sinh] Lỗi khi nạp danh sách học sinh:', err);
  }
  studentRosterState = [];
  return studentRosterState;
}

// Lưu danh sách học sinh ra đĩa
function flushStudentRosterToDisk(): boolean {
  try {
    ensureDataDir();
    const tempFile = `${ROSTER_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(studentRosterState, null, 2), 'utf-8');
    fs.renameSync(tempFile, ROSTER_FILE);
    return true;
  } catch (err) {
    console.error('[CSDL Học Sinh] Lỗi khi lưu danh sách học sinh ra đĩa:', err);
    return false;
  }
}

// Nạp danh sách khi khởi động
loadStudentRoster();

// Lấy toàn bộ danh sách học sinh
export function getAllStudents(): StudentRecord[] {
  if (studentRosterState.length === 0) {
    loadStudentRoster();
  }
  return studentRosterState;
}

// Lưu danh sách học sinh từ Excel
export function saveStudentRoster(
  records: StudentRecord[],
  mode: 'replace' | 'upsert' = 'replace'
): { success: boolean; total: number; classes: string[] } {
  if (!Array.isArray(records)) {
    return { success: false, total: studentRosterState.length, classes: [] };
  }

  // Chuẩn hóa bản ghi
  const cleaned: StudentRecord[] = records
    .filter((r) => r && typeof r.fullName === 'string' && r.fullName.trim() && r.className)
    .map((r, idx) => ({
      stt: r.stt !== undefined && r.stt !== null ? r.stt : idx + 1,
      fullName: r.fullName.trim(),
      className: r.className.trim().toUpperCase(),
    }));

  if (mode === 'replace') {
    // Thay thế toàn bộ hoặc thay thế theo các lớp có trong tệp tải lên
    const incomingClasses = new Set(cleaned.map((c) => c.className));
    const retained = studentRosterState.filter((s) => !incomingClasses.has(s.className));
    studentRosterState = [...retained, ...cleaned];
  } else {
    // Upsert tránh trùng lặp
    const map = new Map<string, StudentRecord>();
    studentRosterState.forEach((s) => {
      const key = `${s.className}___${s.fullName.toLowerCase()}`;
      map.set(key, s);
    });
    cleaned.forEach((s) => {
      const key = `${s.className}___${s.fullName.toLowerCase()}`;
      map.set(key, s);
    });
    studentRosterState = Array.from(map.values());
  }

  // Sắp xếp theo lớp rồi theo STT hoặc họ tên
  studentRosterState.sort((a, b) => {
    if (a.className !== b.className) return a.className.localeCompare(b.className);
    const sttA = Number(a.stt) || 999;
    const sttB = Number(b.stt) || 999;
    if (sttA !== sttB) return sttA - sttB;
    return a.fullName.localeCompare(b.fullName, 'vi');
  });

  flushStudentRosterToDisk();

  const classes = Array.from(new Set(studentRosterState.map((s) => s.className)));
  console.log(`[CSDL Học Sinh] Đã cập nhật ${studentRosterState.length} học sinh thuộc ${classes.length} lớp.`);

  return {
    success: true,
    total: studentRosterState.length,
    classes,
  };
}

// Xóa danh sách học sinh theo lớp hoặc toàn bộ
export function deleteStudentRoster(className?: string): { success: boolean; count: number } {
  if (className) {
    const norm = className.trim().toUpperCase();
    studentRosterState = studentRosterState.filter((s) => s.className !== norm);
  } else {
    studentRosterState = [];
  }
  flushStudentRosterToDisk();
  return { success: true, count: studentRosterState.length };
}
