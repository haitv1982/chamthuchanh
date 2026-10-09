import React, { useState, useRef } from 'react';
import { Plus, Trash2, X, Save, BookOpen, AlertCircle, Upload, FileCode, CheckCircle2 } from 'lucide-react';
import { Assignment, RubricCriterion } from '../types';

interface AssignmentEditorModalProps {
  onClose: () => void;
  onSave: (assignment: Assignment) => void;
}

export const AssignmentEditorModal: React.FC<AssignmentEditorModalProps> = ({
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Lớp 8');
  const [subjectType, setSubjectType] = useState<Assignment['subjectType']>('python');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [description, setDescription] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');

  // Sample product uploaded by teacher for AI comparison
  const [sampleFileName, setSampleFileName] = useState('');
  const [sampleContent, setSampleContent] = useState('');
  const [sampleNotes, setSampleNotes] = useState('');
  const sampleFileInputRef = useRef<HTMLInputElement>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSampleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSampleFileName(file.name);
    const reader = new FileReader();
    const isTextLike =
      file.name.match(/\.(py|pas|cpp|c|h|html|htm|css|js|txt|json|csv|md)$/i) ||
      file.type.startsWith('text/');

    if (isTextLike) {
      reader.onload = (event) => {
        setSampleContent((event.target?.result as string) || '');
      };
      reader.readAsText(file);
    } else {
      setSampleContent(`[Tệp mẫu nhị phân/tài liệu: ${file.name}, dung lượng ${(file.size / 1024).toFixed(1)} KB]`);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên bài thực hành.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Vui lòng nhập mô tả nhiệm vụ thực hành.');
      return;
    }

    const reqs = requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const newAssignment: Assignment = {
      id: `assign-${Date.now()}`,
      title: title.trim(),
      gradeLevel,
      subjectType,
      durationMinutes,
      description: description.trim(),
      requirements: reqs.length > 0 ? reqs : ['Hoàn thành bài tập theo hướng dẫn của giáo viên'],
      expectedOutput: expectedOutput.trim() || undefined,
      sampleProduct: sampleFileName
        ? {
            fileName: sampleFileName,
            content: sampleContent,
            notes: sampleNotes.trim() || undefined,
          }
        : undefined,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    onSave(newAssignment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-800">Tạo Bài Thực Hành Mới</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* General info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên bài thực hành <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Bài thực hành: Viết chương trình giải phương trình bậc hai"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Khối Lớp</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="Khối 6">Khối 6 (6A2, 6B2, 6C2, 6D2)</option>
                <option value="Khối 7">Khối 7 (7A2, 7B2, 7C2)</option>
                <option value="Khối 8">Khối 8 (8A2, 8B2, 8C2)</option>
                <option value="Khối 9">Khối 9 (9A2, 9B2, 9C2)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thể loại môn</label>
              <select
                value={subjectType}
                onChange={(e) => setSubjectType(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="python">Lập trình Python</option>
                <option value="pascal">Lập trình Pascal</option>
                <option value="cpp">Lập trình C++</option>
                <option value="web">Web HTML/CSS</option>
                <option value="excel">Bảng tính Excel</option>
                <option value="word">Soạn thảo Word</option>
                <option value="scratch">Lập trình Scratch</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời lượng (phút)
              </label>
              <input
                type="number"
                min="15"
                max="90"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 45)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mô tả nhiệm vụ giao cho học sinh <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Nhập yêu cầu nhiệm vụ giáo viên giao cho học sinh trong tiết học..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Các yêu cầu cụ thể (mỗi dòng 1 yêu cầu):
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ:&#10;Khai báo biến và nhập dữ liệu hợp lệ&#10;Kiểm tra trường hợp đặc biệt&#10;In kết quả chính xác theo mẫu"
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Section: Sản Phẩm Mẫu Của Giáo Viên Để AI Đối Chiếu */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-blue-600" />
                Tải Lên Sản Phẩm Mẫu Của Giáo Viên (Để AI Đối Chiếu)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Hệ thống AI sẽ tự động đối chiếu bài nộp của học sinh với sản phẩm mẫu này, kho lưu trữ chuẩn và tri thức trên Internet để chấm điểm.
              </p>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <input
                ref={sampleFileInputRef}
                type="file"
                onChange={handleSampleFileUpload}
                className="hidden"
                accept=".py,.pas,.cpp,.c,.html,.docx,.xlsx,.pptx,.sb3,.txt"
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => sampleFileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn tệp mẫu từ máy giáo viên</span>
                </button>
                {sampleFileName && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã chọn: {sampleFileName}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Hoặc dán trực tiếp mã nguồn / nội dung sản phẩm mẫu:
                </label>
                <textarea
                  rows={4}
                  value={sampleContent}
                  onChange={(e) => setSampleContent(e.target.value)}
                  placeholder="Dán code mẫu chuẩn hoặc nội dung file mẫu tại đây..."
                  className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Ghi chú lưu ý riêng cho AI khi chấm (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={sampleNotes}
                  onChange={(e) => setSampleNotes(e.target.value)}
                  placeholder="Ví dụ: Bắt buộc học sinh phải dùng vòng lặp for và có chú thích giải thích"
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu & Mở Bài Này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
