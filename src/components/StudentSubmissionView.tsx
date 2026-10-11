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
  AlertTriangle,
  ListChecks,
  XCircle,
  Search,
} from 'lucide-react';
import { Assignment, Submission, SubmissionAttempt } from '../types';
import { SCHOOL_CLASSES, getClassesByGrade } from '../data/classes';
import {
  validateVietnameseFullName,
  getTodayDateString,
  formatPracticeDateVi,
  isSubmittedToday,
} from '../utils/storageManager';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import {
  StitchGreeting,
  StitchLaptop,
  StitchCelebrate,
  StitchEncourage,
  StitchUploadMascot,
  StitchDetective,
  StitchThumbsUp,
} from './StitchMascot';

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
    imageBase64?: string;
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

  // Danh sách các lớp tương ứng với Khối đang chọn (Yêu cầu 1: chọn Khối phải chọn đúng Lớp)
  const availableClasses = getClassesByGrade(selectedGradeFilter);

  // Xử lý khi học sinh bấm chuyển Khối
  const handleSwitchGrade = (grade: 'all' | 'Lớp 6' | 'Lớp 7' | 'Lớp 8' | 'Lớp 9') => {
    setSelectedGradeFilter(grade);
    const classesForGrade = getClassesByGrade(grade);
    // Nếu lớp hiện tại không thuộc khối mới chọn, đặt về rỗng để học sinh bắt buộc phải chọn lớp của khối đó!
    if (userClassName && !classesForGrade.includes(userClassName as any)) {
      onChangeClassName('');
    }
    // Chuyển sang bài tập đầu tiên của khối đó
    if (grade !== 'all') {
      const firstG = assignments.find((a) => a.gradeLevel === grade);
      if (firstG && activeAssignment?.gradeLevel !== grade) {
        onSelectAssignment(firstG.id);
      }
    }
    setErrorMsg(null);
  };

  // Form State
  const [machineNumber, setMachineNumber] = useState('Máy 05');
  const [studentLeader, setStudentLeader] = useState('');
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [groupSaveNotice, setGroupSaveNotice] = useState<string | null>(null);
  const [showConflictModal, setShowConflictModal] = useState<boolean>(false);

  // Dropdown chọn sản phẩm phía trên (Yêu cầu 8: nháy nút tam giác để mở/đóng danh sách)
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const productDropdownRef = useRef<HTMLDivElement>(null);

  // Filtered assignments according to the selected Grade filter
  const displayedAssignments = assignments.filter((assign) => {
    if (selectedGradeFilter === 'all') return true;
    return assign.gradeLevel === selectedGradeFilter;
  });

  // Chỉ số và bộ lọc tìm kiếm cho menu chọn sản phẩm phía trên (Yêu cầu 8)
  const currentAssignmentIndex = displayedAssignments.findIndex((a) => a.id === activeAssignmentId);
  const filteredDropdownAssignments = displayedAssignments.filter((assign) => {
    if (!productSearchTerm.trim()) return true;
    const term = productSearchTerm.toLowerCase();
    return (
      assign.title.toLowerCase().includes(term) ||
      assign.id.toLowerCase().includes(term) ||
      (assign.gradeLevel && assign.gradeLevel.toLowerCase().includes(term))
    );
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

  // Đóng danh sách sản phẩm khi nháy chuột ra ngoài hoặc ấn ESC
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
        setIsProductDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProductDropdownOpen(false);
      }
    };
    if (isProductDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProductDropdownOpen]);

  // =========================================================================
  // XỬ LÝ YÊU CẦU 3: QUẢN LÝ THEO BUỔI THỰC HÀNH (NGÀY) - KHÔNG LƯU DỒN NGÀY CŨ
  // =========================================================================
  const todayStr = getTodayDateString();

  // 1. Tìm bài nộp CỦA HÔM NAY (buổi học hiện tại) CỦA ĐÚNG HỌC SINH NÀY:
  const todaySubmission = mySubmissions.find(
    (s) =>
      s.assignmentId === activeAssignment?.id &&
      s.className === userClassName &&
      (
        (studentLeader.trim() && (
          s.studentLeader.trim().toLowerCase() === studentLeader.trim().toLowerCase() ||
          s.groupMembers.some((m) => m.trim().toLowerCase() === studentLeader.trim().toLowerCase())
        )) ||
        (!studentLeader.trim() && s.machineNumber === machineNumber)
      ) &&
      (s.practiceDate === todayStr || isSubmittedToday(s.latestSubmittedAt, todayStr))
  );

  // Kiểm tra xem số máy đang chọn hôm nay đã có bạn/nhóm nào nộp bài chưa
  const machineSubmissionToday = mySubmissions.find(
    (s) =>
      s.className === userClassName &&
      s.machineNumber === machineNumber &&
      (s.practiceDate === todayStr || isSubmittedToday(s.latestSubmittedAt, todayStr))
  );

  // Người dùng hiện tại có thuộc nhóm đã nộp trên máy này không
  const isSameStudentOrGroup = Boolean(
    machineSubmissionToday &&
    studentLeader.trim() &&
    (
      machineSubmissionToday.studentLeader.trim().toLowerCase() === studentLeader.trim().toLowerCase() ||
      machineSubmissionToday.groupMembers.some((m) => m.trim().toLowerCase() === studentLeader.trim().toLowerCase())
    )
  );

  // CẢNH BÁO XUNG ĐỘT TRÙNG SỐ MÁY: Khi máy đã có bạn khác nộp bài và tên học sinh đang nhập khác với bạn đó
  const isMachineConflict = Boolean(
    machineSubmissionToday &&
    studentLeader.trim() &&
    !isSameStudentOrGroup
  );

  // 2. Tìm bài nộp của ngày trước / tuần trước (lịch sử, không gộp dồn)
  const pastSubmissions = mySubmissions.filter(
    (s) =>
      s.assignmentId === activeAssignment?.id &&
      s.className === userClassName &&
      (s.machineNumber === machineNumber ||
        (studentLeader.trim() && s.studentLeader.toLowerCase() === studentLeader.trim().toLowerCase())) &&
      s.practiceDate !== todayStr &&
      !isSubmittedToday(s.latestSubmittedAt, todayStr)
  );

  pastSubmissions.sort((a, b) => {
    const tA = new Date(a.latestSubmittedAt || a.practiceDate || 0).getTime();
    const tB = new Date(b.latestSubmittedAt || b.practiceDate || 0).getTime();
    return tB - tA;
  });

  const latestPastSubmission = pastSubmissions[0];
  // Kết quả hiệu lực: Hôm nay nếu đã nộp -> hiển thị hôm nay. Chưa nộp hôm nay -> hiển thị phiên mới sẵn sàng!
  const currentSubmission = todaySubmission || latestPastSubmission;
  const isViewingPastDay = !todaySubmission && Boolean(latestPastSubmission);

  // Đồng bộ thông tin học sinh và thành viên nhóm
  useEffect(() => {
    if (currentSubmission && !studentLeader) {
      setStudentLeader(currentSubmission.studentLeader);
      setGroupMembers(currentSubmission.groupMembers || []);
    }
    if (todaySubmission) {
      if (todaySubmission.attempts.length > 0) {
        setLatestResult(todaySubmission.attempts[todaySubmission.attempts.length - 1]);
      }
    } else {
      // Sang ngày mới: chưa nộp bài hôm nay thì đặt kết quả lần này về trống để nộp lần 1 của ngày hôm nay
      setLatestResult(null);
    }
  }, [todaySubmission?.id, currentSubmission?.id]);

  // Xử lý thêm thành viên nhóm (Bắt buộc kiểm tra đầy đủ cả Họ và Tên)
  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const memberCheck = validateVietnameseFullName(newMemberName);
    if (!memberCheck.isValid) {
      setErrorMsg(`⚠️ Lỗi Họ và Tên bạn cùng nhóm: ${memberCheck.error}`);
      return;
    }
    if (groupMembers.includes(memberCheck.cleanName)) {
      setErrorMsg('⚠️ Bạn này đã có trong danh sách nhóm rồi!');
      return;
    }
    if (studentLeader.trim() && memberCheck.cleanName.toLowerCase() === studentLeader.trim().toLowerCase()) {
      setErrorMsg('⚠️ Bạn này đã được điền ở ô Người nộp / Nhóm trưởng!');
      return;
    }

    const updated = [...groupMembers, memberCheck.cleanName];
    setGroupMembers(updated);
    setNewMemberName('');
    setErrorMsg(null);

    // Tự động đồng bộ với bài nộp hiện tại nếu đã có trên hệ thống
    if (onUpdateGroupMembers && (todaySubmission || currentSubmission)) {
      onUpdateGroupMembers({
        className: userClassName,
        machineNumber,
        studentLeader: studentLeader.trim(),
        groupMembers: updated,
      });
      setGroupSaveNotice('Đã thêm bạn vào bài nộp thành công!');
      setTimeout(() => setGroupSaveNotice(null), 3000);
    }
  };

  // Xóa thành viên khỏi nhóm
  const handleRemoveMember = (idx: number) => {
    const updated = groupMembers.filter((_, i) => i !== idx);
    setGroupMembers(updated);
    if (onUpdateGroupMembers && (todaySubmission || currentSubmission)) {
      onUpdateGroupMembers({
        className: userClassName,
        machineNumber,
        studentLeader: studentLeader.trim(),
        groupMembers: updated,
      });
      setGroupSaveNotice('Đã cập nhật lại danh sách nhóm.');
      setTimeout(() => setGroupSaveNotice(null), 3000);
    }
  };

  // Lưu danh sách thành viên nhóm vào bài nộp
  const handleExplicitUpdateGroup = () => {
    if (!studentLeader.trim()) {
      setErrorMsg('⚠️ Vui lòng nhập Họ và Tên người nộp / nhóm trưởng trước khi lưu nhóm.');
      return;
    }
    if (onUpdateGroupMembers) {
      onUpdateGroupMembers({
        className: userClassName,
        machineNumber,
        studentLeader: studentLeader.trim(),
        groupMembers,
      });
      setGroupSaveNotice('Đã lưu danh sách thành viên nhóm vào hệ thống!');
      setTimeout(() => setGroupSaveNotice(null), 3500);
    }
  };

  // Ghép tên học sinh hiện tại vào nhóm đã nộp trên máy này
  const handleJoinExistingGroup = () => {
    if (!machineSubmissionToday) return;
    const cleanStudentName = studentLeader.trim();
    if (!cleanStudentName) return;

    const updatedMembers = machineSubmissionToday.groupMembers.includes(cleanStudentName)
      ? machineSubmissionToday.groupMembers
      : [...machineSubmissionToday.groupMembers, cleanStudentName];

    setStudentLeader(machineSubmissionToday.studentLeader);
    setGroupMembers(updatedMembers);
    setShowConflictModal(false);
    setErrorMsg(null);

    if (onUpdateGroupMembers) {
      onUpdateGroupMembers({
        className: userClassName,
        machineNumber,
        studentLeader: machineSubmissionToday.studentLeader,
        groupMembers: updatedMembers,
      });
      setGroupSaveNotice(`Đã ghép em (${cleanStudentName}) vào nhóm bạn ${machineSubmissionToday.studentLeader} thành công!`);
      setTimeout(() => setGroupSaveNotice(null), 4000);
    }
  };

  // Xác nhận vẫn nộp bài trên số máy này dù có cảnh báo trùng số máy
  const handleConfirmSubmitDespiteConflict = async () => {
    setShowConflictModal(false);
    const leaderCheck = validateVietnameseFullName(studentLeader);
    if (leaderCheck.isValid) {
      await executeGradingSubmission(leaderCheck.cleanName);
    }
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

    // If Word document (.docx)
    if (ext === 'docx') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const { value: rawText } = await mammoth.extractRawText({ arrayBuffer: buffer });
          let htmlText = '';
          try {
            const htmlRes = await mammoth.convertToHtml({ arrayBuffer: buffer });
            htmlText = htmlRes.value || '';
          } catch {}

          const cleanText = rawText.trim();
          const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
          const tableCount = (htmlText.match(/<table/gi) || []).length;
          const rowCount = (htmlText.match(/<tr/gi) || []).length;
          const hasHeading = /<h[1-6]|<strong>/i.test(htmlText);

          let summaryInfo = `[BÁO CÁO QUÉT TỆP VĂN BẢN WORD: ${file.name}]\n- Số từ: ${wordCount} từ | Bảng biểu: ${tableCount > 0 ? `${tableCount} bảng (${rowCount} dòng)` : 'Chưa có bảng'} | Tiêu đề: ${hasHeading ? 'Có' : 'Chưa rõ'}\n`;
          if (tableCount > 0) {
            summaryInfo += `[ĐÃ TẠO BẢNG BIỂU]: Phát hiện ${tableCount} bảng với ${rowCount} hàng dữ liệu.\n`;
          }

          setFileContent(
            `${summaryInfo}\nNỘI DUNG VĂN BẢN HỌC SINH ĐÃ SOẠN THẢO:\n${cleanText}`
          );
        } catch (docxErr) {
          console.warn('Mammoth extraction failed, trying JSZip fallback:', docxErr);
          try {
            const buffer = e.target?.result as ArrayBuffer;
            const zip = await JSZip.loadAsync(buffer);
            const docXml = await zip.file('word/document.xml')?.async('text');
            if (docXml) {
              const textOnly = docXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              const words = textOnly.split(/\s+/).filter(Boolean).length;
              setFileContent(`[BÁO CÁO QUÉT TỆP VĂN BẢN WORD: ${file.name} - ${words} từ]\n\nNỘI DUNG VĂN BẢN:\n${textOnly}`);
              return;
            }
          } catch {}
          setFileContent(`[Tài liệu Word: ${file.name}, dung lượng ${(file.size / 1024).toFixed(1)} KB]`);
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // If PowerPoint presentation (.pptx)
    if (ext === 'pptx') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const zip = await JSZip.loadAsync(buffer);
          let allSlides = `[BÀI TRÌNH CHIẾU POWERPOINT: ${file.name}]\n`;
          let slideCount = 0;
          const slideFiles = Object.keys(zip.files)
            .filter((k) => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'))
            .sort();

          for (const sFile of slideFiles) {
            slideCount++;
            const xml = await zip.file(sFile)?.async('text');
            if (xml) {
              const textOnly = xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              allSlides += `\n--- Trang chiếu ${slideCount} ---\n${textOnly}\n`;
            }
          }
          setFileContent(allSlides);
        } catch {
          setFileContent(`[Bài trình chiếu PowerPoint: ${file.name}]`);
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // If older Word (.doc)
    if (ext === 'doc') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const bytes = new Uint8Array(buffer);
          let text = '';
          for (let i = 0; i < bytes.length; i++) {
            const b = bytes[i];
            if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b >= 192) {
              text += String.fromCharCode(b);
            }
          }
          const clean = text.replace(/\s+/g, ' ').trim();
          if (clean.length > 30) {
            setFileContent(`[TÀI LIỆU WORD .DOC: ${file.name}]\n\nNỘI DUNG TRÍCH XUẤT:\n${clean.slice(0, 8000)}`);
          } else {
            setFileContent(`[Tệp văn bản Word .DOC: ${file.name}]`);
          }
        } catch {
          setFileContent(`[Tệp Word: ${file.name}]`);
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // Other formats (Scratch, PDF, etc.)
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

  // Thực hiện chấm điểm với AI & máy chủ
  const executeGradingSubmission = async (cleanLeaderName: string) => {
    if (!selectedFile) return;

    setErrorMsg(null);
    setIsGrading(true);
    setGradingStep('Hệ thống đang tải sản phẩm lên máy chủ...');

    try {
      setTimeout(() => setGradingStep('AI đang quét và đối chiếu nhanh với chuẩn sản phẩm...'), 200);
      setTimeout(() => setGradingStep('AI phân tích hình ảnh và tiêu chí thực hành...'), 500);

      const attemptResult = await onSubmitWork({
        assignmentId: activeAssignment.id,
        className: userClassName,
        machineNumber,
        studentLeader: cleanLeaderName,
        groupMembers,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileContent: fileContent,
        imageBase64: imagePreviewUrl || undefined,
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

  // Submit and grade with AI
  const handleGradeWithAI = async () => {
    // 1. KIỂM TRA CHỌN LỚP (Yêu cầu 1)
    if (!userClassName || !userClassName.trim()) {
      const gradeHint = selectedGradeFilter !== 'all' ? selectedGradeFilter : 'khối đã chọn';
      setErrorMsg(`⚠️ Bạn chưa chọn lớp! Vui lòng chọn lớp học của em (${gradeHint}) trước khi nộp bài.`);
      const classSelectElem = document.getElementById('student-class-select');
      if (classSelectElem) {
        classSelectElem.focus();
        classSelectElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 2. KIỂM TRA HỌ VÀ TÊN (Yêu cầu 1: Bắt buộc cả Họ và Tên, không được chỉ nhập mỗi Tên)
    if (!studentLeader.trim()) {
      setErrorMsg('⚠️ Vui lòng nhập đầy đủ Họ và tên người nộp / trưởng nhóm.');
      const nameElem = document.getElementById('student-leader-input');
      if (nameElem) {
        nameElem.focus();
        nameElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const leaderCheck = validateVietnameseFullName(studentLeader);
    if (!leaderCheck.isValid) {
      setErrorMsg(`⚠️ Lỗi Họ và Tên: ${leaderCheck.error}`);
      const nameElem = document.getElementById('student-leader-input');
      if (nameElem) {
        nameElem.focus();
        nameElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 3. KIỂM TRA TỆP ĐÍNH KÈM
    if (!selectedFile) {
      setErrorMsg('⚠️ Vui lòng chọn hoặc kéo thả tệp sản phẩm thực hành vào khung bên dưới.');
      const uploadElem = document.getElementById('student-upload-area');
      if (uploadElem) {
        uploadElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 4. KIỂM TRA CẢNH BÁO TRÙNG SỐ MÁY NẾU CÓ 2 NHÓM CÙNG CHỌN 1 MÁY
    if (isMachineConflict && machineSubmissionToday) {
      setShowConflictModal(true);
      return;
    }

    await executeGradingSubmission(leaderCheck.cleanName);
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
    <div className="w-full max-w-[99%] 2xl:max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================== */}
        {/* CỘT MENU BÊN TRÁI: CHỌN KHỐI 6 -> 7 -> 8 -> 9 & DANH SÁCH BÀI */}
        {/* ============================================================== */}
        <aside className="lg:col-span-4 xl:col-span-3.5 space-y-4 lg:sticky lg:top-4">
          {/* Card Stitch Mascot Chào Mừng */}
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 rounded-2xl p-4 sm:p-5 text-white shadow-md flex items-center gap-4 border border-blue-400/30">
            <StitchGreeting className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 drop-shadow-md" />
            <div className="min-w-0">
              <div className="text-xs font-black text-cyan-200 uppercase tracking-wider">
                Trợ Lý Môn Tin Học
              </div>
              <h2 className="text-lg sm:text-xl font-black leading-tight">
                Bạn Đồng Hành Stitch
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-snug">
                Cùng em thực hành đạt 10 điểm tuyệt đối!
              </p>
            </div>
          </div>

          {/* Menu Khối Lớp Lần Lượt từ Khối 6 đến Khối 9 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Menu Khối Lớp:
              </span>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                4 Khối Lớp
              </span>
            </div>

            <div className="space-y-2.5">
              {/* 1. KHỐI 6 */}
              <button
                type="button"
                onClick={() => handleSwitchGrade('Lớp 6')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl font-black text-base sm:text-lg transition-all ${
                  selectedGradeFilter === 'Lớp 6'
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400 ring-offset-1 scale-[1.01]'
                    : 'bg-slate-50 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 border border-slate-200/80'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-2xs ${
                      selectedGradeFilter === 'Lớp 6' ? 'bg-indigo-800 text-white' : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    K6
                  </span>
                  <span>Khối 6 (Tin Học 6)</span>
                </span>
                <span
                  className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full ${
                    selectedGradeFilter === 'Lớp 6' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  14 bài
                </span>
              </button>

              {/* 2. KHỐI 7 */}
              <button
                type="button"
                onClick={() => handleSwitchGrade('Lớp 7')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl font-black text-base sm:text-lg transition-all ${
                  selectedGradeFilter === 'Lớp 7'
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 ring-offset-1 scale-[1.01]'
                    : 'bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200/80'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-2xs ${
                      selectedGradeFilter === 'Lớp 7' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    K7
                  </span>
                  <span>Khối 7 (Tin Học 7)</span>
                </span>
                <span
                  className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full ${
                    selectedGradeFilter === 'Lớp 7' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  14 bài
                </span>
              </button>

              {/* 3. KHỐI 8 */}
              <button
                type="button"
                onClick={() => handleSwitchGrade('Lớp 8')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl font-black text-base sm:text-lg transition-all ${
                  selectedGradeFilter === 'Lớp 8'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400 ring-offset-1 scale-[1.01]'
                    : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 border border-slate-200/80'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-2xs ${
                      selectedGradeFilter === 'Lớp 8' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    K8
                  </span>
                  <span>Khối 8 (Tin Học 8)</span>
                </span>
                <span
                  className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full ${
                    selectedGradeFilter === 'Lớp 8' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  14 bài
                </span>
              </button>

              {/* 4. KHỐI 9 */}
              <button
                type="button"
                onClick={() => handleSwitchGrade('Lớp 9')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl font-black text-base sm:text-lg transition-all ${
                  selectedGradeFilter === 'Lớp 9'
                    ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400 ring-offset-1 scale-[1.01]'
                    : 'bg-slate-50 hover:bg-rose-50 text-slate-800 hover:text-rose-700 border border-slate-200/80'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-2xs ${
                      selectedGradeFilter === 'Lớp 9' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    K9
                  </span>
                  <span>Khối 9 (Tin Học 9)</span>
                </span>
                <span
                  className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full ${
                    selectedGradeFilter === 'Lớp 9' ? 'bg-rose-800 text-rose-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  14 bài
                </span>
              </button>

              {/* 5. TẤT CẢ CÁC KHỐI */}
              <button
                type="button"
                onClick={() => handleSwitchGrade('all')}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-sm sm:text-base transition-all ${
                  selectedGradeFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">🌐</span>
                  <span>Tất cả các khối</span>
                </span>
                <span className="text-xs sm:text-sm font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">56 bài</span>
              </button>
            </div>
          </div>

          {/* Thẻ Trạng Thái Bài Thực Hành Đang Làm (Gọn gàng trong cột trái) */}
          <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 rounded-2xl p-4 border border-blue-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-slate-600 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Bài đang chọn:
              </span>
              <span className="text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-md font-extrabold">
                {currentAssignmentIndex >= 0 ? `Bài ${currentAssignmentIndex + 1}` : 'Đang chọn'}
              </span>
            </div>
            <div className="text-sm font-black text-slate-900 line-clamp-2 leading-snug">
              {activeAssignment?.title}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsProductDropdownOpen(true);
                const el = document.getElementById('product-selector-area');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-blue-600 hover:text-white text-blue-700 text-xs sm:text-sm font-bold rounded-xl border border-blue-200 hover:border-blue-600 transition-all shadow-2xs cursor-pointer group"
            >
              <span>Đổi bài khác (nháy nút tam giác phía trên)</span>
              <span className="text-xs font-black group-hover:translate-y-0.5 transition-transform">▼</span>
            </button>
          </div>

          {/* Stitch Mascot Card Lời Khuyên */}
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
            <StitchLaptop className="w-16 h-16 shrink-0 drop-shadow-xs" />
            <div className="text-xs sm:text-sm text-amber-950 space-y-1">
              <div className="font-black text-amber-900 flex items-center gap-1.5 text-sm sm:text-base">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Mẹo của Stitch:
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-amber-800 font-medium">
                Đọc kỹ các bước hướng dẫn bên phải trước khi nộp để lấy trọn 10 điểm nhé!
              </p>
            </div>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* KHU VỰC CHÍNH BÊN PHẢI: THÔNG TIN BÀI, NỘP BÀI & KẾT QUẢ AI */}
        {/* ============================================================== */}
        <main className="lg:col-span-8 xl:col-span-8.5 space-y-5">
          {/* Card 1: Hướng Dẫn Chi Tiết Sản Phẩm Đang Chọn & Hộp Chọn Sản Phẩm */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            {/* ============================================================== */}
            {/* YÊU CẦU 8: MENU CHỌN SẢN PHẨM PHÍA TRÊN NƠI HIỂN THỊ TÊN SP    */}
            {/* Ô CHỌN SẢN PHẨM VỚI NÚT TAM GIÁC NHÁY SỔ RA DANH SÁCH          */}
            {/* ============================================================== */}
            <div id="product-selector-area" className="relative" ref={productDropdownRef}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-blue-600" />
                  <span>Chọn Sản Phẩm / Bài Thực Hành:</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {displayedAssignments.length} bài ({selectedGradeFilter !== 'all' ? selectedGradeFilter : 'Tất cả khối'})
                  </span>
                </label>
                <span className="text-xs text-slate-500 font-medium hidden sm:flex items-center gap-1">
                  Nháy nút tam giác <span className="font-extrabold text-blue-600 text-sm">▼</span> để mở danh sách chọn
                </span>
              </div>

              {/* Hộp chọn bài thực hành với nút tam giác */}
              <div className="flex items-stretch gap-2">
                <div
                  onClick={() => setIsProductDropdownOpen((prev) => !prev)}
                  className={`flex-1 cursor-pointer bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 hover:from-blue-100/70 hover:to-indigo-50/60 border-2 transition-all duration-200 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-xs select-none ${
                    isProductDropdownOpen
                      ? 'border-blue-500 ring-4 ring-blue-100 shadow-md bg-white'
                      : 'border-blue-200/90 hover:border-blue-400'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsProductDropdownOpen((prev) => !prev);
                    }
                  }}
                >
                  {/* Icon + Badge số thứ tự bài + Tên sản phẩm */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex flex-col items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                      <BookOpen className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-tighter leading-none mt-0.5">
                        {currentAssignmentIndex >= 0 ? `BÀI ${currentAssignmentIndex + 1}` : 'BÀI TẬP'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider ${
                            activeAssignment?.gradeLevel === 'Lớp 9'
                              ? 'bg-rose-100 text-rose-800'
                              : activeAssignment?.gradeLevel === 'Lớp 8'
                              ? 'bg-emerald-100 text-emerald-800'
                              : activeAssignment?.gradeLevel === 'Lớp 7'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {activeAssignment?.gradeLevel ? `Tin Học ${activeAssignment.gradeLevel}` : 'Tin Học'}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-600 font-semibold">
                          {activeAssignment?.steps?.length || 0} bước thực hiện
                        </span>
                        <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                        <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                          Chuẩn GDPT 2018
                        </span>
                      </div>
                      <div className="text-base sm:text-lg lg:text-xl font-black text-slate-900 truncate">
                        {activeAssignment?.title}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nút tam giác riêng biệt, nổi bật để học sinh nháy */}
                <button
                  type="button"
                  aria-label="Mở danh sách chọn sản phẩm"
                  onClick={() => setIsProductDropdownOpen((prev) => !prev)}
                  className={`px-4 sm:px-5 rounded-2xl flex flex-col items-center justify-center gap-1 shrink-0 transition-all duration-200 border-2 shadow-xs cursor-pointer ${
                    isProductDropdownOpen
                      ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 scale-[1.02]'
                      : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-300 hover:border-blue-500'
                  }`}
                  title="Nháy nút tam giác để mở danh sách chọn bài thực hành"
                >
                  <span
                    className={`inline-block text-base sm:text-lg transition-transform duration-200 leading-none ${
                      isProductDropdownOpen ? 'rotate-180 text-white' : 'text-blue-600'
                    }`}
                  >
                    ▼
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {isProductDropdownOpen ? 'Đóng' : 'Chọn bài'}
                  </span>
                </button>
              </div>

              {/* Menu Danh Sách Sản Phẩm Sổ Xuống khi nháy nút tam giác */}
              {isProductDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border-2 border-blue-400 shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Header menu sổ xuống */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-600" />
                      <span className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                        Danh Sách Sản Phẩm {selectedGradeFilter !== 'all' ? selectedGradeFilter : 'Tất Cả Khối'} ({displayedAssignments.length} bài)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsProductDropdownOpen(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      Đóng ✕
                    </button>
                  </div>

                  {/* Thanh tìm kiếm nhanh */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm bài thực hành theo tên hoặc số thứ tự..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                    />
                    {productSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setProductSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Danh sách các sản phẩm để học sinh bấm chọn */}
                  <div className="max-h-72 sm:max-h-80 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                    {filteredDropdownAssignments.length === 0 ? (
                      <div className="py-6 text-center text-sm text-slate-500 font-medium">
                        Không tìm thấy bài thực hành nào phù hợp với từ khóa "{productSearchTerm}"
                      </div>
                    ) : (
                      filteredDropdownAssignments.map((assign) => {
                        const isSelected = assign.id === activeAssignmentId;
                        const originalIdx = displayedAssignments.findIndex((a) => a.id === assign.id);
                        return (
                          <button
                            key={assign.id}
                            type="button"
                            onClick={() => {
                              onSelectAssignment(assign.id);
                              setIsProductDropdownOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 pt-2.5 cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white font-black shadow-xs ring-1 ring-blue-400'
                                : 'hover:bg-blue-50/90 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                  isSelected
                                    ? 'bg-white text-blue-700 shadow-2xs'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {originalIdx >= 0 ? originalIdx + 1 : '•'}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm sm:text-base font-bold truncate">
                                  {assign.title}
                                </div>
                                <div
                                  className={`text-xs ${
                                    isSelected ? 'text-blue-100' : 'text-slate-500'
                                  } flex items-center gap-2 mt-0.5`}
                                >
                                  <span>{assign.gradeLevel}</span>
                                  <span>•</span>
                                  <span>{assign.steps?.length || 0} bước thực hiện</span>
                                  {assign.toolRequired && (
                                    <>
                                      <span>•</span>
                                      <span>{assign.toolRequired}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isSelected ? (
                              <span className="shrink-0 flex items-center gap-1 text-xs font-black bg-white/20 px-2.5 py-1 rounded-full text-white">
                                <Check className="w-4 h-4 text-white" />
                                <span>Đang chọn</span>
                              </span>
                            ) : (
                              <span className="shrink-0 text-xs font-bold text-blue-600 group-hover:underline opacity-0 sm:opacity-100 hover:opacity-100">
                                Chọn bài này →
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Các Bước Thực Hiện Trên Máy Tính */}
            {activeAssignment?.steps && activeAssignment.steps.length > 0 && (
              <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-4">
                <div className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Các Bước Thực Hiện Trên Máy Tính:
                  </span>
                  <span className="text-xs sm:text-sm text-slate-500 font-semibold hidden sm:inline">
                    (Làm trên máy tính → Lưu tệp/Chụp ảnh → Nộp chấm bên dưới)
                  </span>
                </div>

                <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeAssignment.steps.map((st, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs"
                    >
                      <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 mt-0.5 shadow-2xs">
                        {i + 1}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">{st}</span>
                    </li>
                  ))}
                </ol>

                {activeAssignment.note && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-sm font-semibold flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>
                      <strong>Lưu ý:</strong> {activeAssignment.note}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Main Student Workspace Grid (Nộp Bài & Kết Quả AI) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột Trái (7 cols): Form Thông Tin Học Sinh & Tải Tệp Lên */}
            <div className="lg:col-span-7 space-y-5">
              {/* Card Thông Tin Học Sinh */}
              <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-2xs">
                      1
                    </span>
                    Thông Tin Học Sinh Thực Hành
                  </h2>
                  <span className="text-xs sm:text-sm text-slate-500 font-semibold">
                    (Điền thông tin trước khi nộp bài)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Lớp học */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-base font-bold text-slate-800">
                        Lớp đang thực hành <span className="text-rose-500">*</span>
                      </label>
                      {!userClassName && (
                        <span className="text-xs font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md animate-pulse">
                          CHƯA CHỌN LỚP
                        </span>
                      )}
                    </div>
                    <select
                      id="student-class-select"
                      value={userClassName}
                      onChange={(e) => {
                        onChangeClassName(e.target.value);
                        setErrorMsg(null);
                      }}
                      className={`w-full rounded-xl px-4 py-3 sm:py-3.5 text-base font-bold transition-all ${
                        !userClassName
                          ? 'border-2 border-rose-500 bg-rose-50 text-rose-900 focus:ring-2 focus:ring-rose-500 ring-2 ring-rose-200'
                          : 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                      }`}
                    >
                      <option value="" className="text-rose-700 font-bold bg-white">
                        -- Bắt buộc: Chọn lớp của em ({selectedGradeFilter !== 'all' ? selectedGradeFilter : 'Chọn khối & lớp'}) --
                      </option>
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls} className="text-slate-900 font-bold">
                          Lớp {cls}
                        </option>
                      ))}
                    </select>
                    {!userClassName && (
                      <p className="text-xs sm:text-sm font-bold text-rose-600 mt-1.5 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        Chưa chọn lớp! Vui lòng chọn lớp học trước khi nộp bài.
                      </p>
                    )}
                  </div>

                  {/* Vị trí máy */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-base font-bold text-slate-800">
                        Vị trí máy phòng Tin <span className="text-rose-500">*</span>
                      </label>
                      {isMachineConflict && (
                        <span className="text-xs font-black text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md animate-pulse">
                          TRÙNG SỐ MÁY
                        </span>
                      )}
                    </div>
                    <select
                      id="student-machine-select"
                      value={machineNumber}
                      onChange={(e) => setMachineNumber(e.target.value)}
                      className={`w-full rounded-xl px-4 py-3 sm:py-3.5 text-base font-bold transition-all ${
                        isMachineConflict
                          ? 'bg-amber-50 border-2 border-amber-500 text-amber-950 focus:ring-2 focus:ring-amber-500 ring-2 ring-amber-200'
                          : 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                      }`}
                    >
                      {Array.from({ length: 40 }, (_, i) => {
                        const num = String(i + 1).padStart(2, '0');
                        const mVal = `Máy ${num}`;
                        const subOnMachine = mySubmissions.find(
                          (s) =>
                            s.className === userClassName &&
                            s.machineNumber === mVal &&
                            (s.practiceDate === todayStr || isSubmittedToday(s.latestSubmittedAt, todayStr))
                        );

                        const isMine =
                          subOnMachine &&
                          studentLeader.trim() &&
                          (subOnMachine.studentLeader.trim().toLowerCase() === studentLeader.trim().toLowerCase() ||
                            subOnMachine.groupMembers.some((m) => m.trim().toLowerCase() === studentLeader.trim().toLowerCase()));

                        let label = mVal;
                        if (subOnMachine) {
                          if (isMine) {
                            label = `${mVal} ✅ [Bài của em: ${subOnMachine.studentLeader}]`;
                          } else {
                            label = `${mVal} ⚠️ [Đã có bài: ${subOnMachine.studentLeader}]`;
                          }
                        }

                        return (
                          <option
                            key={num}
                            value={mVal}
                            className={subOnMachine && !isMine ? 'text-amber-800 font-bold bg-amber-50' : 'text-slate-900 font-bold'}
                          >
                            {label}
                          </option>
                        );
                      })}
                    </select>

                    {/* Báo hiệu trạng thái số máy */}
                    {isMachineConflict && machineSubmissionToday ? (
                      <p className="text-xs sm:text-sm font-bold text-amber-700 mt-1.5 flex items-center gap-1.5 animate-pulse">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                        Trùng số máy: Đã có nhóm bạn "{machineSubmissionToday.studentLeader}" nộp bài!
                      </p>
                    ) : machineSubmissionToday && !studentLeader.trim() ? (
                      <p className="text-xs font-medium text-slate-500 mt-1.5 flex items-center gap-1">
                        <History className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        Máy này hôm nay đã có bài của bạn "{machineSubmissionToday.studentLeader}".
                      </p>
                    ) : null}
                  </div>

                  {/* Họ tên học sinh / Nhóm trưởng */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-base font-bold text-slate-800">
                        Họ và tên học sinh (hoặc Nhóm trưởng) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-xs sm:text-sm text-slate-500 font-medium">
                        (Bắt buộc cả Họ và Tên, ví dụ: Nguyễn Văn An)
                      </span>
                    </div>
                    <input
                      id="student-leader-input"
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn An (Bắt buộc cả Họ và Tên)"
                      value={studentLeader}
                      onChange={(e) => {
                        setStudentLeader(e.target.value);
                        setErrorMsg(null);
                      }}
                      className={`w-full rounded-xl px-4 py-3 sm:py-3.5 text-base font-bold transition-all ${
                        studentLeader.trim() && studentLeader.trim().split(/\s+/).length < 2
                          ? 'border-2 border-amber-500 bg-amber-50 text-slate-900 focus:ring-2 focus:ring-amber-500'
                          : 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white'
                      }`}
                    />
                    {studentLeader.trim() && studentLeader.trim().split(/\s+/).length < 2 && (
                      <p className="text-xs sm:text-sm font-bold text-amber-700 mt-1.5 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                        Em mới chỉ nhập tên "{studentLeader.trim()}". Bắt buộc nhập đầy đủ cả Họ và Tên (ví dụ: Nguyễn Văn {studentLeader.trim()})!
                      </p>
                    )}
                  </div>

                  {/* KHÔI PHỤC: Ô nhập Họ và Tên các thành viên trong nhóm */}
                  <div className="sm:col-span-2 pt-3 border-t border-slate-200/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="flex items-center gap-2 text-base font-bold text-slate-800">
                        <Users className="w-5 h-5 text-blue-600" />
                        Họ và tên các thành viên trong nhóm <span className="text-xs font-semibold text-slate-500">(nếu làm theo nhóm 2 - 3 bạn)</span>
                      </label>
                      <span className="text-xs text-slate-500 font-medium">
                        Làm cá nhân một mình: để trống
                      </span>
                    </div>

                    {/* Hàng nhập tên và nút thêm */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <input
                          id="group-member-input"
                          type="text"
                          placeholder="Nhập đầy đủ Họ và Tên bạn cùng nhóm (ví dụ: Trần Thị Bình)..."
                          value={newMemberName}
                          onChange={(e) => {
                            setNewMemberName(e.target.value);
                            setErrorMsg(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddMember();
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 sm:py-3.5 text-base font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder:font-normal placeholder:text-slate-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-base rounded-xl transition shadow-xs shrink-0 cursor-pointer"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Thêm bạn</span>
                      </button>
                    </div>

                    {/* Danh sách các bạn đã thêm vào nhóm */}
                    {groupMembers.length > 0 ? (
                      <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-blue-900 flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                            Đã thêm {groupMembers.length} bạn vào nhóm trên máy này:
                          </span>
                          {(todaySubmission || currentSubmission) && onUpdateGroupMembers && (
                            <button
                              type="button"
                              onClick={handleExplicitUpdateGroup}
                              className="text-xs font-bold text-blue-700 hover:text-blue-950 underline cursor-pointer"
                            >
                              Lưu vào kết quả
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {groupMembers.map((member, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-300 text-blue-950 font-bold text-sm rounded-lg shadow-2xs"
                            >
                              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-black">
                                {idx + 1}
                              </span>
                              <span>{member}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(idx)}
                                title={`Xóa ${member}`}
                                className="text-slate-400 hover:text-rose-600 transition p-0.5 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>

                        {groupSaveNotice && (
                          <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {groupSaveNotice}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-slate-500 italic flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                        Mẹo: Nếu 2-3 bạn ngồi chung máy làm bài cùng nhau, hãy nhập tên các bạn để được ghi nhận điểm và xuất danh sách Excel đầy đủ!
                      </p>
                    )}
                    {/* CẢNH BÁO TRÙNG SỐ MÁY NẾU CÓ 2 NHÓM CÙNG CHỌN 1 MÁY */}
                    {isMachineConflict && machineSubmissionToday && (
                      <div className="mt-3 p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-400 rounded-2xl shadow-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-6 h-6 text-amber-700 animate-bounce" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-black text-amber-950">
                                CẢNH BÁO TRÙNG SỐ MÁY: {machineNumber} đã được bạn khác nộp bài!
                              </h3>
                              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                                Trùng máy
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                              Số <strong>{machineNumber}</strong> trong lớp <strong>{userClassName}</strong> hôm nay đã có bạn{' '}
                              <strong className="text-amber-950 font-black underline">{machineSubmissionToday.studentLeader}</strong>
                              {machineSubmissionToday.groupMembers.length > 0 && (
                                <span> (cùng nhóm: {machineSubmissionToday.groupMembers.join(', ')})</span>
                              )}{' '}
                              nộp bài đạt <strong className="text-emerald-800 font-bold">{machineSubmissionToday.highestScore} điểm</strong>.
                            </p>
                            <p className="text-xs sm:text-sm text-amber-900 font-semibold pt-0.5">
                              Tên em đang nhập là: <strong className="text-rose-700 font-black">{studentLeader}</strong>.
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-white/85 rounded-xl border border-amber-300/80 text-xs sm:text-sm text-amber-950 space-y-1 font-medium">
                          <p className="font-bold flex items-center gap-1.5 text-amber-900">
                            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                            Hướng dẫn xử lý để không làm mất kết quả của nhau:
                          </p>
                          <p>• <strong>Nếu em ngồi máy khác:</strong> Hãy nhìn số dán trên màn hình/thùng máy tính và chọn lại đúng số máy của em.</p>
                          <p>• <strong>Nếu em cùng nhóm với bạn {machineSubmissionToday.studentLeader}:</strong> Bấm nút ghép vào nhóm bên dưới để cùng có tên trong bài nộp.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const selectElem = document.getElementById('student-machine-select');
                              selectElem?.focus();
                              selectElem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Chọn lại số máy khác</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleJoinExistingGroup}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Users className="w-4 h-4" />
                            <span>Em cùng nhóm với {machineSubmissionToday.studentLeader} (Ghép vào nhóm)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Tải Sản Phẩm Lên với Stitch Upload Mascot */}
              <div
                id="student-upload-area"
                className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-2xs">
                      2
                    </span>
                    Tải Sản Phẩm Lên Để Chấm Điểm
                  </h2>
                  <span className="text-xs sm:text-sm text-slate-500 font-semibold">
                    (Chọn tệp sản phẩm em vừa hoàn thành)
                  </span>
                </div>

                {/* Session Indicator Banner */}
                {isViewingPastDay && latestPastSubmission && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 space-y-1.5 shadow-2xs">
                    <div className="font-black flex items-center justify-between text-amber-950 text-sm sm:text-base">
                      <span className="flex items-center gap-2">
                        <History className="w-5 h-5 text-amber-700" />
                        Buổi thực hành hôm nay ({formatPracticeDateVi(todayStr)}): Bắt đầu phiên chấm mới
                      </span>
                      <span className="text-xs sm:text-sm font-black bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-300">
                        Lần trước: {latestPastSubmission.highestScore}đ
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-amber-800 font-medium">
                      Hệ thống không lưu dồn vào lần trước; kết quả hôm nay ghi nhận riêng cho buổi thực hành hôm nay. Lần làm trước ({formatPracticeDateVi(latestPastSubmission.practiceDate || latestPastSubmission.latestSubmittedAt)}) vẫn được lưu an toàn trong hệ thống.
                    </p>
                  </div>
                )}

                {todaySubmission && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-sm text-emerald-900 flex items-center justify-between shadow-2xs">
                    <span className="flex items-center gap-2.5 font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Buổi học hôm nay ({formatPracticeDateVi(todayStr)}): Đã nộp {todaySubmission.attempts.length} lần
                    </span>
                    <span className="font-black text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-200 text-sm">
                      Điểm cao nhất: {todaySubmission.highestScore}đ
                    </span>
                  </div>
                )}

                {/* Drag & Drop File Area với Stitch Upload Mascot */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all ${
                    selectedFile
                      ? 'border-emerald-400 bg-emerald-50/50 shadow-inner'
                      : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 hover:shadow-sm'
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
                    <div className="space-y-3.5">
                      {imagePreviewUrl ? (
                        <div className="relative mx-auto max-w-sm rounded-xl overflow-hidden border border-emerald-300 shadow-sm bg-white p-2">
                          <img
                            src={imagePreviewUrl}
                            alt="Ảnh minh chứng sản phẩm"
                            className="w-full max-h-56 object-contain rounded-lg"
                          />
                          <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                            Ảnh đã chọn
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                          <FileCheck className="w-10 h-10" />
                        </div>
                      )}
                      <div className="text-lg font-black text-slate-900">
                        {selectedFile.name}
                      </div>
                      <div className="text-sm text-slate-600 font-semibold">
                        Dung lượng: {(selectedFile.size / 1024).toFixed(1)} KB • Bấm để đổi tệp khác
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <StitchUploadMascot className="w-24 h-24 mx-auto drop-shadow-md animate-bounce" />
                      <div className="text-base sm:text-lg font-black text-slate-800">
                        Kéo và thả tệp sản phẩm thực hành vào đây, hoặc{' '}
                        <span className="text-blue-600 underline font-black">bấm để chọn từ máy</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 font-semibold flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        Hỗ trợ tệp Word (.docx), PowerPoint (.pptx), Excel (.xlsx), Code (.py, .cpp, .pas), ảnh chụp (.png, .jpg)...
                      </p>
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-sm font-bold flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Cảnh báo trùng số máy trước khi nộp */}
                {isMachineConflict && machineSubmissionToday && (
                  <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs sm:text-sm font-bold text-amber-900 flex items-center justify-between gap-2 shadow-2xs">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>Trùng số máy: Máy {machineNumber} đã được bạn "{machineSubmissionToday.studentLeader}" nộp bài!</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowConflictModal(true)}
                      className="text-xs px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-lg shrink-0 cursor-pointer"
                    >
                      Xem cảnh báo
                    </button>
                  </div>
                )}

                {/* AI Grading Submit Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isGrading}
                    onClick={handleGradeWithAI}
                    className={`w-full py-4 sm:py-5 px-6 rounded-2xl font-black text-lg sm:text-xl text-white flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.99] ${
                      isGrading
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl'
                    }`}
                  >
                    {isGrading ? (
                      <>
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span>{gradingStep || 'Hệ thống đang đối chiếu và chấm điểm AI...'}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6 text-amber-300" />
                        <span>
                          {currentSubmission ? 'Chấm Lại Bằng AI & Nâng Lên 10 Điểm' : 'Chấm Điểm AI (Đối Chiếu & Chấm Tự Động)'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Cột Phải (5 cols): Kết Quả Chấm AI & Bảng Đối Chiếu */}
            <div className="lg:col-span-5 space-y-5">
              {latestResult ? (
                /* Card Kết Quả Chấm Điểm AI */
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-5 animate-in fade-in duration-300">
                  {/* Header với Score */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-blue-600" />
                        Kết Quả Lần Chấm Thứ {latestResult.attemptNumber}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5 font-medium">
                        Học sinh: <strong className="text-slate-900 font-bold">{studentLeader || currentSubmission?.studentLeader}</strong>
                        {groupMembers.length > 0 && (
                          <span className="text-blue-700 font-bold"> • Nhóm: {groupMembers.join(', ')}</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Thời gian: {new Date(latestResult.timestamp).toLocaleTimeString('vi-VN')}
                      </div>
                    </div>

                    {/* Score badge */}
                    <div
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-sm border ${
                        latestResult.score >= 10
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : latestResult.score >= 8.5
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : latestResult.score >= 7.0
                          ? 'bg-blue-50 border-blue-300 text-blue-800'
                          : 'bg-orange-50 border-orange-300 text-orange-800'
                      }`}
                    >
                      <Trophy
                        className={`w-7 h-7 ${
                          latestResult.score >= 10 ? 'text-amber-500 animate-bounce' : 'text-current'
                        }`}
                      />
                      <div>
                        <span className="text-4xl font-black">{latestResult.score}</span>
                        <span className="text-sm font-bold text-slate-500"> / 10</span>
                      </div>
                    </div>
                  </div>

                  {/* Off-Topic Warning Alert */}
                  {latestResult.inspectionSummary?.isOffTopic && (
                    <div className="p-4 sm:p-5 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-2 text-rose-950 shadow-sm flex items-start gap-4">
                      <StitchDetective className="w-14 h-14 shrink-0 drop-shadow-xs" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-black text-sm sm:text-base text-rose-800">
                          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                          <span>CẢNH BÁO: TỆP NỘP CHƯA ĐÚNG NỘI DUNG BÀI THỰC HÀNH!</span>
                        </div>
                        <p className="text-xs sm:text-sm text-rose-900 leading-relaxed font-medium">
                          Hệ thống đã quét tệp nhưng không tìm thấy các nội dung, cấu trúc hoặc các bước thực hiện của bài <strong>{activeAssignment.title}</strong>. Hệ thống chấm điểm chính xác theo các bước chứ không cho điểm 8 tượng trưng. Vui lòng kiểm tra lại tệp bài làm!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status Banner với Stitch Illustration */}
                  {latestResult.score >= 10 ? (
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 p-4 sm:p-5 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-4 shadow-sm">
                      <StitchCelebrate className="w-16 h-16 shrink-0 drop-shadow-sm" />
                      <div>
                        <div className="font-black text-lg sm:text-xl">XUẤT SẮC 10/10! 🎉</div>
                        <div className="text-sm font-semibold text-slate-900 mt-0.5">
                          Stitch chúc mừng em! Sản phẩm đáp ứng trọn vẹn mọi yêu cầu và bước thực hành!
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 p-4 sm:p-5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-4 text-orange-950">
                        <StitchEncourage className="w-14 h-14 shrink-0 drop-shadow-xs" />
                        <div>
                          <div className="font-black text-base text-orange-900 flex items-center gap-1.5">
                            <Sparkles className="w-5 h-5 text-orange-600" />
                            Điểm chưa tối ưu 10 điểm? Em sửa lại theo hướng dẫn nhé!
                          </div>
                          <p className="text-xs sm:text-sm text-orange-800 leading-relaxed mt-1 font-medium">
                            Hệ thống luôn ghi nhận điểm cao nhất (<strong>{currentSubmission?.highestScore || latestResult.score}đ</strong>). Em mở lại bài trên máy, sửa và bấm chấm lại để nâng điểm!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bảng Đối Chiếu Từng Bước Thực Hiện */}
                  {latestResult.stepEvaluations && latestResult.stepEvaluations.length > 0 && (
                    <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                        <h4 className="text-sm sm:text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <ListChecks className="w-5 h-5 text-blue-600" />
                          Đối Chiếu Chi Tiết Từng Bước Thực Hiện:
                        </h4>
                        <span className="text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                          {latestResult.stepEvaluations.filter((s) => s.status === 'passed').length}/{latestResult.stepEvaluations.length} bước đạt
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {latestResult.stepEvaluations.map((step) => (
                          <div
                            key={step.stepNumber}
                            className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${
                              step.status === 'passed'
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                : step.status === 'partial'
                                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                                : 'bg-rose-50/70 border-rose-200 text-rose-950'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5 font-bold text-sm sm:text-base">
                                {step.status === 'passed' ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                ) : step.status === 'partial' ? (
                                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                )}
                                <span className="leading-snug">
                                  Bước {step.stepNumber}: {step.instruction}
                                </span>
                              </div>
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-wider shrink-0 ${
                                  step.status === 'passed'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : step.status === 'partial'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {step.status === 'passed' ? 'Đã đạt' : step.status === 'partial' ? 'Đạt một phần' : 'Chưa đạt'}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700 pl-7 leading-relaxed font-medium">
                              {step.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Comparison Summary */}
                  {latestResult.aiComparisonDetails && (
                    <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <h3 className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <SearchCheck className="w-5 h-5 text-blue-600" />
                        Nhận Xét Tổng Thể:
                      </h3>
                      <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                        {latestResult.aiComparisonDetails}
                      </p>
                    </div>
                  )}

                  {/* Strengths & Weaknesses */}
                  <div className="space-y-3">
                    {latestResult.strengths && latestResult.strengths.length > 0 && (
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                        <div className="text-sm font-black text-emerald-900 flex items-center gap-2">
                          <CheckCheck className="w-5 h-5 text-emerald-600" />
                          Điểm đã làm tốt:
                        </div>
                        <ul className="text-sm text-emerald-800 space-y-1 list-disc list-inside font-medium">
                          {latestResult.strengths.map((str, idx) => (
                            <li key={idx}>{str}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {latestResult.weaknesses && latestResult.weaknesses.length > 0 && latestResult.score < 10 && (
                      <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2">
                        <div className="text-sm font-black text-rose-900 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-rose-600" />
                          Chỗ còn thiếu / cần sửa lại:
                        </div>
                        <ul className="text-sm text-rose-800 space-y-1 list-disc list-inside font-medium">
                          {latestResult.weaknesses.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* HƯỚNG DẪN CÁC BƯỚC ĐỂ NÂNG LÊN 10 ĐIỂM */}
                  {latestResult.howToGetTen && latestResult.howToGetTen.length > 0 && latestResult.score < 10 && (
                    <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-xl space-y-3">
                      <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        HƯỚNG DẪN CÁC THAO TÁC ĐỂ NÂNG LÊN 10 ĐIỂM:
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-amber-900 font-medium">
                        {latestResult.howToGetTen.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Nút Quay Lại Chỉnh Sửa */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleReturnToEdit}
                          className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Quay lại chỉnh sửa sản phẩm trên máy và chấm lại</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submission Attempts History */}
                  {currentSubmission && currentSubmission.attempts.length > 1 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <History className="w-4 h-4" /> Tiến trình {currentSubmission.attempts.length} lần chấm:
                        </span>
                        <span className="text-emerald-700 font-bold">
                          Điểm cao nhất: {currentSubmission.highestScore}đ
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {currentSubmission.attempts.map((att) => (
                          <div
                            key={att.attemptNumber}
                            className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm shrink-0 font-medium ${
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

                  {/* Action Buttons for Student */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                    {currentSubmission && onExportMySubmission && (
                      <button
                        type="button"
                        onClick={() => onExportMySubmission(currentSubmission)}
                        className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                      >
                        <Download className="w-4 h-4 text-emerald-600" />
                        <span>Tải Kết Quả Nhóm Em (Excel)</span>
                      </button>
                    )}

                    {onOpenClassResults && (
                      <button
                        type="button"
                        onClick={onOpenClassResults}
                        className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Users className="w-4 h-4 text-slate-600" />
                        <span>Xem Bảng Điểm Cả Lớp</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* STANDBY CARD KHI CHƯA CHẤM */
                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                      <StitchDetective className="w-12 h-12 drop-shadow-xs" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base sm:text-lg">
                        Cơ Chế Chấm Điểm AI Tự Động
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Đối chiếu chính xác theo các bước thực hành và nội dung sản phẩm
                      </p>
                    </div>
                  </div>

                  {/* 4-Step Lab Process */}
                  <div className="space-y-3.5">
                    <div className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Quy Trình Thực Hành Phòng Máy:
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-2xs">
                          1
                        </div>
                        <div>
                          <strong className="text-slate-900 text-base">Điền thông tin học sinh: </strong>
                          <span className="text-slate-700 font-medium">Chọn lớp, chọn vị trí máy và nhập đầy đủ cả Họ và Tên.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-2xs">
                          2
                        </div>
                        <div>
                          <strong className="text-slate-900 text-base">Tải tệp sản phẩm lên: </strong>
                          <span className="text-slate-700 font-medium">Chọn tệp sản phẩm vừa tạo trên máy (Word, PowerPoint, Excel, Python, Code, v.v.).</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-2xs">
                          3
                        </div>
                        <div>
                          <strong className="text-slate-900 text-base">Nhấn 'Chấm Điểm AI': </strong>
                          <span className="text-slate-700 font-medium">Hệ thống AI quét nhanh đối chiếu từng bước và hiển thị kết quả ngay tức thì.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5 p-3.5 bg-amber-50/90 rounded-xl border border-amber-200">
                        <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-2xs">
                          4
                        </div>
                        <div>
                          <strong className="text-amber-950 text-base">Nếu điểm chưa tối ưu 10: </strong>
                          <span className="text-amber-800 font-medium">Đọc gợi ý của Stitch, mở lại bài sửa các chỗ còn thiếu rồi bấm chấm lại để đạt 10 điểm tuyệt đối!</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informative notice about Excel export */}
                  <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl text-sm text-blue-900 space-y-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        Báo cáo Excel xuất đầy đủ theo thứ tự <strong>Máy 01, Máy 02...</strong> và có <strong>cột Tên riêng</strong> để thầy cô dễ dàng sắp xếp theo ABC!
                      </span>
                    </div>
                    {onOpenClassResults && (
                      <div>
                        <button
                          type="button"
                          onClick={onOpenClassResults}
                          className="w-full py-3 px-4 bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-xs"
                        >
                          <Users className="w-4 h-4 text-blue-600" />
                          <span>Xem Bảng Điểm & Tải Kết Quả Lớp {userClassName || 'Cả Lớp'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {/* MODAL CẢNH BÁO TRÙNG SỐ MÁY KHI NỘP BÀI (NẾU CÓ 2 NHÓM CÙNG CHỌN 1 MÁY) */}
      {showConflictModal && machineSubmissionToday && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border-2 border-amber-300 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  Cảnh Báo Trùng Số Máy Phòng Tin!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Phát hiện 2 nhóm cùng chọn một số máy tính ({machineNumber})
                </p>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5 text-xs sm:text-sm text-amber-950 font-medium">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/70">
                <span className="font-bold text-slate-700">Vị trí máy:</span>
                <span className="font-black text-base text-amber-900">{machineNumber} (Lớp {userClassName})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Đã có bài của bạn:</span>
                <span className="font-bold text-slate-900">
                  {machineSubmissionToday.studentLeader}
                  {machineSubmissionToday.groupMembers.length > 0 && ` (+${machineSubmissionToday.groupMembers.length} bạn)`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Điểm của bạn đã nộp:</span>
                <span className="font-black text-emerald-700">{machineSubmissionToday.highestScore} / 10 điểm</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-amber-200/70">
                <span className="font-bold text-slate-700">Tên em đang nộp bài:</span>
                <span className="font-black text-rose-700 text-sm">{studentLeader}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              💡 <strong>Lưu ý quan trọng:</strong> Nếu em ngồi máy khác (do chọn nhầm số máy), hãy bấm <em>"Quay lại chọn đúng số máy"</em> để không làm mất kết quả của nhau. Nếu 2 em cùng nhóm trên máy này, hãy chọn <em>"Ghép tên vào nhóm"</em>.
            </p>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConflictModal(false);
                  const selectElem = document.getElementById('student-machine-select');
                  selectElem?.focus();
                  selectElem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Quay lại chọn đúng số máy em đang ngồi</span>
              </button>

              <button
                type="button"
                onClick={handleJoinExistingGroup}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Em cùng nhóm với {machineSubmissionToday.studentLeader} (Ghép vào nhóm)</span>
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={handleConfirmSubmitDespiteConflict}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold underline cursor-pointer"
                >
                  Vẫn tiếp tục nộp bài trên số máy này (Đã được thầy/cô cho phép)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
