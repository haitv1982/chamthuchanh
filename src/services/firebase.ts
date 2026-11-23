import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  getDocFromServer,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Unsubscribe,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { Submission, StudentRecord, ClassGradebookDocument } from '../types';
import {
  sanitizeSubmission,
  upsertGradebookFromSubmissionClient,
  mergeGradebooksClient,
} from '../utils/storageManager';
import { normalizeClassName } from '../data/classes';
import firebaseConfigJson from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function logFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path,
  };
  console.warn('[Firebase Cloud Error]', JSON.stringify(errInfo));
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let isInitialized = false;

async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase Cloud] Trình duyệt đang offline hoặc chưa thể kết nối Firestore.');
    }
  }
}

try {
  if (firebaseConfigJson && firebaseConfigJson.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfigJson) : getApp();
    const dbId = (firebaseConfigJson as any).firestoreDatabaseId;
    db = dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);
    isInitialized = true;
    console.log('[Firebase Cloud] ✅ Khởi tạo kết nối Firestore Cloud thành công:', firebaseConfigJson.projectId);
    testConnection();
  }
} catch (err) {
  console.warn('[Firebase Cloud] Không thể khởi tạo Firestore:', err);
}

let isCloudQuotaExhausted = false;

export function getIsCloudQuotaExhausted(): boolean {
  return isCloudQuotaExhausted;
}

export function markCloudQuotaExhausted(): void {
  if (!isCloudQuotaExhausted) {
    isCloudQuotaExhausted = true;
    console.warn('[Firebase Cloud] ⚠️ Hạn ngạch đọc/ghi hàng ngày của Firebase Spark đã đạt giới hạn (resource-exhausted). Hệ thống tự động chuyển sang CSDL bộ nhớ máy tính & máy chủ mạng LAN.');
  }
}

export { db, isInitialized as isFirebaseReady };

/**
 * Nén và làm sạch bài nộp trước khi ghi vào Cloud Firestore (đảm bảo luôn < 1MB / document và tiết kiệm băng thông)
 */
export function sanitizeSubmissionForCloud(sub: Submission): Submission {
  const clean = sanitizeSubmission(sub);
  const attemptsCount = clean.attempts.length;
  const trimmedAttempts = clean.attempts.map((att, idx) => {
    const isLatest = idx === attemptsCount - 1;
    const rawFileContent = typeof att.fileContent === 'string' ? att.fileContent : '';
    const safeFileContent = rawFileContent.length > 3500 ? rawFileContent.slice(0, 3500) : rawFileContent;
    const rawDataUrl = isLatest && typeof att.fileDataUrl === 'string' && att.fileDataUrl.length <= 220000
      ? att.fileDataUrl
      : undefined;
    const rawImg = isLatest && typeof att.imageBase64 === 'string' && att.imageBase64.length <= 220000
      ? att.imageBase64
      : undefined;
    return {
      ...att,
      fileContent: safeFileContent,
      fileDataUrl: rawDataUrl,
      imageBase64: rawImg,
    };
  });

  const candidate: Submission = {
    ...clean,
    attempts: trimmedAttempts,
  };

  try {
    if (JSON.stringify(candidate).length > 550000) {
      return {
        ...candidate,
        attempts: candidate.attempts.map((att) => ({
          ...att,
          fileContent: typeof att.fileContent === 'string' ? att.fileContent.slice(0, 1200) : '',
          fileDataUrl: undefined,
          imageBase64: undefined,
        })),
      };
    }
  } catch {}

  return candidate;
}

/**
 * Đẩy một bài nộp lên Firebase Cloud Firestore
 */
export async function saveSubmissionToCloud(sub: Submission): Promise<boolean> {
  if (!db) return false;
  try {
    const cleanSub = sanitizeSubmissionForCloud(sub);
    const subRef = doc(db, 'submissions', cleanSub.id);

    // Đảm bảo không lưu undefined vào Firestore
    const payload = JSON.parse(JSON.stringify(cleanSub));
    await setDoc(subRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firebase Cloud] Lỗi lưu bài nộp:', err);
    return false;
  }
}

/**
 * Đẩy hàng loạt bài nộp lên Firebase Cloud Firestore
 */
