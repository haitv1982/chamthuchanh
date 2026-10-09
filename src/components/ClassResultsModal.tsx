import React, { useState } from 'react';
import {
  X,
  Trophy,
  Award,
  Search,
  FileSpreadsheet,
  Users,
  Sparkles,
} from 'lucide-react';
import { Submission } from '../types';
import {
  formatMachineNumber,
  getMachineSortNumber,
  splitVietnameseName,
} from '../utils/excelExport';

interface ClassResultsModalProps {
  className: string;
  submissions: Submission[];
  onClose: () => void;
  onExportExcel: () => void;
}

export const ClassResultsModal: React.FC<ClassResultsModalProps> = ({
  className,
  submissions,
  onClose,
  onExportExcel,
}) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'machine' | 'name' | 'score'>('machine');

  // Filter submissions by current class
  const classList = submissions.filter((s) => s.className === className);
  const filtered = classList.filter((s) => {
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

  const total = classList.length;
  const perfectCount = classList.filter((s) => s.highestScore >= 10).length;
  const avgScore = total > 0
    ? (classList.reduce((sum, s) => sum + s.highestScore, 0) / total).toFixed(1)
    : '0';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-cyan-300">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Bảng Kết Quả Thực Hành Các Bạn Trong Lớp
                </h2>
                <span className="bg-blue-500/30 text-cyan-300 border border-cyan-400/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Lớp {className}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Theo dõi kết quả thực hành trực tiếp • Học hỏi lẫn nhau • Tải file Excel theo thứ tự Máy & Cột Tên ABC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              title="Xuất file Excel gồm tất cả thành viên, theo thứ tự Máy 01, Máy 02... và tách cột Tên riêng để sắp xếp ABC"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Tải File Excel Cả Lớp</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats & Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
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

            <div className="relative min-w-[200px]">
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
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-sm">Chưa có kết quả nộp bài nào của lớp {className}</p>
              <p className="text-xs">Các bạn trong lớp đang thực hành, kết quả sẽ tự động hiện lên khi có bạn nộp bài!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sorted.map((sub, index) => {
                const isTen = sub.highestScore >= 10;
                const isGood = sub.highestScore >= 8;
                const formattedMachine = formatMachineNumber(sub.machineNumber);
                const leaderParsed = splitVietnameseName(sub.studentLeader);

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
                            <span className="text-slate-500 font-medium">Các bạn cùng nhóm: </span>
                            <span className="font-semibold text-slate-800">
                              {sub.groupMembers.join(', ')}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Thực hành cá nhân</p>
                        )}

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                          <span>Nộp: {sub.attempts.length} lần</span>
                          <span>•</span>
                          <span>
                            {new Date(sub.latestSubmittedAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
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
              File Excel xuất đầy đủ tất cả học sinh theo thứ tự <strong>Máy 01, Máy 02...</strong> và có <strong>cột Tên riêng</strong> để thầy cô dễ dàng sắp xếp theo ABC!
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors"
          >
            Đóng Lại
          </button>
        </div>
      </div>
    </div>
  );
};
