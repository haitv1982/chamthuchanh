import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudentSubmissionView } from './components/StudentSubmissionView';
import { StudentInfoModal } from './components/StudentInfoModal';
import { StudentRosterModal } from './components/StudentRosterModal';
import { ClassResultsModal } from './components/ClassResultsModal';
import { ProjectorLiveBoard } from './components/ProjectorLiveBoard';
import { DEFAULT_ASSIGNMENTS } from './data/defaultAssignments';
import { INITIAL_SUBMISSIONS } from './data/mockSubmissions';
import { SCHOOL_CLASSES } from './data/classes';
import { Assignment, Submission, SubmissionAttempt, StudentRecord } from './types';
import { exportSubmissionsToExcel, exportSingleSubmissionToExcel } from './utils/excelExport';
import {
  saveSubmissionsSafely,
  loadSubmissionsSafely,
  sanitizeSubmission,
  getTodayDateString,
  isSubmittedToday,
  pruneOldSubmissions,
  queuePendingSync,
  getPendingSyncQueue,
  clearPendingSyncQueue,
} from './utils/storageManager';
import { scanAndGradeProduct } from './utils/productScanner';
import { apiFetch, getApiUrl } from './utils/apiConfig';

const STORAGE_KEY_ASSIGNMENTS = 'labgrade_assignments_v7_grade6_grade7_grade8_grade9';
const STORAGE_KEY_CLASS = 'labgrade_current_class_v1';

// Smart rapid scanning and step-by-step cross-verification engine
function analyzeStudentWork(params: {
  assignment: Assignment;
  fileName: string;
  fileContent: string;
  attemptNumber: number;
}) {
  return scanAndGradeProduct(params);
}

