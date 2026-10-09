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
} from 'lucide-react';
import { Submission, Assignment } from '../types';

interface ProjectorLiveBoardProps {
  className: string;
  assignment: Assignment;
  submissions: Submission[];
  onClose: () => void;
}

export const ProjectorLiveBoard: React.FC<ProjectorLiveBoardProps> = ({
  className,
  assignment,
  submissions,
  onClose,
}) => {
  // Timer state (45 minutes standard class duration)
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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

  // Filter submissions by class
  const classSubmissions = className === 'Tất cả'
    ? submissions
    : submissions.filter((s) => s.className === className);

  // Group into machine lookup map
  const submissionByMachine = new Map<string, Submission>();
  classSubmissions.forEach((s) => {
    submissionByMachine.set(s.machineNumber, s);
  });

  // Top 10 achievers
  const perfectAchievers = classSubmissions.filter((s) => s.highestScore >= 10);

  // Generate 36 standard computer lab machines
  const totalMachinesCount = 36;
  const machineCards = Array.from({ length: totalMachinesCount }, (_, i) => {
    const machineId = `Máy ${String(i + 1).padStart(2, '0')}`;
    const sub = submissionByMachine.get(machineId);
    return {
      machineId,
      submission: sub,
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden select-none">
      {/* Top Bar for Projector */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-xl">
        {/* Left: Lab Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                BẢNG THEO DÕI PHÒNG MÁY TIN HỌC
              </span>
              <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-md font-extrabold uppercase">
                Lớp {className}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {assignment.title} • Thang điểm 10 • Tự động cập nhật
            </p>
          </div>
        </div>

        {/* Center: Countdown Timer */}
        <div className="hidden md:flex items-center gap-4 bg-slate-800/90 border border-slate-700 px-5 py-2 rounded-2xl shadow-inner">
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
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Sơ Đồ 36 Máy Phòng Thực Hành</span>
            <div className="flex items-center gap-4">
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
            {machineCards.map(({ machineId, submission }) => {
              const hasSub = Boolean(submission);
              const score = submission?.highestScore || 0;
              const isTen = score >= 10;
              const isHigh = score >= 8;
              const isPass = score >= 5;

              return (
                <div
                  key={machineId}
                  className={`rounded-xl p-3 border transition-all flex flex-col justify-between min-h-[92px] ${
                    isTen
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
                    <span className="font-extrabold text-xs text-slate-300">{machineId}</span>
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
                        <p className="text-xs font-bold text-white truncate">
                          {submission?.studentLeader}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {submission?.groupMembers.length
                            ? `+ ${submission?.groupMembers[0]}`
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
