import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudentSubmissionView } from './components/StudentSubmissionView';
import { ClassResultsModal } from './components/ClassResultsModal';
import { ProjectorLiveBoard } from './components/ProjectorLiveBoard';
import { DEFAULT_ASSIGNMENTS } from './data/defaultAssignments';
import { INITIAL_SUBMISSIONS } from './data/mockSubmissions';
import { SCHOOL_CLASSES } from './data/classes';
import { Assignment, Submission, SubmissionAttempt } from './types';
import { exportSubmissionsToExcel, exportSingleSubmissionToExcel } from './utils/excelExport';
import {
  saveSubmissionsSafely,
  loadSubmissionsSafely,
  getTodayDateString,
  isSubmittedToday,
  pruneOldSubmissions,
} from './utils/storageManager';
import { scanAndGradeProduct } from './utils/productScanner';

const STORAGE_KEY_ASSIGNMENTS = 'labgrade_assignments_v7_grade6_grade7_grade8_grade9';
const STORAGE_KEY_CLASS = 'labgrade_current_class_v1';

// Smart rapid scanning and step-by-step cross-verification engine
function analyzeStudentWork(params: {
  assignment: Assignment;
  fileName: string;
  fileContent: string;
  attemptNumber: number;
}) {
  return scanAndGradeProduct(params);
}