export async function batchSaveSubmissionsToCloud(submissions: Submission[]): Promise<boolean> {
  if (!db || submissions.length === 0) return false;
  try {
    const batch = writeBatch(db);
    // Giới hạn Firestore batch là tối đa 500 documents
    const toProcess = submissions.slice(0, 450);
    for (const sub of toProcess) {
      const cleanSub = sanitizeSubmissionForCloud(sub);
      const subRef = doc(db, 'submissions', cleanSub.id);
      const payload = JSON.parse(JSON.stringify(cleanSub));
      batch.set(subRef, payload, { merge: true });
    }
    await batch.commit();
    return true;
  } catch (err) {
    console.warn('[Firebase Cloud] Lỗi lưu batch bài nộp:', err);
    return false;
  }
}

/**
 * Tải toàn bộ danh sách bài nộp mới nhất từ Firebase Cloud Firestore
 */
export async function fetchSubmissionsFromCloud(): Promise<Submission[]> {
  if (!db) return [];
  try {
    const subCol = collection(db, 'submissions');
    let snap;
    try {
      const q = query(subCol, orderBy('latestSubmittedAt', 'desc'), limit(300));
      snap = await getDocs(q);
    } catch {
      const qFallback = query(subCol, limit(300));
      snap = await getDocs(qFallback);
    }
    const results: Submission[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && !String(data.id || docSnap.id).startsWith('mock-')) {
        results.push(sanitizeSubmission({ ...data, id: data.id || docSnap.id }));
      }
    });
    return results;
  } catch (err) {
    console.warn('[Firebase Cloud] Lỗi đọc bài nộp:', err);
    return [];
  }
}

/**
 * Xóa bài nộp trên Firebase Cloud Firestore (toàn bộ hoặc theo tên lớp)
 */
export async function deleteSubmissionsFromCloud(className?: string): Promise<boolean> {
  if (!db) return false;
  try {
    const subCol = collection(db, 'submissions');
    const snap = await getDocs(subCol);
    const batch = writeBatch(db);
    let count = 0;
    const normTarget = className ? normalizeClassName(className) : '';

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (!normTarget || normalizeClassName(data.className || '') === normTarget) {
        batch.delete(docSnap.ref);
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }
    return true;
  } catch (err) {
    logFirestoreError(err, OperationType.DELETE, 'submissions');
    return false;
  }
}

/**
 * Lắng nghe bài nộp thời gian thực (Real-time Snapshot) từ Firebase Cloud Firestore
 */
export function subscribeToSubmissionsCloud(
  onUpdate: (subs: Submission[]) => void,
  onError?: (err: any) => void
): Unsubscribe | null {
  if (!db || isCloudQuotaExhausted) return null;
  try {
    const subCol = collection(db, 'submissions');
    const q = query(subCol, orderBy('latestSubmittedAt', 'desc'), limit(150));
    return onSnapshot(
      q,
      (snapshot) => {
        try {
          const results: Submission[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && !String(data.id || docSnap.id).startsWith('mock-')) {
              results.push(sanitizeSubmission({ ...data, id: data.id || docSnap.id }));
            }
          });
          onUpdate(results);
        } catch (procErr) {
          console.warn('[Firebase Cloud] Lỗi xử lý snapshot bài nộp:', procErr);
        }
      },
      (err) => {
        if (err?.code === 'resource-exhausted') {
          markCloudQuotaExhausted();
        } else {
          console.warn('[Firebase Cloud] Snapshot submissions:', err?.message || err);
        }
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    if (err?.code === 'resource-exhausted') {
      markCloudQuotaExhausted();
    } else {
      console.warn('[Firebase Cloud] Không thể subscribe submissions:', err);
    }
    return null;
  }
}

/**
 * Lưu danh sách học sinh (Roster) lên Firebase Cloud Firestore
 * Dùng document đơn lẻ tối ưu chi phí Spark plan
 */
export async function saveRosterToCloud(roster: StudentRecord[]): Promise<boolean> {
  if (!db || isCloudQuotaExhausted) return false;
  try {
    const rosterRef = doc(db, 'app_settings', 'student_roster');
    await setDoc(rosterRef, {
      students: roster,
      updatedAt: new Date().toISOString(),
      count: roster.length,
    });
    return true;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted') {
      markCloudQuotaExhausted();
    } else {
      console.warn('[Firebase Cloud] Lỗi lưu danh sách học sinh:', err);
    }
    return false;
  }
}

/**
 * Tải danh sách học sinh (Roster) từ Firebase Cloud Firestore
 */