export default function App() {
  // Load initial assignments (Grade 6, Grade 7, Grade 8 & Grade 9 official products SP01 - SP14)
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasGrade9 = parsed.some((a: Assignment) => a.id.startsWith('th9') || a.gradeLevel === 'Lớp 9');
          if (hasGrade9) return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load assignments from localStorage:', e);
    }
    return DEFAULT_ASSIGNMENTS;
  });

  // Current class - default to 6A2 or valid saved class
  const [userClassName, setUserClassName] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CLASS);
    if (saved && (SCHOOL_CLASSES as readonly string[]).includes(saved)) {
      return saved;
    }
    return SCHOOL_CLASSES[0] || '6A2';
  });

  const [activeAssignmentId, setActiveAssignmentId] = useState<string>(() => {
    return DEFAULT_ASSIGNMENTS[0]?.id || 'sp01-so-do-xu-li-thong-tin';
  });

  // Handler to select and synchronize active practicing class
  const handleSelectClassName = (newClass: string) => {
    setUserClassName(newClass);
    localStorage.setItem(STORAGE_KEY_CLASS, newClass);
  };

  // Load initial submissions safely (khởi tạo rỗng theo yêu cầu người dùng)
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    return loadSubmissionsSafely([]);
  });

  // Student Info State (Lớp, Khối, Số máy, Trưởng nhóm, Thành viên)
  const [machineNumber, setMachineNumber] = useState<string>(() => {
    return localStorage.getItem('labgrade_machine_number') || 'Máy 05';
  });
  const [studentLeader, setStudentLeader] = useState<string>(() => {
    return localStorage.getItem('labgrade_student_leader') || '';
  });
  const [groupMembers, setGroupMembers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('labgrade_group_members');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    const saved = localStorage.getItem('labgrade_selected_grade');
    if (saved) return saved;
    if (userClassName.startsWith('9')) return 'Lớp 9';
    if (userClassName.startsWith('8')) return 'Lớp 8';
    if (userClassName.startsWith('7')) return 'Lớp 7';
    return 'Lớp 6';
  });

  // Modals & Overlays
  const [isStudentInfoModalOpen, setIsStudentInfoModalOpen] = useState<boolean>(false);
  const [isProjectorOpen, setIsProjectorOpen] = useState<boolean>(false);
  const [isClassResultsOpen, setIsClassResultsOpen] = useState<boolean>(false);
  const [isStudentRosterModalOpen, setIsStudentRosterModalOpen] = useState<boolean>(false);

  // Danh sách học sinh các lớp (được tải lên từ file Excel 3 cột)
  const [studentRoster, setStudentRoster] = useState<StudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('labgrade_student_roster');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Tự động lưu danh sách học sinh vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('labgrade_student_roster', JSON.stringify(studentRoster));
    } catch {}
  }, [studentRoster]);

  // Tải danh sách học sinh từ máy chủ khi mở ứng dụng
  useEffect(() => {
    const fetchRoster = async () => {
      try {
        const res = await apiFetch('/api/student-roster');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.students) && data.students.length > 0) {
            setStudentRoster(data.students);
          }
        }
      } catch {}
    };
    fetchRoster();
  }, []);

  // Role: 'teacher' (Giáo viên) vs 'student' (Học sinh) - Mặc định trên máy mới là Học sinh (chỉ chuyển Giáo viên khi nhập mã PIN)
  const [isTeacherRole, setIsTeacherRole] = useState<boolean>(() => {
    const saved = localStorage.getItem('labgrade_user_role');
    return saved === 'teacher';
  });

  // Submission Permission: Cho phép học sinh nộp bài hay đang khóa (đọc từ localStorage khi mở trang)
  const [allowSubmission, setAllowSubmission] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('labgrade_allow_submission');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {}
    return true;
  });

  // Tự động lưu trạng thái quyền nộp bài vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('labgrade_allow_submission', String(allowSubmission));
    } catch {}
  }, [allowSubmission]);

  // Đồng bộ trạng thái khóa nộp bài tức thời giữa các tab/cửa sổ trên cùng máy
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('labgrade_session_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'SUBMISSION_PERMISSION_CHANGED' && typeof event.data.allow === 'boolean') {
            setAllowSubmission(event.data.allow);
          }
          if (event.data?.type === 'ROSTER_UPDATED' && Array.isArray(event.data.students)) {
            setStudentRoster(event.data.students);
          }
        };
      } catch {}
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'labgrade_allow_submission' && e.newValue !== null) {
        setAllowSubmission(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Trạng thái Cơ sở dữ liệu phòng máy (CSDL Lưu trữ thời gian thực)
  const [dbStatus, setDbStatus] = useState<{
    status: string;
    isPersistent: boolean;
    totalSubmissions: number;
    totalAttempts: number;
    lastUpdated?: string;
    classes: Record<string, number>;
  }>({
    status: 'connected',
    isPersistent: true,
    totalSubmissions: submissions.length,
    totalAttempts: 0,
    classes: {},
  });

  // Persist role
  useEffect(() => {
    localStorage.setItem('labgrade_user_role', isTeacherRole ? 'teacher' : 'student');
  }, [isTeacherRole]);

  // Fetch session status & sync submissions with network timeout protection
  const refreshSubmissionsAndStatus = async () => {
    // 1. Kiểm tra và đẩy hàng đợi bài nộp offline nếu có
    const pendingQueue = getPendingSyncQueue();
    if (pendingQueue.length > 0) {
      try {
        const batchRes = await apiFetch('/api/submissions/sync-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissions: pendingQueue }),
        }, 5000);
        if (batchRes.ok) {
          clearPendingSyncQueue();
          console.log('[CSDL Phòng Máy] Đã đẩy thành công các bài nộp trong hàng đợi offline lên CSDL máy chủ.');
        }
      } catch {}
    }

    // 2. Tải toàn bộ bài nộp và trạng thái CSDL mới nhất từ máy chủ
    try {
      const res = await apiFetch('/api/submissions', { method: 'GET' }, 6000);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.allowSubmission === 'boolean') {
          setAllowSubmission(data.allowSubmission);
        }
        if (data.dbStatus) {
          setDbStatus(data.dbStatus);
        }
        if (Array.isArray(data.submissions) && data.submissions.length > 0) {
          setSubmissions((prev) => {
            const map = new Map<string, Submission>();
            // Nạp dữ liệu hiện tại
            (prev || []).forEach((s) => {
              if (s && s.id) map.set(s.id, s);
            });
            // Đồng bộ dữ liệu CSDL máy chủ (Ưu tiên bản mới nhất từ CSDL máy chủ)
            data.submissions.forEach((raw: any) => {
              const clean = sanitizeSubmission(raw);
              map.set(clean.id, clean);
            });
            return Array.from(map.values());
          });
        }
      }
    } catch {
      // offline or network congestion resilience in busy computer lab
    }
  };

  // Đồng bộ toàn bộ bài nộp trên máy này lên CSDL trung tâm
  const handleSyncAllLocalSubmissionsToDb = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const currentList = loadSubmissionsSafely(submissions);
      if (!currentList || currentList.length === 0) {
        return { success: true, count: 0 };
      }
      const res = await apiFetch('/api/submissions/sync-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions: currentList, isTeacherSync: true }),
      }, 8000);
      if (res.ok) {
        const json = await res.json();
        clearPendingSyncQueue();
        await refreshSubmissionsAndStatus();
        return { success: true, count: json.addedCount ?? currentList.length };
      }
      return { success: false, count: 0, error: `Máy chủ phản hồi mã ${res.status}` };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Lỗi kết nối CSDL' };
    }
  };

  // Toggle submission lock handler
  const handleToggleSubmissionPermission = async (allow: boolean) => {
    setAllowSubmission(allow);
    try {
      localStorage.setItem('labgrade_allow_submission', String(allow));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('labgrade_session_channel');
        bc.postMessage({ type: 'SUBMISSION_PERMISSION_CHANGED', allow });
        bc.close();
      }
    } catch {}

    try {
      const res = await apiFetch('/api/session-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allow }),
      }, 4000);
      if (res.ok) {
        console.log(`[Quyền Nộp Bài] Đã cập nhật lên máy chủ trung tâm: ${allow ? 'MỞ CHO PHÉP' : 'ĐÃ KHÓA'}`);
      }
    } catch (err) {
      console.warn('Lỗi gửi trạng thái khóa nộp bài tới máy chủ:', err);
    }
  };

  // Cập nhật danh sách học sinh (từ Excel do Giáo viên tải lên)
  const handleSaveStudentRoster = async (
    students: StudentRecord[],
    mode: 'replace' | 'upsert' = 'replace'
  ) => {
    let resTotal = students.length;
    let resClasses: string[] = [];

    try {
      const res = await apiFetch('/api/student-roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students, mode }),
      });
      if (res.ok) {
        const data = await res.json();
        resTotal = data.total;
        resClasses = data.classes || [];
      }
    } catch (err) {
      console.warn('Lỗi mạng khi lưu danh sách học sinh lên máy chủ:', err);
    }

    // Cập nhật state cục bộ ngay lập tức
    if (mode === 'replace') {
      const incomingClasses = new Set(students.map((c) => c.className.toUpperCase()));
      setStudentRoster((prev) => {
        const retained = prev.filter((s) => !incomingClasses.has(s.className.toUpperCase()));
        const updated = [...retained, ...students];
        try {
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('labgrade_session_channel');
            bc.postMessage({ type: 'ROSTER_UPDATED', students: updated });
            bc.close();
          }
        } catch {}
        return updated;
      });
    } else {
      setStudentRoster((prev) => {
        const map = new Map<string, StudentRecord>();
        prev.forEach((s) => map.set(`${s.className}___${s.fullName.toLowerCase()}`, s));
        students.forEach((s) => map.set(`${s.className}___${s.fullName.toLowerCase()}`, s));
        const updated = Array.from(map.values());
        try {
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('labgrade_session_channel');
            bc.postMessage({ type: 'ROSTER_UPDATED', students: updated });
            bc.close();
          }
        } catch {}
        return updated;
      });
    }

    return { success: true, total: resTotal, classes: resClasses };
  };

  // Xóa danh sách học sinh
  const handleDeleteStudentRoster = async (className?: string) => {
    try {
      const url = className
        ? `/api/student-roster?className=${encodeURIComponent(className)}`
        : '/api/student-roster';
      await apiFetch(url, { method: 'DELETE' });
    } catch (err) {
      console.warn('Lỗi mạng khi xóa danh sách học sinh trên máy chủ:', err);
    }

    setStudentRoster((prev) => {
      const updated = className
        ? prev.filter((s) => s.className.toUpperCase() !== className.toUpperCase())
        : [];
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('labgrade_session_channel');
          bc.postMessage({ type: 'ROSTER_UPDATED', students: updated });
          bc.close();
        }
      } catch {}
      return updated;
    });
    return true;
  };

  // Persist assignments to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
    } catch (e) {
      console.warn('Failed to save assignments:', e);
    }
  }, [assignments]);

  // Persist submissions safely to localStorage with auto-pruning
  useEffect(() => {
    saveSubmissionsSafely(submissions);
  }, [submissions]);

  // Persist class selection
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLASS, userClassName);
  }, [userClassName]);

  // Background fetch from server to sync lab submissions if server has any & poll every 2.5 seconds
  useEffect(() => {
    refreshSubmissionsAndStatus();
    const interval = setInterval(() => {
      refreshSubmissionsAndStatus();
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const activeAssignment =
    assignments.find((a) => a.id === activeAssignmentId) || assignments[0] || DEFAULT_ASSIGNMENTS[0];

  // Handler for student submitting work and grading
  const handleStudentSubmitWork = async (data: {
    assignmentId: string;
    className: string;
    machineNumber: string;
    studentLeader: string;
    groupMembers: string[];
    fileName: string;
    fileSize: number;
    fileContent: string;
  }): Promise<SubmissionAttempt | null> => {
    const todayStr = getTodayDateString();
    const currentAssignment =
      assignments.find((a) => a.id === data.assignmentId) || activeAssignment;

    // 0. BẢO VỆ CHẶT CHẼ: KIỂM TRA QUYỀN NỘP BÀI TỪ GIÁO VIÊN (Yêu cầu khóa nộp bài)
    if (!allowSubmission) {
      throw new Error('🔒 Giáo viên đang KHÓA nhận bài nộp phòng thực hành. Thầy/Cô chưa mở quyền nộp bài cho phiên này. Em hãy chờ thầy/cô thông báo nhé!');
    }

    // Kiểm tra trực tiếp thời gian thực với máy chủ xem giáo viên có vừa bấm khóa không
    try {
      const checkRes = await apiFetch('/api/session-status', { method: 'GET' }, 2000);
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (typeof checkData.allowSubmission === 'boolean') {
          setAllowSubmission(checkData.allowSubmission);
          try {
            localStorage.setItem('labgrade_allow_submission', String(checkData.allowSubmission));
          } catch {}
          if (!checkData.allowSubmission) {
            throw new Error('🔒 Giáo viên vừa KHÓA nhận bài nộp phòng thực hành. Thầy/Cô chưa cho phép nộp bài lúc này!');
          }
        }
      }
    } catch (checkErr: any) {
      if (checkErr?.message && (checkErr.message.includes('KHÓA') || checkErr.message.includes('khóa'))) {
        throw checkErr;
      }
    }

    // KIỂM TRA BÀI NỘP CỦA HÔM NAY (Yêu cầu 3: không lưu dồn với ngày trước, sang ngày mới/tuần sau tính phiên mới)
    // Nếu cùng số máy nhưng KHÁC tên học sinh/nhóm trưởng -> Đây là 2 nhóm khác nhau, không ghi đè mất bài của nhau!
    const cleanLeader = (data.studentLeader || '').trim().toLowerCase();
    const existingSubmission = submissions.find(
      (s) =>
        s &&
        s.className === data.className &&
        ((s.studentLeader || '').trim().toLowerCase() === cleanLeader ||
          (s.machineNumber === data.machineNumber &&
            Array.isArray(s.groupMembers) &&
            s.groupMembers.some((m) => (m || '').trim().toLowerCase() === cleanLeader))) &&
        (s.practiceDate === todayStr || isSubmittedToday(s.latestSubmittedAt, todayStr))
    );

    // Nếu là phiên trong cùng ngày hôm nay: số lần nộp tăng dần (attempt 2, 3...)
    // Nếu là ngày hôm sau / tuần sau: bắt đầu từ lần 1 của ngày hôm đó
    const attemptNumber = existingSubmission ? existingSubmission.attempts.length + 1 : 1;

    // Send to grading endpoint
    let gradeData: any;
    try {
      const response = await apiFetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment: currentAssignment,
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileContent: data.fileContent,
          attemptNumber,
          studentLeader: data.studentLeader,
          groupMembers: data.groupMembers,
          className: data.className,
          machineNumber: data.machineNumber,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        if (response.status === 403 || errorJson.locked || (errorJson.error && errorJson.error.includes('KHÓA'))) {
          throw new Error(errorJson.error || '🔒 Giáo viên hiện đang KHÓA nhận bài nộp phòng thực hành.');
        }
        throw new Error(errorJson.error || `Lỗi máy chủ (${response.status})`);
      }
      gradeData = await response.json();
    } catch (err: any) {
      // TUYỆT ĐỐI KHÔNG FALLBACK NẾU GIÁO VIÊN ĐANG KHÓA NỘP BÀI!
      if (err?.message && (err.message.includes('KHÓA') || err.message.includes('khóa') || err.message.includes('locked'))) {
        throw err;
      }
      console.warn('Call to /api/grade failed, using smart local evaluator:', err);
      gradeData = analyzeStudentWork({
        assignment: currentAssignment,
        fileName: data.fileName,
        fileContent: data.fileContent,
        attemptNumber,
      });
    }

    const newAttempt: SubmissionAttempt = {
      attemptNumber,
      timestamp: new Date().toISOString(),
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileContent: data.fileContent,
      score: gradeData.score,
      aiComparisonDetails: gradeData.aiComparisonDetails || 'Sản phẩm đã được hệ thống AI đối chiếu tự động với sản phẩm mẫu & chuẩn tri thức môn Tin học.',
      criteriaResults: gradeData.criteriaResults || [],
      strengths: gradeData.strengths || [],
      weaknesses: gradeData.weaknesses || [],
      howToGetTen: gradeData.howToGetTen || [],
      stepEvaluations: gradeData.stepEvaluations || [],
      inspectionSummary: gradeData.inspectionSummary || undefined,
    };

    let updatedSubmission: Submission;

    if (existingSubmission) {
      const updatedAttempts = [...existingSubmission.attempts, newAttempt];
      const maxScore = Math.max(...updatedAttempts.map((a) => a.score));

      updatedSubmission = {
        ...existingSubmission,
        assignmentId: currentAssignment.id,
        assignmentTitle: currentAssignment.title,
        studentLeader: data.studentLeader,
        groupMembers: data.groupMembers,
        attempts: updatedAttempts,
        highestScore: maxScore,
        latestScore: newAttempt.score,
        latestSubmittedAt: newAttempt.timestamp,
        practiceDate: todayStr,
        status: maxScore >= 10 ? 'perfect' : maxScore >= 7 ? 'graded' : 'needs_improvement',
      };

      setSubmissions((prev) =>
        pruneOldSubmissions(prev.map((s) => (s.id === existingSubmission.id ? updatedSubmission : s)))
      );
    } else {
      updatedSubmission = {
        id: `sub-${data.className}-${data.machineNumber.replace(/\s+/g, '_')}-${todayStr}-${Date.now()}`,
        assignmentId: currentAssignment.id,
        assignmentTitle: currentAssignment.title,
        className: data.className,
        machineNumber: data.machineNumber,
        studentLeader: data.studentLeader,
        groupMembers: data.groupMembers,
        attempts: [newAttempt],
        highestScore: newAttempt.score,
        latestScore: newAttempt.score,
        latestSubmittedAt: newAttempt.timestamp,
        practiceDate: todayStr,
        status: newAttempt.score >= 10 ? 'perfect' : newAttempt.score >= 7 ? 'graded' : 'needs_improvement',
      };

      // Thêm bài nộp mới của ngày hôm nay, giữ lại các ngày trước trong lịch sử, tự động dọn dẹp các ngày cũ nhất khi đầy
      setSubmissions((prev) => pruneOldSubmissions([updatedSubmission, ...prev]));
    }

    // Tự động lưu và cập nhật ngay lập tức vào Cơ sở dữ liệu phòng máy
    try {
      const syncRes = await apiFetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSubmission),
      }, 7000);
      if (syncRes.ok) {
        const syncJson = await syncRes.json();
        if (syncJson.submission) {
          const finalized = sanitizeSubmission(syncJson.submission);
          setSubmissions((prev) =>
            pruneOldSubmissions(
              prev.map((s) =>
                s.id === finalized.id ||
                (s.className === finalized.className &&
                  s.machineNumber === finalized.machineNumber &&
                  s.studentLeader.trim().toLowerCase() === finalized.studentLeader.trim().toLowerCase())
                  ? finalized
                  : s
              )
            )
          );
        }
      } else {
        const syncErrJson = await syncRes.json().catch(() => ({}));
        if (syncRes.status === 403 || syncErrJson.locked || (syncErrJson.error && syncErrJson.error.includes('KHÓA'))) {
          throw new Error(syncErrJson.error || '🔒 Giáo viên hiện đang KHÓA nhận bài nộp phòng thực hành.');
        }
        queuePendingSync(updatedSubmission);
      }
    } catch (netErr: any) {
      if (netErr?.message && (netErr.message.includes('KHÓA') || netErr.message.includes('khóa'))) {
        throw netErr;
      }
      console.warn('Lỗi mạng khi lưu CSDL, đưa vào hàng đợi offline:', netErr);
      queuePendingSync(updatedSubmission);
    }

    return newAttempt;
  };

  // Update group members in existing or pending submissions
  const handleUpdateGroupMembers = (data: {
    className: string;
    machineNumber: string;
    studentLeader: string;
    groupMembers: string[];
  }) => {
    setSubmissions((prev) => {
      const matchIdx = prev.findIndex(
        (s) =>
          s.className === data.className &&
          (s.machineNumber === data.machineNumber ||
            (data.studentLeader.trim() && s.studentLeader.toLowerCase() === data.studentLeader.toLowerCase()))
      );
      if (matchIdx >= 0) {
        const updated = [...prev];
        updated[matchIdx] = {
          ...updated[matchIdx],
          studentLeader: data.studentLeader,
          groupMembers: data.groupMembers,
        };
        apiFetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated[matchIdx]),
        }).catch(() => {});
        return updated;
      }
      return prev;
    });
  };

  // Export Excel handler for active class or specified class (Hỗ trợ lọc theo ngày bất kỳ hoặc ngày gần nhất)
  const handleExportClassExcel = (
    customClass?: string,
    targetDate?: string | null,
    dateMode: 'all' | 'latest' | 'custom' = 'all'
  ) => {
    exportSubmissionsToExcel({
      className: typeof customClass === 'string' && customClass ? customClass : userClassName,
      assignment: activeAssignment,
      submissions,
      targetDate,
      dateMode,
    });
  };

  // Export individual / group submission to Excel
  const handleExportSingleSubmission = (sub: Submission) => {
    exportSingleSubmissionToExcel({
      submission: sub,
      assignment: activeAssignment,
    });
  };

  // Statistics
  const filteredForHeader = submissions.filter((s) => s.className === userClassName);
  const totalSubmissionsCount = filteredForHeader.length;
  const perfectCount = filteredForHeader.filter((s) => s.highestScore >= 10).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-slate-100 to-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-200">
      {/* Top Header */}
      <Header
        onOpenStudentInfoModal={() => setIsStudentInfoModalOpen(true)}
        studentInfo={{
          className: userClassName,
          machineNumber,
          studentLeader,
          groupMembers,
        }}
        onOpenProjector={() => setIsProjectorOpen(true)}
        onOpenClassResults={() => setIsClassResultsOpen(true)}
        onExportExcel={handleExportClassExcel}
        activeClassName={userClassName}
        onChangeClassName={handleSelectClassName}
        totalSubmissions={totalSubmissionsCount}
        perfectSubmissions={perfectCount}
        isTeacher={isTeacherRole}
        onToggleRole={() => setIsTeacherRole(!isTeacherRole)}
        allowSubmission={allowSubmission}
        onToggleSubmissionPermission={handleToggleSubmissionPermission}
        dbStatus={dbStatus}
        onRefreshDb={refreshSubmissionsAndStatus}
        onSyncAllLocalSubmissionsToDb={handleSyncAllLocalSubmissionsToDb}
        onOpenStudentRosterModal={() => setIsStudentRosterModalOpen(true)}
      />

      {/* Main Student Workspace (Single focused interface without scrolling) */}
      <main className="flex-1 pb-10">
        <StudentSubmissionView
          assignments={assignments}
          activeAssignmentId={activeAssignmentId}
          onSelectAssignment={(id) => setActiveAssignmentId(id)}
          selectedGrade={selectedGrade}
          onSelectGrade={(g) => {
            setSelectedGrade(g);
            try {
              localStorage.setItem('labgrade_selected_grade', g);
            } catch {}
            const firstA = assignments.find((a) => a.gradeLevel === g);
            if (firstA) setActiveAssignmentId(firstA.id);
          }}
          userClassName={userClassName}
          onChangeClassName={handleSelectClassName}
          machineNumber={machineNumber}
          onChangeMachineNumber={setMachineNumber}
          studentLeader={studentLeader}
          onChangeStudentLeader={setStudentLeader}
          groupMembers={groupMembers}
          onChangeGroupMembers={setGroupMembers}
          mySubmissions={submissions}
          onSubmitWork={handleStudentSubmitWork}
          onOpenStudentInfoModal={() => setIsStudentInfoModalOpen(true)}
          allowSubmission={allowSubmission}
          isTeacher={isTeacherRole}
          onToggleSubmissionPermission={handleToggleSubmissionPermission}
        />
      </main>

      {/* Student Info Modal - Nhập Khối, Lớp, Số máy, Trưởng nhóm và Thành viên */}
      <StudentInfoModal
        isOpen={isStudentInfoModalOpen}
        onClose={() => setIsStudentInfoModalOpen(false)}
        selectedGrade={selectedGrade}
        onSelectGrade={(g) => {
          setSelectedGrade(g);
          try {
            localStorage.setItem('labgrade_selected_grade', g);
          } catch {}
          const firstA = assignments.find((a) => a.gradeLevel === g);
          if (firstA) setActiveAssignmentId(firstA.id);
        }}
        className={userClassName}
        onSelectClassName={handleSelectClassName}
        machineNumber={machineNumber}
        onChangeMachineNumber={(m) => {
          setMachineNumber(m);
          try {
            localStorage.setItem('labgrade_machine_number', m);
          } catch {}
        }}
        studentLeader={studentLeader}
        onChangeStudentLeader={(l) => {
          setStudentLeader(l);
          try {
            localStorage.setItem('labgrade_student_leader', l);
          } catch {}
        }}
        groupMembers={groupMembers}
        onChangeGroupMembers={(mems) => {
          setGroupMembers(mems);
          try {
            localStorage.setItem('labgrade_group_members', JSON.stringify(mems));
          } catch {}
        }}
        roster={studentRoster}
      />

      {/* Student Roster Modal - Quản lý và Tải lên Danh Sách Học Sinh từ File Excel 3 Cột (Chỉ Giáo Viên) */}
      <StudentRosterModal
        isOpen={isStudentRosterModalOpen}
        onClose={() => setIsStudentRosterModalOpen(false)}
        roster={studentRoster}
        onSaveRoster={handleSaveStudentRoster}
        onDeleteRoster={handleDeleteStudentRoster}
      />

      {/* Class Results Modal - View and download during practice */}
      {isClassResultsOpen && (
        <ClassResultsModal
          className={userClassName}
          submissions={submissions}
          onClose={() => setIsClassResultsOpen(false)}
          onExportExcel={handleExportClassExcel}
          isTeacher={isTeacherRole}
          allowSubmission={allowSubmission}
          onToggleSubmissionPermission={handleToggleSubmissionPermission}
          onChangeClassName={handleSelectClassName}
          onRefresh={refreshSubmissionsAndStatus}
          dbStatus={dbStatus}
        />
      )}

      {/* Projector Live Overlay Screen */}
      {isProjectorOpen && (
        <ProjectorLiveBoard
          className={userClassName}
          assignment={activeAssignment}
          submissions={submissions}
          onClose={() => setIsProjectorOpen(false)}
          onRefresh={refreshSubmissionsAndStatus}
          allowSubmission={allowSubmission}
        />
      )}

      {/* School Informatics Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="w-full max-w-[98%] 2xl:max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-semibold text-slate-700 text-sm">
            Hệ Thống Chấm Điểm Phòng Thực Hành Tin Học • LabGrade AI
          </div>
          <div className="text-sm">
            Nộp nhiều lần • Tối ưu 10 điểm • Báo cáo Excel chi tiết theo lớp
          </div>
        </div>
      </footer>
    </div>
  );
}

