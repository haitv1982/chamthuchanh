import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudentSubmissionView } from './components/StudentSubmissionView';
import { StudentInfoModal } from './components/StudentInfoModal';
import { StudentRosterModal } from './components/StudentRosterModal';
import { ClassResultsModal } from './components/ClassResultsModal';
import { ProjectorLiveBoard } from './components/ProjectorLiveBoard';
import { DEFAULT_ASSIGNMENTS } from './data/defaultAssignments';
import { INITIAL_SUBMISSIONS } from './data/mockSubmissions';
import { SCHOOL_CLASSES, normalizeClassName, extractGradeDigit } from './data/classes';
import { Assignment, Submission, SubmissionAttempt, StudentRecord, ClassGradebookDocument } from './types';
import {
  exportSubmissionsToExcel,
  exportSingleSubmissionToExcel,
  exportClassMultiProductGradebook,
} from './utils/excelExport';
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
  purgeAllLegacySubmissions,
  loadGradebooksSafely,
  saveGradebooksSafely,
  mergeGradebooksClient,
  upsertGradebookFromSubmissionClient,
} from './utils/storageManager';
import { scanAndGradeProduct } from './utils/productScanner';
import { detectPlagiarismClientSide } from './utils/antiPlagiarism';
import { apiFetch, getApiUrl, isBackendConfigured } from './utils/apiConfig';
import { realtimeSync } from './utils/realtimeSync';
import {
  isFirebaseReady,
  saveSubmissionToCloud,
  batchSaveSubmissionsToCloud,
  fetchSubmissionsFromCloud,
  deleteSubmissionsFromCloud,
  subscribeToSubmissionsCloud,
  saveRosterToCloud,
  fetchRosterFromCloud,
  subscribeToRosterCloud,
  saveSettingsToCloud,
  fetchSettingsFromCloud,
  subscribeToSettingsCloud,
  saveSubmissionIntoCloudGradebook,
  batchSaveGradebooksToCloud,
  fetchAllGradebooksFromCloud,
  deleteGradebooksFromCloud,
  updatePresenceCloud,
  markPresenceOfflineBeaconCloud,
  buildPresenceDocId,
  fetchPresenceFromCloud,
  subscribeToPresenceCloud,
  PRESENCE_CLOUD_TTL_MS,
} from './services/firebase';

const STORAGE_KEY_ASSIGNMENTS = 'labgrade_assignments_v7_grade6_grade7_grade8_grade9';
const STORAGE_KEY_CLASS = 'labgrade_current_class_v1';