export async function fetchRosterFromCloud(): Promise<StudentRecord[]> {
  if (!db || isCloudQuotaExhausted) return [];
  try {
    const rosterRef = doc(db, 'app_settings', 'student_roster');
    const snap = await getDoc(rosterRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.students)) {
        return data.students;
      }
    }
    return [];
  } catch (err: any) {
    if (err?.code === 'resource-exhausted') {
      markCloudQuotaExhausted();
    } else {
      console.warn('[Firebase Cloud] Lỗi đọc danh sách học sinh:', err);
    }
    return [];
  }
}

/**
 * Lắng nghe danh sách học sinh thời gian thực
 */
export function subscribeToRosterCloud(
  onUpdate: (roster: StudentRecord[]) => void,
  onError?: (err: any) => void
): Unsubscribe | null {
  if (!db || isCloudQuotaExhausted) return null;
  try {
    const rosterRef = doc(db, 'app_settings', 'student_roster');
    return onSnapshot(
      rosterRef,
      (snap) => {
        try {
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.students)) {
              onUpdate(data.students);
            }
          }
        } catch (procErr) {
          console.warn('[Firebase Cloud] Lỗi xử lý snapshot roster:', procErr);
        }
      },
      (err) => {
        if (err?.code === 'resource-exhausted') {
          markCloudQuotaExhausted();
        } else {
          console.warn('[Firebase Cloud] Snapshot roster:', err?.message || err);
        }
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    if (err?.code === 'resource-exhausted') {
      markCloudQuotaExhausted();
    } else {
      console.warn('[Firebase Cloud] Lỗi subscribe roster:', err);
    }
    return null;
  }
}

export interface CloudSessionSettings {
  allowSubmission?: boolean;
  allowedClasses?: string[];
  lockedClasses?: string[];
  teacherPin?: string;
  updatedAt?: string;
}

/**
 * Lưu cài đặt phiên thực hành (quyền nộp bài, danh sách lớp mở/khóa, mã pin...) lên Firebase Cloud
 */
export async function saveSettingsToCloud(settings: CloudSessionSettings): Promise<boolean> {
  if (!db) return false;
  try {
    const settingsRef = doc(db, 'app_settings', 'session_config');
    const payload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (typeof settings.allowSubmission === 'boolean') {
      payload.allowSubmission = settings.allowSubmission;
    }
    if (Array.isArray(settings.allowedClasses)) {
      payload.allowedClasses = settings.allowedClasses;
    }
    if (Array.isArray(settings.lockedClasses)) {
      payload.lockedClasses = settings.lockedClasses;
    }
    if (typeof settings.teacherPin === 'string') {
      payload.teacherPin = settings.teacherPin;
    }
    await setDoc(settingsRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firebase Cloud] Lỗi lưu cài đặt:', err);
    return false;
  }
}

/**
 * Tải cài đặt phiên thực hành (quyền nộp bài, mã pin, lớp mở/khóa...) trực tiếp từ Firebase Cloud Firestore
 * Ưu tiên gọi qua Firestore REST API để đảm bảo 100% tất cả máy học sinh đều nhận dữ liệu mới nhất
 */
