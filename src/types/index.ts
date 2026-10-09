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
  score: number;
  aiComparisonDetails?: string; // Chi tiết đối chiếu với sản phẩm mẫu & chuẩn tri thức
  criteriaResults: CriterionResult[];
  strengths: string[];
  weaknesses: string[];
  howToGetTen: string[];
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