// Smart rapid scanning and step-by-step cross-verification engine
function analyzeStudentWork(params: {
  assignment: Assignment;
  fileName: string;
  fileContent: string;
  attemptNumber: number;
  imageBase64?: string;
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
          // Luôn đồng bộ rubric và đặc tả chuẩn mới nhất từ DEFAULT_ASSIGNMENTS
          const defaultMap = new Map(DEFAULT_ASSIGNMENTS.map((a) => [a.id, a]));
          const merged = parsed.map((item: Assignment) => {
            const def = defaultMap.get(item.id);
            if (def) {
              return {
                ...def,
                ...item,
                rubric: def.rubric,
                targetFile: def.targetFile,
                requirements: def.requirements,
                steps: def.steps,
              };
            }
            return item;
          });
          DEFAULT_ASSIGNMENTS.forEach((def) => {
            if (!merged.some((m: Assignment) => m.id === def.id)) {
              merged.push(def);
            }
          });
          return merged;
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

  // Bảng tổng hợp điểm vĩnh viễn theo lớp (lưu trữ toàn bộ SP1, SP2, SP3... qua mọi tiết học)
  const [permanentGradebooks, setPermanentGradebooks] = useState<Record<string, ClassGradebookDocument>>(() => {
    const initialGbs = loadGradebooksSafely();
    const initialSubs = loadSubmissionsSafely([]);
    let rebuilt = initialGbs;
    initialSubs.forEach((s) => {
      rebuilt = upsertGradebookFromSubmissionClient(rebuilt, s);
    });
    return rebuilt;
  });

  const gradebooksRef = React.useRef<Record<string, ClassGradebookDocument>>(permanentGradebooks);
  useEffect(() => {
    gradebooksRef.current = permanentGradebooks;
    saveGradebooksSafely(permanentGradebooks);
  }, [permanentGradebooks]);

  // Kiểm tra 2 bài nộp có thuộc cùng 1 phiên làm bài của cùng 1 sản phẩm & học sinh hay không (tránh SP2 ghi đè mất SP1)
  const isSameSubmissionSlot = (a?: Submission | null, b?: Submission | null): boolean => {
    if (!a || !b) return false;
    if (normalizeClassName(a.className) !== normalizeClassName(b.className)) return false;
    if ((a.assignmentId || '') !== (b.assignmentId || '')) return false;
    const dateA = a.practiceDate || (a.latestSubmittedAt ? a.latestSubmittedAt.slice(0, 10) : '');
    const dateB = b.practiceDate || (b.latestSubmittedAt ? b.latestSubmittedAt.slice(0, 10) : '');
    if (dateA && dateB && dateA !== dateB) return false;
    const leaderA = (a.studentLeader || '').trim().toLowerCase();
    const leaderB = (b.studentLeader || '').trim().toLowerCase();
    if (leaderA && leaderB) return leaderA === leaderB;
    return a.machineNumber === b.machineNumber;
  };

  // Student Info State (Lớp, Khối, Số máy, Trưởng nhóm, Thành viên)
  const [machineNumber, setMachineNumber] = useState<string>(() => {
    return localStorage.getItem('labgrade_machine_number') || 'Máy 05';
  });
  const [studentLeader, setStudentLeader] = useState<string>(() => {
    return localStorage.getItem('labgrade_student_leader') || '';
  });
  const [hasExplicitMachine, setHasExplicitMachine] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('labgrade_machine_number') || localStorage.getItem('labgrade_student_leader'));
  });
  const [onlineMachines, setOnlineMachines] = useState<Array<{
    clientId: string;
    machineNumber: string;
    className: string;
    studentLeader: string;
    lastSeen: number;
  }>>([]);
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

  // Tải & Đồng bộ hai chiều danh sách học sinh giữa Máy Giáo Viên, Máy Học Sinh và Firebase Cloud
  const fetchRosterLatest = async () => {
    try {
      const localSaved = localStorage.getItem('labgrade_student_roster');
      let localList: StudentRecord[] = [];
      try {
        if (localSaved) localList = JSON.parse(localSaved);
      } catch {}

      // 1. Kiểm tra trên Firebase Cloud Firestore trước tiên (Dành cho web Vercel & liên thông phòng máy)
      if (isFirebaseReady) {
        try {
          const cloudStudents = await fetchRosterFromCloud();
          if (Array.isArray(cloudStudents) && cloudStudents.length > 0) {
            // Đám mây đã có dữ liệu -> nạp ngay vào máy học sinh / giáo viên
            setStudentRoster(cloudStudents);
            try {
              localStorage.setItem('labgrade_student_roster', JSON.stringify(cloudStudents));
            } catch {}
            console.log(`[Firebase Cloud] ✅ Đã nạp thành công ${cloudStudents.length} học sinh từ Firestore Cloud.`);
            return;
          } else if (localList.length > 0) {
            // Đám mây chưa có nhưng máy giáo viên đã có sẵn danh sách -> TỰ ĐỘNG ĐẨY LÊN CLOUD NGAY LẬP TỨC!
            console.log(`[Firebase Cloud] 🚀 Đám mây chưa có dữ liệu. Tự động đồng bộ ${localList.length} học sinh từ máy lên Cloud Firestore...`);
            await saveRosterToCloud(localList);
            return;
          }
        } catch (cloudErr) {
          console.warn('[Firebase Cloud] Lỗi đọc roster từ cloud:', cloudErr);
        }
      }

      // 2. Dự phòng máy chủ backend nội bộ (chỉ gọi khi có backend thực)
      if (isBackendConfigured()) {
        const res = await apiFetch('/api/student-roster');
        const cType = res.headers.get('content-type') || '';
        if (res.ok && cType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data.students) && data.students.length > 0) {
            setStudentRoster(data.students);
            try {
              localStorage.setItem('labgrade_student_roster', JSON.stringify(data.students));
            } catch {}
            if (isFirebaseReady) {
              await saveRosterToCloud(data.students);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Lỗi đồng bộ danh sách học sinh:', err);
    }
  };

  useEffect(() => {
    fetchRosterLatest();
    // Thử lại sau 2.5s và 6s để đảm bảo các máy mạng chậm hoặc máy học sinh tải trang đều nhận được danh sách
    const t1 = setTimeout(() => fetchRosterLatest(), 2500);
    const t2 = setTimeout(() => fetchRosterLatest(), 6000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Tự động nhận diện lớp đang có học sinh trong CSDL khi máy học sinh mới truy cập lần đầu
  useEffect(() => {
    if (studentRoster.length > 0 && !studentLeader) {
      const currentNorm = normalizeClassName(userClassName);
      const hasCurrent = studentRoster.some((s) => normalizeClassName(s.className) === currentNorm);
      if (!hasCurrent) {
        const firstStudentClass = studentRoster[0]?.className;
        if (firstStudentClass) {
          setUserClassName(firstStudentClass);
          try {
            localStorage.setItem(STORAGE_KEY_CLASS, firstStudentClass);
            const digit = extractGradeDigit(firstStudentClass);
            if (digit) {
              setSelectedGrade(`Lớp ${digit}`);
              localStorage.setItem('labgrade_selected_grade', `Lớp ${digit}`);
            }
          } catch {}
        }
      }
    }
  }, [studentRoster, studentLeader, userClassName]);

  // Role: 'teacher' (Giáo viên) vs 'student' (Học sinh) - Mặc định trên máy mới là Học sinh (chỉ chuyển Giáo viên khi nhập mã PIN)
  const [isTeacherRole, setIsTeacherRole] = useState<boolean>(() => {
    const saved = localStorage.getItem('labgrade_user_role');
    return saved === 'teacher';
  });

  // Submission Permission: Cho phép học sinh nộp bài hay đang khóa
  const [allowSubmission, setAllowSubmission] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('labgrade_allow_submission');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {}
    return true;
  });

  // Allowed Classes (Quản lý mở khóa nộp bài theo từng lớp)
  const [allowedClasses, setAllowedClasses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('labgrade_allowed_classes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Locked Classes (Quản lý các lớp bị khóa nộp bài rõ ràng trên toàn hệ thống)
  const [lockedClasses, setLockedClasses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('labgrade_locked_classes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Tự động lưu trạng thái quyền nộp bài vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('labgrade_allow_submission', String(allowSubmission));
    } catch {}
  }, [allowSubmission]);

  useEffect(() => {
    try {
      localStorage.setItem('labgrade_allowed_classes', JSON.stringify(allowedClasses));
    } catch {}
  }, [allowedClasses]);

  useEffect(() => {
    try {
      localStorage.setItem('labgrade_locked_classes', JSON.stringify(lockedClasses));
    } catch {}
  }, [lockedClasses]);

  // Kiểm tra quyền nộp bài của một lớp cụ thể
  const isClassSubmissionAllowed = (cls?: string): boolean => {
    if (!cls) return allowSubmission;
    if (!allowSubmission) return false;
    const clean = normalizeClassName(cls);

    // 1. Nếu lớp nằm trong danh sách BỊ KHÓA -> Dứt khoát không cho phép nộp
    if (lockedClasses && lockedClasses.some((c) => normalizeClassName(c) === clean)) {
      return false;
    }

    // 2. Nếu có danh sách lớp mở cụ thể -> Chỉ các lớp trong allowedClasses mới được nộp
    if (allowedClasses && allowedClasses.length > 0) {
      return allowedClasses.some((c) => normalizeClassName(c) === clean);
    }

    // 3. Nếu chưa chỉ định danh sách lớp mở -> theo allowSubmission chung
    return allowSubmission;
  };

  // Trạng thái kết nối kênh thời gian thực (Server-Sent Events) tới máy chủ CSDL
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  // Kênh thời gian thực liên thông dữ liệu tức thời giữa Máy Giáo Viên và tất cả Máy Học Sinh
  useEffect(() => {
    // 1. Kết nối kênh SSE thời gian thực tới máy chủ (chỉ khi có backend LAN/Render)
    if (isBackendConfigured()) {
      realtimeSync.connect();
    } else if (isFirebaseReady) {
      setIsRealtimeConnected(true);
    }

    const unsubscribe = realtimeSync.subscribe((event) => {
      if (event.type === 'CONNECTION_STATUS') {
        setIsRealtimeConnected(event.connected);
      } else if (event.type === 'CONNECTED') {
        if (Array.isArray(event.onlineMachines)) {
          setOnlineMachines(event.onlineMachines);
        }
        if (event.gradebooks && typeof event.gradebooks === 'object') {
          setPermanentGradebooks((prev) => mergeGradebooksClient(prev, event.gradebooks));
        }
      } else if (event.type === 'PRESENCE_UPDATED') {
        if (Array.isArray(event.onlineMachines)) {
          setOnlineMachines(event.onlineMachines);
        }
      } else if (event.type === 'ROSTER_UPDATED') {
        if (Array.isArray(event.students)) {
          setStudentRoster(event.students);
          try {
            localStorage.setItem('labgrade_student_roster', JSON.stringify(event.students));
          } catch {}
          console.log(`[Thời Gian Thực] Đã tự động cập nhật danh sách ${event.students.length} học sinh từ máy chủ.`);
        }
      } else if (event.type === 'SUBMISSION_UPDATED' && event.submission) {
        const cleanSub = sanitizeSubmission(event.submission);
        setSubmissions((prev) => {
          const filtered = prev.filter(
            (s) => s.id !== cleanSub.id && !isSameSubmissionSlot(s, cleanSub)
          );
          const next = pruneOldSubmissions([cleanSub, ...filtered]);
          saveSubmissionsSafely(next);
          return next;
        });
        setPermanentGradebooks((prev) => {
          let next = upsertGradebookFromSubmissionClient(prev, cleanSub);
          if (event.gradebooks && typeof event.gradebooks === 'object') {
            next = mergeGradebooksClient(next, event.gradebooks);
          }
          return next;
        });
        if (event.dbStatus) {
          setDbStatus(event.dbStatus);
        }
        console.log(`[Thời Gian Thực] Nhận bài nộp mới từ máy học sinh: ${cleanSub.machineNumber} - Lớp ${cleanSub.className}`);
      } else if (event.type === 'SUBMISSIONS_SYNCED' && Array.isArray(event.submissions)) {
        const cleanList = event.submissions
          .filter((s: any) => s && !String(s.id).startsWith('mock-'))
          .map((s: any) => sanitizeSubmission(s));
        setSubmissions(cleanList);
        saveSubmissionsSafely(cleanList);
        setPermanentGradebooks((prev) => {
          let next = event.gradebooks && typeof event.gradebooks === 'object'
            ? mergeGradebooksClient(prev, event.gradebooks)
            : prev;
          cleanList.forEach((s: Submission) => {
            next = upsertGradebookFromSubmissionClient(next, s);
          });
          return next;
        });
        if (event.dbStatus) {
          setDbStatus(event.dbStatus);
        }
      } else if (event.type === 'GRADEBOOK_UPDATED' && event.gradebooks) {
        setPermanentGradebooks((prev) => mergeGradebooksClient(prev, event.gradebooks));
      } else if (event.type === 'SUBMISSIONS_CLEARED') {
        const targetCls = event.targetClass || event.className;
        if (targetCls) {
          const normTarget = normalizeClassName(targetCls);
          const todayStr = getTodayDateString();
          setSubmissions((prev) => {
            const next = prev.filter((s) => {
              const isSameClass = normalizeClassName(s.className) === normTarget;
              const isToday = s.practiceDate === todayStr || isSubmittedToday(s.latestSubmittedAt, todayStr);
              return !(isSameClass && isToday);
            });
            saveSubmissionsSafely(next);
            return next;
          });
        } else {
          setSubmissions([]);
          purgeAllLegacySubmissions();
          saveSubmissionsSafely([]);
        }
      } else if (event.type === 'SUBMISSION_PERMISSION_CHANGED') {
        if (typeof event.allow === 'boolean') {
          setAllowSubmission(event.allow);
        }
        if (Array.isArray(event.allowedClasses)) {
          setAllowedClasses(event.allowedClasses);
          try {
            localStorage.setItem('labgrade_allowed_classes', JSON.stringify(event.allowedClasses));
          } catch {}
        }
        if (Array.isArray(event.lockedClasses)) {
          setLockedClasses(event.lockedClasses);
          try {
            localStorage.setItem('labgrade_locked_classes', JSON.stringify(event.lockedClasses));
          } catch {}
        }
      } else if (event.type === 'TEACHER_PIN_CHANGED') {
        console.log('[Bảo Mật] Mã PIN giáo viên đã được đổi trên máy chủ CSDL.');
        if (event.newPin) {
          try {
            localStorage.setItem('labgrade_teacher_pin_v1', event.newPin);
            localStorage.setItem('labgrade_teacher_pin', event.newPin);
          } catch {}
        }
      }
    });

    // 2. Kênh BroadcastChannel hỗ trợ giữa các tab/cửa sổ trên cùng máy
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('labgrade_session_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'SUBMISSION_PERMISSION_CHANGED') {
            if (typeof event.data.allow === 'boolean') {
              setAllowSubmission(event.data.allow);
            }
            if (Array.isArray(event.data.allowedClasses)) {
              setAllowedClasses(event.data.allowedClasses);
            }
            if (Array.isArray(event.data.lockedClasses)) {
              setLockedClasses(event.data.lockedClasses);
            }
          }
          if (event.data?.type === 'ROSTER_UPDATED' && Array.isArray(event.data.students)) {
            setStudentRoster(event.data.students);
          }
          if (event.data?.type === 'SUBMISSION_UPDATED' && event.data.submission) {
            const cleanSub = sanitizeSubmission(event.data.submission);
            setSubmissions((prev) => {
              const filtered = prev.filter(
                (s) => s.id !== cleanSub.id && !isSameSubmissionSlot(s, cleanSub)
              );
              const next = pruneOldSubmissions([cleanSub, ...filtered]);
              saveSubmissionsSafely(next);
              return next;
            });
            setPermanentGradebooks((prev) => upsertGradebookFromSubmissionClient(prev, cleanSub));
          }
          if (event.data?.type === 'GRADEBOOK_UPDATED' && event.data.gradebooks) {
            setPermanentGradebooks((prev) => mergeGradebooksClient(prev, event.data.gradebooks));
          }
          if (event.data?.type === 'SUBMISSIONS_CLEARED') {
            const targetCls = event.data.targetClass || event.data.className;
            const todayStr = getTodayDateString();
            if (targetCls) {
              const normTarget = normalizeClassName(targetCls);
              setSubmissions((prev) => {
                const next = prev.filter((s) => {
                  const isSameClass = normalizeClassName(s.className) === normTarget;
                  const isToday = s.practiceDate === todayStr || isSubmittedToday(s.latestSubmittedAt, todayStr);
                  return !(isSameClass && isToday);
                });
                saveSubmissionsSafely(next);
                return next;
              });
            } else {
              setSubmissions([]);
              saveSubmissionsSafely([]);
            }
          }
          if (event.data?.type === 'TEACHER_PIN_CHANGED' && event.data.newPin) {
            try {
              localStorage.setItem('labgrade_teacher_pin_v1', event.data.newPin);
              localStorage.setItem('labgrade_teacher_pin', event.data.newPin);
            } catch {}
          }
        };
      } catch {}
    }

    // 3. Kênh Firebase Cloud Firestore thời gian thực:
    // - Khi chạy trên máy chủ thực (Render / Node.js phòng máy / Cloud Run): Kênh SSE của máy chủ xử lý toàn bộ 100% thời gian thực,
    //   KHÔNG gắn onSnapshot liên tục trên 40 máy học sinh để tránh cạn hạn ngạch Firestore miễn phí (Quota exceeded).
    // - Chỉ kích hoạt lắng nghe Cloud Firestore khi chạy trên hosting tĩnh thuần túy (Vercel / GitHub Pages chưa trỏ máy chủ).
    let unsubCloudRoster: (() => void) | null = null;
    let unsubCloudSettings: (() => void) | null = null;
    const useCloudFallbackOnly = !isBackendConfigured();

    if (isFirebaseReady && useCloudFallbackOnly) {
      // Tải cài đặt và mã PIN mới nhất từ đám mây khi khởi động
      fetchSettingsFromCloud().then((cloudSettings) => {
        if (!cloudSettings) return;
        if (typeof cloudSettings.allowSubmission === 'boolean') {
          setAllowSubmission(cloudSettings.allowSubmission);
          try {
            localStorage.setItem('labgrade_allow_submission', String(cloudSettings.allowSubmission));
          } catch {}
        }
        if (Array.isArray(cloudSettings.allowedClasses)) {
          setAllowedClasses(cloudSettings.allowedClasses);
          try {
            localStorage.setItem('labgrade_allowed_classes', JSON.stringify(cloudSettings.allowedClasses));
          } catch {}
        }
        if (Array.isArray(cloudSettings.lockedClasses)) {
          setLockedClasses(cloudSettings.lockedClasses);
          try {
            localStorage.setItem('labgrade_locked_classes', JSON.stringify(cloudSettings.lockedClasses));
          } catch {}
        }
        if (typeof cloudSettings.teacherPin === 'string' && cloudSettings.teacherPin.trim()) {
          const pin = cloudSettings.teacherPin.trim();
          try {
            localStorage.setItem('labgrade_teacher_pin_v1', pin);
            localStorage.setItem('labgrade_teacher_pin', pin);
          } catch {}
        }
      }).catch(() => {});

      // Máy học sinh chỉ tải danh sách bài nộp 1 lần khi mở trang (tiết kiệm 95% lượt đọc Firestore)
      fetchSubmissionsFromCloud().then((cloudSubs) => {
        if (Array.isArray(cloudSubs) && cloudSubs.length > 0) {
          const pruned = pruneOldSubmissions(cloudSubs);
          setSubmissions(pruned);
          saveSubmissionsSafely(pruned);
          setPermanentGradebooks((prev) => {
            let next = prev;
            pruned.forEach((s) => {
              next = upsertGradebookFromSubmissionClient(next, s);
            });
            return next;
          });
        }
      }).catch(() => {});

      unsubCloudRoster = subscribeToRosterCloud(
        (cloudRoster) => {
          if (Array.isArray(cloudRoster) && cloudRoster.length > 0) {
            setStudentRoster(cloudRoster);
            try {
              localStorage.setItem('labgrade_student_roster', JSON.stringify(cloudRoster));
            } catch {}
          }
        },
        () => {}
      );

      unsubCloudSettings = subscribeToSettingsCloud(
        (cloudSettings) => {
          if (typeof cloudSettings.allowSubmission === 'boolean') {
            setAllowSubmission(cloudSettings.allowSubmission);
            try {
              localStorage.setItem('labgrade_allow_submission', String(cloudSettings.allowSubmission));
            } catch {}
          }
          if (Array.isArray(cloudSettings.allowedClasses)) {
            setAllowedClasses(cloudSettings.allowedClasses);
            try {
              localStorage.setItem('labgrade_allowed_classes', JSON.stringify(cloudSettings.allowedClasses));
            } catch {}
          }
          if (Array.isArray(cloudSettings.lockedClasses)) {
            setLockedClasses(cloudSettings.lockedClasses);
            try {
              localStorage.setItem('labgrade_locked_classes', JSON.stringify(cloudSettings.lockedClasses));
            } catch {}
          }
          if (typeof cloudSettings.teacherPin === 'string' && cloudSettings.teacherPin.trim()) {
            const pin = cloudSettings.teacherPin.trim();
            try {
              localStorage.setItem('labgrade_teacher_pin_v1', pin);
              localStorage.setItem('labgrade_teacher_pin', pin);
            } catch {}
          }
        },
        () => {}
      );
    }

    // 4. Nạp Bảng Tổng Hợp Điểm Vĩnh Viễn từ Firebase Cloud Firestore (nhẹ: ~13 doc/hệ thống)
    if (isFirebaseReady) {
      fetchAllGradebooksFromCloud().then((cloudGbs) => {
        if (cloudGbs && Object.keys(cloudGbs).length > 0) {
          const merged = mergeGradebooksClient(gradebooksRef.current, cloudGbs);
          setPermanentGradebooks(merged);
          // Nếu có backend (Render/LAN) nhưng vừa khởi động lại trắng đĩa, đẩy lại vào máy chủ
          if (isBackendConfigured()) {
            apiFetch('/api/gradebooks/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ gradebooks: merged }),
            }, 6000).catch(() => {});
          }
        }
      }).catch(() => {});
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'labgrade_allow_submission' && e.newValue !== null) {
        setAllowSubmission(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      realtimeSync.disconnect();
      if (bc) bc.close();
      if (unsubCloudRoster) unsubCloudRoster();
      if (unsubCloudSettings) unsubCloudSettings();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Chỉ lắng nghe luồng bài nộp & trạng thái Online/Offline Cloud liên tục ở chế độ Giáo viên khi chạy trên Vercel/Hosting tĩnh
  useEffect(() => {
    if (!isFirebaseReady || isBackendConfigured() || !isTeacherRole) return;

    const unsubCloudSubs = subscribeToSubmissionsCloud(
      (cloudSubs) => {
        if (Array.isArray(cloudSubs)) {
          setSubmissions((prev) => {
            const map = new Map<string, Submission>();
            prev.forEach((s) => map.set(s.id, s));
            cloudSubs.forEach((s) => map.set(s.id, s));
            const merged = pruneOldSubmissions(Array.from(map.values()));
            saveSubmissionsSafely(merged);
            setPermanentGradebooks((prevGb) => {
              let nextGb = prevGb;
              merged.forEach((s) => {
                nextGb = upsertGradebookFromSubmissionClient(nextGb, s);
              });
              return nextGb;
            });
            return merged;
          });
          setDbStatus((prev) => ({
            ...prev,
            status: 'connected',
            isPersistent: true,
            totalSubmissions: cloudSubs.length,
            lastUpdated: new Date().toLocaleTimeString('vi-VN'),
          }));
          setIsRealtimeConnected(true);
        }
      },
      () => {}
    );

    const unsubCloudPresence = subscribeToPresenceCloud(
      (machines) => {
        setOnlineMachines(machines);
      },
      () => {}
    );

    // Tự động loại bỏ máy quá hạn tín hiệu nếu máy học sinh mất điện/rớt mạng đột ngột
    const prunePresenceTimer = setInterval(() => {
      const cutoff = Date.now() - PRESENCE_CLOUD_TTL_MS;
      setOnlineMachines((prev) => {
        const next = prev.filter((m) => m.lastSeen > cutoff);
        return next.length === prev.length ? prev : next;
      });
    }, 15000);

    return () => {
      if (unsubCloudSubs) unsubCloudSubs();
      if (unsubCloudPresence) unsubCloudPresence();
      clearInterval(prunePresenceTimer);
    };
  }, [isTeacherRole]);

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

  // Gửi tín hiệu Online / Offline (Heartbeat) của máy học sinh lên máy chủ hoặc Cloud Firestore (Vercel) để màn hình máy chiếu nhận biết chính xác
  useEffect(() => {
    let clientId = '';
    try {
      clientId = sessionStorage.getItem('labgrade_client_session_id') || '';
      if (!clientId) {
        clientId = `cli-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        sessionStorage.setItem('labgrade_client_session_id', clientId);
      }
    } catch {
      clientId = `cli-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    const activeMachine = !isTeacherRole && (hasExplicitMachine || studentLeader.trim().length > 0)
      ? machineNumber
      : '';

    // CHẾ ĐỘ 1: Có backend Express (LAN phòng máy / Render)
    if (isBackendConfigured()) {
      const sendHeartbeat = () => {
        if (document.hidden) return;
        apiFetch('/api/presence/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            machineNumber: activeMachine,
            className: userClassName,
            studentLeader: studentLeader.trim(),
            isTeacher: isTeacherRole,
          }),
        }, 4000)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && Array.isArray(data.onlineMachines)) {
              setOnlineMachines(data.onlineMachines);
            }
          })
          .catch(() => {});
      };

      sendHeartbeat();
      const hbInterval = setInterval(sendHeartbeat, 18000);
      const handleVisibility = () => {
        if (!document.hidden) sendHeartbeat();
      };
      document.addEventListener('visibilitychange', handleVisibility);

      const handleOfflineBeacon = () => {
        try {
          const offlineUrl = getApiUrl('/api/presence/offline');
          const payload = JSON.stringify({ clientId });
          if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon(offlineUrl, blob);
          }
        } catch {}
      };

      window.addEventListener('pagehide', handleOfflineBeacon);
      window.addEventListener('beforeunload', handleOfflineBeacon);

      return () => {
        clearInterval(hbInterval);
        document.removeEventListener('visibilitychange', handleVisibility);
        window.removeEventListener('pagehide', handleOfflineBeacon);
        window.removeEventListener('beforeunload', handleOfflineBeacon);
      };
    }

    // CHẾ ĐỘ 2: Hosting tĩnh Vercel + Cloud Firestore (Không cần Render backend)
    if (!isFirebaseReady) return;

    if (isTeacherRole || !activeMachine) {
      // Nếu chuyển sang vai trò Giáo Viên trên máy đó -> báo Offline máy trạm nếu trước đó vừa điểm danh
      if (hasExplicitMachine && machineNumber) {
        const docId = buildPresenceDocId(clientId, userClassName, machineNumber);
        markPresenceOfflineBeaconCloud(docId);
      }
      return;
    }

    const sendCloudHeartbeat = () => {
      if (document.hidden) return;
      updatePresenceCloud({
        clientId,
        machineNumber: activeMachine,
        className: userClassName,
        studentLeader: studentLeader.trim(),
        online: true,
      }).catch(() => {});
    };

    sendCloudHeartbeat();
    const cloudHbInterval = setInterval(sendCloudHeartbeat, 45000);
    const handleVisibilityCloud = () => {
      if (!document.hidden) sendCloudHeartbeat();
    };
    document.addEventListener('visibilitychange', handleVisibilityCloud);

    const presenceDocId = buildPresenceDocId(clientId, userClassName, activeMachine);
    const handleCloudOffline = () => {
      markPresenceOfflineBeaconCloud(presenceDocId);
    };

    window.addEventListener('pagehide', handleCloudOffline);
    window.addEventListener('beforeunload', handleCloudOffline);

    return () => {
      clearInterval(cloudHbInterval);
      document.removeEventListener('visibilitychange', handleVisibilityCloud);
      window.removeEventListener('pagehide', handleCloudOffline);
      window.removeEventListener('beforeunload', handleCloudOffline);
      markPresenceOfflineBeaconCloud(presenceDocId);
    };
  }, [isTeacherRole, hasExplicitMachine, machineNumber, userClassName, studentLeader]);

  // Fetch session status & sync submissions with network timeout protection
  const refreshSubmissionsAndStatus = async () => {
    const pendingQueue = getPendingSyncQueue();

    // CHẾ ĐỘ VERCEL + FIREBASE CLOUD (Không gọi /api/* thừa gây tốn băng thông & trả HTML)
    if (!isBackendConfigured()) {
      if (!isFirebaseReady) return;
      try {
        if (pendingQueue.length > 0) {
          const okBatch = await batchSaveSubmissionsToCloud(pendingQueue).catch(() => false);
          if (okBatch) clearPendingSyncQueue();
        }

        const [cloudSubs, cloudGbs, cloudSettings, cloudRoster, cloudPresence] = await Promise.all([
          fetchSubmissionsFromCloud().catch(() => []),
          fetchAllGradebooksFromCloud().catch(() => ({})),
          fetchSettingsFromCloud().catch(() => null),
          fetchRosterFromCloud().catch(() => []),
          fetchPresenceFromCloud().catch(() => []),
        ]);

        if (cloudSettings) {
          if (typeof cloudSettings.allowSubmission === 'boolean') {
            setAllowSubmission(cloudSettings.allowSubmission);
          }
          if (Array.isArray(cloudSettings.allowedClasses)) {
            setAllowedClasses(cloudSettings.allowedClasses);
          }
          if (Array.isArray(cloudSettings.lockedClasses)) {
            setLockedClasses(cloudSettings.lockedClasses);
          }
        }

        if (Array.isArray(cloudSubs)) {
          const cleanCloudSubs = cloudSubs
            .filter((s) => s && !String(s.id).startsWith('mock-'))
            .map((s) => sanitizeSubmission(s));
          setSubmissions(cleanCloudSubs);
          saveSubmissionsSafely(cleanCloudSubs);

          setPermanentGradebooks((prev) => {
            let next = cloudGbs && Object.keys(cloudGbs).length > 0
              ? mergeGradebooksClient(prev, cloudGbs)
              : prev;
            cleanCloudSubs.forEach((s) => {
              next = upsertGradebookFromSubmissionClient(next, s);
            });
            return next;
          });

          setDbStatus((prev) => ({
            ...prev,
            status: 'connected',
            isPersistent: true,
            totalSubmissions: cleanCloudSubs.length,
            lastUpdated: new Date().toLocaleTimeString('vi-VN'),
          }));
        } else if (cloudGbs && Object.keys(cloudGbs).length > 0) {
          setPermanentGradebooks((prev) => mergeGradebooksClient(prev, cloudGbs));
        }

        if (Array.isArray(cloudRoster) && cloudRoster.length > 0) {
          setStudentRoster(cloudRoster);
        }

        if (Array.isArray(cloudPresence)) {
          setOnlineMachines(cloudPresence);
        }

        setIsRealtimeConnected(true);
      } catch {}
      return;
    }

    // CHẾ ĐỘ BACKEND NODE / LAN / RENDER
    // 1. Kiểm tra và đẩy hàng đợi bài nộp offline nếu có
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

    // 2. Tải danh sách bài nộp thu gọn và trạng thái CSDL mới nhất từ máy chủ
    try {
      const res = await apiFetch('/api/submissions', { method: 'GET' }, 15000);
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        const data = await res.json();
        if (typeof data.allowSubmission === 'boolean') {
          setAllowSubmission(data.allowSubmission);
        }
        if (Array.isArray(data.allowedClasses)) {
          setAllowedClasses(data.allowedClasses);
          try {
            localStorage.setItem('labgrade_allowed_classes', JSON.stringify(data.allowedClasses));
          } catch {}
        }
        if (Array.isArray(data.lockedClasses)) {
          setLockedClasses(data.lockedClasses);
          try {
            localStorage.setItem('labgrade_locked_classes', JSON.stringify(data.lockedClasses));
          } catch {}
        }
        if (data.dbStatus) {
          setDbStatus(data.dbStatus);
        }
        if (Array.isArray(data.onlineMachines)) {
          setOnlineMachines(data.onlineMachines);
        }
        if (Array.isArray(data.submissions)) {
          const serverSubs = data.submissions
            .filter((s: any) => s && !String(s.id).startsWith('mock-'))
            .map((raw: any) => sanitizeSubmission(raw));

          // CSDL máy chủ là nguồn dữ liệu chuẩn mực cho danh sách bài nộp trực tiếp
          setSubmissions(serverSubs);
          saveSubmissionsSafely(serverSubs);

          // Đồng thời luôn hợp nhất vào Bảng Điểm Tổng Hợp Vĩnh Viễn (giữ toàn bộ điểm SP1, SP2...)
          setPermanentGradebooks((prev) => {
            let next = data.gradebooks && typeof data.gradebooks === 'object'
              ? mergeGradebooksClient(prev, data.gradebooks)
              : prev;
            serverSubs.forEach((s: Submission) => {
              next = upsertGradebookFromSubmissionClient(next, s);
            });
            return next;
          });
        } else if (data.gradebooks && typeof data.gradebooks === 'object') {
          setPermanentGradebooks((prev) => mergeGradebooksClient(prev, data.gradebooks));
        }
      }
    } catch {
      // offline or network congestion resilience in busy computer lab
    }

    // 3. Tự động đồng bộ danh sách học sinh từ CSDL máy chủ
    try {
      const rosterRes = await apiFetch('/api/student-roster', { method: 'GET' }, 15000);
      const rType = rosterRes.headers.get('content-type') || '';
      if (rosterRes.ok && rType.includes('application/json')) {
        const rosterData = await rosterRes.json();
        if (Array.isArray(rosterData.students)) {
          setStudentRoster(rosterData.students);
        }
      }
    } catch {}
  };

  // Lưu và đồng bộ vĩnh viễn toàn bộ Bảng Tổng Hợp Điểm (SP1, SP2, SP3...) lên Server + Firebase Cloud Firestore
  const handleSaveGradebooksToDb = async (): Promise<boolean> => {
    try {
      const currentSubs = loadSubmissionsSafely(submissions);
      let merged = gradebooksRef.current;
      currentSubs.forEach((s) => {
        merged = upsertGradebookFromSubmissionClient(merged, s);
      });

      if (isFirebaseReady) {
        try {
          const cloudGbs = await fetchAllGradebooksFromCloud();
          if (cloudGbs && Object.keys(cloudGbs).length > 0) {
            merged = mergeGradebooksClient(merged, cloudGbs);
          }
        } catch {}
      }

      setPermanentGradebooks(merged);
      saveGradebooksSafely(merged);

      let syncedCloud = false;
      if (isFirebaseReady) {
        syncedCloud = await batchSaveGradebooksToCloud(merged).catch(() => false);
      }

      let syncedServer = false;
      if (isBackendConfigured()) {
        try {
          const res = await apiFetch('/api/gradebooks/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gradebooks: merged }),
          }, 8000);
          if (res.ok) {
            const json = await res.json();
            if (json?.gradebooks) {
              const finalMerged = mergeGradebooksClient(merged, json.gradebooks);
              setPermanentGradebooks(finalMerged);
              saveGradebooksSafely(finalMerged);
            }
            syncedServer = true;
          }
        } catch {}
      }

      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('labgrade_session_channel');
          bc.postMessage({ type: 'GRADEBOOK_UPDATED', gradebooks: merged });
          bc.close();
        } catch {}
      }

      return syncedCloud || syncedServer || Object.keys(merged).length > 0;
    } catch (err) {
      console.warn('Lỗi lưu bảng điểm vĩnh viễn:', err);
      return false;
    }
  };

  // Đồng bộ toàn bộ bài nộp trên máy này lên CSDL trung tâm & Firebase Cloud
  const handleSyncAllLocalSubmissionsToDb = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const currentList = loadSubmissionsSafely(submissions);
      await handleSaveGradebooksToDb();
      if (!currentList || currentList.length === 0) {
        return { success: true, count: 0 };
      }
      if (isFirebaseReady) {
        await batchSaveSubmissionsToCloud(currentList).catch((err) => {
          console.warn('[Firebase Cloud] Lỗi batch sync:', err);
        });
      }
      if (isBackendConfigured()) {
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
      }
      clearPendingSyncQueue();
      return { success: true, count: currentList.length };
    } catch (err: any) {
      if (isFirebaseReady) {
        return { success: true, count: submissions.length };
      }
      return { success: false, count: 0, error: err.message || 'Lỗi kết nối CSDL' };
    }
  };

  // Xóa sạch toàn bộ kết quả chấm ảo các ngày trước đây cả trên máy chủ, bộ nhớ đệm và các máy trạm
  const handleClearAllSubmissions = async (targetClass?: string): Promise<boolean> => {
    if (isFirebaseReady) {
      await deleteSubmissionsFromCloud(targetClass && targetClass !== 'Tất cả' ? targetClass : undefined).catch(() => {});
    }
    if (isBackendConfigured()) {
      try {
        if (!targetClass || targetClass === 'Tất cả') {
          await apiFetch('/api/submissions/clear', { method: 'POST' });
          await apiFetch('/api/submissions', { method: 'DELETE' });
        } else {
          await apiFetch(`/api/submissions?className=${encodeURIComponent(targetClass)}`, { method: 'DELETE' });
          await apiFetch('/api/submissions/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ className: targetClass }),
          });
        }
      } catch {}
    }

    if (!targetClass || targetClass === 'Tất cả') {
      setSubmissions([]);
      purgeAllLegacySubmissions();
      saveSubmissionsSafely([]);
    } else {
      const normTarget = normalizeClassName(targetClass);
      setSubmissions((prev) => {
        const next = prev.filter((s) => normalizeClassName(s.className) !== normTarget);
        saveSubmissionsSafely(next);
        return next;
      });
    }

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('labgrade_session_channel');
        bc.postMessage({ type: 'SUBMISSIONS_CLEARED', targetClass });
        bc.close();
      } catch {}
    }

    await refreshSubmissionsAndStatus();
    return true;
  };

  // Xóa bảng điểm vĩnh viễn khi giáo viên chủ động bấm xóa sổ điểm
  const handleClearGradebooks = async (targetClass?: string): Promise<boolean> => {
    if (isFirebaseReady) {
      await deleteGradebooksFromCloud(targetClass && targetClass !== 'Tất cả' ? targetClass : undefined).catch(() => {});
    }
    if (isBackendConfigured()) {
      try {
        if (!targetClass || targetClass === 'Tất cả') {
          await apiFetch('/api/gradebooks', { method: 'DELETE' });
        } else {
          await apiFetch(`/api/gradebooks?className=${encodeURIComponent(targetClass)}`, { method: 'DELETE' });
        }
      } catch {}
    }
    if (!targetClass || targetClass === 'Tất cả') {
      setPermanentGradebooks({});
    } else {
      const normCls = normalizeClassName(targetClass);
      setPermanentGradebooks((prev) => {
        const next = { ...prev };
        delete next[normCls];
        return next;
      });
    }
    return true;
  };

  // Lấy tất cả tên lớp đang có trong hệ thống để khóa đồng bộ toàn trường
  const getAllKnownClasses = (): string[] => {
    const set = new Set<string>();
    SCHOOL_CLASSES.forEach((c) => set.add(normalizeClassName(c)));
    studentRoster.forEach((s) => {
      if (s.className) set.add(normalizeClassName(s.className));
    });
    submissions.forEach((s) => {
      if (s.className) set.add(normalizeClassName(s.className));
    });
    Object.keys(permanentGradebooks || {}).forEach((c) => {
      if (c) set.add(normalizeClassName(c));
    });
    return Array.from(set).filter(Boolean);
  };

  // Toggle submission lock handler theo từng lớp (KHÔNG xóa điểm hay bài nộp SP1, SP2 đã chấm trong CSDL)
  const handleToggleSubmissionPermission = async (allow: boolean, targetClass?: string) => {
    const rawClass = targetClass || userClassName;
    const normTarget = normalizeClassName(rawClass);
    let nextAllowed = [...allowedClasses];
    let nextLocked = [...lockedClasses];

    if (allow) {
      if (!nextAllowed.some((c) => normalizeClassName(c) === normTarget)) {
        nextAllowed.push(normTarget);
      }
      nextLocked = nextLocked.filter((c) => normalizeClassName(c) !== normTarget);
      setAllowSubmission(true);
    } else {
      // Khóa nộp bài của lớp đó (Giữ nguyên toàn bộ điểm SP1, SP2... đã chấm trong CSDL vĩnh viễn!)
      nextAllowed = nextAllowed.filter((c) => normalizeClassName(c) !== normTarget);
      if (!nextLocked.some((c) => normalizeClassName(c) === normTarget)) {
        nextLocked.push(normTarget);
      }
    }

    setAllowedClasses(nextAllowed);
    setLockedClasses(nextLocked);
    try {
      localStorage.setItem('labgrade_allowed_classes', JSON.stringify(nextAllowed));
      localStorage.setItem('labgrade_locked_classes', JSON.stringify(nextLocked));
      localStorage.setItem('labgrade_allow_submission', String(allow ? true : allowSubmission));

      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('labgrade_session_channel');
        bc.postMessage({
          type: 'SUBMISSION_PERMISSION_CHANGED',
          allow: allow ? true : allowSubmission,
          targetClass: normTarget,
          allowedClasses: nextAllowed,
          lockedClasses: nextLocked,
        });
        bc.close();
      }
    } catch {}

    // Đồng bộ tức thời lên Google Firebase Cloud Firestore (để máy xách tay và máy bàn thấy nhau ngay)
    if (isFirebaseReady) {
      await saveSettingsToCloud({
        allowSubmission: allow ? true : allowSubmission,
        allowedClasses: nextAllowed,
        lockedClasses: nextLocked,
      }).catch((cloudErr) => {
        console.warn('[Firebase Cloud] Lỗi lưu quyền nộp bài lên đám mây:', cloudErr);
      });
    }

    if (isBackendConfigured()) {
      try {
        const res = await apiFetch('/api/session-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ allow, className: normTarget }),
        }, 4000);
        if (res.ok) {
          console.log(`[Quyền Nộp Bài] Lớp ${normTarget}: ${allow ? 'MỞ CHO PHÉP NỘP' : 'ĐÃ KHÓA NỘP BÀI'}`);
        }
      } catch (err) {
        console.warn('Lỗi gửi trạng thái khóa nộp bài tới máy chủ:', err);
      }
      await refreshSubmissionsAndStatus();
    }
  };

  // Khóa / Mở TẤT CẢ CÁC LỚP trong toàn hệ thống chỉ bằng 1 nút bấm
  const handleToggleAllClassesPermission = async (allow: boolean) => {
    const allKnown = getAllKnownClasses();
    const nextAllowed: string[] = [];
    const nextLocked: string[] = allow ? [] : allKnown;

    setAllowSubmission(allow);
    setAllowedClasses(nextAllowed);
    setLockedClasses(nextLocked);

    try {
      localStorage.setItem('labgrade_allow_submission', String(allow));
      localStorage.setItem('labgrade_allowed_classes', JSON.stringify(nextAllowed));
      localStorage.setItem('labgrade_locked_classes', JSON.stringify(nextLocked));

      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('labgrade_session_channel');
        bc.postMessage({
          type: 'SUBMISSION_PERMISSION_CHANGED',
          allow,
          allowedClasses: nextAllowed,
          lockedClasses: nextLocked,
        });
        bc.close();
      }
    } catch {}

    if (isFirebaseReady) {
      await saveSettingsToCloud({
        allowSubmission: allow,
        allowedClasses: nextAllowed,
        lockedClasses: nextLocked,
      }).catch((cloudErr) => {
        console.warn('[Firebase Cloud] Lỗi khóa/mở tất cả lớp lên đám mây:', cloudErr);
      });
    }

    if (isBackendConfigured()) {
      try {
        await apiFetch('/api/session-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            allow,
            lockAll: true,
            allClasses: allKnown,
          }),
        }, 4000);
        console.log(`[Quyền Nộp Bài Toàn Trường] ${allow ? 'ĐÃ MỞ TẤT CẢ CÁC LỚP' : 'ĐÃ KHÓA TẤT CẢ CÁC LỚP'}`);
      } catch (err) {
        console.warn('Lỗi gửi trạng thái khóa tất cả lớp tới máy chủ:', err);
      }
      await refreshSubmissionsAndStatus();
    }
  };

  // Lưu danh sách học sinh từ Excel lên máy chủ và cập nhật state (Tích lũy từ lớp này sang lớp khác)
  const handleSaveStudentRoster = async (
    students: StudentRecord[],
    mode: 'accumulate' | 'upsert' | 'replace' = 'accumulate'
  ): Promise<{ success: boolean; total: number; classes: string[] }> => {
    // 1. Tính toán danh sách học sinh mới ngay lập tức
    const currentList = studentRoster.length > 0 ? studentRoster : (() => {
      try {
        const s = localStorage.getItem('labgrade_student_roster');
        return s ? JSON.parse(s) : [];
      } catch {
        return [];
      }
    })();

    let updatedRoster: StudentRecord[] = [];
    if (mode === 'replace') {
      updatedRoster = [...students];
    } else {
      const map = new Map<string, StudentRecord>();
      currentList.forEach((s: StudentRecord) => map.set(`${s.className.toUpperCase()}___${s.fullName.trim().toLowerCase()}`, s));
      students.forEach((s: StudentRecord) => map.set(`${s.className.toUpperCase()}___${s.fullName.trim().toLowerCase()}`, s));
      updatedRoster = Array.from(map.values());
    }

    // Sắp xếp theo lớp rồi đến STT / Tên
    updatedRoster.sort((a, b) => {
      if (a.className !== b.className) return a.className.localeCompare(b.className);
      const sttA = Number(a.stt) || 999;
      const sttB = Number(b.stt) || 999;
      if (sttA !== sttB) return sttA - sttB;
      return a.fullName.localeCompare(b.fullName, 'vi');
    });

    const finalClasses = Array.from(new Set(updatedRoster.map((s) => s.className)));

    // 2. Cập nhật state & localStorage
    setStudentRoster(updatedRoster);
    try {
      localStorage.setItem('labgrade_student_roster', JSON.stringify(updatedRoster));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('labgrade_session_channel');
        bc.postMessage({ type: 'ROSTER_UPDATED', students: updatedRoster });
        bc.close();
      }
    } catch {}

    // 3. ĐẨY LÊN FIREBASE CLOUD FIRESTORE VÀ CHỜ HOÀN TẤT (AWAIT)
    if (isFirebaseReady && updatedRoster.length > 0) {
      try {
        await saveRosterToCloud(updatedRoster);
        console.log(`[Firebase Cloud] ✅ Đã lưu và đồng bộ thành công ${updatedRoster.length} học sinh lên Cloud Firestore!`);
      } catch (cloudErr) {
        console.warn('[Firebase Cloud] Lỗi lưu danh sách học sinh lên cloud:', cloudErr);
      }
    }

    // 4. Nếu có backend nội bộ (/api/student-roster), đồng bộ thêm
    if (isBackendConfigured()) {
      try {
        await apiFetch('/api/student-roster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: updatedRoster, mode: 'replace' }),
        }, 5000);
      } catch {}
    }

    return {
      success: true,
      total: updatedRoster.length,
      classes: finalClasses,
    };
  };

  // Xóa danh sách học sinh (toàn bộ hoặc theo từng lớp - kết nối CSDL trung tâm và đồng bộ các máy)
  const handleDeleteStudentRoster = async (className?: string): Promise<boolean> => {
    let next: StudentRecord[];
    if (className && className.trim()) {
      const rawNorm = className.trim().toUpperCase();
      const cleanNorm = rawNorm.replace(/^LỚP\s*|^LOP\s*/i, '');
      next = studentRoster.filter((s) => {
        const sCls = (s.className || '').trim().toUpperCase();
        const sClean = sCls.replace(/^LỚP\s*|^LOP\s*/i, '');
        return sCls !== rawNorm && sClean !== cleanNorm && sCls !== cleanNorm;
      });
    } else {
      next = [];
    }

    setStudentRoster(next);
    try {
      localStorage.setItem('labgrade_student_roster', JSON.stringify(next));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('labgrade_session_channel');
        bc.postMessage({ type: 'ROSTER_UPDATED', students: next });
        bc.close();
      }
    } catch {}

    if (isFirebaseReady) {
      try {
        await saveRosterToCloud(next);
      } catch {}
    }

    if (isBackendConfigured()) {
      try {
        const url = className && className.trim()
          ? `/api/student-roster?className=${encodeURIComponent(className.trim())}`
          : '/api/student-roster';
        await apiFetch(url, { method: 'DELETE' }, 4000);
      } catch {}
    }

    return true;
  };

  // Đổi tên lớp học sinh nhanh chóng trong CSDL (ví dụ sửa nhầm 6B2 thành 6A2)
  const handleRenameStudentClass = async (oldClassName: string, newClassName: string): Promise<boolean> => {
    if (!oldClassName || !newClassName) return false;
    const oldNorm = oldClassName.trim().toUpperCase();
    const oldClean = oldNorm.replace(/^LỚP\s*|^LOP\s*/i, '');
    const newNorm = newClassName.trim().toUpperCase().replace(/^LỚP\s*|^LOP\s*/i, '');

    const next = studentRoster.map((s) => {
      const sCls = (s.className || '').trim().toUpperCase();
      const sClean = sCls.replace(/^LỚP\s*|^LOP\s*/i, '');
      if (sCls === oldNorm || sClean === oldClean || sCls === oldClean) {
        return { ...s, className: newNorm };
      }
      return s;
    });

    setStudentRoster(next);
    try {
      localStorage.setItem('labgrade_student_roster', JSON.stringify(next));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('labgrade_session_channel');
        bc.postMessage({ type: 'ROSTER_UPDATED', students: next });
        bc.close();
      }
    } catch {}

    if (isFirebaseReady) {
      try {
        await saveRosterToCloud(next);
      } catch {}
    }

    if (isBackendConfigured()) {
      try {
        await apiFetch('/api/student-roster/rename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldClassName: oldClassName.trim(), newClassName: newClassName.trim() }),
        }, 4000);
      } catch {}
    }

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

  // Đồng bộ dữ liệu khi khởi động + polling dự phòng tiết kiệm băng thông
  useEffect(() => {
    refreshSubmissionsAndStatus();
    // Khi chạy trên backend Express (Render/LAN), SSE đã đẩy tức thời nên chỉ cần quét dự phòng mỗi 15s (tiết kiệm >85% băng thông).
    // Khi chạy trên Vercel, Cloud onSnapshot đã đồng bộ tức thời nên chỉ cần kiểm tra nhẹ mỗi 60s khi tab đang mở.
    const pollMs = isBackendConfigured() ? 15000 : 60000;
    const interval = setInterval(() => {
      if (!document.hidden) {
        refreshSubmissionsAndStatus();
      }
    }, pollMs);
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
    fileLastModified?: number;
    fileContent: string;
    fileDataUrl?: string;
    imageBase64?: string;
  }): Promise<SubmissionAttempt | null> => {
    const todayStr = getTodayDateString();
    const currentAssignment =
      assignments.find((a) => a.id === data.assignmentId) || activeAssignment;

    // 0. BẢO VỆ CHẶT CHẼ: KIỂM TRA QUYỀN NỘP BÀI TỪ GIÁO VIÊN THEO TỪNG LỚP
    if (!isClassSubmissionAllowed(data.className)) {
      throw new Error(`🔒 Tiết thực hành lớp ${data.className.toUpperCase()} chưa được giáo viên mở khóa nộp bài (hoặc tiết thực hành đã kết thúc). Em hãy chờ thầy/cô thông báo nhé!`);
    }

    // Kiểm tra trực tiếp thời gian thực với máy chủ (hoặc Firebase Cloud trên Vercel) xem lớp này có đang mở nộp bài không
    if (isBackendConfigured()) {
      try {
        const checkRes = await apiFetch(`/api/session-status?className=${encodeURIComponent(data.className)}`, { method: 'GET' }, 2000);
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (typeof checkData.allowSubmission === 'boolean' && !checkData.allowSubmission) {
            throw new Error(`🔒 Giáo viên hiện đang KHÓA nhận bài nộp của lớp ${data.className.toUpperCase()}.`);
          }
        }
      } catch (checkErr: any) {
        if (checkErr?.message && (checkErr.message.includes('KHÓA') || checkErr.message.includes('khóa'))) {
          throw checkErr;
        }
      }
    } else if (isFirebaseReady) {
      try {
        const cloudSettings = await fetchSettingsFromCloud();
        if (cloudSettings) {
          if (cloudSettings.allowSubmission === false) {
            throw new Error(`🔒 Giáo viên hiện đang KHÓA nhận bài nộp toàn trường.`);
          }
          const normClsCheck = normalizeClassName(data.className);
          if (Array.isArray(cloudSettings.lockedClasses) && cloudSettings.lockedClasses.some((c) => normalizeClassName(c) === normClsCheck)) {
            throw new Error(`🔒 Giáo viên hiện đang KHÓA nhận bài nộp của lớp ${data.className.toUpperCase()}.`);
          }
          if (Array.isArray(cloudSettings.allowedClasses) && cloudSettings.allowedClasses.length > 0 && !cloudSettings.allowedClasses.some((c) => normalizeClassName(c) === normClsCheck)) {
            throw new Error(`🔒 Lớp ${data.className.toUpperCase()} chưa được giáo viên mở khóa nộp bài.`);
          }
        }
      } catch (cloudCheckErr: any) {
        if (cloudCheckErr?.message && (cloudCheckErr.message.includes('KHÓA') || cloudCheckErr.message.includes('mở khóa'))) {
          throw cloudCheckErr;
        }
      }
    }

    // KIỂM TRA BÀI NỘP CỦA CÙNG SẢN PHẨM HÔM NAY (Khác sản phẩm SP1 vs SP2 hay khác ngày không bao giờ ghi đè nhau)
    const cleanLeader = (data.studentLeader || '').trim().toLowerCase();
    const normDataCls = normalizeClassName(data.className);
    const existingSubmission = submissions.find(
      (s) =>
        s &&
        normalizeClassName(s.className) === normDataCls &&
        (s.assignmentId || '') === currentAssignment.id &&
        ((s.studentLeader || '').trim().toLowerCase() === cleanLeader ||
          (s.machineNumber === data.machineNumber &&
            Array.isArray(s.groupMembers) &&
            s.groupMembers.some((m: string) => (m || '').trim().toLowerCase() === cleanLeader))) &&
        (s.practiceDate === todayStr || isSubmittedToday(s.latestSubmittedAt, todayStr))
    );

    // Nếu là phiên trong cùng ngày hôm nay: số lần nộp tăng dần (attempt 2, 3...)
    // Nếu là ngày hôm sau / tuần sau: bắt đầu từ lần 1 của ngày hôm đó
    const attemptNumber = existingSubmission ? existingSubmission.attempts.length + 1 : 1;

    // Chấm điểm qua máy chủ AI (nếu có backend) hoặc động cơ quét thông minh ngay trên trình duyệt (chế độ Vercel siêu nhanh, không phụ thuộc Render)
    let gradeData: any;
    let gradedViaBackend = false;
    if (isBackendConfigured()) {
      try {
        const response = await apiFetch('/api/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignment: currentAssignment,
            fileName: data.fileName,
            fileSize: data.fileSize,
            fileLastModified: data.fileLastModified,
            fileContent: data.fileContent,
            imageBase64: data.imageBase64,
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
        gradedViaBackend = true;
      } catch (err: any) {
        if (err?.message && (err.message.includes('KHÓA') || err.message.includes('khóa') || err.message.includes('locked'))) {
          throw err;
        }
        console.warn('Call to /api/grade failed, using smart local evaluator:', err);
      }
    }

    if (!gradedViaBackend) {
      // Kiểm tra phát hiện sao chép lớp trước phía client khi offline hoặc máy chủ chưa sẵn sàng
      const clientPlag = detectPlagiarismClientSide(
        {
          className: data.className,
          machineNumber: data.machineNumber,
          studentLeader: data.studentLeader,
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileLastModified: data.fileLastModified,
          fileContent: data.fileContent,
          imageBase64: data.imageBase64,
        },
        submissions
      );

      if (clientPlag && clientPlag.isCopied) {
        gradeData = {
          score: 0.0,
          aiComparisonDetails: clientPlag.message,
          strengths: ['Tệp được tải lên thành công.'],
          weaknesses: [
            `🚨 VI PHẠM TÍNH TRUNG THỰC: Tệp nộp trùng khớp 100% với sản phẩm của bạn ${clientPlag.copiedFromStudent} (${clientPlag.copiedFromClass} - ${clientPlag.copiedFromMachine}).`,
            'Hệ thống không chấp nhận nộp lại bài làm có sẵn của học sinh lớp trước trên máy tính.',
          ],
          howToGetTen: [
            'Bước 1: Mở phần mềm và tự tay thực hành lại sản phẩm của nhóm mình.',
            'Bước 2: Tuyệt đối không nộp các tệp có sẵn của học sinh lớp trước để lại trên máy.',
            'Bước 3: Lưu lại tệp mới và bấm "Chấm Lại Bằng AI" để được ghi nhận điểm số chính thức.',
          ],
          criteriaResults: Array.isArray(currentAssignment?.rubric)
            ? currentAssignment.rubric.map((r: any) => ({
                criterionId: r.id,
                criterionName: r.name,
                score: 0,
                maxScore: r.maxScore,
                feedback: `⚠️ Không tính điểm do phát hiện tệp nộp trùng khớp y nguyên với bài làm của học sinh lớp trước (${clientPlag.copiedFromClass}).`,
              }))
            : [],
          stepEvaluations: Array.isArray(currentAssignment?.steps)
            ? currentAssignment.steps.map((st: string, idx: number) => ({
                stepNumber: idx + 1,
                instruction: st,
                status: 'failed' as const,
                detail: 'Không được công nhận do sao chép tệp bài làm có sẵn.',
              }))
            : [],
          inspectionSummary: {
            contentScorePercent: 0,
            formatScorePercent: 0,
            stepCompletionRate: '0 bước được công nhận (Vi phạm sao chép)',
            isOffTopic: false,
            warningMessage: clientPlag.message,
          },
          plagiarismAlert: clientPlag,
          encouragement: 'Em hãy tự tay thực hành lại bài học nhé. Thầy/Cô và hệ thống luôn ghi nhận nỗ lực thực chất của em!',
          engine: 'anti-plagiarism-detector',
        };
      } else {
        gradeData = analyzeStudentWork({
          assignment: currentAssignment,
          fileName: data.fileName,
          fileContent: data.fileContent,
          imageBase64: data.imageBase64,
          attemptNumber,
        });
      }
    }

    const hasPlagAlert = Boolean(gradeData?.plagiarismAlert && gradeData.plagiarismAlert.isCopied);
    if (hasPlagAlert) {
      try {
        const bc = new BroadcastChannel('labgrade_session_channel');
        bc.postMessage({
          type: 'PLAGIARISM_ALERT',
          machineNumber: data.machineNumber,
          className: data.className,
          studentLeader: data.studentLeader,
          copiedFromClass: gradeData.plagiarismAlert.copiedFromClass,
          copiedFromStudent: gradeData.plagiarismAlert.copiedFromStudent,
          copiedFromMachine: gradeData.plagiarismAlert.copiedFromMachine,
          copiedAt: gradeData.plagiarismAlert.copiedAt,
          message: gradeData.plagiarismAlert.message,
          timestamp: new Date().toISOString(),
        });
        bc.close();
      } catch {}
    }

    const newAttempt: SubmissionAttempt = {
      attemptNumber,
      timestamp: new Date().toISOString(),
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileLastModified: data.fileLastModified,
      fileContent: data.fileContent,
      fileDataUrl: data.fileDataUrl || (data.imageBase64?.startsWith('data:') ? data.imageBase64 : undefined),
      imageBase64: data.imageBase64,
      score: gradeData.score,
      aiComparisonDetails: gradeData.aiComparisonDetails || 'Sản phẩm đã được hệ thống AI đối chiếu tự động với sản phẩm mẫu & chuẩn tri thức môn Tin học.',
      criteriaResults: gradeData.criteriaResults || [],
      strengths: gradeData.strengths || [],
      weaknesses: gradeData.weaknesses || [],
      howToGetTen: gradeData.howToGetTen || [],
      stepEvaluations: gradeData.stepEvaluations || [],
      inspectionSummary: gradeData.inspectionSummary || undefined,
      plagiarismAlert: gradeData.plagiarismAlert || undefined,
    };

    let updatedSubmission: Submission;

    if (gradeData?.submission) {
      updatedSubmission = sanitizeSubmission(gradeData.submission);
    } else if (existingSubmission) {
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
        hasPlagiarism: hasPlagAlert || existingSubmission.hasPlagiarism,
        plagiarismAlert: gradeData.plagiarismAlert || existingSubmission.plagiarismAlert,
        status: maxScore >= 10 ? 'perfect' : maxScore >= 7 ? 'graded' : 'needs_improvement',
      };
    } else {
      updatedSubmission = {
        id: `sub-${normalizeClassName(data.className)}-${data.machineNumber.replace(/\s+/g, '_')}-${currentAssignment.id.slice(0, 18)}-${todayStr}-${Date.now()}`,
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
        hasPlagiarism: hasPlagAlert,
        plagiarismAlert: gradeData.plagiarismAlert || undefined,
        status: newAttempt.score >= 10 ? 'perfect' : newAttempt.score >= 7 ? 'graded' : 'needs_improvement',
      };
    }

    // Cập nhật ngay vào danh sách submissions và Bảng Điểm Tổng Hợp Vĩnh Viễn của máy này
    setSubmissions((prev) => {
      const filtered = prev.filter(
        (s) => s.id !== updatedSubmission.id && !isSameSubmissionSlot(s, updatedSubmission)
      );
      const next = pruneOldSubmissions([updatedSubmission, ...filtered]);
      saveSubmissionsSafely(next);
      return next;
    });
    setPermanentGradebooks((prev) => upsertGradebookFromSubmissionClient(prev, updatedSubmission));

    // Phát sóng ngay qua BroadcastChannel tới các tab/máy chiếu mở trên cùng máy
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('labgrade_session_channel');
        bc.postMessage({
          type: 'SUBMISSION_UPDATED',
          submission: updatedSubmission,
        });
        bc.close();
      } catch {}
    }

    // 1. Lưu vĩnh viễn lên đám mây Google Firebase Firestore (cả bài nộp & bảng tổng hợp SP1, SP2... của lớp)
    if (isFirebaseReady) {
      await Promise.all([
        saveSubmissionToCloud(updatedSubmission).catch((cloudErr) => {
          console.warn('[Firebase Cloud] Lỗi lưu bài nộp lên đám mây:', cloudErr);
          return false;
        }),
        saveSubmissionIntoCloudGradebook(updatedSubmission).catch((cloudErr) => {
          console.warn('[Firebase Cloud] Lỗi lưu sổ điểm SP1, SP2... lên đám mây:', cloudErr);
          return false;
        }),
      ]);
    }

    // 2. Nếu có backend phòng máy (LAN / Render), lưu đồng bộ tức thời vào CSDL đĩa
    if (isBackendConfigured()) {
      try {
        const syncRes = await apiFetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSubmission),
        }, 15000);
        if (syncRes.ok) {
          const syncJson = await syncRes.json();
          if (syncJson.submission) {
            const finalized = sanitizeSubmission(syncJson.submission);
            setSubmissions((prev) => {
              const filtered = prev.filter(
                (s) => s.id !== finalized.id && !isSameSubmissionSlot(s, finalized)
              );
              const next = pruneOldSubmissions([finalized, ...filtered]);
              saveSubmissionsSafely(next);
              return next;
            });
            setPermanentGradebooks((prev) => {
              let next = upsertGradebookFromSubmissionClient(prev, finalized);
              if (syncJson.gradebooks && typeof syncJson.gradebooks === 'object') {
                next = mergeGradebooksClient(next, syncJson.gradebooks);
              }
              return next;
            });
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
        if (isFirebaseReady) {
          saveSubmissionToCloud(updated[matchIdx]).catch(() => {});
        }
        if (isBackendConfigured()) {
          apiFetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated[matchIdx]),
          }).catch(() => {});
        }
        return updated;
      }
      return prev;
    });
  };

  // Export Excel handler for active class or specified class (Hỗ trợ lọc theo ngày bất kỳ hoặc ngày gần nhất)
  const handleExportClassExcel = async (
    customClass?: string,
    targetDate?: string | null,
    dateMode: 'all' | 'latest' | 'custom' = 'all'
  ) => {
    // Luôn chủ động đồng bộ bài nộp mới nhất từ máy chủ CSDL trước khi xuất file Excel
    try {
      await refreshSubmissionsAndStatus();
    } catch {}

    const targetClassName = typeof customClass === 'string' && customClass ? customClass : userClassName;
    const latestSubs = loadSubmissionsSafely(submissions);

    exportSubmissionsToExcel({
      className: targetClassName,
      assignment: activeAssignment,
      submissions: latestSubs,
      targetDate,
      dateMode,
    });
  };

  // Xuất file Excel bảng điểm tổng hợp SP1, SP2... ĐTB của từng lớp (lấy kết quả cao nhất từ CSDL vĩnh viễn)
  const handleExportMultiProductExcel = async (customClass?: string) => {
    try {
      await refreshSubmissionsAndStatus();
    } catch {}

    const targetClassName = typeof customClass === 'string' && customClass ? customClass : userClassName;
    const latestSubs = loadSubmissionsSafely(submissions);

    exportClassMultiProductGradebook({
      className: targetClassName,
      assignments,
      submissions: latestSubs,
      roster: studentRoster,
      gradebooks: gradebooksRef.current,
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
  const filteredForHeader = submissions.filter(
    (s) => normalizeClassName(s.className) === normalizeClassName(userClassName)
  );
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
        onExportMultiProductExcel={() => handleExportMultiProductExcel(userClassName)}
        activeClassName={userClassName}
        onChangeClassName={handleSelectClassName}
        totalSubmissions={totalSubmissionsCount}
        perfectSubmissions={perfectCount}
        isTeacher={isTeacherRole}
        onToggleRole={() => setIsTeacherRole(!isTeacherRole)}
        allowSubmission={isClassSubmissionAllowed(userClassName)}
        globalAllowSubmission={allowSubmission}
        onToggleSubmissionPermission={handleToggleSubmissionPermission}
        onToggleAllClassesPermission={handleToggleAllClassesPermission}
        dbStatus={dbStatus}
        onRefreshDb={refreshSubmissionsAndStatus}
        onSyncAllLocalSubmissionsToDb={handleSyncAllLocalSubmissionsToDb}
        onOpenStudentRosterModal={() => setIsStudentRosterModalOpen(true)}
        isRealtimeConnected={isRealtimeConnected}
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
          onChangeMachineNumber={(m) => {
            setMachineNumber(m);
            setHasExplicitMachine(true);
            try {
              localStorage.setItem('labgrade_machine_number', m);
            } catch {}
          }}
          studentLeader={studentLeader}
          onChangeStudentLeader={(l) => {
            setStudentLeader(l);
            if (l.trim()) setHasExplicitMachine(true);
          }}
          groupMembers={groupMembers}
          onChangeGroupMembers={setGroupMembers}
          mySubmissions={submissions}
          onSubmitWork={handleStudentSubmitWork}
          onOpenStudentInfoModal={() => setIsStudentInfoModalOpen(true)}
          allowSubmission={isClassSubmissionAllowed(userClassName)}
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
          setHasExplicitMachine(true);
          try {
            localStorage.setItem('labgrade_machine_number', m);
          } catch {}
        }}
        studentLeader={studentLeader}
        onChangeStudentLeader={(l) => {
          setStudentLeader(l);
          if (l.trim()) setHasExplicitMachine(true);
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
        existingSubmissions={submissions}
        onSaveRoster={handleSaveStudentRoster}
        onDeleteRoster={handleDeleteStudentRoster}
        onRenameClass={handleRenameStudentClass}
        onRefreshRoster={fetchRosterLatest}
        onOpenStudentRosterModal={() => setIsStudentRosterModalOpen(true)}
        isTeacher={isTeacherRole}
      />

      {/* Student Roster Modal - Quản lý và Tải lên Danh Sách Học Sinh từ File Excel 3 Cột (Chỉ Giáo Viên) */}
      <StudentRosterModal
        isOpen={isStudentRosterModalOpen}
        onClose={() => setIsStudentRosterModalOpen(false)}
        roster={studentRoster}
        onSaveRoster={handleSaveStudentRoster}
        onDeleteRoster={handleDeleteStudentRoster}
        onRenameClass={handleRenameStudentClass}
      />

      {/* Class Results Modal - View and download during practice */}
      {isClassResultsOpen && (
        <ClassResultsModal
          className={userClassName}
          submissions={submissions}
          gradebooks={permanentGradebooks}
          onClose={() => setIsClassResultsOpen(false)}
          onExportExcel={handleExportClassExcel}
          isTeacher={isTeacherRole}
          allowSubmission={isClassSubmissionAllowed(userClassName)}
          onToggleSubmissionPermission={handleToggleSubmissionPermission}
          onChangeClassName={handleSelectClassName}
          onRefresh={refreshSubmissionsAndStatus}
          onSaveGradebooksToDb={handleSaveGradebooksToDb}
          onClearSubmissions={handleClearAllSubmissions}
          onClearGradebooks={handleClearGradebooks}
          dbStatus={dbStatus}
          assignments={assignments}
          studentRoster={studentRoster}
          onExportMultiProductExcel={handleExportMultiProductExcel}
        />
      )}

      {/* Projector Live Overlay Screen */}
      {isProjectorOpen && (
        <ProjectorLiveBoard
          className={userClassName}
          assignment={activeAssignment}
          submissions={submissions}
          assignments={assignments}
          studentRoster={studentRoster}
          onClose={() => setIsProjectorOpen(false)}
          onRefresh={refreshSubmissionsAndStatus}
          onClearSubmissions={handleClearAllSubmissions}
          isTeacher={isTeacherRole}
          allowSubmission={isClassSubmissionAllowed(userClassName)}
          globalAllowSubmission={allowSubmission}
          allowedClasses={allowedClasses}
          lockedClasses={lockedClasses}
          onlineMachines={onlineMachines}
          onToggleSubmissionPermission={handleToggleSubmissionPermission}
          onToggleAllClassesPermission={handleToggleAllClassesPermission}
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

