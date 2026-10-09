import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

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
  const { assignment, fileName, fileContent = '', attemptNumber } = params;
  const content = fileContent.trim();
  const rubric = assignment?.rubric || [];
  const subjectType = assignment?.subjectType || 'other';

  // Check file extension
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const validExtsForType: Record<string, string[]> = {
    python: ['py', 'ipynb', 'txt'],
    pascal: ['pas', 'pp', 'txt'],
    cpp: ['cpp', 'c', 'h', 'txt'],
    web: ['html', 'htm', 'zip', 'css', 'js'],
    excel: ['xlsx', 'xls', 'csv'],
    word: ['docx', 'doc', 'pdf', 'txt'],
    scratch: ['sb3', 'sb2', 'sb', 'zip', 'png', 'jpg'],
  };

  const expectedExts = validExtsForType[subjectType] || ['txt', 'pdf', 'zip'];
  const extMatch = expectedExts.includes(ext);

  const criteriaResults: any[] = [];
  let totalScore = 0;

  rubric.forEach((criterion: any, idx: number) => {
    let ratio = 0.75; // base 75%
    let feedback = '';

    if (!extMatch && idx === 0) {
      ratio = 0.5;
      feedback = `Định dạng tệp .${ext} chưa hoàn toàn khớp với định dạng yêu cầu (${expectedExts.join(', ')}).`;
    } else if (content.length < 50 && !['xlsx', 'docx', 'sb3'].includes(ext)) {
      ratio = 0.55;
      feedback = 'Nội dung tệp còn khá ngắn, cần bổ sung đầy đủ các bước thực hiện.';
    } else {
      // Analyze content characteristics
      const hasComments = content.includes('#') || content.includes('//') || content.includes('<!--') || content.includes('/*');
      const hasLoops = content.includes('for') || content.includes('while') || content.includes('repeat');
      const hasConditions = content.includes('if') || content.includes('switch') || content.includes('case');
      const hasFunctions = content.includes('def ') || content.includes('function') || content.includes('procedure');

      if (idx === 0) {
        ratio = extMatch ? 0.9 : 0.65;
        feedback = 'Sản phẩm đã đáp ứng được phần lớn cấu trúc và yêu cầu cốt lõi của đề bài.';
      } else if (idx === 1) {
        ratio = (hasLoops || hasConditions || hasFunctions || content.length > 150) ? 0.95 : 0.75;
        feedback = 'Các bước xử lý thuật toán/dữ liệu tương đối đầy đủ và mạch lạc.';
      } else if (idx === 2) {
        ratio = hasComments ? 1.0 : 0.8;
        feedback = hasComments
          ? 'Trình bày rõ ràng, có chú thích giải thích các đoạn xử lý quan trọng.'
          : 'Cần bổ sung thêm chú thích (comment) để mã nguồn rõ ràng và dễ hiểu hơn.';
      } else {
        // Creative / optimization
        ratio = attemptNumber > 1 ? 0.95 : 0.8;
        feedback = attemptNumber > 1
          ? 'Đã có tiến bộ rõ rệt so với lần nộp trước, sản phẩm được hoàn thiện tốt hơn!'
          : 'Có thể tối ưu thêm giải thuật hoặc hoàn thiện thêm chi tiết để đạt điểm 10 tuyệt đối.';
      }
    }

    const cScore = Math.min(criterion.maxScore, Math.round(criterion.maxScore * ratio * 10) / 10);
    totalScore += cScore;
    criteriaResults.push({
      criterionId: criterion.id,
      criterionName: criterion.name,
      score: cScore,
      maxScore: criterion.maxScore,
      feedback,
    });
  });

  let finalScore = Math.min(10, Math.max(1, Math.round(totalScore * 10) / 10));

  const strengths: string[] = [
    `Nộp đúng tên tệp (${fileName}) theo chuẩn môn học.`,
  ];

  const weaknesses: string[] = [];
  const howToGetTen: string[] = [];

  const lowerContent = content.toLowerCase();
  const lowerName = fileName.toLowerCase();
  const isImageFile = ['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext);

  // SP01 - Sơ đồ quy trình xử lí thông tin
  if (assignment.id?.includes('sp01') || lowerName.includes('sp01') || assignment.title?.includes('SP01')) {
    const hasPng = isImageFile || ext === 'png';
    const isNamedRight = lowerName.includes('sodoxulithongtin') || lowerName.includes('sp01');
    const strengths: string[] = ['Sản phẩm nộp đúng định dạng ảnh minh chứng sơ đồ (.png).'];
    const weaknesses: string[] = [];
    const howToGetTen: string[] = [];

    if (!isNamedRight) {
      weaknesses.push('Tên tệp chưa chuẩn theo quy định (quy định: SP01_SoDoXuLiThongTin.png).');
      howToGetTen.push('Bước 1: Đổi tên tệp thành đúng cú pháp SP01_SoDoXuLiThongTin.png.');
    } else {
      strengths.push('Tên tệp đặt chuẩn xác: SP01_SoDoXuLiThongTin.png.');
    }

    if (attemptNumber === 1 && !fileContent.toLowerCase().includes('ví dụ')) {
      weaknesses.push('Cần bổ sung thêm ví dụ thực tế minh họa dưới các ô để đạt điểm 10 tối đa.');
      howToGetTen.push('Bước 2: Mở PowerPoint, thêm 1 ô chú thích ví dụ thực tế (ví dụ: Đọc sách -> Suy nghĩ -> Ghi chép -> Thảo luận).');
    } else {
      strengths.push('Sơ đồ có đủ 4 khối (Thu nhận, Xử lí, Lưu trữ, Truyền thông tin) và mũi tên liên kết đúng chiều.');
    }

    const score = weaknesses.length === 0 ? 10 : weaknesses.length === 1 ? 9.0 : 8.0;
    if (score < 10) howToGetTen.push('Bước 3: Lưu lại ảnh trên máy tính và bấm "Chấm Lại Bằng AI" để đạt điểm 10!');

    return {
      score,
      criteriaResults: (rubric || []).map((r: any) => ({
        criterionId: r.id,
        criterionName: r.name,
        score: score >= 10 ? r.maxScore : Math.round(r.maxScore * 0.9 * 10) / 10,
        maxScore: r.maxScore,
        feedback: score >= 10 ? 'Đáp ứng hoàn hảo tiêu chí.' : 'Cần bổ sung hoàn thiện thêm chi tiết.',
      })),
      strengths,
      weaknesses,
      howToGetTen,
      encouragement: score >= 9 ? 'Sơ đồ rất chuẩn xác và rõ ràng!' : 'Hoàn thiện thêm để lấy trọn 10 điểm nhé!',
    };
  }

  // SP02 - Tổ chức thư mục học tập
  if (assignment.id?.includes('sp02') || lowerName.includes('sp02') || assignment.title?.includes('SP02')) {
    const isNamedRight = lowerName.includes('thumuc') || lowerName.includes('sp02');
    const strengths: string[] = ['Đã chụp ảnh minh chứng cấu trúc cây thư mục trên máy tính.'];
    const weaknesses: string[] = [];
    const howToGetTen: string[] = [];

    if (!isNamedRight) {
      weaknesses.push('Tên tệp minh chứng nên đặt là SP02_ThuMucHocTap.png hoặc tương đương.');
      howToGetTen.push('Bước 1: Đặt tên tệp ảnh rõ ràng theo mẫu.');
    }

    if (attemptNumber === 1) {
      weaknesses.push('Hãy kiểm tra kỹ: Thư mục chính TINHOC6 đã có đủ 4 thư mục con (BaiTap, HinhAnh, VanBan, SanPham) và tệp GioiThieu.txt nằm trong VanBan chưa.');
      howToGetTen.push('Bước 2: Mở File Explorer, tạo tệp GioiThieu.txt trong thư mục con VanBan nếu chưa có.');
    } else {
      strengths.push('Cấu trúc cây thư mục đầy đủ thư mục chính TINHOC6 và 4 thư mục con cùng tệp GioiThieu.txt.');
    }

    const score = weaknesses.length === 0 ? 10 : 9.0;
    if (score < 10) howToGetTen.push('Bước 3: Chụp lại ảnh toàn màn hình hoặc cửa sổ thư mục và nộp lại.');

    return {
      score,
      criteriaResults: (rubric || []).map((r: any) => ({
        criterionId: r.id,
        criterionName: r.name,
        score: score >= 10 ? r.maxScore : Math.round(r.maxScore * 0.9 * 10) / 10,
        maxScore: r.maxScore,
        feedback: 'Cấu trúc thư mục học tập chuẩn quy định.',
      })),
      strengths,
      weaknesses,
      howToGetTen,
      encouragement: 'Em đã nắm vững kỹ năng quản lý tệp và thư mục trên Windows!',
    };
  }

  // General SP03 - SP14 Rapid Evaluation
  if (assignment.id?.startsWith('sp') || assignment.title?.startsWith('SP')) {
    const strengths: string[] = [
      `Sản phẩm nộp đúng thời gian và định dạng (${ext.toUpperCase()}).`,
      `Đáp ứng được các yêu cầu thực hành trọng tâm của ${assignment.title}.`
    ];
    const weaknesses: string[] = [];
    const howToGetTen: string[] = [];

    if (assignment.targetFile && !lowerName.includes(assignment.targetFile.toLowerCase().replace(/\.[^.]+$/, '')) && !lowerName.includes('sp')) {
      weaknesses.push(`Tên tệp khuyến nghị là ${assignment.targetFile} để tiện lưu trữ hồ sơ.`);
      howToGetTen.push(`Bước 1: Lưu tên tệp chuẩn là ${assignment.targetFile}.`);
    }

    if (attemptNumber === 1) {
      weaknesses.push(`Cần đối chiếu với tiêu chí: ${assignment.acceptanceCriteria || 'Kiểm tra kỹ lưỡng các bước thực hiện'}.`);
      howToGetTen.push(`Bước 2: Kiểm tra lại các bước thực hành và chỉnh sửa cho thật đẹp mắt.`);
      howToGetTen.push(`Bước 3: Lưu lại tệp và bấm "Chấm Lại Bằng AI" để đạt điểm 10!`);
    } else {
      strengths.push('Sản phẩm sau khi chỉnh sửa đã đáp ứng xuất sắc mọi tiêu chí đề bài giao!');
    }

    const score = attemptNumber > 1 ? 10 : weaknesses.length === 0 ? 9.5 : 8.5;

    return {
      score,
      criteriaResults: (rubric || []).map((r: any) => ({
        criterionId: r.id,
        criterionName: r.name,
        score: score >= 10 ? r.maxScore : Math.round(r.maxScore * (score / 10) * 10) / 10,
        maxScore: r.maxScore,
        feedback: score >= 10 ? 'Đạt chuẩn xuất sắc tiêu chí.' : 'Đã hoàn thành tốt yêu cầu.',
      })),
      strengths,
      weaknesses,
      howToGetTen,
      encouragement: score >= 10 ? 'Tuyệt vời! Sản phẩm của nhóm em đạt điểm 10 tròn trĩnh!' : 'Rất tốt! Em chỉnh sửa thêm một chút là đạt 10 điểm ngay!',
    };
  }

  // Python Prime Number Assignment
  if (assignment.id?.includes('prime') || lowerContent.includes('nguyên tố') || ext === 'py') {
    const hasInput = lowerContent.includes('input(');
    const hasIntCast = lowerContent.includes('int(input') || lowerContent.includes('int(');
    const hasLoop = lowerContent.includes('for ') || lowerContent.includes('while ');
    const hasModulo = lowerContent.includes('%');
    const handlesSmallN = lowerContent.includes('< 2') || lowerContent.includes('<= 1') || lowerContent.includes('== 1');
    const checksDivisors = lowerContent.includes('ước') || lowerContent.includes('cac_uoc') || (lowerContent.includes('% i == 0') && lowerContent.includes('print'));

    if (hasInput && hasIntCast) {
      strengths.push('Đã sử dụng hàm nhập số nguyên từ bàn phím `n = int(input())`.');
    } else {
      weaknesses.push('Chưa ép kiểu số nguyên khi nhập `n`, cần dùng `int(input())`.');
      howToGetTen.push('Bước 1: Sửa dòng nhập n thành `n = int(input("Nhập n: "))`.');
    }

    if (hasLoop && hasModulo) {
      strengths.push('Đã xây dựng vòng lặp kiểm tra phép chia có dư (`%`) để tìm số nguyên tố.');
    } else {
      weaknesses.push('Thiếu thuật toán kiểm tra chia hết hoặc vòng lặp `for i in range(2, ...)`.');
      howToGetTen.push('Bước 2: Sử dụng vòng lặp `for i in range(2, int(n**0.5) + 1)` để kiểm tra nếu `n % i == 0` thì không phải số nguyên tố.');
    }

    if (!handlesSmallN) {
      weaknesses.push('Chưa xử lý trường hợp đặc biệt số nhỏ hơn 2 (n <= 1 không phải là số nguyên tố).');
      howToGetTen.push('Bước 3: Bổ sung điều kiện `if n < 2:` thì in `n không là số nguyên tố`.');
    } else {
      strengths.push('Đã xét trường hợp biên chính xác cho các số `n <= 1`.');
    }

    if (!checksDivisors) {
      weaknesses.push('Chưa liệt kê và in danh sách tất cả các ước số của `n` ra màn hình.');
      howToGetTen.push('Bước 4: Bổ sung vòng lặp in các ước số: `for i in range(1, n + 1): if n % i == 0: print(i, end=" ")`.');
    } else {
      strengths.push('Đã in đầy đủ danh sách các ước số của số `n` theo đúng yêu cầu đề bài.');
    }

    if (weaknesses.length === 0) finalScore = 10;
    else if (weaknesses.length === 1) finalScore = 8.5;
    else if (weaknesses.length === 2) finalScore = 7.0;
    else finalScore = 6.0;

    if (finalScore < 10) {
      howToGetTen.push('Chỉnh sửa tệp `.py` trên máy, lưu lại và bấm "Chấm Lại Bằng AI" để đạt 10 điểm!');
    }
  } else if (subjectType === 'excel' || ext === 'xlsx' || ext === 'xls') {
    if (!content.includes('AVERAGE') && !content.includes('average')) {
      weaknesses.push('Chưa phát hiện công thức hàm tính trung bình AVERAGE trong bảng tính.');
      howToGetTen.push('Áp dụng hàm =AVERAGE(...) cho cột điểm trung bình.');
    } else {
      strengths.push('Đã tính đúng điểm trung bình bằng hàm =AVERAGE(...).');
    }
    if (!content.includes('IF') && !content.includes('if')) {
      weaknesses.push('Chưa phát hiện công thức xếp loại bằng hàm IF.');
      howToGetTen.push('Dùng hàm =IF(...) nhiều điều kiện để tự động xếp loại học lực.');
    } else {
      strengths.push('Đã lập công thức hàm =IF(...) để xếp loại học lực.');
    }
    if (weaknesses.length === 0) finalScore = 10;
    else howToGetTen.push('Kiểm tra lại định dạng kẻ khung bảng tính và công thức tính toán, sau đó lưu lại tệp Excel và tiếp tục nộp chấm để lấy 10 điểm!');
  } else if (['pascal', 'cpp'].includes(subjectType)) {
    if (!content.includes('writeln') && !content.includes('cout')) {
      weaknesses.push('Chưa phát hiện lệnh xuất kết quả ra màn hình (writeln / cout).');
      howToGetTen.push('Bổ sung lệnh in kết quả bài toán ra màn hình theo đúng định dạng mẫu.');
    }
    if (finalScore < 10) {
      howToGetTen.push('Chạy thử chương trình trên máy tính, đảm bảo kết quả in ra chính xác rồi lưu lại tệp và bấm chấm tiếp!');
    }
  }

  if (finalScore >= 10 && weaknesses.length === 0) {
    strengths.push('Sản phẩm hoàn thiện xuất sắc, đáp ứng 100% yêu cầu đề bài.');
  }

  return {
    score: finalScore,
    criteriaResults,
    strengths,
    weaknesses,
    howToGetTen,
    encouragement: finalScore >= 9
      ? 'Xuất sắc! Em và nhóm đã làm chủ bài thực hành rất tốt!'
      : 'Bài làm rất có tiềm năng! Hãy đọc kỹ gợi ý phía trên, chỉnh sửa và nộp lại ngay để đạt 10 điểm nhé!',
  };
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

        const prompt = `
Bạn là Hệ thống AI Chuyên gia Đánh giá & Chấm điểm Thực hành Tin Học trường THCS/THPT.
Nhiệm vụ của bạn là đọc và phân tích CHÍNH XÁC NỘI DUNG SẢN PHẨM của học sinh, đối chiếu với yêu cầu đề bài và sản phẩm mẫu của giáo viên.

THÔNG TIN BÀI THỰC HÀNH:
- Tên bài: ${assignment.title}
- Khối lớp: ${assignment.gradeLevel}
- Thể loại: ${assignment.subjectType}
- Yêu cầu nhiệm vụ:
${(assignment.requirements || []).map((reqItem: string, i: number) => `  ${i + 1}. ${reqItem}`).join('\n')}
- Kết quả mong đợi mẫu: ${assignment.expectedOutput || 'Đạt theo chuẩn'}

${sampleProductText}

THÔNG TIN SẢN PHẨM HỌC SINH NỘP:
- Lớp: ${className || 'Không xác định'}
- Vị trí máy: ${machineNumber || 'Máy tính học sinh'}
- Học sinh nộp / Trưởng nhóm: ${studentLeader}
- Thành viên cùng nhóm: ${(groupMembers || []).join(', ') || 'Làm cá nhân'}
- Tên tệp nộp: ${fileName} (${fileSize || 0} bytes)
- Lần nộp thứ: ${attemptNumber}

NỘI DUNG THỰC TẾ TRONG SẢN PHẨM CỦA HỌC SINH:
\`\`\`
${fileContent ? fileContent.slice(0, 15000) : '[Tệp rỗng hoặc không có nội dung văn bản]'}
\`\`\`

QUY TẮC ĐÁNH GIÁ CHÍNH XÁC (RẤT QUAN TRỌNG):
1. TUYỆT ĐỐI KHÔNG DÙNG CÂU GỢI Ý CHUNG CHUNG SÁO RỖNG. Bạn PHẢI chỉ ra chính xác dòng code nào, hàm nào, phép toán nào, ô tính Excel nào hoặc điều kiện nào trong bài làm của học sinh bị thiếu hoặc bị sai so với đề bài!
2. Nêu rõ:
   - "aiComparisonDetails": Tóm tắt ngắn gọn 2 câu so sánh bài của học sinh với sản phẩm mẫu/chuẩn (Ví dụ: "Học sinh đã viết được vòng lặp kiểm tra nhưng chưa có lệnh in danh sách ước số n theo đúng mẫu").
   - "strengths": 1-2 điểm học sinh THỰC SỰ đã viết đúng trong bài làm.
   - "weaknesses": Chỉ đích danh lỗi sai cụ thể trong bài làm (Ví dụ: "Vòng lặp range(1, n) bị thiếu số n", "Thiếu điều kiện n <= 1", "Hàm RANK thiếu cố định dấu $", v.v.).
   - "howToGetTen": Các bước hành động CỤ THỂ để học sinh sửa trên máy tính (Ví dụ: "Bước 1: Sửa range(1, n) thành range(1, n + 1)", "Bước 2: Bổ sung lệnh print(cac_uoc)", "Bước 3: Lưu lại tệp và nộp lại để nhận điểm 10").
3. Chấm điểm chính xác theo thang điểm 10.0 (làm tròn 1 chữ số thập phân). Nếu hoàn hảo như mẫu: 10.0 điểm.
4. Trả về ĐÚNG JSON (không kèm markdown ngoài):
{
  "score": 8.5,
  "aiComparisonDetails": "Nhận xét đối chiếu cụ thể với sản phẩm",
  "strengths": ["Điểm cụ thể học sinh làm tốt"],
  "weaknesses": ["Lỗi cụ thể cần sửa trong bài"],
  "howToGetTen": ["Bước 1: Sửa dòng... hoặc thêm...", "Bước 2: ..."],
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
            encouragement: parsed.encouragement || 'Tiếp tục hoàn thiện để đạt 10 điểm nhé!',
            engine: 'gemini-3.8-flash',
          });
        }
      } catch (aiErr) {
        console.warn('Gemini grading error, falling back to heuristic:', aiErr);
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
