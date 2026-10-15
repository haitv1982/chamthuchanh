import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  GraduationCap,
  Monitor,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { SCHOOL_CLASSES, getClassesByGrade } from '../data/classes';
import { validateVietnameseFullName } from '../utils/storageManager';

interface StudentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrade: string; // 'Lớp 6' | 'Lớp 7' | 'Lớp 8' | 'Lớp 9'
  onSelectGrade: (grade: string) => void;
  className: string;
  onSelectClassName: (cls: string) => void;
  machineNumber: string;
  onChangeMachineNumber: (machine: string) => void;
  studentLeader: string;
  onChangeStudentLeader: (name: string) => void;
  groupMembers: string[];
  onChangeGroupMembers: (members: string[]) => void;
  onSavedNotice?: (msg: string) => void;
}

const GRADE_OPTIONS = [
  { id: 'Lớp 6', label: 'Khối 6 (Tin Học 6)', short: 'K6', color: 'indigo' },
  { id: 'Lớp 7', label: 'Khối 7 (Tin Học 7)', short: 'K7', color: 'blue' },
  { id: 'Lớp 8', label: 'Khối 8 (Tin Học 8)', short: 'K8', color: 'emerald' },
  { id: 'Lớp 9', label: 'Khối 9 (Tin Học 9)', short: 'K9', color: 'rose' },
];