export async function fetchSettingsFromCloud(): Promise<CloudSessionSettings | null> {
  // 1. Luôn thử truy vấn trực tiếp qua REST API (không bị ảnh hưởng bởi lỗi quota hay kết nối SDK của trình duyệt)
  try {
    if (firebaseConfigJson?.projectId && firebaseConfigJson?.apiKey) {
      const dbId = firebaseConfigJson.firestoreDatabaseId || '(default)';
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfigJson.projectId}/databases/${dbId}/documents/app_settings/session_config?key=${firebaseConfigJson.apiKey}`;
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        const json = await res.json();
        const fields = json?.fields || {};
        const teacherPin = fields.teacherPin?.stringValue ? fields.teacherPin.stringValue.trim() : undefined;
        const allowSubmission = typeof fields.allowSubmission?.booleanValue === 'boolean' ? fields.allowSubmission.booleanValue : undefined;

        let allowedClasses: string[] | undefined = undefined;
        if (fields.allowedClasses?.arrayValue?.values) {
          allowedClasses = fields.allowedClasses.arrayValue.values
            .map((v: any) => v?.stringValue)
            .filter(Boolean);
        }

        let lockedClasses: string[] | undefined = undefined;
        if (fields.lockedClasses?.arrayValue?.values) {
          lockedClasses = fields.lockedClasses.arrayValue.values
            .map((v: any) => v?.stringValue)
            .filter(Boolean);
        }

        if (teacherPin) {
          try {
            localStorage.setItem('labgrade_teacher_pin_v1', teacherPin);
            localStorage.setItem('labgrade_teacher_pin', teacherPin);
          } catch {}
        }
        return { allowSubmission, allowedClasses, lockedClasses, teacherPin };
      }
    }
  } catch (restErr) {
    console.warn('[Firebase Cloud REST] Lỗi đọc cài đặt:', restErr);
  }

  // 2. Dự phòng bằng Firestore JS SDK
  if (!db) return null;
  try {
    const settingsRef = doc(db, 'app_settings', 'session_config');
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      const data = snap.data();
      const teacherPin = typeof data.teacherPin === 'string' && data.teacherPin.trim() ? data.teacherPin.trim() : undefined;
      if (teacherPin) {
        try {
          localStorage.setItem('labgrade_teacher_pin_v1', teacherPin);
          localStorage.setItem('labgrade_teacher_pin', teacherPin);
        } catch {}
      }
      return {
        allowSubmission: typeof data.allowSubmission === 'boolean' ? data.allowSubmission : undefined,
        allowedClasses: Array.isArray(data.allowedClasses) ? data.allowedClasses : undefined,
        lockedClasses: Array.isArray(data.lockedClasses) ? data.lockedClasses : undefined,
        teacherPin,
      };
    }
    return null;
  } catch (err) {
    console.warn('[Firebase Cloud SDK] Lỗi đọc cài đặt phiên:', err);
    return null;
  }
}

/**
 * Lắng nghe cài đặt phiên thực hành thời gian thực từ Firebase Cloud
 */
export function subscribeToSettingsCloud(
  onUpdate: (settings: CloudSessionSettings) => void,
  onError?: (err: any) => void
): Unsubscribe | null {
  if (!db || isCloudQuotaExhausted) return null;
  try {
    const settingsRef = doc(db, 'app_settings', 'session_config');
    return onSnapshot(
      settingsRef,
      (snap) => {
        try {
          if (snap.exists()) {
            const data = snap.data();
            onUpdate({
              allowSubmission: typeof data.allowSubmission === 'boolean' ? data.allowSubmission : undefined,
              allowedClasses: Array.isArray(data.allowedClasses) ? data.allowedClasses : undefined,
              lockedClasses: Array.isArray(data.lockedClasses) ? data.lockedClasses : undefined,
              teacherPin: typeof data.teacherPin === 'string' && data.teacherPin.trim() ? data.teacherPin.trim() : undefined,
            });
          }
        } catch (procErr) {
          console.warn('[Firebase Cloud] Lỗi xử lý snapshot cài đặt:', procErr);
        }
      },
      (err) => {
        if (err?.code === 'resource-exhausted') {
          markCloudQuotaExhausted();
        } else {
          console.warn('[Firebase Cloud] Snapshot settings:', err?.message || err);
        }
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    if (err?.code === 'resource-exhausted') {
      markCloudQuotaExhausted();
    } else {
      logFirestoreError(err, OperationType.GET, 'app_settings/session_config');
    }
    return null;
  }
}

/**
 * Lưu Bảng Tổng Hợp Điểm Vĩnh Viễn của 1 lớp (SP1, SP2,...) lên Firestore collection `gradebooks/{normClass}`
 */
export async function saveClassGradebookToCloud(gradebook: ClassGradebookDocument): Promise<boolean> {
  if (!db || isCloudQuotaExhausted || !gradebook?.className) return false;
  const normCls = normalizeClassName(gradebook.className);
  if (!normCls) return false;
  const docPath = `gradebooks/${normCls}`;
  try {
    const ref = doc(db, 'gradebooks', normCls);
    const snap = await getDoc(ref);
    let finalDoc: ClassGradebookDocument = {
      ...gradebook,
      className: normCls,
    };
    if (snap.exists()) {
      const existingData = snap.data() as ClassGradebookDocument;
      const mergedMap = mergeGradebooksClient(
        { [normCls]: existingData },
        { [normCls]: finalDoc }
      );
      finalDoc = mergedMap[normCls] || finalDoc;
    }
    const payload = JSON.parse(JSON.stringify(finalDoc));
    await setDoc(ref, payload);
    return true;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted') {
      markCloudQuotaExhausted();
    } else {
      logFirestoreError(err, OperationType.WRITE, docPath);
    }
    return false;
  }
}

/**
 * Cập nhật ngay kết quả SP1, SP2,... từ 1 bài nộp vào Bảng Tổng Hợp Điểm Vĩnh Viễn trên Cloud Firestore
 */
export async function saveSubmissionIntoCloudGradebook(sub: Submission): Promise<boolean> {
  if (!db || isCloudQuotaExhausted || !sub?.className || !sub?.assignmentId) return false;
  const normCls = normalizeClassName(sub.className);
  if (!normCls) return false;
  const docPath = `gradebooks/${normCls}`;
  try {
    const ref = doc(db, 'gradebooks', normCls);
    const snap = await getDoc(ref);
    const currentMap: Record<string, ClassGradebookDocument> = {};
    if (snap.exists()) {
      currentMap[normCls] = snap.data() as ClassGradebookDocument;
    }
    const updatedMap = upsertGradebookFromSubmissionClient(currentMap, sub);
    const targetDoc = updatedMap[normCls];
    if (!targetDoc) return false;
    const payload = JSON.parse(JSON.stringify(targetDoc));
    await setDoc(ref, payload);
    return true;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted') {
      markCloudQuotaExhausted();
    } else {
      logFirestoreError(err, OperationType.WRITE, docPath);
    }
    return false;
  }
}

/**
 * Lưu đồng loạt toàn bộ Bảng Tổng Hợp Điểm Vĩnh Viễn các lớp lên Firestore Cloud
 */
export async function batchSaveGradebooksToCloud(
  gradebooks: Record<string, ClassGradebookDocument>
): Promise<boolean> {
  if (!db || isCloudQuotaExhausted || !gradebooks) return false;
  const entries = Object.values(gradebooks).filter((g) => g && g.className && Object.keys(g.students || {}).length > 0);
  if (entries.length === 0) return true;
  try {
    for (const gb of entries) {
      await saveClassGradebookToCloud(gb);
    }
    return true;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted') {
      markCloudQuotaExhausted();
    } else {
      logFirestoreError(err, OperationType.WRITE, 'gradebooks');
    }
    return false;
  }
}

/**
 * Tải toàn bộ Bảng Tổng Hợp Điểm Vĩnh Viễn các lớp từ Cloud Firestore (rất nhẹ: tối đa ~13-20 doc)
 */
export async function fetchAllGradebooksFromCloud(): Promise<Record<string, ClassGradebookDocument>> {
  if (!db || isCloudQuotaExhausted) return {};
  try {
    const colRef = collection(db, 'gradebooks');
    const q = query(colRef, limit(100));
    const snap = await getDocs(q);
    const map: Record<string, ClassGradebookDocument> = {};
    snap.forEach((docSnap) => {
      const data = docSnap.data() as ClassGradebookDocument;
      if (data && (data.className || docSnap.id)) {
        const normCls = normalizeClassName(data.className || docSnap.id);
        map[normCls] = {
          className: normCls,
          students: data.students || {},
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
      }
    });
    return map;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted') {
      markCloudQuotaExhausted();
    } else {
      logFirestoreError(err, OperationType.LIST, 'gradebooks');
    }
    return {};
  }
}

/**
 * Xóa bảng điểm vĩnh viễn trên Cloud Firestore (chỉ khi giáo viên chủ động xác nhận xóa)
 */
export async function deleteGradebooksFromCloud(className?: string): Promise<boolean> {
  if (!db || isCloudQuotaExhausted) return false;
  try {
    if (className && className !== 'Tất cả') {
      const normCls = normalizeClassName(className);
      await deleteDoc(doc(db, 'gradebooks', normCls));
      return true;
    }
    const colRef = collection(db, 'gradebooks');
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);
    let count = 0;
    snap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
      count++;
    });
    if (count > 0) await batch.commit();
    return true;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted') {
      markCloudQuotaExhausted();
    } else {
      logFirestoreError(err, OperationType.DELETE, 'gradebooks');
    }
    return false;
  }
}

export interface OnlinePresenceRecord {
  id?: string;
  clientId: string;
  machineNumber: string;
  className: string;
  studentLeader: string;
  lastSeen: number;
  online?: boolean;
}

export const PRESENCE_CLOUD_TTL_MS = 115000;

export function buildPresenceDocId(clientId: string, className?: string, machineNumber?: string): string {
  const cleanMach = (machineNumber || '').trim();
  if (cleanMach) {
    const normCls = normalizeClassName(className || '') || 'ALL';
    const safeMach = cleanMach.replace(/[^a-zA-Z0-9_\-]/g, '_');
    return `${normCls}__${safeMach}`;
  }
  return `cli_${(clientId || 'anon').replace(/[^a-zA-Z0-9_\-]/g, '_')}`;
}

/**
 * Cập nhật trạng thái Online / Offline của máy học sinh lên Cloud Firestore (dành cho Vercel)
 */
export async function updatePresenceCloud(info: {
  clientId: string;
  machineNumber: string;
  className: string;
  studentLeader: string;
  online: boolean;
}): Promise<boolean> {
  if (!db || isCloudQuotaExhausted) return false;
  const docId = buildPresenceDocId(info.clientId, info.className, info.machineNumber);
  try {
    const ref = doc(db, 'lab_presence', docId);
    if (!info.online || !info.machineNumber.trim()) {
      await setDoc(
        ref,
        {
          id: docId,
          clientId: info.clientId,
          machineNumber: info.machineNumber || '',
          className: info.className || '',
          studentLeader: info.studentLeader || '',
          lastSeen: 0,
          online: false,
        },
        { merge: true }
      );
      return true;
    }

    await setDoc(
      ref,
      {
        id: docId,
        clientId: info.clientId,
        machineNumber: info.machineNumber.trim(),
        className: info.className || '',
        studentLeader: (info.studentLeader || '').trim(),
        lastSeen: Date.now(),
        online: true,
      },
      { merge: true }
    );
    return true;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted') {
      markCloudQuotaExhausted();
    }
    return false;
  }
}

/**
 * Gửi tín hiệu Offline ngay khi học sinh đóng tab trình duyệt trên Vercel (keepalive REST)
 */
export function markPresenceOfflineBeaconCloud(docId: string): void {
  if (!docId || !firebaseConfigJson?.projectId || !firebaseConfigJson?.apiKey) return;
  try {
    const dbId = firebaseConfigJson.firestoreDatabaseId || '(default)';
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfigJson.projectId}/databases/${dbId}/documents/lab_presence/${encodeURIComponent(docId)}?updateMask.fieldPaths=online&updateMask.fieldPaths=lastSeen&key=${firebaseConfigJson.apiKey}`;
    fetch(url, {
      method: 'PATCH',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          online: { booleanValue: false },
          lastSeen: { integerValue: '0' },
        },
      }),
    }).catch(() => {});
  } catch {}
}

