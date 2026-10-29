import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Unsubscribe,
  query,
  limit,
} from 'firebase/firestore';
import { Submission, StudentRecord } from '../types';
import { sanitizeSubmission } from '../utils/storageManager';
import firebaseConfigJson from '../../firebase-applet-config.json';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let isInitialized = false;

try {
  if (firebaseConfigJson && firebaseConfigJson.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfigJson) : getApp();
    const dbId = (firebaseConfigJson as any).firestoreDatabaseId;
    db = dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);
    isInitialized = true;
    console.log('[Firebase Cloud] ✅ Khởi tạo kết nối Firestore Cloud thành công:', firebaseConfigJson.projectId);
  }
} catch (err) {
  console.warn('[Firebase Cloud] Không thể khởi tạo Firestore:', err);
}

export { db, isInitialized as isFirebaseReady };

/**
 * Đẩy một bài nộp lên Firebase Cloud Firestore
 */
export async function saveSubmissionToCloud(sub: Submission): Promise<boolean> {
  if (!db) return false;
  try {
    const cleanSub = sanitizeSubmission(sub);
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
      const cleanSub = sanitizeSubmission(sub);
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
 * Tải toàn bộ danh sách bài nộp từ Firebase Cloud Firestore
 */
export async function fetchSubmissionsFromCloud(): Promise<Submission[]> {
  if (!db) return [];
  try {
    const subCol = collection(db, 'submissions');
    const q = query(subCol, limit(500));
    const snap = await getDocs(q);
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

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (!className || data.className === className) {
        batch.delete(docSnap.ref);
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }
    return true;
  } catch (err) {
    console.warn('[Firebase Cloud] Lỗi xóa bài nộp:', err);
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
  if (!db) return null;
  try {
    const subCol = collection(db, 'submissions');
    const q = query(subCol, limit(500));
    return onSnapshot(
      q,
      (snapshot) => {
        const results: Submission[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && !String(data.id || docSnap.id).startsWith('mock-')) {
            results.push(sanitizeSubmission({ ...data, id: data.id || docSnap.id }));
          }
        });
        onUpdate(results);
      },
      (err) => {
        console.warn('[Firebase Cloud] Lỗi snapshot submissions:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('[Firebase Cloud] Không thể subscribe submissions:', err);
    return null;
  }
}

/**
 * Lưu danh sách học sinh (Roster) lên Firebase Cloud Firestore
 * Dùng document đơn lẻ tối ưu chi phí Spark plan
 */
export async function saveRosterToCloud(roster: StudentRecord[]): Promise<boolean> {
  if (!db) return false;
  try {
    const rosterRef = doc(db, 'app_settings', 'student_roster');
    await setDoc(rosterRef, {
      students: roster,
      updatedAt: new Date().toISOString(),
      count: roster.length,
    });
    return true;
  } catch (err) {
    console.warn('[Firebase Cloud] Lỗi lưu danh sách học sinh:', err);
    return false;
  }
}

/**
 * Tải danh sách học sinh (Roster) từ Firebase Cloud Firestore
 */
export async function fetchRosterFromCloud(): Promise<StudentRecord[]> {
  if (!db) return [];
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
  } catch (err) {
    console.warn('[Firebase Cloud] Lỗi đọc danh sách học sinh:', err);
    return [];
  }
}

/**
 * Lắng nghe danh sách học sinh thời gian thực
 */
export function subscribeToRosterCloud(
  onUpdate: (roster: StudentRecord[]) => void
): Unsubscribe | null {
  if (!db) return null;
  try {
    const rosterRef = doc(db, 'app_settings', 'student_roster');
    return onSnapshot(rosterRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.students)) {
          onUpdate(data.students);
        }
      }
    });
  } catch (err) {
    console.warn('[Firebase Cloud] Lỗi subscribe roster:', err);
    return null;
  }
}

/**
 * Lưu cài đặt phiên thực hành (quyền nộp bài, mã pin...) lên Firebase Cloud
 */
export async function saveSettingsToCloud(settings: {
  allowSubmission?: boolean;
  teacherPin?: string;
}): Promise<boolean> {
  if (!db) return false;
  try {
    const settingsRef = doc(db, 'app_settings', 'session_config');
    const payload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (typeof settings.allowSubmission === 'boolean') {
      payload.allowSubmission = settings.allowSubmission;
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
 * Tải cài đặt phiên thực hành (quyền nộp bài, mã pin...) trực tiếp từ Firebase Cloud Firestore
 */
export async function fetchSettingsFromCloud(): Promise<{
  allowSubmission?: boolean;
  teacherPin?: string;
} | null> {
  if (!db) return null;
  try {
    const settingsRef = doc(db, 'app_settings', 'session_config');
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        allowSubmission: typeof data.allowSubmission === 'boolean' ? data.allowSubmission : undefined,
        teacherPin: typeof data.teacherPin === 'string' && data.teacherPin.trim() ? data.teacherPin.trim() : undefined,
      };
    }
    return null;
  } catch (err) {
    console.warn('[Firebase Cloud] Lỗi đọc cài đặt phiên:', err);
    return null;
  }
}

/**
 * Lắng nghe cài đặt phiên thực hành thời gian thực từ Firebase Cloud
 */
export function subscribeToSettingsCloud(
  onUpdate: (settings: { allowSubmission?: boolean; teacherPin?: string }) => void
): Unsubscribe | null {
  if (!db) return null;
  try {
    const settingsRef = doc(db, 'app_settings', 'session_config');
    return onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onUpdate({
          allowSubmission: typeof data.allowSubmission === 'boolean' ? data.allowSubmission : undefined,
          teacherPin: typeof data.teacherPin === 'string' && data.teacherPin.trim() ? data.teacherPin.trim() : undefined,
        });
      }
    });
  } catch (err) {
    console.warn('[Firebase Cloud] Lỗi subscribe settings:', err);
    return null;
  }
}
