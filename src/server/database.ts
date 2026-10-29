import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_SUBMISSIONS } from '../data/mockSubmissions';
import { Submission, SubmissionAttempt, StudentRecord, PlagiarismAlert } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Thư mục và tệp lưu trữ CSDL bài nộp phòng máy
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'submissions_database.json');
const BACKUP_FILE = path.join(DATA_DIR, 'submissions_database.backup.json');
const ROSTER_FILE = path.join(DATA_DIR, 'student_roster.json');
const ROSTERS_DIR = path.join(DATA_DIR, 'rosters_by_class');

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

  const todayStr = new Date().toISOString().slice(0, 10);

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.submissions)) {
        // Loại bỏ bài nộp mock ảo, giữ nguyên toàn bộ bài nộp thực tế của học sinh
        const cleanSubmissions = parsed.submissions.filter((s: any) => {
          if (!s || String(s.id).startsWith('mock-')) return false;
          return true;
        });

        dbState = {
          version: parsed.version || '2.0.0',
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
          allowSubmission: typeof parsed.allowSubmission === 'boolean' ? parsed.allowSubmission : true,
          teacherPin: typeof parsed.teacherPin === 'string' && parsed.teacherPin ? parsed.teacherPin : '1234',
          submissions: cleanSubmissions,
        };
        flushDatabaseToDisk();
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
            const cleanSubmissions = parsed.submissions.filter((s: any) => {
              if (!s || String(s.id).startsWith('mock-')) return false;
              return true;
            });
            dbState = {
              version: parsed.version || '2.0.0',
              lastUpdated: parsed.lastUpdated || new Date().toISOString(),
              allowSubmission: typeof parsed.allowSubmission === 'boolean' ? parsed.allowSubmission : true,
              teacherPin: typeof parsed.teacherPin === 'string' ? parsed.teacherPin : '1234',
              submissions: cleanSubmissions,
            };
            console.log(`[CSDL Thực Hành] Đã khôi phục ${dbState.submissions.length} bản ghi từ tệp sao lưu.`);
            flushDatabaseToDisk();
            return dbState;
          }
        } catch {}
      }
    }
  }

  // Khởi tạo mới sạch sẽ 100% (0 bài nộp ảo) theo yêu cầu người dùng
  dbState = {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    allowSubmission: true,
    teacherPin: '1234',
    submissions: [],
  };

  flushDatabaseToDisk();
  console.log(`[CSDL Thực Hành] Đã khởi tạo mới CSDL sạch với 0 bài nộp tại ${DB_FILE}`);
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

