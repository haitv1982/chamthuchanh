import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trophy,
  RefreshCw,
  Plus,
  Trash2,
  Lightbulb,
  FileCheck,
  History,
  Bot,
  SearchCheck,
  CheckCheck,
  RotateCcw,
  Zap,
  Users,
  UserCheck,
  Download,
  FileSpreadsheet,
  BookOpen,
  Check,
  Target,
  Compass,
  FileText,
  ChevronDown,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { Assignment, Submission, SubmissionAttempt } from '../types';
import { SCHOOL_CLASSES } from '../data/classes';
import * as XLSX from 'xlsx';

interface StudentSubmissionViewProps {
  assignments: Assignment[];
  activeAssignmentId: string;
  onSelectAssignment: (id: string) => void;
  userClassName: string;
  onChangeClassName: (name: string) => void;
  mySubmissions: Submission[];
  onSubmitWork: (submissionData: {
    assignmentId: string;
    className: string;
    machineNumber: string;
    studentLeader: string;
    groupMembers: string[];
    fileName: string;
    fileSize: number;
    fileContent: string;
  }) => Promise<SubmissionAttempt | null>;
  onUpdateGroupMembers?: (data: {
    className: string;
    machineNumber: string;
    studentLeader: string;
    groupMembers: string[];
  }) => void;
  onExportExcel?: () => void;
  onOpenClassResults?: () => void;
  onExportMySubmission?: (sub: Submission) => void;
}

