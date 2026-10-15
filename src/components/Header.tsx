import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Tv,
  Sparkles,
  Users,
  ShieldCheck,
  GraduationCap,
  Lock,
  Unlock,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle2,
  Settings,
  Server,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  Copy,
  Check,
  Globe,
  UserCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { StitchThumbsUp, StitchDetective } from './StitchMascot';
import computerLabBg from '../assets/images/computer_lab_bg_1791628253579.jpg';
import {
  apiFetch,
  getServerBaseUrl,
  setServerBaseUrl,
  testServerConnection,
  DEFAULT_CLOUD_BACKEND_URL,
  isStaticHosting,
} from '../utils/apiConfig';

const STORAGE_KEY_TEACHER_PIN = 'labgrade_teacher_pin_v1';

interface HeaderProps {
  onOpenStudentInfoModal?: () => void;
  studentInfo?: {
    className?: string;
    machineNumber?: string;
    studentLeader?: string;
    groupMembers?: string[];
  };
  onOpenProjector: () => void;
  onOpenClassResults: () => void;
  onExportExcel?: () => void;
  activeClassName?: string;
  onChangeClassName?: (cls: string) => void;
  totalSubmissions?: number;
  perfectSubmissions?: number;
  isTeacher?: boolean;
  onToggleRole?: () => void;
  allowSubmission?: boolean;
  onToggleSubmissionPermission?: (allow: boolean) => void;
  dbStatus?: {
    status: string;
    isPersistent: boolean;
    totalSubmissions: number;
    totalAttempts: number;
    lastUpdated?: string;
    classes?: Record<string, number>;
  };
  onRefreshDb?: () => Promise<void>;
  onSyncAllLocalSubmissionsToDb?: () => Promise<{ success: boolean; count: number; error?: string }>;
  onOpenStudentRosterModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenStudentInfoModal,
  studentInfo,
  onOpenProjector,
  onOpenClassResults,
  onExportExcel,
  activeClassName,
  isTeacher = false,
  onToggleRole,
  allowSubmission = true,
  onToggleSubmissionPermission,
  dbStatus,
  onRefreshDb,
  onSyncAllLocalSubmissionsToDb,
  onOpenStudentRosterModal,
}) => {
  // Quản lý mã PIN bảo vệ quyền Giáo viên
  const [teacherPin, setTeacherPin] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_TEACHER_PIN) || '1234';
  });

  // Modal xác thực quyền Giáo viên (dành cho người muốn chuyển từ Học sinh -> Giáo viên)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Modal đổi mã PIN (dành cho Giáo viên khi đã vào hệ thống)
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [changePinError, setChangePinError] = useState<string | null>(null);
  const [changePinSuccess, setChangePinSuccess] = useState<string | null>(null);

  // Modal Cấu hình Máy Chủ & CSDL Phòng Máy
  const [isServerConfigModalOpen, setIsServerConfigModalOpen] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(() => getServerBaseUrl() || (isStaticHosting() ? DEFAULT_CLOUD_BACKEND_URL : ''));
  const [pingResult, setPingResult] = useState<{ ok: boolean; latencyMs: number; error?: string; submissionsCount?: number } | null>(null);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [isSyncingAllLocal, setIsSyncingAllLocal] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleRoleButtonClick = () => {
    if (isTeacher) {
      // Đang ở quyền Giáo viên -> bấm để chuyển về Học sinh
      if (onToggleRole) onToggleRole();
    } else {
      // Đang ở quyền Học sinh -> yêu cầu mã PIN của Giáo viên
      setPinInput('');
      setPinError(null);
      setIsPinModalOpen(true);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = pinInput.trim();
    if (!entered) {
      setPinError('Vui lòng nhập mã PIN bảo mật.');
      return;
    }

    setIsVerifying(true);
    setPinError(null);

    try {
      const res = await apiFetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: entered }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsPinModalOpen(false);
          setPinInput('');
          setPinError(null);
          setIsVerifying(false);
          if (onToggleRole) onToggleRole();
          return;
        }
      }
    } catch {}

    // Fallback đối chiếu với mã lưu trữ cục bộ khi ngoại tuyến
    if (entered === teacherPin.trim()) {
      setIsPinModalOpen(false);
      setPinInput('');
      setPinError(null);
      setIsVerifying(false);
      if (onToggleRole) onToggleRole();
      return;
    }

    setIsVerifying(false);
    setPinError('Mã PIN không chính xác. Vui lòng liên hệ Thầy/Cô giáo phụ trách phòng máy!');
  };

  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePinError(null);
    setChangePinSuccess(null);

    if (newPinInput.trim().length < 4) {
      setChangePinError('Mã PIN mới phải có tối thiểu 4 ký tự!');
      return;
    }
    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setChangePinError('Mã PIN mới và Xác nhận mã PIN không trùng khớp!');
      return;
    }

    // Gửi cập nhật lên máy chủ phòng máy
    try {
      const res = await apiFetch('/api/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPin: currentPinInput.trim(),
          newPin: newPinInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setChangePinError(data.error || 'Mã PIN hiện tại không chính xác!');
        return;
      }
    } catch {
      // Fallback cục bộ nếu không kết nối được máy chủ
      if (currentPinInput.trim() !== teacherPin.trim()) {
        setChangePinError('Mã PIN hiện tại không chính xác!');
        return;
      }
    }

    const updatedPin = newPinInput.trim();
    setTeacherPin(updatedPin);
    localStorage.setItem(STORAGE_KEY_TEACHER_PIN, updatedPin);

    setChangePinSuccess('Đã đổi mã PIN mới thành công! Thầy/cô vui lòng ghi nhớ mã PIN này.');
    setTimeout(() => {
      setIsChangePinModalOpen(false);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setChangePinSuccess(null);
    }, 1500);
  };

  const handleTestPing = async () => {
    setIsTestingPing(true);
    setPingResult(null);
    try {
      const res = await testServerConnection(serverUrlInput.trim() || undefined);
      setPingResult(res);
    } finally {
      setIsTestingPing(false);
    }
  };

  const handleSaveServerUrl = () => {
    setServerBaseUrl(serverUrlInput.trim() || null);
    setSyncStatusMsg('Đã lưu cấu hình máy chủ. Toàn bộ yêu cầu nộp bài và đồng bộ sẽ kết nối theo địa chỉ này.');
    setTimeout(() => {
      setSyncStatusMsg(null);
      if (onRefreshDb) onRefreshDb();
    }, 1500);
  };

  const handleResetDefaultServer = () => {
    const defaultUrl = isStaticHosting() ? DEFAULT_CLOUD_BACKEND_URL : '';
    setServerUrlInput(defaultUrl);
    setServerBaseUrl(defaultUrl || null);
    setSyncStatusMsg('Đã khôi phục địa chỉ Máy chủ CSDL mặc định.');
    setTimeout(() => {
      setSyncStatusMsg(null);
      if (onRefreshDb) onRefreshDb();
    }, 1500);
  };

  const handleSyncLocalSubmissions = async () => {
    if (!onSyncAllLocalSubmissionsToDb) return;
    setIsSyncingAllLocal(true);
    setSyncStatusMsg('Đang tải và đẩy toàn bộ bài nộp trên máy này lên máy chủ CSDL...');
    try {
      const res = await onSyncAllLocalSubmissionsToDb();
      if (res.success) {
        setSyncStatusMsg(`Đồng bộ thành công! Đã cập nhật ${res.count} bài nộp vào CSDL trung tâm.`);
      } else {
        setSyncStatusMsg(`Lỗi khi đồng bộ: ${res.error || 'Vui lòng kiểm tra lại kết nối mạng'}`);
      }
    } catch (err: any) {
      setSyncStatusMsg(`Lỗi kết nối: ${err.message || 'Không thể đồng bộ'}`);
    } finally {
      setIsSyncingAllLocal(false);
    }
  };
  return (
    <header className="relative text-white border-b border-blue-400/30 sticky top-0 z-40 shadow-xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-800 to-sky-800">
      {/* Ảnh Nền Phòng Thực Hành Tin Học với lớp phủ màu sáng, hiện đại */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity pointer-events-none scale-105"
        style={{ backgroundImage: `url(${computerLabBg})` }}
      />
      {/* Lớp phủ chuyển màu sáng hơn, loại bỏ hoàn toàn nền đen u tối */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-indigo-800/75 to-cyan-800/80 backdrop-blur-[2px] pointer-events-none" />

      <div className="relative w-full max-w-[98%] 2xl:max-w-[1900px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo & Brand with Stitch */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-blue-500 via-cyan-500 to-white flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/20">
                <Monitor className="w-6 h-6 sm:w-7 sm:h-7 text-blue-900" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 pointer-events-none drop-shadow-md">
                <StitchThumbsUp className="w-full h-full" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-white drop-shadow-sm">
                  LabGrade <span className="text-cyan-300">AI</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-cyan-100 border border-white/30 backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-300" /> Phòng Tin Học
                </span>
              </div>
              <p className="text-xs text-blue-100/90 font-medium hidden sm:block drop-shadow-2xs">
                Nộp bài & chấm điểm trực quan • Tối ưu 10 điểm • Xuất Excel theo lớp
              </p>
            </div>
          </div>

          {/* Action Buttons: Cho Phép Nộp Bài, Kết Quả Lớp, Xuất Excel, Máy Chiếu & Quyền Giáo Viên */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {/* Quyền Quản Lý Nộp Bài: Bật/Tắt Cho Phép Nộp Bài (Chỉ Giáo Viên có quyền) */}
            {isTeacher && onToggleSubmissionPermission && (
              <button
                type="button"
                onClick={() => onToggleSubmissionPermission(!allowSubmission)}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black border transition-all shadow-xs cursor-pointer ${
                  allowSubmission
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400'
                    : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 animate-pulse'
                }`}
                title={
                  allowSubmission
                    ? 'Đang CHO PHÉP học sinh nộp bài. Bấm vào đây để KHÓA nộp bài khi chưa ổn định lớp.'
                    : 'Đang KHÓA nộp bài (tránh học sinh nộp trước). Bấm vào đây để BẬT CHO PHÉP nộp bài khi lớp đã ổn định.'
                }
              >
                {allowSubmission ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Cho Phép Nộp: Đang Bật</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Nộp Bài: Đang Khóa</span>
                  </>
                )}
              </button>
            )}

            {/* Button 1: Xem Bảng Điểm Cả Lớp (Chỉ xuất hiện khi Giáo viên vào quyền Giáo Viên) */}
            {isTeacher && (
              <button
                onClick={onOpenClassResults}
                title="Xem bảng điểm và kết quả của các nhóm trong lớp đang thực hành"
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/15 hover:bg-white/25 text-white border border-white/25 hover:border-white/40 transition-all shadow-xs backdrop-blur-xs active:scale-95 cursor-pointer"
              >
                <Users className="w-4 h-4 text-cyan-300" />
                <span>Kết Quả Lớp {activeClassName ? `(${activeClassName})` : ''}</span>
              </button>
            )}

            {/* Nút Nhập Thông Tin (bên trái nút Máy Chiếu theo yêu cầu của Thầy/Cô) */}
            {onOpenStudentInfoModal && (
              <button
                type="button"
                onClick={onOpenStudentInfoModal}
                title="Nháy vào đây để chọn khối, lớp, số máy và nhập tên học sinh / nhóm"
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all shadow-xs backdrop-blur-xs active:scale-95 cursor-pointer ${
                  studentInfo?.className && studentInfo?.studentLeader
                    ? 'bg-emerald-500/25 hover:bg-emerald-500/35 text-white border-emerald-400/40 ring-1 ring-emerald-400/30'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 font-black animate-pulse'
                }`}
              >
                <UserCheck className={`w-4 h-4 ${studentInfo?.className && studentInfo?.studentLeader ? 'text-emerald-300' : 'text-slate-950'}`} />
                <span>
                  {studentInfo?.className && studentInfo?.studentLeader
                    ? `${studentInfo.className} • ${studentInfo.machineNumber || 'Máy'}`
                    : 'Nhập Thông Tin'}
                </span>
                <span className="text-[11px] opacity-80 hidden xl:inline">
                  {studentInfo?.studentLeader ? `(${studentInfo.studentLeader.split(' ').slice(-1)[0]})` : ''}
                </span>
              </button>
            )}

            {/* Button 2: Màn Hình Máy Chiếu */}
            <button
              onClick={onOpenProjector}
              title="Bật màn hình máy chiếu phòng thực hành kết nối toàn bộ máy"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-blue-100 border border-white/20 transition-all shadow-xs backdrop-blur-xs active:scale-95 cursor-pointer"
            >
              <Tv className="w-4 h-4 text-cyan-300" />
              <span>Máy Chiếu</span>
            </button>

            {/* Nút Quyền Giáo Viên (chuyển về bên phải nút Máy Chiếu theo yêu cầu của Thầy/Cô) */}
            {onToggleRole && (
              <button
                type="button"
                onClick={handleRoleButtonClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all shadow-xs cursor-pointer ${
                  isTeacher
                    ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300'
                    : 'bg-white/15 text-white border-white/25 hover:bg-white/25'
                }`}
                title={
                  isTeacher
                    ? 'Đang bật Quyền Giáo Viên (Bấm để quay về vai trò Học Sinh)'
                    : 'Nháy vào đây để nhập mã PIN mở Quyền Giáo Viên phòng máy'
                }
              >
                {isTeacher ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                    <span>Quyền Giáo Viên</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Quyền Giáo Viên</span>
                    <Lock className="w-3.5 h-3.5 text-amber-200/80 ml-0.5" />
                  </>
                )}
              </button>
            )}

            {/* Nút Đổi Mã PIN (Chỉ dành cho Giáo viên khi đã vào hệ thống) */}
            {isTeacher && (
              <button
                type="button"
                onClick={() => {
                  setCurrentPinInput('');
                  setNewPinInput('');
                  setConfirmPinInput('');
                  setChangePinError(null);
                  setChangePinSuccess(null);
                  setIsChangePinModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/15 hover:bg-white/25 text-amber-200 border border-amber-300/40 transition-all shadow-xs cursor-pointer"
                title="Thay đổi mã PIN Giáo Viên của phòng máy"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden md:inline">Đổi Mã PIN</span>
              </button>
            )}

            {/* Nút Danh Sách Học Sinh Các Lớp (Tải lên từ file Excel 3 cột) */}
            {isTeacher && onOpenStudentRosterModal && (
              <button
                type="button"
                onClick={onOpenStudentRosterModal}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-200 border border-emerald-300/40 transition-all shadow-xs cursor-pointer"
                title="Tải lên và quản lý danh sách học sinh các lớp từ tệp Excel 3 cột (TT, Họ và tên, Lớp)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">DS Học Sinh (Excel)</span>
              </button>
            )}

            {/* Nút Kết Nối CSDL & Máy Chủ Phòng Máy */}
            {isTeacher && (
              <button
                type="button"
                onClick={() => {
                  setServerUrlInput(getServerBaseUrl() || (isStaticHosting() ? DEFAULT_CLOUD_BACKEND_URL : ''));
                  setPingResult(null);
                  setSyncStatusMsg(null);
                  setIsServerConfigModalOpen(true);
                  testServerConnection().then(setPingResult).catch(() => {});
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-300/40 transition-all shadow-xs cursor-pointer"
                title="Cấu hình kết nối Máy chủ CSDL trung tâm để tất cả máy học sinh liên thông dữ liệu"
              >
                <Server className="w-3.5 h-3.5 text-cyan-300" />
                <span className="hidden sm:inline">CSDL & Máy Chủ</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nhập Mã PIN Xác Thực Quyền Giáo Viên */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-900 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Xác Thực Quyền Giáo Viên</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Bảo vệ quyền quản lý phòng máy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-3.5">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Khu vực dành riêng cho Giáo viên phụ trách phòng máy. Vui lòng nhập <strong>Mã PIN bảo mật</strong> để mở quyền quản lý:
              </p>

              <div>
                <input
                  type="password"
                  autoFocus
                  maxLength={16}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(null);
                  }}
                  placeholder="Nhập mã PIN Giáo viên..."
                  className="w-full text-center tracking-widest text-lg font-black font-mono py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                />
              </div>

              {pinError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {isVerifying ? 'Đang Kiểm Tra...' : 'Xác Nhận (Mở Quyền)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thay Đổi Mã PIN Giáo Viên */}
      {isChangePinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-900 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Đổi Mã PIN Giáo Viên</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Bảo mật hệ thống phòng máy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangePinModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePinSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mã PIN hiện tại:</label>
                <input
                  type="password"
                  maxLength={16}
                  value={currentPinInput}
                  onChange={(e) => {
                    setCurrentPinInput(e.target.value);
                    setChangePinError(null);
                  }}
                  placeholder="Nhập mã PIN hiện tại..."
                  className="w-full text-sm font-mono py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mã PIN mới (tối thiểu 4 ký tự):</label>
                <input
                  type="password"
                  maxLength={16}
                  value={newPinInput}
                  onChange={(e) => {
                    setNewPinInput(e.target.value);
                    setChangePinError(null);
                  }}
                  placeholder="Nhập mã PIN mới..."
                  className="w-full text-sm font-mono py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Xác nhận mã PIN mới:</label>
                <input
                  type="password"
                  maxLength={16}
                  value={confirmPinInput}
                  onChange={(e) => {
                    setConfirmPinInput(e.target.value);
                    setChangePinError(null);
                  }}
                  placeholder="Nhập lại mã PIN mới..."
                  className="w-full text-sm font-mono py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white"
                />
              </div>

              {changePinError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{changePinError}</span>
                </div>
              )}

              {changePinSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{changePinSuccess}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsChangePinModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Lưu Mã PIN Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cấu hình Máy Chủ & CSDL Phòng Máy */}
      {isServerConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-slate-900 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-800">
                  <Database className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Cấu Hình CSDL & Liên Thông Phòng Máy</h3>
                  <p className="text-xs text-slate-500 font-medium">Đảm bảo kết nối đồng bộ giữa máy học sinh và giáo viên</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsServerConfigModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trạng thái kết nối hiện tại */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Trạng thái CSDL:</span>
                {pingResult ? (
                  pingResult.ok ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đang kết nối ({pingResult.latencyMs} ms)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                      <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                      <span>Không thể kết nối</span>
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Đang kiểm tra...</span>
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-600 flex items-center justify-between">
                <span>Dữ liệu CSDL đã lưu:</span>
                <span className="font-black text-slate-900">
                  {dbStatus?.totalSubmissions ?? pingResult?.submissionsCount ?? 0} bài nộp
                </span>
              </div>

              {pingResult && !pingResult.ok && (
                <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                  {pingResult.error}
                </p>
              )}
            </div>

            {/* Cấu hình địa chỉ máy chủ */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Địa chỉ Máy Chủ CSDL (API URL):</span>
                <button
                  type="button"
                  onClick={handleResetDefaultServer}
                  className="text-[11px] text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer"
                >
                  Khôi phục mặc định
                </button>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={serverUrlInput}
                  onChange={(e) => setServerUrlInput(e.target.value)}
                  placeholder="https://... hoặc http://192.168.1.xxx:3000"
                  className="flex-1 text-xs font-mono py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                />
                <button
                  type="button"
                  disabled={isTestingPing}
                  onClick={handleTestPing}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isTestingPing ? 'animate-spin' : ''}`} />
                  <span>{isTestingPing ? 'Đang test...' : 'Kiểm tra'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isStaticHosting() ? (
                  <>Đang chạy trên <strong>GitHub Pages</strong>. Hệ thống tự động trỏ về máy chủ Cloud Run trung tâm để đồng bộ điểm của tất cả học sinh.</>
                ) : (
                  <>Có thể nhập IP máy giáo viên trong mạng LAN phòng máy (ví dụ: <code className="bg-slate-100 px-1 rounded">http://192.168.1.100:3000</code>).</>
                )}
              </p>
            </div>

            {/* Hành động đồng bộ dữ liệu */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveServerUrl}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                >
                  Lưu Cấu Hình Máy Chủ
                </button>
                {onSyncAllLocalSubmissionsToDb && (
                  <button
                    type="button"
                    disabled={isSyncingAllLocal}
                    onClick={handleSyncLocalSubmissions}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAllLocal ? 'animate-spin' : ''}`} />
                    <span>Đồng Bộ Bài Nộp Lên CSDL</span>
                  </button>
                )}
              </div>

              {syncStatusMsg && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs font-medium animate-in fade-in">
                  {syncStatusMsg}
                </div>
              )}
            </div>

            {/* Hướng dẫn liên thông */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1 text-amber-800">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Nguyên nhân trước đây không thấy bài nộp lớp 8A2:</span>
              </p>
              <p className="leading-relaxed">
                Trên GitHub Pages tĩnh, nếu không liên thông với máy chủ CSDL trung tâm, bài nộp chỉ nằm cục bộ trong trình duyệt của từng máy học sinh. Khi kết nối CSDL trung tâm được thiết lập, mọi bài nộp của học sinh sẽ tự động được gửi về CSDL và hiển thị ngay trên máy giáo viên trong thời gian thực.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsServerConfigModalOpen(false)}
                className="py-2 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
