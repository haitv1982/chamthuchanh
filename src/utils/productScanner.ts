import { Assignment, CriterionResult, InspectionSummary, RubricCriterion, StepEvaluation } from '../types';

export interface GradingOutput {
  score: number;
  aiComparisonDetails: string;
  strengths: string[];
  weaknesses: string[];
  howToGetTen: string[];
  criteriaResults: CriterionResult[];
  stepEvaluations: StepEvaluation[];
  inspectionSummary: InspectionSummary;
}

// Chuẩn hóa văn bản tiếng Việt để tìm kiếm từ khóa không phân biệt hoa thường và dấu phụ
export function normalizeVi(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
}

// Trích xuất các từ khóa đặc trưng cho bài thực hành từ yêu cầu, mẫu và tiêu đề
function extractTargetKeywords(assignment: Assignment): {
  coreTerms: string[];
  secondaryTerms: string[];
  forbiddenOrNegativeTerms?: string[];
} {
  const normTitle = normalizeVi(assignment.title);
  const normId = normalizeVi(assignment.id);
  const subjectType = assignment.subjectType;

  const coreTerms: string[] = [];
  const secondaryTerms: string[] = [];

  // 1. Phân loại theo ID hoặc Tên bài
  // SP01 Lớp 6: Sơ đồ quy trình xử lí thông tin
  if (normId.includes('sp01') && normTitle.includes('quy trinh')) {
    coreTerms.push('thu nhan', 'xu li', 'luu tru', 'truyen thong tin', 'quy trinh');
    secondaryTerms.push('so do', 'thong tin', 'vi du', 'dau vao', 'dau ra', 'mui ten');
  }
  // SP02 Lớp 6: Thư mục học tập
  else if (normId.includes('sp02') || normTitle.includes('thu muc')) {
    coreTerms.push('tinhoc6', 'baitap', 'hinhanh', 'vanban', 'sanpham');
    secondaryTerms.push('gioithieu.txt', 'file explorer', 'folder', 'thu muc con', 'documents');
  }
  // SP03 Lớp 6: Sơ đồ mạng máy tính
  else if (normId.includes('sp03') || normTitle.includes('mang may tinh')) {
    coreTerms.push('router', 'dinh tuyen', 'internet', 'may tinh', 'laptop');
    secondaryTerms.push('may in', 'tablet', 'ket noi', 'khong day', 'co day');
  }
  // SP04 Lớp 6: Poster Internet an toàn
  else if (normId.includes('sp04') || normTitle.includes('internet an toan')) {
    coreTerms.push('mat khau', 'thong tin ca nhan', 'lien ket la', 'kiem tra', 'nguoi lon');
    secondaryTerms.push('5 nguyen tac', 'an toan', 'poster', 'canh giac', 'chia se');
  }
  // SP05 Lớp 6: Phiếu thực hành tìm kiếm
  else if (normId.includes('sp05') || normTitle.includes('tim kiem')) {
    coreTerms.push('tu khoa', 'nguon', 'duong dan', 'url', 'danh gia');
    secondaryTerms.push('google', 'tim kiem', 'noi dung', 'tin cay', 'doc sach', 'moi truong');
  }
  // SP06 Lớp 6: Soạn thư điện tử
  else if (normId.includes('sp06') || normTitle.includes('thu dien tu')) {
    coreTerms.push('nguoi nhan', 'tieu de', 'kinh gui', 'dinh kem', 'cam on');
    secondaryTerms.push('email', 'gmail', 'soan thu', 'chu ky', 'noi dung');
  }
  // SP07 Lớp 6: Cẩm nang công dân số
  else if (normId.includes('sp07') || normTitle.includes('cong dan so')) {
    coreTerms.push('ung xu van minh', 'thong tin ca nhan', 'tai khoan', 'ban quyen', 'nguy hiem');
    secondaryTerms.push('cam nang', 'mat khau', 'vi du', 'quy tac', 'an toan');
  }
  // TH7_SP01 Lớp 7: Thiết bị vào - ra của máy tính
  else if (normId.includes('th7-sp01') || (normTitle.includes('thiet bi') && normTitle.includes('vao'))) {
    coreTerms.push('thiet bi vao', 'thiet bi ra', 'ban phim', 'chuot', 'man hinh', 'may in');
    secondaryTerms.push('micro', 'may quet', 'loa', 'may chieu', 'chuc nang', 'phan loai');
  }
  // TH7_SP02 Lớp 7: Phần mềm máy tính và HĐH
  else if (normId.includes('th7-sp02') || (normTitle.includes('phan mem') && normTitle.includes('he dieu hanh'))) {
    coreTerms.push('he dieu hanh', 'phan mem ung dung', 'windows', 'linux', 'android', 'word');
    secondaryTerms.push('trinh chieu', 'khai niem', 'vi du', 'powerpoint', 'ung dung');
  }
  // TH8_SP01 Lớp 8: Đánh giá chất lượng thông tin
  else if (normId.includes('th8-sp01') || (normTitle.includes('danh gia') && normTitle.includes('chat luong'))) {
    coreTerms.push('nguon goc', 'cap nhat', 'bang chung', 'thong nhat', 'ket luan', 'tin cay');
    secondaryTerms.push('tuoitre', 'nguon 1', 'nguon 2', 'so sanh', 'kiem chung');
  }
  // TH8_SP02 Lớp 8: Bảo vệ thông tin cá nhân
  else if (normId.includes('th8-sp02') || (normTitle.includes('bao ve') && normTitle.includes('ca nhan'))) {
    coreTerms.push('mat khau', 'cccd', 'tai khoan', 'lo lot', 'bao ve');
    secondaryTerms.push('nguy co', 'bien phap', 'an toan', 'du lieu');
  }
  // Lập trình Scratch (Lớp 8, Lớp 9)
  else if (subjectType === 'scratch' || normId.includes('scratch') || normId.includes('sb3') || normTitle.includes('scratch') || normTitle.includes('lap trinh') || normTitle.includes('tro choi')) {
    coreTerms.push('nhan vat', 'san khau', 'khoi lenh', 'lap', 're nhanh', 'bien so');
    secondaryTerms.push('scratch', 'sprite', 'stage', 'diem', 'tra loi', 'su kien', 'neu', 'thi', 'lap lai');
  }
  // Lập trình Python (số nguyên tố, thuật toán)
  else if (subjectType === 'python' || normId.includes('prime') || normTitle.includes('nguyen to') || normTitle.includes('thuat toan')) {
    coreTerms.push('input', 'int', 'for', 'while', '%', 'print');
    secondaryTerms.push('range', 'nguyen to', 'uoc', 'if', 'else', 'def', 'return');
  }
  // Bảng tính Excel (Lớp 7, 8, 9)
  else if (subjectType === 'excel' || normTitle.includes('bang tinh') || normTitle.includes('excel')) {
    coreTerms.push('average', 'if', 'sum', 'rank', 'diem', 'bang tinh', 'cot', 'hang');
    secondaryTerms.push('trung binh', 'xep loai', 'cong thuc', 'max', 'min', 'countif', 'bieu do', 'sap xep', 'loc');
  }
  // Soạn thảo Word (Lớp 6, 7, 8, 9)
  else if (subjectType === 'word' || normTitle.includes('van ban') || normTitle.includes('word')) {
    coreTerms.push('van ban', 'tieu de', 'dinh dang', 'noi dung');
    secondaryTerms.push('bang', 'doan van', 'hinh anh', 'trang', 'danh sach', 'can le');
  }
  // Trình chiếu PowerPoint (Lớp 6, 7, 8, 9)
  else if (subjectType === 'powerpoint' || normTitle.includes('trinh chieu') || normTitle.includes('powerpoint')) {
    coreTerms.push('slide', 'trang', 'tieu de', 'noi dung');
    secondaryTerms.push('trinh chieu', 'powerpoint', 'smartart', 'hinh anh', 'lien ket', 'chuyen dong');
  }

  // Tự động bổ sung từ khóa thông minh từ TIÊU ĐỀ, YÊU CẦU, CÁC BƯỚC và MẪU CHUẨN
  const titleClean = normTitle.replace(/^(sp\d+|th\d+_sp\d+)\.?\s*/i, '');
  const titleWords = titleClean.split(/[\s,:\-\.]+/).filter((w) => w.length >= 3 && !['bai', 'thuc', 'hanh', 'lop', 'cua'].includes(w));
  titleWords.forEach((tw) => {
    if (!coreTerms.includes(tw)) coreTerms.push(tw);
  });

  if (assignment.requirements && assignment.requirements.length > 0) {
    assignment.requirements.forEach((req) => {
      const clean = normalizeVi(req);
      const words = clean.split(/[,:;→\-\.]+/);
      words.forEach((w) => {
        const item = w.trim();
        if (item.length >= 4 && item.length <= 25 && !coreTerms.includes(item)) {
          secondaryTerms.push(item);
        }
      });
    });
  }

  if (assignment.steps && assignment.steps.length > 0) {
    assignment.steps.forEach((st) => {
      const clean = normalizeVi(st);
      const chunks = clean.split(/[,:;→\-\.]+/);
      chunks.forEach((c) => {
        const item = c.trim();
        if (item.length >= 4 && item.length <= 25 && !coreTerms.includes(item) && !secondaryTerms.includes(item)) {
          secondaryTerms.push(item);
        }
      });
    });
  }

  if (assignment.sampleProduct && assignment.sampleProduct.content) {
    const sampleNorm = normalizeVi(assignment.sampleProduct.content);
    const sampleLines = sampleNorm.split('\n');
    sampleLines.forEach((l) => {
      const lineTrim = l.trim();
      if (lineTrim.length >= 5 && lineTrim.length <= 30 && !coreTerms.includes(lineTrim)) {
        secondaryTerms.push(lineTrim);
      }
    });
  }

  return { coreTerms, secondaryTerms };
}

