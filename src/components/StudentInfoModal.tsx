import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  UserCheck,
  GraduationCap,
  Monitor,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  BookOpen,
  RefreshCw,
  Edit2,
  Settings,
  Search,
} from 'lucide-react';
import {
  SCHOOL_CLASSES,
  getClassesByGrade,
  extractGradeDigit,
  normalizeClassName,
} from '../data/classes';
import { StudentRecord } from '../types';
import { parseStudentExcel } from '../utils/excelRosterParser';

interface StudentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrade: string; // 'Lớp 6' | 'Lớp 7' | 'Lớp 8' | 'Lớp 9'
  onSelectGrade: (grade: string) => void;
  className: string;
  onSelectClassName: (cls: string) => void;
  machineNumber: string;
  onChangeMachineNumber: (machine: string) => void;
  studentLeader: string;
  onChangeStudentLeader: (name: string) => void;
  groupMembers: string[];
  onChangeGroupMembers: (members: string[]) => void;
  onSavedNotice?: (msg: string) => void;
  roster?: StudentRecord[];
  existingSubmissions?: any[];
  onSaveRoster?: (students: StudentRecord[], mode?: 'accumulate' | 'upsert' | 'replace') => Promise<{ success: boolean; total: number; classes: string[] }>;
  onDeleteRoster?: (className?: string) => Promise<boolean>;
  onRenameClass?: (oldName: string, newName: string) => Promise<boolean>;
  onRefreshRoster?: () => Promise<void>;
  onOpenStudentRosterModal?: () => void;
  isTeacher?: boolean;
}

const GRADE_OPTIONS = [
  { id: 'Lớp 6', label: 'Khối 6 (Tin Học 6)', short: 'K6', color: 'indigo' },
  { id: 'Lớp 7', label: 'Khối 7 (Tin Học 7)', short: 'K7', color: 'blue' },
  { id: 'Lớp 8', label: 'Khối 8 (Tin Học 8)', short: 'K8', color: 'emerald' },
  { id: 'Lớp 9', label: 'Khối 9 (Tin Học 9)', short: 'K9', color: 'rose' },
];

