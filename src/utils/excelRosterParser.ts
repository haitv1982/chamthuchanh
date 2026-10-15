import * as XLSX from 'xlsx';
import { StudentRecord } from '../types';

/**
 * Trình phân tích tệp Excel Danh sách học sinh trường học thông minh
 * Hỗ trợ tối đa các định dạng thực tế của giáo viên Việt Nam:
 * - Chuẩn 3 cột: TT, Họ và tên, Lớp
 * - Định dạng VnEdu / SMAS: STT, Họ và chữ đệm, Tên, Lớp
 * - Ô gộp (Merged cells) cho cột Tên Lớp
 * - Tệp nhiều trang tính (Mỗi Sheet là một lớp ví dụ '8A1', '8A2')
 * - Bỏ qua tiêu đề trường, phòng GD&ĐT, chữ ký ban giám hiệu
 * - Không có dòng tiêu đề (Dữ liệu bắt đầu ngay từ dòng đầu tiên)
 */
export function parseStudentExcel(buffer: ArrayBuffer | Uint8Array): {
  students: StudentRecord[];
  classes: string[];
  summary: string;
} {
  const workbook = XLSX.read(buffer, { type: 'array' });
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('Tệp Excel không có trang tính nào.');
  }

  const allExtracted: StudentRecord[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    if (!rawRows || rawRows.length === 0) continue;

    // Phân tích tên Sheet nếu tên Sheet là tên lớp (vd: '8A1', 'Lớp 8A2', '9A')
    const sheetClassMatch = cleanClassName(sheetName);

    // 1. Tìm vị trí các cột
    let headerRowIdx = -1;
    let ttColIdx = -1;
    let nameColIdx = -1;
    let hoDemColIdx = -1;
    let tenColIdx = -1;
    let classColIdx = -1;

    for (let r = 0; r < Math.min(rawRows.length, 12); r++) {
      const row = rawRows[r].map((cell: any) => String(cell || '').trim().toLowerCase());

      const foundTT = row.findIndex((c) => c === 'tt' || c === 'stt' || c === 'số tt' || c.includes('thứ tự'));
      const foundFullName = row.findIndex((c) => 
        (c.includes('họ') && c.includes('tên')) || 
        c === 'họ và tên' || 
        c === 'họ tên' || 
        c === 'học sinh' ||
        c === 'tên học sinh' ||
        c === 'full name' ||
        c === 'name'
      );
      const foundHoDem = row.findIndex((c) => c.includes('họ đệm') || c.includes('họ và đệm') || c.includes('chữ đệm') || c === 'họ');
      const foundTen = row.findIndex((c) => c === 'tên' || c === 'ten');
      const foundClass = row.findIndex((c) => c === 'lớp' || c.includes('lớp') || c.includes('class') || c === 'lop');

      if ((foundFullName !== -1 || (foundHoDem !== -1 && foundTen !== -1)) && (foundClass !== -1 || sheetClassMatch)) {
        headerRowIdx = r;
        ttColIdx = foundTT;
        nameColIdx = foundFullName;
        hoDemColIdx = foundHoDem;
        tenColIdx = foundTen;
        classColIdx = foundClass;
        break;
      }
    }

    // Nếu không tìm thấy dòng tiêu đề rõ ràng, thử suy luận cột dựa trên cấu trúc 3 cột phổ biến
    let startRow = 1;
    if (headerRowIdx === -1) {
      // Kiểm tra dòng đầu tiên xem có phải là tiêu đề hay dữ liệu
      const firstRow = rawRows[0] || [];
      const c0 = String(firstRow[0] || '').trim();
      const c1 = String(firstRow[1] || '').trim();
      const c2 = String(firstRow[2] || '').trim();

      const isFirstRowHeader = 
        c0.toLowerCase().includes('tt') || 
        c1.toLowerCase().includes('họ') || 
        c1.toLowerCase().includes('tên') || 
        c2.toLowerCase().includes('lớp');

      if (isFirstRowHeader) {
        startRow = 1;
        ttColIdx = 0;
        nameColIdx = 1;
        classColIdx = 2;
      } else {
        // Dữ liệu bắt đầu ngay dòng 0
        startRow = 0;
        ttColIdx = 0;
        nameColIdx = 1;
        classColIdx = 2;
      }
    } else {
      startRow = headerRowIdx + 1;
    }

    let lastSeenClass = sheetClassMatch || '';

    for (let r = startRow; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!row || row.length === 0) continue;

      // Đọc STT
      const rawTT = ttColIdx >= 0 ? row[ttColIdx] : '';

      // Đọc Họ và tên (Trực tiếp hoặc ghép Họ đệm + Tên)
      let fullName = '';
      if (nameColIdx >= 0 && row[nameColIdx]) {
        fullName = String(row[nameColIdx]).trim();
      } else if (hoDemColIdx >= 0 && tenColIdx >= 0) {
        const ho = String(row[hoDemColIdx] || '').trim();
        const ten = String(row[tenColIdx] || '').trim();
        fullName = `${ho} ${ten}`.trim();
      }

      // Đọc Lớp
      let className = '';
      if (classColIdx >= 0 && row[classColIdx] !== undefined && String(row[classColIdx]).trim() !== '') {
        className = cleanClassName(String(row[classColIdx]));
        if (className) lastSeenClass = className;
      } else if (lastSeenClass) {
        // Kế thừa lớp phía trên nếu ô lớp bị gộp (Merged cell)
        className = lastSeenClass;
      }

      // Bỏ qua nếu không có tên hoặc tên là dòng tiêu đề lặp lại
      if (!fullName) continue;
      const lowerName = fullName.toLowerCase();
      if (
        lowerName.includes('họ và tên') ||
        lowerName.includes('họ tên') ||
        lowerName.includes('tổng số') ||
        lowerName.includes('tổng cộng') ||
        lowerName.includes('giáo viên') ||
        lowerName.includes('hiệu trưởng') ||
        lowerName.includes('ban giám hiệu') ||
        lowerName.startsWith('ngày ') ||
        lowerName.startsWith('stt')
      ) {
        continue;
      }

      // Nếu vẫn chưa có lớp, lấy lớp từ sheet hoặc gán mặc định nếu không có
      if (!className) {
        className = sheetClassMatch || lastSeenClass || '8A1';
      }

      allExtracted.push({
        stt: rawTT !== undefined && rawTT !== '' && !isNaN(Number(rawTT)) ? Number(rawTT) : allExtracted.length + 1,
        fullName,
        className,
      });
    }
  }

  if (allExtracted.length === 0) {
    throw new Error(
      'Không đọc được học sinh nào từ tệp. Vui lòng kiểm tra lại tệp Excel có chứa 3 cột: TT, Họ và tên, Lớp.'
    );
  }

  const detectedClasses = Array.from(new Set(allExtracted.map((s) => s.className))).sort();
  const summary = detectedClasses
    .map((c) => `${c} (${allExtracted.filter((s) => s.className === c).length} HS)`)
    .join(', ');

  return {
    students: allExtracted,
    classes: detectedClasses,
    summary: `Đã đọc thành công ${allExtracted.length} học sinh thuộc ${detectedClasses.length} lớp: ${summary}`,
  };
}

/**
 * Chuẩn hóa tên lớp
 * Ví dụ: "LỚP 8A1" -> "8A1", "lop 8a2" -> "8A2", "Khối 9 - 9A1" -> "9A1"
 */
export function cleanClassName(raw: string): string {
  if (!raw) return '';
  let str = String(raw).trim();
  str = str.replace(/^LỚP\s+/i, '');
  str = str.replace(/^LOP\s+/i, '');
  str = str.replace(/^KHỐI\s+\d+\s*[-–:]\s*/i, '');
  str = str.replace(/^KHOI\s+\d+\s*[-–:]\s*/i, '');
  str = str.trim().toUpperCase();

  // Tìm mẫu lớp chuẩn ví dụ 6A1, 7A2, 8B, 9A3
  const match = str.match(/([6-9]\s*[A-ZÀ-Ỹ0-9/._-]+)/i);
  if (match) {
    return match[1].replace(/\s+/g, '').toUpperCase();
  }
  return str;
}
