export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

export interface Assignment {
  id: string;
  title: string;
  gradeLevel: string; // e.g. "Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"
  subjectType: 'python' | 'pascal' | 'cpp' | 'web' | 'excel' | 'word' | 'scratch' | 'other' | 'powerpoint' | 'system' | 'canva';
  durationMinutes: number;
  description: string;
  requirements: string[];
  expectedOutput?: string;
  targetFile?: string; // Tên tệp nộp quy định (ví dụ: SP01_SoDoXuLiThongTin.png)
  toolRequired?: string; // Công cụ thực hiện (ví dụ: PowerPoint, Word, Canva...)
  steps?: string[]; // Các bước thực hiện chi tiết
  acceptanceCriteria?: string; // Sản phẩm đạt yêu cầu khi...
  note?: string; // Lưu ý quan trọng
  sampleProduct?: {
    fileName: string;
    content: string;
    notes?: string;
  };
  rubric?: RubricCriterion[];
  createdAt: string;
  isActive: boolean;
}

export interface StepEvaluation {
  stepNumber: number;
  instruction: string;
  status: 'passed' | 'partial' | 'failed';
  detail: string;
}

export interface InspectionSummary {
  contentScorePercent: number; // Tỷ lệ đáp ứng nội dung (0 - 100%)
  formatScorePercent: number;  // Tỷ lệ đáp ứng hình thức/cấu trúc (0 - 100%)
  stepCompletionRate: string;  // Ví dụ: "6/8 bước đã hoàn thành"
  isOffTopic?: boolean;        // Tệp nộp có bị lạc đề hoặc không khớp chủ đề không
  warningMessage?: string;     // Cảnh báo nếu phát hiện tệp rỗng hoặc sai bài
}

export interface CriterionResult {
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface SubmissionAttempt {
  attemptNumber: number;
  timestamp: string;
  fileName: string;
  fileSize: number;
  fileContent?: string;
  imageBase64?: string; // Dữ liệu ảnh sản phẩm để AI chấm trực quan (Vision)
  score: number;
  aiComparisonDetails?: string; // Chi tiết đối chiếu với sản phẩm mẫu & chuẩn tri thức
  criteriaResults: CriterionResult[];
  strengths: string[];
  weaknesses: string[];
  howToGetTen: string[];
  stepEvaluations?: StepEvaluation[]; // Đối chiếu chi tiết từng bước thực hiện
  inspectionSummary?: InspectionSummary; // Thước đo quét nội dung và hình thức
  teacherNote?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  className: string;
  machineNumber: string; // Số máy (e.g. "Máy 08")
  studentLeader: string; // Trưởng nhóm / Người nộp
  groupMembers: string[]; // Các thành viên trong nhóm
  attempts: SubmissionAttempt[];
  highestScore: number;
  latestScore: number;
  latestSubmittedAt: string;
  practiceDate?: string; // Ngày thực hành (YYYY-MM-DD, phân tách giữa các ngày/tuần khác nhau)
  status: 'graded' | 'perfect' | 'needs_improvement';
}

export interface LabStats {
  totalMachines: number;
  submittedCount: number;
  perfectCount: number;
  averageScore: number;
  gradeDistribution: {
    excellent: number; // 9 - 10
    good: number;      // 7 - <9
    average: number;   // 5 - <7
    poor: number;      // <5
  };
}

export interface StudentRecord {
  stt?: number | string;
  fullName: string;
  className: string;
}