export const StudentInfoModal: React.FC<StudentInfoModalProps> = ({
  isOpen,
  onClose,
  selectedGrade,
  onSelectGrade,
  className,
  onSelectClassName,
  machineNumber,
  onChangeMachineNumber,
  studentLeader,
  onChangeStudentLeader,
  groupMembers,
  onChangeGroupMembers,
  roster = [],
  existingSubmissions = [],
  onSaveRoster,
  onDeleteRoster,
  onRenameClass,
  onRefreshRoster,
  onOpenStudentRosterModal,
  isTeacher = false,
}) => {
  const [tempGrade, setTempGrade] = useState(selectedGrade || 'Lớp 6');
  const [tempClass, setTempClass] = useState(className || '6A1');
  const [tempMachine, setTempMachine] = useState(machineNumber || 'Máy 01');
  const [tempLeader, setTempLeader] = useState(studentLeader || '');
  const [tempMembers, setTempMembers] = useState<string[]>(groupMembers || []);
  const [selectedGroupMemberOption, setSelectedGroupMemberOption] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [isRefreshingRoster, setIsRefreshingRoster] = useState<boolean>(false);
  const [searchStudentQuery, setSearchStudentQuery] = useState<string>('');
  const [isManualNameMode, setIsManualNameMode] = useState<boolean>(false);

  // Modal xác nhận xóa danh sách lớp này
  const [isConfirmDeleteClassOpen, setIsConfirmDeleteClassOpen] = useState<boolean>(false);

  // Modal đổi tên lớp nhanh (ví dụ sửa nhầm 6B2 thành 6A2)
  const [isRenameClassOpen, setIsRenameClassOpen] = useState<boolean>(false);
  const [renameInput, setRenameInput] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const wasOpenRef = useRef<boolean>(false);

  // Toàn bộ các lớp thực tế có học sinh trong CSDL kèm số lượng học sinh
  const allRosterClassesWithCount = useMemo(() => {
    const map = new Map<string, { rawClass: string; normalized: string; count: number; gradeDigit: string; gradeLabel: string }>();
    roster.forEach((s) => {
      const raw = (s.className || '').trim();
      const norm = normalizeClassName(raw);
      if (!norm) return;
      const existing = map.get(norm);
      if (existing) {
        existing.count += 1;
      } else {
        const gradeDigit = extractGradeDigit(raw);
        map.set(norm, {
          rawClass: raw,
          normalized: norm,
          count: 1,
          gradeDigit,
          gradeLabel: gradeDigit ? `Lớp ${gradeDigit}` : 'Khác',
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.normalized.localeCompare(b.normalized, 'vi', { numeric: true }));
  }, [roster]);

  // Chỉ khởi tạo state khi modal được BẬT MỞ (không ghi đè khi người dùng đang thao tác nháy chọn khối/lớp)
  useEffect(() => {
    if (isOpen) {
      if (!wasOpenRef.current) {
        wasOpenRef.current = true;
        if (onRefreshRoster) onRefreshRoster();
        
        let initialGrade = selectedGrade || 'Lớp 6';
        let initialClass = className || '6A1';

        const gradeDigit = extractGradeDigit(initialGrade);
        const rosterInGrade = allRosterClassesWithCount.filter((c) => c.gradeDigit === gradeDigit);
        if (rosterInGrade.length > 0 && !rosterInGrade.some((c) => normalizeClassName(c.rawClass) === normalizeClassName(initialClass))) {
          initialClass = rosterInGrade[0].rawClass;
        } else if (allRosterClassesWithCount.length > 0 && !studentLeader) {
          const currentNorm = normalizeClassName(initialClass);
          const found = allRosterClassesWithCount.find((c) => normalizeClassName(c.rawClass) === currentNorm);
          if (!found) {
            const firstAvailable = allRosterClassesWithCount[0];
            initialClass = firstAvailable.rawClass;
            if (firstAvailable.gradeDigit) {
              initialGrade = `Lớp ${firstAvailable.gradeDigit}`;
            }
          }
        }

        setTempGrade(initialGrade);
        setTempClass(initialClass);
        setTempMachine(machineNumber || 'Máy 01');
        setTempLeader(studentLeader || '');
        setTempMembers(groupMembers || []);
        setSelectedGroupMemberOption('');
        setErrorMsg(null);
        setUploadNotice(null);
        setIsConfirmDeleteClassOpen(false);
        setIsRenameClassOpen(false);
        setIsManualNameMode(false);
        setSearchStudentQuery('');
      }
    } else {
      wasOpenRef.current = false;
    }
  }, [isOpen]);

  // Lọc danh sách lớp học sinh phù hợp với khối đã chọn
  const gradeDigit = extractGradeDigit(tempGrade);
  const defaultClasses = useMemo(() => getClassesByGrade(tempGrade), [tempGrade]);

  // Lấy các lớp từ CSDL phù hợp chính xác với khối đang chọn
  const matchedRosterClasses = useMemo(() => {
    return allRosterClassesWithCount
      .filter((c) => !gradeDigit || !c.gradeDigit || c.gradeDigit === gradeDigit)
      .map((c) => c.rawClass);
  }, [allRosterClassesWithCount, gradeDigit]);

  // Khi chọn khối nào, CHỈ hiển thị danh sách lớp thuộc khối đó
  const combinedClasses = useMemo(() => {
    if (matchedRosterClasses.length > 0) {
      return matchedRosterClasses;
    }
    return defaultClasses;
  }, [matchedRosterClasses, defaultClasses]);

  // Đổi khối lớp (K6, K7, K8, K9) mượt mà không bị kẹt hay quay về khối cũ
  const handleGradeChange = (newGrade: string) => {
    setTempGrade(newGrade);
    const newDigit = extractGradeDigit(newGrade);
    const rosterInNewGrade = allRosterClassesWithCount.filter((c) => c.gradeDigit === newDigit);
    if (rosterInNewGrade.length > 0) {
      setTempClass(rosterInNewGrade[0].rawClass);
    } else {
      const classesForNewGrade = getClassesByGrade(newGrade);
      setTempClass(classesForNewGrade[0] || (newDigit ? `${newDigit}A1` : '6A1'));
    }
    setTempLeader('');
    setTempMembers([]);
    setErrorMsg(null);
    setIsManualNameMode(false);
    setSearchStudentQuery('');
  };

  // PHÁT HIỆN MÁY TRÙNG TRONG TIẾT THỰC HÀNH CỦA LỚP ĐÓ:
  // Chỉ kiểm tra các bài nộp của lớp đang chọn (tempClass) trong phiên thực hành hôm nay
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const normalizedTempClass = useMemo(() => normalizeClassName(tempClass), [tempClass]);

  const duplicateOccupant = useMemo(() => {
    if (!Array.isArray(existingSubmissions) || !tempMachine) return null;
    const cleanMachine = tempMachine.trim().toLowerCase();
    const cleanLeader = (tempLeader || '').trim().toLowerCase();

    for (const sub of existingSubmissions) {
      if (!sub || !sub.machineNumber || !sub.studentLeader) continue;
      if (normalizeClassName(sub.className) !== normalizedTempClass) continue;
      
      const subDate = sub.practiceDate || (sub.latestSubmittedAt ? sub.latestSubmittedAt.slice(0, 10) : '');
      if (subDate && subDate !== todayStr) continue;

      if (sub.machineNumber.trim().toLowerCase() === cleanMachine) {
        const occ = sub.studentLeader.trim();
        // Nếu khác tên học sinh đang chọn -> ĐÃ CÓ BẠN KHÁC NGỒI MÁY NÀY
        if (occ.toLowerCase() !== cleanLeader) {
          return occ;
        }
      }
    }
    return null;
  }, [existingSubmissions, normalizedTempClass, tempMachine, tempLeader, todayStr]);

  // Danh sách học sinh của lớp đang chọn
  const classStudents = roster
    .filter((s) => {
      const sCls = normalizeClassName(s.className);
      return sCls === normalizedTempClass || (s.className || '').trim().toUpperCase() === (tempClass || '').trim().toUpperCase();
    })
    .sort((a, b) => {
      const sttA = Number(a.stt) || 999;
      const sttB = Number(b.stt) || 999;
      if (sttA !== sttB) return sttA - sttB;
      return a.fullName.localeCompare(b.fullName, 'vi');
    });

  const filteredStudents = classStudents.filter((s) => {
    if (!searchStudentQuery.trim()) return true;
    const q = searchStudentQuery.trim().toLowerCase();
    return s.fullName.toLowerCase().includes(q) || String(s.stt) === q;
  });

  // Tải lên tệp Excel danh sách học sinh trực tiếp tại modal (CHỈ GIÁO VIÊN)
  const handleUploadExcelDirect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTeacher) return;
    const file = e.target.files?.[0];
    if (!file || !onSaveRoster) return;

    setIsUploading(true);
    setErrorMsg(null);
    setUploadNotice(null);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseStudentExcel(buffer);
      // Mode 'replace': Thay thế đúng các lớp trong danh sách, xóa các lớp cũ khác
      const saveRes = await onSaveRoster(result.students, 'replace');
      if (saveRes.success) {
        setUploadNotice(`Đã nạp thành công ${result.students.length} học sinh (${saveRes.classes.join(', ')}) vào CSDL! Các lớp khác đã được dọn sạch.`);
        if (saveRes.classes.length > 0) {
          const firstCls = saveRes.classes[0];
          setTempClass(firstCls);
          const firstDigit = extractGradeDigit(firstCls);
          if (firstDigit) setTempGrade(`Lớp ${firstDigit}`);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi xử lý tệp Excel');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // CHỈ RETURN NULL SAU KHI TẤT CẢ CÁC HOOK ĐÃ ĐƯỢC GỌI VÔ ĐIỀU KIỆN
  if (!isOpen) return null;

  // Nạp danh sách học sinh mẫu chuẩn để dùng ngay (CHỈ GIÁO VIÊN)
  const handleLoadDemoRoster = async () => {
    if (!isTeacher || !onSaveRoster) return;
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const demoData: StudentRecord[] = [
        { stt: 1, fullName: 'Nguyễn Văn An', className: '8A1' },
        { stt: 2, fullName: 'Trần Thị Bình', className: '8A1' },
        { stt: 3, fullName: 'Lê Hoàng Cường', className: '8A1' },
        { stt: 4, fullName: 'Phạm Thu Dung', className: '8A1' },
        { stt: 5, fullName: 'Đinh Tiến Đạt', className: '8A1' },
        { stt: 1, fullName: 'Phạm Đức Dũng', className: '8A2' },
        { stt: 2, fullName: 'Hoàng Thu Giang', className: '8A2' },
        { stt: 3, fullName: 'Ngô Văn Hùng', className: '8A2' },
        { stt: 4, fullName: 'Mai Thanh Hương', className: '8A2' },
        { stt: 5, fullName: 'Đỗ Quốc Khánh', className: '8A2' },
        { stt: 1, fullName: 'Vũ Minh Hải', className: '9A1' },
        { stt: 2, fullName: 'Đỗ Phương Linh', className: '9A1' },
        { stt: 3, fullName: 'Bùi Quốc Tuấn', className: '9A1' },
      ];
      await onSaveRoster(demoData, 'replace');
      setUploadNotice('Đã nạp 13 học sinh mẫu (8A1, 8A2, 9A1) vào CSDL hệ thống thành công!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi nạp danh sách mẫu.');
    } finally {
      setIsUploading(false);
    }
  };

  // XÓA DANH SÁCH LỚP NÀY KHỎI CSDL (CHỈ GIÁO VIÊN - Học sinh tuyệt đối không có quyền)
  const handleExecuteDeleteCurrentClass = async () => {
    if (!isTeacher || !onDeleteRoster || !tempClass) return;
    setIsActionLoading(true);
    setErrorMsg(null);
    try {
      await onDeleteRoster(tempClass);
      setTempLeader('');
      setTempMembers([]);
      setUploadNotice(`Đã xóa vĩnh viễn toàn bộ danh sách học sinh Lớp ${tempClass} khỏi CSDL hệ thống!`);
      setIsConfirmDeleteClassOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi xóa danh sách lớp.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // ĐỔI TÊN LỚP NHANH TRONG CSDL (CHỈ GIÁO VIÊN)
  const handleExecuteRenameCurrentClass = async () => {
    if (!isTeacher || !onRenameClass || !tempClass || !renameInput.trim()) return;
    const targetNewName = renameInput.trim().toUpperCase().replace(/^LỚP\s*|^LOP\s*/i, '');
    if (targetNewName === tempClass.trim().toUpperCase()) {
      setIsRenameClassOpen(false);
      return;
    }

    setIsActionLoading(true);
    setErrorMsg(null);
    try {
      await onRenameClass(tempClass, targetNewName);
      setTempClass(targetNewName);
      setUploadNotice(`Đã đổi tên toàn bộ ${classStudents.length} học sinh từ Lớp ${tempClass} sang Lớp ${targetNewName} trong CSDL thành công!`);
      setIsRenameClassOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi đổi tên lớp.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Thêm thành viên vào nhóm (Chọn từ danh sách)
  const handleAddMember = () => {
    if (!selectedGroupMemberOption) return;
    if (tempMembers.includes(selectedGroupMemberOption)) {
      setErrorMsg(`Bạn "${selectedGroupMemberOption}" đã có trong danh sách nhóm.`);
      return;
    }
    if (tempLeader === selectedGroupMemberOption) {
      setErrorMsg(`"${selectedGroupMemberOption}" đã là người nộp chính.`);
      return;
    }
    setTempMembers((prev) => [...prev, selectedGroupMemberOption]);
    setSelectedGroupMemberOption('');
    setErrorMsg(null);
  };

  // Xóa thành viên
  const handleRemoveMember = (idx: number) => {
    setTempMembers((prev) => prev.filter((_, i) => i !== idx));
    setErrorMsg(null);
  };

  // Lưu và cập nhật
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Kiểm tra Lớp
    if (!tempClass.trim()) {
      setErrorMsg('⚠️ Vui lòng chọn lớp học của em.');
      return;
    }

    // 2. Kiểm tra Số máy & Chống Trùng Máy
    if (!tempMachine.trim()) {
      setErrorMsg('⚠️ Vui lòng chọn số máy tính đang ngồi.');
      return;
    }

    if (duplicateOccupant) {
      setErrorMsg(`⚠️ CẢNH BÁO TRÙNG SỐ MÁY: ${tempMachine} đã có bạn "${duplicateOccupant}" đăng ký/nộp bài trong tiết thực hành Lớp ${tempClass}. Nếu em quên chọn số máy hoặc ngồi máy khác, vui lòng chọn lại đúng số máy của mình.`);
      return;
    }

    // 3. Kiểm tra Họ và Tên học sinh từ danh sách
    if (!tempLeader.trim()) {
      setErrorMsg(`⚠️ Vui lòng chọn tên em từ danh sách học sinh Lớp ${tempClass}.`);
      return;
    }

    // Cập nhật lên cấp ứng dụng
    onSelectGrade(tempGrade);
    onSelectClassName(tempClass);
    onChangeMachineNumber(tempMachine);
    onChangeStudentLeader(tempLeader);
    onChangeGroupMembers(tempMembers);

    // Lưu bền vững vào localStorage
    try {
      localStorage.setItem('labgrade_user_class', tempClass);
      localStorage.setItem('labgrade_machine_number', tempMachine);
      localStorage.setItem('labgrade_student_leader', tempLeader);
      localStorage.setItem('labgrade_group_members', JSON.stringify(tempMembers));
      localStorage.setItem('labgrade_selected_grade', tempGrade);
    } catch {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all scale-100 max-h-[92vh] flex flex-col my-auto relative">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <UserCheck className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl leading-tight">
                Nhập Thông Tin Thực Hành
              </h3>
              <p className="text-xs text-blue-100 font-medium">
                Chọn khối, lớp, vị trí máy và tên học sinh theo danh sách lớp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-800">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs sm:text-sm font-bold flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {uploadNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs sm:text-sm font-bold flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{uploadNotice}</span>
            </div>
          )}

          {/* 1. CHỌN KHỐI LỚP */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>1. Chọn Khối Lớp:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GRADE_OPTIONS.map((g) => {
                const isSelected = tempGrade === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleGradeChange(g.id)}
                    className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                        : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-xs opacity-80 uppercase">{g.short}</span>
                    <span>{g.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CHỌN LỚP HỌC & SỐ MÁY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Lớp Học */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>2. Chọn Lớp Học:</span>
                </label>
                {isTeacher && onOpenStudentRosterModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenStudentRosterModal();
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    title="Mở cửa sổ Quản lý & Tải lên DS Học Sinh"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quản lý file Excel</span>
                  </button>
                )}
              </div>

              <select
                value={tempClass}
                onChange={(e) => {
                  setTempClass(e.target.value);
                  setTempLeader('');
                  setTempMembers([]);
                  setErrorMsg(null);
                  setUploadNotice(null);
                }}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-bold text-slate-900 transition outline-none cursor-pointer"
              >
                {combinedClasses.map((c) => {
                  const count = roster.filter((s) => s.className.toUpperCase() === c.toUpperCase()).length;
                  return (
                    <option key={c} value={c}>
                      Lớp {c} ({tempGrade}){count > 0 ? ` • ${count} HS trong CSDL` : ' • Chưa có DS'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Số Máy Tính */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-blue-600" />
                <span>3. Số Máy Phòng Học:</span>
              </label>
              <select
                value={tempMachine}
                onChange={(e) => {
                  setTempMachine(e.target.value);
                  setErrorMsg(null);
                }}
                className={`w-full border-2 rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-bold transition outline-none cursor-pointer ${
                  duplicateOccupant
                    ? 'bg-amber-50 border-amber-400 text-amber-950 focus:ring-2 focus:ring-amber-300'
                    : 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900'
                }`}
              >
                {Array.from({ length: 45 }, (_, i) => {
                  const mStr = `Máy ${String(i + 1).padStart(2, '0')}`;
                  return (
                    <option key={mStr} value={mStr}>
                      {mStr}
                    </option>
                  );
                })}
              </select>
              {duplicateOccupant && (
                <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs font-semibold flex items-start gap-2 mt-1.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span>⚠️ <strong>Máy này đã có bạn "{duplicateOccupant}" chọn/nộp bài</strong> trong tiết thực hành Lớp {tempClass}.</span>
                    <p className="text-[11px] text-amber-800 font-normal mt-0.5">Nếu em ngồi máy khác hoặc quên chọn số máy, em hãy chọn lại đúng số máy của mình nhé!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. HỌ VÀ TÊN HỌC SINH (CHỈ DẠNG LIST CHỌN ĐỂ TRÁNH NHẬP NGOÀI DANH SÁCH LỚP) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>4. Họ và Tên Học Sinh (Người nộp bài):</span>
              </label>

              <div className="flex items-center gap-2 flex-wrap">
                {classStudents.length > 0 && (
                  <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    DS Lớp {tempClass} ({classStudents.length} HS)
                  </span>
                )}
                {onRefreshRoster && (
                  <button
                    type="button"
                    disabled={isRefreshingRoster}
                    onClick={async () => {
                      setIsRefreshingRoster(true);
                      await onRefreshRoster();
                      setIsRefreshingRoster(false);
                    }}
                    className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition cursor-pointer"
                    title="Đồng bộ danh sách học sinh mới nhất từ CSDL máy chủ"
                  >
                    <RefreshCw className={`w-3 h-3 text-blue-600 ${isRefreshingRoster ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingRoster ? 'Đang tải...' : 'Làm mới DS'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Thanh công cụ quản lý nhanh CHỈ DÀNH CHO GIÁO VIÊN (Học sinh tuyệt đối KHÔNG có quyền xóa hay sửa CSDL lớp) */}
            {isTeacher && classStudents.length > 0 && (
              <div className="flex items-center justify-between flex-wrap gap-2 p-2.5 bg-emerald-50/80 border border-emerald-300 rounded-xl text-xs">
                <div className="text-emerald-950 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>CSDL Lớp {tempClass} đã kết nối ({classStudents.length} học sinh)</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {onRenameClass && (
                    <button
                      type="button"
                      onClick={() => {
                        const suggested = tempClass.startsWith('6B')
                          ? tempClass.replace('6B', '6A')
                          : tempClass.startsWith('7B')
                          ? tempClass.replace('7B', '7A')
                          : tempClass.startsWith('8B')
                          ? tempClass.replace('8B', '8A')
                          : tempClass.startsWith('9B')
                          ? tempClass.replace('9B', '9A')
                          : tempClass;
                        setRenameInput(suggested);
                        setIsRenameClassOpen(true);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200 shadow-2xs flex items-center gap-1 transition cursor-pointer"
                      title={`Đổi tên Lớp ${tempClass} (ví dụ sửa nhầm 6B2 thành 6A2)`}
                    >
                      <Edit2 className="w-3 h-3 text-blue-600" />
                      <span>Sửa tên lớp</span>
                    </button>
                  )}

                  {onDeleteRoster && (
                    <button
                      type="button"
                      onClick={() => setIsConfirmDeleteClassOpen(true)}
                      className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200 shadow-2xs flex items-center gap-1 transition cursor-pointer"
                      title={`Xóa danh sách Lớp ${tempClass} khỏi CSDL`}
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                      <span>Xóa DS lớp {tempClass}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Thanh tìm kiếm nhanh học sinh khi danh sách có người */}
            {classStudents.length > 0 && !isManualNameMode && (
              <div className="relative">
                <input
                  type="text"
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  placeholder="🔍 Gõ tên hoặc STT để tìm nhanh trong danh sách..."
                  className="w-full text-xs py-2 pl-8 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-400 outline-none transition"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
                {searchStudentQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchStudentQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Chọn từ danh sách học sinh hoặc tự nhập nếu chưa có */}
            {classStudents.length > 0 && !isManualNameMode ? (
              <div className="space-y-1.5">
                <select
                  value={tempLeader}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__manual_input__') {
                      setIsManualNameMode(true);
                      setTempLeader('');
                    } else {
                      setTempLeader(val);
                    }
                    setErrorMsg(null);
                  }}
                  className="w-full border-2 rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-bold transition outline-none cursor-pointer bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900"
                >
                  <option value="">
                    -- Nháy vào đây để chọn tên em trong danh sách lớp {tempClass} ({classStudents.length} HS) --
                  </option>
                  {filteredStudents.map((s, idx) => (
                    <option key={idx} value={s.fullName}>
                      {s.stt ? `${s.stt}. ` : ''}{s.fullName}
                    </option>
                  ))}
                  <option value="__manual_input__">
                    ✏️ [Tự nhập tên khác nếu em chưa có tên trong danh sách]
                  </option>
                </select>
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>{filteredStudents.length}/{classStudents.length} học sinh phù hợp</span>
                  <button
                    type="button"
                    onClick={() => setIsManualNameMode(true)}
                    className="text-blue-600 hover:underline font-bold"
                  >
                    Chưa có tên em? Bấm để tự nhập
                  </button>
                </div>
              </div>
            ) : (
              /* Ô tự nhập tên khi lớp chưa có danh sách hoặc học sinh muốn tự gõ */
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={tempLeader}
                    onChange={(e) => {
                      setTempLeader(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder={`Nhập đầy đủ Họ và Tên của em (Lớp ${tempClass})...`}
                    className="w-full bg-white border-2 border-amber-400 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-bold text-slate-900 transition outline-none shadow-xs"
                  />
                  {classStudents.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsManualNameMode(false)}
                      className="absolute right-2.5 top-2.5 text-xs text-blue-600 hover:text-blue-800 font-bold px-2 py-0.5 bg-blue-50 rounded-lg"
                    >
                      Quay lại danh sách
                    </button>
                  )}
                </div>
                {classStudents.length === 0 && (
                  <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                    ℹ️ Lớp {tempClass} chưa được nạp danh sách sẵn trên hệ thống. Em vẫn có thể tự gõ Họ và Tên vào ô trên để nộp bài và chấm điểm bình thường!
                  </p>
                )}
              </div>
            )}

            {/* Khi lớp này chưa có học sinh, gợi ý các lớp ĐÃ CÓ trong CSDL */}
            {classStudents.length === 0 && (
              <div className="space-y-2 pt-1">
                {allRosterClassesWithCount.length > 0 ? (
                  <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-2xl space-y-2 text-xs">
                    <div className="font-bold text-blue-900 flex items-center justify-between gap-1 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Có thể em chọn nhầm lớp? Các lớp ĐÃ CÓ danh sách học sinh:</span>
                      </span>
                      {onRefreshRoster && (
                        <button
                          type="button"
                          disabled={isRefreshingRoster}
                          onClick={async () => {
                            setIsRefreshingRoster(true);
                            await onRefreshRoster();
                            setTimeout(() => setIsRefreshingRoster(false), 800);
                          }}
                          className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${isRefreshingRoster ? 'animate-spin' : ''}`} />
                          <span>Làm mới</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      {allRosterClassesWithCount.map((rc) => (
                        <button
                          key={rc.normalized}
                          type="button"
                          onClick={() => {
                            setTempGrade(rc.gradeLabel);
                            setTempClass(rc.rawClass);
                            setTempLeader('');
                            setTempMembers([]);
                            setErrorMsg(null);
                            setIsManualNameMode(false);
                            setSearchStudentQuery('');
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                          title={`Bấm để chọn ngay Lớp ${rc.rawClass} (${rc.count} học sinh)`}
                        >
                          <span>👉 Lớp {rc.rawClass}</span>
                          <span className="bg-white/25 px-1.5 py-0.2 rounded text-[10px] font-mono">{rc.count} HS</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-2 text-xs text-amber-900">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Hệ thống chưa tải danh sách lớp nào từ đám mây.</span>
                    </div>
                    {onRefreshRoster && (
                      <button
                        type="button"
                        disabled={isRefreshingRoster}
                        onClick={async () => {
                          setIsRefreshingRoster(true);
                          await onRefreshRoster();
                          setTimeout(() => setIsRefreshingRoster(false), 800);
                        }}
                        className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-lg transition cursor-pointer shrink-0"
                      >
                        {isRefreshingRoster ? 'Đang đồng bộ...' : 'Đồng bộ CSDL'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. CHỌN BẠN CÙNG NHÓM (CHỌN TỪ DANH SÁCH HOẶC GÕ TÊN) */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>5. Bạn Cùng Nhóm (Nếu làm nhóm):</span>
              </label>
              <span className="text-xs text-slate-400 font-medium">
                {tempMembers.length > 0 ? `${tempMembers.length} thành viên` : 'Tùy chọn'}
              </span>
            </div>

            {/* Chọn thành viên nhóm từ Dropdown danh sách lớp hoặc gõ tên trực tiếp */}
            <div className="flex items-center gap-2">
              {classStudents.length > 0 ? (
                <select
                  value={selectedGroupMemberOption}
                  onChange={(e) => setSelectedGroupMemberOption(e.target.value)}
                  className="flex-1 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 transition outline-none cursor-pointer"
                >
                  <option value="">-- Chọn bạn cùng nhóm trong lớp {tempClass} --</option>
                  {classStudents
                    .filter((s) => s.fullName !== tempLeader && !tempMembers.includes(s.fullName))
                    .map((s, idx) => (
                      <option key={idx} value={s.fullName}>
                        {s.stt ? `${s.stt}. ` : ''}{s.fullName}
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={selectedGroupMemberOption}
                  onChange={(e) => setSelectedGroupMemberOption(e.target.value)}
                  placeholder="Gõ tên bạn cùng nhóm (nếu làm bài theo nhóm)..."
                  className="flex-1 bg-white border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 transition outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMember();
                    }
                  }}
                />
              )}
              <button
                type="button"
                disabled={!selectedGroupMemberOption.trim()}
                onClick={handleAddMember}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 transition shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm</span>
              </button>
            </div>

            {/* Danh sách bạn cùng nhóm đã thêm */}
            {tempMembers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tempMembers.map((m, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold rounded-lg"
                  >
                    <span>{idx + 1}. {m}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl text-xs sm:text-sm transition shadow-md shadow-blue-500/25 cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-200" />
              <span>Cập Nhật Thông Tin</span>
            </button>
          </div>
        </form>

        {/* MODAL XÁC NHẬN XÓA LỚP HIỆN TẠI NGAY TẠI GIAO DIỆN NHẬP THÔNG TIN (CHỈ GIÁO VIÊN) */}
        {isTeacher && isConfirmDeleteClassOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">Xóa CSDL Lớp {tempClass}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Kết nối trực tiếp CSDL hệ thống
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Thầy/Cô có chắc chắn muốn xóa toàn bộ <strong>{classStudents.length} học sinh</strong> của Lớp <strong>{tempClass}</strong> khỏi CSDL phòng máy không? Danh sách các lớp khác vẫn được giữ nguyên vẹn.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => setIsConfirmDeleteClassOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={handleExecuteDeleteCurrentClass}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  {isActionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Xóa Ngay Khỏi CSDL</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ĐỔI TÊN LỚP (CHỈ GIÁO VIÊN) */}
        {isTeacher && isRenameClassOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">Đổi Tên Lớp Trong CSDL</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Lớp {tempClass} ({classStudents.length} học sinh)
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Tên lớp chính xác (ví dụ đổi {tempClass} thành 6A2):
                </label>
                <input
                  type="text"
                  autoFocus
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value.toUpperCase())}
                  placeholder="Nhập tên lớp đúng (vd: 6A2)..."
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-sm font-black text-slate-900 outline-none uppercase"
                />
                <p className="text-[11px] text-slate-500">
                  💡 Toàn bộ {classStudents.length} học sinh của Lớp {tempClass} sẽ được chuyển ngay sang tên lớp mới trong CSDL phòng máy.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => setIsRenameClassOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isActionLoading || !renameInput.trim()}
                  onClick={handleExecuteRenameCurrentClass}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isActionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Đổi Tên Ngay</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