export default function App() {
  // Load initial assignments (Grade 6, Grade 7, Grade 8 & Grade 9 official products SP01 - SP14)
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasGrade9 = parsed.some((a: Assignment) => a.id.startsWith('th9') || a.gradeLevel === 'Lớp 9');
          if (hasGrade9) return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load assignments from localStorage:', e);
    }
    return DEFAULT_ASSIGNMENTS;
  });

  // Current class - default to 6A2 or valid saved class
  const [userClassName, setUserClassName] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CLASS);
    if (saved && (SCHOOL_CLASSES as readonly string[]).includes(saved)) {
      return saved;
    }
    return SCHOOL_CLASSES[0] || '6A2';
  });

  const [activeAssignmentId, setActiveAssignmentId] = useState<string>(() => {
    return DEFAULT_ASSIGNMENTS[0]?.id || 'sp01-so-do-xu-li-thong-tin';
  });

  // Handler to select and synchronize active practicing class
  const handleSelectClassName = (newClass: string) => {
    setUserClassName(newClass);
    localStorage.setItem(STORAGE_KEY_CLASS, newClass);
  };

  // Load initial submissions safely
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const loaded = loadSubmissionsSafely();
    if (loaded && loaded.length > 0) return loaded;
    return INITIAL_SUBMISSIONS;
  });

  // Modals & Overlays
  const [isProjectorOpen, setIsProjectorOpen] = useState<boolean>(false);
  const [isClassResultsOpen, setIsClassResultsOpen] = useState<boolean>(false);

  // Persist assignments to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
    } catch (e) {
      console.warn('Failed to save assignments:', e);
    }
  }, [assignments]);

  // Persist submissions safely to localStorage with auto-pruning
  useEffect(() => {
    saveSubmissionsSafely(submissions);
  }, [submissions]);

  // Persist class selection
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLASS, userClassName);
  }, [userClassName]);

  // Background fetch from server to sync lab submissions if server has any
  useEffect(() => {
    const fetchServerSubmissions = async () => {
      try {
        const res = await fetch('/api/submissions');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.submissions) && data.submissions.length > 0) {
            setSubmissions((prev) => {
              const map = new Map<string, Submission>();
              prev.forEach((s) => map.set(s.id, s));
              data.submissions.forEach((s: Submission) => map.set(s.id, s));
              return Array.from(map.values());
            });
          }
        }
      } catch {
        // offline or standalone
      }
    };
    fetchServerSubmissions();
  }, []);

  const activeAssignment =
    assignments.find((a) => a.id === activeAssignmentId) || assignments[0] || DEFAULT_ASSIGNMENTS[0];

  // Handler for student submitting work and grading
  const handleStudentSubmitWork = async (data: {
    assignmentId: string;
    className: string;
    machineNumber: string;
    studentLeader: string;
    groupMembers: string[];
    fileName: string;
    fileSize: number;
    fileContent: string;
  }): Promise<SubmissionAttempt | null> => {
    const todayStr = getTodayDateString();

    // KIỂM TRA BÀI NỘP CỦA HÔM NAY (Yêu cầu 3: không lưu dồn với ngày trước, sang ngày mới/tuần sau tính phiên mới)
    // Nếu cùng số máy nhưng KHÁC tên học sinh/nhóm trưởng -> Đây là 2 nhóm khác nhau, không ghi đè mất bài của nhau!
    const existingSubmission = submissions.find(
      (s) =>
        s.assignmentId === data.assignmentId &&
        s.className === data.className &&
        (s.studentLeader.trim().toLowerCase() === data.studentLeader.trim().toLowerCase() ||
          (s.machineNumber === data.machineNumber &&
            s.groupMembers.some((m) => m.trim().toLowerCase() === data.studentLeader.trim().toLowerCase()))) &&
        (s.practiceDate === todayStr || isSubmittedToday(s.latestSubmittedAt, todayStr))
    );

    // Nếu là phiên trong cùng ngày hôm nay: số lần nộp tăng dần (attempt 2, 3...)
    // Nếu là ngày hôm sau / tuần sau: bắt đầu từ lần 1 của ngày hôm đó
    const attemptNumber = existingSubmission ? existingSubmission.attempts.length + 1 : 1;

    // Send to grading endpoint
    let gradeData: any;
    try {
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment: activeAssignment,
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileContent: data.fileContent,
          attemptNumber,
          studentLeader: data.studentLeader,
          groupMembers: data.groupMembers,
          className: data.className,
          machineNumber: data.machineNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`Lỗi máy chủ (${response.status})`);
      }
      gradeData = await response.json();
    } catch (err: any) {
      console.warn('Call to /api/grade failed, using smart local evaluator:', err);
      gradeData = analyzeStudentWork({
        assignment: activeAssignment,
        fileName: data.fileName,
        fileContent: data.fileContent,
        attemptNumber,
      });
    }

    const newAttempt: SubmissionAttempt = {
      attemptNumber,
      timestamp: new Date().toISOString(),
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileContent: data.fileContent,
      score: gradeData.score,
      aiComparisonDetails: gradeData.aiComparisonDetails || 'Sản phẩm đã được hệ thống AI đối chiếu tự động với sản phẩm mẫu & chuẩn tri thức môn Tin học.',
      criteriaResults: gradeData.criteriaResults || [],
      strengths: gradeData.strengths || [],
      weaknesses: gradeData.weaknesses || [],
      howToGetTen: gradeData.howToGetTen || [],
      stepEvaluations: gradeData.stepEvaluations || [],
      inspectionSummary: gradeData.inspectionSummary || undefined,
    };

    let updatedSubmission: Submission;

    if (existingSubmission) {
      const updatedAttempts = [...existingSubmission.attempts, newAttempt];
      const maxScore = Math.max(...updatedAttempts.map((a) => a.score));

      updatedSubmission = {
        ...existingSubmission,
        studentLeader: data.studentLeader,
        groupMembers: data.groupMembers,
        attempts: updatedAttempts,
        highestScore: maxScore,
        latestScore: newAttempt.score,
        latestSubmittedAt: newAttempt.timestamp,
        practiceDate: todayStr,
        status: maxScore >= 10 ? 'perfect' : maxScore >= 7 ? 'graded' : 'needs_improvement',
      };

      setSubmissions((prev) =>
        pruneOldSubmissions(prev.map((s) => (s.id === existingSubmission.id ? updatedSubmission : s)))
      );
    } else {
      updatedSubmission = {
        id: `sub-${data.className}-${data.machineNumber.replace(/\s+/g, '_')}-${todayStr}-${Date.now()}`,
        assignmentId: data.assignmentId,
        assignmentTitle: activeAssignment.title,
        className: data.className,
        machineNumber: data.machineNumber,
        studentLeader: data.studentLeader,
        groupMembers: data.groupMembers,
        attempts: [newAttempt],
        highestScore: newAttempt.score,
        latestScore: newAttempt.score,
        latestSubmittedAt: newAttempt.timestamp,
        practiceDate: todayStr,
        status: newAttempt.score >= 10 ? 'perfect' : newAttempt.score >= 7 ? 'graded' : 'needs_improvement',
      };

      // Thêm bài nộp mới của ngày hôm nay, giữ lại các ngày trước trong lịch sử, tự động dọn dẹp các ngày cũ nhất khi đầy
      setSubmissions((prev) => pruneOldSubmissions([updatedSubmission, ...prev]));
    }

    // Sync to backend endpoint if possible
    fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSubmission),
    }).catch(() => {});

    return newAttempt;
  };

  // Update group members in existing or pending submissions
  const handleUpdateGroupMembers = (data: {
    className: string;
    machineNumber: string;
    studentLeader: string;
    groupMembers: string[];
  }) => {
    setSubmissions((prev) => {
      const matchIdx = prev.findIndex(
        (s) =>
          s.className === data.className &&
          (s.machineNumber === data.machineNumber ||
            (data.studentLeader.trim() && s.studentLeader.toLowerCase() === data.studentLeader.toLowerCase()))
      );
      if (matchIdx >= 0) {
        const updated = [...prev];
        updated[matchIdx] = {
          ...updated[matchIdx],
          studentLeader: data.studentLeader,
          groupMembers: data.groupMembers,
        };
        fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated[matchIdx]),
        }).catch(() => {});
        return updated;
      }
      return prev;
    });
  };

  // Export Excel handler for active class
  const handleExportClassExcel = () => {
    exportSubmissionsToExcel({
      className: userClassName,
      assignment: activeAssignment,
      submissions,
    });
  };

  // Export individual / group submission to Excel
  const handleExportSingleSubmission = (sub: Submission) => {
    exportSingleSubmissionToExcel({
      submission: sub,
      assignment: activeAssignment,
    });
  };

  // Statistics
  const filteredForHeader = submissions.filter((s) => s.className === userClassName);
  const totalSubmissionsCount = filteredForHeader.length;
  const perfectCount = filteredForHeader.filter((s) => s.highestScore >= 10).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-slate-100 to-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-200">
      {/* Top Header */}
      <Header
        onOpenProjector={() => setIsProjectorOpen(true)}
        onOpenClassResults={() => setIsClassResultsOpen(true)}
        onExportExcel={handleExportClassExcel}
        activeClassName={userClassName}
        onChangeClassName={handleSelectClassName}
        totalSubmissions={totalSubmissionsCount}
        perfectSubmissions={perfectCount}
      />

      {/* Main Student Workspace (Single focused interface without teacher management portal) */}
      <main className="flex-1 pb-16">
        <StudentSubmissionView
          assignments={assignments}
          activeAssignmentId={activeAssignmentId}
          onSelectAssignment={(id) => setActiveAssignmentId(id)}
          userClassName={userClassName}
          onChangeClassName={handleSelectClassName}
          mySubmissions={submissions}
          onSubmitWork={handleStudentSubmitWork}
          onUpdateGroupMembers={handleUpdateGroupMembers}
          onExportExcel={handleExportClassExcel}
          onOpenClassResults={() => setIsClassResultsOpen(true)}
          onExportMySubmission={handleExportSingleSubmission}
        />
      </main>

      {/* Class Results Modal - View and download during practice */}
      {isClassResultsOpen && (
        <ClassResultsModal
          className={userClassName}
          submissions={submissions}
          onClose={() => setIsClassResultsOpen(false)}
          onExportExcel={handleExportClassExcel}
        />
      )}

      {/* Projector Live Overlay Screen */}
      {isProjectorOpen && (
        <ProjectorLiveBoard
          className={userClassName}
          assignment={activeAssignment}
          submissions={submissions}
          onClose={() => setIsProjectorOpen(false)}
        />
      )}

      {/* School Informatics Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="w-full max-w-[98%] 2xl:max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-semibold text-slate-700 text-sm">
            Hệ Thống Chấm Điểm Phòng Thực Hành Tin Học • LabGrade AI
          </div>
          <div className="text-sm">
            Nộp nhiều lần • Tối ưu 10 điểm • Báo cáo Excel chi tiết theo lớp
          </div>
        </div>
      </footer>
    </div>
  );
}

