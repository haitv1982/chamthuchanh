import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Users,
  Search,
  Sparkles,
  RefreshCw,
  Info,
  Edit2,
  FolderOpen,
  Cloud,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { StudentRecord } from '../types';
import { parseStudentExcel } from '../utils/excelRosterParser';

interface StudentRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: StudentRecord[];
  onSaveRoster: (students: StudentRecord[], mode?: 'accumulate' | 'upsert' | 'replace') => Promise<{ success: boolean; total: number; classes: string[] }>;
  onDeleteRoster: (className?: string) => Promise<boolean>;
  onRenameClass?: (oldName: string, newName: string) => Promise<boolean>;
}

export const StudentRosterModal: React.FC<StudentRosterModalProps> = ({
  isOpen,
  onClose,
  roster,
  onSaveRoster,
  onDeleteRoster,
  onRenameClass,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<StudentRecord[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'view'>(roster.length > 0 ? 'view' : 'upload');
  const [viewClassFilter, setViewClassFilter] = useState<string>('all');
  const [viewSearchTerm, setViewSearchTerm] = useState<string>('');

  // Trạng thái modal xác nhận xóa (không dùng window.confirm để tránh lỗi chặn trong iframe)
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<string | null>(null);

  // Trạng thái modal đổi tên lớp nhanh (ví dụ đổi 6B2 thành 6A2 trong 1 giây)
  const [renameTargetClass, setRenameTargetClass] = useState<string | null>(null);
  const [newClassNameInput, setNewClassNameInput] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Đồng bộ thủ công toàn bộ danh sách học sinh hiện có lên Firebase Cloud Firestore
  const handleForceSyncCloud = async () => {
    if (roster.length === 0) {
      setParseError('Danh sách học sinh đang trống. Thầy/Cô hãy tải lên file Excel hoặc nạp danh sách mẫu trước.');
      return;
    }
    setIsSyncingCloud(true);
    setParseError(null);
    setParseSuccessMsg(null);
    try {
      const res = await onSaveRoster(roster, 'replace');
      setParseSuccessMsg(`☁️ Đã đồng bộ thành công ${res.total} học sinh (${res.classes.join(', ')}) lên Đám Mây Firebase! Tất cả máy học sinh khi truy cập link web sẽ thấy ngay danh sách.`);
    } catch (err: any) {
      setParseError(err.message || 'Lỗi khi đồng bộ lên Đám mây Firebase');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  if (!isOpen) return null;

  // Danh sách các lớp hiện có trong danh sách
  const existingClasses = Array.from(new Set(roster.map((s) => s.className))).sort();

  // Thống kê số lượng học sinh theo lớp
  const classCounts: Record<string, number> = {};
  roster.forEach((s) => {
    classCounts[s.className] = (classCounts[s.className] || 0) + 1;
  });

  // Tải tệp Excel mẫu 3 cột chuẩn
  const handleDownloadSampleExcel = () => {
    try {
      const sampleData = [
        { TT: 1, 'Họ và tên': 'Nguyễn Văn An', Lớp: '8A1' },
        { TT: 2, 'Họ và tên': 'Trần Thị Bình', Lớp: '8A1' },
        { TT: 3, 'Họ và tên': 'Lê Hoàng Cường', Lớp: '8A1' },
        { TT: 4, 'Họ và tên': 'Phạm Thu Dung', Lớp: '8A1' },
        { TT: 1, 'Họ và tên': 'Phạm Đức Dũng', Lớp: '8A2' },
        { TT: 2, 'Họ và tên': 'Hoàng Thu Giang', Lớp: '8A2' },
        { TT: 3, 'Họ và tên': 'Ngô Văn Hùng', Lớp: '8A2' },
        { TT: 1, 'Họ và tên': 'Vũ Minh Hải', Lớp: '9A1' },
        { TT: 2, 'Họ và tên': 'Đỗ Phương Linh', Lớp: '9A1' },
        { TT: 3, 'Họ và tên': 'Bùi Quốc Tuấn', Lớp: '9A1' },
      ];

      const ws = XLSX.utils.json_to_sheet(sampleData, {
        header: ['TT', 'Họ và tên', 'Lớp'],
      });

      // Độ rộng các cột
      ws['!cols'] = [{ wch: 8 }, { wch: 28 }, { wch: 12 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'DanhSachHocSinh');

      XLSX.writeFile(wb, 'Mau_Danh_Sach_Hoc_Sinh_3_Cot.xlsx');
    } catch (err: any) {
      alert('Không thể tạo tệp mẫu: ' + err.message);
    }
  };

  // Nạp danh sách mẫu có sẵn để thử nghiệm nhanh
  const handleLoadDemoRoster = async () => {
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

    setIsSaving(true);
    setParseError(null);
    try {
      const res = await onSaveRoster(demoData, 'replace');
      setParseSuccessMsg(`Đã nạp ${res.total} học sinh mẫu (${res.classes.join(', ')}) vào CSDL hệ thống! Các lớp khác đã được xóa sạch.`);
      setActiveTab('view');
    } catch (err: any) {
      setParseError(err.message || 'Lỗi khi nạp danh sách mẫu');
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý đọc tệp Excel học sinh do giáo viên tải lên VÀ LƯU NGAY VÀO CSDL HỆ THỐNG
  const handleProcessExcel = async (file: File) => {
    setSelectedFile(file);
    setParseError(null);
    setParseSuccessMsg(null);
    setParsedStudents([]);
    setIsSaving(true);

    try {
      const buffer = await file.arrayBuffer();
      // Phân tích thông minh với trình parser chuyên dụng
      const result = parseStudentExcel(buffer);
      setParsedStudents(result.students);

      // TỰ ĐỘNG THAY THẾ CƠ SỞ DỮ LIỆU ĐÚNG VỚI CÁC LỚP TRONG TỆP (XÓA CÁC LỚP KHÁC)
      const saveRes = await onSaveRoster(result.students, 'replace');
      if (saveRes.success) {
        setParseSuccessMsg(
          `Đã tải lên & thay thế thành công ${result.students.length} học sinh thuộc đúng ${saveRes.classes.length} lớp (${saveRes.classes.join(', ')}) trong CSDL! Các lớp khác đã được xóa sạch.`
        );
        setTimeout(() => {
          setActiveTab('view');
        }, 1200);
      } else {
        setParseError('Đã đọc được dữ liệu nhưng không thể lưu vào CSDL máy chủ. Vui lòng kiểm tra lại kết nối mạng.');
      }
    } catch (err: any) {
      setParseError(err.message || 'Lỗi khi xử lý tệp Excel.');
      setParsedStudents([]);
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Thực hiện XÓA LỚP hoặc XÓA TOÀN BỘ (kết nối trực tiếp máy chủ CSDL, không dùng window.confirm)
  const handleExecuteDelete = async () => {
    if (!confirmDeleteTarget) return;
    setIsDeleting(true);
    setParseError(null);

    const targetClass = confirmDeleteTarget === 'all' ? undefined : confirmDeleteTarget;

    try {
      await onDeleteRoster(targetClass);

      setParseSuccessMsg(
        confirmDeleteTarget === 'all'
          ? 'Đã xóa toàn bộ danh sách học sinh của tất cả các lớp khỏi CSDL hệ thống!'
          : `Đã xóa thành công toàn bộ danh sách Lớp ${confirmDeleteTarget} khỏi CSDL hệ thống!`
      );

      if (viewClassFilter === confirmDeleteTarget || confirmDeleteTarget === 'all') {
        setViewClassFilter('all');
      }

      setConfirmDeleteTarget(null);
    } catch (err: any) {
      setParseError(err.message || 'Lỗi khi xóa danh sách khỏi CSDL.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Thực hiện ĐỔI TÊN LỚP NHANH (ví dụ đổi 6B2 thành 6A2 mà không cần xóa rồi tải lại)
  const handleExecuteRename = async () => {
    if (!renameTargetClass || !newClassNameInput.trim()) return;
    const newName = newClassNameInput.trim().toUpperCase().replace(/^LỚP\s*|^LOP\s*/i, '');

    if (newName === renameTargetClass.toUpperCase()) {
      setRenameTargetClass(null);
      return;
    }

    setIsSaving(true);
    setParseError(null);

    try {
      if (onRenameClass) {
        await onRenameClass(renameTargetClass, newName);
      } else {
        const studentsToRename = roster
          .filter((s) => s.className.toUpperCase() === renameTargetClass.toUpperCase())
          .map((s) => ({ ...s, className: newName }));

        if (studentsToRename.length === 0) {
          throw new Error(`Không tìm thấy học sinh nào trong Lớp ${renameTargetClass}`);
        }

        await onSaveRoster(studentsToRename, 'accumulate');
        await onDeleteRoster(renameTargetClass);
      }

      setParseSuccessMsg(`Đã đổi tên toàn bộ học sinh từ Lớp ${renameTargetClass} sang Lớp ${newName} trong CSDL thành công!`);
      setViewClassFilter(newName);
      setRenameTargetClass(null);
    } catch (err: any) {
      setParseError(err.message || 'Lỗi khi đổi tên lớp.');
    } finally {
      setIsSaving(false);
    }
  };

  // Lọc danh sách xem
  const filteredRoster = roster.filter((s) => {
    if (viewClassFilter !== 'all' && s.className !== viewClassFilter) return false;
    if (viewSearchTerm.trim()) {
      const term = viewSearchTerm.toLowerCase();
      return s.fullName.toLowerCase().includes(term) || s.className.toLowerCase().includes(term);
    }
    return true;
  });

  // Render thẻ danh sách lớp cho cả 2 tab (đặc biệt hỗ trợ xóa nhanh lớp tải nhầm như 6B2)
  const renderClassCards = () => (
    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
      <div className="flex items-center justify-between text-xs flex-wrap gap-1">
        <span className="font-bold text-emerald-950 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>CSDL Từng Lớp Hiện Có ({existingClasses.length} lớp • {roster.length} HS):</span>
        </span>
        <span className="text-[11px] text-emerald-800 font-medium">
          Bấm nút <strong>Xóa lớp này</strong> để xóa lớp tải nhầm (như 6B2)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {existingClasses.map((cls) => {
          const isSelected = viewClassFilter === cls;
          return (
            <div
              key={cls}
              className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2 shadow-2xs ${
                isSelected
                  ? 'bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-300'
                  : 'bg-white hover:bg-emerald-50/70 text-slate-800 border-slate-200'
              }`}
            >
              <div
                onClick={() => {
                  setViewClassFilter(isSelected ? 'all' : cls);
                  setActiveTab('view');
                }}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className={`font-black text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    Lớp {cls}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {classCounts[cls]} HS
                  </span>
                </div>
                <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  📁 CSDL: roster_{cls}.json
                </div>
              </div>

              {/* 2 Nút thao tác cực kỳ thuận tiện: Đổi tên lớp & Xóa riêng lớp này */}
              <div className={`flex items-center gap-1.5 pt-2 border-t ${isSelected ? 'border-white/20' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameTargetClass(cls);
                    setNewClassNameInput(cls.startsWith('6B') ? cls.replace('6B', '6A') : cls.startsWith('7B') ? cls.replace('7B', '7A') : cls.startsWith('8B') ? cls.replace('8B', '8A') : cls.startsWith('9B') ? cls.replace('9B', '9A') : cls);
                  }}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                    isSelected
                      ? 'bg-white/20 hover:bg-white/30 text-white'
                      : 'bg-slate-100 hover:bg-blue-50 text-blue-700'
                  }`}
                  title={`Đổi tên lớp ${cls} thành tên khác (ví dụ sửa nhầm 6B2 thành 6A2)`}
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Sửa tên</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteTarget(cls);
                  }}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ml-auto ${
                    isSelected
                      ? 'bg-rose-500 hover:bg-rose-600 text-white'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  }`}
                  title={`Xóa hoàn toàn danh sách của Lớp ${cls} khỏi CSDL`}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa lớp này</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all scale-100 max-h-[92vh] flex flex-col my-auto relative">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl leading-tight">
                Danh Sách Học Sinh Các Lớp (File Excel)
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Quản lý CSDL danh sách học sinh • Lưu trữ riêng từng lớp • Thao tác xóa & sửa tên thuận tiện
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

        {/* Tab Navigation & Cloud Sync Action */}
        <div className="px-5 sm:px-6 pt-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                setParseError(null);
              }}
              className={`px-4 py-2 font-black text-xs sm:text-sm border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Tải Lên File Excel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('view');
                setParseError(null);
              }}
              className={`px-4 py-2 font-black text-xs sm:text-sm border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'view'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>CSDL Học Sinh ({roster.length} HS • {existingClasses.length} Lớp)</span>
            </button>
          </div>

          {/* Nút Chủ Động Đồng Bộ Lên Đám Mây Firebase */}
          <div className="pb-1.5">
            <button
              type="button"
              disabled={isSyncingCloud}
              onClick={handleForceSyncCloud}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              title="Đồng bộ ngay danh sách học sinh hiện có lên Đám mây Firebase để các máy học sinh nhận được tức thì"
            >
              {isSyncingCloud ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-cyan-200" />
              )}
              <span>{isSyncingCloud ? 'Đang đẩy lên Cloud...' : '☁️ Đồng Bộ Lên Đám Mây'}</span>
            </button>
          </div>
        </div>

        {/* Alert / Notifications */}
        {parseError && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs sm:text-sm font-bold flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}

        {parseSuccessMsg && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs sm:text-sm font-bold flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{parseSuccessMsg}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-slate-800">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              {/* Hướng dẫn định dạng 3 cột */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-black text-emerald-900">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Quy định định dạng tệp Excel:</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadSampleExcel}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải File Excel Mẫu (.xlsx)</span>
                  </button>
                </div>

                <p className="text-emerald-950 font-medium leading-relaxed">
                  Tệp Excel chỉ cần <strong>3 cột</strong> đơn giản (hỗ trợ cả file mẫu từ VnEdu / SMAS):
                </p>
                <div className="grid grid-cols-3 gap-2 bg-white/90 p-2.5 rounded-xl border border-emerald-200 text-center font-bold text-xs">
                  <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-800">Cột 1: <strong>TT</strong> (hoặc STT)</div>
                  <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-800">Cột 2: <strong>Họ và tên</strong></div>
                  <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-800">Cột 3: <strong>Lớp</strong> (vd: 6A2, 8A1, 9A2...)</div>
                </div>

                <div className="p-2.5 bg-white/95 rounded-xl border border-emerald-300 text-xs text-emerald-950 font-semibold space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cơ chế CSDL riêng biệt: Lớp sau KHÔNG BAO GIỜ đè lên lớp trước!</span>
                  </div>
                  <p className="text-[11px] text-emerald-900 leading-relaxed font-normal">
                    Thầy/Cô có thể tải lên lần lượt từng lớp. Mỗi lớp được hệ thống tự động lưu vào <strong>phân vùng CSDL riêng biệt</strong>, danh sách các lớp đã nạp trước đó được giữ nguyên 100%.
                  </p>
                </div>
              </div>

              {/* Vùng tải tệp Excel */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessExcel(file);
                }}
              />

              <div
                onClick={() => !isSaving && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 bg-slate-50/70 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center group ${
                  isSaving ? 'opacity-50 cursor-wait' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isSaving ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-700" />
                  ) : (
                    <FileSpreadsheet className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-black text-slate-800 group-hover:text-emerald-700">
                    {isSaving
                      ? 'Đang đọc và lưu tệp vào CSDL hệ thống...'
                      : selectedFile
                      ? selectedFile.name
                      : 'Nháy vào đây để chọn tệp Excel danh sách học sinh'}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hỗ trợ định dạng .xlsx, .xls • Tự động nạp vào CSDL ngay khi chọn tệp
                  </p>
                </div>
              </div>

              {/* Danh sách các lớp hiện có trong CSDL hiển thị trực tiếp ngay dưới ô tải file để xem và xóa tiện lợi */}
              {existingClasses.length > 0 && renderClassCards()}

              {/* Bảng xem trước dữ liệu vừa đọc */}
              {parsedStudents.length > 0 && (
                <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs font-black text-slate-700 uppercase">
                    <span>Dữ liệu đã nạp ({parsedStudents.length} học sinh):</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu vào CSDL
                    </span>
                  </div>

                  <div className="max-h-44 overflow-y-auto space-y-1 pr-1 text-xs divide-y divide-slate-100 bg-white rounded-xl border border-slate-200">
                    {parsedStudents.slice(0, 15).map((s, idx) => (
                      <div key={idx} className="p-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 font-black flex items-center justify-center text-[10px]">
                            {s.stt || idx + 1}
                          </span>
                          <span className="font-bold text-slate-900">{s.fullName}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-black rounded text-[11px]">
                          Lớp {s.className}
                        </span>
                      </div>
                    ))}
                    {parsedStudents.length > 15 && (
                      <div className="p-2 text-center text-slate-500 font-bold text-xs bg-slate-50">
                        ... và còn {parsedStudents.length - 15} học sinh khác nữa
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nút nạp mẫu thử nghiệm nếu chưa có file */}
              {roster.length === 0 && parsedStudents.length === 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="text-blue-900 font-semibold">
                    Thầy/Cô chưa có file Excel sẵn? Có thể nạp nhanh danh sách mẫu để thử nghiệm.
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadDemoRoster}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shrink-0 transition shadow-2xs cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Nạp DS Mẫu</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* TAB XEM & QUẢN LÝ DANH SÁCH HIỆN CÓ */
            <div className="space-y-4">
              {/* Thẻ hiển thị CSDL độc lập của từng lớp kèm nút XÓA và ĐỔI TÊN trực tiếp */}
              {existingClasses.length > 0 && renderClassCards()}

              {/* Bộ lọc theo lớp & Tìm kiếm */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <select
                    value={viewClassFilter}
                    onChange={(e) => setViewClassFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="all">Tất cả các lớp ({roster.length} HS)</option>
                    {existingClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        Lớp {cls} ({classCounts[cls]} HS)
                      </option>
                    ))}
                  </select>

                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên học sinh..."
                      value={viewSearchTerm}
                      onChange={(e) => setViewSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {existingClasses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteTarget(viewClassFilter === 'all' ? 'all' : viewClassFilter)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{viewClassFilter === 'all' ? 'Xóa toàn bộ các lớp' : `Xóa Lớp ${viewClassFilter}`}</span>
                  </button>
                )}
              </div>

              {/* Bảng danh sách học sinh */}
              {filteredRoster.length > 0 ? (
                <div className="max-h-72 overflow-y-auto space-y-1 pr-1 border border-slate-200 rounded-2xl p-2 bg-slate-50/60 divide-y divide-slate-100 text-xs">
                  {filteredRoster.map((s, idx) => (
                    <div key={idx} className="p-2 flex items-center justify-between gap-2 hover:bg-white rounded-lg transition">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-emerald-50 text-emerald-800 font-black flex items-center justify-center text-[10px]">
                          {s.stt || idx + 1}
                        </span>
                        <span className="font-bold text-slate-900">{s.fullName}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded text-[11px]">
                        Lớp {s.className}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-2xl space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">Chưa có dữ liệu học sinh nào phù hợp bộ lọc.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Tổng cộng: <strong className="text-slate-800">{roster.length}</strong> học sinh thuộc{' '}
            <strong className="text-slate-800">{existingClasses.length}</strong> lớp trong CSDL
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

        {/* MODAL XÁC NHẬN XÓA (Thuận tiện 100%, không bị trình duyệt chặn confirm) */}
        {confirmDeleteTarget && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">Xác Nhận Xóa CSDL Lớp</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {confirmDeleteTarget === 'all'
                      ? 'Xóa toàn bộ các lớp'
                      : `Xóa danh sách Lớp ${confirmDeleteTarget}`}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {confirmDeleteTarget === 'all'
                  ? 'Thầy/Cô có chắc chắn muốn xóa TOÀN BỘ danh sách học sinh của tất cả các lớp khỏi CSDL không?'
                  : `Thầy/Cô có chắc chắn muốn xóa toàn bộ ${classCounts[confirmDeleteTarget] || 0} học sinh của Lớp ${confirmDeleteTarget} khỏi CSDL không? Các lớp khác sẽ vẫn được giữ nguyên vẹn.`}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setConfirmDeleteTarget(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleExecuteDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Xóa Ngay Khỏi CSDL</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ĐỔI TÊN LỚP (Khắc phục khi tải nhầm tên lớp như 6B2 -> 6A2 mà không cần xóa tải lại) */}
        {renameTargetClass && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">Sửa Tên Lớp Trong CSDL</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Đổi Lớp {renameTargetClass} ({classCounts[renameTargetClass] || 0} học sinh)
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Tên lớp chính xác (ví dụ đổi {renameTargetClass} thành 6A2):
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newClassNameInput}
                  onChange={(e) => setNewClassNameInput(e.target.value.toUpperCase())}
                  placeholder="Nhập tên lớp đúng (vd: 6A2)..."
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-sm font-black text-slate-900 outline-none uppercase"
                />
                <p className="text-[11px] text-slate-500">
                  💡 Toàn bộ {classCounts[renameTargetClass] || 0} học sinh của Lớp {renameTargetClass} sẽ được chuyển ngay sang tên lớp mới trong CSDL.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setRenameTargetClass(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isSaving || !newClassNameInput.trim()}
                  onClick={handleExecuteRename}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Lưu Tên Mới</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
