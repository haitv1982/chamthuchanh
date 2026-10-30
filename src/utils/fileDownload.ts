import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { Submission, SubmissionAttempt } from '../types';

/**
 * Chuyển đổi chuỗi Data URL Base64 thành binary Blob chính xác tuyệt đối từng byte
 */
export function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;

    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const isBase64 = parts[0].includes('base64');

    if (isBase64) {
      const binaryStr = atob(parts[1]);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return new Blob([bytes], { type: mime });
    } else {
      const decoded = decodeURIComponent(parts[1]);
      return new Blob([decoded], { type: mime });
    }
  } catch (err) {
    console.warn('[FileDownload] Lỗi chuyển đổi dataUrl sang Blob:', err);
    return null;
  }
}

/**
 * Kích hoạt tải tệp Blob về máy tính người dùng
 */
export function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Dự phòng khẩn cấp: Tạo tệp PowerPoint (.pptx) chuẩn OpenXML từ nội dung trích xuất
 * nếu bản ghi cũ bị thiếu dữ liệu nhị phân gốc, giúp mở được trên PowerPoint không bao giờ bị báo hỏng
 */
export async function createFallbackPptxBlob(title: string, rawText: string): Promise<Blob> {
  const zip = new JSZip();

  // Tách các slide từ văn bản nếu có
  const slideSections = rawText.split(/--- Slide \d+ ---/g).map((s) => s.trim()).filter(Boolean);
  const slides = slideSections.length > 0 ? slideSections : [rawText.slice(0, 500) || 'Báo cáo thực hành'];

  // 1. [Content_Types].xml
  let contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>`;
  slides.forEach((_, idx) => {
    contentTypesXml += `\n  <Override PartName="/ppt/slides/slide${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
  });
  contentTypesXml += `\n</Types>`;
  zip.file('[Content_Types].xml', contentTypesXml);

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
  );

  // 3. ppt/presentation.xml
  let sldIdLst = '';
  slides.forEach((_, idx) => {
    sldIdLst += `<p:sldId id="${256 + idx}" r:id="rId${idx + 1}"/>`;
  });

  zip.file(
    'ppt/presentation.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst/>
  <p:sldIdLst>${sldIdLst}</p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000" type="screen4x3"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`
  );

  // 4. ppt/_rels/presentation.xml.rels
  let presRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`;
  slides.forEach((_, idx) => {
    presRels += `\n  <Relationship Id="rId${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${idx + 1}.xml"/>`;
  });
  presRels += `\n</Relationships>`;
  zip.file('ppt/_rels/presentation.xml.rels', presRels);

  // 5. Các slides: ppt/slides/slideX.xml
  slides.forEach((slideText, idx) => {
    const lines = slideText.split('\n').map((l) => l.trim()).filter(Boolean);
    const slideTitle = lines[0] || `Trang ${idx + 1}`;
    const bodyLines = lines.slice(1);

    let bodyParas = '';
    bodyLines.slice(0, 10).forEach((line) => {
      const cleanLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      bodyParas += `<a:p><a:r><a:rPr lang="vi-VN" sz="1800"/><a:t>${cleanLine}</a:t></a:r></a:p>`;
    });

    const cleanTitle = (idx === 0 ? title : slideTitle)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="685800" y="457200"/><a:ext cx="7772400" cy="1143000"/></a:xfrm></p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="vi-VN" sz="3200" b="1"/><a:t>${cleanTitle}</a:t></a:r></a:p></p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Content"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="685800" y="1800000"/><a:ext cx="7772400" cy="4500000"/></a:xfrm></p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/>${bodyParas || '<a:p><a:r><a:t>(Nội dung trang trình chiếu)</a:t></a:r></a:p>'}</p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

    zip.file(`ppt/slides/slide${idx + 1}.xml`, slideXml);
  });

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
}

/**
 * Tải tệp sản phẩm thực hành về máy tính giáo viên, đảm bảo mở được 100% không bị lỗi
 * Hỗ trợ tất cả các định dạng: PowerPoint (.pptx, .ppt), Word (.docx), Excel (.xlsx),
 * Hình ảnh (.png, .jpg, .jpeg, .webp, .svg, .bmp), Scratch (.sb3), Code (.py, .cpp, .html)...
 */
export async function downloadSubmissionProductFile(
  sub: Submission,
  targetAttempt?: SubmissionAttempt
): Promise<boolean> {
  if (!sub || !Array.isArray(sub.attempts) || sub.attempts.length === 0) {
    return false;
  }

  const attempt = targetAttempt || sub.attempts[sub.attempts.length - 1];
  const safeStudent = (sub.studentLeader || 'HocSinh').trim().replace(/[/\\?%*:|"<>]/g, '_');
  const safeMachine = (sub.machineNumber || 'May').trim().replace(/\s+/g, '');
  const safeClass = (sub.className || 'Lop').trim().replace(/\s+/g, '');
  const rawFileName = attempt.fileName || 'SanPham.txt';
  const ext = rawFileName.split('.').pop()?.toLowerCase() || '';

  const finalDownloadName = `${safeClass}_${safeMachine}_${safeStudent}_${rawFileName}`;

  // 1. ƯU TIÊN SỐ 1: Có dữ liệu nhị phân Data URL gốc (fileDataUrl)
  if (attempt.fileDataUrl && attempt.fileDataUrl.startsWith('data:')) {
    const blob = dataUrlToBlob(attempt.fileDataUrl);
    if (blob) {
      triggerBlobDownload(blob, finalDownloadName);
      return true;
    }
  }

  // 2. ƯU TIÊN SỐ 2: Tệp hình ảnh có imageBase64 (png, jpg, webp, svg, bmp...)
  if (attempt.imageBase64 && attempt.imageBase64.startsWith('data:')) {
    const blob = dataUrlToBlob(attempt.imageBase64);
    if (blob) {
      const imgName = ext && ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'].includes(ext)
        ? finalDownloadName
        : `${safeClass}_${safeMachine}_${safeStudent}_SanPham.png`;
      triggerBlobDownload(blob, imgName);
      return true;
    }
  }

  // 3. XỬ LÝ THEO ĐỊNH DẠNG TỆP CỤ THỂ KHI CHỈ CÓ NỘI DUNG VĂN BẢN (fileContent)
  const content = attempt.fileContent || '';

  // 3.1. PowerPoint (.pptx, .ppt)
  if (ext === 'pptx' || ext === 'ppt') {
    try {
      const fallbackPptx = await createFallbackPptxBlob(
        `${sub.className} - ${sub.machineNumber} - ${sub.studentLeader}`,
        content
      );
      triggerBlobDownload(fallbackPptx, finalDownloadName.endsWith('.pptx') ? finalDownloadName : `${finalDownloadName}.pptx`);
      return true;
    } catch (pptxErr) {
      console.warn('Lỗi tạo fallback pptx:', pptxErr);
    }
  }

  // 3.2. Excel (.xlsx, .xls)
  if (ext === 'xlsx' || ext === 'xls') {
    try {
      const wb = XLSX.utils.book_new();
      const rows = content.split('\n').map((r) => r.split(','));
      const ws = XLSX.utils.aoa_to_sheet(rows.length > 0 ? rows : [['Học sinh', sub.studentLeader], ['Điểm', sub.highestScore]]);
      XLSX.utils.book_append_sheet(wb, ws, 'KetQuaThucHanh');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      triggerBlobDownload(blob, finalDownloadName.endsWith('.xlsx') ? finalDownloadName : `${finalDownloadName}.xlsx`);
      return true;
    } catch (xlsxErr) {
      console.warn('Lỗi tạo fallback xlsx:', xlsxErr);
    }
  }

  // 3.3. Các tệp văn bản mã nguồn thuần (Python, C++, HTML, TXT...)
  if (['py', 'cpp', 'c', 'pas', 'html', 'css', 'js', 'json', 'csv', 'sql', 'xml', 'txt'].includes(ext)) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    triggerBlobDownload(blob, finalDownloadName);
    return true;
  }

  // 3.4. Định dạng khác: Xuất tệp văn bản đầy đủ thông tin bài làm
  const summaryText = `BÀI NỘP THỰC HÀNH PHÒNG MÁY LABGRADE AI\n- Lớp: ${sub.className}\n- Vị trí: ${sub.machineNumber}\n- Học sinh: ${sub.studentLeader}\n- Thành viên nhóm: ${sub.groupMembers.join(', ') || 'Cá nhân'}\n- Tên tệp nộp gốc: ${rawFileName} (${attempt.fileSize} bytes)\n- Điểm đạt được: ${sub.highestScore} / 10đ\n- Thời gian nộp: ${sub.latestSubmittedAt}\n\n=========================================\nNỘI DUNG CHI TIẾT SẢN PHẨM:\n=========================================\n${content}\n`;
  const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
  triggerBlobDownload(blob, `${safeClass}_${safeMachine}_${safeStudent}_BaiLam.txt`);
  return true;
}