/**
 * Tải danh sách máy học sinh đang Online từ Cloud Firestore
 */
export async function fetchPresenceFromCloud(): Promise<OnlinePresenceRecord[]> {
  if (!db || isCloudQuotaExhausted) return [];
  try {
    const colRef = collection(db, 'lab_presence');
    const q = query(colRef, limit(100));
    const snap = await getDocs(q);
    const cutoff = Date.now() - PRESENCE_CLOUD_TTL_MS;
    const list: OnlinePresenceRecord[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as OnlinePresenceRecord;
      if (data && data.online !== false && Number(data.lastSeen) > cutoff && data.machineNumber) {
        list.push({
          id: docSnap.id,
          clientId: data.clientId || docSnap.id,
          machineNumber: data.machineNumber,
          className: data.className || '',
          studentLeader: data.studentLeader || '',
          lastSeen: Number(data.lastSeen),
          online: true,
        });
      }
    });
    return list;
  } catch {
    return [];
  }
}

/**
 * Lắng nghe trạng thái Online / Offline theo thời gian thực (chỉ bật ở Máy Chiếu / Giáo Viên trên Vercel)
 */
export function subscribeToPresenceCloud(
  onUpdate: (machines: OnlinePresenceRecord[]) => void,
  onError?: (err: any) => void
): Unsubscribe | null {
  if (!db || isCloudQuotaExhausted) return null;
  try {
    const colRef = collection(db, 'lab_presence');
    const q = query(colRef, limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        try {
          const cutoff = Date.now() - PRESENCE_CLOUD_TTL_MS;
          const list: OnlinePresenceRecord[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as OnlinePresenceRecord;
            if (data && data.online !== false && Number(data.lastSeen) > cutoff && data.machineNumber) {
              list.push({
                id: docSnap.id,
                clientId: data.clientId || docSnap.id,
                machineNumber: data.machineNumber,
                className: data.className || '',
                studentLeader: data.studentLeader || '',
                lastSeen: Number(data.lastSeen),
                online: true,
              });
            }
          });
          onUpdate(list);
        } catch {}
      },
      (err) => {
        if (err?.code === 'resource-exhausted') {
          markCloudQuotaExhausted();
        }
        if (onError) onError(err);
      }
    );
  } catch {
    return null;
  }
}
