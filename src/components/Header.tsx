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
  Cloud,
} from 'lucide-react';
import { StitchThumbsUp, StitchDetective } from './StitchMascot';
import computerLabBg from '../assets/images/computer_lab_bg_1791628253579.jpg';
import {
  apiFetch,
  getServerBaseUrl,
  setServerBaseUrl,
  testServerConnection,
  fetchNetworkInfo,
  DEFAULT_CLOUD_BACKEND_URL,
  isStaticHosting,
} from '../utils/apiConfig';
import { realtimeSync } from '../utils/realtimeSync';
import { isFirebaseReady } from '../services/firebase';

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
  onExportMultiProductExcel?: () => void;
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
  isRealtimeConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenStudentInfoModal,
  studentInfo,
  onOpenProjector,
  onOpenClassResults,
  onExportExcel,
  onExportMultiProductExcel,
  activeClassName,
  isTeacher = false,
  onToggleRole,
  allowSubmission = true,
  onToggleSubmissionPermission,
  dbStatus,
  onRefreshDb,
  onSyncAllLocalSubmissionsToDb,
  onOpenStudentRosterModal,
  isRealtimeConnected = false,
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
  const [networkInfo, setNetworkInfo] = useState<{
    port: number;
    lanIps: string[];
    lanUrls: string[];
    activeClients: number;
  } | null>(null);
  const [copiedLanUrl, setCopiedLanUrl] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<{ hasGeminiKey: boolean; model?: string } | null>(null);

  useEffect(() => {
    if (isServerConfigModalOpen) {
      apiFetch('/api/ai-status')
        .then((r) => r.json())
        .then((d) => setAiStatus(d))
        .catch(() => {});
    }
  }, [isServerConfigModalOpen]);

  // Đồng bộ mã PIN thời gian thực từ máy chủ hoặc từ máy Giáo viên qua BroadcastChannel & SSE
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('labgrade_session_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'TEACHER_PIN_CHANGED' && event.data.newPin) {
            setTeacherPin(event.data.newPin);
            try {
              localStorage.setItem(STORAGE_KEY_TEACHER_PIN, event.data.newPin);
            } catch {}
          }
        };
      } catch {}
    }

    const unsub = realtimeSync.subscribe((event) => {
      if (event.type === 'TEACHER_PIN_CHANGED' && event.newPin) {
        setTeacherPin(event.newPin);
        try {
          localStorage.setItem(STORAGE_KEY_TEACHER_PIN, event.newPin);
        } catch {}
      }
    });

    return () => {
      if (bc) bc.close();
      unsub();
    };
  }, []);

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

    const savedPin = localStorage.getItem(STORAGE_KEY_TEACHER_PIN) || teacherPin || '1234';

    // 1. Thử xác thực với máy chủ nếu có API backend phản hồi JSON
    try {
      const res = await apiFetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: entered }),
      }, 5000);

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setTeacherPin(entered);
          try {
            localStorage.setItem(STORAGE_KEY_TEACHER_PIN, entered);
          } catch {}
          setIsPinModalOpen(false);
          setPinInput('');
          setPinError(null);
          setIsVerifying(false);
          if (onToggleRole) onToggleRole();
          return;
        } else {
          setIsVerifying(false);
          setPinError(data.error || 'Mã PIN không chính xác! (Mã PIN mặc định là 1234)');
          return;
        }
      }
    } catch (netErr) {
      console.warn('Lỗi kết nối máy chủ xác thực PIN, chuyển sang đối chiếu cục bộ:', netErr);
    }

    // 2. Chế độ Web tĩnh (Vercel, GitHub Pages) hoặc khi ngoại tuyến:
    // Đối chiếu trực tiếp với mã PIN lưu trong máy hoặc mã mặc định 1234!
    if (entered === savedPin.trim()) {
      setTeacherPin(entered);
      try {
        localStorage.setItem(STORAGE_KEY_TEACHER_PIN, entered);
      } catch {}
      setIsPinModalOpen(false);
      setPinInput('');
      setPinError(null);
      setIsVerifying(false);
      if (onToggleRole) onToggleRole();
      return;
    }

    setIsVerifying(false);
    setPinError('Mã PIN không chính xác! Mã PIN mặc định là 1234 (nếu Thầy/Cô chưa đổi lần nào).');
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

    let syncedToServer = false;
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
      syncedToServer = true;
    } catch {
      // Fallback cục bộ nếu không kết nối được máy chủ
      if (currentPinInput.trim() !== teacherPin.trim()) {
        setChangePinError('Mã PIN hiện tại không chính xác!');
        return;
      }
      syncedToServer = false;
    }

    const updatedPin = newPinInput.trim();
    setTeacherPin(updatedPin);
    localStorage.setItem(STORAGE_KEY_TEACHER_PIN, updatedPin);

    if (syncedToServer) {
      setChangePinSuccess('✅ Đã đổi mã PIN thành công trên máy chủ CSDL 24/7! Toàn bộ máy học sinh và giáo viên sẽ dùng mã PIN mới này.');
    } else {
      setChangePinSuccess('⚠️ Đã đổi mã PIN trên máy này (Chế độ cục bộ). Chưa kết nối máy chủ CSDL nên mã PIN chưa tự động đổi trên các máy khác.');
    }

    setTimeout(() => {
      setIsChangePinModalOpen(false);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setChangePinSuccess(null);
    }, 2500);
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

            {/* Nút Xuất Bảng Điểm Tổng Hợp SP1, SP2... ĐTB (Chỉ Giáo Viên) */}
            {isTeacher && onExportMultiProductExcel && (
              <button
                type="button"
                onClick={onExportMultiProductExcel}
                title={`Xuất file Excel Bảng Tổng Hợp SP1, SP2... ĐTB cho Lớp ${activeClassName || ''} (cập nhật mới nhất thời gian thực)`}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-100 border border-emerald-400/40 transition-all shadow-xs backdrop-blur-xs active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>Bảng Tổng Hợp SP</span>
              </button>
            )}

            {/* Nút Nhập Thông Tin (bên trái nút Máy Chiếu - Luôn hiện chữ 'Nhập Thông Tin') */}
            {onOpenStudentInfoModal && (
              <button
                type="button"
                onClick={onOpenStudentInfoModal}
                title={
                  studentInfo?.className && studentInfo?.studentLeader
                    ? `Đang thực hành: ${studentInfo.className} • ${studentInfo.machineNumber || 'Máy'} • ${studentInfo.studentLeader}. Nháy vào để sửa thông tin.`
                    : 'Nháy vào đây để chọn khối, lớp, số máy và nhập tên học sinh / nhóm'
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all shadow-xs backdrop-blur-xs active:scale-95 cursor-pointer ${
                  studentInfo?.className && studentInfo?.studentLeader
                    ? 'bg-emerald-500/25 hover:bg-emerald-500/35 text-white border-emerald-400/50 ring-1 ring-emerald-400/30'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 font-black animate-pulse'
                }`}
              >
                <UserCheck className={`w-4 h-4 ${studentInfo?.className && studentInfo?.studentLeader ? 'text-emerald-300' : 'text-slate-950'}`} />
                <span>Nhập Thông Tin</span>
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

            {/* Nút Danh Sách Học Sinh Các Lớp (Tải lên từ file Excel 3 cột) - Chỉ hiển thị khi vào Quyền Giáo Viên */}
            {isTeacher && onOpenStudentRosterModal && (
              <button
                type="button"
                onClick={onOpenStudentRosterModal}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-100 border border-emerald-300/40 transition-all shadow-xs cursor-pointer animate-in fade-in"
                title="Tải lên và quản lý danh sách học sinh các lớp từ tệp Excel 3 cột (TT, Họ và tên, Lớp)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">DS Học Sinh (Excel)</span>
              </button>
            )}

            {/* Nút Kết Nối CSDL & Máy Chủ Phòng Máy - Ẩn hoàn toàn khỏi máy học sinh, CHỈ hiển thị khi vào Quyền Giáo Viên */}
            {isTeacher && (
              <button
                type="button"
                onClick={() => {
                  setServerUrlInput(getServerBaseUrl() || (isStaticHosting() ? DEFAULT_CLOUD_BACKEND_URL : ''));
                  setPingResult(null);
                  setSyncStatusMsg(null);
                  setIsServerConfigModalOpen(true);
                  testServerConnection().then(setPingResult).catch(() => {});
                  fetchNetworkInfo().then(setNetworkInfo).catch(() => {});
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all shadow-xs cursor-pointer ${
                  isFirebaseReady || isRealtimeConnected || pingResult?.ok || dbStatus?.status === 'connected'
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-100 border-emerald-400/40'
                    : 'bg-rose-500/25 hover:bg-rose-500/35 text-rose-200 border-rose-400/50 animate-pulse'
                }`}
                title="Trạng thái kết nối CSDL đám mây Firebase & phòng máy. Nhấp vào để xem chi tiết."
              >
                {isFirebaseReady ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-xs" />
                    <Cloud className="w-3.5 h-3.5 text-cyan-300" />
                    <span className="hidden sm:inline">CSDL Đám Mây</span>
                  </>
                ) : isRealtimeConnected || pingResult?.ok || dbStatus?.status === 'connected' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-xs" />
                    <Database className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="hidden sm:inline">CSDL Trực Tuyến</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-rose-300" />
                    <span className="hidden sm:inline">Chưa Kết Nối CSDL</span>
                  </>
                )}
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

            {/* Thẻ CSDL Đám Mây Firebase Firestore (Lưu trữ vĩnh viễn) */}
            {isFirebaseReady && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 border border-cyan-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-950 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-cyan-600" />
                    <span>CSDL Đám Mây Firebase Firestore (Miễn Phí Vĩnh Viễn)</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đã Kết Nối
                  </span>
                </div>
                <p className="text-[11px] text-cyan-900 leading-relaxed font-medium">
                  ☁️ Toàn bộ bài nộp thực hành của học sinh và danh sách lớp được tự động lưu trữ vĩnh viễn trên Cloud Firestore. Khi máy tính học sinh tắt hoặc bị đóng băng ổ cứng, bài nộp và điểm số vẫn còn nguyên 100%. Thầy/Cô về nhà chỉ cần mở link Vercel từ điện thoại hoặc máy tính là xem và xuất Excel được ngay!
                </p>
              </div>
            )}

            {/* Trạng thái kết nối hiện tại */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Trạng thái CSDL:</span>
                {isRealtimeConnected || pingResult?.ok ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đang kết nối thời gian thực {pingResult?.latencyMs ? `(${pingResult.latencyMs} ms)` : ''}</span>
                  </span>
                ) : pingResult && !pingResult.ok ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                    <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                    <span>Không thể kết nối máy chủ</span>
                  </span>
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

              {networkInfo && typeof networkInfo.activeClients === 'number' && (
                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span>Máy trạm đang kết nối:</span>
                  <span className="font-bold text-emerald-700">
                    {networkInfo.activeClients} máy đang trực tuyến
                  </span>
                </div>
              )}

              {/* Trạng thái Trí tuệ Nhân tạo Gemini AI */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">Động cơ chấm AI:</span>
                {aiStatus?.hasGeminiKey ? (
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Gemini AI đã kích hoạt</span>
                  </span>
                ) : (
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]" title="Để bật AI chấm thông minh, hãy thêm biến GEMINI_API_KEY trên Render">
                    Bộ lọc từ khóa (Chưa cài GEMINI_API_KEY)
                  </span>
                )}
              </div>

              {pingResult && !pingResult.ok && (
                <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200 font-medium">
                  {pingResult.error}
                </p>
              )}
            </div>

            {/* Mục Dành Cho Giáo Viên: Địa chỉ Mạng LAN phòng máy để học sinh kết nối */}
            {networkInfo && networkInfo.lanUrls && networkInfo.lanUrls.length > 0 && (
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Địa chỉ Mạng LAN phòng máy (Cho máy Học Sinh):</span>
                  </span>
                  <span className="text-[10px] bg-blue-200/80 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                    Khuyên dùng
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Thầy/Cô chỉ cần bảo học sinh mở trình duyệt (Chrome/Cốc Cốc) trên máy học sinh và truy cập vào địa chỉ sau:
                </p>
                <div className="space-y-1.5">
                  {networkInfo.lanUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-blue-300 shadow-2xs">
                      <span className="flex-1 font-mono text-xs font-bold text-blue-900 select-all truncate">
                        {url}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(url);
                          setCopiedLanUrl(url);
                          setTimeout(() => setCopiedLanUrl(null), 2500);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                      >
                        {copiedLanUrl === url ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLanUrl === url ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  * Toàn bộ máy học sinh khi vào link này sẽ tự động liên thông 100% danh sách học sinh và điểm số tức thời với máy giáo viên.
                </p>
              </div>
            )}

            {/* Cấu hình địa chỉ máy chủ */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Địa chỉ Máy Chủ CSDL (API Base URL):</span>
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
                  placeholder="Để trống nếu chạy chung máy chủ, hoặc nhập http://192.168.1.xxx:3000"
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
                  <>Đang mở trên trang web tĩnh. Để liên thông với máy giáo viên, hãy nhập địa chỉ IP máy giáo viên (vd <code className="bg-slate-100 px-1 rounded">http://192.168.1.15:3000</code>) hoặc URL máy chủ Web động.</>
                ) : (
                  <>Hệ thống đang chạy trực tiếp trên máy chủ phòng máy. Các máy con cùng mạng chỉ cần vào URL mạng LAN ở khung phía trên.</>
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

            {/* Hướng dẫn chi tiết: Làm thế nào để chạy mượt như web động */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-700 space-y-1.5">
              <p className="font-bold flex items-center gap-1 text-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Giải pháp để hệ thống chạy mượt như Web Động trực tuyến:</span>
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed">
                <li>
                  <strong>Cách 1 (Mạng nội bộ phòng máy - Tối ưu nhất):</strong> Máy giáo viên mở ứng dụng và khởi chạy server (<code className="bg-slate-200 px-1 rounded">npm start</code>). Các máy học sinh chỉ cần truy cập địa chỉ IP của máy giáo viên (ví dụ <code className="bg-slate-200 px-1 rounded">http://192.168.1.X:3000</code>). Mọi cập nhật DS lớp và bài nộp chạy tức thời 100%.
                </li>
                <li>
                  <strong>Cách 2 (Web Động Online 24/7 trên Internet):</strong> Đưa toàn bộ mã nguồn lên Render.com hoặc Railway (miễn phí). Khi đó toàn trường có 1 link web động duy nhất, học sinh và giáo viên mở bất kỳ đâu đều tự động cập nhật ngay trên web.
                </li>
              </ul>
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
