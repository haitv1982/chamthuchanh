import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  Users,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Submission, Assignment } from '../types';
import { SCHOOL_CLASSES } from '../data/classes';
import { apiFetch } from '../utils/apiConfig';

interface ProjectorLiveBoardProps {
  className: string;
  assignment: Assignment;
  submissions: Submission[];
  onClose: () => void;
  onRefresh?: () => void;
  allowSubmission?: boolean;
}

export const ProjectorLiveBoard: React.FC<ProjectorLiveBoardProps> = ({
  className,
  assignment,
  submissions,
  onClose,
  onRefresh,
  allowSubmission = true,
}) => {
  // Timer state (45 minutes standard class duration)
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeClassFilter, setActiveClassFilter] = useState<string>(className || 'Tất cả');

  // Real-time live submissions synchronized across all lab PCs
  const [liveSubmissions, setLiveSubmissions] = useState<Submission[]>(submissions);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() =>
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [recentMachineId, setRecentMachineId] = useState<string | null>(null);

  // Sync when prop submissions updates
  useEffect(() => {
    if (submissions && submissions.length > 0) {
      setLiveSubmissions((prev) => {
        const map = new Map<string, Submission>();
        prev.forEach((s) => map.set(s.id, s));
        submissions.forEach((s) => map.set(s.id, s));
        return Array.from(map.values());
      });
    }
  }, [submissions]);

  // Active continuous live polling every 2.5 seconds to capture any student submission from any PC
  useEffect(() => {
    let isMounted = true;
    const fetchLabUpdates = async () => {
      try {
        const res = await apiFetch('/api/submissions');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.submissions)) {
            setLiveSubmissions((prev) => {
              // Phát hiện máy vừa mới nộp bài hoặc cập nhật điểm số
              const newlyUpdated = data.submissions.find((s: Submission) => {
                const existing = prev.find((p) => p.id === s.id);
                return !existing || (s.latestSubmittedAt && existing.latestSubmittedAt !== s.latestSubmittedAt);
              });

              if (newlyUpdated) {
                setRecentMachineId(newlyUpdated.machineNumber);
                setTimeout(() => {
                  if (isMounted) setRecentMachineId(null);
                }, 8000);
              }

              const map = new Map<string, Submission>();
              prev.forEach((s) => map.set(s.id, s));
              data.submissions.forEach((s: Submission) => map.set(s.id, s));
              return Array.from(map.values());
            });

            setLastSyncTime(
              new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            );
          }
        }
      } catch {
        // Offline resilience
      }
    };

    // Immediate initial sync
    fetchLabUpdates();

    // 2.5s interval
    const interval = setInterval(fetchLabUpdates, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Cập nhật khi prop className thay đổi
  useEffect(() => {
    if (className) {
      setActiveClassFilter(className);
    }
  }, [className]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
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

  // Filter submissions by class (hoặc tất cả các lớp) từ liveSubmissions đồng bộ
  const classSubmissions = activeClassFilter === 'Tất cả'
    ? liveSubmissions
    : liveSubmissions.filter((s) => s.className === activeClassFilter);

  // Group into machine lookup map: Lấy submission có điểm cao nhất của từng số máy
  const submissionByMachine = new Map<string, Submission>();
  const duplicateMachineMap = new Map<string, Submission[]>();

  classSubmissions.forEach((s) => {
    // Thu thập danh sách để phát hiện nếu nhiều nhóm cùng máy
    const list = duplicateMachineMap.get(s.machineNumber) || [];
    list.push(s);
    duplicateMachineMap.set(s.machineNumber, list);

    const existing = submissionByMachine.get(s.machineNumber);
    if (!existing || s.highestScore > existing.highestScore) {
      submissionByMachine.set(s.machineNumber, s);
    }
  });

  // Top achievers
  const perfectAchievers = classSubmissions.filter((s) => s.highestScore >= 10);
  const totalSubmitted = submissionByMachine.size;
  const avgScore = totalSubmitted > 0
    ? (Array.from(submissionByMachine.values()).reduce((sum, s) => sum + s.highestScore, 0) / totalSubmitted).toFixed(1)
    : '0';

  // Generate 36 standard computer lab machines
  const totalMachinesCount = 36;
  const machineCards = Array.from({ length: totalMachinesCount }, (_, i) => {
    const machineId = `Máy ${String(i + 1).padStart(2, '0')}`;
    const sub = submissionByMachine.get(machineId);
    const allSubs = duplicateMachineMap.get(machineId) || [];
    return {
      machineId,
      submission: sub,
      hasMultipleGroups: allSubs.length > 1,
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden select-none animate-in fade-in duration-200">
      {/* Top Bar for Projector */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Left: Lab Info & Class selector */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                BẢNG TRÌNH CHIẾU PHÒNG THỰC HÀNH TIN HỌC
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-semibold">Lớp:</span>
                <select
                  value={activeClassFilter}
                  onChange={(e) => setActiveClassFilter(e.target.value)}
                  className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-md font-extrabold uppercase border border-blue-400 focus:outline-none cursor-pointer"
                >
                  <option value="Tất cả">Tất cả các lớp</option>
                  {SCHOOL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      Lớp {cls}
                    </option>
                  ))}
                </select>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                allowSubmission
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {allowSubmission ? '● Đang mở nộp bài' : '🔒 Đang khóa nộp bài'}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                <span>Trực tiếp kết nối ({lastSyncTime})</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {assignment.title} • {totalSubmitted}/36 máy đã nộp • Điểm TB: {avgScore}đ • Tự động nhận bài nộp tức thì từ mọi máy
            </p>
          </div>
        </div>

        {/* Center: Countdown Timer */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-800/90 border border-slate-700 px-5 py-2 rounded-2xl shadow-inner">
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${timeLeft <= 300 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'}`} />
            <span className="font-mono text-2xl font-black text-white">{timeFormatted}</span>
          </div>
          <div className="flex items-center gap-1 border-l border-slate-700 pl-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
              title={isRunning ? 'Tạm dừng' : 'Tiếp tục'}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setTimeLeft(45 * 60)}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
              title="Đặt lại 45 phút"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Cập nhật kết quả mới nhất từ phòng máy"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Cập nhật</span>
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors"
            title="Đóng trình chiếu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Hall of Fame: Điểm 10 Tuyệt Đối */}
        {perfectAchievers.length > 0 && (
          <div className="bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-slate-900 border border-amber-600/40 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-amber-400 animate-bounce" />
              <h2 className="text-sm font-extrabold text-amber-300 uppercase tracking-wider">
                Bảng Vàng Xuất Sắc 10/10 ({perfectAchievers.length} Nhóm Đạt Điểm Tối Đa)
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {perfectAchievers.map((p) => (
                <div
                  key={p.id}
                  className="bg-amber-500/10 border border-amber-400/50 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-md"
                >
                  <span className="bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded">
                    {p.machineNumber}
                  </span>
                  <div>
                    <div className="font-bold text-xs text-amber-100">{p.studentLeader}</div>
                    <div className="text-[10px] text-amber-400/80">
                      {p.groupMembers.length > 0 ? `+ ${p.groupMembers.join(', ')}` : 'Cá nhân'} •{' '}
                      {p.attempts.length} lần nộp
                    </div>
                  </div>
                  <span className="text-base font-black text-amber-400 ml-1">10.0</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 36 Machine Grid in Computer Lab */}
        <div>
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-semibold uppercase tracking-wider flex-wrap gap-2">
            <span>Sơ Đồ Kết Nối 36 Máy Phòng Thực Hành ({totalSubmitted}/36 Máy Đã Nộp)</span>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-500" /> Điểm 10 Tuyệt Đối
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" /> 8.0 - 9.5
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-500" /> 5.0 - 7.5
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700" /> Đang làm bài
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {machineCards.map(({ machineId, submission, hasMultipleGroups }) => {
              const hasSub = Boolean(submission);
              const score = submission?.highestScore || 0;
              const isTen = score >= 10;
              const isHigh = score >= 8;
              const isPass = score >= 5;
              const isJustSubmitted = recentMachineId === machineId;

              return (
                <div
                  key={machineId}
                  className={`rounded-xl p-3 border transition-all flex flex-col justify-between min-h-[96px] ${
                    isJustSubmitted
                      ? 'ring-2 ring-cyan-400 bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-500/30 scale-105 duration-300'
                      : isTen
                      ? 'bg-amber-950/40 border-amber-500/70 shadow-md shadow-amber-500/10'
                      : isHigh
                      ? 'bg-emerald-950/40 border-emerald-500/60'
                      : isPass
                      ? 'bg-blue-950/30 border-blue-500/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  {/* Machine Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-300">{machineId}</span>
                      {isJustSubmitted && (
                        <span className="text-[9px] bg-cyan-400 text-slate-950 font-black px-1 rounded animate-pulse">
                          MỚI NỘP
                        </span>
                      )}
                    </div>
                    {hasSub ? (
                      <span
                        className={`text-sm font-black ${
                          isTen
                            ? 'text-amber-400'
                            : isHigh
                            ? 'text-emerald-400'
                            : isPass
                            ? 'text-blue-400'
                            : 'text-orange-400'
                        }`}
                      >
                        {score}đ
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600">--</span>
                    )}
                  </div>

                  {/* Student Name */}
                  <div className="my-1">
                    {hasSub ? (
                      <div>
                        <p className="text-xs font-bold text-white truncate" title={submission?.studentLeader}>
                          {submission?.studentLeader}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {submission?.groupMembers.length
                            ? `+ ${submission?.groupMembers.join(', ')}`
                            : 'Làm 1 mình'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-600 italic">Đang thao tác...</p>
                    )}
                  </div>

                  {/* Footer status / attempts */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-1">
                    {hasSub ? (
                      <>
                        <span>Nộp {submission?.attempts.length} lần</span>
                        {hasMultipleGroups && (
                          <span className="text-amber-400 font-bold" title="Có 2 nhóm cùng nộp trên máy này">
                            • Trùng máy
                          </span>
                        )}
                        {isTen && <Award className="w-3 h-3 text-amber-400" />}
                      </>
                    ) : (
                      <span>Chờ nộp</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
