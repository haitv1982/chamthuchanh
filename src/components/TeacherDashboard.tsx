import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Tv,
  Search,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  Edit3,
  Download,
  Filter,
  BarChart3,
  Layers,
  Sparkles,
  ExternalLink,
  Save,
  X,
} from 'lucide-react';
import { Assignment, Submission, SubmissionAttempt } from '../types';
import { SCHOOL_CLASSES } from '../data/classes';
import { exportSubmissionsToExcel } from '../utils/excelExport';

interface TeacherDashboardProps {
  assignments: Assignment[];
  activeAssignmentId: string;
  onSelectAssignment: (id: string) => void;
  submissions: Submission[];
  onOpenProjector: () => void;
  onOpenCreateAssignment: () => void;
  onUpdateSubmission: (submission: Submission) => void;
  onClearSubmissions: (className?: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  assignments,
  activeAssignmentId,
  onSelectAssignment,
  submissions,
  onOpenProjector,
  onOpenCreateAssignment,
  onUpdateSubmission,
  onClearSubmissions,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('8A2');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null);
  const [teacherNoteInput, setTeacherNoteInput] = useState<string>('');
  const [overrideScoreInput, setOverrideScoreInput] = useState<string>('');
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Exact 13 classes requested by teacher + 'Tất cả'
  const availableClasses = ['Tất cả', ...SCHOOL_CLASSES];

  // Active assignment
  const activeAssignment = assignments.find((a) => a.id === activeAssignmentId) || assignments[0];

  // Filter submissions
  const filteredSubmissions = submissions.filter((s) => {
    const matchClass = selectedClass === 'Tất cả' || s.className === selectedClass;
    const matchSearch =
      s.studentLeader.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.groupMembers.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.machineNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });

  // Calculate statistics for currently filtered class
  const classSubmissions = selectedClass === 'Tất cả'
    ? submissions
    : submissions.filter((s) => s.className === selectedClass);

  const totalSubmitted = classSubmissions.length;
  const perfectCount = classSubmissions.filter((s) => s.highestScore >= 10).length;
  const excellentCount = classSubmissions.filter((s) => s.highestScore >= 9 && s.highestScore < 10).length;
  const goodCount = classSubmissions.filter((s) => s.highestScore >= 7 && s.highestScore < 9).length;
  const averageCount = classSubmissions.filter((s) => s.highestScore >= 5 && s.highestScore < 7).length;
  const poorCount = classSubmissions.filter((s) => s.highestScore < 5).length;

  const avgScore = totalSubmitted > 0
    ? (classSubmissions.reduce((sum, s) => sum + s.highestScore, 0) / totalSubmitted).toFixed(1)
    : '0';

  // Handle Export to Excel
  const handleExportExcel = () => {
    try {
      exportSubmissionsToExcel({
        className: selectedClass,
        assignment: activeAssignment,
        submissions: classSubmissions,
        teacherName: 'Giáo viên Tin học',
        schoolName: 'Phòng Máy Thực Hành Tin Học',
      });
      setExportSuccessMsg(`Đã xuất thành công file Excel cho lớp ${selectedClass}!`);
      setTimeout(() => setExportSuccessMsg(null), 4000);
    } catch (err: any) {
      alert('Không thể xuất file: ' + (err.message || 'Lỗi không xác định'));
    }
  };

  // Open detail view modal
  const handleOpenDetail = (sub: Submission) => {
    setViewingSubmission(sub);
    const latestAttempt = sub.attempts[sub.attempts.length - 1];
    setTeacherNoteInput(latestAttempt?.teacherNote || '');
    setOverrideScoreInput(String(sub.highestScore));
  };

