import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { scanAndGradeProduct } from './src/utils/productScanner';
import { INITIAL_SUBMISSIONS } from './src/data/mockSubmissions';

import os from 'os';
import {
  initLabDatabase,
  getAllSubmissions,
  upsertSubmission,
  batchSyncSubmissions,
  deleteSubmissions,
  getAllowSubmission,
  setAllowSubmission,
  getTeacherPin,
  setTeacherPin,
  getDatabaseMetrics,
  getAllStudents,
  saveStudentRoster,
  deleteStudentRoster,
  renameStudentClass,
  getRosterLastUpdated,
  detectPlagiarism,
} from './src/server/database';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Bộ quản lý Server-Sent Events (SSE) thời gian thực kết nối giữa máy GV và tất cả máy HS
const sseClients = new Set<express.Response>();

export function broadcastRealtimeEvent(event: { type: string; [key: string]: any }) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware CORS hỗ trợ liên thông từ GitHub Pages (haitv198.github.io), mạng LAN và các máy trạm học sinh
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Initialize persistent Lab Database on server startup
initLabDatabase();

// Initialize Gemini SDK with User-Agent header as required
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Fallback heuristic grading engine when AI is unreachable or offline
function fallbackHeuristicGrading(params: {
  assignment: any;
  fileName: string;
  fileContent: string;
  attemptNumber: number;
  imageBase64?: string;
}) {
  return scanAndGradeProduct(params);
}

