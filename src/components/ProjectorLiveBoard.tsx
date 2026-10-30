import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Clock,
  RefreshCw,
  Filter,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Download,
  FolderDown,
  Lock,
  Unlock,
} from 'lucide-react';
import { Submission, Assignment, StudentRecord } from '../types';
import { SCHOOL_CLASSES } from '../data/classes';
import { apiFetch } from '../utils/apiConfig';
import { realtimeSync } from '../utils/realtimeSync';
import { playPlagiarismWarningSound } from '../utils/antiPlagiarism';
import { isFirebaseReady, fetchSettingsFromCloud } from '../services/firebase';
import { downloadSubmissionProductFile } from '../utils/fileDownload';

interface ProjectorLiveBoardProps {
  className: string;
  assignment: Assignment;
  submissions: Submission[];
  assignments?: Assignment[];
  studentRoster?: StudentRecord[];
  onClose: () => void;
  onRefresh?: () => void;
  onClearSubmissions?: (targetClass?: string) => Promise<boolean>;
  isTeacher?: boolean;
  allowSubmission?: boolean;
  allowedClasses?: string[];
  onToggleSubmissionPermission?: (allow: boolean, targetClass?: string) => void;
}

export const ProjectorLiveBoard: React.FC<ProjectorLiveBoardProps> = ({
  className,
  assignment,
  submissions,
  assignments = [],
  studentRoster = [],
  onClose,
  onRefresh,
  onClearSubmissions,
  isTeacher = false,
  allowSubmission = true,
  allowedClasses = [],
  onToggleSubmissionPermission,
}) => {
  // Lấy danh sách lớp duy nhất từ danh sách học sinh đã tải lên (nếu có)
  const rosterClasses = useMemo(() => {
    const set = new Set<string>();
    (studentRoster || []).forEach((r) => {
      if (r.className?.trim()) set.add(r.className.trim());
    });
    return Array.from(set).sort();
  }, [studentRoster]);

  // Danh sách các lớp hiển thị: Nếu có danh sách tải lên thì CHỈ hiển thị đúng các lớp đó!
  const displayedClasses: string[] = useMemo(() => {
    if (rosterClasses.length > 0) return rosterClasses;
    const subClasses = Array.from(new Set((submissions || []).map((s) => s.className).filter(Boolean)));
    if (subClasses.length > 0) return subClasses.sort();
    return [...SCHOOL_CLASSES];
  }, [rosterClasses, submissions]);

  // Timer state (45 minutes standard class duration)
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeClassFilter, setActiveClassFilter] = useState<string>(() => {
    if (className && className !== 'Tất cả') return className;
    if (displayedClasses.length > 0) return displayedClasses[0];
    return 'Tất cả';
  });

  // Tự động chuyển activeClassFilter nếu lớp hiện tại không còn trong danh sách lớp tải lên
  useEffect(() => {
    if (displayedClasses.length > 0 && activeClassFilter !== 'Tất cả' && !displayedClasses.includes(activeClassFilter)) {
      setActiveClassFilter(displayedClasses[0]);
    }
  }, [displayedClasses, activeClassFilter]);

  // Bộ lọc sản phẩm nộp (Tất cả sản phẩm / SP01 / SP02 / SP03...)
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('all');

  // Real-time live submissions synchronized across all lab PCs
  const [liveSubmissions, setLiveSubmissions] = useState<Submission[]>(submissions || []);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() =>
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [recentMachineId, setRecentMachineId] = useState<string | null>(null);

  // Trạng thái modal xóa kết quả cũ
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [clearSuccessNotice, setClearSuccessNotice] = useState<string | null>(null);

  const [teacherPinInput, setTeacherPinInput] = useState<string>('');
  const [pinErrorMsg, setPinErrorMsg] = useState<string | null>(null);

  // Cảnh báo sao chép tệp lớp trước thời gian thực
  const [activePlagiarismAlert, setActivePlagiarismAlert] = useState<{
    machineNumber: string;
    className: string;
    studentLeader: string;
    copiedFromClass: string;
    copiedFromStudent: string;
    copiedFromMachine: string;
    copiedAt?: string;
    message: string;
    timestamp: string;
  } | null>(null);

  // Sync strictly when prop submissions updates (chỉ giữ lại bài nộp của ngày hôm nay)
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const validSubs = (submissions || []).filter((s) => {
      if (!s || String(s.id).startsWith('mock-')) return false;
      const subDate = s.practiceDate || (s.latestSubmittedAt ? s.latestSubmittedAt.slice(0, 10) : '');
      return subDate === todayStr;
    });
    setLiveSubmissions(validSubs);
  }, [submissions]);

  // Lắng nghe tín hiệu xóa bài nộp và CẢNH BÁO SAO CHÉP từ BroadcastChannel & SSE Realtime
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('labgrade_session_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'SUBMISSIONS_CLEARED') {
            if (!event.data.targetClass || event.data.targetClass === 'Tất cả') {
              setLiveSubmissions([]);
            } else {
              setLiveSubmissions((prev) => prev.filter((s) => s.className !== event.data.targetClass));
            }
          } else if (event.data?.type === 'PLAGIARISM_ALERT') {
            playPlagiarismWarningSound();
            setActivePlagiarismAlert(event.data);
          }
        };
      } catch {}
    }

    const unsub = realtimeSync.subscribe((event) => {
      if (event.type === 'PLAGIARISM_ALERT') {
        playPlagiarismWarningSound();
        setActivePlagiarismAlert(event as any);
      }
    });

    return () => {
      if (bc) bc.close();
      unsub();
    };
  }, []);

  // Active continuous live polling every 2.5 seconds to capture any student submission from any PC
  useEffect(() => {
    let isMounted = true;
    const fetchLabUpdates = async () => {
      try {
        const res = await apiFetch('/api/submissions');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.submissions)) {
            const todayStr = new Date().toISOString().slice(0, 10);
            const validSubs = data.submissions.filter((s: Submission) => {
              if (!s || String(s.id).startsWith('mock-')) return false;
              const subDate = s.practiceDate || (s.latestSubmittedAt ? s.latestSubmittedAt.slice(0, 10) : '');
              return subDate === todayStr;
            });

            // Phát hiện máy vừa mới nộp bài hoặc cập nhật điểm số
            const newlyUpdated = validSubs.find((s: Submission) => {
              const old = liveSubmissions.find((o) => o.id === s.id);
              return !old || s.attempts?.length !== old.attempts?.length || s.highestScore !== old.highestScore;
            });

            if (newlyUpdated) {
              setRecentMachineId(newlyUpdated.machineNumber);
              setTimeout(() => {
                if (isMounted) setRecentMachineId(null);
              }, 4000);
            }

            setLiveSubmissions(validSubs);
            setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
        }
      } catch {}
    };

    const interval = setInterval(fetchLabUpdates, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [liveSubmissions]);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Thực hiện xóa sạch toàn bộ kết quả chấm cũ
  const handleExecuteClear = async () => {
    if (!isTeacher) {
      if (!teacherPinInput.trim()) {
        setPinErrorMsg('Vui lòng nhập mã PIN Giáo viên.');
        return;
      }
      let expectedPin = localStorage.getItem('labgrade_teacher_pin_v1') || localStorage.getItem('labgrade_teacher_pin') || '1234';
      if (isFirebaseReady) {
        try {
          const cloudSettings = await fetchSettingsFromCloud();
          if (cloudSettings?.teacherPin) {
            expectedPin = cloudSettings.teacherPin.trim();
          }
        } catch {}
      }

      try {
        const verifyRes = await apiFetch('/api/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: teacherPinInput.trim() }),
        }, 3000);
        const contentType = verifyRes.headers.get('content-type') || '';
        if (verifyRes.ok && contentType.includes('application/json')) {
          const vData = await verifyRes.json().catch(() => ({}));
          if (!vData.success) {
            setPinErrorMsg(vData.error || 'Mã PIN Giáo viên không chính xác!');
            return;
          }
        } else {
          if (teacherPinInput.trim() !== expectedPin.trim()) {
            setPinErrorMsg(expectedPin !== '1234' ? 'Mã PIN không chính xác! (Mã 1234 mặc định đã bị thay đổi trên đám mây).' : 'Mã PIN Giáo viên không chính xác! Mã PIN mặc định là 1234.');
            return;
          }
        }
      } catch {
        if (teacherPinInput.trim() !== expectedPin.trim()) {
          setPinErrorMsg(expectedPin !== '1234' ? 'Mã PIN không chính xác! (Mã 1234 mặc định đã bị thay đổi trên đám mây).' : 'Mã PIN Giáo viên không chính xác! Mã PIN mặc định là 1234.');
          return;
        }
      }
    }

    setIsClearing(true);
    try {
      if (onClearSubmissions) {
        await onClearSubmissions(activeClassFilter === 'Tất cả' ? undefined : activeClassFilter);
      } else {
        await apiFetch('/api/submissions/clear', { method: 'POST' });
        await apiFetch('/api/submissions', { method: 'DELETE' });
      }

      setLiveSubmissions([]);
      setTimeLeft(45 * 60);
      setClearSuccessNotice(
        activeClassFilter === 'Tất cả'
          ? 'Đã xóa sạch toàn bộ kết quả chấm thực hành cũ trên máy chiếu và CSDL!'
          : `Đã xóa sạch toàn bộ kết quả của Lớp ${activeClassFilter}!`
      );
      setTimeout(() => setClearSuccessNotice(null), 3500);
      setIsConfirmClearOpen(false);
      if (onRefresh) onRefresh();
    } catch {}
    setIsClearing(false);
  };

  // Tải tệp sản phẩm bài làm của 1 máy về máy tính giáo viên (mở chuẩn 100% không bao giờ lỗi)
  const handleDownloadSubmissionFile = (sub: Submission) => {
    downloadSubmissionProductFile(sub).catch((err) => {
      console.warn('Lỗi tải tệp sản phẩm:', err);
    });
  };

  // Danh sách các bài tập phù hợp với lớp đang chọn
  const relevantAssignments = useMemo(() => {
    const all = assignments && assignments.length > 0 ? assignments : [assignment];
    if (activeClassFilter === 'Tất cả') {
      return all;
    }
    const gradeDigit = activeClassFilter.replace(/\D/g, '')[0];
    if (gradeDigit) {
      const matched = all.filter((a) => a.gradeLevel === `Lớp ${gradeDigit}`);
      if (matched.length > 0) return matched;
    }
    return all;
  }, [assignments, assignment, activeClassFilter]);

  // Filter submissions by class (chỉ hiển thị bài nộp của ngày thực hành hôm nay)
  const todayStr = new Date().toISOString().slice(0, 10);
  const activeSubs = liveSubmissions.filter((s) => {
    if (!s || String(s.id).startsWith('mock-')) return false;
    const subDate = s.practiceDate || (s.latestSubmittedAt ? s.latestSubmittedAt.slice(0, 10) : '');
    return subDate === todayStr;
  });

  const classSubmissions = activeClassFilter === 'Tất cả'
    ? activeSubs
    : activeSubs.filter((s) => s.className === activeClassFilter);

  // Lọc theo sản phẩm đã nộp nếu giáo viên chọn lọc SP
  const productFilteredSubs = useMemo(() => {
    if (selectedProductFilter === 'all') return classSubmissions;
    return classSubmissions.filter((s) => s.assignmentId === selectedProductFilter);
  }, [classSubmissions, selectedProductFilter]);

  // Gom bài nộp theo số máy
  const submissionByMachine = new Map<string, Submission>();
  const duplicateMachineMap = new Map<string, Submission[]>();

  productFilteredSubs.forEach((s) => {
    const list = duplicateMachineMap.get(s.machineNumber) || [];
    list.push(s);
    duplicateMachineMap.set(s.machineNumber, list);

    const existing = submissionByMachine.get(s.machineNumber);
    if (!existing || s.highestScore > existing.highestScore) {
      submissionByMachine.set(s.machineNumber, s);
    }
  });

  // Tải toàn bộ sản phẩm của các máy đang nộp về máy tính giáo viên
  const handleDownloadAllSubmissions = () => {
    const listToDownload = Array.from(submissionByMachine.values());
    if (listToDownload.length === 0) return;
    listToDownload.forEach((sub, idx) => {
      setTimeout(() => {
        downloadSubmissionProductFile(sub).catch(() => {});
      }, idx * 300);
    });
  };

  const isClassAllowed = useMemo(() => {
    if (!allowSubmission) return false;
    if (activeClassFilter === 'Tất cả') return allowSubmission;
    if (Array.isArray(allowedClasses) && allowedClasses.length > 0) {
      const norm = activeClassFilter.trim().toUpperCase().replace(/^LỚP\s*|^LOP\s*/i, '');
      return allowedClasses.some((c) => c.trim().toUpperCase().replace(/^LỚP\s*|^LOP\s*/i, '') === norm);
    }
    return allowSubmission;
  }, [allowSubmission, activeClassFilter, allowedClasses]);

  const totalSubmitted = isClassAllowed ? submissionByMachine.size : 0;
  const avgScore = totalSubmitted > 0
    ? (Array.from(submissionByMachine.values()).reduce((sum, s) => sum + s.highestScore, 0) / totalSubmitted).toFixed(1)
    : '0';

  // Tạo 36 máy tính phòng máy tiêu chuẩn
  const totalMachinesCount = 36;
  const machineCards = Array.from({ length: totalMachinesCount }, (_, i) => {
    const machineId = `Máy ${String(i + 1).padStart(2, '0')}`;
    const sub = submissionByMachine.get(machineId);
    const allSubs = duplicateMachineMap.get(machineId) || [];
    // YÊU CẦU: Khi giáo viên khóa nộp bài của lớp đó, reset toàn bộ màn hình máy chiếu về trạng thái đang thực hành
    const isShowingSubmission = isClassAllowed && Boolean(sub);

    return {
      machineId,
      submission: isShowingSubmission ? sub : null,
      hasMultipleGroups: allSubs.length > 1,
      isPracticingState: !isClassAllowed,
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden select-none animate-in fade-in duration-200">
      {/* Top Bar for Projector */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl shrink-0">
        {/* Left: Lab Info, Class Selector & Product Filter */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                BẢNG TRÌNH CHIẾU PHÒNG THỰC HÀNH
              </span>

              {/* Bộ chọn Lớp: Đồng bộ duy nhất các lớp có trong danh sách tải lên */}
              <div className="flex items-center gap-1.5 bg-blue-900/60 border border-blue-500/50 px-2 py-0.5 rounded-lg">
                <span className="text-xs text-blue-200 font-bold">Lớp:</span>
                <select
                  value={activeClassFilter}
                  onChange={(e) => setActiveClassFilter(e.target.value)}
                  className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-md font-extrabold uppercase border border-blue-400 focus:outline-none cursor-pointer"
                >
                  <option value="Tất cả">Tất cả các lớp</option>
                  {displayedClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Lớp {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nút Chức Năng Lọc Sản Phẩm Đã Nộp (SP01, SP02...) */}
              <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-lg">
                <Filter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-xs text-slate-300 font-bold">Sản phẩm:</span>
                <select
                  value={selectedProductFilter}
                  onChange={(e) => setSelectedProductFilter(e.target.value)}
                  className="bg-slate-900 text-cyan-200 text-xs px-2 py-0.5 rounded-md font-bold border border-slate-600 focus:outline-none cursor-pointer max-w-[220px]"
                >
                  <option value="all">Tất cả SP ({classSubmissions.length} bài)</option>
                  {relevantAssignments.map((a, idx) => {
                    const count = classSubmissions.filter((s) => s.assignmentId === a.id).length;
                    const spCode = `SP${String(idx + 1).padStart(2, '0')}`;
                    return (
                      <option key={a.id} value={a.id}>
                        {spCode}: {a.title.replace(/^SP\d+\.?\s*/i, '').slice(0, 30)} ({count} máy)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Badge trạng thái nộp bài */}
              {isTeacher && onToggleSubmissionPermission ? (
                <button
                  type="button"
                  onClick={() => onToggleSubmissionPermission(!isClassAllowed, activeClassFilter !== 'Tất cả' ? activeClassFilter : undefined)}
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                    isClassAllowed
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                  }`}
                  title={isClassAllowed ? 'Bấm vào để KHÓA nộp bài và kết thúc tiết thực hành của lớp' : 'Bấm vào để MỞ nộp bài cho lớp'}
                >
                  {isClassAllowed ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>{isClassAllowed ? `● Đang mở nộp bài ${activeClassFilter !== 'Tất cả' ? `Lớp ${activeClassFilter}` : ''}` : `🔒 Đang khóa nộp bài ${activeClassFilter !== 'Tất cả' ? `Lớp ${activeClassFilter}` : ''}`}</span>
                </button>
              ) : (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isClassAllowed
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {isClassAllowed ? `● Đang mở nộp bài ${activeClassFilter !== 'Tất cả' ? `Lớp ${activeClassFilter}` : ''}` : `🔒 Đang khóa nộp bài ${activeClassFilter !== 'Tất cả' ? `Lớp ${activeClassFilter}` : ''}`}
                </span>
              )}

              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hidden md:flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                <span>Trực tiếp ({lastSyncTime})</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-0.5">
              {selectedProductFilter !== 'all' ? (
                <span>
                  Đang lọc: <strong className="text-cyan-300">{relevantAssignments.find(a => a.id === selectedProductFilter)?.title || 'Sản phẩm chọn'}</strong> • <strong className="text-white">{totalSubmitted}/36 máy</strong> đã nộp
                </span>
              ) : (
                <span>
                  {assignment.title} • {totalSubmitted}/36 máy đã nộp • Điểm TB: {avgScore}đ
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Center: Countdown Timer */}
        <div className="hidden xl:flex items-center gap-3 bg-slate-800/90 border border-slate-700 px-4 py-1.5 rounded-2xl shadow-inner">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${timeLeft <= 300 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'}`} />
            <span className="font-mono text-xl font-black text-white">{timeFormatted}</span>
          </div>
          <div className="flex items-center gap-1 border-l border-slate-700 pl-2.5">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
              title={isRunning ? 'Tạm dừng' : 'Tiếp tục'}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setTimeLeft(45 * 60)}
              className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
              title="Đặt lại 45 phút"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Nút Xóa Sạch Kết Quả Cũ */}
          <button
            type="button"
            onClick={() => {
              setTeacherPinInput('');
              setPinErrorMsg(null);
              setIsConfirmClearOpen(true);
            }}
            className="p-2 sm:px-3 rounded-xl bg-slate-800 hover:bg-rose-900/70 border border-slate-700 hover:border-rose-600 text-rose-300 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Xóa sạch toàn bộ kết quả chấm ảo hoặc bài nộp cũ các ngày trước để bắt đầu tiết học mới"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span className="hidden md:inline">Xóa Kết Quả Cũ</span>
          </button>

          {/* Nút Lưu Toàn Bộ Bài Làm Của Lớp Về Máy Giáo Viên */}
          {totalSubmitted > 0 && (
            <button
              type="button"
              onClick={handleDownloadAllSubmissions}
              className="p-2 sm:px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-md"
              title={`Lưu toàn bộ bài làm của ${totalSubmitted} máy đã nộp về máy tính giáo viên`}
            >
              <FolderDown className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Lưu Tất Cả Bài ({totalSubmitted})</span>
            </button>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Cập nhật kết quả mới nhất từ phòng máy"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Cập nhật</span>
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors cursor-pointer"
            title="Đóng trình chiếu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thông báo xóa thành công */}
      {clearSuccessNotice && (
        <div className="mx-6 mt-3 p-3 bg-emerald-950/90 border border-emerald-500 rounded-2xl text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{clearSuccessNotice}</span>
        </div>
      )}

      {/* CẢNH BÁO KHI GIÁO VIÊN KHÓA NỘP BÀI */}
      {!allowSubmission && (
        <div className="mx-6 mt-3 p-3 bg-blue-950/90 border border-blue-500/60 rounded-2xl text-blue-200 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-lg shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              🔒 Đang khóa nộp bài: Toàn bộ phòng máy đang trong trạng thái <strong>Đang thực hành</strong>. Màn hình các máy sẽ phát sáng khi Thầy/Cô bật cho phép nộp bài.
            </span>
          </div>
        </div>
      )}

      {/* CẢNH BÁO SAO CHÉP TỆP LỚP TRƯỚC TRÊN MÁY CHIẾU PHÒNG THỰC HÀNH */}
      {activePlagiarismAlert && (
        <div className="mx-6 mt-3 p-4 bg-rose-950/95 border-2 border-rose-500 rounded-2xl text-rose-200 text-xs sm:text-sm font-bold flex items-start justify-between gap-3 shadow-2xl animate-pulse shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 animate-bounce shadow-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-white flex flex-wrap items-center gap-2">
                <span>🚨 CẢNH BÁO GIAN LẬN: PHÁT HIỆN SAO CHÉP TỆP BÀI LÀM CỦA HỌC SINH LỚP TRƯỚC!</span>
                <span className="text-[11px] bg-rose-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  0.0 Điểm
                </span>
              </div>
              <div className="text-xs text-rose-200 mt-1 leading-relaxed">
                <span className="text-white font-extrabold">{activePlagiarismAlert.machineNumber}</span> ({activePlagiarismAlert.className} - Nhóm trưởng: <span className="text-white font-extrabold">{activePlagiarismAlert.studentLeader}</span>) vừa nộp tệp trùng khớp 100% với bài của bạn <span className="text-yellow-300 font-extrabold">{activePlagiarismAlert.copiedFromStudent}</span> ({activePlagiarismAlert.copiedFromClass} - {activePlagiarismAlert.copiedFromMachine})!
              </div>
              <div className="text-[11px] text-rose-300 mt-1 italic flex items-center gap-1.5 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Hệ thống tự động hủy kết quả bài nộp và phát còi cảnh báo. Nhóm phải tự tay thực hành lại bài của mình!</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActivePlagiarismAlert(null)}
            className="p-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-300 transition-colors cursor-pointer shrink-0"
            title="Đóng thông báo cảnh báo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Grid 36 Máy Tính */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5">
          {machineCards.map(({ machineId, submission, isPracticingState }) => {
            const isJustUpdated = recentMachineId === machineId;
            const hasSubmitted = Boolean(submission);
            const isPlagiarized = Boolean(
              submission?.hasPlagiarism ||
              submission?.plagiarismAlert?.isCopied ||
              (activePlagiarismAlert && activePlagiarismAlert.machineNumber === machineId)
            );
            const score = submission?.highestScore ?? null;

            return (
              <div
                key={machineId}
                className={`relative rounded-2xl p-3 border transition-all duration-300 flex flex-col justify-between min-h-[115px] ${
                  isPlagiarized
                    ? 'bg-rose-950/95 border-rose-500 ring-2 ring-rose-500 shadow-2xl animate-pulse text-white'
                    : isJustUpdated
                    ? 'ring-4 ring-cyan-400 scale-105 z-10 bg-cyan-950/90 border-cyan-400 shadow-xl'
                    : hasSubmitted
                    ? score !== null && score >= 9
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/40'
                      : score !== null && score >= 7
                      ? 'bg-blue-950/60 border-blue-500 shadow-lg shadow-blue-950/50 ring-1 ring-blue-500/40'
                      : 'bg-amber-950/60 border-amber-500 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500/40'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                {/* Header card: Số máy & Điểm phát sáng */}
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs font-black uppercase tracking-wider ${isPlagiarized ? 'text-rose-200' : hasSubmitted ? 'text-white font-extrabold' : 'text-slate-400'}`}>
                    {machineId}
                  </span>
                  {isPlagiarized ? (
                    <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-rose-600 text-white shadow-sm flex items-center gap-1 animate-bounce">
                      <AlertTriangle className="w-3 h-3" />
                      0.0đ
                    </span>
                  ) : hasSubmitted && score !== null ? (
                    <span
                      className={`text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg shadow-sm ${
                        score >= 9
                          ? 'bg-emerald-500 text-white'
                          : score >= 7
                          ? 'bg-blue-500 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {score.toFixed(1)}đ
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-500">Chưa nộp</span>
                  )}
                </div>

                {/* Body card: Tên học sinh & Lớp */}
                <div className="my-1 min-w-0">
                  {hasSubmitted && submission ? (
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white truncate" title={submission.studentLeader}>
                        {submission.studentLeader}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between gap-1 mt-0.5">
                        <span className="truncate font-semibold text-slate-300">{submission.className}</span>
                        <span>{submission.attempts?.length || 1} lần nộp</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      <span>{isPracticingState ? 'Đang thực hành...' : 'Đang làm bài...'}</span>
                    </div>
                  )}
                </div>

                {/* Footer card: Thời gian nộp & Nút Lưu bài về máy giáo viên */}
                {isPlagiarized ? (
                  <div className="flex items-center justify-between text-[10px] text-rose-300 pt-1 border-t border-rose-500/40 font-bold">
                    <span className="truncate">
                      🚨 {submission?.plagiarismAlert?.copiedFromClass || activePlagiarismAlert?.copiedFromClass || 'Khác lớp'}
                    </span>
                    <span className="text-rose-400 uppercase text-[9px] font-mono">VI PHẠM</span>
                  </div>
                ) : hasSubmitted && submission ? (
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10 gap-1">
                    <span className="truncate font-mono font-bold text-cyan-300 text-[10px]" title={`Thời gian nộp: ${submission.latestSubmittedAt ? new Date(submission.latestSubmittedAt).toLocaleTimeString('vi-VN') : ''}`}>
                      ⏱️ {submission.latestSubmittedAt ? new Date(submission.latestSubmittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSubmissionFile(submission);
                      }}
                      className="px-2 py-0.5 rounded-md bg-cyan-950 hover:bg-cyan-700 border border-cyan-500/50 text-cyan-200 hover:text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs shrink-0"
                      title={`Lưu sản phẩm của ${machineId} (${submission.studentLeader}) về máy giáo viên`}
                    >
                      <Download className="w-3 h-3 text-cyan-300" />
                      <span>Lưu bài</span>
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL XÁC NHẬN XÓA KẾT QUẢ CŨ */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-700 space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-lg text-white">Xóa Sạch Kết Quả Thực Hành</h4>
                <p className="text-xs text-slate-400">
                  {activeClassFilter === 'Tất cả' ? 'Toàn bộ tất cả các lớp' : `Lớp ${activeClassFilter}`}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Thầy/Cô có chắc chắn muốn xóa sạch toàn bộ các kết quả chấm ảo hoặc bài nộp cũ khỏi màn hình máy chiếu và CSDL phòng máy không?
            </p>

            {!isTeacher && (
              <div className="space-y-1.5 p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                <label className="text-xs font-bold text-amber-300 block">
                  Nhập mã PIN Giáo viên để xác nhận xóa:
                </label>
                <input
                  type="password"
                  maxLength={10}
                  value={teacherPinInput}
                  onChange={(e) => {
                    setTeacherPinInput(e.target.value);
                    setPinErrorMsg(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleExecuteClear();
                  }}
                  placeholder="Mã PIN (Mặc định: 1234)"
                  className="w-full bg-slate-900 border border-slate-600 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none"
                />
                {pinErrorMsg && (
                  <p className="text-xs text-rose-400 font-semibold">{pinErrorMsg}</p>
                )}
              </div>
            )}

            <p className="text-xs text-amber-300/90 bg-amber-950/40 border border-amber-600/30 p-2.5 rounded-xl">
              💡 Thao tác này sẽ đặt lại bảng điểm máy chiếu về trạng thái bắt đầu (0 bài nộp) và đếm lại thời gian 45 phút cho tiết học mới.
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
                onClick={handleExecuteClear}
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
  );
};
