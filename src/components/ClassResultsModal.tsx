import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Trophy,
  FileSpreadsheet,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  RefreshCw,
  Calendar,
  Database,
  Download,
  Trash2,
} from 'lucide-react';
import { Submission, Assignment, StudentRecord } from '../types';
import {
  exportClassMultiProductGradebook,
} from '../utils/excelExport';
import { formatPracticeDateVi } from '../utils/storageManager';
import { SCHOOL_CLASSES } from '../data/classes';
import { ClassMultiProductGradebook } from './ClassMultiProductGradebook';

interface ClassResultsModalProps {
  className: string;
  submissions: Submission[];
  onClose: () => void;
  onExportExcel?: (cls?: string, targetDate?: string | null, dateMode?: 'all' | 'latest' | 'custom') => void;
  isTeacher?: boolean;
  onToggleSubmissionPermission?: (allow: boolean) => void;
  allowSubmission?: boolean;
  onChangeClassName?: (cls: string) => void;
  onRefresh?: () => void;
  onClearSubmissions?: (targetClass?: string) => Promise<boolean>;
  dbStatus?: {
    status: string;
    isPersistent: boolean;
    totalSubmissions: number;
    totalAttempts: number;
    lastUpdated?: string;
    classes: Record<string, number>;
  };
  assignments?: Assignment[];
  studentRoster?: StudentRecord[];
  onExportMultiProductExcel?: (cls: string) => void;
}

