import React from 'react';
import { Monitor, Tv, Sparkles, FileSpreadsheet, Users } from 'lucide-react';
import { StitchThumbsUp } from './StitchMascot';
import computerLabBg from '../assets/images/computer_lab_bg_1791628253579.jpg';

interface HeaderProps {
  onOpenProjector: () => void;
  onOpenClassResults: () => void;
  onExportExcel: () => void;
  activeClassName?: string;
  onChangeClassName?: (cls: string) => void;
  totalSubmissions?: number;
  perfectSubmissions?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProjector,
  onOpenClassResults,
  onExportExcel,
  activeClassName,
}) => {
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

          {/* Action Buttons: Xem Kết Quả Lớp & Tải File Kết Quả Excel & Máy Chiếu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Button 1: Xem Bảng Điểm Cả Lớp */}
            <button
              onClick={onOpenClassResults}
              title="Xem bảng điểm và kết quả của các bạn trong lớp đang thực hành"
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/15 hover:bg-white/25 text-white border border-white/25 hover:border-white/40 transition-all shadow-xs backdrop-blur-xs active:scale-95"
            >
              <Users className="w-4 h-4 text-cyan-300" />
              <span>Kết Quả Lớp {activeClassName ? `(${activeClassName})` : ''}</span>
            </button>

            {/* Button 2: Tải File Kết Quả Excel */}
            <button
              onClick={onExportExcel}
              title="Tải về file Excel bảng điểm chi tiết (theo thứ tự Máy 01, Máy 02... & tách cột Tên riêng để sắp xếp ABC)"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-900/20 border border-emerald-400/40 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Tải File Excel</span>
            </button>

            {/* Button 3: Màn Hình Máy Chiếu */}
            <button
              onClick={onOpenProjector}
              title="Bật màn hình máy chiếu phòng thực hành"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-blue-100 border border-white/20 transition-all shadow-xs backdrop-blur-xs active:scale-95"
            >
              <Tv className="w-4 h-4 text-cyan-300" />
              <span className="hidden md:inline">Máy Chiếu</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