// Thuật toán quét và phát hiện học sinh lớp sau lấy y nguyên tệp của học sinh lớp trước
export function detectPlagiarism(params: {
  className: string;
  machineNumber: string;
  studentLeader: string;
  assignmentId?: string;
  fileName: string;
  fileSize: number;
  fileLastModified?: number;
  fileContent?: string;
  imageBase64?: string;
}): PlagiarismAlert | null {
  const { className, machineNumber, studentLeader, fileName, fileSize, fileLastModified, fileContent, imageBase64 } = params;
  if (!fileSize || fileSize < 50) return null;

  const currentContent = (fileContent || '').trim();
  const cleanCurrentLeader = (studentLeader || '').trim().toLowerCase();
  const currentMachineClean = (machineNumber || '').trim().toLowerCase();

  // Duyệt qua tất cả các bài nộp đã có trong CSDL
  for (const sub of dbState.submissions) {
    if (!sub || !Array.isArray(sub.attempts)) continue;

    const subLeader = (sub.studentLeader || '').trim().toLowerCase();
    const isDifferentClass = sub.className !== className;
    const isDifferentStudentSameClass = sub.className === className && subLeader !== cleanCurrentLeader;
    const isSameMachine = (sub.machineNumber || '').trim().toLowerCase() === currentMachineClean;

    // Chỉ phát hiện khi đối chiếu với bài của lớp khác hoặc học sinh khác
    if (!isDifferentClass && !isDifferentStudentSameClass) continue;

    for (const attempt of sub.attempts) {
      if (!attempt || !attempt.fileSize) continue;

      // 1. Kiểm tra kích thước byte trùng khớp tuyệt đối
      const isExactSize = Math.abs(attempt.fileSize - fileSize) === 0;

      // 2. Kiểm tra thời gian khởi tạo/chỉnh sửa tệp trên máy tính (lastModified timestamp)
      const isExactLastModified = Boolean(
        fileLastModified &&
        attempt.fileLastModified &&
        Math.abs(attempt.fileLastModified - fileLastModified) < 3000
      );

      // 3. Kiểm tra nội dung văn bản trùng khớp
      const attemptContent = (attempt.fileContent || '').trim();
      const isExactTextContent = currentContent.length > 50 && attemptContent.length > 50 && currentContent === attemptContent;

      // 4. Kiểm tra dữ liệu hình ảnh trùng khớp tuyệt đối
      const isExactImage = Boolean(imageBase64 && attempt.imageBase64 && imageBase64.length > 500 && imageBase64 === attempt.imageBase64);

      // 5. Kiểm tra cùng máy lớp trước để lại tệp
      const isSameMachineOldFileReuse =
        isSameMachine &&
        isDifferentClass &&
        (isExactSize || isExactLastModified || isExactImage || (fileName && attempt.fileName && fileName.toLowerCase() === attempt.fileName.toLowerCase()));

      const isExactCopy =
        isSameMachineOldFileReuse ||
        (isExactSize && (isExactTextContent || isExactImage || isExactLastModified || (fileName && attempt.fileName && fileName.toLowerCase() === attempt.fileName.toLowerCase() && fileSize > 500))) ||
        isExactTextContent ||
        isExactImage;

      if (isExactCopy) {
        let msg = `🚨 CẢNH BÁO SAO CHÉP: Tệp nộp trùng khớp y nguyên 100% với sản phẩm của bạn ${sub.studentLeader} (${sub.className} - ${sub.machineNumber}) đã nộp trước đó!`;
        if (isSameMachineOldFileReuse) {
          msg = `🚨 PHÁT HIỆN DÙNG LẠI TỆP LỚP TRƯỚC TRÊN ${machineNumber}: Tệp "${fileName}" là bài làm của bạn ${sub.studentLeader} (${sub.className}) để lại trên máy tính này. Hệ thống không chấm điểm tệp có sẵn!`;
        }

        return {
          isCopied: true,
          copiedFromStudent: sub.studentLeader || 'Học sinh lớp trước',
          copiedFromClass: sub.className,
          copiedFromMachine: sub.machineNumber,
          copiedAt: attempt.timestamp || sub.latestSubmittedAt,
          similarityPercent: 100,
          message: msg,
        };
      }
    }
  }

  return null;
}

// Tự động lưu và cập nhật kết quả nộp bài của học sinh ngay lập tức vào CSDL
export function upsertSubmission(newSub: any): { success: boolean; submission: Submission; totalCount: number } {
  if (!newSub || !newSub.className || !newSub.machineNumber) {
    throw new Error('Dữ liệu bài nộp thiếu thông tin lớp hoặc số máy');
  }

  const cleanLeader = (newSub.studentLeader || '').trim().toLowerCase();
  const subPracticeDate = newSub.practiceDate || (newSub.latestSubmittedAt ? newSub.latestSubmittedAt.slice(0, 10) : new Date().toISOString().slice(0, 10));

  // Kiểm tra cờ cảnh báo sao chép
  const hasPlag = Boolean(newSub.hasPlagiarism || (newSub.plagiarismAlert && newSub.plagiarismAlert.isCopied));
  const plagAlert = newSub.plagiarismAlert || undefined;

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
      hasPlagiarism: hasPlag || existing.hasPlagiarism,
      plagiarismAlert: plagAlert || existing.plagiarismAlert,
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
      hasPlagiarism: hasPlag,
      plagiarismAlert: plagAlert,
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
let rosterLastUpdated: string = new Date().toISOString();

export function getRosterLastUpdated(): string {
  return rosterLastUpdated;
}

// Khởi tạo danh sách học sinh từ đĩa (hỗ trợ nạp cả CSDL riêng từng lớp và tệp tổng hợp)
function loadStudentRoster(): StudentRecord[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(ROSTERS_DIR)) {
      fs.mkdirSync(ROSTERS_DIR, { recursive: true });
    }

    // 1. Kiểm tra nạp từ các tệp CSDL riêng của từng lớp
    const classFiles = fs.readdirSync(ROSTERS_DIR).filter((f) => f.startsWith('roster_') && f.endsWith('.json'));
    if (classFiles.length > 0) {
      const all: StudentRecord[] = [];
      classFiles.forEach((file) => {
        try {
          const content = fs.readFileSync(path.join(ROSTERS_DIR, file), 'utf-8');
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            all.push(...parsed);
          }
        } catch {}
      });
      if (all.length > 0) {
        studentRosterState = all;
        console.log(`[CSDL Học Sinh] Đã tải ${studentRosterState.length} học sinh từ ${classFiles.length} tệp CSDL riêng từng lớp.`);
        return studentRosterState;
      }
    }

    // 2. Nạp từ tệp tổng hợp nếu chưa có tệp từng lớp
    if (fs.existsSync(ROSTER_FILE)) {
      const raw = fs.readFileSync(ROSTER_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        studentRosterState = parsed;
        console.log(`[CSDL Học Sinh] Đã tải ${studentRosterState.length} học sinh từ tệp tổng: ${ROSTER_FILE}`);
        return studentRosterState;
      }
    }
  } catch (err) {
    console.warn('[CSDL Học Sinh] Lỗi khi nạp danh sách học sinh:', err);
  }
  studentRosterState = [];
  return studentRosterState;
}

