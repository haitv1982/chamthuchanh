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
import { Assignment, Submission, SubmissionAttempt, StudentRecord } from './types';
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
} from './utils/storageManager';
import { scanAndGradeProduct } from './utils/productScanner';
import { detectPlagiarismClientSide } from './utils/antiPlagiarism';
import { apiFetch, getApiUrl } from './utils/apiConfig';
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

      // 2. Dự phòng máy chủ backend nội bộ
      const res = await apiFetch('/api/student-roster');
      if (res.ok) {
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

  // Kiểm tra quyền nộp bài của một lớp cụ thể
  const isClassSubmissionAllowed = (cls?: string): boolean => {
    if (!cls) return allowSubmission;
    if (!allowSubmission) return false;
    if (!allowedClasses || allowedClasses.length === 0) return true;
    const clean = normalizeClassName(cls);
    return allowedClasses.some((c) => normalizeClassName(c) === clean);
  };

  // Trạng thái kết nối kênh thời gian thực (Server-Sent Events) tới máy chủ CSDL
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  // Kênh thời gian thực liên thông dữ liệu tức thời giữa Máy Giáo Viên và tất cả Máy Học Sinh
  useEffect(() => {
    // 1. Kết nối kênh SSE thời gian thực tới máy chủ
    realtimeSync.connect();

    const unsubscribe = realtimeSync.subscribe((event) => {
      if (event.type === 'CONNECTION_STATUS') {
        setIsRealtimeConnected(event.connected);
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
          const filtered = prev.filter((s) => s.id !== cleanSub.id && !(s.className === cleanSub.className && s.machineNumber === cleanSub.machineNumber && s.practiceDate === cleanSub.practiceDate));
          const next = pruneOldSubmissions([cleanSub, ...filtered]);
          saveSubmissionsSafely(next);
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
        if (event.dbStatus) {
          setDbStatus(event.dbStatus);
        }
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
          }
          if (event.data?.type === 'ROSTER_UPDATED' && Array.isArray(event.data.students)) {
            setStudentRoster(event.data.students);
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

    // 3. Kênh Firebase Cloud Firestore thời gian thực (Lưu trữ vĩnh viễn trên đám mây)
    let unsubCloudSubs: (() => void) | null = null;
    let unsubCloudRoster: (() => void) | null = null;
    let unsubCloudSettings: (() => void) | null = null;

    if (isFirebaseReady) {
      // Tải cài đặt và mã PIN mới nhất từ đám mây khi khởi động
      fetchSettingsFromCloud().then((cloudSettings) => {
        if (!cloudSettings) return;
        if (typeof cloudSettings.allowSubmission === 'boolean') {
          setAllowSubmission(cloudSettings.allowSubmission);
          try {
            localStorage.setItem('labgrade_allow_submission', String(cloudSettings.allowSubmission));
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

      unsubCloudSubs = subscribeToSubmissionsCloud((cloudSubs) => {
        if (Array.isArray(cloudSubs)) {
          setSubmissions((prev) => {
            const map = new Map<string, Submission>();
            prev.forEach((s) => map.set(s.id, s));
            cloudSubs.forEach((s) => map.set(s.id, s));
            const merged = pruneOldSubmissions(Array.from(map.values()));
            saveSubmissionsSafely(merged);
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
      });

      unsubCloudRoster = subscribeToRosterCloud((cloudRoster) => {
        if (Array.isArray(cloudRoster) && cloudRoster.length > 0) {
          setStudentRoster(cloudRoster);
          try {
            localStorage.setItem('labgrade_student_roster', JSON.stringify(cloudRoster));
          } catch {}
        }
      });

      unsubCloudSettings = subscribeToSettingsCloud((cloudSettings) => {
        if (typeof cloudSettings.allowSubmission === 'boolean') {
          setAllowSubmission(cloudSettings.allowSubmission);
          try {
            localStorage.setItem('labgrade_allow_submission', String(cloudSettings.allowSubmission));
          } catch {}
        }
        if (typeof cloudSettings.teacherPin === 'string' && cloudSettings.teacherPin.trim()) {
          const pin = cloudSettings.teacherPin.trim();
          try {
            localStorage.setItem('labgrade_teacher_pin_v1', pin);
            localStorage.setItem('labgrade_teacher_pin', pin);
          } catch {}
        }
      });
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
      if (unsubCloudSubs) unsubCloudSubs();
      if (unsubCloudRoster) unsubCloudRoster();
      if (unsubCloudSettings) unsubCloudSettings();
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
      const res = await apiFetch('/api/submissions', { method: 'GET' }, 15000);
      if (res.ok) {
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
        if (data.dbStatus) {
          setDbStatus(data.dbStatus);
        }
        if (Array.isArray(data.submissions)) {
          const serverSubs = data.submissions
            .filter((s: any) => s && !String(s.id).startsWith('mock-'))
            .map((raw: any) => sanitizeSubmission(raw));

          // CỨU HỘ DỮ LIỆU THÔNG MINH:
          // Nếu máy này có bài nộp học sinh thực tế mà máy chủ chưa kịp lưu (ví dụ nộp lúc máy chủ Render đang ngủ đông),
          // tự động đẩy các bài còn thiếu lên CSDL máy chủ ngay lập tức!
          const localList = loadSubmissionsSafely([]);
          const missingOnServer = localList.filter((local) => {
            return !serverSubs.some(
              (server: Submission) =>
                server.id === local.id ||
                (server.className === local.className &&
                  server.machineNumber === local.machineNumber &&
                  (server.practiceDate || '') === (local.practiceDate || ''))
            );
          });

          if (missingOnServer.length > 0) {
            console.log(`[Tự Động Khôi Phục] Đang đẩy ${missingOnServer.length} bài nộp tồn đọng lên máy chủ CSDL...`);
            apiFetch('/api/submissions/sync-batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ submissions: missingOnServer }),
            }, 12000).catch(() => {});
          }

          // Hợp nhất danh sách để cả máy chủ và máy này luôn có đầy đủ 100% bài nộp
          const mergedMap = new Map<string, Submission>();
          serverSubs.forEach((s: Submission) => mergedMap.set(`${s.className}_${s.machineNumber}_${s.practiceDate || ''}`, s));
          missingOnServer.forEach((s) => {
            const key = `${s.className}_${s.machineNumber}_${s.practiceDate || ''}`;
            if (!mergedMap.has(key)) {
              mergedMap.set(key, s);
            }
          });

          const merged = Array.from(mergedMap.values());
          setSubmissions(merged);
          saveSubmissionsSafely(merged);
        }
      }
    } catch {
      // offline or network congestion resilience in busy computer lab
    }

    // 3. Tự động đồng bộ danh sách học sinh từ CSDL máy chủ liên tục để máy học sinh luôn có danh sách mới nhất
    try {
      const rosterRes = await apiFetch('/api/student-roster', { method: 'GET' }, 15000);
      if (rosterRes.ok) {
        const rosterData = await rosterRes.json();
        if (Array.isArray(rosterData.students)) {
          setStudentRoster(rosterData.students);
        }
      }
    } catch {}
  };

  // Đồng bộ toàn bộ bài nộp trên máy này lên CSDL trung tâm & Firebase Cloud
  const handleSyncAllLocalSubmissionsToDb = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const currentList = loadSubmissionsSafely(submissions);
      if (!currentList || currentList.length === 0) {
        return { success: true, count: 0 };
      }
      if (isFirebaseReady) {
        batchSaveSubmissionsToCloud(currentList).catch((err) => {
          console.warn('[Firebase Cloud] Lỗi batch sync:', err);
        });
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
      deleteSubmissionsFromCloud(targetClass && targetClass !== 'Tất cả' ? targetClass : undefined).catch(() => {});
    }
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

    if (!targetClass || targetClass === 'Tất cả') {
      setSubmissions([]);
      purgeAllLegacySubmissions();
      saveSubmissionsSafely([]);
    } else {
      setSubmissions((prev) => {
        const next = prev.filter((s) => s.className !== targetClass);
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

  // Toggle submission lock handler theo từng lớp (khi khóa lớp thì reset phiên thực hành lớp đó về ban đầu)
  const handleToggleSubmissionPermission = async (allow: boolean, targetClass?: string) => {
    const normTarget = targetClass ? normalizeClassName(targetClass) : normalizeClassName(userClassName);
    let nextAllowed = [...allowedClasses];

    if (allow) {
      if (!nextAllowed.some((c) => normalizeClassName(c) === normTarget)) {
        nextAllowed.push(targetClass || userClassName);
      }
      setAllowSubmission(true);
    } else {
      // Khi giáo viên nháy nút khóa nộp bài của lớp đó:
      // Hệ thống reset về trạng thái ban đầu coi như kết thúc tiết thực hành của lớp đó!
      nextAllowed = nextAllowed.filter((c) => normalizeClassName(c) !== normTarget);

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

      if (isFirebaseReady) {
        deleteSubmissionsFromCloud(normTarget).catch(() => {});
      }
    }

    setAllowedClasses(nextAllowed);
    try {
      localStorage.setItem('labgrade_allowed_classes', JSON.stringify(nextAllowed));
      localStorage.setItem('labgrade_allow_submission', String(allow));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('labgrade_session_channel');
        bc.postMessage({
          type: 'SUBMISSION_PERMISSION_CHANGED',
          allow,
          targetClass: normTarget,
          allowedClasses: nextAllowed,
        });
        if (!allow) {
          bc.postMessage({
            type: 'SUBMISSIONS_CLEARED',
            targetClass: normTarget,
            className: normTarget,
          });
        }
        bc.close();
      }
    } catch {}

    try {
      const res = await apiFetch('/api/session-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allow, className: normTarget }),
      }, 4000);
      if (res.ok) {
        console.log(`[Quyền Nộp Bài] Lớp ${normTarget}: ${allow ? 'MỞ CHO PHÉP NỘP' : 'ĐÃ KHÓA & RESET TIẾT THỰC HÀNH'}`);
      }
    } catch (err) {
      console.warn('Lỗi gửi trạng thái khóa nộp bài tới máy chủ:', err);
    }

    await refreshSubmissionsAndStatus();
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
    try {
      await apiFetch('/api/student-roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: updatedRoster, mode: 'replace' }),
      }, 5000);
    } catch {}

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

    try {
      const url = className && className.trim()
        ? `/api/student-roster?className=${encodeURIComponent(className.trim())}`
        : '/api/student-roster';
      await apiFetch(url, { method: 'DELETE' }, 4000);
    } catch {}

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

    try {
      await apiFetch('/api/student-roster/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldClassName: oldClassName.trim(), newClassName: newClassName.trim() }),
      }, 4000);
    } catch {}

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

    // Kiểm tra trực tiếp thời gian thực với máy chủ xem lớp này có đang mở nộp bài không
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
            s.groupMembers.some((m: string) => (m || '').trim().toLowerCase() === cleanLeader))) &&
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
    } catch (err: any) {
      // TUYỆT ĐỐI KHÔNG FALLBACK NẾU GIÁO VIÊN ĐANG KHÓA NỘP BÀI!
      if (err?.message && (err.message.includes('KHÓA') || err.message.includes('khóa') || err.message.includes('locked'))) {
        throw err;
      }
      console.warn('Call to /api/grade failed, using smart local evaluator:', err);
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
        hasPlagiarism: hasPlagAlert || existingSubmission.hasPlagiarism,
        plagiarismAlert: gradeData.plagiarismAlert || existingSubmission.plagiarismAlert,
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
        hasPlagiarism: hasPlagAlert,
        plagiarismAlert: gradeData.plagiarismAlert || undefined,
        status: newAttempt.score >= 10 ? 'perfect' : newAttempt.score >= 7 ? 'graded' : 'needs_improvement',
      };

      // Thêm bài nộp mới của ngày hôm nay, giữ lại các ngày trước trong lịch sử, tự động dọn dẹp các ngày cũ nhất khi đầy
      setSubmissions((prev) => pruneOldSubmissions([updatedSubmission, ...prev]));
    }

    // 1. Lưu vĩnh viễn lên đám mây Google Firebase Firestore (Bảo toàn dữ liệu trên Vercel hoặc khi máy tính đóng băng ổ cứng)
    if (isFirebaseReady) {
      saveSubmissionToCloud(updatedSubmission).catch((cloudErr) => {
        console.warn('[Firebase Cloud] Lỗi lưu bài nộp lên đám mây:', cloudErr);
      });
    }

    // 2. Tự động lưu và cập nhật ngay lập tức vào Cơ sở dữ liệu phòng máy nội bộ
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

  // Xuất file Excel bảng điểm tổng hợp SP1, SP2... ĐTB của từng lớp (lấy kết quả cao nhất)
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
        onExportMultiProductExcel={() => handleExportMultiProductExcel(userClassName)}
        activeClassName={userClassName}
        onChangeClassName={handleSelectClassName}
        totalSubmissions={totalSubmissionsCount}
        perfectSubmissions={perfectCount}
        isTeacher={isTeacherRole}
        onToggleRole={() => setIsTeacherRole(!isTeacherRole)}
        allowSubmission={isClassSubmissionAllowed(userClassName)}
        onToggleSubmissionPermission={handleToggleSubmissionPermission}
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
          onChangeMachineNumber={setMachineNumber}
          studentLeader={studentLeader}
          onChangeStudentLeader={setStudentLeader}
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
          onClose={() => setIsClassResultsOpen(false)}
          onExportExcel={handleExportClassExcel}
          isTeacher={isTeacherRole}
          allowSubmission={isClassSubmissionAllowed(userClassName)}
          onToggleSubmissionPermission={handleToggleSubmissionPermission}
          onChangeClassName={handleSelectClassName}
          onRefresh={refreshSubmissionsAndStatus}
          onClearSubmissions={handleClearAllSubmissions}
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
          allowedClasses={allowedClasses}
          onToggleSubmissionPermission={handleToggleSubmissionPermission}
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