export const StudentInfoModal: React.FC<StudentInfoModalProps> = ({
  isOpen,
  onClose,
  selectedGrade,
  onSelectGrade,
  className,
  onSelectClassName,
  machineNumber,
  onChangeMachineNumber,
  studentLeader,
  onChangeStudentLeader,
  groupMembers,
  onChangeGroupMembers,
  onSavedNotice,
}) => {
  const [tempGrade, setTempGrade] = useState<string>(selectedGrade || 'Lớp 8');
  const [tempClass, setTempClass] = useState<string>(className || '8A2');
  const [tempMachine, setTempMachine] = useState<string>(machineNumber || 'Máy 05');
  const [tempLeader, setTempLeader] = useState<string>(studentLeader || '');
  const [tempMembers, setTempMembers] = useState<string[]>(groupMembers || []);
  const [newMemberInput, setNewMemberInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempGrade(selectedGrade || (className.startsWith('9') ? 'Lớp 9' : className.startsWith('8') ? 'Lớp 8' : className.startsWith('7') ? 'Lớp 7' : 'Lớp 6'));
      setTempClass(className || '8A2');
      setTempMachine(machineNumber || 'Máy 05');
      setTempLeader(studentLeader || '');
      setTempMembers(groupMembers || []);
      setNewMemberInput('');
      setErrorMsg(null);
    }
  }, [isOpen, selectedGrade, className, machineNumber, studentLeader, groupMembers]);

  if (!isOpen) return null;

  // Lấy danh sách lớp tương ứng với khối đang chọn
  const availableClasses = getClassesByGrade(tempGrade);

  // Khi bấm đổi khối trong modal
  const handleGradeChange = (newGrade: string) => {
    setTempGrade(newGrade);
    const classesForNewGrade = getClassesByGrade(newGrade);
    if (!classesForNewGrade.includes(tempClass as any)) {
      setTempClass(classesForNewGrade[0] || '');
    }
    setErrorMsg(null);
  };

  // Thêm thành viên vào nhóm
  const handleAddMember = () => {
    const check = validateVietnameseFullName(newMemberInput);
    if (!check.isValid) {
      setErrorMsg(check.error || 'Vui lòng nhập đầy đủ cả Họ và Tên bạn cùng nhóm.');
      return;
    }
    if (tempMembers.some((m) => m.toLowerCase() === check.cleanName.toLowerCase())) {
      setErrorMsg(`Bạn "${check.cleanName}" đã có trong danh sách nhóm.`);
      return;
    }
    if (tempLeader.trim().toLowerCase() === check.cleanName.toLowerCase()) {
      setErrorMsg(`"${check.cleanName}" đã là trưởng nhóm / người nộp chính.`);
      return;
    }
    setTempMembers((prev) => [...prev, check.cleanName]);
    setNewMemberInput('');
    setErrorMsg(null);
  };

  // Xóa thành viên
  const handleRemoveMember = (idx: number) => {
    setTempMembers((prev) => prev.filter((_, i) => i !== idx));
    setErrorMsg(null);
  };

  // Lưu và cập nhật
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Kiểm tra Lớp
    if (!tempClass.trim()) {
      setErrorMsg('⚠️ Vui lòng chọn lớp học của em.');
      return;
    }

    // 2. Kiểm tra Số máy
    if (!tempMachine.trim()) {
      setErrorMsg('⚠️ Vui lòng chọn hoặc nhập số máy tính đang ngồi.');
      return;
    }

    // 3. Kiểm tra Họ và Tên học sinh
    const leaderCheck = validateVietnameseFullName(tempLeader);
    if (!leaderCheck.isValid) {
      setErrorMsg(leaderCheck.error || '⚠️ Bắt buộc nhập đầy đủ cả Họ và Tên (ví dụ: Nguyễn Văn An).');
      return;
    }

    // Cập nhật lên cấp ứng dụng
    onSelectGrade(tempGrade);
    onSelectClassName(tempClass);
    onChangeMachineNumber(tempMachine);
    onChangeStudentLeader(leaderCheck.cleanName);
    onChangeGroupMembers(tempMembers);

    // Lưu bền vững vào localStorage
    try {
      localStorage.setItem('labgrade_user_class', tempClass);
      localStorage.setItem('labgrade_machine_number', tempMachine);
      localStorage.setItem('labgrade_student_leader', leaderCheck.cleanName);
      localStorage.setItem('labgrade_group_members', JSON.stringify(tempMembers));
      localStorage.setItem('labgrade_selected_grade', tempGrade);
    } catch {}

    if (onSavedNotice) {
      onSavedNotice(`Đã cập nhật: Lớp ${tempClass} - ${tempMachine} - ${leaderCheck.cleanName}`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all scale-100 max-h-[92vh] flex flex-col my-auto">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <UserCheck className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl leading-tight">
                Nhập Thông Tin Thực Hành
              </h3>
              <p className="text-xs text-blue-100 font-medium">
                Chọn khối, lớp, vị trí máy và tên học sinh / nhóm
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-800">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs sm:text-sm font-bold flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. CHỌN KHỐI LỚP */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>1. Chọn Khối Lớp:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GRADE_OPTIONS.map((g) => {
                const isSelected = tempGrade === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleGradeChange(g.id)}
                    className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                        : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-xs opacity-80 uppercase">{g.short}</span>
                    <span>{g.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CHỌN LỚP HỌC & SỐ MÁY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Lớp Học */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>2. Chọn Lớp Học:</span>
              </label>
              <select
                value={tempClass}
                onChange={(e) => {
                  setTempClass(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-bold text-slate-900 transition outline-none cursor-pointer"
              >
                {availableClasses.map((c) => (
                  <option key={c} value={c}>
                    Lớp {c} ({tempGrade})
                  </option>
                ))}
              </select>
            </div>

            {/* Số Máy Tính */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-blue-600" />
                <span>3. Số Máy Phòng Học:</span>
              </label>
              <select
                value={tempMachine}
                onChange={(e) => {
                  setTempMachine(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-bold text-slate-900 transition outline-none cursor-pointer"
              >
                {Array.from({ length: 45 }, (_, i) => {
                  const mStr = `Máy ${String(i + 1).padStart(2, '0')}`;
                  return (
                    <option key={mStr} value={mStr}>
                      {mStr}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* 3. HỌ VÀ TÊN HỌC SINH / TRƯỞNG NHÓM */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>4. Họ và Tên Học Sinh (Người nộp bài):</span>
              </label>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                Bắt buộc cả Họ và Tên
              </span>
            </div>
            <input
              type="text"
              placeholder="Ví dụ: Nguyễn Văn An (Nhập đầy đủ cả Họ và Tên)"
              value={tempLeader}
              onChange={(e) => {
                setTempLeader(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-bold text-slate-900 transition outline-none"
            />
            {tempLeader.trim() && tempLeader.trim().split(/\s+/).length < 2 && (
              <p className="text-xs font-bold text-amber-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Em mới chỉ nhập tên "{tempLeader.trim()}". Hãy nhập đầy đủ cả Họ và Tên!
              </p>
            )}
          </div>

          {/* 4. THÀNH VIÊN CÙNG NHÓM (NẾU CÓ) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>5. Bạn Cùng Nhóm (nếu làm 2 - 3 bạn/máy):</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Làm 1 mình: để trống</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập Họ và Tên bạn cùng nhóm (vd: Trần Thị Bình)..."
                value={newMemberInput}
                onChange={(e) => {
                  setNewMemberInput(e.target.value);
                  setErrorMsg(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 outline-none"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 transition shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm</span>
              </button>
            </div>

            {tempMembers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tempMembers.map((m, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold rounded-lg"
                  >
                    <span>{idx + 1}. {m}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="text-slate-400 hover:text-rose-600 transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Cập Nhật Thông Tin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
