import * as XLSX from 'xlsx';
import { Submission, Assignment } from '../types';
import { formatPracticeDateVi } from './storageManager';

/**
 * Tách họ tên tiếng Việt thành:
 * - Họ và chữ đệm
 * - Tên (cột tên riêng 1 cột để dễ sắp xếp theo vần Abc)
 * - Họ và tên đầy đủ
 */
export function splitVietnameseName(fullName: string): {
  hoVaDem: string;
  ten: string;
  hoVaTen: string;
} {
  const clean = (fullName || '').trim().replace(/\s+/g, ' ');
  if (!clean) {
    return { hoVaDem: '', ten: '', hoVaTen: '' };
  }
  const parts = clean.split(' ');
  if (parts.length === 1) {
    return {
      hoVaDem: '',
      ten: parts[0],
      hoVaTen: clean,
    };
  }
  const ten = parts[parts.length - 1];
  const hoVaDem = parts.slice(0, parts.length - 1).join(' ');
  return {
    hoVaDem,
    ten,
    hoVaTen: clean,
  };
}

/**
 * Chuẩn hóa hiển thị số máy: Máy 01, Máy 02,...
 */
export function formatMachineNumber(machine: string): string {
  if (!machine) return 'Máy 01';
  const num = parseInt(machine.replace(/\D/g, '') || '0', 10);
  if (num > 0) {
    return `Máy ${String(num).padStart(2, '0')}`;
  }
  return machine.trim();
}

/**
 * Lấy chỉ số số học của máy để sắp xếp tự nhiên 1, 2, 3...
 */
export function getMachineSortNumber(machine: string): number {
  const num = parseInt(machine.replace(/\D/g, '') || '0', 10);
  return num || 999;
}

interface StudentExportRecord {
  machineNumber: string;
  machineIndex: number;
  hoVaDem: string;
  ten: string;
  hoVaTen: string;
  role: string;
  className: string;
  assignmentTitle: string;
  highestScore: number;
  bestAttemptNumber: string;
  classification: string;
  formattedTime: string;
  fileName: string;
  comments: string;
  practiceDate: string;
}

