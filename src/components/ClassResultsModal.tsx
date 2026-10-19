import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Trophy,
  Award,
  Search,
  FileSpreadsheet,
  Users,
  Sparkles,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  RefreshCw,
  Eye,
  Layers,
  Calendar,
  Database,
  Download,
  Trash2,
} from 'lucide-react';
import { Submission } from '../types';
import {
  formatMachineNumber,
  getMachineSortNumber,
  splitVietnameseName,
} from '../utils/excelExport';
import { formatPracticeDateVi, getTodayDateString } from '../utils/storageManager';
import { SCHOOL_CLASSES } from '../data/classes';

interface ClassResultsModalProps {
  className: string;
  submissions: Submission[];
  onClose: () => void;
  onExportExcel: (cls?: string, targetDate?: string | null, dateMode?: 'all' | 'latest' | 'custom') => void;
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
}

export const ClassResultsModal: React.FC<ClassResultsModalProps> = ({
  className,
  submissions,
  onClose,
  onExportExcel,
  isTeacher = false,
  onToggleSubmissionPermission,
  allowSubmission = true,
  onChangeClassName,
  onRefresh,
  onClearSubmissions,
  dbStatus,
}) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'machine' | 'name' | 'score'>('machine');
  const [showAttemptMode, setShowAttemptMode] = useState<'highest' | 'all'>('highest');
  const [activeClass, setActiveClass] = useState<string>(className || 'Tất cả');
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  // Quản lý lọc theo ngày thực hành (Yêu cầu 4: Xuất ngày bất kỳ hoặc ngày gần nhất)
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'latest' | 'custom'>('all');
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

  // Filter submissions by current class
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

  // Xác định ngày thực hành đang áp dụng lọc
  const effectiveFilterDate = dateFilterMode === 'latest'
    ? latestDate
    : dateFilterMode === 'custom'
    ? customDate
    : null;

  // Lọc theo ngày trước khi gom nhóm
  const dateFilteredList = useMemo(() => {
    if (!effectiveFilterDate) return classList;
    return classList.filter((s) => {
      const d = s.practiceDate || s.latestSubmittedAt?.slice(0, 10);
      return d === effectiveFilterDate;
    });
  }, [classList, effectiveFilterDate]);

  // Gom nhóm theo Máy + Học sinh và CHỈ LẤY LẦN NỘP CÓ KẾT QUẢ CAO NHẤT (hoặc hiển thị tất cả theo tùy chọn)
  const bestMap = new Map<string, Submission>();
  dateFilteredList.forEach((sub) => {
    const key = `${sub.className}__${sub.machineNumber}__${sub.studentLeader.trim().toLowerCase()}`;
    const existing = bestMap.get(key);
    if (!existing || sub.highestScore > existing.highestScore) {
      bestMap.set(key, sub);
    } else if (sub.highestScore === existing.highestScore) {
      const timeA = new Date(sub.latestSubmittedAt || 0).getTime();
      const timeB = new Date(existing.latestSubmittedAt || 0).getTime();
      if (timeA > timeB) bestMap.set(key, sub);
    }
  });

  const uniqueClassList = Array.from(bestMap.values());

  // Đếm các số máy bị trùng (có nhiều hơn 1 nhóm nộp bài)
  const duplicateMachineCounts = new Map<string, number>();
  uniqueClassList.forEach((s) => {
    const m = s.machineNumber;
    duplicateMachineCounts.set(m, (duplicateMachineCounts.get(m) || 0) + 1);
  });

  const filtered = uniqueClassList.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.studentLeader.toLowerCase().includes(q) ||
      s.machineNumber.toLowerCase().includes(q) ||
      s.groupMembers.some((m) => m.toLowerCase().includes(q))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'machine') {
      const numA = getMachineSortNumber(a.machineNumber);
      const numB = getMachineSortNumber(b.machineNumber);
      if (numA !== numB) return numA - numB;
      return b.highestScore - a.highestScore;
    }
    if (sortBy === 'name') {
      const nameA = splitVietnameseName(a.studentLeader);
      const nameB = splitVietnameseName(b.studentLeader);
      const cmp = nameA.ten.localeCompare(nameB.ten, 'vi', { sensitivity: 'base' });
      if (cmp !== 0) return cmp;
      return nameA.hoVaDem.localeCompare(nameB.hoVaDem, 'vi', { sensitivity: 'base' });
    }
    // Default score
    return b.highestScore - a.highestScore;
  });

  const total = uniqueClassList.length;
  const perfectCount = uniqueClassList.filter((s) => s.highestScore >= 10).length;
  const avgScore = total > 0
    ? (uniqueClassList.reduce((sum, s) => sum + s.highestScore, 0) / total).toFixed(1)
    : '0';

  const handleSelectClass = (cls: string) => {
    setActiveClass(cls);
    if (onChangeClassName && cls !== 'Tất cả') {
      onChangeClassName(cls);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-cyan-300 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Bảng Kết Quả Thực Hành Các Nhóm Trong Lớp
                </h2>
                {/* Bộ chọn Lớp trực tiếp ngay trong Modal với thống kê số bài nộp */}
                <select
                  value={activeClass}
                  onChange={(e) => handleSelectClass(e.target.value)}
                  className="bg-blue-600/70 hover:bg-blue-600 text-cyan-200 border border-cyan-400/50 text-xs px-2.5 py-1 rounded-full font-bold focus:outline-none cursor-pointer"
                >
                  <option value="Tất cả">Tất cả các lớp ({submissions.length} bài)</option>
                  {SCHOOL_CLASSES.map((c) => {
                    const cCount = (submissions || []).filter((s) => s.className === c).length;
                    return (
                      <option key={c} value={c}>
                        Lớp {c} ({cCount} bài nộp)
                      </option>
                    );
                  })}
                </select>

                {/* Badge trạng thái CSDL Lưu Trữ Thực */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 rounded-full text-[11px] font-bold"
                  title="Dữ liệu bài nộp được tự động lưu trữ tức thời vào Cơ sở dữ liệu phòng máy trên máy chủ"
                >
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>CSDL: {dbStatus?.totalSubmissions || submissions.length} bài (Trực tuyến)</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Theo dõi kết quả thực hành trực tiếp • Tự động cập nhật tức thời khi học sinh nộp bài • Thứ tự Máy 01, Máy 02...
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
                <span className="hidden sm:inline">Xóa Kết Quả Cũ</span>
              </button>
            )}

            {/* Quyền Xuất File Excel: Chỉ Giáo Viên mới được xuất danh sách cả lớp */}
            {isTeacher ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={async () => {
                    if (onRefresh) await onRefresh();
                    onExportExcel(activeClass, effectiveFilterDate, dateFilterMode);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Giáo viên xuất file Excel gồm tất cả học sinh theo thứ tự Máy và cột Tên riêng"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>
                    Xuất File Excel {activeClass === 'Tất cả' ? 'Toàn Trường' : `Lớp ${activeClass}`}
                    {effectiveFilterDate ? ` (${formatPracticeDateVi(effectiveFilterDate)})` : ''}
                  </span>
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
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Toast Notification */}
        {syncToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 text-center flex items-center justify-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{syncToast}</span>
          </div>
        )}

        {/* Thanh Chọn Ngày Thực Hành (Yêu cầu 4: Xuất ngày bất kỳ hoặc ngày gần nhất của 1 lớp) */}
        <div className="p-3 sm:px-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-blue-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black flex items-center gap-1.5 text-cyan-300">
              <Calendar className="w-4 h-4" />
              <span>Ngày thực hành:</span>
            </span>

            {/* Nút: Tất cả các ngày */}
            <button
              type="button"
              onClick={() => {
                setDateFilterMode('all');
                setCustomDate('');
              }}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                dateFilterMode === 'all'
                  ? 'bg-cyan-400 text-slate-950 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100'
              }`}
            >
              Tất cả các ngày
            </button>

            {/* Nút: Hôm nay */}
            <button
              type="button"
              onClick={() => {
                setDateFilterMode('custom');
                setCustomDate(getTodayDateString());
              }}
              className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                dateFilterMode === 'custom' && customDate === getTodayDateString()
                  ? 'bg-emerald-400 text-slate-950 shadow-xs'
                  : 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40'
              }`}
              title="Lọc bài nộp trong ngày thực hành hôm nay"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Hôm nay ({formatPracticeDateVi(getTodayDateString())})</span>
            </button>

            {/* Nút: Ngày gần nhất của lớp */}
            <button
              type="button"
              onClick={() => {
                setDateFilterMode('latest');
                setCustomDate('');
              }}
              disabled={!latestDate}
              className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                dateFilterMode === 'latest'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100 disabled:opacity-40'
              }`}
              title={latestDate ? `Ngày gần nhất: ${formatPracticeDateVi(latestDate)}` : 'Chưa có dữ liệu'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>
                Ngày gần nhất {latestDate ? `(${formatPracticeDateVi(latestDate)})` : ''}
              </span>
            </button>

            {/* Dropdown danh sách các ngày thực hành trong lịch sử */}
            {availableDates.length > 0 && (
              <select
                value={dateFilterMode === 'custom' && availableDates.includes(customDate) ? customDate : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setCustomDate(e.target.value);
                    setDateFilterMode('custom');
                  }
                }}
                className="bg-slate-800 text-cyan-200 border border-blue-500/40 text-xs px-2.5 py-1 rounded-xl font-semibold focus:outline-none cursor-pointer"
              >
                <option value="">-- Chọn ngày trong lịch sử --</option>
                {availableDates.map((d) => (
                  <option key={d} value={d}>
                    Ngày {formatPracticeDateVi(d)} {d === latestDate ? '(Gần nhất)' : ''}
                  </option>
                ))}
              </select>
            )}

            {/* Ô Chọn Ngày Bất Kỳ (HTML5 Date Input) */}
            <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-xl border border-white/20 transition-colors">
              <span className="text-[11px] text-blue-200 font-medium">Chọn ngày bất kỳ:</span>
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  if (e.target.value) {
                    setDateFilterMode('custom');
                  }
                }}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="text-[11px] text-cyan-200 font-medium">
            {effectiveFilterDate ? (
              <span>
                Đang xem ngày: <strong className="text-white font-bold">{formatPracticeDateVi(effectiveFilterDate)}</strong> (
                {uniqueClassList.length} nhóm)
              </span>
            ) : (
              <span>Toàn bộ các ngày ({uniqueClassList.length} nhóm)</span>
            )}
          </div>
        </div>

        {/* Nút Quản Lý Cho Phép Nộp Bài (Dành Cho Giáo Viên Trước Khi Ổn Định Lớp) */}
        {isTeacher && onToggleSubmissionPermission && (
          <div className="p-3 sm:px-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-indigo-700 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${allowSubmission ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-bold">
                Quyền quản lý nộp bài của Giáo viên:
              </span>
              <span className="text-slate-300 font-medium hidden sm:inline">
                {allowSubmission
                  ? 'Học sinh đang được phép nộp bài thực hành trên phòng máy.'
                  : 'Đang khóa nộp bài (tránh học sinh làm bài ở nhà nộp trước khi ổn định lớp thực hành).'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleSubmissionPermission(!allowSubmission)}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
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
                    <span>Bật Cho Phép Nộp Bài</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Stats & Filter Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="text-slate-600">
              Tổng số nhóm đã nộp: <strong className="text-slate-900 font-bold">{total}</strong>
            </span>
            <span className="w-1 h-1 bg-slate-400 rounded-full" />
            <span className="text-slate-600">
              Đạt 10/10: <strong className="text-amber-600 font-bold">{perfectCount}</strong> nhóm
            </span>
            <span className="w-1 h-1 bg-slate-400 rounded-full" />
            <span className="text-slate-600">
              Điểm TB: <strong className="text-blue-600 font-bold">{avgScore}đ</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Chế độ xem: Lần cao nhất / Xem chi tiết các lần */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setShowAttemptMode('highest')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  showAttemptMode === 'highest'
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Bảng kết quả chỉ hiển thị lần nộp có điểm cao nhất của từng nhóm"
              >
                Điểm cao nhất
              </button>
              <button
                type="button"
                onClick={() => setShowAttemptMode('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  showAttemptMode === 'all'
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem chi tiết lịch sử từng lần nộp của nhóm"
              >
                Mở rộng các lần
              </button>
            </div>

            {/* Sort Toggles */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setSortBy('machine')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  sortBy === 'machine'
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Máy 01, 02...
              </button>
              <button
                type="button"
                onClick={() => setSortBy('name')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  sortBy === 'name'
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tên A-Z
              </button>
              <button
                type="button"
                onClick={() => setSortBy('score')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  sortBy === 'score'
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Điểm cao
              </button>
            </div>

            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm bạn hoặc số máy..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {sorted.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-3 bg-slate-50/70 rounded-2xl border border-slate-200 p-6 mx-2">
              <Users className="w-12 h-12 mx-auto text-blue-500" />
              <p className="font-bold text-base text-slate-800">
                Chưa có dữ liệu bài nộp nào của {activeClass === 'Tất cả' ? 'toàn trường' : `Lớp ${activeClass}`}
                {effectiveFilterDate ? ` vào ngày ${formatPracticeDateVi(effectiveFilterDate)}` : ''}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {effectiveFilterDate
                  ? `Lớp ${activeClass} có thể đã thực hành vào một ngày khác trong tuần.`
                  : 'Hệ thống CSDL tự động ghi nhận ngay khi học sinh bấm "Nộp bài & Chấm điểm AI".'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                {effectiveFilterDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilterMode('all');
                      setCustomDate('');
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Xem tất cả các ngày của lớp {activeClass}
                  </button>
                )}
                {onRefresh && (
                  <button
                    type="button"
                    onClick={onRefresh}
                    className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Làm mới CSDL ngay</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sorted.map((sub, index) => {
                const isTen = sub.highestScore >= 10;
                const isGood = sub.highestScore >= 8;
                const formattedMachine = formatMachineNumber(sub.machineNumber);
                const leaderParsed = splitVietnameseName(sub.studentLeader);
                const isExpanded = expandedSubId === sub.id || showAttemptMode === 'all';

                // Lần nộp cao nhất
                const bestAttempt = sub.attempts.length > 0
                  ? sub.attempts.reduce((b, curr) => (curr.score > (b?.score ?? -1) ? curr : b), sub.attempts[0])
                  : null;

                return (
                  <div
                    key={sub.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isTen
                        ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                        : isGood
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                            {formattedMachine}
                          </span>
                          {(duplicateMachineCounts.get(sub.machineNumber) || 0) > 1 && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1"
                              title="Có 2 nhóm học sinh cùng chọn số máy này"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Trùng số máy</span>
                            </span>
                          )}
                          <span className="font-bold text-sm text-slate-900">
                            {sub.studentLeader}
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            (Tên: <strong className="text-slate-700">{leaderParsed.ten}</strong>)
                          </span>
                          {sortBy === 'score' && index < 3 && isTen && (
                            <span className="text-amber-500 font-bold text-xs flex items-center gap-0.5">
                              <Award className="w-3.5 h-3.5" /> Top {index + 1}
                            </span>
                          )}
                        </div>

                        {sub.groupMembers.length > 0 ? (
                          <div className="text-xs text-slate-600 bg-white/70 rounded-lg p-2 border border-slate-100">
                            <span className="text-slate-500 font-medium">Các bạn cùng nhóm ({sub.groupMembers.length} bạn): </span>
                            <span className="font-semibold text-slate-800">
                              {sub.groupMembers.join(', ')}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Thực hành cá nhân</p>
                        )}

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5 flex-wrap">
                          <span className="font-bold text-emerald-700">
                            Lần cao nhất: {bestAttempt ? `Lần ${bestAttempt.attemptNumber} (${bestAttempt.score}đ)` : `${sub.highestScore}đ`}
                          </span>
                          <span>•</span>
                          <span>Tổng đã nộp: {sub.attempts.length} lần</span>
                          <span>•</span>
                          <span>
                            {new Date(sub.latestSubmittedAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {sub.attempts.length > 1 && showAttemptMode !== 'all' && (
                            <button
                              type="button"
                              onClick={() => setExpandedSubId(expandedSubId === sub.id ? null : sub.id)}
                              className="text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer ml-1"
                            >
                              {expandedSubId === sub.id ? 'Thu gọn' : 'Xem các lần nộp'}
                            </button>
                          )}
                        </div>

                        {/* Chi tiết các lần nộp khi mở rộng */}
                        {isExpanded && sub.attempts.length > 1 && (
                          <div className="mt-2 pt-2 border-t border-slate-200/80 space-y-1 bg-white/80 p-2.5 rounded-xl text-xs">
                            <span className="font-bold text-slate-700 block text-[11px]">
                              Chi tiết lịch sử các lần chấm:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {sub.attempts.map((att) => (
                                <span
                                  key={att.attemptNumber}
                                  className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border ${
                                    att.score === sub.highestScore
                                      ? 'bg-amber-100 border-amber-300 text-amber-900 font-black'
                                      : 'bg-slate-100 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  Lần {att.attemptNumber}: {att.score}đ {att.score === sub.highestScore ? '★' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Score badge */}
                      <div
                        className={`px-3 py-1.5 rounded-xl border text-center shrink-0 ${
                          isTen
                            ? 'bg-amber-100 border-amber-300 text-amber-900 font-black'
                            : isGood
                            ? 'bg-blue-100 border-blue-300 text-blue-900 font-extrabold'
                            : 'bg-slate-100 border-slate-300 text-slate-800 font-bold'
                        }`}
                      >
                        <div className="text-lg leading-none">{sub.highestScore}</div>
                        <div className="text-[10px] font-semibold text-slate-500 mt-0.5">/ 10đ</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-6">
          <div className="flex items-center gap-2 text-emerald-700">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>
              Bảng điểm tự động cập nhật • Xuất Excel đầy đủ tất cả học sinh (Trưởng nhóm + Thành viên) theo thứ tự <strong>Máy 01, Máy 02...</strong> và <strong>cột Tên riêng</strong> ABC!
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
