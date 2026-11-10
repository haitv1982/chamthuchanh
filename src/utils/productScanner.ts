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

// Trích xuất các từ khóa đặc trưng cho bài thực hành từ mục tiêu và kiến thức cốt lõi
function extractTargetKeywords(assignment: Assignment): {
  coreTerms: string[];
  secondaryTerms: string[];
} {
  const normTitle = normalizeVi(assignment.title);
  const normId = normalizeVi(assignment.id);
  const subjectType = assignment.subjectType;

  const coreTerms: string[] = [];
  const secondaryTerms: string[] = [];

  // ==================== KHỐI LỚP 9 ====================
  // TH9_SP01: Đánh giá độ tin cậy của thông tin trên Internet
  if (normId.includes('th9-sp01') || (normTitle.includes('do tin cay') && normTitle.includes('thong tin'))) {
    coreTerms.push('nguon 1', 'nguon 2', 'tac gia', 'ngay dang', 'duong dan', 'url', 'tham quyen', 'bang chung', 'cap nhat', 'so sanh', 'ket luan', 'tin cay');
    secondaryTerms.push('monre', 'who', 'chinh phu', 'doi chieu', 'thoi diem', 'bai viet', 'blog', 'mang xa hoi', 'dien dan', 'rac thai', 'vi nhua', 'suc khoe', 'kiem chung', 'chinh xac');
  }
  // TH9_SP02: Thiết kế infographic an toàn và văn hóa số
  else if (normId.includes('th9-sp02') || (normTitle.includes('infographic') && normTitle.includes('an toan'))) {
    coreTerms.push('infographic', 'an toan so', 'van hoa mang', 'thong tin ca nhan', 'mat khau', 'lua dao', 'canh giac', 'quy tac');
    secondaryTerms.push('khuyen cao', 'bieu tuong', 'hinh anh', 'khong gian mang', 'ung xu', 'bao ve');
  }
  // TH9_SP03: Bảo vệ dữ liệu cá nhân
  else if (normId.includes('th9-sp03') || (normTitle.includes('bao ve') && normTitle.includes('du lieu'))) {
    coreTerms.push('bao ve du lieu', 'sao luu', 'backup', 'ma hoa', 'xac thuc 2 buoc', '2fa', 'quyen rieng tu');
    secondaryTerms.push('dam may', 'cloud', 'o cung ngoai', 'phuc hoi', 'nguy co', 'mat du lieu');
  }
  // TH9_SP04: Sử dụng tài nguyên số đúng bản quyền
  else if (normId.includes('th9-sp04') || normTitle.includes('ban quyen')) {
    coreTerms.push('ban quyen', 'so huu tri tue', 'creative commons', 'giay phep', 'trich dan', 'nguon');
    secondaryTerms.push('tac gia', 'dao van', 'su dung hop phap', 'cc by', 'giay phep mo');
  }
  // TH9_SP05: Khám phá phần mềm mô phỏng
  else if (normId.includes('th9-sp05') || normTitle.includes('mo phong')) {
    coreTerms.push('mo phong', 'phet', 'geogebra', 'thi nghiem', 'thong so', 'quan sat', 'ket luan');
    secondaryTerms.push('bien so', 'ket qua', 'do dac', 'vat ly', 'hoa hoc', 'toan hoc');
  }
  // TH9_SP06: Tạo sơ đồ tư duy theo chủ đề
  else if (normId.includes('th9-sp06') || normTitle.includes('so do tu duy')) {
    coreTerms.push('so do tu duy', 'chu de', 'nhanh chinh', 'nhanh phu', 'tu khoa', 'mindmap');
    secondaryTerms.push('mau sac', 'bieu tuong', 'lien ket', 'tong hop', 'kien thuc');
  }
  // TH9_SP07: Thiết kế ấn phẩm số
  else if (normId.includes('th9-sp07') || normTitle.includes('an pham so')) {
    coreTerms.push('an pham so', 'to roi', 'poster', 'banner', 'thiet ke', 'canva', 'thong diep');
    secondaryTerms.push('bo cuc', 'mau sac', 'phong chu', 'tieu de', 'hinh anh');
  }
  // TH9_SP08: Biên tập video ngắn
  else if (normId.includes('th9-sp08') || normTitle.includes('video')) {
    coreTerms.push('video', 'bien tap', 'cat ghep', 'am thanh', 'phu de', 'hieu ung', 'chuyen canh');
    secondaryTerms.push('capcut', 'thoi luong', 'hinh anh', 'xuat video', 'am nhac');
  }
  // TH9_SP09: Bảng tính thống kê nâng cao
  else if (normId.includes('th9-sp09') || normTitle.includes('thong ke nang cao')) {
    coreTerms.push('countif', 'sumif', 'vlookup', 'ham thong ke', 'bang tinh', 'dieu kien');
    secondaryTerms.push('vung du lieu', 'tieu chi', 'ket qua', 'thong ke', 'doanh thu', 'xep loai');
  }
  // TH9_SP10: Trực quan hóa dữ liệu bằng biểu đồ
  else if (normId.includes('th9-sp10') || normTitle.includes('bieu do')) {
    coreTerms.push('bieu do', 'cot', 'tron', 'duong', 'chart', 'ti le', 'truc quan');
    secondaryTerms.push('chu giai', 'tieu de bieu do', 'truc tung', 'truc hoanh', 'so lieu');
  }
  // TH9_SP11: Thuật toán tìm kiếm
  else if (normId.includes('th9-sp11') || normTitle.includes('tim kiem')) {
    coreTerms.push('tim kiem', 'tuan tu', 'nhi phan', 'sequential', 'binary search', 'so sanh');
    secondaryTerms.push('danh sach', 'vi tri', 'khoa tim kiem', 'buoc lap', 'sap xep truoc');
  }
  // TH9_SP12: Thuật toán sắp xếp
  else if (normId.includes('th9-sp12') || normTitle.includes('sap xep')) {
    coreTerms.push('sap xep', 'noi bot', 'chon', 'chen', 'bubble sort', 'selection sort', 'insertion sort');
    secondaryTerms.push('hoan doi', 'tang dan', 'giam dan', 'so sanh', 'mang');
  }
  // TH9_SP13: Trò chơi trắc nghiệm tính điểm
  else if (normId.includes('th9-sp13') || normTitle.includes('tro choi trac nghiem')) {
    coreTerms.push('tro choi', 'trac nghiem', 'cau hoi', 'dap an', 'tinh diem', 'scratch', 'bien so');
    secondaryTerms.push('tra loi', 'dung', 'sai', 'thong bao', 'thang cuoc', 'choi lai');
  }
  // TH9_SP14: Kiểm thử và gỡ lỗi chương trình
  else if (normId.includes('th9-sp14') || normTitle.includes('kiem thu') || normTitle.includes('go loi')) {
    coreTerms.push('kiem thu', 'go loi', 'test case', 'debug', 'loi cu phap', 'loi logic');
    secondaryTerms.push('ket qua mong doi', 'ket qua thuc te', 'sua loi', 'truong hop bien');
  }

  // ==================== KHỐI LỚP 8 ====================
  else if (normId.includes('th8-sp01') || (normTitle.includes('danh gia') && normTitle.includes('chat luong'))) {
    coreTerms.push('nguon goc', 'cap nhat', 'bang chung', 'thong nhat', 'ket luan', 'tin cay');
    secondaryTerms.push('tuoitre', 'nguon 1', 'nguon 2', 'so sanh', 'kiem chung');
  } else if (normId.includes('th8-sp02') || (normTitle.includes('bao ve') && normTitle.includes('ca nhan'))) {
    coreTerms.push('mat khau', 'cccd', 'tai khoan', 'lo lot', 'bao ve');
    secondaryTerms.push('nguy co', 'bien phap', 'an toan', 'du lieu');
  }

  // ==================== KHỐI LỚP 7 ====================
  else if (normId.includes('th7-sp01') || (normTitle.includes('thiet bi') && normTitle.includes('vao'))) {
    coreTerms.push('thiet bi vao', 'thiet bi ra', 'ban phim', 'chuot', 'man hinh', 'may in');
    secondaryTerms.push('micro', 'may quet', 'loa', 'may chieu', 'chuc nang', 'phan loai');
  } else if (normId.includes('th7-sp02') || (normTitle.includes('phan mem') && normTitle.includes('he dieu hanh'))) {
    coreTerms.push('he dieu hanh', 'phan mem ung dung', 'windows', 'linux', 'android', 'word');
    secondaryTerms.push('trinh chieu', 'khai niem', 'vi du', 'powerpoint', 'ung dung');
  }

  // ==================== KHỐI LỚP 6 ====================
  else if (normId === 'sp01-so-do-xu-li-thong-tin' || (normTitle.includes('quy trinh') && normTitle.includes('thong tin'))) {
    coreTerms.push('thu nhan', 'xu li', 'luu tru', 'truyen thong tin', 'quy trinh');
    secondaryTerms.push('so do', 'thong tin', 'vi du', 'dau vao', 'dau ra', 'mui ten');
  } else if (normId.includes('sp02') || normTitle.includes('thu muc')) {
    coreTerms.push('tinhoc6', 'baitap', 'hinhanh', 'vanban', 'sanpham');
    secondaryTerms.push('gioithieu.txt', 'file explorer', 'folder', 'thu muc con', 'documents');
  } else if (normId.includes('sp03') || normTitle.includes('mang may tinh')) {
    coreTerms.push('router', 'dinh tuyen', 'internet', 'may tinh', 'laptop');
    secondaryTerms.push('may in', 'tablet', 'ket noi', 'khong day', 'co day');
  } else if (normId.includes('sp04') || normTitle.includes('internet an toan')) {
    coreTerms.push('mat khau', 'thong tin ca nhan', 'lien ket la', 'kiem tra', 'nguoi lon');
    secondaryTerms.push('5 nguyen tac', 'an toan', 'poster', 'canh giac', 'chia se');
  } else if (normId.includes('sp05') || normTitle.includes('tim kiem')) {
    coreTerms.push('tu khoa', 'nguon', 'duong dan', 'url', 'danh gia');
    secondaryTerms.push('google', 'tim kiem', 'noi dung', 'tin cay', 'doc sach', 'moi truong');
  } else if (normId.includes('sp06') || normTitle.includes('thu dien tu')) {
    coreTerms.push('nguoi nhan', 'tieu de', 'kinh gui', 'dinh kem', 'cam on');
    secondaryTerms.push('email', 'gmail', 'soan thu', 'chu ky', 'noi dung');
  } else if (normId.includes('sp07') || normTitle.includes('cong dan so')) {
    coreTerms.push('ung xu van minh', 'thong tin ca nhan', 'tai khoan', 'ban quyen', 'nguy hiem');
    secondaryTerms.push('cam nang', 'mat khau', 'vi du', 'quy tac', 'an toan');
  }

  // ==================== CÁC CÔNG CỤ / THỂ LOẠI CHUYÊN BIỆT ====================
  if (subjectType === 'scratch' || normId.includes('scratch') || normId.includes('sb3')) {
    if (!coreTerms.includes('khoi lenh')) coreTerms.push('nhan vat', 'san khau', 'khoi lenh', 'lap', 're nhanh', 'bien so');
    secondaryTerms.push('scratch', 'sprite', 'stage', 'diem', 'tra loi', 'su kien', 'neu', 'thi', 'lap lai');
  } else if (subjectType === 'python' || normId.includes('py')) {
    if (!coreTerms.includes('print')) coreTerms.push('input', 'int', 'for', 'while', '%', 'print');
    secondaryTerms.push('range', 'nguyen to', 'uoc', 'if', 'else', 'def', 'return');
  } else if (subjectType === 'excel' || normTitle.includes('bang tinh') || normTitle.includes('excel')) {
    if (!coreTerms.includes('bang tinh')) coreTerms.push('average', 'if', 'sum', 'rank', 'diem', 'bang tinh', 'cot', 'hang');
    secondaryTerms.push('trung binh', 'xep loai', 'cong thuc', 'max', 'min', 'countif', 'bieu do', 'sap xep', 'loc');
  } else if (subjectType === 'powerpoint' || normTitle.includes('trinh chieu')) {
    if (coreTerms.length === 0) coreTerms.push('slide', 'trang', 'tieu de', 'noi dung');
    secondaryTerms.push('trinh chieu', 'powerpoint', 'smartart', 'hinh anh', 'lien ket', 'chuyen dong');
  }

  // Bổ sung cụm từ dài (>= 8 ký tự, 2 từ trở lên) từ yêu cầu và mẫu chuẩn
  if (assignment.requirements && assignment.requirements.length > 0) {
    assignment.requirements.forEach((req) => {
      const clean = normalizeVi(req);
      const chunks = clean.split(/[,:;→\-\.]+/);
      chunks.forEach((c) => {
        const item = c.trim();
        if (item.length >= 8 && item.length <= 30 && item.includes(' ') && !secondaryTerms.includes(item)) {
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
      if (lineTrim.length >= 6 && lineTrim.length <= 35 && lineTrim.includes(' ') && !secondaryTerms.includes(lineTrim)) {
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
    .replace(/\[NỘI DUNG VĂN BẢN WORD.*?\]/gi, ' ')
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

// Hàm quét cấu trúc văn bản/tệp (Hình thức và chiều sâu nội dung)
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
  hasSources: boolean;
  hasComparison: boolean;
  hasConclusion: boolean;
  isSuperficial: boolean;
  formatScorePercent: number;
  structuralNotes: string[];
} {
  const { fileName, fileContent = '', subjectType } = params;
  const content = fileContent;
  const lowerContent = content.toLowerCase();
  const normContent = normalizeVi(content);
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const { cleanText, cleanWordCount, slideCount } = extractCleanStudentText(content);
  const words = cleanText.split(/\s+/).filter(Boolean);

  const structuralNotes: string[] = [];
  let formatScorePercent = 50;

  // 1. Kiểm tra bảng biểu (Tables)
  const hasTableTags = content.includes('<table') || content.includes('[BẢNG') || content.includes('| ---') || content.includes('|:---');
  const pipeTableLines = content.split('\n').filter((l) => l.trim().startsWith('|') && l.trim().endsWith('|'));
  const hasTextTable = pipeTableLines.length >= 2;
  const hasTableIndicators =
    (normContent.includes('cot') && normContent.includes('hang') && (normContent.includes('bang') || normContent.includes('stt'))) ||
    (normContent.includes('bang so sanh') || normContent.includes('bang doi chieu'));
  const hasTable = hasTableTags || hasTextTable || hasTableIndicators || content.includes('border=') || content.includes('grid');

  let tableCount = 0;
  if (hasTableTags) {
    tableCount = Math.max(1, (content.match(/<table/g) || []).length);
  } else if (hasTextTable || hasTable) {
    tableCount = 1;
  }

  // 2. Tiêu đề
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

  // 3. Đoạn văn
  const paragraphCount = Math.max(1, cleanText.split(/\n\s*\n/).length);

  // 4. Công thức Excel
  const hasFormulas =
    lowerContent.includes('average(') ||
    lowerContent.includes('if(') ||
    lowerContent.includes('sum(') ||
    lowerContent.includes('rank(') ||
    lowerContent.includes('countif(') ||
    lowerContent.includes('sumif(') ||
    lowerContent.includes('vlookup(') ||
    lowerContent.includes('=');

  // 5. Kiểm tra Nguồn thông tin (Sources / URLs)
  const hasSources =
    normContent.includes('http') ||
    normContent.includes('www.') ||
    normContent.includes('.gov') ||
    normContent.includes('.vn') ||
    normContent.includes('.com') ||
    normContent.includes('.org') ||
    normContent.includes('nguon 1') ||
    normContent.includes('nguon 2') ||
    normContent.includes('duong dan') ||
    normContent.includes('tac gia') ||
    normContent.includes('ngay dang');

  // 6. Kiểm tra Bảng so sánh / Đối chiếu
  const hasComparison =
    normContent.includes('so sanh') ||
    normContent.includes('doi chieu') ||
    normContent.includes('tieu chi') ||
    normContent.includes('tham quyen') ||
    normContent.includes('bang chung') ||
    normContent.includes('cap nhat') ||
    normContent.includes('thoi diem');

  // 7. Kiểm tra Kết luận có căn cứ
  const hasConclusion =
    normContent.includes('ket luan') ||
    normContent.includes('danh gia') ||
    normContent.includes('tin cay') ||
    normContent.includes('dang tin cay') ||
    normContent.includes('vi vay') ||
    normContent.includes('do do');

  // 8. Đánh giá tính chất Sơ sài / Đối phó
  let isSuperficial = false;
  if (ext === 'pptx' || ext === 'ppt') {
    // Tệp PowerPoint: nếu chỉ có 1 slide hoặc dưới 25 từ -> Sơ sài
    if (slideCount <= 1 || cleanWordCount < 25) {
      isSuperficial = true;
    }
  } else if (!['png', 'jpg', 'jpeg', 'webp', 'bmp', 'svg', 'sb3'].includes(ext)) {
    // Tệp Word hoặc văn bản: nếu dưới 30 từ -> Sơ sài
    if (cleanWordCount < 30) {
      isSuperficial = true;
    }
  }

  // Đánh giá formatScorePercent
  if (ext === 'pptx' || ext === 'ppt') {
    if (slideCount === 0 && cleanWordCount < 15) {
      formatScorePercent = 20;
      structuralNotes.push('Bài trình chiếu trống hoặc hầu như không có chữ.');
    } else if (isSuperficial) {
      formatScorePercent = 35;
      structuralNotes.push(`Bài trình chiếu quá ngắn (chỉ có ${Math.max(1, slideCount)} slide, ${cleanWordCount} từ), chưa đạt chuẩn trình chiếu.`);
    } else if (slideCount >= 3 && cleanWordCount >= 50) {
      formatScorePercent = 90;
      structuralNotes.push(`Bài trình chiếu hoàn chỉnh gồm ${slideCount} trang slide với bố cục rõ ràng.`);
    } else {
      formatScorePercent = 65;
      structuralNotes.push(`Đã tạo ${slideCount || 2} trang slide trình chiếu.`);
    }
  } else if (cleanWordCount < 10 && !['png', 'jpg', 'jpeg', 'webp', 'bmp', 'svg', 'sb3'].includes(ext)) {
    structuralNotes.push('Tệp nộp có dung lượng văn bản quá ít (dưới 10 từ).');
    formatScorePercent = 20;
  } else if (isSuperficial) {
    structuralNotes.push(`Nội dung văn bản còn sơ sài (chỉ có ${cleanWordCount} từ).`);
    formatScorePercent = 35;
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
    if (cleanWordCount >= 50) {
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
    hasSources,
    hasComparison,
    hasConclusion,
    isSuperficial,
    formatScorePercent,
    structuralNotes,
  };
}

// ĐỘNG CƠ CHẤM ĐIỂM VÀ ĐỐI CHIẾU SÂU TỪNG BƯỚC & TIÊU CHÍ RUBRIC
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

  // Kiểm tra nếu đây là sản phẩm nộp dạng HÌNH ẢNH ĐỒ HỌA HỢP LỆ (SP01 Lớp 6, Sơ đồ tư duy, Poster...)
  // TUYỆT ĐỐI KHÔNG COI POWERPOINT LÀ ẢNH! PowerPoint là tệp trình chiếu văn bản/slide.
  const isImageSubmission = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'svg'].includes(ext);
  const isImageExpected = Boolean(
    assignment.id === 'sp01-so-do-xu-li-thong-tin' ||
    assignment.id.includes('so-do-tu-duy') ||
    assignment.id.includes('infographic') ||
    assignment.id.includes('poster') ||
    assignment.subjectType === 'canva' ||
    assignment.targetFile?.match(/\.(png|jpg|jpeg|webp|svg)$/i)
  );

  // Tính tỷ lệ liên quan nội dung (0 - 100%)
  let contentScorePercent = 0;
  let isOffTopic = false;
  const imageBase64Length = (imageBase64 || '').length;

  if (isImageSubmission && isImageExpected) {
    // TỆP HÌNH ẢNH SƠ ĐỒ / SẢN PHẨM ĐỒ HỌA:
    if (imageBase64Length < 10000) {
      contentScorePercent = 25;
      structure.formatScorePercent = 30;
    } else if (imageBase64Length < 35000) {
      contentScorePercent = 60;
      structure.formatScorePercent = 65;
    } else if (imageBase64Length < 70000) {
      contentScorePercent = 80;
      structure.formatScorePercent = 82;
    } else {
      contentScorePercent = 92;
      structure.formatScorePercent = 92;
    }
  } else {
    const totalCore = coreTerms.length;
    if (totalCore > 0) {
      const coreRatio = coreMatches / totalCore;
      const secondaryBonus = Math.min(25, secondaryMatches * 5);
      contentScorePercent = Math.round(coreRatio * 75 + secondaryBonus);

      // Phát hiện tệp quá sơ sài / làm đối phó / tệp rỗng / lạc đề
      if (structure.cleanWordCount < 10 && !['png', 'jpg', 'jpeg', 'sb3'].includes(ext)) {
        isOffTopic = true;
        contentScorePercent = 10;
      } else if (structure.isSuperficial) {
        // Tệp làm đối phó, quá ngắn hoặc chỉ có 1 slide
        contentScorePercent = Math.min(25, contentScorePercent);
      } else if (structure.cleanWordCount < 40 && !['png', 'jpg', 'jpeg', 'sb3', 'xlsx'].includes(ext)) {
        contentScorePercent = Math.min(45, contentScorePercent);
      } else if (structure.cleanWordCount > 20 && coreMatches === 0 && secondaryMatches <= 1) {
        isOffTopic = true;
        contentScorePercent = Math.min(20, contentScorePercent);
      }
    } else {
      if (assignment.subjectType === 'python') {
        const hasPyOps = normContent.includes('input') || normContent.includes('print') || normContent.includes('for') || normContent.includes('def');
        contentScorePercent = hasPyOps ? (normContent.length > 150 ? 85 : 55) : 25;
        isOffTopic = !hasPyOps && structure.cleanWordCount > 10;
      } else if (assignment.subjectType === 'excel') {
        const hasFormulas = structure.hasFormulas;
        contentScorePercent = hasFormulas ? 85 : (structure.cleanWordCount > 30 ? 55 : 30);
      } else {
        contentScorePercent = structure.cleanWordCount > 80 ? 80 : (structure.cleanWordCount > 30 ? 55 : 25);
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
      if (imageBase64Length < 10000) {
        status = index === 0 ? 'partial' : 'failed';
        detail = `Ảnh sản phẩm quá nhỏ hoặc rỗng (${(imageBase64Length / 1024).toFixed(1)} KB), chưa đạt yêu cầu của bước này.`;
      } else if (imageBase64Length < 35000) {
        if (index === 0 || index === steps.length - 1) {
          status = 'passed';
          detail = `Đã xuất và nộp tệp ảnh sản phẩm (.${ext.toUpperCase()}).`;
        } else {
          status = 'partial';
          detail = `Sản phẩm sơ đồ còn đơn giản, cần bổ sung thêm chi tiết, nhãn văn bản và mũi tên liên kết.`;
        }
      } else {
        status = 'passed';
        detail = `Đã hoàn thành tốt yêu cầu của bước này trên sản phẩm sơ đồ đồ họa (${fileName}).`;
      }
    } else if (isOffTopic && structure.cleanWordCount < 10) {
      status = 'failed';
      detail = `Chưa thực hiện. Tệp nộp rỗng hoặc quá ngắn (${structure.cleanWordCount} từ), không có nội dung bước này.`;
    } else if (structure.isSuperficial) {
      // BÀI LÀM SƠ SÀI (Ví dụ: PowerPoint 1 slide có 1 dòng tiêu đề)
      if (normStep.includes('mo') || normStep.includes('khoi dong') || normStep.includes('tao tai lieu')) {
        status = 'passed';
        detail = `Đã khởi tạo tệp làm việc (.${ext.toUpperCase()}).`;
      } else if (normStep.includes('tieu de') && (structure.headingDetected || structure.cleanWordCount >= 4)) {
        status = 'passed';
        detail = `Đã gõ dòng tiêu đề bài làm.`;
      } else if (normStep.includes('nguon') || normStep.includes('hai trang web') || normStep.includes('trang web')) {
        status = structure.hasSources ? 'partial' : 'failed';
        detail = structure.hasSources
          ? `Đã nhắc đến nguồn nhưng chưa trích dẫn đầy đủ 2 nguồn độc lập.`
          : `Chưa trích dẫn ít nhất hai trang web/nguồn tin độc lập kèm thông tin tác giả, ngày đăng, URL.`;
      } else if (normStep.includes('bang') || normStep.includes('so sanh') || normStep.includes('doi chieu')) {
        status = 'failed';
        detail = `Chưa tạo bảng so sánh đối chiếu theo yêu cầu của bài.`;
      } else if (normStep.includes('ket luan')) {
        status = 'failed';
        detail = `Chưa có phần phân tích và kết luận đánh giá mức độ tin cậy.`;
      } else if (normStep.includes('slide') || normStep.includes('trinh chieu')) {
        status = 'failed';
        detail = `Bài trình chiếu quá ngắn (chỉ có ${Math.max(1, structure.slideCount)} slide, ${structure.cleanWordCount} từ). Cần tối thiểu 3-4 slide.`;
      } else {
        status = 'failed';
        detail = `Chưa thực hiện bước này do bài làm mới dừng lại ở mức khởi tạo sơ sài.`;
      }
    } else if (isOffTopic) {
      if (index === 0 && (normStep.includes('mo') || normStep.includes('tao tai lieu'))) {
        status = 'passed';
        detail = `Đã tạo tệp văn bản (${ext.toUpperCase()}).`;
      } else {
        status = 'failed';
        detail = `Chưa đạt. Tệp nộp lạc đề, không chứa nội dung hoặc yêu cầu của bước này.`;
      }
    } else {
      // Phân tích chi tiết từng loại bước theo từ khóa nghiệp vụ
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
      } else if (normStep.includes('nguon') || normStep.includes('trang web') || normStep.includes('hai trang')) {
        if (structure.hasSources && (normContent.includes('nguon 1') || normContent.includes('nguon 2') || (normContent.match(/http|\.vn|\.com|\.gov/g) || []).length >= 2)) {
          status = 'passed';
          detail = `Đã tìm kiếm và trích dẫn thông tin từ ít nhất hai nguồn độc lập kèm tác giả, ngày đăng và link.`;
        } else if (structure.hasSources) {
          status = 'partial';
          detail = `Đã có thông tin nguồn nhưng cần bổ sung đủ 2 nguồn tin độc lập và đầy đủ tác giả, ngày cập nhật.`;
        } else {
          status = 'failed';
          detail = `Chưa trích dẫn đủ 2 nguồn tin độc lập kèm thông tin tác giả, ngày đăng và đường dẫn URL.`;
        }
      } else if (normStep.includes('doi chieu') || normStep.includes('so sanh') || normStep.includes('bang so sanh') || normStep.includes('tao bang')) {
        if (structure.hasTable && structure.hasComparison) {
          status = 'passed';
          detail = `Đã lập bảng so sánh đối chiếu các tiêu chí tin cậy (thẩm quyền, bằng chứng, thời điểm).`;
        } else if (structure.hasTable || structure.hasComparison) {
          status = 'partial';
          detail = structure.hasTable
            ? `Đã có bảng biểu nhưng cần bổ sung các tiêu chí đối chiếu thẩm quyền, bằng chứng, tính cập nhật.`
            : `Đã có so sánh bằng lời nhưng chưa tạo bảng so sánh khoa học. Hãy dùng Insert -> Table.`;
        } else {
          status = 'failed';
          detail = `Chưa lập bảng so sánh đối chiếu các tiêu chí theo yêu cầu đề bài.`;
        }
      } else if (normStep.includes('ket luan')) {
        if (structure.hasConclusion && structure.cleanWordCount >= 40) {
          status = 'passed';
          detail = `Đã rút ra kết luận thuyết phục về mức độ tin cậy kèm lí giải xác đáng.`;
        } else if (structure.hasConclusion) {
          status = 'partial';
          detail = `Đã có kết luận nhưng cần phân tích sâu hơn lí do nguồn nào đáng tin cậy hơn.`;
        } else {
          status = 'failed';
          detail = `Chưa có phần kết luận đánh giá mức độ tin cậy của thông tin.`;
        }
      } else if (normStep.includes('tieu de') || normStep.includes('dat ten de muc')) {
        if (structure.headingDetected || normContent.includes('tieu de') || normContent.includes(normalizeVi(assignment.title.slice(5, 20)))) {
          status = 'passed';
          detail = `Đã có tiêu đề nổi bật theo yêu cầu bài học.`;
        } else {
          status = 'passed';
          detail = `Đã trình bày tiêu đề và nội dung bài làm.`;
        }
      } else if (normStep.includes('bang') || normStep.includes('cot') || normStep.includes('hang') || normStep.includes('table')) {
        if (structure.hasTable || ext === 'xlsx' || ext === 'xls') {
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
        if (structure.hasFormulas || normContent.includes('=') || normContent.includes('sum') || normContent.includes('average') || normContent.includes('if')) {
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
          if (slideCnt >= 3 && cleanWords >= 50 && (coreMatches >= 1 || secondaryMatches >= 1)) {
            status = 'passed';
            detail = `Đã xây dựng ${slideCnt} trang slide trình chiếu với đầy đủ tiêu đề và nội dung bài học.`;
          } else if (slideCnt >= 2 && cleanWords >= 30) {
            status = 'partial';
            detail = `Đã có ${slideCnt} trang slide, nên bổ sung thêm nội dung chi tiết để bài trình chiếu sinh động hơn.`;
          } else {
            status = 'failed';
            detail = `Bài trình chiếu quá sơ sài (chỉ có ${Math.max(1, slideCnt)} slide, ${cleanWords} từ). Cần tối thiểu 3-4 slide.`;
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
      } else if (normStep.includes('khoi lenh') || normStep.includes('nhan vat') || normStep.includes('san khau') || normStep.includes('scratch') || normStep.includes('thuat toan')) {
        if (normContent.includes('khoi lenh') || normContent.includes('nhan vat') || normContent.includes('sprite') || ext === 'sb3' || ext === 'py') {
          status = 'passed';
          detail = `Đã cài đặt thuật toán và các khối lệnh/cú pháp chính xác theo yêu cầu.`;
        } else {
          status = 'partial';
          detail = `Cần rà soát các khối lệnh rẽ nhánh và vòng lặp theo đúng kịch bản.`;
        }
      } else if (normStep.includes('dinh dang') || normStep.includes('phong chu') || normStep.includes('co chu') || normStep.includes('mau chu') || normStep.includes('can le')) {
        if (structure.cleanWordCount >= 30 || structure.headingDetected) {
          status = 'passed';
          detail = `Đã hoàn thành tốt định dạng văn bản, phông chữ và bố cục trang.`;
        } else {
          status = 'partial';
          detail = `Cần căn chỉnh lại kích thước chữ và lề trang cho đẹp mắt.`;
        }
      } else if (normStep.includes('luu tep') || normStep.includes('xuat anh') || normStep.includes('dung ten quy dinh') || normStep.includes('luu bai')) {
        // Kiểm tra đúng định dạng tệp yêu cầu
        const targetExt = assignment.targetFile?.split('.').pop()?.toLowerCase();
        if (targetExt && ext !== targetExt) {
          status = 'partial';
          detail = `Tệp đã lưu nhưng chưa đúng định dạng yêu cầu (Yêu cầu .${targetExt.toUpperCase()}, tệp nộp là .${ext.toUpperCase()}).`;
        } else {
          status = 'passed';
          detail = `Đã lưu tệp với định dạng hợp lệ (${fileName}).`;
        }
      } else {
        const stepWords = normStep.split(/\s+/).filter((w) => w.length >= 5 && !['thuc', 'hien', 'yeu', 'cau', 'theo', 'trong'].includes(w));
        const matchWords = stepWords.filter((w) => normContent.includes(w));
        const ratio = stepWords.length > 0 ? matchWords.length / stepWords.length : 1;
        const hasCoreOrSec = coreMatches >= 1 || secondaryMatches >= 1;

        if (ratio >= 0.4 && structure.cleanWordCount >= 35 && hasCoreOrSec) {
          status = 'passed';
          detail = `Đã hoàn thành tốt yêu cầu của bước này.`;
        } else if (ratio >= 0.25 || (structure.cleanWordCount >= 40 && hasCoreOrSec)) {
          status = 'partial';
          detail = `Đã làm một phần nhưng cần hoàn thiện thêm chi tiết.`;
        } else {
          status = structure.cleanWordCount < 20 ? 'failed' : 'partial';
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

  const totalSteps = steps.length;
  const stepScoreRatio = totalSteps > 0 ? (passedStepsCount * 1.0 + partialStepsCount * 0.5) / totalSteps : 0.8;
  const stepCompletionRate = `${passedStepsCount}/${totalSteps} bước đã hoàn thành`;

  // 4. ĐÁNH GIÁ CHI TIẾT THEO TIÊU CHÍ RUBRIC (assignment.rubric)
  const rubricList: RubricCriterion[] = assignment.rubric && assignment.rubric.length > 0
    ? assignment.rubric
    : [
        { id: 'r1', name: 'Nội dung cốt lõi & Kiến thức', description: 'Đáp ứng đúng yêu cầu chủ đề', maxScore: 4.0 },
        { id: 'r2', name: 'Các bước thực hiện & Quy trình', description: 'Hoàn thành các bước đề bài giao', maxScore: 3.5 },
        { id: 'r3', name: 'Hình thức & Cấu trúc trình bày', description: 'Bảng biểu, tiêu đề, thẩm mỹ', maxScore: 2.5 },
      ];

  const criteriaResults: CriterionResult[] = rubricList.map((crit) => {
    const normCritName = normalizeVi(crit.name);
    const normCritDesc = normalizeVi(crit.description);
    const combinedNorm = `${normCritName} ${normCritDesc}`;

    let score = 0;
    let feedback = '';

    if (isImageSubmission && isImageExpected) {
      const ratio = contentScorePercent / 100;
      score = Math.round(crit.maxScore * ratio * 10) / 10;
      feedback = ratio >= 0.8
        ? 'Sản phẩm sơ đồ hoàn chỉnh, thể hiện tốt yêu cầu tiêu chí này.'
        : 'Sơ đồ còn đơn giản, cần vẽ thêm chi tiết và hoàn thiện nội dung.';
    } else if (structure.cleanWordCount < 10) {
      score = Math.min(0.5, Math.round(crit.maxScore * 0.1 * 10) / 10);
      feedback = 'Tệp nộp hầu như không có nội dung, chưa đạt yêu cầu tiêu chí này.';
    } else if (structure.isSuperficial) {
      // BÀI LÀM SƠ SÀI (Ví dụ: PowerPoint 1 slide có 1 dòng tiêu đề)
      if (combinedNorm.includes('nguon') || combinedNorm.includes('tim kiem') || combinedNorm.includes('2 nguon')) {
        score = structure.hasSources ? 0.8 : 0.3;
        feedback = structure.hasSources
          ? 'Đã nhắc đến nguồn nhưng chưa trích dẫn đầy đủ 2 nguồn tin độc lập.'
          : 'Chưa trích dẫn 2 nguồn tin độc lập kèm tác giả, ngày đăng và link.';
      } else if (combinedNorm.includes('bang') || combinedNorm.includes('so sanh') || combinedNorm.includes('doi chieu')) {
        score = 0.3;
        feedback = 'Chưa tạo bảng so sánh đối chiếu các tiêu chí độ tin cậy.';
      } else if (combinedNorm.includes('ket luan') || combinedNorm.includes('can cu') || combinedNorm.includes('ly giai')) {
        score = 0.3;
        feedback = 'Chưa có phần phân tích và kết luận đánh giá nguồn thông tin.';
      } else if (combinedNorm.includes('hinh thuc') || combinedNorm.includes('van ban') || combinedNorm.includes('ten tep') || combinedNorm.includes('trinh bay')) {
        score = Math.min(crit.maxScore, 0.6);
        feedback = `Bài làm quá ngắn (${structure.cleanWordCount} từ, ${structure.slideCount || 1} slide), chưa đạt yêu cầu hình thức.`;
      } else {
        score = Math.min(crit.maxScore, Math.round(crit.maxScore * 0.25 * 10) / 10);
        feedback = 'Bài làm còn rất sơ sài, chưa đáp ứng yêu cầu của tiêu chí này.';
      }
    } else if (isOffTopic) {
      score = Math.min(crit.maxScore, Math.round(crit.maxScore * 0.2 * 10) / 10);
      feedback = 'Nội dung tệp nộp chưa đúng với chủ đề bài thực hành.';
    } else {
      // ĐÁNH GIÁ CHUẨN XÁC DỰA VÀO NỘI DUNG VÀ BẰNG CHỨNG THỰC TẾ TRONG TỆP
      if (combinedNorm.includes('2 nguon') || combinedNorm.includes('nguon tim kiem') || combinedNorm.includes('trich dan')) {
        const urlMatches = (normContent.match(/http|\.vn|\.com|\.gov/g) || []).length;
        if (structure.hasSources && (normContent.includes('nguon 1') || urlMatches >= 2)) {
          score = crit.maxScore;
          feedback = 'Đã trích dẫn đầy đủ 2 nguồn thông tin độc lập kèm tác giả, ngày đăng và đường dẫn URL.';
        } else if (structure.hasSources) {
          score = Math.round(crit.maxScore * 0.6 * 10) / 10;
          feedback = 'Đã có thông tin nguồn nhưng cần bổ sung thêm đủ 2 nguồn độc lập và thông tin ngày đăng, URL.';
        } else {
          score = Math.round(crit.maxScore * 0.25 * 10) / 10;
          feedback = 'Chưa trích dẫn đủ 2 nguồn tin độc lập.';
        }
      } else if (combinedNorm.includes('bang so sanh') || combinedNorm.includes('doi chieu') || (combinedNorm.includes('bang') && combinedNorm.includes('tieu chi'))) {
        if (structure.hasTable && structure.hasComparison) {
          score = crit.maxScore;
          feedback = 'Bảng so sánh đối chiếu khoa học, đầy đủ các tiêu chí thẩm quyền, bằng chứng và tính cập nhật.';
        } else if (structure.hasTable) {
          score = Math.round(crit.maxScore * 0.7 * 10) / 10;
          feedback = 'Đã tạo bảng biểu nhưng cần phân tích sâu hơn các tiêu chí thẩm quyền và bằng chứng kiểm chứng.';
        } else if (structure.hasComparison) {
          score = Math.round(crit.maxScore * 0.55 * 10) / 10;
          feedback = 'Có nội dung so sánh nhưng chưa đưa vào bảng biểu khoa học (hãy dùng Insert -> Table).';
        } else {
          score = Math.round(crit.maxScore * 0.25 * 10) / 10;
          feedback = 'Chưa tạo bảng so sánh đối chiếu.';
        }
      } else if (combinedNorm.includes('ket luan') || combinedNorm.includes('can cu') || combinedNorm.includes('thuyet phuc')) {
        if (structure.hasConclusion && structure.cleanWordCount >= 45) {
          score = crit.maxScore;
          feedback = 'Kết luận xác đáng, phân tích thuyết phục nguồn nào có độ tin cậy cao hơn.';
        } else if (structure.hasConclusion) {
          score = Math.round(crit.maxScore * 0.65 * 10) / 10;
          feedback = 'Đã có kết luận nhưng nên bổ sung thêm lí giải tại sao nguồn đó đáng tin cậy hơn.';
        } else {
          score = Math.round(crit.maxScore * 0.25 * 10) / 10;
          feedback = 'Chưa có kết luận đánh giá mức độ tin cậy.';
        }
      } else if (combinedNorm.includes('cong thuc') || combinedNorm.includes('ham') || combinedNorm.includes('tinh toan')) {
        if (structure.hasFormulas) {
          score = crit.maxScore;
          feedback = 'Các công thức và hàm tính toán được thiết lập chính xác.';
        } else {
          score = Math.round(crit.maxScore * 0.4 * 10) / 10;
          feedback = 'Cần bổ sung các công thức/hàm (SUM, AVERAGE, IF...) theo đúng yêu cầu đề bài.';
        }
      } else if (combinedNorm.includes('hinh thuc') || combinedNorm.includes('van ban') || combinedNorm.includes('trinh bay') || combinedNorm.includes('bo cuc')) {
        const isAdequate = structure.cleanWordCount >= 50 && (structure.headingDetected || structure.paragraphCount >= 2);
        if (isAdequate) {
          score = crit.maxScore;
          feedback = 'Hình thức trình bày chuẩn mực, bố cục rõ ràng, đúng quy định.';
        } else if (structure.cleanWordCount >= 30) {
          score = Math.round(crit.maxScore * 0.75 * 10) / 10;
          feedback = 'Hình thức đạt mức cơ bản, nên căn lề và định dạng đẹp mắt hơn.';
        } else {
          score = Math.round(crit.maxScore * 0.4 * 10) / 10;
          feedback = 'Văn bản còn ngắn, cần bổ sung thêm nội dung.';
        }
      } else {
        const ratio = (contentScorePercent / 100 * 0.6) + (stepScoreRatio * 0.4);
        score = Math.round(crit.maxScore * ratio * 10) / 10;
        feedback = ratio >= 0.8
          ? 'Đáp ứng tốt các yêu cầu của tiêu chí này.'
          : 'Cần bổ sung thêm nội dung và hoàn thiện các bước để đạt điểm tối đa.';
      }
    }

    score = Math.min(crit.maxScore, Math.max(0.2, score));

    return {
      criterionId: crit.id,
      criterionName: crit.name,
      score,
      maxScore: crit.maxScore,
      feedback,
    };
  });

  // 5. TÍNH TỔNG ĐIỂM CHÍNH XÁC (TỔNG ĐIỂM = TỔNG CÁC TIÊU CHÍ RUBRIC)
  let finalScore = criteriaResults.reduce((acc, c) => acc + c.score, 0);
  finalScore = Math.round(finalScore * 10) / 10;

  // GIỚI HẠN VÀ KHỐNG CHẾ ĐIỂM SỐ CHẶT CHẼ THEO CHẤT LƯỢNG THỰC TẾ
  if (structure.cleanWordCount < 10 && !isImageSubmission) {
    finalScore = 1.0;
  } else if (structure.isSuperficial) {
    // Tệp 1 slide PowerPoint hoặc dưới 25 từ: Tối đa 2.5 - 3.5 điểm, TUYỆT ĐỐI KHÔNG ĐƯỢC 10 ĐIỂM!
    finalScore = Math.min(3.0, Math.max(1.5, finalScore));
    // Chuẩn hóa lại tổng điểm các tiêu chí khớp với điểm đã khống chế
    const totalMax = criteriaResults.reduce((acc, c) => acc + c.maxScore, 0) || 10;
    criteriaResults.forEach((c) => {
      c.score = Math.round((c.maxScore / totalMax) * finalScore * 10) / 10;
    });
  } else if (isOffTopic) {
    finalScore = Math.min(3.5, Math.max(1.5, finalScore));
  } else if (structure.cleanWordCount < 40 && !isImageSubmission && !['sb3', 'xlsx'].includes(ext)) {
    finalScore = Math.min(6.0, finalScore);
  } else if (passedStepsCount === totalSteps && contentScorePercent >= 88 && structure.formatScorePercent >= 85) {
    // Chỉ đạt 10.0 khi hoàn thiện đầy đủ mọi mặt
    const isDocLongEnough = structure.cleanWordCount >= 60;
    const isPptLongEnough = ext === 'pptx' || ext === 'ppt' ? (structure.slideCount >= 3 && structure.cleanWordCount >= 50) : true;
    if (isDocLongEnough && isPptLongEnough && !structure.isSuperficial) {
      finalScore = 10.0;
      criteriaResults.forEach((c) => {
        c.score = c.maxScore;
      });
    }
  }

  finalScore = Math.min(10.0, Math.max(1.0, Math.round(finalScore * 10) / 10));

  // 6. TẠO CÁC NHẬN XÉT CHI TIẾT (Strengths, Weaknesses, HowToGetTen)
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const howToGetTen: string[] = [];

  if (structure.cleanWordCount < 10 && !isImageSubmission) {
    weaknesses.push(`⚠️ Tệp nộp hầu như không có nội dung (chỉ có ${structure.cleanWordCount} từ).`);
    weaknesses.push(`Chưa thực hiện các bước theo yêu cầu đề bài ${assignment.title}.`);
    howToGetTen.push(`Bước 1: Mở phần mềm ${assignment.toolRequired || 'Word/PowerPoint'} trên máy tính.`);
    howToGetTen.push(`Bước 2: Đọc kỹ hướng dẫn các bước ở cột bên trái và hoàn thành sản phẩm.`);
    howToGetTen.push(`Bước 3: Lưu lại tệp và nộp lại để hệ thống chấm lại và lấy điểm cao!`);
  } else if (structure.isSuperficial) {
    strengths.push(`Đã tải lên tệp bài làm .${ext.toUpperCase()} thành công.`);
    if (structure.headingDetected) {
      strengths.push('Đã có dòng tiêu đề bài học.');
    }
    weaknesses.push(
      ext === 'pptx' || ext === 'ppt'
        ? `⚠️ BÀI LÀM QUÁ SƠ SÀI: Bài trình chiếu mới chỉ có ${Math.max(1, structure.slideCount)} slide với ${structure.cleanWordCount} từ (chưa đủ để đạt điểm qua môn).`
        : `⚠️ BÀI LÀM QUÁ SƠ SÀI: Tệp nộp chỉ có ${structure.cleanWordCount} từ, mới dừng ở mức khởi tạo.`
    );
    if (!structure.hasSources && (normTitle.includes('tin cay') || normTitle.includes('tim kiem'))) {
      weaknesses.push('Thiếu nội dung trích dẫn 2 nguồn thông tin độc lập kèm tác giả, ngày đăng và link.');
    }
    if (!structure.hasTable && (normTitle.includes('so sanh') || normTitle.includes('tin cay') || normTitle.includes('bang'))) {
      weaknesses.push('Chưa tạo bảng so sánh đối chiếu các tiêu chí.');
    }
    if (!structure.hasConclusion) {
      weaknesses.push('Chưa viết phần kết luận nhận xét và đánh giá.');
    }

    howToGetTen.push(`Bước 1: Mở lại tệp ${fileName} trên máy tính để tiếp tục làm bài.`);
    if (normTitle.includes('tin cay') || assignment.id.includes('sp01')) {
      howToGetTen.push(`Bước 2: Tìm kiếm 2 trang web về cùng một chủ đề (ví dụ: tác hại rác thải nhựa, an toàn thực phẩm...). Ghi rõ tác giả, ngày đăng và link.`);
      howToGetTen.push(`Bước 3: Chèn bảng so sánh (Insert -> Table) gồm các cột: Tiêu chí, Nguồn 1, Nguồn 2.`);
      howToGetTen.push(`Bước 4: Viết đoạn kết luận phân tích nguồn nào đáng tin cậy hơn và nêu rõ lí do.`);
    } else {
      howToGetTen.push(`Bước 2: Mở rộng bài làm, bổ sung nội dung các đề mục và hình ảnh minh họa.`);
    }
    howToGetTen.push(`Bước 5: Lưu tệp và bấm "Chấm Lại Bằng AI" để đạt 10.0 điểm tuyệt đối!`);
  } else if (isOffTopic) {
    strengths.push(`Đã tải lên tệp văn bản .${ext.toUpperCase()} thành công.`);
    weaknesses.push(`⚠️ TỆP NỘP CHƯA ĐÚNG BÀI: Nội dung tệp không liên quan đến bài thực hành "${assignment.title}".`);
    weaknesses.push(`Hệ thống quét không tìm thấy các kiến thức, thuật ngữ hoặc bảng biểu của bài.`);
    howToGetTen.push(`Bước 1: Kiểm tra lại xem có chọn nhầm tệp của môn học khác hoặc bài khác hay không.`);
    howToGetTen.push(`Bước 2: Mở bài làm "${assignment.title}", đối chiếu theo ${totalSteps} bước hướng dẫn.`);
    howToGetTen.push(`Bước 3: Lưu đúng tệp bài làm và bấm "Chấm Lại Bằng AI" để đạt điểm tối đa!`);
  } else {
    strengths.push(`Nội dung đã bám sát chủ đề "${assignment.title}" (${contentScorePercent}% độ chuẩn xác).`);
    if (structure.hasTable) {
      strengths.push(`Hình thức trình bày tốt: Đã tạo bảng biểu (${structure.tableCount} bảng) theo đúng yêu cầu.`);
    }
    if (structure.slideCount >= 3) {
      strengths.push(`Đã thiết kế ${structure.slideCount} trang slide trình chiếu hoàn chỉnh.`);
    }
    if (structure.hasSources) {
      strengths.push('Đã trích dẫn nguồn thông tin tham khảo đầy đủ.');
    }
    if (structure.hasConclusion) {
      strengths.push('Có phần kết luận và nhận xét đánh giá rõ ràng.');
    }

    // Liệt kê các bước chưa đạt vào weaknesses
    stepEvaluations.forEach((se) => {
      if (se.status === 'failed') {
        weaknesses.push(`Bước ${se.stepNumber}: ${se.detail}`);
        howToGetTen.push(`Sửa Bước ${se.stepNumber}: ${se.instruction.replace(/\.$/, '')} (${se.detail})`);
      } else if (se.status === 'partial') {
        weaknesses.push(`Bước ${se.stepNumber}: ${se.detail}`);
        howToGetTen.push(`Hoàn thiện Bước ${se.stepNumber}: ${se.detail}`);
      }
    });

    if (finalScore < 10.0 && howToGetTen.length === 0) {
      howToGetTen.push(`Rà soát lại thẩm mỹ, căn lề và định dạng bảng biểu để đạt 10 điểm tuyệt đối.`);
      howToGetTen.push(`Sau khi sửa xong trên máy tính, lưu tệp và bấm "Chấm Lại Bằng AI" để nâng lên 10 điểm!`);
    }
  }

  // Tóm tắt kết quả đối chiếu
  const aiComparisonDetails = structure.isSuperficial
    ? `⚠️ Quét nhanh phát hiện tệp nộp "${fileName}" còn quá sơ sài (${structure.cleanWordCount} từ, ${structure.slideCount || 1} slide). Chưa đáp ứng các bước thực hành của bài "${assignment.title}".`
    : isOffTopic
    ? `⚠️ Quét nhanh phát hiện tệp nộp "${fileName}" chưa đúng với chủ đề bài thực hành "${assignment.title}". Vui lòng kiểm tra lại tệp bài làm trên máy tính.`
    : `Sản phẩm "${fileName}" đã được đối chiếu chi tiết theo từng bước thực hành và từng tiêu chí của bài học "${assignment.title}".`;

  const inspectionSummary: InspectionSummary = {
    contentScorePercent,
    formatScorePercent: structure.formatScorePercent,
    stepCompletionRate,
    isOffTopic: isOffTopic || structure.isSuperficial,
    warningMessage: structure.isSuperficial
      ? `Cảnh báo: Tệp nộp quá sơ sài (${structure.cleanWordCount} từ, ${structure.slideCount || 1} slide). Điểm số bị khống chế ở mức không đạt để học sinh tiếp tục hoàn thiện.`
      : isOffTopic
      ? `Cảnh báo: Tệp nộp chưa đúng nội dung bài thực hành "${assignment.title}".`
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
