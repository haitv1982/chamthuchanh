import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Users,
  Search,
  Sparkles,
  RefreshCw,
  Info,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { StudentRecord } from '../types';
import { parseStudentExcel } from '../utils/excelRosterParser';

interface StudentRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: StudentRecord[];
  onSaveRoster: (students: StudentRecord[], mode: 'replace' | 'upsert') => Promise<{ success: boolean; total: number; classes: string[] }>;
  onDeleteRoster: (className?: string) => Promise<boolean>;
}

export const StudentRosterModal: React.FC<StudentRosterModalProps> = ({
  isOpen,
  onClose,
  roster,
  onSaveRoster,
  onDeleteRoster,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<StudentRecord[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'view'>(roster.length > 0 ? 'view' : 'upload');
  const [viewClassFilter, setViewClassFilter] = useState<string>('all');
  const [viewSearchTerm, setViewSearchTerm] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Danh sách các lớp hiện có trong danh sách
  const existingClasses = Array.from(new Set(roster.map((s) => s.className))).sort();

  // Thống kê số lượng học sinh theo lớp
  const classCounts: Record<string, number> = {};
  roster.forEach((s) => {
    classCounts[s.className] = (classCounts[s.className] || 0) + 1;
  });

  // Tải tệp Excel mẫu 3 cột chuẩn
  const handleDownloadSampleExcel = () => {
    try {
      const sampleData = [
        { TT: 1, 'Họ và tên': 'Nguyễn Văn An', Lớp: '8A1' },
        { TT: 2, 'Họ và tên': 'Trần Thị Bình', Lớp: '8A1' },
        { TT: 3, 'Họ và tên': 'Lê Hoàng Cường', Lớp: '8A1' },
        { TT: 4, 'Họ và tên': 'Phạm Thu Dung', Lớp: '8A1' },
        { TT: 1, 'Họ và tên': 'Phạm Đức Dũng', Lớp: '8A2' },
        { TT: 2, 'Họ và tên': 'Hoàng Thu Giang', Lớp: '8A2' },
        { TT: 3, 'Họ và tên': 'Ngô Văn Hùng', Lớp: '8A2' },
        { TT: 1, 'Họ và tên': 'Vũ Minh Hải', Lớp: '9A1' },
        { TT: 2, 'Họ và tên': 'Đỗ Phương Linh', Lớp: '9A1' },
        { TT: 3, 'Họ và tên': 'Bùi Quốc Tuấn', Lớp: '9A1' },
      ];

      const ws = XLSX.utils.json_to_sheet(sampleData, {
        header: ['TT', 'Họ và tên', 'Lớp'],
      });

      // Độ rộng các cột
      ws['!cols'] = [{ wch: 8 }, { wch: 28 }, { wch: 12 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'DanhSachHocSinh');

      XLSX.writeFile(wb, 'Mau_Danh_Sach_Hoc_Sinh_3_Cot.xlsx');
    } catch (err: any) {
      alert('Không thể tạo tệp mẫu: ' + err.message);
    }
  };

  // Nạp danh sách mẫu có sẵn để thử nghiệm nhanh
  const handleLoadDemoRoster = async () => {
    const demoData: StudentRecord[] = [
      { stt: 1, fullName: 'Nguyễn Văn An', className: '8A1' },
      { stt: 2, fullName: 'Trần Thị Bình', className: '8A1' },
      { stt: 3, fullName: 'Lê Hoàng Cường', className: '8A1' },
      { stt: 4, fullName: 'Phạm Thu Dung', className: '8A1' },
      { stt: 5, fullName: 'Đinh Tiến Đạt', className: '8A1' },
      { stt: 1, fullName: 'Phạm Đức Dũng', className: '8A2' },
      { stt: 2, fullName: 'Hoàng Thu Giang', className: '8A2' },
      { stt: 3, fullName: 'Ngô Văn Hùng', className: '8A2' },
      { stt: 4, fullName: 'Mai Thanh Hương', className: '8A2' },
      { stt: 5, fullName: 'Đỗ Quốc Khánh', className: '8A2' },
      { stt: 1, fullName: 'Vũ Minh Hải', className: '9A1' },
      { stt: 2, fullName: 'Đỗ Phương Linh', className: '9A1' },
      { stt: 3, fullName: 'Bùi Quốc Tuấn', className: '9A1' },
    ];

    setIsSaving(true);
    setParseError(null);
    try {
      const res = await onSaveRoster(demoData, 'replace');
      setParseSuccessMsg(`Đã nạp ${res.total} học sinh mẫu (8A1, 8A2, 9A1) vào CSDL hệ thống thành công!`);
      setActiveTab('view');
    } catch (err: any) {
      setParseError(err.message || 'Lỗi khi nạp danh sách mẫu');
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý đọc tệp Excel học sinh do giáo viên tải lên VÀ LƯU NGAY VÀO CSDL HỆ THỐNG
  const handleProcessExcel = async (file: File) => {
    setSelectedFile(file);
    setParseError(null);
    setParseSuccessMsg(null);
    setParsedStudents([]);
    setIsSaving(true);

    try {
      const buffer = await file.arrayBuffer();
      // Phân tích thông minh với trình parser chuyên dụng
      const result = parseStudentExcel(buffer);
      setParsedStudents(result.students);

      // TỰ ĐỘNG LƯU TRỰC TIẾP VÀO CSDL NGAY KHI TẢI LÊN
      const saveRes = await onSaveRoster(result.students, 'replace');
      if (saveRes.success) {
        setParseSuccessMsg(
          `Đã tải lên & lưu thành công ${result.students.length} học sinh thuộc ${saveRes.classes.length} lớp (${saveRes.classes.join(', ')}) vào CSDL hệ thống!`
        );
        setTimeout(() => {
          setActiveTab('view');
        }, 1200);
      } else {
        setParseError('Đã đọc được dữ liệu nhưng không thể lưu vào CSDL máy chủ. Vui lòng kiểm tra lại kết nối mạng.');
      }
    } catch (err: any) {
      setParseError(err.message || 'Lỗi khi xử lý tệp Excel.');
      setParsedStudents([]);
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Lưu thủ công nếu cần
  const handleManualSave = async () => {
    if (parsedStudents.length === 0) return;
    setIsSaving(true);
    try {
      const res = await onSaveRoster(parsedStudents, 'replace');
      if (res.success) {
        setParseSuccessMsg(`Đã lưu thành công ${res.total} học sinh vào CSDL hệ thống!`);
        setParsedStudents([]);
        setSelectedFile(null);
        setTimeout(() => {
          setActiveTab('view');
        }, 800);
      } else {
        setParseError('Có lỗi xảy ra khi lưu vào máy chủ.');
      }
    } catch (err: any) {
      setParseError(err.message || 'Lỗi lưu danh sách.');
    } finally {
      setIsSaving(false);
    }
  };

  // Lọc danh sách xem
  const filteredRoster = roster.filter((s) => {
    if (viewClassFilter !== 'all' && s.className !== viewClassFilter) return false;
    if (viewSearchTerm.trim()) {
      const term = viewSearchTerm.toLowerCase();
      return s.fullName.toLowerCase().includes(term) || s.className.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all scale-100 max-h-[92vh] flex flex-col my-auto">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl leading-tight">
                Danh Sách Học Sinh Các Lớp (Từ Excel)
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Tải lên tệp Excel 3 cột (TT, Họ và tên, Lớp) lưu vào CSDL hệ thống phòng máy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab chuyển đổi */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/90 px-5 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-3.5 rounded-t-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border-b-2 ${
              activeTab === 'upload'
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-2xs font-black'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>Tải Lên File Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('view')}
            className={`py-2 px-3.5 rounded-t-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border-b-2 ${
              activeTab === 'view'
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-2xs font-black'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Danh Sách Hiện Có ({roster.length} HS)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-slate-800">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              {/* Hướng dẫn định dạng 3 cột */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-black text-emerald-900">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Quy định định dạng tệp Excel:</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadSampleExcel}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải File Excel Mẫu (.xlsx)</span>
                  </button>
                </div>

                <p className="text-emerald-950 font-medium leading-relaxed">
                  Tệp Excel chỉ cần <strong>3 cột</strong> đơn giản (hỗ trợ cả file mẫu từ VnEdu / SMAS):
                </p>
                <div className="grid grid-cols-3 gap-2 bg-white/90 p-2.5 rounded-xl border border-emerald-200 text-center font-bold text-xs">
                  <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-800">Cột 1: <strong>TT</strong> (hoặc STT)</div>
                  <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-800">Cột 2: <strong>Họ và tên</strong></div>
                  <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-800">Cột 3: <strong>Lớp</strong> (vd: 8A1, 9A2...)</div>
                </div>
                <p className="text-[11px] text-emerald-800">
                  💡 Hệ thống tự động nhận diện ô gộp (merged cells), tên Sheet theo lớp và tự động lưu thẳng vào CSDL.
                </p>
              </div>

              {/* Vùng tải tệp Excel */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessExcel(file);
                }}
              />

              <div
                onClick={() => !isSaving && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 bg-slate-50/70 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center group ${
                  isSaving ? 'opacity-50 cursor-wait' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isSaving ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-700" />
                  ) : (
                    <FileSpreadsheet className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-black text-slate-800 group-hover:text-emerald-700">
                    {isSaving
                      ? 'Đang đọc và lưu tệp vào CSDL hệ thống...'
                      : selectedFile
                      ? selectedFile.name
                      : 'Nháy vào đây để chọn tệp Excel danh sách học sinh'}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hỗ trợ định dạng .xlsx, .xls • Tự động nạp vào CSDL ngay khi chọn tệp
                  </p>
                </div>
              </div>

              {/* Thông báo lỗi nếu có */}
              {parseError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs sm:text-sm font-bold flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Thông báo thành công */}
              {parseSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs sm:text-sm font-bold flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{parseSuccessMsg}</span>
                </div>
              )}

              {/* Bảng xem trước dữ liệu vừa đọc */}
              {parsedStudents.length > 0 && (
                <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs font-black text-slate-700 uppercase">
                    <span>Dữ liệu đã nạp ({parsedStudents.length} học sinh):</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu vào CSDL
                    </span>
                  </div>

                  <div className="max-h-44 overflow-y-auto space-y-1 pr-1 text-xs divide-y divide-slate-100 bg-white rounded-xl border border-slate-200">
                    {parsedStudents.slice(0, 15).map((s, idx) => (
                      <div key={idx} className="p-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 font-black flex items-center justify-center text-[10px]">
                            {s.stt || idx + 1}
                          </span>
                          <span className="font-bold text-slate-900">{s.fullName}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-black rounded text-[11px]">
                          Lớp {s.className}
                        </span>
                      </div>
                    ))}
                    {parsedStudents.length > 15 && (
                      <div className="p-2 text-center text-slate-500 font-bold text-xs bg-slate-50">
                        ... và còn {parsedStudents.length - 15} học sinh khác nữa
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleManualSave}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black transition shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Lưu Lại Vào CSDL Hệ Thống</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Nút nạp mẫu thử nghiệm nếu chưa có file */}
              {roster.length === 0 && parsedStudents.length === 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="text-blue-900 font-semibold">
                    Thầy/Cô chưa có file Excel sẵn? Có thể nạp nhanh danh sách mẫu để thử nghiệm.
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadDemoRoster}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shrink-0 transition shadow-2xs cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Nạp DS Mẫu</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* TAB XEM & QUẢN LÝ DANH SÁCH HIỆN CÓ */
            <div className="space-y-3">
              {/* Bộ lọc theo lớp & Tìm kiếm */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <select
                    value={viewClassFilter}
                    onChange={(e) => setViewClassFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="all">Tất cả các lớp ({roster.length} HS)</option>
                    {existingClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        Lớp {cls} ({classCounts[cls]} HS)
                      </option>
                    ))}
                  </select>

                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên học sinh..."
                      value={viewSearchTerm}
                      onChange={(e) => setViewSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {existingClasses.length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      const confirmText =
                        viewClassFilter === 'all'
                          ? 'Thầy/Cô có chắc chắn muốn xóa TOÀN BỘ danh sách học sinh của tất cả các lớp?'
                          : `Thầy/Cô có chắc chắn muốn xóa danh sách học sinh của Lớp ${viewClassFilter}?`;
                      if (window.confirm(confirmText)) {
                        await onDeleteRoster(viewClassFilter === 'all' ? undefined : viewClassFilter);
                      }
                    }}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{viewClassFilter === 'all' ? 'Xóa toàn bộ' : `Xóa lớp ${viewClassFilter}`}</span>
                  </button>
                )}
              </div>

              {/* Bảng danh sách học sinh */}
              {filteredRoster.length > 0 ? (
                <div className="max-h-72 overflow-y-auto space-y-1 pr-1 border border-slate-200 rounded-2xl p-2 bg-slate-50/60 divide-y divide-slate-100 text-xs">
                  {filteredRoster.map((s, idx) => (
                    <div key={idx} className="p-2 flex items-center justify-between gap-2 bg-white rounded-xl mb-1 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-[10px]">
                          {s.stt || idx + 1}
                        </span>
                        <span className="font-bold text-slate-900">{s.fullName}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-black rounded-md text-[11px] border border-emerald-200">
                        Lớp {s.className}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 space-y-2 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Users className="w-8 h-8 mx-auto text-slate-300" />
                  <div className="text-xs font-bold text-slate-500">Chưa có học sinh nào trong danh mục này</div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg hover:bg-emerald-100 cursor-pointer"
                  >
                    + Tải lên từ file Excel ngay
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div>
            Hiện có: <strong>{roster.length}</strong> học sinh trong CSDL ({existingClasses.length} lớp)
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