export const ClassResultsModal: React.FC<ClassResultsModalProps> = ({
  className,
  submissions,
  onClose,
  isTeacher = false,
  onToggleSubmissionPermission,
  allowSubmission = true,
  onChangeClassName,
  onRefresh,
  onClearSubmissions,
  dbStatus,
  assignments = [],
  studentRoster = [],
  onExportMultiProductExcel,
}) => {
  // Lấy danh sách lớp duy nhất từ danh sách học sinh đã tải lên (nếu có) để thay thế lớp mặc định
  const rosterClasses = useMemo(() => {
    const set = new Set<string>();
    studentRoster.forEach((r) => {
      if (r.className?.trim()) set.add(r.className.trim());
    });
    return Array.from(set).sort();
  }, [studentRoster]);

  // Danh sách các lớp hiển thị: Nếu có danh sách tải lên thì CHỈ hiển thị đúng các lớp đó!
  const displayedClasses: string[] = useMemo(() => {
    if (rosterClasses.length > 0) {
      return rosterClasses;
    }
    const subClasses = Array.from(new Set(submissions.map((s) => s.className).filter(Boolean)));
    if (subClasses.length > 0) return subClasses.sort();
    return [...SCHOOL_CLASSES];
  }, [rosterClasses, submissions]);

  // Lớp đang chọn: ưu tiên className nếu có trong danh sách, hoặc lớp đầu tiên
  const [activeClass, setActiveClass] = useState<string>(() => {
    if (className && className !== 'Tất cả') return className;
    if (displayedClasses.length > 0) return displayedClasses[0];
    return 'Tất cả';
  });

  // Quản lý lọc theo ngày thực hành: MẶC ĐỊNH HIỂN THỊ TIẾT GẦN NHẤT (latest)
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'latest' | 'custom'>('latest');
  const [customDate, setCustomDate] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Quản lý xóa kết quả bài nộp cũ
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  // Tự động làm mới kết quả trực tiếp từ server khi mở modal và định kỳ mỗi 3.5 giây
  useEffect(() => {
    if (onRefresh) {
      onRefresh();
      const interval = setInterval(onRefresh, 3500);
      return () => clearInterval(interval);
    }
  }, [onRefresh]);

  // Cập nhật activeClass nếu lớp hiện tại không còn tồn tại trong danh sách lớp mới tải lên
  useEffect(() => {
    if (displayedClasses.length > 0 && activeClass !== 'Tất cả' && !displayedClasses.includes(activeClass)) {
      setActiveClass(displayedClasses[0]);
    }
  }, [displayedClasses, activeClass]);

  // Lọc bài nộp theo lớp đang chọn
  const classList = useMemo(() => {
    return activeClass === 'Tất cả'
      ? submissions
      : submissions.filter((s) => s.className === activeClass);
  }, [submissions, activeClass]);

  // Tìm tất cả các ngày thực hành có trong lớp này (ngày mới nhất đứng đầu)
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    classList.forEach((s) => {
      const d = s.practiceDate || s.latestSubmittedAt?.slice(0, 10);
      if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
        dates.add(d);
      }
    });
    return Array.from(dates).sort((a, b) => b.localeCompare(a));
  }, [classList]);

  const latestDate = availableDates[0] || '';

  // Xác định ngày thực hành đang áp dụng lọc: Mặc định là ngày gần nhất
  const effectiveFilterDate = dateFilterMode === 'latest'
    ? latestDate
    : dateFilterMode === 'custom'
    ? customDate
    : null;

  // Lọc bài nộp theo ngày thực hành đã chọn
  const dateFilteredList = useMemo(() => {
    if (!effectiveFilterDate) return classList;
    return classList.filter((s) => {
      const d = s.practiceDate || s.latestSubmittedAt?.slice(0, 10);
      return d === effectiveFilterDate;
    });
  }, [classList, effectiveFilterDate]);

  // Đổi lớp: Tự động hiển thị kết quả của tiết thực hành gần nhất của lớp đó
  const handleSelectClass = (cls: string) => {
    setActiveClass(cls);
    setDateFilterMode('latest');
    setCustomDate('');
    if (onChangeClassName && cls !== 'Tất cả') {
      onChangeClassName(cls);
    }
  };

  // Xuất file Excel bảng điểm tổng hợp SP1, SP2... ĐTB của tiết/ngày đang lọc
  const handleExportMultiProduct = async () => {
    if (onRefresh) await onRefresh();
    if (onExportMultiProductExcel) {
      onExportMultiProductExcel(activeClass);
    } else {
      exportClassMultiProductGradebook({
        className: activeClass,
        assignments,
        submissions: dateFilteredList,
        roster: studentRoster,
      });
    }
    setSyncToast(`Đã xuất Bảng Tổng Hợp SP1, SP2... ĐTB Lớp ${activeClass} thành công!`);
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Các ngày trước đó (loại trừ ngày gần nhất)
  const previousDates = useMemo(() => {
    return availableDates.filter((d) => d !== latestDate);
  }, [availableDates, latestDate]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-cyan-300 shrink-0 shadow-inner">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Bảng Kết Quả Thực Hành & Sổ Điểm Lớp
                </h2>
                {/* Bộ chọn Lớp: Chỉ hiển thị các lớp trong danh sách đã tải lên */}
                <select
                  value={activeClass}
                  onChange={(e) => handleSelectClass(e.target.value)}
                  className="bg-blue-600 hover:bg-blue-500 text-cyan-100 border border-cyan-400/50 text-xs px-2.5 py-1 rounded-full font-bold focus:outline-none cursor-pointer"
                >
                  <option value="Tất cả">Tất cả các lớp ({submissions.length} bài)</option>
                  {displayedClasses.map((c) => {
                    const cCount = (submissions || []).filter((s) => s.className === c).length;
                    return (
                      <option key={c} value={c}>
                        Lớp {c} ({cCount} bài nộp)
                      </option>
                    );
                  })}
                </select>

                {/* Badge trạng thái CSDL Lưu Trực Tuyến */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 rounded-full text-[11px] font-bold"
                  title="Dữ liệu bài nộp được tự động lưu trữ tức thời vào Cơ sở dữ liệu phòng máy trên máy chủ"
                >
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>CSDL: {dbStatus?.totalSubmissions || submissions.length} bài (Trực tuyến)</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bảng tổng hợp chung của cả lớp • Lấy kết quả cao nhất • Hiển thị tiết thực hành gần nhất
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onRefresh && (
              <button
                type="button"
                onClick={async () => {
                  setIsSyncing(true);
                  if (onRefresh) await onRefresh();
                  setSyncToast(`Đã đồng bộ ${submissions.length} bài nộp từ CSDL phòng máy`);
                  setTimeout(() => {
                    setIsSyncing(false);
                    setSyncToast(null);
                  }, 1200);
                }}
                className="px-3 py-2 text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                title="Làm mới và đồng bộ dữ liệu thời gian thực từ Cơ sở dữ liệu máy chủ"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang đồng bộ...' : 'Làm mới CSDL'}</span>
              </button>
            )}

            {/* Nút Xóa Sạch Kết Quả Cũ (Chỉ Giáo Viên) */}
            {isTeacher && onClearSubmissions && (
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(true)}
                className="px-3 py-2 text-rose-300 hover:text-white rounded-xl bg-slate-800 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-700 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="Xóa sạch toàn bộ kết quả chấm ảo hoặc bài nộp cũ để bắt đầu tiết học mới"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Xóa Cũ</span>
              </button>
            )}

            {/* Nút Xuất Bảng Tổng Hợp SP1, SP2... ĐTB */}
            {isTeacher ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleExportMultiProduct}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md hover:shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                  title="Xuất file Excel Bảng Tổng Hợp gồm: STT, Họ và tên, Điểm SP1, SP2... và Điểm trung bình (ĐTB) lấy điểm cao nhất!"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                  <span>Xuất Bảng Tổng Hợp (SP1, SP2... ĐTB)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const jsonStr = JSON.stringify(submissions, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `CSDL_PhongMay_BaiNop_${new Date().toISOString().slice(0, 10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 hidden sm:flex items-center cursor-pointer"
                  title="Tải về bản sao lưu Cơ sở dữ liệu đầy đủ (.JSON) của phòng máy để lưu trữ an toàn"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            ) : (
              <div
                className="px-3 py-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                title="Chỉ giáo viên mới có quyền xuất file Excel kết quả toàn bộ lớp để bảo mật điểm số"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Xuất Excel: Quyền Giáo Viên</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Toast Notification */}
        {syncToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 text-center flex items-center justify-center gap-2 animate-in fade-in duration-200 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>{syncToast}</span>
          </div>
        )}

        {/* Quản lý Khóa / Mở Nhận Bài Nộp (Giáo viên) */}
        {isTeacher && onToggleSubmissionPermission && (
          <div className="p-2.5 sm:px-6 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-b border-blue-900/60 text-white flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${allowSubmission ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-bold">Quyền nộp bài của học sinh:</span>
              <span className="text-slate-300 font-medium hidden sm:inline">
                {allowSubmission
                  ? 'Đang mở cho phép học sinh nộp bài thực hành trên phòng máy.'
                  : 'Đang khóa nộp bài (tránh học sinh làm bài ở nhà nộp trước khi ổn định lớp).'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onToggleSubmissionPermission(!allowSubmission)}
              className={`px-3 py-1 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                allowSubmission
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black'
              }`}
            >
              {allowSubmission ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Khóa Nộp Bài</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Bật Cho Phép Nộp</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Thanh Lọc Tiết Thực Hành: Tiết gần nhất (mặc định) & Chọn các ngày trước đó */}
        <div className="p-3 sm:px-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/80 text-white flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold flex items-center gap-1.5 text-cyan-300">
              <Calendar className="w-4 h-4" />
              <span>Buổi / Tiết thực hành:</span>
            </span>

            {/* Nút: Tiết gần nhất (Mặc định khi chọn lớp) */}
            <button
              type="button"
              onClick={() => {
                setDateFilterMode('latest');
                setCustomDate('');
              }}
              disabled={!latestDate}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                dateFilterMode === 'latest'
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100 disabled:opacity-40'
              }`}
              title={latestDate ? `Xem kết quả tiết thực hành gần nhất: ${formatPracticeDateVi(latestDate)}` : 'Chưa có buổi thực hành nào'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span>
                Tiết gần nhất {latestDate ? `(${formatPracticeDateVi(latestDate)})` : ''}
              </span>
            </button>

            {/* Dropdown: Các ngày thực hành trước đó (chỉ hiển thị các ngày trước đó) */}
            {previousDates.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-indigo-500/40">
                <span className="text-[11px] text-slate-300 font-medium">Các ngày trước đó:</span>
                <select
                  value={dateFilterMode === 'custom' && previousDates.includes(customDate) ? customDate : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setCustomDate(e.target.value);
                      setDateFilterMode('custom');
                    }
                  }}
                  className="bg-slate-900 text-cyan-200 text-xs px-2 py-0.5 rounded-lg font-semibold focus:outline-none cursor-pointer border border-slate-700"
                >
                  <option value="">-- Chọn ngày trước đó --</option>
                  {previousDates.map((d) => (
                    <option key={d} value={d}>
                      Ngày {formatPracticeDateVi(d)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Nút: Xem tất cả các ngày */}
            <button
              type="button"
              onClick={() => {
                setDateFilterMode('all');
                setCustomDate('');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                dateFilterMode === 'all'
                  ? 'bg-cyan-400 text-slate-950 shadow-sm font-black'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100'
              }`}
              title="Xem tổng hợp kết quả của toàn bộ các buổi thực hành từ trước tới nay"
            >
              Tất cả các ngày
            </button>
          </div>

          <div className="text-[11px] text-cyan-200 font-medium flex items-center gap-1.5">
            {effectiveFilterDate ? (
              <span>
                Đang hiển thị kết quả: <strong className="text-white font-bold">{formatPracticeDateVi(effectiveFilterDate)}</strong>
                {dateFilterMode === 'latest' && <span className="ml-1 text-amber-300 font-semibold">(Tiết gần nhất)</span>}
                <span className="text-slate-400 ml-1">({dateFilteredList.length} bài nộp)</span>
              </span>
            ) : (
              <span>
                Đang hiển thị: <strong className="text-white font-bold">Toàn bộ các ngày thực hành</strong>
                <span className="text-slate-400 ml-1">({dateFilteredList.length} bài nộp)</span>
              </span>
            )}
          </div>
        </div>

        {/* 1 BẢNG TỔNG HỢP CHUNG CỦA CẢ LỚP (SP1, SP2... ĐTB) */}
        <ClassMultiProductGradebook
          className={activeClass}
          assignments={assignments}
          submissions={dateFilteredList}
          roster={studentRoster}
          isTeacher={isTeacher}
          onRefresh={onRefresh}
          onExportExcel={handleExportMultiProduct}
        />

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-6 shrink-0">
          <div className="flex items-center gap-2 text-emerald-700">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>
              Bảng điểm tổng hợp tự động cập nhật • Lấy điểm cao nhất của từng sản phẩm thực hành (SP01, SP02...)
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Đóng Lại
          </button>
        </div>

        {/* Modal xác nhận xóa kết quả cũ trong ClassResultsModal */}
        {isConfirmClearOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-700 space-y-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-white">Xóa Sạch Kết Quả Cũ</h4>
                  <p className="text-xs text-slate-400">
                    {activeClass === 'Tất cả' ? 'Toàn bộ tất cả các lớp' : `Lớp ${activeClass}`}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Thầy/Cô có chắc chắn muốn xóa sạch toàn bộ các kết quả chấm ảo hoặc bài nộp cũ khỏi hệ thống không?
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isClearing}
                  onClick={() => setIsConfirmClearOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isClearing}
                  onClick={async () => {
                    setIsClearing(true);
                    try {
                      if (onClearSubmissions) {
                        await onClearSubmissions(activeClass === 'Tất cả' ? undefined : activeClass);
                      }
                      if (onRefresh) await onRefresh();
                      setIsConfirmClearOpen(false);
                    } catch {}
                    setIsClearing(false);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  {isClearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Xóa Sạch Ngay</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
