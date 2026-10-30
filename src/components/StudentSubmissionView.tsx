import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UploadCloud,
  CheckCircle2,
  X,
  AlertCircle,
  FileText,
  RefreshCw,
  Trophy,
  Zap,
  BookOpen,
  ListChecks,
  AlertTriangle,
  Sparkles,
  Bot,
  UserCheck,
  Users,
  Lock,
  Unlock,
  Layers,
  Search,
  ChevronDown,
  Edit3,
  FileCode,
  FileSpreadsheet,
  FileCheck,
  HelpCircle,
  Award,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { Assignment, Submission, SubmissionAttempt } from '../types';
import {
  StitchGreeting,
  StitchLaptop,
  StitchCelebrate,
  StitchEncourage,
  StitchDetective,
  StitchUploadMascot,
  StitchThumbsUp,
} from './StitchMascot';

interface StudentSubmissionViewProps {
  assignments: Assignment[];
  activeAssignmentId: string;
  onSelectAssignment: (id: string) => void;
  selectedGrade: string;
  onSelectGrade: (grade: string) => void;
  userClassName: string;
  onChangeClassName: (name: string) => void;
  machineNumber: string;
  onChangeMachineNumber: (machine: string) => void;
  studentLeader: string;
  onChangeStudentLeader: (name: string) => void;
  groupMembers: string[];
  onChangeGroupMembers: (members: string[]) => void;
  mySubmissions: Submission[];
  onSubmitWork: (submissionData: {
    assignmentId: string;
    className: string;
    machineNumber: string;
    studentLeader: string;
    groupMembers: string[];
    fileName: string;
    fileSize: number;
    fileLastModified?: number;
    fileContent: string;
    fileDataUrl?: string;
    imageBase64?: string;
  }) => Promise<SubmissionAttempt | null>;
  onOpenStudentInfoModal: () => void;
  allowSubmission?: boolean;
  isTeacher?: boolean;
  onToggleSubmissionPermission?: (allow: boolean, targetClass?: string) => void;
}