  // Save teacher edit / note
  const handleSaveTeacherEdit = () => {
    if (!viewingSubmission) return;

    const newScore = parseFloat(overrideScoreInput);
    const validScore = !isNaN(newScore) ? Math.min(10, Math.max(0, newScore)) : viewingSubmission.highestScore;

    const updatedAttempts = [...viewingSubmission.attempts];
    const latestIdx = updatedAttempts.length - 1;
    if (latestIdx >= 0) {
      updatedAttempts[latestIdx] = {
        ...updatedAttempts[latestIdx],
        teacherNote: teacherNoteInput.trim(),
      };
    }

    const updatedSubmission: Submission = {
      ...viewingSubmission,
      highestScore: validScore,
      latestScore: validScore,
      status: validScore >= 10 ? 'perfect' : validScore >= 7 ? 'graded' : 'needs_improvement',
      attempts: updatedAttempts,
    };

    onUpdateSubmission(updatedSubmission);
    setViewingSubmission(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">Bảng Điều Khiển Giáo Viên</h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Quản lý Phòng Máy
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi học sinh nộp bài theo thời gian thực, xem lịch sử sửa bài và xuất báo cáo điểm số
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            title="Xuất file Excel đầy đủ từng học sinh trong lớp (cả trưởng nhóm và tất cả các bạn thành viên)"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel (Tất Cả Học Sinh)</span>
          </button>

          {/* Projector Board Button */}
          <button
            onClick={onOpenProjector}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs sm:text-sm font-semibold transition-all"
          >
            <Tv className="w-4 h-4" />
            <span>Màn Hình Máy Chiếu</span>
          </button>

          {/* Create Assignment Button */}
          <button
            onClick={onOpenCreateAssignment}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs sm:text-sm font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Bài Mới</span>
          </button>
        </div>
      </div>

      {exportSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{exportSuccessMsg}</span>
          </div>
          <button onClick={() => setExportSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Class Statistics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Số bài đã nộp */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Đã Nộp Bài</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{totalSubmitted}</span>
            <span className="text-xs text-slate-400">nhóm / máy</span>
          </div>
        </div>

        {/* Card 2: Điểm trung bình */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Điểm Trung Bình</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600">{avgScore}</span>
            <span className="text-xs text-slate-400">/ 10.0</span>
          </div>
        </div>

        {/* Card 3: Đạt 10/10 tối đa */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Đạt 10 Tuyệt Đối</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{perfectCount}</span>
            <span className="text-xs text-amber-700/80">
              ({totalSubmitted > 0 ? Math.round((perfectCount / totalSubmitted) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Card 4: Xếp loại Giỏi & Khá */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Giỏi & Khá (≥7đ)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">
              {perfectCount + excellentCount + goodCount}
            </span>
            <span className="text-xs text-slate-400">học sinh</span>
          </div>
        </div>

        {/* Card 5: Cần hỗ trợ */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1 col-span-2 lg:col-span-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>Cần Hoàn Thiện</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-orange-600">{averageCount + poorCount}</span>
            <span className="text-xs text-slate-400">nhóm (&lt;7đ)</span>
          </div>
        </div>
      </div>

      {/* Filter & Submissions Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Lọc theo Lớp:
            </span>
            <div className="flex flex-wrap gap-1">
              {availableClasses.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedClass === cls
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cls === 'Tất cả' ? 'Tất cả lớp' : cls}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc số máy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
            >
            </input>
          </div>
        </div>

        {/* Submissions List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5">Vị trí máy</th>
                <th className="py-3 px-3.5">Trưởng nhóm / Người nộp</th>
                <th className="py-3 px-3.5">Thành viên cùng nhóm</th>
                <th className="py-3 px-3.5 text-center">Lớp</th>
                <th className="py-3 px-3.5 text-center">Tiến trình nộp bài</th>
                <th className="py-3 px-3.5 text-center">Điểm cao nhất</th>
                <th className="py-3 px-3.5 text-center">Xếp loại</th>
                <th className="py-3 px-3.5 text-center">Lần nộp cuối</th>
                <th className="py-3 px-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">Chưa có bài nộp nào cho tiêu chí này</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Học sinh tại phòng máy có thể vào trang nộp bài để bắt đầu!
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const latestAttempt = sub.attempts[sub.attempts.length - 1];
                  const isTen = sub.highestScore >= 10;
                  const isGood = sub.highestScore >= 7;

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => handleOpenDetail(sub)}
                    >
                      {/* Vị trí máy */}
                      <td className="py-3.5 px-3.5 font-bold text-slate-800">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700">
                          {sub.machineNumber}
                        </span>
                      </td>

                      {/* Trưởng nhóm */}
                      <td className="py-3.5 px-3.5 font-semibold text-slate-900">
                        {sub.studentLeader}
                      </td>

                      {/* Thành viên */}
                      <td className="py-3.5 px-3.5 text-slate-600">
                        {sub.groupMembers.length > 0 ? (
                          <span>{sub.groupMembers.join(', ')}</span>
                        ) : (
                          <span className="text-slate-400 italic">Cá nhân</span>
                        )}
                      </td>

                      {/* Lớp */}
                      <td className="py-3.5 px-3.5 text-center font-bold text-slate-700">
                        {sub.className}
                      </td>

                      {/* Tiến trình nộp bài (lần 1 -> lần 2 -> lần 3...) */}
                      <td className="py-3.5 px-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {sub.attempts.map((att, idx) => (
                            <React.Fragment key={att.attemptNumber}>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                  att.score >= 10
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                L{att.attemptNumber}: {att.score}
                              </span>
                              {idx < sub.attempts.length - 1 && (
                                <span className="text-slate-300">→</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </td>

                      {/* Điểm cao nhất */}
                      <td className="py-3.5 px-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black shadow-2xs ${
                            isTen
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isGood
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-orange-100 text-orange-900 border border-orange-300'
                          }`}
                        >
                          {isTen && <Award className="w-3.5 h-3.5 text-amber-600" />}
                          {sub.highestScore}
                        </span>
                      </td>

                      {/* Xếp loại */}
                      <td className="py-3.5 px-3.5 text-center font-semibold">
                        {isTen ? (
                          <span className="text-amber-600">Giỏi (10/10)</span>
                        ) : sub.highestScore >= 9 ? (
                          <span className="text-emerald-600">Giỏi</span>
                        ) : sub.highestScore >= 7 ? (
                          <span className="text-blue-600">Khá</span>
                        ) : (
                          <span className="text-orange-600">Cần cố gắng</span>
                        )}
                      </td>

                      {/* Giờ nộp */}
                      <td className="py-3.5 px-3.5 text-center text-slate-500 font-mono text-[11px]">
                        {new Date(sub.latestSubmittedAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenDetail(sub)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer toolbar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Hiển thị <strong className="text-slate-800">{filteredSubmissions.length}</strong> bài nộp
            trong tiết học
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Thầy/Cô có chắc chắn muốn làm mới toàn bộ danh sách bài nộp của lớp này?')) {
                  onClearSubmissions(selectedClass === 'Tất cả' ? undefined : selectedClass);
                }
              }}
              className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa dữ liệu lớp này</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Xem chi tiết bài nộp & Lịch sử sửa bài */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-slate-800">
                    Chi Tiết Bài Nộp - {viewingSubmission.machineNumber}
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold">
                    Lớp {viewingSubmission.className}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Học sinh: <strong className="text-slate-800">{viewingSubmission.studentLeader}</strong>
                  {viewingSubmission.groupMembers.length > 0 &&
                    ` • Thành viên: ${viewingSubmission.groupMembers.join(', ')}`}
                </p>
              </div>
              <button
                onClick={() => setViewingSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Score summary & Teacher override */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase">Điểm hiện tại</div>
                  <div className="text-3xl font-black text-blue-600">
                    {viewingSubmission.highestScore} / 10
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-700">
                    Giáo viên điều chỉnh điểm:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={overrideScoreInput}
                    onChange={(e) => setOverrideScoreInput(e.target.value)}
                    className="w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Submission Attempts Tab / History */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Lịch Sử Các Lần Nộp ({viewingSubmission.attempts.length} lần)
                </h3>

                <div className="space-y-4">
                  {viewingSubmission.attempts.map((att) => (
                    <div
                      key={att.attemptNumber}
                      className="p-4 border border-slate-200 rounded-xl space-y-3 bg-white"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            Lần nộp {att.attemptNumber}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {att.fileName} ({att.fileSize} B)
                          </span>
                        </div>
                        <span
                          className={`font-black text-sm px-2.5 py-0.5 rounded-full ${
                            att.score >= 10
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {att.score} / 10đ
                        </span>
                      </div>

                      {/* AI comparison report if present */}
                      {att.aiComparisonDetails && (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                          <span className="font-bold text-blue-700">Đối chiếu AI: </span>
                          <span>{att.aiComparisonDetails}</span>
                        </div>
                      )}

                      {/* Criteria results */}
                      {att.criteriaResults && att.criteriaResults.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {att.criteriaResults.map((c) => (
                            <div key={c.criterionId} className="p-2 bg-slate-50 rounded-lg">
                              <div className="font-semibold text-slate-800 flex justify-between">
                                <span>{c.criterionName}</span>
                                <span className="text-blue-600 font-bold">
                                  {c.score}/{c.maxScore}đ
                                </span>
                              </div>
                              {c.feedback && (
                                <p className="text-[11px] text-slate-500 mt-0.5">{c.feedback}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Code preview if present */}
                      {att.fileContent && !att.fileContent.startsWith('[') && (
                        <div>
                          <div className="text-[11px] font-bold text-slate-500 mb-1">
                            Nội dung mã nguồn / tệp:
                          </div>
                          <pre className="bg-slate-900 text-cyan-300 p-3 rounded-lg text-[11px] font-mono max-h-40 overflow-y-auto whitespace-pre-wrap">
                            {att.fileContent}
                          </pre>
                        </div>
                      )}

                      {/* Suggestions on how to get 10 */}
                      {att.howToGetTen && att.howToGetTen.length > 0 && att.score < 10 && (
                        <div className="p-2.5 bg-amber-50 rounded-lg text-xs text-amber-900">
                          <span className="font-bold">Gợi ý nâng lên 10đ: </span>
                          <span>{att.howToGetTen.join('; ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher Note Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Ghi chú riêng của Giáo viên gửi cho nhóm:
                </label>
                <textarea
                  rows={3}
                  value={teacherNoteInput}
                  onChange={(e) => setTeacherNoteInput(e.target.value)}
                  placeholder="Ví dụ: Thầy đã xem lại đoạn code xử lý số nguyên tố, các em tiếp thu rất nhanh. Cộng thêm 0.5đ khuyến khích sáng tạo!"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 sticky bottom-0">
              <button
                type="button"
                onClick={() => setViewingSubmission(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveTeacherEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Thay Đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
