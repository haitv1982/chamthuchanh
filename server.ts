import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { scanAndGradeProduct } from './src/utils/productScanner';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// In-memory submissions store for cross-machine lab sync
let labSubmissions: any[] = [];

// Fallback heuristic grading engine when AI is unreachable or offline
function fallbackHeuristicGrading(params: {
  assignment: any;
  fileName: string;
  fileContent: string;
  attemptNumber: number;
}) {
  return scanAndGradeProduct(params);
}

// API: Chấm điểm bài thực hành (Gemini AI + Fallback)
app.post('/api/grade', async (req, res) => {
  try {
    const {
      assignment,
      fileName,
      fileSize,
      fileContent = '',
      attemptNumber = 1,
      studentLeader,
      groupMembers = [],
      className,
      machineNumber,
    } = req.body;

    if (!assignment || !fileName) {
      return res.status(400).json({ error: 'Thiếu thông tin bài tập hoặc tệp nộp.' });
    }

    // Try Gemini AI if available
    if (ai) {
      try {
        const rubricList = Array.isArray(assignment?.rubric) ? assignment.rubric : [];
        const rubricText = rubricList.length > 0
          ? rubricList.map((r: any) => `- [${r.id || 'c'}] ${r.name || 'Tiêu chí'} (Tối đa ${r.maxScore || 2.5}đ): ${r.description || ''}`).join('\n')
          : 'Thang điểm 10.0 chuẩn: Hoàn thành đúng yêu cầu, chạy đúng kết quả, giải thuật tối ưu và cấu trúc chuẩn.';

        const sampleProduct = assignment?.sampleProduct;
        const sampleProductText = sampleProduct && sampleProduct.content
          ? `SẢN PHẨM MẪU CHUẨN CỦA GIÁO VIÊN ĐỂ ĐỐI CHIẾU:\n- Tên tệp mẫu: ${sampleProduct.fileName || 'Chưa đặt tên'}\n- Ghi chú mẫu: ${sampleProduct.notes || 'Đáp án chuẩn môn Tin học'}\n- Nội dung mã nguồn / cấu trúc mẫu:\n\`\`\`\n${sampleProduct.content.slice(0, 8000)}\n\`\`\``
          : `KHO LƯU TRỮ CHUẨN & TRI THỨC INTERNET:\n- Hệ thống quét kiến thức chuẩn ngành Tin học và giáo dục phổ thông cho chủ đề: ${assignment.title} (${assignment.subjectType}).`;

        const stepsList = Array.isArray(assignment?.steps) && assignment.steps.length > 0
          ? assignment.steps.map((st: string, i: number) => `Bước ${i + 1}: ${st}`).join('\n')
          : 'Thực hiện theo các yêu cầu nhiệm vụ đề bài.';

        const prompt = `
Bạn là Hệ thống AI Chuyên gia Đánh giá & Chấm điểm Thực hành Tin Học trường THCS/THPT.
Nhiệm vụ của bạn là quét sâu NỘI DUNG VÀ HÌNH THỨC SẢN PHẨM của học sinh, đối chiếu CHÍNH XÁC TỪNG BƯỚC THỰC HIỆN với đề bài và sản phẩm mẫu.

THÔNG TIN BÀI THỰC HÀNH:
- Tên bài: ${assignment.title}
- Khối lớp: ${assignment.gradeLevel}
- Thể loại / Công cụ: ${assignment.subjectType} (${assignment.toolRequired || 'Phần mềm chuyên dụng'})
- Tệp nộp theo quy định: ${assignment.targetFile || 'Theo yêu cầu'}
- Tiêu chí đạt: ${assignment.acceptanceCriteria || 'Hoàn thành các bước'}

DANH SÁCH CÁC BƯỚC HỌC SINH CẦN THỰC HIỆN ĐỂ ĐẠT:
${stepsList}

${sampleProductText}

THÔNG TIN SẢN PHẨM HỌC SINH NỘP:
- Lớp: ${className || 'Không xác định'}
- Vị trí máy: ${machineNumber || 'Máy tính học sinh'}
- Học sinh nộp / Trưởng nhóm: ${studentLeader}
- Thành viên cùng nhóm: ${(groupMembers || []).join(', ') || 'Làm cá nhân'}
- Tên tệp nộp: ${fileName} (${fileSize || 0} bytes)
- Lần nộp thứ: ${attemptNumber}

NỘI DUNG VÀ CẤU TRÚC THỰC TẾ TRÍCH XUẤT TỪ TỆP NỘP CỦA HỌC SINH:
\`\`\`
${fileContent ? fileContent.slice(0, 15000) : '[Tệp rỗng hoặc không có nội dung văn bản]'}
\`\`\`

QUY TẮC ĐÁNH GIÁ VÀ ĐỐI CHIẾU CHÍNH XÁC (RẤT QUAN TRỌNG):
1. TUYỆT ĐỐI KHÔNG CHẤM MẶC ĐỊNH 8.0 ĐIỂM!
2. NẾU TỆP NỘP LẠC ĐỀ HOẶC NỘP TỆP NGẪU NHIÊN:
   - Nếu học sinh nộp một tệp Word/tệp văn bản ngẫu nhiên KHÔNG LIÊN QUAN đến chủ đề bài thực hành "${assignment.title}" (ví dụ bài tập môn khác, lời bài hát, đoạn văn linh tinh, hoặc tệp rỗng/quá ngắn dưới 15 từ không chứa các bước): BẮT BUỘC CHẤM TỪ 1.0 ĐẾN 3.0 ĐIỂM. Nêu rõ: "Tệp nộp chưa đúng nội dung bài thực hành".
3. ĐỐI CHIẾU TỪNG BƯỚC:
   - Bạn PHẢI đối chiếu từng bước trong danh sách các bước trên.
   - Trả về mảng "stepEvaluations": mỗi phần tử gồm {"stepNumber": số, "instruction": "nội dung bước", "status": "passed" | "partial" | "failed", "detail": "nhận xét cụ thể tại sao đạt hoặc chưa đạt"}.
4. ĐO LƯỜNG NỘI DUNG VÀ HÌNH THỨC:
   - "inspectionSummary": { "contentScorePercent": số (0-100), "formatScorePercent": số (0-100), "stepCompletionRate": "X/Y bước đã hoàn thành", "isOffTopic": boolean }
5. ĐIỂM SỐ CHÍNH XÁC THEO TỶ LỆ HOÀN THÀNH (Thang điểm 10.0, 1 chữ số thập phân):
   - Lạc đề/Rỗng: 1.0 - 3.0đ
   - Thiếu nhiều bước cốt lõi: 4.0 - 6.0đ
   - Đạt phần lớn, thiếu 1-2 bước nhỏ: 7.0 - 8.5đ
   - Hoàn thành trọn vẹn mọi bước và tiêu chí: 9.5 - 10.0đ.
6. Trả về ĐÚNG JSON (không kèm markdown ngoài):
{
  "score": 3.0,
  "aiComparisonDetails": "Tóm tắt đối chiếu nội dung và hình thức với sản phẩm",
  "strengths": ["Điểm cụ thể làm được"],
  "weaknesses": ["Chỗ còn thiếu/sai cần sửa"],
  "howToGetTen": ["Bước 1: ...", "Bước 2: ..."],
  "stepEvaluations": [
    { "stepNumber": 1, "instruction": "...", "status": "passed", "detail": "..." }
  ],
  "inspectionSummary": {
    "contentScorePercent": 20,
    "formatScorePercent": 50,
    "stepCompletionRate": "1/5 bước đã hoàn thành",
    "isOffTopic": false
  },
  "encouragement": "Lời động viên ngắn"
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawJson = response.text?.trim() || '{}';
        const parsed = JSON.parse(rawJson);

        if (parsed && typeof parsed.score === 'number') {
          return res.json({
            score: Math.min(10, Math.max(1, Math.round(parsed.score * 10) / 10)),
            aiComparisonDetails: parsed.aiComparisonDetails || 'Đã đối chiếu với sản phẩm mẫu và chuẩn tin học.',
            strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : ['Sản phẩm nộp đúng định dạng yêu cầu.'],
            weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
            howToGetTen: Array.isArray(parsed.howToGetTen) ? parsed.howToGetTen : [],
            stepEvaluations: Array.isArray(parsed.stepEvaluations) ? parsed.stepEvaluations : undefined,
            inspectionSummary: parsed.inspectionSummary || undefined,
            criteriaResults: Array.isArray(parsed.criteriaResults) ? parsed.criteriaResults : undefined,
            encouragement: parsed.encouragement || 'Tiếp tục hoàn thiện để đạt 10 điểm nhé!',
            engine: 'gemini-3.8-flash',
          });
        }
      } catch (aiErr) {
        console.warn('Gemini grading error, falling back to smart scanner:', aiErr);
      }
    }

    // Heuristic Fallback
    const fallbackResult = fallbackHeuristicGrading({
      assignment,
      fileName,
      fileContent,
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

// API: Đồng bộ danh sách bài nộp trong phòng máy
app.get('/api/submissions', (_req, res) => {
  res.json({ submissions: labSubmissions });
});

app.post('/api/submissions', (req, res) => {
  const newSubmission = req.body;
  if (!newSubmission || !newSubmission.id) {
    return res.status(400).json({ error: 'Dữ liệu bài nộp không hợp lệ' });
  }

  const existingIdx = labSubmissions.findIndex((s) => s.id === newSubmission.id);
  if (existingIdx >= 0) {
    labSubmissions[existingIdx] = newSubmission;
  } else {
    labSubmissions.unshift(newSubmission);
  }

  // Tự động xoá bớt các bản ghi cũ khi đầy bộ nhớ (Yêu cầu 3)
  if (labSubmissions.length > 150) {
    const today = new Date().toISOString().slice(0, 10);
    const todayList = labSubmissions.filter((s) => s.practiceDate === today || s.latestSubmittedAt?.slice(0, 10) === today);
    const pastList = labSubmissions.filter((s) => s.practiceDate !== today && s.latestSubmittedAt?.slice(0, 10) !== today);
    pastList.sort((a, b) => new Date(b.latestSubmittedAt || 0).getTime() - new Date(a.latestSubmittedAt || 0).getTime());
    labSubmissions = [...todayList, ...pastList.slice(0, 100)];
  }

  res.json({ success: true, count: labSubmissions.length });
});

app.delete('/api/submissions', (req, res) => {
  const { className } = req.query;
  if (className) {
    labSubmissions = labSubmissions.filter((s) => s.className !== className);
  } else {
    labSubmissions = [];
  }
  res.json({ success: true, count: labSubmissions.length });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    submissionsCount: labSubmissions.length,
    timestamp: new Date().toISOString(),
  });
});

// Mount Vite or static build
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[LabGrade Server] Listening on port ${PORT}`);
});
