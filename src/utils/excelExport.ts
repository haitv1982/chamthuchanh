import * as XLSX from 'xlsx';
import { Submission, Assignment } from '../types';

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
  attempt1: number | string;
  attempt2: number | string;
  attempt3: number | string;
  highestScore: number;
  classification: string;
  attemptsCount: number;
  formattedTime: string;
  fileName: string;
  comments: string;
}

export function exportSubmissionsToExcel(params: {
  className: string;
  assignment?: Assignment | null;
  submissions: Submission[];
  teacherName?: string;
  schoolName?: string;
}) {
  const {
    className,
    assignment,
    submissions,
    teacherName = 'Giáo viên Tin học',
    schoolName = 'Trường THCS / THPT',
  } = params;

  // Filter submissions by class if specified
  const filteredList = className === 'Tất cả'
    ? submissions
    : submissions.filter((s) => s.className === className);

  // Sắp xếp các nhóm theo thứ tự số máy tăng dần (Máy 01, Máy 02, Máy 03,...)
  const sortedSubmissions = [...filteredList].sort((a, b) => {
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

  // Thu thập danh sách chi tiết TẤT CẢ các thành viên trong từng nhóm
  const allStudentRecords: StudentExportRecord[] = [];

  sortedSubmissions.forEach((sub) => {
    const machineFormatted = formatMachineNumber(sub.machineNumber);
    const machineIdx = getMachineSortNumber(sub.machineNumber);

    const attempt1 = sub.attempts[0]?.score !== undefined ? sub.attempts[0].score : '-';
    const attempt2 = sub.attempts[1]?.score !== undefined ? sub.attempts[1].score : '-';
    const attempt3 = sub.attempts[2]?.score !== undefined ? sub.attempts[2].score : '-';

    let classification = 'Chưa đạt';
    if (sub.highestScore >= 9) classification = 'Giỏi (Xuất sắc)';
    else if (sub.highestScore >= 7) classification = 'Khá';
    else if (sub.highestScore >= 5) classification = 'Đạt';

    const latestAttempt = sub.attempts[sub.attempts.length - 1];
    const commentsList = [
      ...(latestAttempt?.strengths || []),
      ...(latestAttempt?.weaknesses ? latestAttempt.weaknesses.map((w) => `Lưu ý: ${w}`) : []),
      latestAttempt?.teacherNote ? `[GV]: ${latestAttempt.teacherNote}` : '',
    ].filter(Boolean).join('; ') || (sub.highestScore === 10 ? 'Hoàn thành xuất sắc 10/10' : 'Đã nộp bài đầy đủ');

    const formattedTime = new Date(sub.latestSubmittedAt).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const fileName = latestAttempt?.fileName || 'file_thuc_hanh';

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
      attempt1,
      attempt2,
      attempt3,
      highestScore: sub.highestScore,
      classification,
      attemptsCount: sub.attempts.length,
      formattedTime,
      fileName,
      comments: commentsList,
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
        attempt1,
        attempt2,
        attempt3,
        highestScore: sub.highestScore,
        classification,
        attemptsCount: sub.attempts.length,
        formattedTime,
        fileName,
        comments: commentsList,
      });
    });
  });

  // Calculate statistics
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
    'Điểm Lần 1',
    'Điểm Lần 2',
    'Điểm Lần 3',
    'ĐIỂM TỔNG KẾT (CAO NHẤT)',
    'Xếp loại học lực',
    'Số lần nộp',
    'Thời gian nộp',
    'Tên tệp nộp',
    'Nhận xét chi tiết',
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
    { wch: 11 }, // Lần 1
    { wch: 11 }, // Lần 2
    { wch: 11 }, // Lần 3
    { wch: 22 }, // ĐIỂM TỔNG KẾT
    { wch: 16 }, // Xếp loại học lực
    { wch: 11 }, // Số lần nộp
    { wch: 14 }, // Thời gian nộp
    { wch: 24 }, // Tên tệp nộp
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
    rows.push([`Lớp: ${className} | Bài thực hành: ${assignment ? assignment.title : 'Tất cả bài tập'} | Xuất ngày: ${nowStr}`]);
    rows.push([`Giáo viên phụ trách: ${teacherName}`]);
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
        rec.attempt1,
        rec.attempt2,
        rec.attempt3,
        rec.highestScore,
        rec.classification,
        rec.attemptsCount,
        rec.formattedTime,
        rec.fileName,
        rec.comments,
      ]);
    });

    rows.push(['']);
    rows.push(['=== THỐNG KÊ TỔNG HỢP CẢ LỚP ===']);
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
    'Điểm Lần 1',
    'Điểm Lần 2',
    'ĐIỂM CAO NHẤT',
    'Xếp loại',
    'Số lần nộp',
    'Thời gian nộp cuối',
  ]);

  sortedSubmissions.forEach((sub, idx) => {
    const attempt1 = sub.attempts[0]?.score !== undefined ? sub.attempts[0].score : '-';
    const attempt2 = sub.attempts[1]?.score !== undefined ? sub.attempts[1].score : '-';

    let classification = 'Chưa đạt';
    if (sub.highestScore >= 9) classification = 'Giỏi';
    else if (sub.highestScore >= 7) classification = 'Khá';
    else if (sub.highestScore >= 5) classification = 'Đạt';

    const leaderParsed = splitVietnameseName(sub.studentLeader);
    const allMembersList = [sub.studentLeader, ...sub.groupMembers].join(', ');

    groupRows.push([
      idx + 1,
      formatMachineNumber(sub.machineNumber),
      leaderParsed.hoVaDem,
      leaderParsed.ten,
      leaderParsed.hoVaTen,
      allMembersList,
      1 + sub.groupMembers.length,
      sub.className,
      attempt1,
      attempt2,
      sub.highestScore,
      classification,
      sub.attempts.length,
      new Date(sub.latestSubmittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
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
    { wch: 11 },
    { wch: 11 },
    { wch: 16 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsGroups, 'Tong_Hop_Theo_Nhom');

  // Filename
  const dateFormatted = new Date().toISOString().split('T')[0];
  const safeClassName = className.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Bang_Diem_Thuc_Hanh_Lop_${safeClassName}_Theo_May_Va_Ten_ABC_${dateFormatted}.xlsx`;

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
