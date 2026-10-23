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
    fileContent?: string;
    imageBase64?: string;
  },
  existingSubmissions: Submission[]
): PlagiarismAlert | null {
  const { className, machineNumber, studentLeader, fileName, fileSize, fileContent, imageBase64 } = params;
  if (!fileSize || fileSize < 50 || !Array.isArray(existingSubmissions)) return null;

  const currentContent = (fileContent || '').trim();
  const cleanCurrentLeader = (studentLeader || '').trim().toLowerCase();

  for (const sub of existingSubmissions) {
    if (!sub || !Array.isArray(sub.attempts)) continue;

    const subLeader = (sub.studentLeader || '').trim().toLowerCase();
    const isDifferentClass = sub.className !== className;
    const isDifferentStudent = subLeader !== cleanCurrentLeader;

    // Chỉ kiểm tra khi đối chiếu với bài của lớp khác hoặc của học sinh khác
    if (!isDifferentClass && !isDifferentStudent) continue;

    for (const attempt of sub.attempts) {
      if (!attempt || !attempt.fileSize) continue;

      // 1. Kiểm tra kích thước byte trùng khớp tuyệt đối
      const isExactSize = Math.abs(attempt.fileSize - fileSize) === 0;

      // 2. Kiểm tra văn bản nội dung trùng khớp
      const attemptContent = (attempt.fileContent || '').trim();
      const isExactTextContent =
        currentContent.length > 40 &&
        attemptContent.length > 40 &&
        currentContent === attemptContent;

      // 3. Kiểm tra ảnh/sơ đồ trùng khớp tuyệt đối
      const isExactImage = Boolean(
        imageBase64 &&
        attempt.imageBase64 &&
        imageBase64.length > 400 &&
        imageBase64 === attempt.imageBase64
      );

      // 4. Kiểm tra cùng kích thước byte + cùng tên tệp
      const isExactFileNameAndSize =
        isExactSize &&
        fileSize > 400 &&
        Boolean(
          fileName &&
          attempt.fileName &&
          fileName.toLowerCase() === attempt.fileName.toLowerCase()
        );

      const isExactCopy =
        (isExactSize && (isExactTextContent || isExactImage || isExactFileNameAndSize)) ||
        isExactTextContent ||
        isExactImage;

      if (isExactCopy) {
        const fromClass = sub.className;
        const fromStudent = sub.studentLeader || 'Học sinh lớp trước';
        const fromMachine = sub.machineNumber || 'Máy phòng Tin học';
        const timeStr = attempt.timestamp ? new Date(attempt.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

        return {
          isCopied: true,
          copiedFromStudent: fromStudent,
          copiedFromClass: fromClass,
          copiedFromMachine: fromMachine,
          copiedAt: attempt.timestamp || sub.latestSubmittedAt,
          similarityPercent: 100,
          message: `🚨 CẢNH BÁO SAO CHÉP TỆP: Tệp nộp trùng khớp y nguyên 100% với bài làm của bạn ${fromStudent} (${fromClass} - ${fromMachine}${timeStr ? ` lúc ${timeStr}` : ''}) đã nộp trước đó!`,
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
