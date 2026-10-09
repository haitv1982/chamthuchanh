import React from 'react';
import { Monitor, Tv, Sparkles, FileSpreadsheet, Users } from 'lucide-react';
import { SCHOOL_CLASSES } from '../data/classes';

interface HeaderProps {
  onOpenProjector: () => void;
  onOpenClassResults: () => void;
  onExportExcel: () => void;
  activeClassName: string;
  onChangeClassName: (cls: string) => void;
  totalSubmissions: number;
  perfectSubmissions: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProjector,
  onOpenClassResults,
  onExportExcel,
  activeClassName,
  onChangeClassName,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white">
                  LabGrade <span className="text-cyan-400">AI</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Phòng Thực Hành Tin Học
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Hệ thống nộp bài & chấm điểm trực tuyến • Tối ưu 10 điểm • Báo cáo Excel
              </p>
            </div>
          </div>

          {/* Lớp Đang Thực Hành Dropdown Selector (Chính xác cho lớp đang học) */}
          <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs shadow-xs">
            <span className="text-slate-300 font-medium whitespace-nowrap hidden sm:inline">
              Lớp đang thực hành:
            </span>
            <select
              value={activeClassName}
              onChange={(e) => onChangeClassName(e.target.value)}
              aria-label="Chọn lớp đang thực hành"
              className="bg-slate-900 text-cyan-300 font-bold border border-cyan-500/40 hover:border-cyan-400 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-cyan-400 focus:outline-hidden cursor-pointer"
            >
              {SCHOOL_CLASSES.map((cls) => (
                <option key={cls} value={cls} className="bg-slate-900 text-white font-medium">
                  Lớp {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons: Tải File Kết Quả & Xem Kết Quả Lớp */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Button 1: Xem Kết Quả Các Bạn Trong Lớp */}
            <button
              onClick={onOpenClassResults}
              title="Xem bảng điểm và kết quả của các bạn trong lớp đang thực hành"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/50 hover:border-blue-500 transition-all shadow-xs"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Kết Quả Lớp</span>
            </button>

            {/* Button 2: Tải File Kết Quả Excel */}
            <button
              onClick={onExportExcel}
              title="Tải về file Excel bảng điểm chi tiết (theo thứ tự Máy 01, Máy 02... & tách cột Tên riêng để sắp xếp ABC)"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Tải File Kết Quả Excel</span>
            </button>

            {/* Button 3: Máy Chiếu */}
            <button
              onClick={onOpenProjector}
              title="Bật màn hình máy chiếu phòng thực hành"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all shadow-xs"
            >
              <Tv className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Máy Chiếu</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