// API: Chấm điểm bài thực hành (Gemini AI Vision + Heuristic Fallback)
app.post('/api/grade', async (req, res) => {
  try {
    // 0. BẢO VỆ CHẶT CHẼ: KIỂM TRA QUYỀN NỘP BÀI TỪ GIÁO VIÊN
    if (!getAllowSubmission()) {
      return res.status(403).json({
        error: '🔒 Giáo viên hiện đang KHÓA nhận bài nộp phòng thực hành. Thầy/Cô chưa mở quyền nộp bài cho phiên này. Em hãy tiếp tục hoàn thiện trên máy tính của mình nhé!',
        locked: true,
      });
    }

    const {
      assignment,
      fileName,
      fileSize,
      fileContent = '',
      imageBase64,
      attemptNumber = 1,
      studentLeader,
      groupMembers = [],
      className,
      machineNumber,
    } = req.body;

    if (!assignment || !fileName) {
      return res.status(400).json({ error: 'Thiếu thông tin bài tập hoặc tệp nộp.' });
    }

    const ext = (fileName.split('.').pop() || '').toLowerCase();
    const isImageFile = ['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext) || Boolean(imageBase64);

    // 0.1 PHÁT HIỆN HỌC SINH LỚP SAU LẤY Y NGUYÊN TỆP BÀI LÀM CỦA HỌC SINH LỚP TRƯỚC
    const plagiarismAlert = detectPlagiarism({
      className,
      machineNumber,
      studentLeader,
      assignmentId: assignment?.id,
      fileName,
      fileSize: fileSize || 0,
      fileContent,
      imageBase64,
    });

    if (plagiarismAlert && plagiarismAlert.isCopied) {
      console.warn(`[🚨 CẢNH BÁO SAO CHÉP] Máy ${machineNumber} (${className} - ${studentLeader}) lấy y nguyên bài của ${plagiarismAlert.copiedFromStudent} (${plagiarismAlert.copiedFromClass})`);

      // Phát sóng cảnh báo tức thời tới màn hình MÁY CHIẾU và máy GIÁO VIÊN
      broadcastRealtimeEvent({
        type: 'PLAGIARISM_ALERT',
        machineNumber,
        className,
        studentLeader,
        copiedFromClass: plagiarismAlert.copiedFromClass,
        copiedFromStudent: plagiarismAlert.copiedFromStudent,
        copiedFromMachine: plagiarismAlert.copiedFromMachine,
        copiedAt: plagiarismAlert.copiedAt,
        message: plagiarismAlert.message,
        timestamp: new Date().toISOString(),
      });

      return res.json({
        score: 0.0,
        aiComparisonDetails: plagiarismAlert.message,
        strengths: ['Tệp được tải lên máy chủ thành công.'],
        weaknesses: [
          `🚨 VI PHẠM TÍNH TRUNG THỰC: Tệp nộp trùng khớp 100% với sản phẩm của bạn ${plagiarismAlert.copiedFromStudent} (${plagiarismAlert.copiedFromClass} - ${plagiarismAlert.copiedFromMachine}).`,
          'Hệ thống không chấp nhận nộp lại bài làm có sẵn của học sinh lớp trước trên máy tính.',
        ],
        howToGetTen: [
          'Bước 1: Mở phần mềm và tự tay thực hành lại sản phẩm của nhóm mình.',
          'Bước 2: Tuyệt đối không nộp các tệp có sẵn của học sinh lớp trước để lại.',
          'Bước 3: Lưu lại tệp mới và bấm "Chấm Lại Bằng AI" để được ghi nhận điểm số chính thức.',
        ],
        criteriaResults: Array.isArray(assignment?.rubric)
          ? assignment.rubric.map((r: any) => ({
              criterionId: r.id,
              criterionName: r.name,
              score: 0,
              maxScore: r.maxScore,
              feedback: `⚠️ Không tính điểm do phát hiện tệp nộp trùng khớp y nguyên với bài làm của học sinh lớp trước (${plagiarismAlert.copiedFromClass}).`,
            }))
          : [],
        stepEvaluations: Array.isArray(assignment?.steps)
          ? assignment.steps.map((st: string, idx: number) => ({
              stepNumber: idx + 1,
              instruction: st,
              status: 'failed',
              detail: 'Không được công nhận do sao chép tệp bài làm có sẵn.',
            }))
          : [],
        inspectionSummary: {
          contentScorePercent: 0,
          formatScorePercent: 0,
          stepCompletionRate: '0 bước được công nhận (Vi phạm sao chép)',
          isOffTopic: false,
          warningMessage: plagiarismAlert.message,
        },
        plagiarismAlert,
        encouragement: 'Em hãy tự tay thực hành lại bài học nhé. Thầy/Cô và hệ thống luôn ghi nhận nỗ lực thực chất của em!',
        engine: 'anti-plagiarism-detector',
      });
    }

    // Try Gemini AI if available
    if (ai) {
      try {
        const rubricList = Array.isArray(assignment?.rubric) ? assignment.rubric : [];
        const rubricText = rubricList.length > 0
          ? rubricList.map((r: any) => `- [Mã ${r.id || 'c'}] ${r.name || 'Tiêu chí'} (Tối đa ${r.maxScore || 2.5}đ): ${r.description || ''}`).join('\n')
          : 'Thang điểm 10.0 chuẩn: Hoàn thành đúng yêu cầu, chạy đúng kết quả, giải thuật tối ưu và cấu trúc chuẩn.';

        const sampleProduct = assignment?.sampleProduct;
        const sampleProductText = sampleProduct && sampleProduct.content
          ? `SẢN PHẨM MẪU CHUẨN CỦA GIÁO VIÊN ĐỂ ĐỐI CHIẾU:\n- Tên tệp mẫu: ${sampleProduct.fileName || 'Chưa đặt tên'}\n- Ghi chú mẫu: ${sampleProduct.notes || 'Đáp án chuẩn môn Tin học'}\n- Nội dung mã nguồn / cấu trúc mẫu:\n\`\`\`\n${sampleProduct.content.slice(0, 8000)}\n\`\`\``
          : `KHO LƯU TRỮ CHUẨN & TRI THỨC INTERNET:\n- Hệ thống quét kiến thức chuẩn ngành Tin học và giáo dục phổ thông cho chủ đề: ${assignment.title} (${assignment.subjectType}).`;

        const stepsList = Array.isArray(assignment?.steps) && assignment.steps.length > 0
          ? assignment.steps.map((st: string, i: number) => `Bước ${i + 1}: ${st}`).join('\n')
          : 'Thực hiện theo các yêu cầu nhiệm vụ đề bài.';

        const prompt = `
Bạn là Hệ thống AI Chuyên gia Đánh giá & Chấm điểm Thực hành Tin Học trường THCS/THPT (chuẩn giáo dục Việt Nam).
Nhiệm vụ của bạn là quét sâu NỘI DUNG VÀ HÌNH THỨC SẢN PHẨM của học sinh, đối chiếu CHÍNH XÁC TỪNG BƯỚC THỰC HIỆN và TỪNG TIÊU CHÍ RUBRIC với đề bài.

THÔNG TIN BÀI THỰC HÀNH:
- Tên bài: ${assignment.title}
- Khối lớp: ${assignment.gradeLevel}
- Thể loại / Công cụ: ${assignment.subjectType} (${assignment.toolRequired || 'Phần mềm chuyên dụng'})
- Tệp nộp theo quy định: ${assignment.targetFile || 'Theo yêu cầu'}
- Tiêu chí đạt: ${assignment.acceptanceCriteria || 'Hoàn thành các bước'}

DANH SÁCH CÁC BƯỚC HỌC SINH CẦN THỰC HIỆN:
${stepsList}

BẢNG TIÊU CHÍ ĐÁNH GIÁ (RUBRIC) - BẮT BUỘC CHIẾT ĐIỂM TỪNG MỤC:
${rubricText}

${sampleProductText}

THÔNG TIN SẢN PHẨM HỌC SINH NỘP:
- Lớp: ${className || 'Không xác định'}
- Vị trí máy: ${machineNumber || 'Máy tính học sinh'}
- Học sinh nộp / Trưởng nhóm: ${studentLeader}
- Thành viên cùng nhóm: ${(groupMembers || []).join(', ') || 'Làm cá nhân'}
- Tên tệp nộp: ${fileName} (${fileSize || 0} bytes)
- Lần nộp thứ: ${attemptNumber}

${isImageFile ? `
ĐẶC BIỆT QUAN TRỌNG - ĐÂY LÀ TỆP HÌNH ẢNH SƠ ĐỒ / SẢN PHẨM THỰC HÀNH (PNG/JPG):
Tệp ảnh thực tế của học sinh đã được đính kèm vào tin nhắn này (qua Vision).
Bạn PHẢI phân tích trực tiếp hình ảnh đính kèm:
1. ĐỌC TẤT CẢ VĂN BẢN TRÊN ẢNH: Xem có tiêu đề không? Có các khối hình chữ nhật/bo góc không? Trên các khối có ghi các thành phần/hoạt động không?
2. KIỂM TRA MŨI TÊN & LIÊN KẾT: Các mũi tên có nối đúng chiều trình tự quy trình hoặc luồng dữ liệu không?
3. HÌNH ẢNH MINH HỌA & THẨM MỸ: Bố cục có cân đối, dễ nhìn, màu sắc tương phản rõ ràng không? Có biểu tượng minh họa không?
4. ĐỐI CHIẾU THEO ĐẶC THÙ BÀI HỌC:
   - Bài sơ đồ quy trình xử lí thông tin (SP01): Cả 2 dạng (4 khối tuần tự "Thu nhận -> Xử lí -> Lưu trữ -> Truyền thông tin" HOẶC mô hình kiến trúc máy tính "Thiết bị vào -> CPU -> Thiết bị ra & Bộ nhớ") đều đạt 10.0 điểm tuyệt đối!
   - Bài ảnh chụp cây thư mục (SP02): Xem có thư mục gốc TINHOC6 và các thư mục con (BaiTap, HinhAnh, VanBan, SanPham) hay không.
   - Bài sơ đồ mạng (SP03), Poster (SP04), Sơ đồ khối (SP13, TH7_SP12), Sơ đồ tư duy (SP11, TH9_SP06), Infographic (TH9_SP02): Nếu có bố cục rõ ràng, đúng các thành phần chủ đề -> Đạt 9.0 - 10.0 điểm!
` : `
NỘI DUNG VÀ CẤU TRÚC TRÍCH XUẤT TỪ TỆP NỘP:
\`\`\`
${fileContent ? fileContent.slice(0, 15000) : '[Tệp rỗng hoặc không có nội dung văn bản]'}
\`\`\`

HƯỚNG DẪN ĐÁNH GIÁ THEO THỂ LOẠI MÔN TIN HỌC (CHUẨN GDPT 2018):
- BẢNG TÍNH EXCEL (.XLSX):
  + Kiểm tra sự hiện diện của bảng dữ liệu có tiêu đề cột rõ ràng.
  + Kiểm tra các công thức/hàm (SUM, AVERAGE, IF, RANK, COUNTIF, MAX, MIN, các hàm lồng nhau) hoặc các kết quả tính toán số học. Nếu học sinh đã lập bảng và tính đúng kết quả/dùng đúng hàm, cho điểm tối đa ở tiêu chí công thức và bảng tính.
  + Với bài vẽ biểu đồ hoặc lọc/sắp xếp: Kiểm tra cấu trúc dữ liệu tóm tắt và định dạng bảng.
- VĂN BẢN WORD (.DOCX):
  + Kiểm tra tiêu đề lớn, các đề mục, bảng biểu phân loại (ví dụ: bảng 8 thiết bị vào-ra của TH7_SP01, phiếu tìm kiếm SP05, cẩm nang SP07, đánh giá độ tin cậy TH8_SP01/TH9_SP01).
  + Kiểm tra tính đầy đủ của nội dung: Nếu đã trả lời đúng các câu hỏi bài học, nêu được các giải pháp, cho điểm cao (8.5 - 10.0).
- TRÌNH CHIẾU POWERPOINT (.PPTX):
  + Kiểm tra số lượng slide (thường từ 3 - 6 slide), tiêu đề từng slide, nội dung tóm tắt theo gạch đầu dòng, nội dung khoa học, văn hóa mạng, bảo vệ thông tin cá nhân.
  + Đánh giá cao các bài có cấu trúc rõ ràng từ mở đầu đến kết luận.
- LẬP TRÌNH SCRATCH (.SB3):
  + Kiểm tra các nhân vật (sprites), khối sự kiện (Khi bấm cờ xanh), khối lặp (lặp lại, liên tục), khối điều kiện (nếu...thì), biến số tính điểm, trả lời câu hỏi trắc nghiệm.
  + Nếu chương trình có logic hoạt động, có tương tác -> Đạt 9.0 - 10.0 điểm!
- LẬP TRÌNH PYTHON (.PY) / C++ (.CPP):
  + Kiểm tra cú pháp, lệnh nhập xuất (input, print), vòng lặp for/while, câu lệnh điều kiện if/else, thuật toán tìm kiếm/sắp xếp.
`}

QUY TẮC CHIẾT ĐIỂM (BẮT BUỘC):
1. Bạn PHẢI chiết điểm chi tiết cho từng tiêu chí trong bảng Rubric trên vào mảng "criteriaResults".
   Mỗi tiêu chí gồm:
   - "criterionId": mã tiêu chí (ví dụ: r1, r2, r3, r4)
   - "criterionName": tên tiêu chí
   - "score": điểm học sinh đạt được cho tiêu chí này (tối thiểu 0, tối đa bằng maxScore)
   - "maxScore": điểm tối đa của tiêu chí
   - "feedback": nhận xét cụ thể học sinh đã làm tốt điểm nào hoặc thiếu điểm nào ở tiêu chí này.
2. Tổng điểm "score" BẮT BUỘC bằng tổng điểm của tất cả các tiêu chí trong criteriaResults (làm tròn 1 chữ số thập phân, thang 10.0).
3. ĐỐI CHIẾU TỪNG BƯỚC: Mảng "stepEvaluations" cho từng bước trong đề bài, gồm:
   - "stepNumber": số thứ tự bước (1, 2, 3...)
   - "instruction": tóm tắt nội dung bước
   - "status": "passed" | "partial" | "failed"
   - "detail": nhận xét ngắn gọn bước này đã đạt hay chưa đạt.

Định dạng JSON trả về (BẮT BUỘC):
{
  "score": 10.0,
  "aiComparisonDetails": "Tóm tắt đối chiếu chi tiết nội dung và hình thức sản phẩm với mục tiêu bài học",
  "criteriaResults": [
    { "criterionId": "r1", "criterionName": "Đủ 4 hoạt động xử lí thông tin", "score": 3.5, "maxScore": 3.5, "feedback": "Đã thể hiện đầy đủ 4 hoạt động: Thu nhận, Xử lí, Lưu trữ và Truyền thông tin." },
    { "criterionId": "r2", "criterionName": "Mũi tên liên kết & Chiều quy trình", "score": 2.5, "maxScore": 2.5, "feedback": "Mũi tên chỉ đúng chiều trình tự luồng thông tin." },
    { "criterionId": "r3", "criterionName": "Tiêu đề & Ví dụ minh họa", "score": 2.0, "maxScore": 2.0, "feedback": "Có tiêu đề QUY TRÌNH XỬ LÍ THÔNG TIN rõ ràng, có biểu tượng minh họa trực quan." },
    { "criterionId": "r4", "criterionName": "Thẩm mỹ & Đặt tên tệp nộp", "score": 2.0, "maxScore": 2.0, "feedback": "Màu sắc hài hòa, bố cục cân đối, xuất đúng định dạng ảnh." }
  ],
  "stepEvaluations": [
    { "stepNumber": 1, "instruction": "Tạo sơ đồ với 4 khối", "status": "passed", "detail": "Đã có đủ 4 khối hình rõ ràng." }
  ],
  "strengths": ["Ưu điểm nổi bật của bài làm"],
  "weaknesses": ["Chỗ còn thiếu sót (nếu có)"],
  "howToGetTen": ["Gợi ý để hoàn thiện tối đa điểm 10"],
  "inspectionSummary": {
    "contentScorePercent": 100,
    "formatScorePercent": 100,
    "stepCompletionRate": "8/8 bước đã hoàn thành",
    "isOffTopic": false
  },
  "encouragement": "Lời khen ngợi và động viên học sinh"
}
`;

        // Chuẩn bị payload Gemini: Hỗ trợ Multimodal Vision nếu có ảnh base64
        const contentsPayload: any[] = [];
        if (imageBase64 && typeof imageBase64 === 'string' && imageBase64.includes(',')) {
          const [header, base64Data] = imageBase64.split(',');
          const mimeTypeMatch = header.match(/:(.*?);/);
          const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
          contentsPayload.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        }
        contentsPayload.push(prompt);

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contentsPayload,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawJson = response.text?.trim() || '{}';
        const parsed = JSON.parse(rawJson);

        if (parsed && typeof parsed.score === 'number') {
          // Tính lại tổng điểm từ criteriaResults nếu có để đảm bảo chiết điểm chuẩn 100%
          let finalCalculatedScore = parsed.score;
          if (Array.isArray(parsed.criteriaResults) && parsed.criteriaResults.length > 0) {
            const sumCriteria = parsed.criteriaResults.reduce((acc: number, c: any) => acc + (typeof c.score === 'number' ? c.score : 0), 0);
            if (sumCriteria > 0) {
              finalCalculatedScore = Math.min(10, Math.max(1, Math.round(sumCriteria * 10) / 10));
            }
          }

          return res.json({
            score: finalCalculatedScore,
            aiComparisonDetails: parsed.aiComparisonDetails || 'Đã đối chiếu với sản phẩm mẫu và chuẩn tin học.',
            strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : ['Sản phẩm nộp đúng định dạng yêu cầu.'],
            weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
            howToGetTen: Array.isArray(parsed.howToGetTen) ? parsed.howToGetTen : [],
            stepEvaluations: Array.isArray(parsed.stepEvaluations) ? parsed.stepEvaluations : undefined,
            inspectionSummary: parsed.inspectionSummary || undefined,
            criteriaResults: Array.isArray(parsed.criteriaResults) ? parsed.criteriaResults : undefined,
            encouragement: parsed.encouragement || 'Tiếp tục phát huy nhé!',
            engine: 'gemini-3.8-flash-vision',
          });
        }
      } catch (aiErr) {
        console.warn('Gemini grading error, falling back to smart scanner:', aiErr);
      }
    }

    // Heuristic Fallback khi chưa có API Key
    const fallbackResult = fallbackHeuristicGrading({
      assignment,
      fileName,
      fileContent,
      imageBase64,
      attemptNumber,
    });

    return res.json({
      ...fallbackResult,
      engine: 'smart-heuristic-evaluator',
    });
  } catch (err: any) {
    console.error('Grade endpoint exception:', err);
    res.status(500).json({ error: err.message || 'Lỗi xử lý chấm điểm' });
  }
});

// API: Trạng thái cho phép nộp bài & đồng bộ phòng máy (Bảo mật: không lộ mã PIN cho máy học sinh)
app.get('/api/session-status', (_req, res) => {
  res.json({
    allowSubmission: getAllowSubmission(),
    hasPinConfigured: Boolean(getTeacherPin()),
  });
});

app.post('/api/session-status', (req, res) => {
  const { allow } = req.body;
  if (typeof allow === 'boolean') {
    setAllowSubmission(allow);
    broadcastRealtimeEvent({
      type: 'SUBMISSION_PERMISSION_CHANGED',
      allow: getAllowSubmission(),
    });
  }
  res.json({ success: true, allowSubmission: getAllowSubmission() });
});

// API: Xác thực mã PIN Giáo viên (Bảo vệ phía máy chủ, không để học sinh thấy mã PIN)
const handleVerifyTeacherPin = (req: express.Request, res: express.Response) => {
  const { pin } = req.body || {};
  if (!pin || typeof pin !== 'string') {
    return res.status(400).json({ success: false, error: 'Thiếu mã PIN' });
  }
  const currentPin = getTeacherPin();
  const isValid = pin.trim() === currentPin.trim();
  res.json({ success: isValid, error: isValid ? undefined : 'Mã PIN giáo viên không chính xác' });
};

app.post('/api/verify-pin', handleVerifyTeacherPin);
app.post('/api/teacher/verify-pin', handleVerifyTeacherPin);

// API: Đổi mã PIN Giáo viên
app.post('/api/change-pin', (req, res) => {
  const { currentPin, newPin } = req.body;
  const currentSavedPin = getTeacherPin();
  if (!currentPin || typeof currentPin !== 'string' || currentPin.trim() !== currentSavedPin.trim()) {
    return res.status(401).json({ success: false, error: 'Mã PIN hiện tại không chính xác' });
  }
  if (!newPin || typeof newPin !== 'string' || newPin.trim().length < 4) {
    return res.status(400).json({ success: false, error: 'Mã PIN mới phải có tối thiểu 4 ký tự' });
  }
  setTeacherPin(newPin.trim());
  console.log('[LabGrade CSDL] Giáo viên đã đổi mã PIN mới thành công trên CSDL máy chủ.');
  broadcastRealtimeEvent({
    type: 'TEACHER_PIN_CHANGED',
    newPin: newPin.trim(),
    timestamp: new Date().toISOString(),
  });
  res.json({ success: true, message: 'Đổi mã PIN thành công' });
});

// API: Kiểm tra trạng thái Gemini AI
app.get('/api/ai-status', (_req, res) => {
  res.json({
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    status: process.env.GEMINI_API_KEY ? 'active' : 'offline_rule_mode',
  });
});

// API: Lấy toàn bộ danh sách bài nộp và trạng thái CSDL thời gian thực
app.get('/api/submissions', (_req, res) => {
  const submissions = getAllSubmissions();
  const dbStatus = getDatabaseMetrics();
  res.json({
    submissions,
    allowSubmission: getAllowSubmission(),
    dbStatus,
  });
});

// API: Tự động lưu và cập nhật ngay bài nộp của học sinh vào CSDL đĩa
app.post('/api/submissions', (req, res) => {
  if (!getAllowSubmission()) {
    return res.status(403).json({
      error: '🔒 Giáo viên hiện đang KHÓA nhận bài nộp phòng thực hành. Không thể lưu bài nộp vào CSDL lúc này.',
      locked: true,
    });
  }

  const newSubmission = req.body;
  if (!newSubmission || !newSubmission.className || !newSubmission.machineNumber) {
    return res.status(400).json({ error: 'Dữ liệu bài nộp không hợp lệ hoặc thiếu thông tin lớp/số máy' });
  }

  try {
    const result = upsertSubmission(newSubmission);
    // Phát sóng sự kiện thời gian thực tới tất cả máy giáo viên và học sinh
    broadcastRealtimeEvent({
      type: 'SUBMISSION_UPDATED',
      submission: result.submission,
      totalSubmissions: result.totalCount,
      dbStatus: getDatabaseMetrics(),
    });

    res.json({
      success: true,
      count: result.totalCount,
      submission: result.submission,
      message: 'Đã lưu và cập nhật vào CSDL thành công',
    });
  } catch (err: any) {
    console.error('[CSDL Thực Hành] Lỗi khi lưu bài nộp:', err);
    res.status(500).json({ error: err.message || 'Lỗi lưu CSDL' });
  }
});

// API: Đồng bộ hàng loạt bài nộp vào CSDL (bảo vệ khi mạng chập chờn)
app.post('/api/submissions/sync-batch', (req, res) => {
  const isTeacherSync = req.body && req.body.isTeacherSync === true;
  if (!getAllowSubmission() && !isTeacherSync) {
    return res.status(403).json({
      error: '🔒 Giáo viên hiện đang KHÓA nhận bài nộp phòng thực hành. Không thể đồng bộ bài nộp lúc này.',
      locked: true,
    });
  }

  const { submissions } = req.body;
  if (!Array.isArray(submissions)) {
    return res.status(400).json({ error: 'Dữ liệu không phải là danh sách bài nộp' });
  }
  const result = batchSyncSubmissions(submissions);
  broadcastRealtimeEvent({
    type: 'SUBMISSIONS_SYNCED',
    addedCount: result.count,
    submissions: getAllSubmissions(),
    dbStatus: getDatabaseMetrics(),
  });
  res.json(result);
});

// API: Xóa bài nộp theo lớp hoặc toàn bộ (Hỗ trợ cả DELETE và POST /delete)
const handleDeleteSubmissions = (req: express.Request, res: express.Response) => {
  const targetClass = req.query.className || req.body?.className;
  const classNameStr = typeof targetClass === 'string' && targetClass.trim() ? targetClass.trim() : undefined;
  const remaining = deleteSubmissions(classNameStr);
  broadcastRealtimeEvent({
    type: 'SUBMISSIONS_CLEARED',
    className: classNameStr,
    count: remaining,
  });
  res.json({ success: true, count: remaining, submissions: getAllSubmissions() });
};

app.delete('/api/submissions', handleDeleteSubmissions);
app.post('/api/submissions/delete', handleDeleteSubmissions);

// API: Xóa sạch toàn bộ kết quả thực hành ảo và cũ khỏi CSDL máy chủ
app.post('/api/submissions/clear', (_req, res) => {
  const remaining = deleteSubmissions(); // xóa sạch 100%
  broadcastRealtimeEvent({
    type: 'SUBMISSIONS_CLEARED',
    count: remaining,
  });
  res.json({ success: true, count: remaining, submissions: [] });
});

// API: Trạng thái chi tiết CSDL lưu trữ phòng máy
app.get('/api/database/status', (_req, res) => {
  res.json(getDatabaseMetrics());
});

// API: Tải bản sao lưu CSDL dạng JSON
app.get('/api/database/export-json', (_req, res) => {
  const submissions = getAllSubmissions();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="CSDL_BaiNop_PhongMay_${new Date().toISOString().slice(0, 10)}.json"`);
  res.send(JSON.stringify(submissions, null, 2));
});

// API: Lấy danh sách học sinh các lớp (tải lên từ Excel)
app.get('/api/student-roster', (_req, res) => {
  const students = getAllStudents();
  res.json({ success: true, count: students.length, students, lastUpdated: getRosterLastUpdated() });
});

// API: Cập nhật danh sách học sinh từ Excel (Giáo viên tải lên)
app.post('/api/student-roster', (req, res) => {
  const { students, mode = 'replace' } = req.body;
  if (!Array.isArray(students)) {
    return res.status(400).json({ error: 'Dữ liệu không phải là danh sách học sinh' });
  }
  const result = saveStudentRoster(students, mode);
  // BẮT BUỘC: Phát sóng thời gian thực tới tất cả máy học sinh để cập nhật ngay danh sách nhập thông tin
  broadcastRealtimeEvent({
    type: 'ROSTER_UPDATED',
    students: result.students,
    total: result.total,
    classes: result.classes,
    lastUpdated: getRosterLastUpdated(),
  });
  res.json(result);
});

// API: Xóa danh sách học sinh (toàn bộ hoặc theo lớp) - Hỗ trợ cả DELETE và POST /delete
const handleDeleteRoster = (req: express.Request, res: express.Response) => {
  const targetClass = req.query.className || req.body?.className;
  const classNameStr = typeof targetClass === 'string' && targetClass.trim() ? targetClass.trim() : undefined;
  const result = deleteStudentRoster(classNameStr);
  broadcastRealtimeEvent({
    type: 'ROSTER_UPDATED',
    students: getAllStudents(),
    total: result.count,
    classes: result.classes,
    deletedClass: classNameStr,
  });
  res.json(result);
};

app.delete('/api/student-roster', handleDeleteRoster);
app.post('/api/student-roster/delete', handleDeleteRoster);

// API: Đổi tên lớp học sinh nhanh chóng (ví dụ khắc phục khi nạp nhầm 6B2 thay vì 6A2)
app.post('/api/student-roster/rename', (req, res) => {
  const { oldClassName, newClassName } = req.body || {};
  if (!oldClassName || !newClassName) {
    return res.status(400).json({ error: 'Thiếu tên lớp cũ hoặc tên lớp mới' });
  }
  const result = renameStudentClass(String(oldClassName), String(newClassName));
  broadcastRealtimeEvent({
    type: 'ROSTER_UPDATED',
    students: getAllStudents(),
    total: result.count,
    classes: result.classes,
    renamed: { oldClassName, newClassName },
  });
  res.json(result);
});

// Endpoint SSE kênh thời gian thực: /api/events (kết nối liên tục giữa máy GV và máy HS)
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Gửi thông báo kết nối thành công và số máy trạm đang mở
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientsCount: sseClients.size + 1 })}\n\n`);

  sseClients.add(res);

  // Heartbeat ping mỗi 15 giây để duy trì kết nối
  const keepAlive = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(keepAlive);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
  });
});

// Endpoint thông tin mạng nội bộ: /api/network-info
app.get('/api/network-info', (_req, res) => {
  const interfaces = os.networkInterfaces();
  const lanIps: string[] = [];

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        lanIps.push(net.address);
      }
    }
  }

  res.json({
    port: PORT,
    lanIps,
    lanUrls: lanIps.map((ip) => `http://${ip}:${PORT}`),
    activeClients: sseClients.size,
    serverTime: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    submissionsCount: getAllSubmissions().length,
    activeClients: sseClients.size,
    timestamp: new Date().toISOString(),
  });
});

