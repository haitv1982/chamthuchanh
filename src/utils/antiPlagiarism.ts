import { Submission, PlagiarismAlert } from '../types';

/**
 * Tạo mã nhận diện số (Digital Fingerprint) cho tệp nộp bài
 * Dựa trên kích thước byte, độ dài nội dung và mẫu byte đầu/cuối
 */
export function createFileFingerprint(
  fileSize: number,
  contentOrBase64?: string
): string {
  if (!contentOrBase64 || contentOrBase64.length === 0) {
    return `size:${fileSize}`;
  }
  const len = contentOrBase64.length;
  const head = contentOrBase64.slice(0, 64);
  const tail = contentOrBase64.slice(-64);
  return `size:${fileSize}|len:${len}|h:${head.length}|t:${tail.length}`;
}

/**
 * Tính toán độ tương đồng giữa hai chuỗi văn bản nội dung tệp (Jaccard similarity trên từ khóa)
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  const t1 = text1.trim();
  const t2 = text2.trim();
  if (t1 === t2) return 1.0;

  const words1 = t1.toLowerCase().split(/[\s,.;:!?()_\[\]{}"'\/\\]+/).filter((w) => w.length > 2);
  const words2 = t2.toLowerCase().split(/[\s,.;:!?()_\[\]{}"'\/\\]+/).filter((w) => w.length > 2);
  if (words1.length < 5 || words2.length < 5) {
    return t1 === t2 ? 1.0 : 0;
  }

  const set1 = new Set(words1);
  const set2 = new Set(words2);
  let common = 0;
  for (const w of set1) {
    if (set2.has(w)) common++;
  }
  const union = new Set([...words1, ...words2]).size;
  return union > 0 ? common / union : 0;
}

/**
 * Phát hiện học sinh lớp sau lấy y nguyên tệp của học sinh lớp trước để chấm bài
 * Hỗ trợ kiểm tra tức thời phía Client (kể cả khi chạy ngoại tuyến hoặc mất mạng)
 */