export const StudentSubmissionView: React.FC<StudentSubmissionViewProps> = ({
  assignments,
  activeAssignmentId,
  onSelectAssignment,
  userClassName,
  onChangeClassName,
  mySubmissions,
  onSubmitWork,
  onUpdateGroupMembers,
  onExportExcel,
  onOpenClassResults,
  onExportMySubmission,
}) => {
  // Active assignment
  const activeAssignment = assignments.find((a) => a.id === activeAssignmentId) || assignments[0];

  // Grade filter tab state: 'all' | 'Lớp 6' | 'Lớp 7' | 'Lớp 8' | 'Lớp 9'
  // Auto-align default filter with currently active assignment's gradeLevel or class
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'all' | 'Lớp 6' | 'Lớp 7' | 'Lớp 8' | 'Lớp 9'>(() => {
    if (userClassName.startsWith('9')) return 'Lớp 9';
    if (userClassName.startsWith('8')) return 'Lớp 8';
    if (userClassName.startsWith('7')) return 'Lớp 7';
    if (userClassName.startsWith('6')) return 'Lớp 6';
    return (activeAssignment?.gradeLevel as 'Lớp 6' | 'Lớp 7' | 'Lớp 8' | 'Lớp 9') || 'all';
  });

  // Filtered assignments according to the selected Grade filter
  const displayedAssignments = assignments.filter((assign) => {
    if (selectedGradeFilter === 'all') return true;
    return assign.gradeLevel === selectedGradeFilter;
  });

  // Sync grade filter when active assignment changes
  useEffect(() => {
    if (activeAssignment?.gradeLevel === 'Lớp 9') {
      setSelectedGradeFilter('Lớp 9');
    } else if (activeAssignment?.gradeLevel === 'Lớp 8') {
      setSelectedGradeFilter('Lớp 8');
    } else if (activeAssignment?.gradeLevel === 'Lớp 7') {
      setSelectedGradeFilter('Lớp 7');
    } else if (activeAssignment?.gradeLevel === 'Lớp 6') {
      setSelectedGradeFilter('Lớp 6');
    }
  }, [activeAssignment?.gradeLevel]);

  // Sync grade filter and first assignment when class changes
  useEffect(() => {
    if (userClassName.startsWith('9')) {
      setSelectedGradeFilter('Lớp 9');
      const firstG9 = assignments.find((a) => a.gradeLevel === 'Lớp 9');
      if (firstG9 && activeAssignment?.gradeLevel !== 'Lớp 9') {
        onSelectAssignment(firstG9.id);
      }
    } else if (userClassName.startsWith('8')) {
      setSelectedGradeFilter('Lớp 8');
      const firstG8 = assignments.find((a) => a.gradeLevel === 'Lớp 8');
      if (firstG8 && activeAssignment?.gradeLevel !== 'Lớp 8') {
        onSelectAssignment(firstG8.id);
      }
    } else if (userClassName.startsWith('7')) {
      setSelectedGradeFilter('Lớp 7');
      const firstG7 = assignments.find((a) => a.gradeLevel === 'Lớp 7');
      if (firstG7 && activeAssignment?.gradeLevel !== 'Lớp 7') {
        onSelectAssignment(firstG7.id);
      }
    } else if (userClassName.startsWith('6')) {
      setSelectedGradeFilter('Lớp 6');
      const firstG6 = assignments.find((a) => a.gradeLevel === 'Lớp 6');
      if (firstG6 && activeAssignment?.gradeLevel !== 'Lớp 6') {
        onSelectAssignment(firstG6.id);
      }
    }
  }, [userClassName]);

  // Form State
  const [machineNumber, setMachineNumber] = useState('Máy 05');
  const [studentLeader, setStudentLeader] = useState('');
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Grading Status
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingStep, setGradingStep] = useState<string>('');
  const [latestResult, setLatestResult] = useState<SubmissionAttempt | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find existing submission for this machine or student
  const currentSubmission = mySubmissions.find(
    (s) =>
      s.assignmentId === activeAssignment?.id &&
      s.className === userClassName &&
      (s.machineNumber === machineNumber ||
        (studentLeader.trim() && s.studentLeader.toLowerCase() === studentLeader.trim().toLowerCase()))
  );

  // Sync initial student details from existing submission if available
  useEffect(() => {
    if (currentSubmission && !studentLeader) {
      setStudentLeader(currentSubmission.studentLeader);
      setGroupMembers(currentSubmission.groupMembers || []);
      if (currentSubmission.attempts.length > 0) {
        setLatestResult(currentSubmission.attempts[currentSubmission.attempts.length - 1]);
      }
    }
  }, [currentSubmission]);

  // Handle adding a group member
  const handleAddMember = () => {
    if (newMemberName.trim()) {
      const trimmed = newMemberName.trim();
      if (!groupMembers.includes(trimmed)) {
        const updated = [...groupMembers, trimmed];
        setGroupMembers(updated);
        setNewMemberName('');
      }
    }
  };

  const handleRemoveMember = (idx: number) => {
    const updated = groupMembers.filter((_, i) => i !== idx);
    setGroupMembers(updated);
  };

  // Explicit Update Group Info Button
  const handleExplicitUpdateGroup = () => {
    if (!studentLeader.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên trưởng nhóm trước khi cập nhật.');
      return;
    }

    if (onUpdateGroupMembers) {
      onUpdateGroupMembers({
        className: userClassName,
        machineNumber,
        studentLeader: studentLeader.trim(),
        groupMembers,
      });
    }

    const allCount = 1 + groupMembers.length;
    setUpdateSuccessMsg(
      `Đã cập nhật danh sách nhóm thành công! (${allCount} học sinh: ${studentLeader.trim()}${
        groupMembers.length > 0 ? ', ' + groupMembers.join(', ') : ''
      }). Giáo viên sẽ xuất file Excel đầy đủ tất cả ${allCount} bạn!`
    );

    setTimeout(() => {
      setUpdateSuccessMsg(null);
    }, 5000);
  };

  // Smart file content extractor for accurate AI analysis
  const processUploadedFile = (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    // If Excel file (.xlsx, .xls)
    if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(buffer, { type: 'array' });
          let sheetDetails = `[BẢNG TÍNH EXCEL: ${file.name}]\n`;
          workbook.SheetNames.forEach((sheetName) => {
            sheetDetails += `\n--- TRANG TÍNH: ${sheetName} ---\n`;
            const sheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(sheet);
            sheetDetails += csv + '\n';

            // Extract exact formulas
            const formulas: string[] = [];
            for (const cell in sheet) {
              if (cell[0] !== '!' && sheet[cell]?.f) {
                formulas.push(`Ô ${cell}: =${sheet[cell].f} (Giá trị tính ra: ${sheet[cell].v})`);
              }
            }
            if (formulas.length > 0) {
              sheetDetails += `\nCÁC CÔNG THỨC HỌC SINH ĐÃ DÙNG:\n` + formulas.slice(0, 40).join('\n') + '\n';
            }
          });
          setFileContent(sheetDetails);
        } catch {
          setFileContent(`[Tệp bảng tính Excel: ${file.name}]`);
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // If text/code based (Python, Pascal, C++, HTML, etc.)
    const isTextLike =
      file.name.match(/\.(py|pas|cpp|c|h|html|htm|css|js|txt|json|csv|md)$/i) ||
      file.type.startsWith('text/');

    if (isTextLike) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent((e.target?.result as string) || '');
      };
      reader.readAsText(file);
      return;
    }

    // If Image file (PNG, JPG, JPEG, WEBP, etc.)
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp' || ext === 'bmp') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '';
        setImagePreviewUrl(dataUrl);
        setFileContent(`[ẢNH SẢN PHẨM: ${file.name}, định dạng .${ext.toUpperCase()}, kích thước: ${(file.size / 1024).toFixed(1)} KB]`);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Other formats (Word, Scratch, etc.)
    const reader = new FileReader();
    reader.onload = () => {
      setFileContent(`[Tệp sản phẩm: ${file.name}, định dạng .${ext}, dung lượng ${(file.size / 1024).toFixed(1)} KB]`);
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Submit and grade with AI
  const handleGradeWithAI = async () => {
    if (!studentLeader.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên trưởng nhóm / người nộp.');
      return;
    }

    if (!selectedFile) {
      setErrorMsg('Vui lòng chọn hoặc kéo thả tệp sản phẩm thực hành vào khung bên dưới.');
      return;
    }

    setErrorMsg(null);
    setIsGrading(true);
    setGradingStep('Hệ thống đang tải sản phẩm lên máy chủ...');

    try {
      const stepTimer1 = setTimeout(() => setGradingStep('AI đang quét và đối chiếu nhanh với chuẩn sản phẩm...'), 200);
      const stepTimer2 = setTimeout(() => setGradingStep('AI phân tích hình ảnh và tiêu chí thực hành...'), 500);

      const attemptResult = await onSubmitWork({
        assignmentId: activeAssignment.id,
        className: userClassName,
        machineNumber,
        studentLeader: studentLeader.trim(),
        groupMembers,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileContent: fileContent,
      });

      if (attemptResult) {
        setLatestResult(attemptResult);
        // Trigger celebratory confetti if score is 10
        if (attemptResult.score >= 10) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi chấm bài. Vui lòng thử lại.');
    } finally {
      setIsGrading(false);
      setGradingStep('');
    }
  };

  // Student returns to editing the product on their computer
  const handleReturnToEdit = () => {
    setSelectedFile(null);
    setFileContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const uploadElem = document.getElementById('student-upload-area');
    if (uploadElem) {
      uploadElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* SẢN PHẨM THỰC HÀNH SELECTOR & HƯỚNG DẪN CHI TIẾT */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Grade Selection Tabs + Product Selector Header */}
        <div className="flex flex-col gap-3 pb-3 border-b border-slate-100">
          {/* HÀNG NÚT LỆNH CHỌN KHỐI: Khối 9, Khối 8, Khối 7, Khối 6, Tất cả */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <GraduationCap className="w-4 h-4 text-rose-600" />
              <span>Chọn Khối Lớp:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedGradeFilter('Lớp 9');
                  const firstG9 = assignments.find((a) => a.gradeLevel === 'Lớp 9');
                  if (firstG9 && activeAssignment?.gradeLevel !== 'Lớp 9') {
                    onSelectAssignment(firstG9.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all shadow-2xs ${
                  selectedGradeFilter === 'Lớp 9'
                    ? 'bg-rose-600 text-white shadow-rose-500/25 ring-2 ring-rose-500 ring-offset-1'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Khối 9</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedGradeFilter === 'Lớp 9' ? 'bg-rose-800 text-rose-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  14 bài
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedGradeFilter('Lớp 8');
                  const firstG8 = assignments.find((a) => a.gradeLevel === 'Lớp 8');
                  if (firstG8 && activeAssignment?.gradeLevel !== 'Lớp 8') {
                    onSelectAssignment(firstG8.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all shadow-2xs ${
                  selectedGradeFilter === 'Lớp 8'
                    ? 'bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-500 ring-offset-1'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Khối 8</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedGradeFilter === 'Lớp 8' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  14 bài
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedGradeFilter('Lớp 7');
                  const firstG7 = assignments.find((a) => a.gradeLevel === 'Lớp 7');
                  if (firstG7 && activeAssignment?.gradeLevel !== 'Lớp 7') {
                    onSelectAssignment(firstG7.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all shadow-2xs ${
                  selectedGradeFilter === 'Lớp 7'
                    ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-500 ring-offset-1'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Khối 7</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedGradeFilter === 'Lớp 7' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  14 bài
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedGradeFilter('Lớp 6');
                  const firstG6 = assignments.find((a) => a.gradeLevel === 'Lớp 6');
                  if (firstG6 && activeAssignment?.gradeLevel !== 'Lớp 6') {
                    onSelectAssignment(firstG6.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all shadow-2xs ${
                  selectedGradeFilter === 'Lớp 6'
                    ? 'bg-indigo-600 text-white shadow-indigo-500/25 ring-2 ring-indigo-500 ring-offset-1'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Khối 6</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedGradeFilter === 'Lớp 6' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  14 bài
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGradeFilter('all')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedGradeFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Tất cả</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                  activeAssignment?.gradeLevel === 'Lớp 9'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : activeAssignment?.gradeLevel === 'Lớp 8'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : activeAssignment?.gradeLevel === 'Lớp 7'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {activeAssignment?.gradeLevel ? `Tin Học ${activeAssignment.gradeLevel}` : 'Nhiệm Vụ Thực Hành Tin Học'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  • 14 Sản phẩm chuẩn
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
                <span>{activeAssignment?.title}</span>
              </h1>
            </div>

            {/* Dropdown chọn sản phẩm thực hành */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 whitespace-nowrap hidden sm:inline">
                Đổi sản phẩm:
              </label>
              <div className="relative min-w-[260px] sm:min-w-[340px]">
                <select
                  value={activeAssignmentId}
                  onChange={(e) => onSelectAssignment(e.target.value)}
                  className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border-2 border-blue-500/40 hover:border-blue-600 text-slate-900 font-bold rounded-xl px-3.5 py-2.5 pr-8 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer transition-all shadow-2xs"
                >
                  {displayedAssignments.map((assign) => (
                    <option key={assign.id} value={assign.id}>
                      {assign.title} {selectedGradeFilter === 'all' ? `(${assign.gradeLevel})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Brief of Active Product */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {activeAssignment?.toolRequired && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
              <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                Công cụ thực hiện:
              </div>
              <div className="text-indigo-800 font-medium">
                {activeAssignment.toolRequired}
              </div>
            </div>
          )}

          {activeAssignment?.targetFile && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Tệp nộp / Minh chứng:
              </div>
              <div className="text-emerald-800 font-mono font-bold">
                {activeAssignment.targetFile}
              </div>
            </div>
          )}

          {activeAssignment?.acceptanceCriteria && (
            <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl space-y-1">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                Yêu cầu đạt chuẩn:
              </div>
              <div className="text-amber-800 font-medium line-clamp-2" title={activeAssignment.acceptanceCriteria}>
                {activeAssignment.acceptanceCriteria}
              </div>
            </div>
          )}
        </div>

        {/* Các bước thực hiện & Yêu cầu */}
        {activeAssignment?.steps && activeAssignment.steps.length > 0 && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Các Bước Thực Hiện Trên Máy Tính:
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                (Thực hành trên máy → Chụp ảnh/Lưu tệp → Nộp chấm bên dưới)
              </span>
            </div>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
              {activeAssignment.steps.map((st, i) => (
                <li key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{st}</span>
                </li>
              ))}
            </ol>
            {activeAssignment.note && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span><strong>Lưu ý:</strong> {activeAssignment.note}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Student Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Form & Direct File Upload (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Student & Group Members with Update Button */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Thông Tin Trưởng Nhóm & Các Bạn Cùng Nhóm
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                (Đầy đủ tất cả học sinh trong nhóm)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lớp học */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lớp đang thực hành <span className="text-rose-500">*</span>
                </label>
                <select
                  value={userClassName}
                  onChange={(e) => onChangeClassName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  {SCHOOL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      Lớp {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vị trí máy */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vị trí máy phòng Tin <span className="text-rose-500">*</span>
                </label>
                <select
                  value={machineNumber}
                  onChange={(e) => setMachineNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 40 }, (_, i) => {
                    const num = String(i + 1).padStart(2, '0');
                    return (
                      <option key={num} value={`Máy ${num}`}>
                        Máy {num}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Họ tên trưởng nhóm */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên Trưởng nhóm / Người nộp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={studentLeader}
                  onChange={(e) => setStudentLeader(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Thành viên cùng nhóm */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Họ và tên các bạn cùng nhóm (nếu làm việc nhóm):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tên bạn cùng nhóm (ví dụ: Trần Minh Bình)"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMember();
                      }
                    }}
                    className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm bạn
                  </button>
                </div>

                {groupMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {groupMembers.map((member, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-xs font-semibold"
                      >
                        <Users className="w-3 h-3 text-blue-500" />
                        {member}
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(idx)}
                          className="text-blue-400 hover:text-rose-600"
                          title="Xóa bạn này"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Explicit "CẬP NHẬT THÀNH VIÊN NHÓM" Button */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleExplicitUpdateGroup}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Cập Nhật Thành Viên Nhóm</span>
                  </button>
                  <span className="text-[11px] text-slate-500">
                    Tổng cộng: <strong>{1 + groupMembers.length} học sinh</strong> (Sẽ xuất đủ trong file Excel)
                  </span>
                </div>

                {updateSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{updateSuccessMsg}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Direct File Upload ONLY (No 'Dán mã nguồn/Text' button) */}
          <div
            id="student-upload-area"
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Tải Sản Phẩm Lên Để Chấm Điểm
              </h2>
              <span className="text-xs text-slate-500">
                (Chọn tệp sản phẩm em vừa tạo trên máy)
              </span>
            </div>

            {/* Drag & Drop File Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-emerald-400 bg-emerald-50/40'
                  : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".py,.pas,.cpp,.c,.h,.html,.htm,.css,.js,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.sb3,.sb2,.txt,.pdf,.zip,.png,.jpg"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  {imagePreviewUrl ? (
                    <div className="relative mx-auto max-w-xs rounded-lg overflow-hidden border border-emerald-300 shadow-sm bg-white p-1">
                      <img
                        src={imagePreviewUrl}
                        alt="Ảnh minh chứng sản phẩm"
                        className="w-full max-h-48 object-contain rounded"
                      />
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        Ảnh đã chọn
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <FileCheck className="w-6 h-6" />
                    </div>
                  )}
                  <div className="text-sm font-bold text-slate-800">
                    {selectedFile.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    Dung lượng: {(selectedFile.size / 1024).toFixed(1)} KB • Bấm để chọn tệp khác
                  </div>
                  {fileContent && fileContent.length > 0 && !fileContent.startsWith('[') && (
                    <div className="mt-3 p-2.5 bg-white border border-emerald-200 rounded-lg text-left max-h-28 overflow-y-auto text-xs font-mono text-slate-700">
                      {fileContent.slice(0, 300)}...
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-700">
                    Kéo và thả tệp sản phẩm thực hành vào đây, hoặc{' '}
                    <span className="text-blue-600 underline font-bold">bấm để chọn từ máy</span>
                  </div>
              <p className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Hỗ trợ ảnh chụp màn hình / ảnh chụp bài làm (.png, .jpg, .jpeg) và tệp (.pptx, .docx, .xlsx, .py...). Quét siêu tốc, không nghẽn mạng!
              </p>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* AI Grading Submit Action */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isGrading}
                onClick={handleGradeWithAI}
                className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.99] ${
                  isGrading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-lg'
                }`}
              >
                {isGrading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{gradingStep || 'Hệ thống đang đối chiếu và chấm điểm AI...'}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>
                      {currentSubmission ? 'Chấm Lại Bằng AI & Nâng Điểm Lên 10' : 'Chấm Điểm AI (Đối Chiếu & Chấm Tự Động)'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Results & Feedback OR Standby Helper (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {latestResult ? (
            /* AI GRADING RESULTS CARD */
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-5 animate-in fade-in duration-300">
              {/* Header with Score */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-blue-600" />
                    Kết Quả Lần Chấm Thứ {latestResult.attemptNumber}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Thời gian: {new Date(latestResult.timestamp).toLocaleTimeString('vi-VN')}
                  </div>
                </div>

                {/* Score badge */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl shadow-sm border ${
                    latestResult.score >= 10
                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                      : latestResult.score >= 8.5
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : latestResult.score >= 7.0
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-orange-50 border-orange-300 text-orange-700'
                  }`}
                >
                  <Trophy
                    className={`w-6 h-6 ${
                      latestResult.score >= 10 ? 'text-amber-500 animate-bounce' : 'text-current'
                    }`}
                  />
                  <div>
                    <span className="text-3xl font-black">{latestResult.score}</span>
                    <span className="text-xs font-semibold text-slate-500"> / 10</span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              {latestResult.score >= 10 ? (
                <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 p-3.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm">
                  <Trophy className="w-5 h-5 text-yellow-900 shrink-0" />
                  <span>XUẤT SẮC 10/10! Sản phẩm của nhóm em đáp ứng trọn vẹn mọi tiêu chuẩn! 🎉</span>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-orange-900 text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      Điểm chưa tối ưu 10 điểm? Em hãy quay lại sửa và chấm tiếp!
                    </span>
                  </div>
                  <p className="text-[11px] text-orange-800 leading-relaxed">
                    Hệ thống luôn ghi nhận điểm cao nhất (<strong>{currentSubmission?.highestScore || latestResult.score}đ</strong>). Em có thể chỉnh sửa tệp trên máy tính, lưu lại và chấm nhiều lần!
                  </p>
                </div>
              )}

              {/* AI Comparison Report with Teacher's Sample & Internet Standards */}
              {latestResult.aiComparisonDetails && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <SearchCheck className="w-4 h-4 text-blue-600" />
                    Kết Quả Đối Chiếu Với Sản Phẩm Mẫu & Chuẩn:
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {latestResult.aiComparisonDetails}
                  </p>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="space-y-3">
                {latestResult.strengths && latestResult.strengths.length > 0 && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Điểm đã làm tốt so với mẫu:
                    </div>
                    <ul className="text-xs text-emerald-800 space-y-0.5 list-disc list-inside">
                      {latestResult.strengths.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {latestResult.weaknesses && latestResult.weaknesses.length > 0 && latestResult.score < 10 && (
                  <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-rose-900 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      Chỗ còn thiếu / sai khác cần sửa:
                    </div>
                    <ul className="text-xs text-rose-800 space-y-0.5 list-disc list-inside">
                      {latestResult.weaknesses.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* ACTIONABLE STEPS TO REACH 10 POINTS */}
              {latestResult.howToGetTen && latestResult.howToGetTen.length > 0 && latestResult.score < 10 && (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-xl space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    HƯỚNG DẪN CÁC BƯỚC ĐỂ NÂNG LÊN 10 ĐIỂM:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-900">
                    {latestResult.howToGetTen.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>

                  {/* KEY RETRY BUTTON */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleReturnToEdit}
                      className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Quay lại chỉnh sửa sản phẩm, lưu và tiếp tục chấm</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submission Attempts History */}
              {currentSubmission && currentSubmission.attempts.length > 1 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <History className="w-3.5 h-3.5" /> Tiến trình {currentSubmission.attempts.length} lần chấm:
                    </span>
                    <span className="text-emerald-600 font-bold">
                      Điểm cao nhất: {currentSubmission.highestScore}đ
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {currentSubmission.attempts.map((att) => (
                      <div
                        key={att.attemptNumber}
                        className={`px-3 py-1.5 rounded-lg border text-xs shrink-0 ${
                          att.score >= 10
                            ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        Lần {att.attemptNumber}: <strong className="font-bold">{att.score}đ</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons for Student to View/Download Results during Practice */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                {currentSubmission && onExportMySubmission && (
                  <button
                    type="button"
                    onClick={() => onExportMySubmission(currentSubmission)}
                    className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tải Kết Quả Của Nhóm Bạn (Excel)</span>
                  </button>
                )}

                {onOpenClassResults && (
                  <button
                    type="button"
                    onClick={onOpenClassResults}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-600" />
                    <span>Xem Bảng Điểm Cả Lớp</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* STANDBY CARD WHEN NOT YET GRADED */
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Cơ Chế Chấm Điểm AI Tự Động
                  </h3>
                  <p className="text-xs text-slate-500">
                    Đối chiếu với sản phẩm mẫu & kho lưu trữ chuẩn
                  </p>
                </div>
              </div>

              {/* 4-Step Lab Process */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quy Trình Thực Hành Phòng Máy:
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <strong className="text-slate-800">Cập nhật thành viên nhóm: </strong>
                      <span className="text-slate-600">Nhập tên trưởng nhóm và các bạn cùng nhóm, bấm nút 'Cập Nhật Thành Viên Nhóm' để lưu.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <strong className="text-slate-800">Tải tệp sản phẩm lên: </strong>
                      <span className="text-slate-600">Chọn tệp sản phẩm vừa tạo trên máy tính (Python, Pascal, C++, Web, Excel, Word, v.v.).</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <strong className="text-slate-800">Nhấn 'Chấm Điểm AI': </strong>
                      <span className="text-slate-600">Hệ thống AI sẽ tự động quét, đối chiếu sản phẩm với mẫu của giáo viên và trả kết quả tức thì.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-amber-50/80 rounded-xl border border-amber-200">
                    <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      4
                    </div>
                    <div>
                      <strong className="text-amber-900">Nếu điểm chưa tối ưu 10: </strong>
                      <span className="text-amber-800">Đọc hướng dẫn sửa lỗi của AI, quay lại máy chỉnh sửa, lưu tệp và tiếp tục nộp chấm cho đến khi đạt 10 điểm!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informative notice about Excel export */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Báo cáo Excel xuất đầy đủ <strong>tất cả học sinh trong nhóm theo thứ tự Máy 01, Máy 02...</strong> và có <strong>cột Tên riêng</strong> để thầy cô dễ dàng sắp xếp theo ABC!
                  </span>
                </div>
                {onOpenClassResults && (
                  <div className="pt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={onOpenClassResults}
                      className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Xem Bảng Điểm & Tải Kết Quả Lớp {userClassName}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