// Tách lấy nội dung thực tế của học sinh (loại bỏ các tiêu đề kỹ thuật do hệ thống trích xuất đính kèm)
export function extractCleanStudentText(rawText: string): {
  cleanText: string;
  cleanWordCount: number;
  slideCount: number;
} {
  if (!rawText) return { cleanText: '', cleanWordCount: 0, slideCount: 0 };

  const slideMatches = rawText.match(/---\s*Slide\s*\d+\s*---/gi) || [];
  const slideCount = slideMatches.length;

  // Loại bỏ các thẻ nhãn kỹ thuật hệ thống
  const cleaned = rawText
    .replace(/\[BÀI TRÌNH CHIẾU POWERPOINT.*?\]/gi, ' ')
    .replace(/\[Tệp Word:.*?\]/gi, ' ')
    .replace(/\[Tệp PowerPoint:.*?\]/gi, ' ')
    .replace(/\[DỰ ÁN LẬP TRÌNH SCRATCH.*?\]/gi, ' ')
    .replace(/---\s*Slide\s*\d+\s*---/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .trim();

  const words = cleaned
    .split(/\s+/)
    .filter((w) => w.length > 0 && !['---', '|', ':', '•', '*', '[', ']'].includes(w));

  return {
    cleanText: cleaned,
    cleanWordCount: words.length,
    slideCount,
  };
}

// Hàm quét cấu trúc văn bản/tệp (Hình thức)
export function inspectDocumentStructure(params: {
  fileName: string;
  fileContent: string;
  subjectType: string;
}): {
  hasTable: boolean;
  tableCount: number;
  wordCount: number;
  cleanWordCount: number;
  slideCount: number;
  paragraphCount: number;
  headingDetected: boolean;
  hasFormulas: boolean;
  formatScorePercent: number;
  structuralNotes: string[];
} {
  const { fileName, fileContent = '', subjectType } = params;
  const content = fileContent;
  const lowerContent = content.toLowerCase();
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const { cleanText, cleanWordCount, slideCount } = extractCleanStudentText(content);
  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = cleanWordCount;

  const structuralNotes: string[] = [];
  let formatScorePercent = 50;

  // Kiểm tra bảng (Tables)
  const hasTableTags = content.includes('<table') || content.includes('[BẢNG') || content.includes('| ---') || content.includes('|:---');
  const pipeTableLines = content.split('\n').filter((l) => l.trim().startsWith('|') && l.trim().endsWith('|'));
  const hasTextTable = pipeTableLines.length >= 2;
  const hasTableIndicators = lowerContent.includes('cột') && lowerContent.includes('hàng') && (lowerContent.includes('bảng') || lowerContent.includes('stt'));
  const hasTable = hasTableTags || hasTextTable || hasTableIndicators || content.includes('border=') || content.includes('grid');

  let tableCount = 0;
  if (hasTableTags) {
    tableCount = Math.max(1, (content.match(/<table/g) || []).length);
  } else if (hasTextTable) {
    tableCount = 1;
  } else if (hasTable) {
    tableCount = 1;
  }

  // Tiêu đề (dựa trên nội dung thực tế sạch)
  const headingDetected =
    content.includes('<h1') ||
    content.includes('<h2') ||
    cleanText.includes('TIÊU ĐỀ') ||
    cleanText.includes('TIEU DE') ||
    cleanText.includes('BÁO CÁO') ||
    cleanText.includes('CẨM NANG') ||
    cleanText.includes('THIẾT BỊ VÀO') ||
    cleanText.includes('SƠ ĐỒ') ||
    (words.length >= 4 && words.slice(0, 6).join(' ').toUpperCase() === words.slice(0, 6).join(' '));

  // Đoạn văn
  const paragraphCount = Math.max(1, cleanText.split(/\n\s*\n/).length);

  // Công thức Excel
  const hasFormulas =
    lowerContent.includes('average(') ||
    lowerContent.includes('if(') ||
    lowerContent.includes('sum(') ||
    lowerContent.includes('rank(') ||
    lowerContent.includes('=');

  // Đánh giá điểm hình thức cơ bản theo từng loại tệp
  if (ext === 'pptx' || ext === 'ppt') {
    if (slideCount === 0 && cleanWordCount < 15) {
      formatScorePercent = 25;
      structuralNotes.push('Bài trình chiếu trống hoặc quá ít nội dung.');
    } else if (slideCount <= 1 || cleanWordCount < 25) {
      formatScorePercent = 45;
      structuralNotes.push(`Bài trình chiếu còn sơ sài (chỉ có ${Math.max(1, slideCount)} slide, ${cleanWordCount} từ).`);
    } else if (slideCount >= 2 && cleanWordCount >= 40) {
      formatScorePercent = 85;
      structuralNotes.push(`Bài trình chiếu hoàn chỉnh gồm ${slideCount} trang slide với bố cục rõ ràng.`);
    } else {
      formatScorePercent = 65;
      structuralNotes.push(`Đã tạo ${slideCount || 1} slide trình chiếu.`);
    }
  } else if (cleanWordCount < 10 && !['png', 'jpg', 'jpeg', 'sb3'].includes(ext)) {
    structuralNotes.push('Tệp nộp có dung lượng văn bản quá ít (dưới 10 từ).');
    formatScorePercent = 20;
  } else {
    formatScorePercent = 60;
    if (headingDetected) {
      formatScorePercent += 15;
      structuralNotes.push('Có tiêu đề văn bản rõ ràng.');
    }
    if (hasTable) {
      formatScorePercent += 15;
      structuralNotes.push(`Đã tạo bảng biểu (${tableCount} bảng) theo đúng yêu cầu bài học.`);
    }
    if (cleanWordCount >= 40) {
      formatScorePercent += 10;
      structuralNotes.push(`Độ dài văn bản đầy đủ (${cleanWordCount} từ).`);
    }
  }

  formatScorePercent = Math.min(100, Math.max(10, formatScorePercent));

  return {
    hasTable,
    tableCount,
    wordCount: cleanWordCount,
    cleanWordCount,
    slideCount,
    paragraphCount,
    headingDetected,
    hasFormulas,
    formatScorePercent,
    structuralNotes,
  };
}

// ĐỘNG CƠ CHẤM ĐIỂM VÀ ĐỐI CHIẾU NHANH TỪNG BƯỚC
export function scanAndGradeProduct(params: {
  assignment: Assignment;
  fileName: string;
  fileSize?: number;
  fileContent?: string;
  attemptNumber?: number;
  imageBase64?: string;
}): GradingOutput {
  const { assignment, fileName, fileSize = 0, fileContent = '', attemptNumber = 1, imageBase64 } = params;
  const content = (fileContent || '').trim();
  const normContent = normalizeVi(content);
  const normTitle = normalizeVi(assignment?.title || '');
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const lowerFileName = fileName.toLowerCase();

  // 1. Phân tích cấu trúc hình thức tệp
  const structure = inspectDocumentStructure({
    fileName,
    fileContent: content,
    subjectType: assignment.subjectType,
  });

  // 2. Trích xuất từ khóa chủ đề và kiểm tra độ liên quan nội dung
  const { coreTerms, secondaryTerms } = extractTargetKeywords(assignment);
  let coreMatches = 0;
  const foundCoreTerms: string[] = [];
  const missingCoreTerms: string[] = [];

  coreTerms.forEach((term) => {
    if (normContent.includes(term)) {
      coreMatches++;
      foundCoreTerms.push(term);
    } else {
      missingCoreTerms.push(term);
    }
  });

  let secondaryMatches = 0;
  secondaryTerms.forEach((term) => {
    if (normContent.includes(term)) {
      secondaryMatches++;
    }
  });

  // Kiểm tra nếu đây là sản phẩm nộp dạng hình ảnh đồ họa hợp lệ (ví dụ SP01 Sơ đồ xử lí thông tin)
  const isImageSubmission = ['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext) || Boolean(imageBase64);
  const isImageExpected = Boolean(
    assignment.targetFile?.match(/\.(png|jpg|jpeg|webp)$/i) ||
    assignment.id.toLowerCase().includes('sp01') ||
    assignment.id.toLowerCase().includes('so-do') ||
    normTitle.includes('quy trinh') ||
    normTitle.includes('so do') ||
    assignment.subjectType === 'powerpoint' ||
    assignment.subjectType === 'canva'
  );

  // Tính tỷ lệ liên quan nội dung (0 - 100%)
  let contentScorePercent = 0;
  let isOffTopic = false;
  const imageBase64Length = (imageBase64 || '').length;

  if (isImageSubmission && isImageExpected) {
    // TỆP HÌNH ẢNH SƠ ĐỒ / SẢN PHẨM ĐỒ HỌA:
    // Kiểm tra độ phong phú dựa trên kích thước và dung lượng byte thực tế của ảnh
    if (imageBase64Length < 8000) {
      // Dưới 6KB: Ảnh rỗng, icon nhỏ hoặc vẽ quẹt sơ sài
      isOffTopic = false;
      contentScorePercent = 25;
      structure.formatScorePercent = 30;
    } else if (imageBase64Length < 35000) {
      // 6KB - 25KB: Ảnh mức độ cơ bản, còn sơ sài
      isOffTopic = false;
      contentScorePercent = 60;
      structure.formatScorePercent = 65;
    } else if (imageBase64Length < 75000) {
      // 25KB - 55KB: Ảnh đầy đủ, tương đối chi tiết
      isOffTopic = false;
      contentScorePercent = 82;
      structure.formatScorePercent = 85;
    } else {
      // Trên 55KB: Ảnh đồ họa chất lượng cao, đầy đủ thành phần
      isOffTopic = false;
      contentScorePercent = 92;
      structure.formatScorePercent = 94;
    }
  } else {
    const totalCore = coreTerms.length;
    if (totalCore > 0) {
      const coreRatio = coreMatches / totalCore;
      const secondaryBonus = Math.min(25, secondaryMatches * 5);
      contentScorePercent = Math.round(coreRatio * 75 + secondaryBonus);

      // Phát hiện tệp quá sơ sài / làm đối phó / tệp rỗng / lạc đề
      if (structure.wordCount < 15 && !['png', 'jpg', 'jpeg', 'sb3'].includes(ext)) {
        isOffTopic = true;
        contentScorePercent = 15;
      } else if (structure.wordCount < 40 && !['png', 'jpg', 'jpeg', 'sb3', 'xlsx'].includes(ext)) {
        // Bài văn bản Word nhưng chỉ gõ dưới 40 từ: sơ sài
        contentScorePercent = Math.min(45, contentScorePercent);
      } else if (structure.wordCount > 15 && coreMatches === 0 && secondaryMatches <= 1) {
        isOffTopic = true;
        contentScorePercent = Math.min(20, contentScorePercent);
      }
    } else {
      // Nếu bài tập không định nghĩa sẵn từ khóa chuyên biệt (ví dụ code Python hoặc Scratch)
      if (assignment.subjectType === 'python') {
        const hasPyOps = normContent.includes('input') || normContent.includes('print') || normContent.includes('for') || normContent.includes('def');
        contentScorePercent = hasPyOps ? (normContent.length > 150 ? 85 : 55) : 25;
        isOffTopic = !hasPyOps && structure.wordCount > 10;
      } else if (assignment.subjectType === 'excel') {
        const hasFormulas = normContent.includes('=') || normContent.includes('sum') || normContent.includes('average') || normContent.includes('if');
        contentScorePercent = hasFormulas ? 85 : (structure.wordCount > 30 ? 55 : 35);
      } else {
        contentScorePercent = structure.wordCount > 80 ? 80 : (structure.wordCount > 30 ? 55 : 30);
      }
    }
  }

  contentScorePercent = Math.min(100, Math.max(5, contentScorePercent));

  // 3. ĐỐI CHIẾU TỪNG BƯỚC THỰC HIỆN (assignment.steps)
  const steps = assignment.steps && assignment.steps.length > 0
    ? assignment.steps
    : [
        `Mở phần mềm ${assignment.toolRequired || 'chuyên dụng'} và tạo tài liệu mới.`,
        `Thực hiện các yêu cầu chính: ${assignment.requirements?.[0] || 'Nội dung cốt lõi'}.`,
        `Thiết lập định dạng, bảng biểu hoặc cấu trúc phù hợp.`,
        `Rà soát theo tiêu chí: ${assignment.acceptanceCriteria || 'Hoàn thiện sản phẩm'}.`,
        `Lưu và nộp tệp đúng định dạng quy định.`,
      ];

  const stepEvaluations: StepEvaluation[] = [];
  let passedStepsCount = 0;
  let partialStepsCount = 0;

  steps.forEach((stepInstruction, index) => {
    const stepNum = index + 1;
    const normStep = normalizeVi(stepInstruction);

    let status: 'passed' | 'partial' | 'failed' = 'passed';
    let detail = '';

    // Trường hợp tệp hình ảnh sơ đồ:
    if (isImageSubmission && isImageExpected) {
      if (imageBase64Length < 8000) {
        status = index === 0 ? 'partial' : 'failed';
        detail = `Ảnh sản phẩm quá nhỏ hoặc rỗng (${(imageBase64Length / 1024).toFixed(1)} KB), chưa đạt yêu cầu của bước này.`;
      } else if (imageBase64Length < 35000) {
        if (index === 0) {
          status = 'passed';
          detail = `Đã tạo tệp ảnh đồ họa (.${ext.toUpperCase()}).`;
        } else if (index === steps.length - 1) {
          status = 'passed';
          detail = `Đã xuất và lưu tệp ảnh sản phẩm.`;
        } else {
          status = 'partial';
          detail = `Sản phẩm sơ đồ còn đơn giản, cần bổ sung thêm chi tiết, nhãn văn bản và mũi tên liên kết.`;
        }
      } else {
        status = 'passed';
        detail = `Đã hoàn thành tốt yêu cầu của bước này trên sản phẩm sơ đồ đồ họa (${fileName}).`;
      }
    } else if (isOffTopic && structure.wordCount < 10) {
      status = 'failed';
      detail = `Chưa thực hiện. Tệp nộp rỗng hoặc quá ngắn (${structure.wordCount} từ), không có nội dung bước này.`;
    } else if (isOffTopic) {
      // Tệp có chữ nhưng lạc đề
      if (index === 0 && (normStep.includes('mo') || normStep.includes('tao tai lieu'))) {
        status = 'passed';
        detail = `Đã tạo tệp văn bản (${ext.toUpperCase()}).`;
      } else {
        status = 'failed';
        detail = `Chưa đạt. Tệp nộp lạc đề, không chứa nội dung hoặc yêu cầu của bước này.`;
      }
    } else {
      // Phân tích chi tiết từng loại bước theo từ khóa
      if (
        normStep.includes('mo') ||
        normStep.includes('khoi dong') ||
        normStep.includes('tao tai lieu') ||
        normStep.includes('tao tep') ||
        normStep.includes('tao thu muc') ||
        normStep.includes('tao trang')
      ) {
        status = 'passed';
        detail = `Đã khởi tạo đúng tệp làm việc định dạng .${ext.toUpperCase()}.`;
      } else if (normStep.includes('tieu de') || normStep.includes('dat ten de muc')) {
        if (structure.headingDetected || normContent.includes('tieu de') || normContent.includes(normalizeVi(assignment.title.slice(5, 20)))) {
          status = 'passed';
          detail = `Đã có tiêu đề nổi bật theo yêu cầu bài học.`;
        } else {
          status = 'passed';
          detail = `Đã trình bày tiêu đề và nội dung bài làm.`;
        }
      } else if (normStep.includes('bang') || normStep.includes('cot') || normStep.includes('hang') || normStep.includes('table')) {
        if (structure.hasTable || ext === 'xlsx' || ext === 'xls' || normContent.includes('stt') || normContent.includes('bang') || normContent.includes(',')) {
          status = 'passed';
          detail = `Đã tạo bảng biểu (${structure.tableCount || 1} bảng) và các cột dữ liệu theo đúng hướng dẫn.`;
        } else {
          status = 'failed';
          detail = `Chưa tạo bảng biểu theo yêu cầu. Hãy chèn bảng (Insert -> Table).`;
        }
      } else if (
        normStep.includes('cong thuc') ||
        normStep.includes('ham') ||
        normStep.includes('tinh') ||
        normStep.includes('average') ||
        normStep.includes('sum') ||
        normStep.includes('if')
      ) {
        if (structure.hasFormulas || normContent.includes('=') || normContent.includes('sum') || normContent.includes('average') || normContent.includes('if') || normContent.includes('tong') || normContent.includes('diem')) {
          status = 'passed';
          detail = `Đã thiết lập công thức và hàm tính toán số liệu chính xác.`;
        } else {
          status = 'partial';
          detail = `Cần kiểm tra lại các công thức tính toán (như =SUM, =AVERAGE, =IF...).`;
        }
      } else if (normStep.includes('slide') || normStep.includes('trinh chieu') || normStep.includes('trang chieu')) {
        const slideCnt = structure.slideCount || 0;
        const cleanWords = structure.cleanWordCount || 0;
        if (ext === 'pptx' || ext === 'ppt') {
          if (slideCnt >= 2 && cleanWords >= 35 && (coreMatches >= 1 || secondaryMatches >= 1)) {
            status = 'passed';
            detail = `Đã xây dựng ${slideCnt} trang slide trình chiếu với đầy đủ tiêu đề và nội dung bài học.`;
          } else if (slideCnt >= 1 && cleanWords >= 15) {
            status = 'partial';
            detail = `Bài trình chiếu còn sơ sài (chỉ có ${Math.max(1, slideCnt)} slide, ${cleanWords} từ), cần bổ sung thêm trang slide và nội dung chi tiết.`;
          } else {
            status = 'failed';
            detail = `Chưa hoàn thiện slide trình chiếu (slide rỗng hoặc quá ít nội dung: ${cleanWords} từ).`;
          }
        } else {
          if (cleanWords >= 35 && (normContent.includes('slide') || structure.paragraphCount >= 2)) {
            status = 'passed';
            detail = `Đã trình bày nội dung bài thuyết trình đầy đủ.`;
          } else {
            status = 'partial';
            detail = `Cần bổ sung thêm nội dung trình chiếu chi tiết hơn.`;
          }
        }
      } else if (normStep.includes('khoi lenh') || normStep.includes('nhan vat') || normStep.includes('san khau') || normStep.includes('re nhanh') || normStep.includes('lap') || normStep.includes('scratch') || normStep.includes('thuat toan')) {
        if (normContent.includes('khoi lenh') || normContent.includes('nhan vat') || normContent.includes('sprite') || normContent.includes('if') || normContent.includes('for') || normContent.includes('while') || ext === 'sb3' || ext === 'py') {
          status = 'passed';
          detail = `Đã cài đặt thuật toán và các khối lệnh/cú pháp chính xác theo yêu cầu.`;
        } else {
          status = 'partial';
          detail = `Cần rà soát các khối lệnh rẽ nhánh và vòng lặp theo đúng kịch bản.`;
        }
      } else if (normStep.includes('dinh dang') || normStep.includes('phong chu') || normStep.includes('co chu') || normStep.includes('mau chu') || normStep.includes('can le')) {
        if (structure.cleanWordCount >= 15 || structure.headingDetected || structure.paragraphCount >= 2) {
          status = 'passed';
          detail = `Đã hoàn thành tốt định dạng văn bản, phông chữ và bố cục trang.`;
        } else {
          status = 'partial';
          detail = `Cần căn chỉnh lại kích thước chữ và lề trang cho đẹp mắt.`;
        }
      } else if (normStep.includes('it nhat 8') || normStep.includes('8 thiet bi') || normStep.includes('thiet bi vao')) {
        const deviceNames = [
          'ban phim', 'chuot', 'man hinh', 'may in', 'loa', 'micro', 'may quet', 'scanner', 
          'may chieu', 'tai nghe', 'o dia', 'o cung', 'usb', 'camera', 'webcam', 'but cam ung', 
          'man cam ung', 'bo thu am', 'thiet bi vao', 'thiet bi ra'
        ];
        const foundDevices = deviceNames.filter((d) => normContent.includes(d));
        if (foundDevices.length >= 4) {
          status = 'passed';
          detail = `Đã liệt kê đủ ${foundDevices.length} thiết bị vào - ra chuẩn xác.`;
        } else {
          status = 'partial';
          detail = `Đã liệt kê ${foundDevices.length} thiết bị (nên bổ sung thêm thiết bị vào/ra để hoàn thiện).`;
        }
      } else if (normStep.includes('dien chuc nang') || normStep.includes('phan loai')) {
        const hasChucNang = normContent.includes('chuc nang') || normContent.includes('dung de') || normContent.includes('nhiem vu') || normContent.includes('thu nhan') || normContent.includes('xuat');
        const hasPhanLoai = (normContent.includes('vao') && normContent.includes('ra')) || normContent.includes('phan loai');
        if (hasChucNang || hasPhanLoai) {
          status = 'passed';
          detail = `Đã mô tả đầy đủ chức năng và phân loại chính xác các mục.`;
        } else {
          status = 'partial';
          detail = `Đã có thông tin nhưng còn thiếu một phần chức năng hoặc cột phân loại.`;
        }
      } else if (normStep.includes('luu tep') || normStep.includes('xuat anh') || normStep.includes('dung ten quy dinh') || normStep.includes('luu bai')) {
        status = 'passed';
        detail = `Đã lưu tệp với định dạng hợp lệ (${fileName}).`;
      } else {
        // Kiểm tra chung theo từ khóa của bước và độ phong phú nội dung
        const stepWords = normStep.split(/\s+/).filter((w) => w.length >= 4 && !['thuc', 'hien', 'yeu', 'cau', 'theo', 'trong'].includes(w));
        const matchWords = stepWords.filter((w) => normContent.includes(w));
        const ratio = stepWords.length > 0 ? matchWords.length / stepWords.length : 1;
        const hasCoreOrSec = coreMatches >= 1 || secondaryMatches >= 1;

        if (ratio >= 0.4 && structure.cleanWordCount >= 25 && hasCoreOrSec) {
          status = 'passed';
          detail = `Đã hoàn thành tốt yêu cầu của bước này.`;
        } else if (ratio >= 0.25 || (structure.cleanWordCount >= 40 && hasCoreOrSec)) {
          status = 'partial';
          detail = `Đã làm một phần nhưng cần hoàn thiện thêm chi tiết.`;
        } else {
          status = structure.cleanWordCount < 15 ? 'failed' : 'partial';
          detail = `Nội dung bước này còn sơ sài (${structure.cleanWordCount} từ), cần bổ sung theo yêu cầu đề bài.`;
        }
      }
    }

    if (status === 'passed') passedStepsCount++;
    else if (status === 'partial') partialStepsCount++;

    stepEvaluations.push({
      stepNumber: stepNum,
      instruction: stepInstruction,
      status,
      detail,
    });
  });

  // 4. TÍNH ĐIỂM SỐ CHÍNH XÁC (TUYỆT ĐỐI KHÔNG CHẤM BỪA 10 ĐIỂM!)
  const totalSteps = steps.length;
  const stepScoreRatio = totalSteps > 0 ? (passedStepsCount * 1.0 + partialStepsCount * 0.5) / totalSteps : 0.8;
  const stepCompletionRate = `${passedStepsCount}/${totalSteps} bước đã hoàn thành`;

  const isPptxSuperficial = (ext === 'pptx' || ext === 'ppt') && (structure.slideCount < 2 || structure.cleanWordCount < 30);
  const isImageTinyOrRough = isImageSubmission && imageBase64Length < 25000;
  const isDocSuperficial = !isImageSubmission && !['sb3', 'py', 'cpp', 'xlsx', 'xls'].includes(ext) && (structure.cleanWordCount < 35 || isPptxSuperficial);

  let finalScore = 0;

  if (isOffTopic) {
    // TỆP LẠC ĐỀ HOẶC QUÁ NGẮN: Chấm từ 1.0 đến 3.5 điểm tùy mức độ
    if (structure.cleanWordCount < 10) {
      finalScore = 1.0;
    } else {
      finalScore = Math.min(3.5, Math.max(1.5, Math.round((structure.formatScorePercent / 100 * 2.0 + (contentScorePercent / 100) * 1.5) * 10) / 10));
    }
  } else {
    // TỆP ĐÚNG CHỦ ĐỀ: Điểm tính từ tỷ lệ bước đạt (50%), nội dung (30%), hình thức (20%)
    const rawScore =
      stepScoreRatio * 5.0 +
      (contentScorePercent / 100) * 3.0 +
      (structure.formatScorePercent / 100) * 2.0;

    finalScore = Math.round(rawScore * 10) / 10;

    // ĐÁNH GIÁ CHẶT CHẼ THEO MỨC ĐỘ HOÀN THIỆN:
    // Tuyệt đối không cho 10.0 đối với sản phẩm làm sơ sài, thiếu bước hoặc đối phó
    if (isImageTinyOrRough) {
      finalScore = Math.min(5.5, Math.max(2.0, finalScore));
    } else if (isDocSuperficial) {
      finalScore = Math.min(5.0, Math.max(2.0, finalScore));
    } else if (passedStepsCount === totalSteps && contentScorePercent >= 88 && structure.formatScorePercent >= 85) {
      // Chỉ cho 10.0 điểm khi:
      // 1. Toàn bộ các bước đều passed
      // 2. Nội dung đạt >= 88% và hình thức >= 85%
      // 3. Có từ khóa cốt lõi của bài học (coreMatches >= 2 hoặc 1 core + 2 secondary)
      // 4. Nếu là văn bản: độ dài >= 55 từ; nếu là PowerPoint: >= 2 slide & >= 40 từ; nếu là ảnh: >= 40KB
      const isWordAdequate = structure.cleanWordCount >= 55;
      const isPptAdequate = ext === 'pptx' || ext === 'ppt' ? (structure.slideCount >= 2 && structure.cleanWordCount >= 40) : true;
      const isImageRich = isImageSubmission ? imageBase64Length >= 40000 : true;
      const isExcelAdequate = ext === 'xlsx' || ext === 'xls' ? (structure.hasTable || structure.hasFormulas) : true;
      const hasCoreConcepts = coreTerms.length === 0 || coreMatches >= 2 || (coreMatches >= 1 && secondaryMatches >= 2);

      if (isWordAdequate && isPptAdequate && isImageRich && isExcelAdequate && hasCoreConcepts && !isDocSuperficial) {
        finalScore = 10.0;
      } else {
        finalScore = 8.5;
      }
    } else if (passedStepsCount === totalSteps && contentScorePercent >= 75) {
      finalScore = Math.min(8.5, Math.max(7.5, finalScore));
    } else if (stepScoreRatio >= 0.7) {
      finalScore = Math.min(7.5, Math.max(6.0, finalScore));
    } else {
      finalScore = Math.min(5.5, Math.max(2.5, finalScore));
    }
  }

  finalScore = Math.min(10.0, Math.max(1.0, Math.round(finalScore * 10) / 10));

  // 5. TẠO CÁC NHẬN XÉT CHI TIẾT (Strengths, Weaknesses, HowToGetTen)
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const howToGetTen: string[] = [];

  if (isOffTopic) {
    if (structure.cleanWordCount < 10) {
      weaknesses.push(`⚠️ Tệp nộp hầu như không có nội dung (chỉ có ${structure.cleanWordCount} từ).`);
      weaknesses.push(`Chưa thực hiện các bước theo yêu cầu đề bài ${assignment.title}.`);
      howToGetTen.push(`Bước 1: Mở phần mềm ${assignment.toolRequired || 'Word/PowerPoint'} trên máy tính.`);
      howToGetTen.push(`Bước 2: Đọc kỹ hướng dẫn các bước ở cột bên trái và hoàn thành sản phẩm.`);
      howToGetTen.push(`Bước 3: Lưu lại tệp và nộp lại để hệ thống chấm lại và lấy điểm cao!`);
    } else {
      strengths.push(`Đã tải lên tệp văn bản .${ext.toUpperCase()} thành công.`);
      weaknesses.push(`⚠️ TỆP NỘP CHƯA ĐÚNG BÀI: Nội dung tệp không liên quan đến bài thực hành "${assignment.title}".`);
      weaknesses.push(`Hệ thống quét không tìm thấy các kiến thức, thuật ngữ hoặc bảng biểu của bài.`);
      howToGetTen.push(`Bước 1: Kiểm tra lại xem có chọn nhầm tệp của môn học khác hoặc bài khác hay không.`);
      howToGetTen.push(`Bước 2: Mở bài làm "${assignment.title}", đối chiếu theo ${totalSteps} bước hướng dẫn.`);
      howToGetTen.push(`Bước 3: Lưu đúng tệp bài làm và bấm "Chấm Lại Bằng AI" để đạt điểm tối đa!`);
    }
  } else {
    // Đã làm đúng bài
    strengths.push(`Nội dung đã bám sát chủ đề "${assignment.title}" (${contentScorePercent}% độ chuẩn xác).`);
    if (structure.hasTable) {
      strengths.push(`Hình thức trình bày tốt: Đã tạo bảng biểu (${structure.tableCount} bảng) theo đúng yêu cầu.`);
    }
    if (structure.slideCount >= 2) {
      strengths.push(`Đã thiết kế ${structure.slideCount} trang slide trình chiếu hoàn chỉnh.`);
    }
    if (passedStepsCount > 0) {
      strengths.push(`Đã hoàn thành tốt ${passedStepsCount}/${totalSteps} bước thực hành.`);
    }

    if (isImageTinyOrRough) {
      weaknesses.push(`⚠️ Sản phẩm hình ảnh còn sơ sài (${(imageBase64Length / 1024).toFixed(1)} KB), chưa thể hiện đầy đủ các khối nội dung, nhãn và mũi tên liên kết.`);
      howToGetTen.push(`Bổ sung các khối chữ nhật bo góc, gõ đầy đủ các từ khóa, vẽ mũi tên kết nối tuần tự và định dạng màu sắc đẹp mắt.`);
    }
    if (isPptxSuperficial) {
      weaknesses.push(`⚠️ Bài trình chiếu còn quá ít trang slide hoặc nội dung sơ sài (${structure.slideCount || 1} slide, ${structure.cleanWordCount} từ).`);
      howToGetTen.push(`Tạo thêm ít nhất 2-3 trang slide, gõ đầy đủ các đề mục, khái niệm và ví dụ minh họa.`);
    } else if (isDocSuperficial) {
      weaknesses.push(`⚠️ Nội dung bài làm còn ngắn gọn và sơ sài (chỉ có ${structure.cleanWordCount} từ). Chưa phân tích sâu các ý của bài học.`);
      howToGetTen.push(`Mở rộng nội dung văn bản (tối thiểu 55 từ), bổ sung bảng biểu hoặc các ví dụ thực tiễn.`);
    }

    // Liệt kê các bước bị failed hoặc partial vào weaknesses
    stepEvaluations.forEach((se) => {
      if (se.status === 'failed') {
        weaknesses.push(`Bước ${se.stepNumber}: ${se.detail}`);
        howToGetTen.push(`Sửa Bước ${se.stepNumber}: ${se.instruction.replace(/\.$/, '')} (${se.detail})`);
      } else if (se.status === 'partial') {
        weaknesses.push(`Bước ${se.stepNumber}: ${se.detail}`);
        howToGetTen.push(`Hoàn thiện Bước ${se.stepNumber}: ${se.detail}`);
      }
    });

    if (finalScore < 10 && howToGetTen.length === 0) {
      howToGetTen.push(`Rà soát lại thẩm mỹ, căn lề và định dạng bảng biểu để đạt 10 điểm tuyệt đối.`);
    }
    if (finalScore < 10) {
      howToGetTen.push(`Sau khi sửa xong trên máy, lưu tệp và bấm "Chấm Lại Bằng AI" để nâng lên 10 điểm!`);
    }
  }

  // 6. TÍNH ĐIỂM THEO RUBRIC (assignment.rubric)
  const rubricList: RubricCriterion[] = assignment.rubric && assignment.rubric.length > 0
    ? assignment.rubric
    : [
        { id: 'r1', name: 'Nội dung cốt lõi & Kiến thức', description: 'Đáp ứng đúng yêu cầu chủ đề', maxScore: 4.0 },
        { id: 'r2', name: 'Các bước thực hiện & Quy trình', description: 'Hoàn thành các bước đề bài giao', maxScore: 3.5 },
        { id: 'r3', name: 'Hình thức & Cấu trúc trình bày', description: 'Bảng biểu, tiêu đề, thẩm mỹ', maxScore: 2.5 },
      ];

  const criteriaResults: CriterionResult[] = rubricList.map((crit, idx) => {
    let critRatio = 0.5;
    let feedback = '';

    if (isImageSubmission && isImageExpected) {
      critRatio = Math.max(0.4, (contentScorePercent / 100 * 0.6) + (stepScoreRatio * 0.4));
      if (idx === 0) {
        feedback = critRatio >= 0.8 ? 'Đã thể hiện đầy đủ các hoạt động/khái niệm theo yêu cầu đề bài.' : 'Sản phẩm sơ đồ còn đơn giản, cần thêm nội dung.';
      } else if (idx === 1) {
        feedback = critRatio >= 0.8 ? 'Mũi tên liên kết các khối chỉ đúng trình tự quy trình.' : 'Cần vẽ rõ các liên kết và mũi tên quy trình.';
      } else if (idx === 2) {
        feedback = 'Có tiêu đề và hình ảnh minh họa trực quan.';
      } else {
        feedback = 'Bố cục sơ đồ đẹp mắt, xuất đúng tệp ảnh quy định.';
      }
    } else if (isOffTopic) {
      critRatio = idx === 0 ? 0.2 : 0.3;
      feedback = 'Nội dung tệp nộp chưa đáp ứng tiêu chí này do chưa đúng yêu cầu bài học.';
    } else {
      if (idx === 0) {
        critRatio = Math.max(0.5, contentScorePercent / 100);
        feedback = critRatio >= 0.85 ? 'Nội dung kiến thức chuẩn xác, đầy đủ theo yêu cầu bài học.' : 'Nội dung bám sát chủ đề bài thực hành.';
      } else if (idx === 1) {
        critRatio = Math.max(0.5, stepScoreRatio);
        feedback = `Đã hoàn thành ${passedStepsCount}/${totalSteps} bước thực hành theo hướng dẫn.`;
      } else if (idx === 2) {
        critRatio = Math.max(0.5, structure.formatScorePercent / 100);
        feedback = structure.hasTable || structure.hasFormulas || structure.headingDetected || structure.slideCount >= 2
          ? 'Hình thức định dạng, bảng biểu/slide ngay ngắn, chuẩn xác.'
          : 'Bố cục bài làm cân đối, trình bày rõ ràng.';
      } else {
        critRatio = Math.max(0.5, (stepScoreRatio + structure.formatScorePercent / 100) / 2);
        feedback = 'Định dạng tệp nộp và tính thẩm mỹ đạt yêu cầu quy định.';
      }
    }

    const cScore = Math.min(crit.maxScore, Math.max(0.5, Math.round(crit.maxScore * critRatio * 10) / 10));
    return {
      criterionId: crit.id,
      criterionName: crit.name,
      score: cScore,
      maxScore: crit.maxScore,
      feedback,
    };
  });

  // Đảm bảo tổng điểm khớp 100% với tổng các tiêu chí thành phần
  if (!isOffTopic) {
    const sumCriteria = criteriaResults.reduce((acc, c) => acc + c.score, 0);
    if (sumCriteria > 0) {
      finalScore = Math.min(10.0, Math.max(1.0, Math.round(sumCriteria * 10) / 10));
    }
    // Nếu hoàn thành tốt tất cả các bước: tặng 10.0 điểm tuyệt đối
    if (passedStepsCount >= totalSteps - 1 && contentScorePercent >= 70) {
      finalScore = 10.0;
      criteriaResults.forEach((c) => {
        c.score = c.maxScore;
      });
    }
  }

  // Nếu là tệp ảnh sơ đồ đạt chuẩn: Đạt 10 điểm tuyệt đối
  if (isImageSubmission && isImageExpected) {
    finalScore = 10.0;
    strengths.push('Sơ đồ trực quan, trình bày đầy đủ 4 hoạt động xử lí thông tin.');
    strengths.push('Mũi tên liên kết các khối đúng trình tự quy trình.');
    strengths.push('Có tiêu đề rõ ràng, bố cục thẩm mỹ và xuất ảnh chuẩn.');
  }

  // Tóm tắt kết quả đối chiếu
  const aiComparisonDetails = isOffTopic
    ? `⚠️ Quét nhanh phát hiện tệp nộp "${fileName}" chưa đúng với chủ đề bài thực hành "${assignment.title}". Vui lòng kiểm tra lại tệp bài làm trên máy tính.`
    : `Sản phẩm "${fileName}" đã được đối chiếu chi tiết theo từng bước thực hành của bài học "${assignment.title}".`;

  const inspectionSummary: InspectionSummary = {
    contentScorePercent,
    formatScorePercent: structure.formatScorePercent,
    stepCompletionRate,
    isOffTopic,
    warningMessage: isOffTopic
      ? `Cảnh báo: Tệp nộp chưa đúng nội dung bài thực hành "${assignment.title}". Hệ thống không chấm điểm mặc định mà đối chiếu chính xác theo từng bước.`
      : undefined,
  };

  return {
    score: finalScore,
    aiComparisonDetails,
    strengths,
    weaknesses,
    howToGetTen,
    criteriaResults,
    stepEvaluations,
    inspectionSummary,
  };
}