// Lưu danh sách học sinh ra đĩa: Lưu cả tệp tổng và CSDL RIÊNG BIỆT CHO MỖI LỚP
function flushStudentRosterToDisk(): boolean {
  try {
    ensureDataDir();
    rosterLastUpdated = new Date().toISOString();
    if (!fs.existsSync(ROSTERS_DIR)) {
      fs.mkdirSync(ROSTERS_DIR, { recursive: true });
    }

    // 1. Lưu tệp tổng hợp student_roster.json
    const tempFile = `${ROSTER_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(studentRosterState, null, 2), 'utf-8');
    fs.renameSync(tempFile, ROSTER_FILE);

    // 2. Phân vùng và lưu CSDL RIÊNG BIỆT CHO MỖI LỚP (roster_6A1.json, roster_6A2.json...)
    // Đảm bảo mỗi lớp có một tệp CSDL vật lý riêng, lớp sau không bao giờ ghi đè lên lớp trước!
    const classGroups: Record<string, StudentRecord[]> = {};
    studentRosterState.forEach((s) => {
      const cls = s.className.toUpperCase();
      if (!classGroups[cls]) classGroups[cls] = [];
      classGroups[cls].push(s);
    });

    // Ghi từng tệp lớp
    Object.entries(classGroups).forEach(([cls, students]) => {
      const classFilePath = path.join(ROSTERS_DIR, `roster_${cls}.json`);
      fs.writeFileSync(classFilePath, JSON.stringify(students, null, 2), 'utf-8');
    });

    // Dọn dẹp các tệp CSDL của lớp đã bị xóa để tránh nạp lại
    try {
      const activeClassFiles = new Set(Object.keys(classGroups).map((cls) => `roster_${cls}.json`));
      const onDiskFiles = fs.readdirSync(ROSTERS_DIR).filter((f) => f.startsWith('roster_') && f.endsWith('.json'));
      onDiskFiles.forEach((f) => {
        if (!activeClassFiles.has(f)) {
          try {
            fs.unlinkSync(path.join(ROSTERS_DIR, f));
          } catch {}
        }
      });
    } catch {}

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

// Lưu danh sách học sinh từ Excel (Tích lũy tự động: thêm dần từ lớp này sang lớp khác, không bị đè mất lớp cũ)
export function saveStudentRoster(
  records: StudentRecord[],
  mode: 'accumulate' | 'upsert' | 'replace' = 'replace'
): { success: boolean; total: number; classes: string[]; students: StudentRecord[] } {
  if (!Array.isArray(records)) {
    return { success: false, total: studentRosterState.length, classes: [], students: studentRosterState };
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
    // Yêu cầu: CSDL tên lớp phải được thay đúng với các lớp có trong danh sách, các lớp khác xóa nó!
    studentRosterState = cleaned;

    // Dọn dẹp sạch sẽ các tệp roster_*.json cũ của các lớp không còn tồn tại
    try {
      if (fs.existsSync(ROSTERS_DIR)) {
        const newClasses = new Set(cleaned.map((s) => s.className.toUpperCase()));
        const files = fs.readdirSync(ROSTERS_DIR);
        files.forEach((f) => {
          const match = f.match(/^roster_(.+)\.json$/);
          if (match && !newClasses.has(match[1].toUpperCase())) {
            try {
              fs.unlinkSync(path.join(ROSTERS_DIR, f));
            } catch {}
          }
        });
      }
    } catch {}
  } else {
    // Mode accumulate
    const map = new Map<string, StudentRecord>();
    studentRosterState.forEach((s) => {
      const key = `${s.className.toUpperCase()}___${s.fullName.trim().toLowerCase()}`;
      map.set(key, s);
    });
    cleaned.forEach((s) => {
      const key = `${s.className.toUpperCase()}___${s.fullName.trim().toLowerCase()}`;
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
    students: studentRosterState,
  };
}

// Xóa danh sách học sinh theo lớp hoặc toàn bộ (xóa cả tệp CSDL riêng của lớp đó)
export function deleteStudentRoster(className?: string): { success: boolean; count: number; classes: string[]; students: StudentRecord[] } {
  if (className && className.trim()) {
    const rawNorm = className.trim().toUpperCase();
    const cleanNorm = rawNorm.replace(/^LỚP\s*|^LOP\s*/i, '');

    studentRosterState = studentRosterState.filter((s) => {
      const sCls = (s.className || '').trim().toUpperCase();
      const sClean = sCls.replace(/^LỚP\s*|^LOP\s*/i, '');
      return sCls !== rawNorm && sClean !== cleanNorm && sCls !== cleanNorm;
    });

    try {
      const candidates = [
        `roster_${rawNorm}.json`,
        `roster_${cleanNorm}.json`,
        `roster_LỚP_${cleanNorm}.json`,
      ];
      candidates.forEach((f) => {
        const filePath = path.join(ROSTERS_DIR, f);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    } catch {}
  } else {
    studentRosterState = [];
    try {
      if (fs.existsSync(ROSTERS_DIR)) {
        const files = fs.readdirSync(ROSTERS_DIR);
        files.forEach((f) => fs.unlinkSync(path.join(ROSTERS_DIR, f)));
      }
    } catch {}
  }
  flushStudentRosterToDisk();
  const classes = Array.from(new Set(studentRosterState.map((s) => s.className)));
  console.log(`[CSDL Học Sinh] Đã xóa ${className ? `Lớp ${className}` : 'toàn bộ'}. Còn lại ${studentRosterState.length} học sinh thuộc ${classes.length} lớp.`);
  return { success: true, count: studentRosterState.length, classes, students: studentRosterState };
}

// Đổi tên lớp trực tiếp trong CSDL (cực kỳ thuận lợi khi tải nhầm tên file 6B2 thay vì 6A2)
export function renameStudentClass(
  oldClassName: string,
  newClassName: string
): { success: boolean; count: number; classes: string[]; students: StudentRecord[] } {
  if (!oldClassName || !newClassName) {
    const classes = Array.from(new Set(studentRosterState.map((s) => s.className)));
    return { success: false, count: studentRosterState.length, classes, students: studentRosterState };
  }

  const oldNorm = oldClassName.trim().toUpperCase();
  const oldClean = oldNorm.replace(/^LỚP\s*|^LOP\s*/i, '');
  const newNorm = newClassName.trim().toUpperCase().replace(/^LỚP\s*|^LOP\s*/i, '');

  let modifiedCount = 0;
  studentRosterState = studentRosterState.map((s) => {
    const sCls = (s.className || '').trim().toUpperCase();
    const sClean = sCls.replace(/^LỚP\s*|^LOP\s*/i, '');
    if (sCls === oldNorm || sClean === oldClean || sCls === oldClean) {
      modifiedCount++;
      return { ...s, className: newNorm };
    }
    return s;
  });

  // Xóa tệp CSDL lớp cũ trên đĩa nếu khác tên mới
  if (oldClean !== newNorm) {
    try {
      const oldFile = path.join(ROSTERS_DIR, `roster_${oldClean}.json`);
      if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile);
      }
    } catch {}
  }

  flushStudentRosterToDisk();
  const classes = Array.from(new Set(studentRosterState.map((s) => s.className)));
  console.log(`[CSDL Học Sinh] Đã đổi tên lớp từ ${oldClassName} sang ${newNorm} cho ${modifiedCount} học sinh.`);
  return { success: true, count: studentRosterState.length, classes, students: studentRosterState };
}