export function detectPlagiarismClientSide(
  params: {
    className: string;
    machineNumber: string;
    studentLeader: string;
    fileName: string;
    fileSize: number;
    fileLastModified?: number;
    fileContent?: string;
    imageBase64?: string;
  },
  existingSubmissions: Submission[]
): PlagiarismAlert | null {
  const {
    className,
    machineNumber,
    studentLeader,
    fileName,
    fileSize,
    fileLastModified,
    fileContent,
    imageBase64,
  } = params;
  if (!fileSize || fileSize < 50 || !Array.isArray(existingSubmissions)) return null;

  const currentContent = (fileContent || '').trim();
  const cleanCurrentLeader = (studentLeader || '').trim().toLowerCase();
  const currentMachineClean = (machineNumber || '').trim().toLowerCase();

  for (const sub of existingSubmissions) {
    if (!sub || !Array.isArray(sub.attempts)) continue;

    const subLeader = (sub.studentLeader || '').trim().toLowerCase();
    const isDifferentClass = sub.className !== className;
    const isDifferentStudent = subLeader !== cleanCurrentLeader;
    const isSameMachine = (sub.machineNumber || '').trim().toLowerCase() === currentMachineClean;

    // Chỉ kiểm tra khi đối chiếu với bài của lớp khác hoặc của học sinh khác
    if (!isDifferentClass && !isDifferentStudent) continue;

    for (const attempt of sub.attempts) {
      if (!attempt || !attempt.fileSize) continue;

      // 1. Kiểm tra kích thước byte trùng khớp (hoặc chênh lệch cực nhỏ dưới 120 bytes do save lại)
      const sizeDiff = Math.abs(attempt.fileSize - fileSize);
      const isExactSize = sizeDiff === 0;
      const isVeryCloseSize = sizeDiff < 150 && fileSize > 500;

      // 2. Kiểm tra thời gian khởi tạo/chỉnh sửa tệp trên máy tính (lastModified timestamp)
      const isExactLastModified = Boolean(
        fileLastModified &&
        attempt.fileLastModified &&
        Math.abs(attempt.fileLastModified - fileLastModified) < 5000 // sai lệch dưới 5 giây
      );

      // 3. Kiểm tra độ tương đồng văn bản tệp
      const attemptContent = (attempt.fileContent || '').trim();
      const textSimilarity = calculateTextSimilarity(currentContent, attemptContent);
      const isHighTextSimilarity = textSimilarity >= 0.78;
      const isExactTextContent = currentContent.length > 30 && attemptContent.length > 30 && currentContent === attemptContent;

      // 4. Kiểm tra ảnh/sơ đồ trùng khớp
      const isExactImage = Boolean(
        imageBase64 &&
        attempt.imageBase64 &&
        imageBase64.length > 400 &&
        imageBase64 === attempt.imageBase64
      );

      // 5. Kiểm tra tên tệp
      const isSameFileName = Boolean(
        fileName &&
        attempt.fileName &&
        fileName.trim().toLowerCase() === attempt.fileName.trim().toLowerCase()
      );

      // 6. TRƯỜNG HỢP ĐẶC BIỆT: HỌC SINH LỚP SAU NGỒI CÙNG MÁY CHỌN LẠI TỆP CÓ SẴN CỦA NHÓM/LỚP TRƯỚC
      const isSameMachineOldFileReuse =
        isSameMachine &&
        isDifferentClass &&
        (isExactSize || isExactLastModified || (isSameFileName && isVeryCloseSize) || isHighTextSimilarity || isExactImage);

      // 7. TRƯỜNG HỢP SAO CHÉP GIỮA CÁC NHÓM KHÁC NHAU
      const isExactCopy =
        isSameMachineOldFileReuse ||
        (isSameFileName && (isExactSize || isVeryCloseSize || isHighTextSimilarity)) ||
        isExactTextContent ||
        isHighTextSimilarity ||
        (isExactSize && (isSameFileName || isExactLastModified)) ||
        isExactImage;

      if (isExactCopy) {
        const fromClass = sub.className;
        const fromStudent = sub.studentLeader || 'Học sinh lớp trước';
        const fromMachine = sub.machineNumber || machineNumber;
        const fileCreatedDateStr = fileLastModified
          ? new Date(fileLastModified).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              day: '2-digit',
              month: '2-digit',
            })
          : '';
        const previousSubmittedDateStr = attempt.timestamp
          ? new Date(attempt.timestamp).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
            })
          : '';

        let alertMessage = `🚨 CẢNH BÁO SAO CHÉP TỆP: Tệp nộp trùng khớp 100% với bài làm của bạn ${fromStudent} (${fromClass} - ${fromMachine}${previousSubmittedDateStr ? ` nộp lúc ${previousSubmittedDateStr}` : ''})!`;

        if (isSameMachineOldFileReuse) {
          alertMessage = `🚨 PHÁT HIỆN DÙNG LẠI TỆP LỚP TRƯỚC TRÊN ${machineNumber}: Tệp "${fileName}" (${(fileSize / 1024).toFixed(1)} KB${fileCreatedDateStr ? `, lưu lúc ${fileCreatedDateStr}` : ''}) là tệp có sẵn do bạn ${fromStudent} (${fromClass}) để lại trên máy tính này. Hệ thống không chấm điểm tệp có sẵn!`;
        }

        return {
          isCopied: true,
          copiedFromStudent: fromStudent,
          copiedFromClass: fromClass,
          copiedFromMachine: fromMachine,
          copiedAt: attempt.timestamp || sub.latestSubmittedAt,
          similarityPercent: 100,
          message: alertMessage,
        };
      }
    }
  }

  return null;
}

/**
 * Phát âm thanh cảnh báo "Bíp Bíp" trên màn hình máy chiếu / máy giáo viên
 * Sử dụng Web Audio API chuẩn, tương thích mọi trình duyệt hiện đại không cần tải file âm thanh
 */
export function playPlagiarismWarningSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Chuỗi 2 hồi còi báo động (Alarm siren beep-beep)
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(520, now, 0.18);
    playTone(880, now + 0.22, 0.25);
    playTone(520, now + 0.5, 0.18);
    playTone(880, now + 0.72, 0.35);
  } catch (err) {
    // Trình duyệt có thể chặn âm thanh nếu chưa có tương tác người dùng
    console.warn('[Audio] Không thể phát âm thanh cảnh báo:', err);
  }
}