// Mount Vite or static build
const distDir = path.resolve(__dirname, 'dist');
const indexHtmlFile = path.join(distDir, 'index.html');

let isDistReady = fs.existsSync(indexHtmlFile);

if (!isDistReady && process.env.NODE_ENV === 'production') {
  console.log('[LabGrade Server] ⚠️ Chưa tìm thấy dist/index.html. Đang tự động chạy npm run build...');
  try {
    const { execSync } = await import('child_process');
    execSync('npm run build', { stdio: 'inherit' });
    isDistReady = fs.existsSync(indexHtmlFile);
    if (isDistReady) {
      console.log('[LabGrade Server] ✅ Tự động biên dịch dist thành công!');
    }
  } catch (buildError) {
    console.error('[LabGrade Server] ⚠️ Không thể chạy npm run build, sẽ chuyển sang Vite middleware:', buildError);
  }
}

if (isDistReady) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(indexHtmlFile, (err) => {
      if (err && !res.headersSent) {
        res.status(500).send('Không thể tải trang: ' + (err as Error).message);
      }
    });
  });
} else {
  console.log('[LabGrade Server] 🚀 Khởi chạy Vite middleware phục vụ giao diện trực tiếp...');
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

// Error handling middleware to prevent uncaught exceptions
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Internal Error]', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Server Internal Error', message: err?.message || String(err) });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  const lanIps: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        lanIps.push(net.address);
      }
    }
  }

  console.log(`====================================================`);
  console.log(`[LabGrade Server] Máy chủ CSDL phòng máy đã khởi chạy thành công:`);
  console.log(`👉 Trực tiếp trên máy này: http://localhost:${PORT}`);
  if (lanIps.length > 0) {
    lanIps.forEach((ip) => {
      console.log(`👉 Cho các máy học sinh (mạng LAN phòng máy): http://${ip}:${PORT}`);
    });
  }
  console.log(`====================================================`);
});

