import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  Users,
  Award,
  CheckCircle2,
  Calculator,
  Sparkles,
  GraduationCap,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Assignment, Submission, StudentRecord } from '../types';
import {
  buildClassMultiProductData,
  exportClassMultiProductGradebook,
} from '../utils/excelExport';

interface ClassMultiProductGradebookProps {
  className: string;
  assignments: Assignment[];
  submissions: Submission[];
  roster: StudentRecord[];
  isTeacher?: boolean;
  onRefresh?: () => void;
  onExportExcel?: () => void;
}

export const ClassMultiProductGradebook: React.FC<ClassMultiProductGradebookProps> = ({
  className,
  assignments,
  submissions,
  roster,
  isTeacher = false,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tính toán dữ liệu bảng tổng hợp nhiều sản phẩm
  const data = useMemo(() => {
    return buildClassMultiProductData({
      className,
      assignments,
      submissions,
      roster,
    });
  }, [className, assignments, submissions, roster]);

  const { students, classAssignments, exportTimestamp, classAverageScore, totalStudents, studentsWithSubmissions } = data;

  // Lọc học sinh theo từ khóa tìm kiếm
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const q = searchTerm.trim().toLowerCase();
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.hoVaDem.toLowerCase().includes(q) ||
        s.ten.toLowerCase().includes(q) ||
        String(s.stt).includes(q)
    );
  }, [students, searchTerm]);

  // Xử lý xuất file Excel bảng tổng hợp tại thời điểm hiện tại
  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (onRefresh) await onRefresh();
      exportClassMultiProductGradebook({
        className,
        assignments,
        submissions,
        roster,
      });
      setToastMessage(`Đã xuất Bảng Tổng Hợp SP1, SP2... ĐTB cho Lớp ${className} thành công!`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Lỗi khi xuất bảng tổng hợp:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 text-center flex items-center justify-center gap-2 animate-in fade-in duration-200 shrink-0">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Stats Summary Bar */}
      <div className="p-3 sm:px-6 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs border-b border-indigo-800/60 shrink-0">
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-cyan-300" />
            <span className="text-slate-300">Sĩ số:</span>
            <strong className="text-white font-black">{totalStudents} học sinh</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Đã nộp bài:</span>
            <strong className="text-emerald-300 font-black">
              {studentsWithSubmissions} / {totalStudents} HS
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-300" />
            <span className="text-slate-300">Sản phẩm:</span>
            <strong className="text-amber-300 font-black">
              {classAssignments.length} bài (SP01, SP02...)
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-cyan-300" />
            <span className="text-slate-300">ĐTB cả lớp:</span>
            <strong className="text-cyan-200 font-black">{classAverageScore} / 10đ</strong>
          </div>
        </div>

        <div className="text-[11px] text-cyan-200/90 font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>
            Thời điểm cập nhật: <strong className="text-white font-mono">{exportTimestamp}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Export Action Bar */}
      <div className="p-3 sm:px-6 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh, số thứ tự..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold shrink-0 cursor-pointer"
            >
              Xóa tìm
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isTeacher && (
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Tải về file Excel bảng điểm tổng hợp SP1, SP2... ĐTB của lớp tại đúng thời điểm này"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <FileSpreadsheet className="w-4 h-4 text-white" />}
              <span>Xuất Excel Bảng Tổng Hợp Lớp {className}</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Matrix Table */}
      <div className="flex-1 overflow-auto p-3 sm:p-5">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
            <Users className="w-12 h-12 mx-auto text-blue-400 mb-2" />
            <p className="font-bold text-slate-800 text-sm">
              Chưa có học sinh nào trong danh sách lớp {className}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Hệ thống tự động ghi nhận ngay khi học sinh nộp bài hoặc Thầy/Cô có thể tải lên file danh sách lớp bằng nút &ldquo;Danh Sách Học Sinh&rdquo;.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-10 text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-3 px-3 text-center w-12 border-r border-slate-800">STT</th>
                    <th className="py-3 px-3 min-w-[130px] border-r border-slate-800">Họ và chữ đệm</th>
                    <th className="py-3 px-3 min-w-[80px] border-r border-slate-800 text-cyan-300">Tên</th>
                    <th className="py-3 px-3 min-w-[170px] border-r border-slate-800">Họ và tên đầy đủ</th>
                    {classAssignments.map((a, i) => {
                      const match = a.title.match(/SP\d+/i);
                      const code = match ? match[0].toUpperCase() : `SP${String(i + 1).padStart(2, '0')}`;
                      return (
                        <th
                          key={a.id}
                          className="py-3 px-2 text-center min-w-[75px] border-r border-slate-800 hover:bg-slate-800 transition"
                          title={`${a.title} (${a.gradeLevel})`}
                        >
                          <div className="font-black text-amber-300">{code}</div>
                          <div className="text-[9px] text-slate-400 normal-case font-normal truncate max-w-[70px]">
                            {a.title.replace(/^SP\d+\.\s*/i, '').slice(0, 10)}
                          </div>
                        </th>
                      );
                    })}
                    <th className="py-3 px-2.5 text-center min-w-[75px] border-r border-slate-800">Đã nộp</th>
                    <th className="py-3 px-3 text-center min-w-[95px] border-r border-slate-800 text-emerald-300 font-black">
                      Điểm TB
                    </th>
                    <th className="py-3 px-3 text-center min-w-[95px]">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st, idx) => {
                    return (
                      <tr key={`${st.fullName}_${idx}`} className="hover:bg-blue-50/50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500 border-r border-slate-100">
                          {st.stt}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 border-r border-slate-100 font-medium">
                          {st.hoVaDem}
                        </td>
                        <td className="py-2.5 px-3 font-black text-blue-900 border-r border-slate-100">
                          {st.ten}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 border-r border-slate-100">
                          {st.fullName}
                        </td>
                        {classAssignments.map((a) => {
                          const score = st.scores[a.id];
                          return (
                            <td
                              key={a.id}
                              className="py-2.5 px-2 text-center border-r border-slate-100"
                            >
                              {score !== null && score !== undefined ? (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-lg text-xs font-black border ${
                                    score >= 10
                                      ? 'bg-amber-100 border-amber-300 text-amber-950 ring-1 ring-amber-400/40'
                                      : score >= 8
                                      ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold'
                                      : score >= 6.5
                                      ? 'bg-blue-100 border-blue-300 text-blue-950 font-semibold'
                                      : score >= 5
                                      ? 'bg-yellow-100 border-yellow-300 text-yellow-950'
                                      : 'bg-rose-100 border-rose-300 text-rose-950'
                                  }`}
                                  title={`${st.fullName} - ${a.title}: ${score} điểm (Điểm cao nhất)`}
                                >
                                  {score}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-bold">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-2.5 text-center border-r border-slate-100 text-slate-600 font-semibold">
                          <span className="text-xs">
                            {st.completedCount}/{st.totalProducts}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-slate-100">
                          {st.avgScore !== null ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-black bg-blue-100 text-blue-900 border border-blue-300">
                              {st.avgScore}đ
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              st.classification === 'Xuất sắc'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : st.classification === 'Giỏi'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : st.classification === 'Khá'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : st.classification === 'Đạt'
                                ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                                : st.classification === 'Chưa đạt'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {st.classification}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-700">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-right font-black uppercase text-[11px] text-slate-800 border-r border-slate-200">
                      Điểm Trung Bình Cả Lớp ({className}):
                    </td>
                    {classAssignments.map((a) => {
                      const validScores = filteredStudents
                        .map((st) => st.scores[a.id])
                        .filter((v): v is number => v !== null && v !== undefined);
                      const avg = validScores.length > 0
                        ? (validScores.reduce((sum, v) => sum + v, 0) / validScores.length).toFixed(1)
                        : '-';
                      return (
                        <td key={a.id} className="py-3 px-2 text-center text-xs font-black text-blue-800 border-r border-slate-200">
                          {avg !== '-' ? `${avg}đ` : '-'}
                        </td>
                      );
                    })}
                    <td className="py-3 px-2 text-center text-xs font-bold text-slate-600 border-r border-slate-200">
                      -
                    </td>
                    <td className="py-3 px-3 text-center text-xs font-black text-emerald-800 bg-emerald-50 border-r border-slate-200">
                      {classAverageScore}đ
                    </td>
                    <td className="py-3 px-3 text-center text-[11px] text-slate-500">
                      {studentsWithSubmissions}/{totalStudents} có điểm
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