export function exportSubmissionsToExcel(params: {
  className: string;
  assignment?: Assignment | null;
  submissions: Submission[];
  teacherName?: string;
  schoolName?: string;
  targetDate?: string | null;
  dateMode?: 'all' | 'latest' | 'custom';
  filterByAssignmentOnly?: boolean;
}) {
  const {
    className,
    assignment,
    submissions,
    teacherName = 'Giáo viên Tin học',
    schoolName = 'Trường THCS / THPT',
    targetDate = null,
    dateMode = 'all',
    filterByAssignmentOnly = false,
  } = params;

  // 1. Lọc theo lớp nếu được chỉ định
  const filteredByClass = className === 'Tất cả'
    ? submissions
    : submissions.filter((s) => s.className === className);

  // 2. Tìm danh sách tất cả các ngày thực hành của lớp này (ngày mới nhất đứng đầu)
  const availableDates = Array.from(
    new Set(
      filteredByClass
        .map((s) => s.practiceDate || s.latestSubmittedAt?.slice(0, 10))
        .filter((d): d is string => Boolean(d && /^\d{4}-\d{2}-\d{2}$/.test(d)))
    )
  ).sort((a, b) => b.localeCompare(a));

  const latestDate = availableDates[0] || null;

  // 3. Xác định ngày thực hành cần lọc và xuất (Yêu cầu 4: Ngày bất kỳ hoặc Ngày gần nhất)
  let effectiveDate: string | null = null;
  let dateDescription = 'Tất cả các ngày thực hành';

  if (dateMode === 'latest' && latestDate) {
    effectiveDate = latestDate;
    dateDescription = `Ngày gần nhất (${formatPracticeDateVi(latestDate)})`;
  } else if (dateMode === 'custom' && targetDate) {
    effectiveDate = targetDate;
    dateDescription = `Ngày ${formatPracticeDateVi(targetDate)}`;
  } else if (targetDate) {
    effectiveDate = targetDate;
    dateDescription = `Ngày ${formatPracticeDateVi(targetDate)}`;
  } else {
    effectiveDate = null;
    dateDescription = 'Tất cả các ngày thực hành';
  }

  // 4. Lọc theo bài tập CHỈ KHI được yêu cầu cụ thể (mặc định xuất toàn bộ học sinh cả lớp)
  let baseClassSubmissions = filteredByClass;
  if (params.filterByAssignmentOnly && assignment) {
    const matching = filteredByClass.filter((s) => s.assignmentId === assignment.id);
    if (matching.length > 0) {
      baseClassSubmissions = matching;
    }
  }

  // 5. Lọc theo ngày thực hành nếu có chỉ định (hoặc ngày gần nhất)
  const filteredByDate = effectiveDate
    ? baseClassSubmissions.filter((s) => {
        const d = s.practiceDate || s.latestSubmittedAt?.slice(0, 10);
        return d === effectiveDate;
      })
    : baseClassSubmissions;

  // Nếu lọc theo ngày cụ thể mà không có dữ liệu, dùng baseClassSubmissions để tránh file rỗng
  const dataToExport = filteredByDate.length > 0 ? filteredByDate : baseClassSubmissions;

  // 6. Gom nhóm theo Máy / Học sinh và CHỈ LẤY LẦN NỘP CÓ KẾT QUẢ CAO NHẤT
  const bestSubmissionMap = new Map<string, Submission>();

  dataToExport.forEach((sub) => {
    const key = `${sub.className}__${sub.machineNumber}__${sub.studentLeader.trim().toLowerCase()}`;
    const existing = bestSubmissionMap.get(key);
    if (!existing) {
      bestSubmissionMap.set(key, sub);
    } else {
      if (sub.highestScore > existing.highestScore) {
        bestSubmissionMap.set(key, sub);
      } else if (sub.highestScore === existing.highestScore) {
        const timeA = new Date(sub.latestSubmittedAt || 0).getTime();
        const timeB = new Date(existing.latestSubmittedAt || 0).getTime();
        if (timeA > timeB) {
          bestSubmissionMap.set(key, sub);
        }
      }
    }
  });

  const finalSubmissions = Array.from(bestSubmissionMap.values());

  // Sắp xếp các nhóm theo thứ tự số máy tăng dần (Máy 01, Máy 02, Máy 03,...)
  const sortedSubmissions = [...finalSubmissions].sort((a, b) => {
    const numA = getMachineSortNumber(a.machineNumber);
    const numB = getMachineSortNumber(b.machineNumber);
    if (numA !== numB) return numA - numB;
    return b.highestScore - a.highestScore;
  });

  const nowStr = new Date().toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Thu thập danh sách chi tiết TẤT CẢ các thành viên - CHỈ XUẤT LẦN NỘP CÓ KẾT QUẢ CAO NHẤT
  const allStudentRecords: StudentExportRecord[] = [];

  sortedSubmissions.forEach((sub) => {
    const machineFormatted = formatMachineNumber(sub.machineNumber);
    const machineIdx = getMachineSortNumber(sub.machineNumber);

    // Tìm chính xác attempt đạt điểm cao nhất của nhóm/học sinh này
    const bestAttempt = sub.attempts.length > 0
      ? sub.attempts.reduce((best, curr) => (curr.score > (best?.score ?? -1) ? curr : best), sub.attempts[0])
      : null;

    const highestScore = bestAttempt ? bestAttempt.score : sub.highestScore;
    const bestAttemptNumber = bestAttempt ? `Lần ${bestAttempt.attemptNumber}` : 'Lần 1';

    let classification = 'Chưa đạt';
    if (highestScore >= 9) classification = 'Giỏi (Xuất sắc)';
    else if (highestScore >= 7) classification = 'Khá';
    else if (highestScore >= 5) classification = 'Đạt';

    const commentsList = [
      ...(bestAttempt?.strengths || []),
      ...(bestAttempt?.weaknesses ? bestAttempt.weaknesses.map((w) => `Lưu ý: ${w}`) : []),
      bestAttempt?.teacherNote ? `[GV]: ${bestAttempt.teacherNote}` : '',
    ].filter(Boolean).join('; ') || (highestScore >= 10 ? 'Hoàn thành xuất sắc 10/10' : 'Đã nộp bài đầy đủ');

    const formattedTime = bestAttempt?.timestamp
      ? new Date(bestAttempt.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : new Date(sub.latestSubmittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const practiceDate = sub.practiceDate
      ? new Date(sub.practiceDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : new Date(sub.latestSubmittedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const fileName = bestAttempt?.fileName || 'file_thuc_hanh';

    // 1. Thành viên là Trưởng nhóm / Người nộp
    const leaderParsed = splitVietnameseName(sub.studentLeader);
    allStudentRecords.push({
      machineNumber: machineFormatted,
      machineIndex: machineIdx,
      hoVaDem: leaderParsed.hoVaDem,
      ten: leaderParsed.ten,
      hoVaTen: leaderParsed.hoVaTen,
      role: sub.groupMembers.length > 0 ? 'Trưởng nhóm' : 'Làm cá nhân',
      className: sub.className,
      assignmentTitle: sub.assignmentTitle,
      highestScore,
      bestAttemptNumber,
      classification,
      formattedTime,
      fileName,
      comments: commentsList,
      practiceDate,
    });

    // 2. Từng bạn thành viên cùng nhóm tại máy này
    sub.groupMembers.forEach((member) => {
      const memberParsed = splitVietnameseName(member);
      allStudentRecords.push({
        machineNumber: machineFormatted,
        machineIndex: machineIdx,
        hoVaDem: memberParsed.hoVaDem,
        ten: memberParsed.ten,
        hoVaTen: memberParsed.hoVaTen,
        role: 'Thành viên nhóm',
        className: sub.className,
        assignmentTitle: sub.assignmentTitle,
        highestScore,
        bestAttemptNumber,
        classification,
        formattedTime,
        fileName,
        comments: commentsList,
        practiceDate,
      });
    });
  });

  // Thống kê toàn diện
  const totalStudents = allStudentRecords.length;
  const totalGroups = sortedSubmissions.length;
  const perfectGroups = sortedSubmissions.filter((s) => s.highestScore >= 10).length;
  const avgScore = totalGroups > 0
    ? (sortedSubmissions.reduce((sum, s) => sum + s.highestScore, 0) / totalGroups).toFixed(2)
    : '0';

  const COL_HEADERS = [
    'STT',
    'Vị trí máy',
    'Họ và chữ đệm',
    'Tên',
    'Họ và tên đầy đủ',
    'Vai trò trong nhóm',
    'Lớp',
    'Bài thực hành',
    'KẾT QUẢ CAO NHẤT (ĐIỂM)',
    'Lần nộp đạt điểm cao nhất',
    'Xếp loại học lực',
    'Thời gian nộp',
    'Ngày thực hành',
    'Tên tệp nộp',
    'Nhận xét đánh giá chi tiết (lần cao nhất)',
  ];

  const COL_WIDTHS = [
    { wch: 6 },  // STT
    { wch: 14 }, // Vị trí máy (Máy 01, Máy 02...)
    { wch: 20 }, // Họ và chữ đệm
    { wch: 12 }, // Tên (Cột tên riêng để sắp xếp Abc)
    { wch: 25 }, // Họ và tên đầy đủ
    { wch: 18 }, // Vai trò trong nhóm
    { wch: 8 },  // Lớp
    { wch: 34 }, // Bài thực hành
    { wch: 24 }, // KẾT QUẢ CAO NHẤT (ĐIỂM)
    { wch: 24 }, // Lần nộp đạt điểm cao nhất
    { wch: 16 }, // Xếp loại học lực
    { wch: 14 }, // Thời gian nộp
    { wch: 14 }, // Ngày thực hành
    { wch: 26 }, // Tên tệp nộp
    { wch: 60 }, // Nhận xét chi tiết
  ];

  // Helper để tạo các hàng dữ liệu học sinh
  const createStudentRows = (
    records: StudentExportRecord[],
    titleText: string,
    subText: string
  ): any[][] => {
    const rows: any[][] = [];
    rows.push([schoolName.toUpperCase()]);
    rows.push(['TỔ CHUYÊN MÔN: TIN HỌC']);
    rows.push(['']);
    rows.push([titleText]);
    rows.push([subText]);
    rows.push([`Lớp: ${className} | Buổi thực hành: ${dateDescription} | Xuất ngày: ${nowStr}`]);
    rows.push([`Giáo viên phụ trách: ${teacherName} | Tiêu chí xuất: CHỈ XUẤT LẦN NỘP CÓ KẾT QUẢ CAO NHẤT`]);
    rows.push(['']);
    rows.push(COL_HEADERS);

    records.forEach((rec, idx) => {
      rows.push([
        idx + 1,
        rec.machineNumber,
        rec.hoVaDem,
        rec.ten,
        rec.hoVaTen,
        rec.role,
        rec.className,
        rec.assignmentTitle,
        rec.highestScore,
        rec.bestAttemptNumber,
        rec.classification,
        rec.formattedTime,
        rec.practiceDate,
        rec.fileName,
        rec.comments,
      ]);
    });

    rows.push(['']);
    rows.push(['=== THỐNG KÊ TỔNG HỢP CẢ LỚP (KẾT QUẢ CAO NHẤT) ===']);
    rows.push(['Tổng số học sinh ghi nhận điểm:', totalStudents]);
    rows.push(['Tổng số máy / nhóm thực hành:', totalGroups]);
    rows.push(['Điểm trung bình toàn lớp:', avgScore]);
    rows.push(['Số nhóm đạt 10/10 tối đa:', perfectGroups]);

    return rows;
  };

  // =========================================================================
  // SHEET 1: DANH SÁCH THEO THỨ TỰ MÁY 01, MÁY 02...
  // (Tất cả thành viên trong nhóm, cột Tên riêng 1 cột để dễ sắp xếp theo Abc)
  // =========================================================================
  const sheet1Records = [...allStudentRecords].sort((a, b) => {
    if (a.machineIndex !== b.machineIndex) return a.machineIndex - b.machineIndex;
    if (a.role === 'Trưởng nhóm' && b.role !== 'Trưởng nhóm') return -1;
    if (a.role !== 'Trưởng nhóm' && b.role === 'Trưởng nhóm') return 1;
    return a.ten.localeCompare(b.ten, 'vi', { sensitivity: 'base' });
  });

  const sheet1Rows = createStudentRows(
    sheet1Records,
    'BẢNG ĐIỂM THỰC HÀNH TIN HỌC - THEO THỨ TỰ MÁY 01, MÁY 02,...',
    'Danh sách tất cả thành viên trong nhóm | Cột Tên riêng tách biệt thuận tiện sắp xếp A-Z'
  );

  // =========================================================================
  // SHEET 2: DANH SÁCH ĐÃ SẮP XẾP SẴN THEO TÊN (A-Z) TIẾNG VIỆT
  // (Cực kỳ tiện cho giáo viên khi nhập điểm vào Sổ điểm điện tử VnEdu/SMAS)
  // =========================================================================
  const sheet2Records = [...allStudentRecords].sort((a, b) => {
    const cmpTen = a.ten.localeCompare(b.ten, 'vi', { sensitivity: 'base' });
    if (cmpTen !== 0) return cmpTen;
    const cmpHo = a.hoVaDem.localeCompare(b.hoVaDem, 'vi', { sensitivity: 'base' });
    if (cmpHo !== 0) return cmpHo;
    return a.machineIndex - b.machineIndex;
  });

  const sheet2Rows = createStudentRows(
    sheet2Records,
    'BẢNG ĐIỂM THỰC HÀNH TIN HỌC - SẮP XẾP THEO TÊN HỌC SINH (A - Z)',
    'Đã sắp xếp sẵn theo cột Tên riêng | Có kèm số máy để giáo viên tiện đối chiếu'
  );

  // =========================================================================
  // SHEET 3: BẢNG TỔNG HỢP THEO NHÓM VÀ VỊ TRÍ MÁY
  // =========================================================================
  const groupRows: any[][] = [];
  groupRows.push([schoolName.toUpperCase()]);
  groupRows.push(['BẢNG TỔNG HỢP THEO NHÓM & VỊ TRÍ MÁY TRONG PHÒNG THỰC HÀNH']);
  groupRows.push([`Lớp: ${className} | Thời gian xuất: ${nowStr}`]);
  groupRows.push(['']);

  groupRows.push([
    'STT Nhóm',
    'Vị trí máy',
    'Họ và chữ đệm (Trưởng nhóm)',
    'Tên (Trưởng nhóm)',
    'Trưởng nhóm (Đầy đủ)',
    'Danh sách tất cả thành viên',
    'Sĩ số nhóm',
    'Lớp',
    'KẾT QUẢ CAO NHẤT (ĐIỂM)',
    'Lần nộp đạt điểm cao nhất',
    'Xếp loại',
    'Thời gian nộp (lần cao nhất)',
    'Ngày thực hành',
    'Tên tệp nộp (lần cao nhất)',
  ]);

  sortedSubmissions.forEach((sub, idx) => {
    const bestAttempt = sub.attempts.length > 0
      ? sub.attempts.reduce((best, curr) => (curr.score > (best?.score ?? -1) ? curr : best), sub.attempts[0])
      : null;

    const highestScore = bestAttempt ? bestAttempt.score : sub.highestScore;
    const bestAttemptNumber = bestAttempt ? `Lần ${bestAttempt.attemptNumber}` : 'Lần 1';

    let classification = 'Chưa đạt';
    if (highestScore >= 9) classification = 'Giỏi';
    else if (highestScore >= 7) classification = 'Khá';
    else if (highestScore >= 5) classification = 'Đạt';

    const leaderParsed = splitVietnameseName(sub.studentLeader);
    const allMembersList = [sub.studentLeader, ...sub.groupMembers].join(', ');

    const bestTime = bestAttempt?.timestamp
      ? new Date(bestAttempt.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : new Date(sub.latestSubmittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const practiceDate = sub.practiceDate
      ? new Date(sub.practiceDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : new Date(sub.latestSubmittedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    groupRows.push([
      idx + 1,
      formatMachineNumber(sub.machineNumber),
      leaderParsed.hoVaDem,
      leaderParsed.ten,
      leaderParsed.hoVaTen,
      allMembersList,
      1 + sub.groupMembers.length,
      sub.className,
      highestScore,
      bestAttemptNumber,
      classification,
      bestTime,
      practiceDate,
      bestAttempt?.fileName || 'file_thuc_hanh',
    ]);
  });

  // Create workbook with 3 specialized sheets
  const wb = XLSX.utils.book_new();

  // Sheet 1: Danh sách theo Máy 01, Máy 02...
  const wsSheet1 = XLSX.utils.aoa_to_sheet(sheet1Rows);
  wsSheet1['!cols'] = COL_WIDTHS;
  XLSX.utils.book_append_sheet(wb, wsSheet1, 'Theo_Thu_Tu_May');

  // Sheet 2: Sắp xếp sẵn theo Tên A-Z
  const wsSheet2 = XLSX.utils.aoa_to_sheet(sheet2Rows);
  wsSheet2['!cols'] = COL_WIDTHS;
  XLSX.utils.book_append_sheet(wb, wsSheet2, 'Sap_Xep_Ten_ABC');

  // Sheet 3: Tổng hợp theo Nhóm
  const wsGroups = XLSX.utils.aoa_to_sheet(groupRows);
  wsGroups['!cols'] = [
    { wch: 10 },
    { wch: 14 },
    { wch: 20 },
    { wch: 12 },
    { wch: 22 },
    { wch: 36 },
    { wch: 12 },
    { wch: 8 },
    { wch: 24 },
    { wch: 24 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, wsGroups, 'Tong_Hop_Theo_Nhom');

  // Filename
  const dateFormatted = new Date().toISOString().split('T')[0];
  const safeClassName = className.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateSuffix = effectiveDate
    ? `_Ngay_${effectiveDate.replace(/-/g, '_')}`
    : dateMode === 'latest' && latestDate
    ? `_NgayGanNhat_${latestDate.replace(/-/g, '_')}`
    : `_TatCaNgay_${dateFormatted}`;
  const filename = `Bang_Diem_Thuc_Hanh_Lop_${safeClassName}${dateSuffix}.xlsx`;

  // Trigger download
  XLSX.writeFile(wb, filename);
}

export function exportSingleSubmissionToExcel(params: {
  submission: Submission;
  assignment?: Assignment | null;
}) {
  const { submission, assignment } = params;
  const nowStr = new Date().toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const leaderParsed = splitVietnameseName(submission.studentLeader);
  const formattedMachine = formatMachineNumber(submission.machineNumber);

  const rows: any[][] = [];
  rows.push(['PHIẾU BÁO CÁO KẾT QUẢ THỰC HÀNH TIN HỌC (CHI TIẾT THÀNH VIÊN)']);
  rows.push([`Lớp: ${submission.className} | Vị trí: ${formattedMachine} | Ngày: ${nowStr}`]);
  rows.push([`Bài thực hành: ${assignment?.title || submission.assignmentTitle}`]);
  rows.push([`Trưởng nhóm / Người nộp: ${submission.studentLeader} (Họ đệm: "${leaderParsed.hoVaDem}" | Tên: "${leaderParsed.ten}")`]);
  rows.push([`Thành viên cùng nhóm: ${submission.groupMembers.join(', ') || 'Làm cá nhân'}`]);
  rows.push([`Điểm cao nhất đạt được: ${submission.highestScore} / 10 điểm`]);
  rows.push(['']);

  rows.push(['DANH SÁCH THÀNH VIÊN NHÓM THỰC HÀNH (CỘT TÊN RIÊNG ĐỂ SẮP XẾP ABC)']);
  rows.push(['STT', 'Vị trí máy', 'Họ và chữ đệm', 'Tên riêng', 'Họ và tên đầy đủ', 'Vai trò', 'Điểm số']);
  rows.push([
    1,
    formattedMachine,
    leaderParsed.hoVaDem,
    leaderParsed.ten,
    leaderParsed.hoVaTen,
    submission.groupMembers.length > 0 ? 'Trưởng nhóm' : 'Làm cá nhân',
    submission.highestScore,
  ]);

  submission.groupMembers.forEach((member, i) => {
    const memberParsed = splitVietnameseName(member);
    rows.push([
      i + 2,
      formattedMachine,
      memberParsed.hoVaDem,
      memberParsed.ten,
      memberParsed.hoVaTen,
      'Thành viên nhóm',
      submission.highestScore,
    ]);
  });

  rows.push(['']);
  rows.push(['LỊCH SỬ CÁC LẦN CHẤM & ĐỐI CHIẾU AI']);
  rows.push(['Lần chấm', 'Thời gian', 'Tên tệp', 'Điểm số', 'Đánh giá chi tiết']);

  submission.attempts.forEach((att) => {
    const feedbackSummary = [
      att.aiComparisonDetails ? `Đối chiếu: ${att.aiComparisonDetails}` : '',
      att.strengths?.length ? `Điểm tốt: ${att.strengths.join(', ')}` : '',
      att.weaknesses?.length ? `Cần sửa: ${att.weaknesses.join(', ')}` : '',
    ].filter(Boolean).join(' | ');

    rows.push([
      `Lần ${att.attemptNumber}`,
      new Date(att.timestamp).toLocaleTimeString('vi-VN'),
      att.fileName,
      att.score,
      feedbackSummary || 'Hoàn thành bài tập',
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 10 },
    { wch: 14 },
    { wch: 20 },
    { wch: 12 },
    { wch: 24 },
    { wch: 18 },
    { wch: 60 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Ket_Qua_Nhom');

  const safeLeader = submission.studentLeader.replace(/[^a-zA-Z0-9_\u00C0-\u1EF9-]/g, '_');
  const filename = `Ket_Qua_${submission.className}_${formattedMachine.replace(/\s+/g, '_')}_${safeLeader}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ============================================================================
// CHỨC NĂNG XUẤT BẢNG TỔNG HỢP ĐIỂM TỪNG LỚP (SP1, SP2... ĐIỂM TRUNG BÌNH)
// Cập nhật tại thời điểm giáo viên bấm xuất - Lấy điểm cao nhất của từng sản phẩm
// ============================================================================

export interface StudentSummaryRow {
  stt: number;
  hoVaDem: string;
  ten: string;
  fullName: string;
  scores: Record<string, number | null>; // assignmentId -> score
  completedCount: number;
  totalProducts: number;
  avgScore: number | null;
  classification: string;
}

export function getGradeLevelFromClass(className: string): string {
  const clean = (className || '').trim().replace(/^LỚP\s*|^LOP\s*/i, '');
  const firstChar = clean.charAt(0);
  if (firstChar === '6') return 'Lớp 6';
  if (firstChar === '7') return 'Lớp 7';
  if (firstChar === '8') return 'Lớp 8';
  if (firstChar === '9') return 'Lớp 9';
  return 'Lớp 6';
}

export function getAssignmentsForClass(
  className: string,
  allAssignments: Assignment[],
  submissions?: Submission[]
): Assignment[] {
  const gradeLevel = getGradeLevelFromClass(className);
  let classAssignments = (allAssignments || []).filter((a) => a.gradeLevel === gradeLevel);
  if (classAssignments.length === 0) {
    classAssignments = allAssignments || [];
  }
  // Nếu học sinh lớp này có nộp thêm sản phẩm khác ngoài danh sách khối, bổ sung thêm
  if (submissions && submissions.length > 0) {
    const cleanCls = className.trim().toUpperCase().replace(/^LỚP\s*|^LOP\s*/i, '');
    const classSubs = className === 'Tất cả'
      ? submissions
      : submissions.filter((s) => s.className.trim().toUpperCase().replace(/^LỚP\s*|^LOP\s*/i, '') === cleanCls);

    const usedAssignmentIds = new Set(classSubs.map((s) => s.assignmentId));
    allAssignments.forEach((a) => {
      if (usedAssignmentIds.has(a.id) && !classAssignments.some((ca) => ca.id === a.id)) {
        classAssignments.push(a);
      }
    });
  }
  return classAssignments;
}

export function buildClassMultiProductData(params: {
  className: string;
  assignments: Assignment[];
  submissions: Submission[];
  roster?: any[];
}): {
  students: StudentSummaryRow[];
  classAssignments: Assignment[];
  className: string;
  totalStudents: number;
  studentsWithSubmissions: number;
  classAverageScore: string;
  exportTimestamp: string;
} {
  const { className, assignments, submissions, roster = [] } = params;

  const cleanCls = className.trim().toUpperCase().replace(/^LỚP\s*|^LOP\s*/i, '');
  const classSubs = className === 'Tất cả'
    ? submissions
    : submissions.filter((s) => s.className.trim().toUpperCase().replace(/^LỚP\s*|^LOP\s*/i, '') === cleanCls);

  const classAssignments = getAssignmentsForClass(className, assignments, submissions);

  // 1. Tập hợp danh sách học sinh:
  // Ưu tiên danh sách đã tải lên (roster) của lớp này
  const rosterForClass = (roster || []).filter((r: any) => {
    const rCls = (r.className || '').trim().toUpperCase().replace(/^LỚP\s*|^LOP\s*/i, '');
    return className === 'Tất cả' || rCls === cleanCls;
  });

  const studentNameMap = new Map<string, { fullName: string; originalStt?: any }>();

  // Thêm học sinh từ danh sách phân lớp (roster)
  rosterForClass.forEach((r: any, idx: number) => {
    const name = (r.fullName || '').trim();
    if (name) {
      const normKey = name.toLowerCase().replace(/\s+/g, ' ');
      if (!studentNameMap.has(normKey)) {
        studentNameMap.set(normKey, { fullName: name, originalStt: r.stt ?? idx + 1 });
      }
    }
  });

  // Thêm bất kỳ học sinh nào đã nộp bài (Trưởng nhóm hoặc thành viên) mà chưa có trong danh sách
  classSubs.forEach((sub) => {
    const leader = (sub.studentLeader || '').trim();
    if (leader) {
      const normKey = leader.toLowerCase().replace(/\s+/g, ' ');
      if (!studentNameMap.has(normKey)) {
        studentNameMap.set(normKey, { fullName: leader });
      }
    }
    (sub.groupMembers || []).forEach((m) => {
      const member = (m || '').trim();
      if (member) {
        const normKey = member.toLowerCase().replace(/\s+/g, ' ');
        if (!studentNameMap.has(normKey)) {
          studentNameMap.set(normKey, { fullName: member });
        }
      }
    });
  });

  // Sắp xếp danh sách học sinh: Nếu có thứ tự STT thì theo STT, nếu không sắp xếp theo Tên ABC
  const rawList = Array.from(studentNameMap.values());
  const sortedList = [...rawList].sort((a, b) => {
    if (a.originalStt != null && b.originalStt != null) {
      const numA = Number(a.originalStt);
      const numB = Number(b.originalStt);
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;
    }
    const nameA = splitVietnameseName(a.fullName);
    const nameB = splitVietnameseName(b.fullName);
    const cmpTen = nameA.ten.localeCompare(nameB.ten, 'vi', { sensitivity: 'base' });
    if (cmpTen !== 0) return cmpTen;
    return nameA.hoVaDem.localeCompare(nameB.hoVaDem, 'vi', { sensitivity: 'base' });
  });

  // 2. Tính điểm từng sản phẩm cho từng học sinh (LẤY KẾT QUẢ CAO NHẤT)
  const students: StudentSummaryRow[] = sortedList.map((st, idx) => {
    const normName = st.fullName.toLowerCase().replace(/\s+/g, ' ');
    const nameParts = splitVietnameseName(st.fullName);
    const scores: Record<string, number | null> = {};

    classAssignments.forEach((assign) => {
      // Tìm tất cả các bài nộp của học sinh này cho sản phẩm assign
      const matchingSubs = classSubs.filter((sub) => {
        const isParticipant =
          sub.studentLeader.trim().toLowerCase().replace(/\s+/g, ' ') === normName ||
          (sub.groupMembers || []).some((m) => m.trim().toLowerCase().replace(/\s+/g, ' ') === normName);

        if (!isParticipant) return false;

        const isMatchAssign =
          sub.assignmentId === assign.id ||
          (assign.targetFile && sub.assignmentTitle.toLowerCase().includes(assign.targetFile.toLowerCase())) ||
          sub.assignmentTitle.toLowerCase().trim() === assign.title.toLowerCase().trim();

        return isMatchAssign;
      });

      if (matchingSubs.length > 0) {
        // Lấy điểm cao nhất trong các lần nộp
        const bestScore = Math.max(...matchingSubs.map((s) => s.highestScore));
        scores[assign.id] = bestScore;
      } else {
        scores[assign.id] = null;
      }
    });

    const scoredValues = Object.values(scores).filter((v): v is number => v !== null);
    const completedCount = scoredValues.length;
    const avgScore = completedCount > 0
      ? Number((scoredValues.reduce((sum, val) => sum + val, 0) / completedCount).toFixed(2))
      : null;

    let classification = 'Chưa có điểm';
    if (avgScore !== null) {
      if (avgScore >= 9) classification = 'Xuất sắc';
      else if (avgScore >= 8) classification = 'Giỏi';
      else if (avgScore >= 6.5) classification = 'Khá';
      else if (avgScore >= 5) classification = 'Đạt';
      else classification = 'Chưa đạt';
    }

    return {
      stt: st.originalStt ? Number(st.originalStt) || idx + 1 : idx + 1,
      hoVaDem: nameParts.hoVaDem,
      ten: nameParts.ten,
      fullName: st.fullName,
      scores,
      completedCount,
      totalProducts: classAssignments.length,
      avgScore,
      classification,
    };
  });

  const studentsWithSubmissions = students.filter((s) => s.completedCount > 0).length;
  const totalAvg = students
    .map((s) => s.avgScore)
    .filter((v): v is number => v !== null);

  const classAverageScore = totalAvg.length > 0
    ? (totalAvg.reduce((sum, v) => sum + v, 0) / totalAvg.length).toFixed(2)
    : '0';

  const exportTimestamp = new Date().toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return {
    students,
    classAssignments,
    className,
    totalStudents: students.length,
    studentsWithSubmissions,
    classAverageScore,
    exportTimestamp,
  };
}

/**
 * Xuất file Excel Bảng Tổng Hợp Điểm Từng Lớp
 * Gồm: STT, Họ và tên, Điểm SP1, Điểm SP2,... Điểm trung bình, lấy kết quả cao nhất
 * Cập nhật tức thời tại thời điểm bấm xuất!
 */
export function exportClassMultiProductGradebook(params: {
  className: string;
  assignments: Assignment[];
  submissions: Submission[];
  roster?: any[];
  teacherName?: string;
  schoolName?: string;
}) {
  const {
    className,
    assignments,
    submissions,
    roster = [],
    teacherName = 'Giáo viên Tin học',
    schoolName = 'TRƯỜNG THCS / THPT',
  } = params;

  // Lấy dữ liệu tổng hợp tại thời điểm hiện tại
  const data = buildClassMultiProductData({
    className,
    assignments,
    submissions,
    roster,
  });

  const { students, classAssignments, exportTimestamp } = data;

  // Xây dựng các tiêu đề cột sản phẩm: SP01, SP02...
  const productHeaders = classAssignments.map((a, i) => {
    const match = a.title.match(/SP\d+/i);
    const code = match ? match[0].toUpperCase() : `SP${String(i + 1).padStart(2, '0')}`;
    return `${code}: ${a.title.replace(/^SP\d+\.\s*/i, '').slice(0, 25)}`;
  });

  const COL_HEADERS = [
    'STT',
    'Họ và chữ đệm',
    'Tên',
    'Họ và tên đầy đủ',
    ...productHeaders,
    'Số SP đã nộp',
    'Điểm trung bình (ĐTB)',
    'Xếp loại học lực',
  ];

  // Helper để tạo các hàng cho một danh sách học sinh
  const createSheetRows = (
    studentList: StudentSummaryRow[],
    titleText: string,
    subText: string
  ): any[][] => {
    const rows: any[][] = [];
    rows.push([schoolName.toUpperCase()]);
    rows.push(['TỔ CHUYÊN MÔN: TIN HỌC - SỔ ĐIỂM ĐIỆN TỬ PHÒNG THỰC HÀNH']);
    rows.push(['']);
    rows.push([titleText]);
    rows.push([subText]);
    rows.push([`Lớp: ${className} | Số lượng học sinh: ${studentList.length} | Tổng số sản phẩm: ${classAssignments.length}`]);
    rows.push([`Thời điểm xuất: ${exportTimestamp} (Dữ liệu thời gian thực cập nhật mới nhất)`]);
    rows.push([`Giáo viên phụ trách: ${teacherName} | Tiêu chí: Lấy kết quả cao nhất của từng sản phẩm (gồm Trưởng nhóm & Thành viên)`]);
    rows.push(['']);
    rows.push(COL_HEADERS);

    studentList.forEach((st, idx) => {
      const scoreCols = classAssignments.map((a) => {
        const val = st.scores[a.id];
        return val !== null && val !== undefined ? val : '';
      });

      rows.push([
        idx + 1,
        st.hoVaDem,
        st.ten,
        st.fullName,
        ...scoreCols,
        `${st.completedCount}/${classAssignments.length}`,
        st.avgScore !== null ? st.avgScore : '',
        st.classification,
      ]);
    });

    // Thống kê cuối bảng
    rows.push(['']);
    rows.push([`=== THỐNG KÊ TỔNG HỢP LỚP ${className} (THỜI ĐIỂM: ${exportTimestamp}) ===`]);
    rows.push(['Sĩ số học sinh ghi nhận:', studentList.length]);
    rows.push(['Số học sinh đã có ít nhất 1 bài nộp:', studentList.filter((s) => s.completedCount > 0).length]);
    rows.push(['Điểm trung bình chung toàn lớp:', data.classAverageScore]);
    rows.push(['Số học sinh đạt loại Giỏi/Xuất sắc (>=8.0):', studentList.filter((s) => s.avgScore !== null && s.avgScore >= 8).length]);
    rows.push(['Ghi chú:', 'Điểm từng sản phẩm lấy kết quả cao nhất giữa các lần nộp. Cả trưởng nhóm và các bạn trong nhóm đều được ghi nhận điểm.']);

    return rows;
  };

  // SHEET 1: Theo thứ tự STT lớp (hoặc danh sách học sinh)
  const sheet1Rows = createSheetRows(
    students,
    `BẢNG ĐIỂM TỔNG HỢP CÁC SẢN PHẨM THỰC HÀNH - LỚP ${className.toUpperCase()}`,
    'Thống kê chi tiết điểm các sản phẩm SP1, SP2... và Điểm trung bình (ĐTB) | Thứ tự theo danh sách lớp'
  );

  // SHEET 2: Sắp xếp theo Tên A-Z (Rất tiện cho việc nhập điểm vào phần mềm quản lý VnEdu/SMAS)
  const sheet2Students = [...students].sort((a, b) => {
    const cmpTen = a.ten.localeCompare(b.ten, 'vi', { sensitivity: 'base' });
    if (cmpTen !== 0) return cmpTen;
    return a.hoVaDem.localeCompare(b.hoVaDem, 'vi', { sensitivity: 'base' });
  });

  const sheet2Rows = createSheetRows(
    sheet2Students,
    `BẢNG ĐIỂM TỔNG HỢP CÁC SẢN PHẨM - LỚP ${className.toUpperCase()} (SẮP XẾP TÊN A - Z)`,
    'Đã sắp xếp sẵn theo cột Tên riêng A-Z | Thuận tiện cho giáo viên nhập điểm vào VnEdu / SMAS'
  );

  const wb = XLSX.utils.book_new();

  // Thiết lập độ rộng cột cho đẹp mắt
  const colWidths = [
    { wch: 6 },  // STT
    { wch: 20 }, // Họ và chữ đệm
    { wch: 12 }, // Tên
    { wch: 26 }, // Họ và tên đầy đủ
    ...classAssignments.map(() => ({ wch: 16 })), // Từng cột SP
    { wch: 14 }, // Số SP đã nộp
    { wch: 22 }, // Điểm trung bình (ĐTB)
    { wch: 18 }, // Xếp loại
  ];

  const wsSheet1 = XLSX.utils.aoa_to_sheet(sheet1Rows);
  wsSheet1['!cols'] = colWidths;
  XLSX.utils.book_append_sheet(wb, wsSheet1, `Tong_Hop_Lop_${className}`);

  const wsSheet2 = XLSX.utils.aoa_to_sheet(sheet2Rows);
  wsSheet2['!cols'] = colWidths;
  XLSX.utils.book_append_sheet(wb, wsSheet2, 'Sap_Xep_Ten_ABC');

  // Tên file chứa lớp và thời gian xuất chính xác
  const safeClassName = className.replace(/[^a-zA-Z0-9_-]/g, '_');
  const now = new Date();
  const timeStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  const filename = `Bang_Diem_Tong_Hop_SP_Lop_${safeClassName}_${timeStr}.xlsx`;

  XLSX.writeFile(wb, filename);
}

