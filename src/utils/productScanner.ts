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
  // Lập trình Python (số nguyên tố, thuật toán)
  else if (subjectType === 'python' || normId.includes('prime') || normTitle.includes('nguyen to')) {
    coreTerms.push('input', 'int', 'for', 'while', '%', 'print');
    secondaryTerms.push('range', 'nguyen to', 'uoc', 'if', 'else');
  }
  // Bảng tính Excel
  else if (subjectType === 'excel' || normTitle.includes('bang tinh') || normTitle.includes('excel')) {
    coreTerms.push('average', 'if', 'sum', 'rank', 'diem', 'bang tinh');
    secondaryTerms.push('trung binh', 'xep loai', 'cot', 'hang', 'cong thuc');
  }

  // Tự động bổ sung từ khóa từ requirements và sampleProduct nếu có
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

// Hàm quét cấu trúc văn bản/tệp (Hình thức)
export function inspectDocumentStructure(params: {
  fileName: string;
  fileContent: string;
  subjectType: string;
}): {
  hasTable: boolean;
  tableCount: number;
  wordCount: number;
  paragraphCount: number;
  headingDetected: boolean;
  hasFormulas: boolean;
  formatScorePercent: number;
  structuralNotes: string[];
} {
  const { fileName, fileContent = '', subjectType } = params;
  const content = fileContent;
  const lowerContent = content.toLowerCase();
  const normContent = normalizeVi(content);

  const structuralNotes: string[] = [];
  let formatScorePercent = 50;

  // Đếm từ
  const words = content.replace(/\[.*?\]/g, ' ').trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Kiểm tra bảng (Tables)
  // Nhận diện bảng qua định dạng trích xuất từ Mammoth/HTML/Text/Markdown/TSV
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

  // Tiêu đề
  const headingDetected =
    content.includes('<h1') ||
    content.includes('<h2') ||
    content.includes('TIÊU ĐỀ') ||
    content.includes('TIEU DE') ||
    content.includes('BÁO CÁO') ||
    content.includes('CẨM NANG') ||
    content.includes('THIẾT BỊ VÀO') ||
    content.includes('SƠ ĐỒ') ||
    (words.length > 0 && words.slice(0, 8).join(' ').toUpperCase() === words.slice(0, 8).join(' '));

  // Đoạn văn
  const paragraphCount = Math.max(1, content.split(/\n\s*\n/).length);

  // Công thức Excel
  const hasFormulas =
    lowerContent.includes('average(') ||
    lowerContent.includes('if(') ||
    lowerContent.includes('sum(') ||
    lowerContent.includes('rank(') ||
    lowerContent.includes('=');

  // Đánh giá điểm hình thức cơ bản
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (wordCount < 10 && !['png', 'jpg', 'jpeg', 'sb3'].includes(ext)) {
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
    if (wordCount >= 40) {
      formatScorePercent += 10;
      structuralNotes.push(`Độ dài văn bản đầy đủ (${wordCount} từ).`);
    }
  }

  formatScorePercent = Math.min(100, Math.max(10, formatScorePercent));

  return {
    hasTable,
    tableCount,
    wordCount,
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
}): GradingOutput {
  const { assignment, fileName, fileSize = 0, fileContent = '', attemptNumber = 1 } = params;
  const content = (fileContent || '').trim();
  const normContent = normalizeVi(content);
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

  // Tính tỷ lệ liên quan nội dung (0 - 100%)
  let contentScorePercent = 0;
  let isOffTopic = false;

  const totalCore = coreTerms.length;
  if (totalCore > 0) {
    const coreRatio = coreMatches / totalCore;
    const secondaryBonus = Math.min(25, secondaryMatches * 5);
    contentScorePercent = Math.round(coreRatio * 75 + secondaryBonus);

    // Phát hiện tệp lạc đề / nộp nhầm bài Word khác / tệp rỗng
    if (structure.wordCount > 15 && coreMatches === 0 && secondaryMatches <= 1) {
      isOffTopic = true;
      contentScorePercent = Math.min(20, contentScorePercent);
    } else if (structure.wordCount < 10 && !['png', 'jpg', 'jpeg', 'sb3'].includes(ext)) {
      isOffTopic = true;
      contentScorePercent = 10;
    }
  } else {
    // Nếu bài tập không định nghĩa sẵn từ khóa chuyên biệt (ví dụ code Python hoặc Scratch)
    if (assignment.subjectType === 'python') {
      const hasPyOps = normContent.includes('input') || normContent.includes('print') || normContent.includes('for') || normContent.includes('def');
      contentScorePercent = hasPyOps ? 80 : 30;
      isOffTopic = !hasPyOps && structure.wordCount > 10;
    } else {
      contentScorePercent = structure.wordCount > 30 ? 75 : 40;
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

    // Trường hợp tệp hoàn toàn lạc đề hoặc rỗng:
    if (isOffTopic && structure.wordCount < 10) {
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
      if (normStep.includes('mo') && (normStep.includes('word') || normStep.includes('powerpoint') || normStep.includes('explorer') || normStep.includes('tao tai lieu'))) {
        status = 'passed';
        detail = `Đã khởi tạo đúng tệp định dạng .${ext.toUpperCase()}.`;
      } else if (normStep.includes('tieu de') || normStep.includes('dat ten')) {
        if (structure.headingDetected || normContent.includes('tieu de') || (assignment.title && normContent.includes(normalizeVi(assignment.title.slice(5, 20))))) {
          status = 'passed';
          detail = `Đã có tiêu đề nổi bật theo yêu cầu bài học.`;
        } else {
          status = 'partial';
          detail = `Cần kiểm tra lại: Tiêu đề chưa thật sự nổi bật hoặc thiếu chữ hoa rõ ràng.`;
        }
      } else if (normStep.includes('bang') || normStep.includes('cot') || normStep.includes('hang')) {
        if (structure.hasTable) {
          status = 'passed';
          detail = `Đã tạo bảng biểu (${structure.tableCount} bảng) theo đúng hướng dẫn.`;
        } else {
          status = 'failed';
          detail = `Chưa tạo bảng biểu theo yêu cầu. Hãy chèn bảng (Insert -> Table).`;
        }
      } else if (normStep.includes('it nhat 8') || normStep.includes('8 thiet bi') || normStep.includes('thiet bi vao')) {
        // Kiểm tra số lượng thiết bị (TH7_SP01) hỗ trợ đa dạng từ đồng nghĩa thực tế của học sinh
        const deviceNames = [
          'ban phim', 'chuot', 'man hinh', 'may in', 'loa', 'micro', 'may quet', 'scanner', 
          'may chieu', 'tai nghe', 'o dia', 'o cung', 'usb', 'camera', 'webcam', 'but cam ung', 
          'man cam ung', 'bo thu am', 'thiet bi vao', 'thiet bi ra'
        ];
        const foundDevices = deviceNames.filter((d) => normContent.includes(d));
        if (foundDevices.length >= 6) {
          status = 'passed';
          detail = `Đã liệt kê đủ ${foundDevices.length} thiết bị vào - ra chuẩn xác.`;
        } else if (foundDevices.length >= 3) {
          status = 'partial';
          detail = `Đã liệt kê được ${foundDevices.length} thiết bị (nên bổ sung thêm đủ ít nhất 8 thiết bị để đạt điểm tối đa).`;
        } else {
          status = 'failed';
          detail = `Chưa liệt kê đủ thiết bị (mới có ${foundDevices.length} thiết bị). Cần bổ sung thêm các thiết bị vào/ra như bàn phím, chuột, màn hình, máy in, micro, loa...`;
        }
      } else if (normStep.includes('dien chuc nang') || normStep.includes('phan loai')) {
        const hasChucNang = normContent.includes('chuc nang') || normContent.includes('dung de') || normContent.includes('nhiem vu');
        const hasPhanLoai = (normContent.includes('vao') && normContent.includes('ra')) || normContent.includes('phan loai');
        if (hasChucNang && hasPhanLoai) {
          status = 'passed';
          detail = `Đã mô tả đầy đủ chức năng và phân loại chính xác các mục.`;
        } else if (hasChucNang || hasPhanLoai) {
          status = 'partial';
          detail = `Đã có thông tin nhưng còn thiếu một phần chức năng hoặc cột phân loại.`;
        } else {
          status = 'failed';
          detail = `Chưa ghi rõ chức năng và phân loại Vào/Ra.`;
        }
      } else if (normStep.includes('luu tep') || normStep.includes('dung ten quy dinh')) {
        const targetClean = assignment.targetFile ? normalizeVi(assignment.targetFile.replace(/\.[^.]+$/, '')) : '';
        const normFileName = normalizeVi(fileName);
        if (!targetClean || normFileName.includes(targetClean) || normFileName.includes('sp') || normFileName.includes('th7') || normFileName.includes('th8') || normFileName.includes('th9')) {
          status = 'passed';
          detail = `Đã lưu tệp với định dạng hợp lệ (${fileName}).`;
        } else {
          status = 'partial';
          detail = `Tên tệp khuyến nghị theo quy định: ${assignment.targetFile || 'Đúng tên bài'}.`;
        }
      } else {
        // Kiểm tra chung theo từ khóa của bước
        const stepWords = normStep.split(/\s+/).filter((w) => w.length >= 4);
        const matchWords = stepWords.filter((w) => normContent.includes(w));
        const ratio = stepWords.length > 0 ? matchWords.length / stepWords.length : 1;

        if (ratio >= 0.6) {
          status = 'passed';
          detail = `Đã hoàn thành tốt yêu cầu của bước này.`;
        } else if (ratio >= 0.3) {
          status = 'partial';
          detail = `Đã làm một phần nhưng cần hoàn thiện thêm chi tiết.`;
        } else {
          status = 'failed';
          detail = `Chưa đạt. Chưa tìm thấy dữ liệu hoàn thành cho bước này trong tệp nộp.`;
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

  // 4. TÍNH ĐIỂM SỐ CHÍNH XÁC (TUYỆT ĐỐI KHÔNG CHẤM BỪA 8 ĐIỂM!)
  const totalSteps = steps.length;
  const stepScoreRatio = totalSteps > 0 ? (passedStepsCount * 1.0 + partialStepsCount * 0.5) / totalSteps : 0.8;
  const stepCompletionRate = `${passedStepsCount}/${totalSteps} bước đã hoàn thành`;

  let finalScore = 0;

  if (isOffTopic) {
    // TỆP LẠC ĐỀ HOẶC QUÁ NGẮN: Chấm từ 1.0 đến 3.5 điểm tùy mức độ
    if (structure.wordCount < 10) {
      finalScore = 1.0;
    } else {
      // Có tệp nhưng nội dung không liên quan đến bài thực hành
      finalScore = Math.min(3.5, Math.max(1.5, Math.round((structure.formatScorePercent / 100 * 2.0 + (contentScorePercent / 100) * 1.5) * 10) / 10));
    }
  } else {
    // TỆP ĐÚNG CHỦ ĐỀ: Điểm tính từ tỷ lệ bước đạt (50%), nội dung (30%), hình thức (20%)
    const rawScore =
      stepScoreRatio * 5.0 +
      (contentScorePercent / 100) * 3.0 +
      (structure.formatScorePercent / 100) * 2.0;

    finalScore = Math.round(rawScore * 10) / 10;

    // Chỉ đạt 10.0 điểm tuyệt đối khi hoàn thành đầy đủ tất cả các bước VÀ nội dung phong phú, chất lượng cao
    if (passedStepsCount === totalSteps && contentScorePercent >= 80 && structure.formatScorePercent >= 80 && (structure.wordCount >= 25 || ['png', 'jpg', 'jpeg', 'sb3'].includes(ext))) {
      finalScore = 10.0;
    } else if (passedStepsCount === totalSteps && contentScorePercent >= 65) {
      finalScore = Math.min(9.5, Math.max(8.5, finalScore));
    }
  }

  finalScore = Math.min(10.0, Math.max(1.0, finalScore));

  // 5. TẠO CÁC NHẬN XÉT CHI TIẾT (Strengths, Weaknesses, HowToGetTen)
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const howToGetTen: string[] = [];

  if (isOffTopic) {
    if (structure.wordCount < 10) {
      weaknesses.push(`⚠️ Tệp nộp hầu như không có nội dung (chỉ có ${structure.wordCount} từ).`);
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
    if (passedStepsCount > 0) {
      strengths.push(`Đã hoàn thành tốt ${passedStepsCount}/${totalSteps} bước thực hành.`);
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

    if (isOffTopic) {
      critRatio = idx === 0 ? 0.2 : 0.3;
      feedback = 'Nội dung tệp nộp chưa đáp ứng tiêu chí này do chưa đúng yêu cầu bài học.';
    } else {
      if (idx === 0) {
        critRatio = contentScorePercent / 100;
        feedback = critRatio >= 0.85 ? 'Nội dung kiến thức chuẩn xác, đầy đủ.' : 'Nội dung còn thiếu một số ý quan trọng.';
      } else if (idx === 1) {
        critRatio = stepScoreRatio;
        feedback = `Đã hoàn thành ${passedStepsCount}/${totalSteps} bước yêu cầu.`;
      } else {
        critRatio = structure.formatScorePercent / 100;
        feedback = structure.hasTable ? 'Hình thức bảng biểu và định dạng ngay ngắn.' : 'Cần hoàn thiện thêm cấu trúc và định dạng.';
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