export const StudentSubmissionView: React.FC<StudentSubmissionViewProps> = ({
  assignments,
  activeAssignmentId,
  onSelectAssignment,
  selectedGrade,
  onSelectGrade,
  userClassName,
  machineNumber,
  studentLeader,
  groupMembers,
  mySubmissions,
  onSubmitWork,
  onOpenStudentInfoModal,
  allowSubmission = true,
  isTeacher = false,
  onToggleSubmissionPermission,
}) => {
  // Active assignment
  const activeAssignment =
    assignments.find((a) => a.id === activeAssignmentId) || assignments[0];

  // Tab Menu Phải: 'mechanism' (Cơ chế chấm điểm) vs 'result' (Kết quả chấm AI)
  const [rightMenuTab, setRightMenuTab] = useState<'mechanism' | 'result'>('mechanism');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingStep, setGradingStep] = useState<string>('');
  const [latestResult, setLatestResult] = useState<SubmissionAttempt | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dropdown chọn bài thực hành
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tìm bài nộp hôm nay của học sinh này trên máy này
  const currentSubmission = mySubmissions.find(
    (s) =>
      s &&
      s.className === userClassName &&
      (s.machineNumber === machineNumber ||
        (studentLeader && s.studentLeader.trim().toLowerCase() === studentLeader.trim().toLowerCase()))
  );

  // Cập nhật kết quả mới nhất nếu đã có bài nộp trong phiên
  useEffect(() => {
    if (currentSubmission && currentSubmission.attempts.length > 0 && !latestResult) {
      const last = currentSubmission.attempts[currentSubmission.attempts.length - 1];
      setLatestResult(last);
      setRightMenuTab('result');
    }
  }, [currentSubmission, latestResult]);

  // Click outside to close assignment dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProductDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Danh sách bài tập theo khối đã chọn
  const displayedAssignments = assignments.filter((assign) => {
    if (!selectedGrade || selectedGrade === 'all') return true;
    return assign.gradeLevel === selectedGrade;
  });

  // Kiểm tra điều kiện mở khóa bài thực hành:
  // "Nguyên tắc là làm sản phẩm 1 chấm có điểm từ 5 trở lên mới được làm sản phẩm tiếp theo"
  const getPrerequisiteStatus = (assignIndex: number) => {
    if (isTeacher || assignIndex <= 0) {
      return { isUnlocked: true, prevAssignment: null, prevScore: 0 };
    }
    const prevAssignment = displayedAssignments[assignIndex - 1];
    if (!prevAssignment) {
      return { isUnlocked: true, prevAssignment: null, prevScore: 0 };
    }
    // Tìm điểm số cao nhất của bài trước đó cho học sinh này / máy này
    const prevSubs = mySubmissions.filter((s) => {
      if (!s) return false;
      if (s.assignmentId !== prevAssignment.id) return false;
      if (userClassName && s.className !== userClassName) return false;
      if (studentLeader && s.studentLeader.trim().toLowerCase() === studentLeader.trim().toLowerCase()) return true;
      if (machineNumber && s.machineNumber === machineNumber) return true;
      return false;
    });

    const maxScore = prevSubs.reduce((max, s) => Math.max(max, s.highestScore || 0), 0);
    return {
      isUnlocked: maxScore >= 5.0,
      prevAssignment,
      prevScore: maxScore,
    };
  };

  const currentAssignmentIndex = displayedAssignments.findIndex((a) => a.id === activeAssignmentId);
  const currentPrerequisite = getPrerequisiteStatus(currentAssignmentIndex);

  const filteredDropdownAssignments = displayedAssignments.filter((assign) => {
    if (!productSearchTerm.trim()) return true;
    const term = productSearchTerm.toLowerCase();
    return (
      assign.title.toLowerCase().includes(term) ||
      assign.id.toLowerCase().includes(term) ||
      (assign.gradeLevel && assign.gradeLevel.toLowerCase().includes(term))
    );
  });

  // Xử lý đọc tệp nộp nâng cao cho tất cả định dạng (Word, PowerPoint, Excel, Scratch, Python, Ảnh...)
  const processUploadedFile = async (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);
    setImagePreviewUrl(null);
    setFileDataUrl(null);

    // Lưu toàn vẹn dữ liệu nhị phân gốc (Data URL) để giáo viên tải về không bao giờ bị lỗi
    let currentDataUrl = '';
    try {
      currentDataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve((r.result as string) || '');
        r.onerror = () => resolve('');
        r.readAsDataURL(file);
      });
      if (currentDataUrl) {
        setFileDataUrl(currentDataUrl);
      }
    } catch (readErr) {
      console.warn('Lỗi đọc Data URL tệp nộp:', readErr);
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    // 1. File Word (.docx) - Trích xuất văn bản và bảng biểu thực tế bằng mammoth
    if (ext === 'docx') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const docText = (result.value || '').trim();
        setFileContent(
          docText
            ? `[NỘI DUNG VĂN BẢN WORD (.DOCX): ${file.name}]\n${docText}`
            : `[Tệp Word: ${file.name}, dung lượng ${file.size} bytes]`
        );
      } catch (err) {
        console.warn('Lỗi đọc Word bằng mammoth:', err);
        setFileContent(`[Tệp Word: ${file.name}, dung lượng ${file.size} bytes]`);
      }
    }
    // 2. File PowerPoint (.pptx, .ppt) - Trích xuất nội dung các trang slide bằng JSZip & ảnh minh họa
    else if (ext === 'pptx') {
      try {
        const zip = await JSZip.loadAsync(file);
        let pptxText = `[BÀI TRÌNH CHIẾU POWERPOINT (.PPTX): ${file.name}]\n`;
        const slideFiles = Object.keys(zip.files).filter(
          (name) => name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
        );
        slideFiles.sort((a, b) => {
          const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
          const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
          return numA - numB;
        });

        for (let i = 0; i < slideFiles.length; i++) {
          const slideXml = await zip.files[slideFiles[i]].async('text');
          const matches = slideXml.match(/<a:t>([^<]*)<\/a:t>/g) || [];
          const slideContent = matches.map((m) => m.replace(/<\/?a:t>/g, '')).join(' ');
          pptxText += `\n--- Slide ${i + 1} ---\n${slideContent}\n`;
        }
        setFileContent(pptxText);

        // Trích xuất hình ảnh đầu tiên trong PowerPoint (ppt/media/*) để AI thị giác chấm và xem trước
        const mediaFiles = Object.keys(zip.files).filter((n) =>
          n.startsWith('ppt/media/') && /\.(png|jpe?g|webp|gif|bmp)$/i.test(n)
        );
        if (mediaFiles.length > 0) {
          try {
            const firstMedia = mediaFiles[0];
            const mediaBase64 = await zip.files[firstMedia].async('base64');
            const mediaExt = firstMedia.split('.').pop()?.toLowerCase() || 'png';
            const mime = mediaExt === 'jpg' || mediaExt === 'jpeg' ? 'image/jpeg' : `image/${mediaExt}`;
            setImagePreviewUrl(`data:${mime};base64,${mediaBase64}`);
          } catch {}
        }
      } catch (err) {
        console.warn('Lỗi đọc PowerPoint bằng JSZip:', err);
        setFileContent(`[Tệp PowerPoint: ${file.name}, dung lượng ${file.size} bytes]`);
      }
    }
    // 3. File Lập trình Scratch (.sb3) - Phân tích cấu trúc khối lệnh bằng JSZip
    else if (ext === 'sb3') {
      try {
        const zip = await JSZip.loadAsync(file);
        if (zip.files['project.json']) {
          const jsonStr = await zip.files['project.json'].async('text');
          const project = JSON.parse(jsonStr);
          let sb3Summary = `[DỰ ÁN LẬP TRÌNH SCRATCH (.SB3): ${file.name}]\n`;
          if (Array.isArray(project.targets)) {
            sb3Summary += `Tổng số nhân vật / sân khấu: ${project.targets.length}\n`;
            project.targets.forEach((target: any, idx: number) => {
              sb3Summary += `\n[Đối tượng ${idx + 1}: ${target.name} (${target.isStage ? 'Sân khấu Stage' : 'Nhân vật Sprite'})]\n`;
              const blocks = target.blocks || {};
              const blockKeys = Object.keys(blocks);
              sb3Summary += `- Số lượng khối lệnh: ${blockKeys.length}\n`;
              const opcodes: string[] = [];
              blockKeys.forEach((k) => {
                const b = blocks[k];
                if (b && typeof b === 'object' && b.opcode) opcodes.push(b.opcode);
              });
              const uniqueOpcodes = Array.from(new Set(opcodes));
              sb3Summary += `- Các loại khối đã dùng: ${uniqueOpcodes.slice(0, 30).join(', ')}\n`;
              if (target.variables && Object.keys(target.variables).length > 0) {
                const varNames = Object.values(target.variables).map((v: any) => v[0]);
                sb3Summary += `- Biến số khởi tạo: ${varNames.join(', ')}\n`;
              }
            });
          }
          setFileContent(sb3Summary);
        } else {
          setFileContent(`[Dự án Scratch: ${file.name}, dung lượng ${file.size} bytes]`);
        }
      } catch (err) {
        console.warn('Lỗi đọc tệp Scratch .sb3:', err);
        setFileContent(`[Tệp Scratch .sb3: ${file.name}, dung lượng ${file.size} bytes]`);
      }
    }
    // 4. File Bảng tính Excel (.xlsx, .xls)
    else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(buffer, { type: 'array', cellFormula: true });
          let sheetDetails = `[BẢNG TÍNH EXCEL: ${file.name}]\n`;
          workbook.SheetNames.forEach((sheetName) => {
            sheetDetails += `\n--- TRANG TÍNH: ${sheetName} ---\n`;
            const worksheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            sheetDetails += csv.slice(0, 5000);
          });
          setFileContent(sheetDetails);
        } catch {
          setFileContent(`[Tệp Excel: ${file.name}, dung lượng ${file.size} bytes]`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
    // 5. File Hình ảnh sơ đồ / đồ họa (.png, .jpg, .jpeg, .webp, .svg, .bmp, .gif, .ico, .jfif)
    else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg', 'ico', 'jfif'].includes(ext)) {
      if (currentDataUrl) {
        setImagePreviewUrl(currentDataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setImagePreviewUrl(base64);
        };
        reader.readAsDataURL(file);
      }
      setFileContent(`[Tệp Hình Ảnh Đồ Họa: ${file.name}, dung lượng ${file.size} bytes]`);
    }
    // 6. File Văn bản, Code Python (.py), C++ (.cpp), HTML (.html), Text (.txt)
    else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileContent(text || `[Tệp sản phẩm: ${file.name}, dung lượng ${file.size} bytes]`);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Nộp bài và chấm AI
  const handleGradeWithAI = async () => {
    // 0. Kiểm tra quyền nộp bài
    if (!allowSubmission) {
      setErrorMsg('🔒 Giáo viên đang khóa nhận bài nộp. Thầy/Cô chưa bật cho phép nộp bài. Em hãy tiếp tục hoàn thiện trên máy nhé!');
      return;
    }

    // 0.1 Kiểm tra nguyên tắc mở khóa bài thực hành (Sản phẩm trước phải đạt >= 5.0đ)
    if (!currentPrerequisite.isUnlocked) {
      setErrorMsg(`🔒 Bạn chưa đủ điều kiện nộp bài này! Nguyên tắc phòng máy: Cần hoàn thành và đạt từ 5.0 điểm trở lên ở bài "${currentPrerequisite.prevAssignment?.title}" trước. (Điểm bài trước hiện tại: ${currentPrerequisite.prevScore > 0 ? currentPrerequisite.prevScore + 'đ' : 'Chưa có điểm'}).`);
      return;
    }

    // 1. Kiểm tra thông tin học sinh
    if (!userClassName || !studentLeader.trim()) {
      setErrorMsg('⚠️ Bạn chưa nhập thông tin học sinh (Lớp, Họ và Tên). Vui lòng nháy nút "Nhập Thông Tin" để hoàn tất trước khi nộp bài.');
      onOpenStudentInfoModal();
      return;
    }

    // 2. Kiểm tra tệp đính kèm
    if (!selectedFile) {
      setErrorMsg('⚠️ Vui lòng chọn tệp sản phẩm thực hành vừa hoàn thành trên máy tính.');
      return;
    }

    setErrorMsg(null);
    setIsGrading(true);
    setGradingStep('Hệ thống đang tải tệp sản phẩm lên máy chủ...');

    try {
      setTimeout(() => setGradingStep('AI đang đối chiếu từng bước với yêu cầu đề bài...'), 300);
      setTimeout(() => setGradingStep('AI phân tích cấu trúc sản phẩm và chuẩn Tin học...'), 700);

      const attemptResult = await onSubmitWork({
        assignmentId: activeAssignment.id,
        className: userClassName,
        machineNumber,
        studentLeader: studentLeader.trim(),
        groupMembers,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileLastModified: selectedFile.lastModified,
        fileContent: fileContent,
        fileDataUrl: fileDataUrl || imagePreviewUrl || undefined,
        imageBase64: imagePreviewUrl || undefined,
      });

      if (attemptResult) {
        setLatestResult(attemptResult);
        setRightMenuTab('result'); // Tự động chuyển menu phải sang tab Kết quả
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

  // Icon loại tệp
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    if (['py', 'cpp', 'html', 'js', 'sb3'].includes(ext || '')) return <FileCode className="w-5 h-5 text-indigo-600" />;
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  const hasStudentInfo = Boolean(userClassName && studentLeader.trim());

  return (
    <div className="w-full max-w-[99%] 2xl:max-w-[1900px] mx-auto px-2 sm:px-4 py-3 sm:py-4">
      {/* ============================================================== */}
      {/* BỐ CỤC 2 CỘT GỌN GÀNG TRONG 1 CỬA SỔ HIỂN THỊ (KHÔNG LĂN CHUỘT) */}
      {/* CỘT TRÁI (8 cols): THÔNG TIN NHÓM, CHỌN BÀI, CÁC BƯỚC RỘNG RÃI & TẢI TỆP STITCH */}
      {/* CỘT PHẢI (4 cols): MENU PHẢI THU HẸP - CƠ CHẾ CHẤM ĐIỂM AI & KẾT QUẢ */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-start">
        {/* ============================================================== */}
        {/* CỘT TRÁI (8 COLS): KHU VỰC THAO TÁC THỰC HÀNH CỦA HỌC SINH     */}
        {/* ============================================================== */}
        <section className="lg:col-span-8 xl:col-span-8 space-y-3">
          {/* 1. THANH THÔNG TIN HỌC SINH / NHÓM TRÊN MÁY (Chỉ hiển thị khi đã nhập, không hiển thị nhắc nhở thừa vì đã có nút Nhập thông tin) */}
          {hasStudentInfo && (
            <div className="p-2.5 sm:p-3 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-2 shadow-2xs bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-emerald-50/40 border-blue-200 animate-in fade-in">
              <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-bold min-w-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-black text-xs shadow-2xs">
                  {userClassName}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-900 font-bold text-xs">
                  🖥️ {machineNumber}
                </span>
                <span className="text-slate-800 font-extrabold flex items-center gap-1 truncate max-w-[200px] sm:max-w-none">
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  {studentLeader}
                </span>
                {groupMembers.length > 0 && (
                  <span className="text-blue-700 font-semibold text-xs hidden md:inline">
                    👥 +{groupMembers.length} bạn ({groupMembers.join(', ')})
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onOpenStudentInfoModal}
                className="px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer shrink-0 bg-white hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa thông tin</span>
              </button>
            </div>
          )}

          {/* 2. CHỌN SẢN PHẨM / BÀI THỰC HÀNH (Dropdown gọn gàng) */}
          <div className="relative" ref={productDropdownRef}>
            <div
              onClick={() => setIsProductDropdownOpen((prev) => !prev)}
              className={`cursor-pointer bg-white hover:bg-blue-50/40 border-2 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5 transition-all shadow-2xs select-none ${
                isProductDropdownOpen
                  ? 'border-blue-500 ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                  {currentAssignmentIndex >= 0 ? `B${currentAssignmentIndex + 1}` : 'BT'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    <span className="text-blue-700 font-black uppercase">
                      {activeAssignment?.gradeLevel || 'Tin Học'}
                    </span>
                    <span>•</span>
                    <span>{activeAssignment?.steps?.length || 0} bước thực hiện</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline text-slate-400">
                      {displayedAssignments.length} bài sẵn có
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 truncate">
                    {activeAssignment?.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-black">
                <span className="hidden sm:inline">Đổi bài</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isProductDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Menu Dropdown Chọn Bài */}
            {isProductDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border-2 border-blue-400 shadow-2xl p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Danh Sách Bài Thực Hành ({displayedAssignments.length} bài)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProductDropdownOpen(false)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ✕ Đóng
                  </button>
                </div>

                {/* Tìm kiếm bài nhanh */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên bài hoặc số thứ tự..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
                  {filteredDropdownAssignments.map((assign, idx) => {
                    const isSelected = assign.id === activeAssignmentId;
                    const originalIndex = displayedAssignments.findIndex((a) => a.id === assign.id);
                    const prereq = getPrerequisiteStatus(originalIndex);

                    return (
                      <button
                        key={assign.id}
                        type="button"
                        onClick={() => {
                          if (!prereq.isUnlocked) {
                            setErrorMsg(`🔒 Bài "${assign.title}" chưa mở khóa! Nguyên tắc phòng máy: Em cần hoàn thành bài "${prereq.prevAssignment?.title}" đạt từ 5.0 điểm trở lên trước. (Điểm bài trước: ${prereq.prevScore > 0 ? prereq.prevScore + 'đ' : 'Chưa có điểm'}).`);
                            setIsProductDropdownOpen(false);
                            return;
                          }
                          onSelectAssignment(assign.id);
                          setIsProductDropdownOpen(false);
                          setProductSearchTerm('');
                        }}
                        className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white font-black'
                            : !prereq.isUnlocked
                            ? 'bg-amber-50/50 hover:bg-amber-100/60 text-slate-700'
                            : 'hover:bg-blue-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : !prereq.isUnlocked
                                ? 'bg-amber-200 text-amber-950'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {!prereq.isUnlocked ? '🔒' : originalIndex + 1}
                          </span>
                          <span className={`text-xs truncate ${!prereq.isUnlocked ? 'font-semibold text-slate-700' : 'font-bold'}`}>
                            {assign.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!prereq.isUnlocked && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-300">
                              Cần SP{originalIndex} ≥ 5đ
                            </span>
                          )}
                          <span className={`text-[10px] font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {assign.gradeLevel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. VÙNG HIỂN THỊ CÁC BƯỚC THỰC HÀNH (MỞ RỘNG KÍCH THƯỚC & PHÓNG TO FONT CHỮ THEO YÊU CẦU) */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm sm:text-base uppercase tracking-tight">
                <ListChecks className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Yêu Cầu Bài Thực Hành & Các Bước Thực Hiện:</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl shadow-2xs shrink-0">
                Tệp nộp: {activeAssignment?.targetFile || 'Theo đề bài'}
              </span>
            </div>

            {/* Tiêu chí ngắn gọn / Mục tiêu bài */}
            {activeAssignment?.acceptanceCriteria && (
              <div className="p-2.5 sm:p-3 bg-blue-50/60 rounded-xl border border-blue-100/90 text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                🎯 <strong>Mục tiêu:</strong> {activeAssignment.acceptanceCriteria}
              </div>
            )}

            {/* Danh sách các bước với font chữ to rõ ràng, dễ nhìn từ xa */}
            {activeAssignment?.steps && activeAssignment.steps.length > 0 && (
              <div className="max-h-56 sm:max-h-64 lg:max-h-72 overflow-y-auto space-y-2 pr-1.5 bg-slate-50/80 p-2.5 sm:p-3 rounded-2xl border border-slate-200">
                {activeAssignment.steps.map((st, i) => (
                  <div
                    key={i}
                    className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3 hover:border-blue-300 transition-colors"
                  >
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-blue-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-xs sm:text-sm sm:text-[15px] font-semibold text-slate-800 leading-relaxed flex-1">
                      {st}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Đã xóa ô hiển thị tiêu chí tại đây theo yêu cầu của giáo viên */}
          </div>

          {/* 4. VÙNG TẢI SẢN PHẨM LÊN ĐỂ CHẤM ĐIỂM (CÓ HÌNH ẢNH ĐỘNG STITCH THEO YÊU CẦU) */}
          <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-blue-600" />
                <span>Tải Sản Phẩm Lên Để Chấm Điểm:</span>
              </span>
              <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
                (Định dạng: .docx, .xlsx, .pptx, .py, .sb3, .html, .png...)
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={!currentPrerequisite.isUnlocked}
              className="hidden"
              accept=".docx,.doc,.xlsx,.xls,.pptx,.ppt,.py,.cpp,.sb3,.html,.zip,.pdf,.png,.jpg,.jpeg"
            />

            {/* Cảnh báo khi bài chưa mở khóa do bài trước chưa đạt >= 5.0đ */}
            {!currentPrerequisite.isUnlocked && (
              <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 font-black text-sm">
                    🔒
                  </div>
                  <div>
                    <div className="font-black text-amber-950 text-xs sm:text-sm">
                      BÀI NÀY CHƯA MỞ KHÓA (CẦN ĐẠT ≥ 5.0Đ Ở BÀI TRƯỚC)
                    </div>
                    <div className="text-slate-700 mt-0.5 leading-relaxed">
                      Nguyên tắc phòng máy: Em cần hoàn thành bài <strong>{currentPrerequisite.prevAssignment?.title}</strong> đạt từ <strong>5.0 điểm trở lên</strong> mới được làm bài tiếp theo. (Điểm hiện tại bài trước: <strong>{currentPrerequisite.prevScore > 0 ? `${currentPrerequisite.prevScore}đ` : 'Chưa có điểm'}</strong>).
                    </div>
                  </div>
                </div>
                {currentPrerequisite.prevAssignment && (
                  <button
                    type="button"
                    onClick={() => onSelectAssignment(currentPrerequisite.prevAssignment!.id)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shrink-0 transition cursor-pointer shadow-xs"
                  >
                    ← Làm bài trước ngay
                  </button>
                )}
              </div>
            )}

            {/* Vùng Drop Area nhỏ gọn kèm hình ảnh động Stitch */}
            {!selectedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={currentPrerequisite.isUnlocked ? handleDrop : undefined}
                onClick={() => {
                  if (!currentPrerequisite.isUnlocked) {
                    setErrorMsg(`🔒 Bạn chưa thể nộp bài này! Cần hoàn thành bài "${currentPrerequisite.prevAssignment?.title}" đạt từ 5.0 điểm trở lên trước.`);
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                className={`min-h-[90px] sm:min-h-[96px] border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 sm:gap-4 transition-all p-2.5 sm:p-3 text-center sm:text-left group ${
                  !currentPrerequisite.isUnlocked
                    ? 'border-amber-300 bg-amber-50/40 cursor-not-allowed opacity-85'
                    : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50/50 bg-slate-50/60 cursor-pointer'
                }`}
              >
                {/* Hình ảnh động Stitch cầm thư mục bài nộp */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <StitchUploadMascot className="w-14 h-14 sm:w-16 sm:h-16 group-hover:scale-110 transition-transform drop-shadow-md animate-bounce [animation-duration:2.5s]" />
                  <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-white flex items-center justify-center shadow-xs ${!currentPrerequisite.isUnlocked ? 'bg-amber-600' : 'bg-blue-600'}`}>
                    {!currentPrerequisite.isUnlocked ? <Lock className="w-3 h-3" /> : <UploadCloud className="w-3 h-3" />}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap text-blue-700 font-black text-xs sm:text-sm sm:text-base">
                    <span>{!currentPrerequisite.isUnlocked ? 'Bài này đang tạm khóa' : 'Kéo thả tệp vào đây hoặc'}</span>
                    {currentPrerequisite.isUnlocked && (
                      <span className="underline decoration-2 text-indigo-700 hover:text-blue-900 font-black">
                        Chọn tệp trên máy
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-semibold mt-0.5">
                    {!currentPrerequisite.isUnlocked
                      ? 'Hoàn thành bài trước đạt từ 5.0 điểm trở lên để mở khóa nộp bài này nhé!'
                      : 'Stitch cùng AI sẽ đối chiếu từng bước và chấm điểm ngay cho em!'}
                  </p>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">
                    Hỗ trợ: Word (.docx), Excel (.xlsx), PowerPoint (.pptx), Python (.py), Scratch (.sb3), HTML, Ảnh...
                  </span>
                </div>
              </div>
            ) : (
              /* Thẻ tệp đã chọn kèm Stitch và thông tin tệp */
              <div className="p-2.5 sm:p-3 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-emerald-50/40 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <StitchLaptop className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-xs" />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-black text-slate-900 truncate flex items-center gap-1.5">
                      {getFileIcon(selectedFile.name)}
                      <span className="truncate">{selectedFile.name}</span>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Tệp đã sẵn sàng để nộp & chấm điểm
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs"
                  >
                    Đổi tệp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFileContent('');
                      setFileDataUrl(null);
                      setImagePreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer shadow-2xs"
                    title="Xóa tệp"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Thông báo lỗi nếu có */}
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Banner khi Giáo viên khóa nộp bài */}
            {!allowSubmission && (
              <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 flex items-center justify-between gap-2 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>GIÁO VIÊN ĐANG KHÓA NHẬN BÀI LỚP {userClassName?.toUpperCase()}</span>
                </div>
                {isTeacher && onToggleSubmissionPermission && (
                  <button
                    type="button"
                    onClick={() => onToggleSubmissionPermission(true, userClassName)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Mở nộp bài lớp {userClassName}
                  </button>
                )}
              </div>
            )}

            {/* 5. NÚT CHẤM ĐIỂM AI */}
            <button
              type="button"
              disabled={isGrading || !allowSubmission || !currentPrerequisite.isUnlocked}
              onClick={handleGradeWithAI}
              className={`w-full py-3 px-4 rounded-xl font-black text-sm sm:text-base text-white flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.99] cursor-pointer ${
                !currentPrerequisite.isUnlocked
                  ? 'bg-amber-600/80 cursor-not-allowed opacity-90'
                  : !allowSubmission
                  ? 'bg-slate-400 cursor-not-allowed opacity-90'
                  : isGrading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg'
              }`}
            >
              {!currentPrerequisite.isUnlocked ? (
                <>
                  <Lock className="w-5 h-5 text-white" />
                  <span>Chưa Mở Khóa (Cần Đạt ≥ 5.0đ Ở Bài Trước)</span>
                </>
              ) : !allowSubmission ? (
                <>
                  <Lock className="w-5 h-5 text-white" />
                  <span>Đang Khóa Nộp Bài (Chờ Thầy/Cô Bật Quyền Nộp)</span>
                </>
              ) : isGrading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{gradingStep || 'Hệ thống đang đối chiếu và chấm điểm AI...'}</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                  <span>
                    {latestResult
                      ? 'Chấm Lại Bằng AI & Nâng Lên 10 Điểm'
                      : 'Chấm Điểm AI (Đối Chiếu & Chấm Tự Động)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* ============================================================== */}
        {/* CỘT PHẢI (4 COLS): MENU PHẢI THU HẸP - CƠ CHẾ CHẤM AI & KẾT QUẢ */}
        {/* ============================================================== */}
        <aside className="lg:col-span-4 xl:col-span-4 space-y-3">
          {/* Card Menu Phải với Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Header Tabs của Menu Phải */}
            <div className="flex items-center border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => setRightMenuTab('mechanism')}
                className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  rightMenuTab === 'mechanism'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                <Bot className="w-4 h-4 text-blue-600" />
                <span>Cơ Chế Chấm AI</span>
              </button>

              <button
                type="button"
                onClick={() => setRightMenuTab('result')}
                className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                  rightMenuTab === 'result'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Kết Quả Chấm AI</span>
                {latestResult && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>
            </div>

            {/* Nội dung Tab 1: CƠ CHẾ CHẤM ĐIỂM AI TỰ ĐỘNG */}
            {rightMenuTab === 'mechanism' && (
              <div className="p-3 sm:p-3.5 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <StitchDetective className="w-8 h-8 drop-shadow-xs" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm leading-snug">
                      Cơ Chế Chấm Điểm AI Tự Động
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Đối chiếu theo chuẩn tri thức GDPT 2018
                    </p>
                  </div>
                </div>

                {/* 4 Bước Quy Trình Phòng Máy */}
                <div className="space-y-2 text-xs">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Quy Trình Thực Hành 4 Bước:</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <div className="leading-snug">
                        <strong className="text-slate-900">Nhập thông tin: </strong>
                        <span className="text-slate-600">Chọn khối, lớp, số máy và nhập đầy đủ cả Họ và Tên.</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <div className="leading-snug">
                        <strong className="text-slate-900">Tải tệp sản phẩm: </strong>
                        <span className="text-slate-600">Chọn tệp vừa thực hành trên máy (Word, Excel, PowerPoint, Python, Scratch...).</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <div className="leading-snug">
                        <strong className="text-slate-900">Nhấn 'Chấm Điểm AI': </strong>
                        <span className="text-slate-600">AI quét sâu nội dung, đối chiếu từng bước và trả điểm ngay.</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-amber-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        4
                      </span>
                      <div className="leading-snug text-amber-950">
                        <strong>Nâng lên 10 điểm: </strong>
                        <span>Đọc nhận xét bước thiếu, mở lại tệp sửa rồi bấm chấm lại để đạt 10 điểm tuyệt đối!</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tiêu chí chống lạc đề & chuẩn 10.0 */}
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1.5 text-xs text-blue-950 font-medium">
                  <div className="font-bold flex items-center gap-1.5 text-blue-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Quy Tắc Đánh Giá Công Bằng & Khách Quan:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-blue-900/90">
                    • Hệ thống chấm theo thang điểm 10.0 chuẩn, đối chiếu từng bước thực hiện của bài <strong>{activeAssignment.title}</strong>.
                  </p>
                  <p className="text-[11px] leading-relaxed text-blue-900/90">
                    • Tuyệt đối không chấm điểm 8 tượng trưng. Tệp nộp rỗng hoặc lạc đề sẽ bị chấm điểm thấp để nhắc nhở học sinh.
                  </p>
                </div>

                {/* Nút xem kết quả nếu đã có bài nộp */}
                {latestResult && (
                  <button
                    type="button"
                    onClick={() => setRightMenuTab('result')}
                    className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Trophy className="w-4 h-4 text-amber-300" />
                    <span>Xem Kết Quả Lần Chấm Mới Nhất ({latestResult.score}đ)</span>
                  </button>
                )}
              </div>
            )}

            {/* Nội dung Tab 2: KẾT QUẢ CHẤM ĐIỂM AI */}
            {rightMenuTab === 'result' && (
              <div className="p-3 sm:p-3.5 space-y-3 animate-in fade-in duration-150">
                {latestResult ? (
                  <>
                    {/* Header Điểm Số */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5 text-blue-600" />
                          <span>Lần chấm thứ {latestResult.attemptNumber}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 mt-0.5 truncate max-w-[180px]">
                          {studentLeader || currentSubmission?.studentLeader}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đã lưu vào CSDL máy chủ</span>
                        </div>
                      </div>

                      {/* Điểm lớn */}
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border shadow-2xs ${
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
                          className={`w-6 h-6 ${
                            latestResult.score >= 10 ? 'text-amber-500 animate-bounce' : 'text-current'
                          }`}
                        />
                        <div>
                          <span className="text-2xl sm:text-3xl font-black">{latestResult.score}</span>
                          <span className="text-xs font-bold opacity-75">/10</span>
                        </div>
                      </div>
                    </div>

                    {/* Banner Lời Khen hoặc Cảnh báo Sao Chép / Nhắc nhở */}
                    {latestResult.plagiarismAlert?.isCopied ? (
                      <div className="p-3.5 bg-rose-50 border-2 border-rose-500 rounded-xl space-y-2 text-rose-950 text-xs shadow-sm animate-in fade-in">
                        <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
                          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
                          <span>🚨 PHÁT HIỆN SAO CHÉP TỆP LỚP TRƯỚC</span>
                        </div>
                        <div className="text-[11px] leading-relaxed text-rose-900 bg-rose-100/70 p-2.5 rounded-lg border border-rose-200">
                          {latestResult.plagiarismAlert.message}
                        </div>
                        <div className="text-[11px] text-rose-800 font-medium">
                          ⚠️ <strong>Chế tài phòng thực hành:</strong> Hệ thống đã tự động khóa điểm 0.0đ và gửi cảnh báo trực tiếp lên <strong>Màn hình máy chiếu của Giáo viên</strong>. Em hãy tự tay mở phần mềm thực hành lại bài học này của nhóm mình!
                        </div>
                      </div>
                    ) : latestResult.score >= 10 ? (
                      <div className="p-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-2.5 shadow-2xs">
                        <StitchCelebrate className="w-9 h-9 shrink-0 drop-shadow-2xs" />
                        <div>
                          <div className="font-black text-sm">XUẤT SẮC 10/10 ĐIỂM! 🎉</div>
                          <div className="text-[11px] font-medium opacity-90">Sản phẩm đáp ứng trọn vẹn mọi yêu cầu đề bài!</div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-950 font-medium">
                        <StitchEncourage className="w-8 h-8 shrink-0 drop-shadow-2xs" />
                        <div>
                          <div className="font-bold text-amber-900">Chưa đạt 10 điểm tuyệt đối?</div>
                          <div className="text-[11px] text-amber-800">Mở lại tệp trên máy, hoàn thiện theo các bước bên dưới rồi bấm chấm lại nhé!</div>
                        </div>
                      </div>
                    )}

                    {/* BẢNG CHIẾT TÍNH ĐIỂM TỪNG TIÊU CHÍ (RUBRIC BREAKDOWN) */}
                    {latestResult.criteriaResults && latestResult.criteriaResults.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-black text-slate-800 uppercase">
                          <span className="flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>Chi Tiết Điểm Từng Tiêu Chí:</span>
                          </span>
                          <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-black text-[11px]">
                            {latestResult.criteriaResults.reduce((acc, c) => acc + (typeof c.score === 'number' ? c.score : 0), 0).toFixed(1)}/10đ
                          </span>
                        </div>

                        <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 text-xs">
                          {latestResult.criteriaResults.map((crit, idx) => {
                            const isFull = crit.score >= crit.maxScore;
                            const percent = Math.min(100, Math.round((crit.score / crit.maxScore) * 100));
                            return (
                              <div
                                key={crit.criterionId || idx}
                                className={`p-2 rounded-xl border space-y-1 ${
                                  isFull
                                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                    : crit.score > 0
                                    ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                                    : 'bg-rose-50/70 border-rose-200 text-rose-950'
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span className="truncate pr-1">
                                    {idx + 1}. {crit.criterionName}
                                  </span>
                                  <span
                                    className={`text-[11px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                                      isFull
                                        ? 'bg-emerald-200 text-emerald-900'
                                        : crit.score > 0
                                        ? 'bg-blue-200 text-blue-900'
                                        : 'bg-rose-200 text-rose-900'
                                    }`}
                                  >
                                    {crit.score} / {crit.maxScore}đ
                                  </span>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      isFull
                                        ? 'bg-emerald-500'
                                        : crit.score > 0
                                        ? 'bg-blue-500'
                                        : 'bg-rose-400'
                                    }`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>

                                {crit.feedback && (
                                  <p className="text-[11px] opacity-85 leading-snug">
                                    {crit.feedback}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Bảng đối chiếu từng bước (Scrollable nhỏ gọn) */}
                    {latestResult.stepEvaluations && latestResult.stepEvaluations.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-black text-slate-700 uppercase">
                          <span>Đối Chiếu Từng Bước:</span>
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-bold text-[11px]">
                            {latestResult.stepEvaluations.filter((s) => s.status === 'passed').length}/{latestResult.stepEvaluations.length} bước đạt
                          </span>
                        </div>

                        <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 text-xs">
                          {latestResult.stepEvaluations.map((step) => (
                            <div
                              key={step.stepNumber}
                              className={`p-2 rounded-xl border space-y-0.5 ${
                                step.status === 'passed'
                                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                  : step.status === 'partial'
                                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5 font-bold">
                                <span>Bước {step.stepNumber}: {step.instruction}</span>
                                <span className={`text-[10px] uppercase font-black shrink-0 px-1.5 py-0.5 rounded ${
                                  step.status === 'passed' ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                                }`}>
                                  {step.status === 'passed' ? 'Đạt' : 'Chưa đạt'}
                                </span>
                              </div>
                              <p className="text-[11px] opacity-85 leading-snug">{step.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gợi ý để đạt 10 điểm */}
                    {latestResult.howToGetTen && latestResult.howToGetTen.length > 0 && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Hướng Dẫn Nâng Lên 10 Điểm:</span>
                        </div>
                        <ul className="space-y-1 text-slate-700 pl-4 list-disc text-[11px]">
                          {latestResult.howToGetTen.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Nút quay lại Cơ chế chấm */}
                    <button
                      type="button"
                      onClick={() => setRightMenuTab('mechanism')}
                      className="w-full py-1.5 text-xs text-blue-700 hover:text-blue-900 font-bold hover:underline"
                    >
                      ← Xem lại quy trình & cơ chế chấm điểm AI
                    </button>
                  </>
                ) : (
                  /* Khi chưa có bài nộp nào */
                  <div className="py-8 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-700">Chưa Có Kết Quả Chấm Điểm</div>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Em hãy chọn tệp sản phẩm thực hành ở cột bên trái và bấm <strong>"Chấm Điểm AI"</strong> để xem kết quả đối chiếu tại đây.
                    </p>
                    <button
                      type="button"
                      onClick={() => setRightMenuTab('mechanism')}
                      className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 transition"
                    >
                      Xem cơ chế chấm điểm
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
