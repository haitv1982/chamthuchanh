import { Assignment } from '../types';

export const GRADE_6_PRODUCTS: Assignment[] = [
  {
    id: 'sp01-so-do-xu-li-thong-tin',
    title: 'SP01. Sơ đồ quy trình xử lí thông tin',
    gradeLevel: 'Lớp 6',
    subjectType: 'powerpoint',
    durationMinutes: 45,
    description: 'Học sinh hiểu các hoạt động xử lí thông tin và biết trình bày bằng sơ đồ.',
    toolRequired: 'PowerPoint, Word, Canva hoặc công cụ vẽ có sẵn trên máy tính.',
    targetFile: 'SP01_SoDoXuLiThongTin.png',
    requirements: [
      'Có đủ 4 hoạt động: Thu nhận thông tin → Xử lí thông tin → Lưu trữ thông tin → Truyền thông tin',
      'Mũi tên chỉ đúng trình tự quy trình',
      'Có tiêu đề “QUY TRÌNH XỬ LÍ THÔNG TIN” rõ ràng',
      'Bố cục dễ nhìn, màu sắc tương phản hợp lý và có ví dụ minh họa',
      'Xuất hoặc chụp ảnh đúng tên tệp SP01_SoDoXuLiThongTin.png'
    ],
    steps: [
      'Mở PowerPoint, tạo trang trình chiếu trống.',
      'Chọn Insert (Chèn) → Shapes (Hình dạng).',
      'Chọn hình chữ nhật hoặc hình chữ nhật bo góc, vẽ 4 ô.',
      'Ghi lần lượt: Thu nhận thông tin → Xử lí thông tin → Lưu trữ thông tin → Truyền thông tin.',
      'Chọn Insert → Shapes → Arrow để nối các ô theo thứ tự.',
      'Thêm tiêu đề “QUY TRÌNH XỬ LÍ THÔNG TIN”.',
      'Chỉnh màu sắc, kích thước chữ và căn chỉnh các ô cho dễ đọc.',
      'Lưu tệp PowerPoint; xuất thêm thành ảnh PNG hoặc chụp màn hình nộp.'
    ],
    acceptanceCriteria: 'Có đủ 4 hoạt động, mũi tên đúng trình tự, bố cục dễ nhìn và có ví dụ minh họa.',
    expectedOutput: 'Ảnh sơ đồ 4 khối có mũi tên nối đúng thứ tự với tiêu đề "QUY TRÌNH XỬ LÍ THÔNG TIN".',
    sampleProduct: {
      fileName: 'SP01_SoDoXuLiThongTin.png',
      notes: 'Sơ đồ chuẩn 4 khối: Thu nhận -> Xử lí -> Lưu trữ -> Truyền thông tin kèm mũi tên.',
      content: 'QUY TRÌNH XỬ LÍ THÔNG TIN\n[Thu nhận thông tin] ---> [Xử lí thông tin] ---> [Lưu trữ thông tin] ---> [Truyền thông tin]\nVí dụ minh họa: Đọc sách (thu nhận) -> Suy nghĩ (xử lí) -> Ghi nhớ/Ghi chép (lưu trữ) -> Chia sẻ với bạn (truyền thông tin)'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 4 hoạt động xử lí thông tin', description: 'Thu nhận, Xử lí, Lưu trữ, Truyền thông tin', maxScore: 3.5 },
      { id: 'r2', name: 'Mũi tên liên kết & Chiều quy trình', description: 'Mũi tên đúng chiều từ thu nhận đến truyền thông tin', maxScore: 2.5 },
      { id: 'r3', name: 'Tiêu đề & Ví dụ minh họa', description: 'Tiêu đề rõ ràng, có bổ sung ví dụ thực tế minh họa', maxScore: 2.0 },
      { id: 'r4', name: 'Thẩm mỹ & Đặt tên tệp nộp', description: 'Màu sắc dễ đọc, định dạng ảnh rõ nét', maxScore: 2.0 }
    ],
    createdAt: '2026-10-09T07:00:00Z',
    isActive: true
  },
  {
    id: 'sp02-to-chuc-thu-muc',
    title: 'SP02. Tổ chức thư mục học tập',
    gradeLevel: 'Lớp 6',
    subjectType: 'system',
    durationMinutes: 45,
    description: 'Biết tạo thư mục, thư mục con, đổi tên và quản lí tệp.',
    toolRequired: 'File Explorer trên Windows.',
    targetFile: 'SP02_ThuMucHocTap.png',
    requirements: [
      'Tạo thư mục chính tên TINHOC6 tại Documents hoặc vị trí quy định',
      'Tạo đủ 4 thư mục con: BaiTap, HinhAnh, VanBan, SanPham',
      'Trong thư mục VanBan có tạo tệp GioiThieu.txt',
      'Tên thư mục rõ ràng, không dấu hoặc tiếng Việt chuẩn, không trùng lặp',
      'Chụp ảnh cửa sổ File Explorer thể hiện cấu trúc cây thư mục lưu vào SanPham'
    ],
    steps: [
      'Mở File Explorer bằng tổ hợp phím Windows + E.',
      'Chọn Documents hoặc vị trí lưu bài được giáo viên chỉ định.',
      'Nhấn chuột phải vào vùng trống → New → Folder.',
      'Đặt tên thư mục chính là TINHOC6.',
      'Mở thư mục vừa tạo, tạo 4 thư mục con: BaiTap, HinhAnh, VanBan, SanPham.',
      'Mở thư mục VanBan, tạo một tệp văn bản và đặt tên GioiThieu.txt nếu máy có Notepad.',
      'Kiểm tra tên các thư mục, tránh đặt tên khó hiểu hoặc trùng lặp.',
      'Chụp ảnh cửa sổ File Explorer thể hiện cấu trúc thư mục.',
      'Lưu ảnh vào thư mục SanPham và nộp ảnh lên hệ thống.'
    ],
    acceptanceCriteria: 'Có đủ thư mục chính và thư mục con, tên rõ ràng, tệp nằm đúng vị trí.',
    expectedOutput: 'Ảnh chụp màn hình File Explorer thấy rõ thư mục TINHOC6 với 4 thư mục con BaiTap, HinhAnh, VanBan, SanPham và tệp GioiThieu.txt.',
    sampleProduct: {
      fileName: 'SP02_ThuMucHocTap.png',
      notes: 'Ảnh cấu trúc cây thư mục chuẩn: TINHOC6 > [BaiTap, HinhAnh, SanPham, VanBan > GioiThieu.txt]',
      content: 'Documents/TINHOC6/\n├── BaiTap/\n├── HinhAnh/\n├── SanPham/\n└── VanBan/\n    └── GioiThieu.txt'
    },
    rubric: [
      { id: 'r1', name: 'Thư mục chính TINHOC6', description: 'Tạo đúng vị trí và đặt tên chính xác', maxScore: 2.5 },
      { id: 'r2', name: 'Đủ 4 thư mục con', description: 'BaiTap, HinhAnh, VanBan, SanPham', maxScore: 3.5 },
      { id: 'r3', name: 'Tệp văn bản GioiThieu.txt', description: 'Tệp nằm đúng trong thư mục VanBan', maxScore: 2.0 },
      { id: 'r4', name: 'Ảnh minh chứng rõ nét', description: 'Chụp rõ thanh đường dẫn và các thư mục', maxScore: 2.0 }
    ],
    createdAt: '2026-10-09T07:01:00Z',
    isActive: true
  },
  {
    id: 'sp03-so-do-mang-may-tinh',
    title: 'SP03. Vẽ sơ đồ mạng máy tính',
    gradeLevel: 'Lớp 6',
    subjectType: 'powerpoint',
    durationMinutes: 45,
    description: 'Hiểu các thành phần của mạng máy tính và vẽ sơ đồ kết nối mạng có dây / không dây.',
    toolRequired: 'PowerPoint hoặc Word.',
    targetFile: 'SP03_SoDoMang.pptx',
    requirements: [
      'Có ít nhất 4 thiết bị hoặc thành phần: Máy tính, Laptop, Máy tính bảng, Máy in...',
      'Có thiết bị trung tâm: “Bộ định tuyến Wi-Fi” (Router)',
      'Có biểu tượng đám mây kết nối “Internet” ra bên ngoài',
      'Dùng đường nối/mũi tên thể hiện kết nối và có chú thích dễ hiểu',
      'Bố cục cân đối, lưu tệp SP03_SoDoMang.pptx hoặc ảnh chụp PNG'
    ],
    steps: [
      'Mở PowerPoint và tạo một trang trống.',
      'Tạo một hình ở giữa, ghi “Bộ định tuyến Wi-Fi”.',
      'Tạo xung quanh các hình ghi “Máy tính”, “Laptop”, “Máy tính bảng”, “Máy in”.',
      'Dùng đường nối hoặc mũi tên để nối các thiết bị với bộ định tuyến.',
      'Thêm biểu tượng đám mây và ghi “Internet”.',
      'Nối bộ định tuyến với Internet để thể hiện kết nối ra bên ngoài.',
      'Thêm chú thích cho từng thành phần.',
      'Sắp xếp sơ đồ cân đối và lưu tệp.'
    ],
    acceptanceCriteria: 'Có ít nhất 4 thiết bị hoặc thành phần, thể hiện được kết nối và ghi chú dễ hiểu.',
    expectedOutput: 'Sơ đồ mạng gồm Router ở giữa nối Internet và tỏa ra ít nhất 4 thiết bị đầu cuối.',
    sampleProduct: {
      fileName: 'SP03_SoDoMang.pptx',
      notes: 'Mô hình mạng sao có Router Wifi ở giữa nối Internet và 4 thiết bị đầu cuối.',
      content: '[Internet] <---> [Bộ định tuyến Wi-Fi] <---> [Máy tính để bàn, Laptop, Máy tính bảng, Máy in]'
    },
    rubric: [
      { id: 'r1', name: 'Đủ thiết bị đầu cuối', description: 'Ít nhất 4 thiết bị: PC, Laptop, Tablet, Máy in', maxScore: 3.0 },
      { id: 'r2', name: 'Thiết bị trung tâm & Internet', description: 'Có Router Wi-Fi và đám mây Internet', maxScore: 3.0 },
      { id: 'r3', name: 'Đường truyền kết nối', description: 'Đường nối chính xác giữa thiết bị và router', maxScore: 2.0 },
      { id: 'r4', name: 'Chú thích & Bố cục thẩm mỹ', description: 'Rõ ràng, cân đối, màu sắc hài hòa', maxScore: 2.0 }
    ],
    createdAt: '2026-10-09T07:02:00Z',
    isActive: true
  },
  {
    id: 'sp04-poster-internet-an-toan',
    title: 'SP04. Poster sử dụng Internet an toàn',
    gradeLevel: 'Lớp 6',
    subjectType: 'canva',
    durationMinutes: 45,
    description: 'Thiết kế ấn phẩm tuyên truyền 5 nguyên tắc vàng khi tham gia không gian mạng.',
    toolRequired: 'PowerPoint, Canva hoặc Word.',
    targetFile: 'SP04_InternetAnToan.png',
    requirements: [
      'Có tiêu đề: “5 NGUYÊN TẮC SỬ DỤNG INTERNET AN TOÀN”',
      'Đủ 5 nguyên tắc: 1. Không chia sẻ mật khẩu; 2. Không công khai thông tin cá nhân; 3. Không tùy tiện mở liên kết lạ; 4. Kiểm tra thông tin trước khi chia sẻ; 5. Báo người lớn khi gặp nguy hiểm',
      'Có biểu tượng / icon minh họa phù hợp cho mỗi nguyên tắc',
      'Màu sắc tương phản, chữ đủ lớn, không lỗi chính tả',
      'Xuất poster thành ảnh PNG hoặc PDF'
    ],
    steps: [
      'Tạo trang trình chiếu có bố cục dọc hoặc khổ A4.',
      'Đặt tiêu đề: “5 NGUYÊN TẮC SỬ DỤNG INTERNET AN TOÀN”.',
      'Thêm 5 nguyên tắc:\n  1. Không chia sẻ mật khẩu.\n  2. Không công khai thông tin cá nhân.\n  3. Không tùy tiện mở liên kết lạ.\n  4. Kiểm tra thông tin trước khi chia sẻ.\n  5. Báo người lớn đáng tin cậy khi gặp nội dung nguy hiểm.',
      'Chèn biểu tượng minh họa phù hợp cho mỗi nguyên tắc.',
      'Dùng màu sắc tương phản, chữ đủ lớn.',
      'Kiểm tra chính tả và căn chỉnh.',
      'Xuất poster thành ảnh PNG hoặc PDF.'
    ],
    acceptanceCriteria: 'Có đủ 5 nguyên tắc, nội dung đúng, hình minh họa phù hợp và chữ dễ đọc.',
    expectedOutput: 'Poster A4/dọc chứa đầy đủ 5 nguyên tắc an toàn mạng kèm icon minh họa bắt mắt.',
    sampleProduct: {
      fileName: 'SP04_InternetAnToan.png',
      notes: 'Poster tuyên truyền an toàn thông tin với 5 nguyên tắc rõ ràng.',
      content: '5 NGUYÊN TẮC SỬ DỤNG INTERNET AN TOÀN:\n1. Bảo mật mật khẩu tuyệt đối\n2. Giữ kín thông tin cá nhân\n3. Cảnh giác liên kết lạ & tệp đính kèm\n4. Xác thực thông tin trước khi chia sẻ\n5. Báo người lớn khi gặp nguy hiểm'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 5 nguyên tắc an toàn', description: 'Nội dung chính xác theo chuẩn SGK', maxScore: 4.0 },
      { id: 'r2', name: 'Hình ảnh / Biểu tượng minh họa', description: 'Có icon/ảnh phù hợp cho từng nguyên tắc', maxScore: 2.5 },
      { id: 'r3', name: 'Màu sắc & Phông chữ', description: 'Độ tương phản cao, chữ to rõ ràng, không lỗi chính tả', maxScore: 2.0 },
      { id: 'r4', name: 'Bố cục & Định dạng xuất tệp', description: 'Khổ dọc cân đối, xuất đúng tệp PNG/PDF', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T07:03:00Z',
    isActive: true
  },
  {
    id: 'sp05-phieu-thuc-hanh-tim-kiem',
    title: 'SP05. Phiếu thực hành tìm kiếm thông tin',
    gradeLevel: 'Lớp 6',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Rèn luyện kĩ năng tìm kiếm thông tin trên Internet, chọn lọc và đánh giá độ tin cậy.',
    toolRequired: 'Trình duyệt web và Word.',
    targetFile: 'SP05_PhieuTimKiem.docx',
    requirements: [
      'Có đủ 3 từ khóa tìm kiếm (ví dụ: lợi ích đọc sách, bảo vệ môi trường...)',
      'Tạo bảng trong Word với 5 cột: Từ khóa, Nguồn, Đường dẫn (URL), Nội dung tìm được, Đánh giá nguồn',
      'Đường dẫn kiểm tra được, tóm tắt 2-3 ý chính bằng lời của mình, không sao chép nguyên bài',
      'Kiểm tra tác giả, ngày đăng và độ tin cậy',
      'Lưu ý: Không ghi mật khẩu hoặc thông tin cá nhân vào phiếu'
    ],
    steps: [
      'Mở trình duyệt, truy cập công cụ tìm kiếm (Google, Bing...).',
      'Tìm từ khóa thứ nhất, ví dụ: lợi ích của việc đọc sách.',
      'Ghi tên trang web, tiêu đề bài viết và đường dẫn.',
      'Tìm thêm hai chủ đề do giáo viên giao.',
      'So sánh thông tin từ ít nhất hai nguồn nếu nhiệm vụ yêu cầu.',
      'Ghi lại 2–3 ý chính bằng lời của mình, không sao chép nguyên bài.',
      'Kiểm tra tác giả, ngày đăng và độ tin cậy của nguồn khi có thông tin.',
      'Mở Word, tạo bảng với các cột: Từ khóa, Nguồn, Đường dẫn, Nội dung tìm được, Đánh giá nguồn.',
      'Lưu thành SP05_PhieuTimKiem.docx.'
    ],
    acceptanceCriteria: 'Có đủ 3 từ khóa, nguồn và đường dẫn kiểm tra được, nội dung tóm tắt đúng chủ đề.',
    note: 'Không ghi mật khẩu hoặc thông tin cá nhân vào phiếu thực hành.',
    expectedOutput: 'Tệp Word hoặc ảnh chụp bảng 5 cột có 3 dòng dữ liệu tìm kiếm kèm đánh giá nguồn.',
    sampleProduct: {
      fileName: 'SP05_PhieuTimKiem.docx',
      notes: 'Bảng tổng hợp tìm kiếm thông tin gồm 5 cột và 3 chủ đề.',
      content: '| Từ khóa | Nguồn | Đường dẫn | Nội dung tìm được | Đánh giá nguồn |\n| Lợi ích đọc sách | Báo Tuổi Trẻ | tuoitre.vn/... | Mở rộng tri thức, rèn luyện tập trung | Nguồn báo chính thống uy tín |\n| Ô nhiễm rác nhựa | Cổng TT Bộ TN&MT | monre.gov.vn/... | Tác hại của túi ni lông và rác thải nhựa | Nguồn cơ quan nhà nước rất tin cậy |\n| Sử dụng máy tính | Báo Giáo dục | giaoduc.net.vn/... | Tư thế ngồi học đúng và thời gian nghỉ | Nguồn tư vấn chuyên gia giáo dục |'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 3 từ khóa & nguồn thông tin', description: 'Ghi rõ từ khóa và tên nguồn chính thống', maxScore: 3.5 },
      { id: 'r2', name: 'Đường dẫn & Kiểm tra độ tin cậy', description: 'Đường dẫn URL cụ thể, có nhận xét nguồn', maxScore: 2.5 },
      { id: 'r3', name: 'Nội dung tóm tắt', description: 'Tóm tắt 2-3 ý bằng lời của mình, không sao chép nguyên xi', maxScore: 2.5 },
      { id: 'r4', name: 'Cấu trúc bảng Word & Định dạng', description: 'Bảng biểu ngay ngắn, lưu đúng tên tệp', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T07:04:00Z',
    isActive: true
  },
  {
    id: 'sp06-soan-thu-dien-tu',
    title: 'SP06. Soạn thư điện tử',
    gradeLevel: 'Lớp 6',
    subjectType: 'other',
    durationMinutes: 45,
    description: 'Biết cách đăng nhập hòm thư điện tử, soạn thư đúng quy cách, đính kèm tệp và ứng xử văn minh.',
    toolRequired: 'Dịch vụ email được giáo viên cho phép (Gmail, Outlook hoặc mô phỏng).',
    targetFile: 'SP06_SoanThuDienTu.png',
    requirements: [
      'Đầy đủ địa chỉ người nhận do giáo viên cung cấp',
      'Tiêu đề đúng cú pháp: Bài thực hành Tin học 6 - Họ và tên',
      'Nội dung thư lịch sự: gồm lời chào, mục đích gửi thư, nội dung chính và lời kết/chữ ký',
      'Đính kèm tệp sản phẩm nếu được yêu cầu',
      'Lưu thư nháp và chụp ảnh minh chứng giao diện soạn thư'
    ],
    steps: [
      'Đăng nhập tài khoản email của mình theo hướng dẫn của nhà trường.',
      'Nhấn Soạn thư / Compose.',
      'Nhập địa chỉ người nhận do giáo viên cung cấp.',
      'Nhập tiêu đề: Bài thực hành Tin học 6 - Họ và tên.',
      'Soạn nội dung lịch sự, gồm lời chào, mục đích gửi thư, nội dung chính và lời kết.',
      'Đính kèm tệp sản phẩm nếu được yêu cầu.',
      'Kiểm tra địa chỉ người nhận, tiêu đề, nội dung và tệp đính kèm.',
      'Nếu bài chỉ yêu cầu soạn thư, lưu thư nháp và chụp ảnh minh chứng. Chỉ gửi thư khi giáo viên yêu cầu.'
    ],
    acceptanceCriteria: 'Đủ người nhận, tiêu đề, nội dung, văn phong phù hợp và tệp đính kèm đúng nếu có.',
    expectedOutput: 'Ảnh chụp màn hình cửa sổ Soạn thư với To, Subject, Body đầy đủ 4 phần và tệp đính kèm.',
    sampleProduct: {
      fileName: 'SP06_SoanThuDienTu.png',
      notes: 'Thư điện tử chuẩn mực: Kính gửi thầy cô -> Giới thiệu mục đích -> Nội dung báo cáo -> Lời chúc & Chữ ký.',
      content: 'Người nhận: giaovien.tinhoc@truong.edu.vn\nTiêu đề: Bài thực hành Tin học 6 - Nguyễn Hoàng Long 6A2\nNội dung:\nKính gửi Thầy/Cô giáo bộ môn Tin học,\nEm tên là Nguyễn Hoàng Long, học sinh lớp 6A2.\nEm xin phép gửi thầy cô bài thực hành môn Tin học đính kèm bên dưới.\nKính chúc thầy cô luôn dồi dào sức khỏe và công tác tốt.\nHọc sinh: Nguyễn Hoàng Long - Lớp 6A2\n[Tệp đính kèm: BaiThucHanh_Long.docx (18 KB)]'
    },
    rubric: [
      { id: 'r1', name: 'Người nhận & Tiêu đề thư', description: 'Đúng địa chỉ và đúng cú pháp tiêu đề', maxScore: 3.0 },
      { id: 'r2', name: 'Nội dung thư 4 phần', description: 'Lời chào, mục đích, nội dung chính, lời kết', maxScore: 3.5 },
      { id: 'r3', name: 'Văn phong giao tiếp lịch sự', description: 'Kính gửi, tôn trọng, xưng hô đúng mực', maxScore: 2.0 },
      { id: 'r4', name: 'Tệp đính kèm & Ảnh minh chứng', description: 'Có tệp đính kèm và ảnh chụp rõ ràng', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T07:05:00Z',
    isActive: true
  },
  {
    id: 'sp07-cam-nang-cong-dan-so',
    title: 'SP07. Cẩm nang công dân số',
    gradeLevel: 'Lớp 6',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Tổng hợp các quy tắc đạo đức, pháp luật và văn hóa ứng xử trong môi trường số.',
    toolRequired: 'Word hoặc PowerPoint.',
    targetFile: 'SP07_CamNangCongDanSo.docx',
    requirements: [
      'Tiêu đề nổi bật: “CẨM NANG CÔNG DÂN SỐ”',
      'Đủ 5 mục: 1. Ứng xử văn minh; 2. Bảo vệ thông tin cá nhân; 3. Bảo vệ tài khoản; 4. Tôn trọng bản quyền; 5. Xử lí tình huống nguy hiểm',
      'Mỗi mục có ít nhất 1 quy tắc và 1 ví dụ thực tế',
      'Chèn biểu tượng/hình minh họa, ghi nguồn khi cần',
      'Định dạng tiêu đề và các mục thống nhất, lưu thành .docx, .pptx hoặc PDF'
    ],
    steps: [
      'Tạo tài liệu mới trong Word hoặc PowerPoint.',
      'Đặt tiêu đề “CẨM NANG CÔNG DÂN SỐ”.',
      'Chia nội dung thành 5 mục: ứng xử văn minh, bảo vệ thông tin cá nhân, bảo vệ tài khoản, tôn trọng bản quyền, xử lí tình huống nguy hiểm.',
      'Viết ít nhất một quy tắc và một ví dụ cho mỗi mục.',
      'Chèn biểu tượng hoặc hình minh họa.',
      'Ghi nguồn hình ảnh sử dụng khi cần.',
      'Định dạng tiêu đề và các mục thống nhất.',
      'Lưu thành SP07_CamNangCongDanSo.docx hoặc PDF.'
    ],
    acceptanceCriteria: 'Có đủ 5 mục, ví dụ thực tế, thông tin chính xác và trình bày rõ ràng.',
    expectedOutput: 'Cẩm nang 5 mục có quy tắc, ví dụ và hình ảnh minh họa bố cục hài hòa.',
    sampleProduct: {
      fileName: 'SP07_CamNangCongDanSo.docx',
      notes: 'Tài liệu cẩm nang 5 mục đầy đủ quy tắc và ví dụ đời sống học sinh.',
      content: 'CẨM NANG CÔNG DÂN SỐ\n1. Ứng xử văn minh: Không bình luận xúc phạm. VD: Lịch sự khi chat nhóm học tập.\n2. Bảo vệ thông tin cá nhân: Không đăng CCCD/địa chỉ. VD: Che thông tin khi chụp ảnh thẻ HS.\n3. Bảo vệ tài khoản: Mật khẩu mạnh >8 ký tự. VD: Dùng chữ hoa, số và ký tự đặc biệt.\n4. Tôn trọng bản quyền: Không sao chép lậu. VD: Ghi rõ tác giả tranh ảnh lấy trên mạng.\n5. Xử lí tình huống nguy hiểm: Báo cha mẹ/thầy cô khi bị đe dọa hoặc gặp tin xấu độc.'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 5 mục công dân số', description: 'Ứng xử, thông tin, tài khoản, bản quyền, nguy hiểm', maxScore: 4.0 },
      { id: 'r2', name: 'Ví dụ thực tế cho mỗi mục', description: 'Ví dụ sát thực tế học sinh THCS', maxScore: 3.0 },
      { id: 'r3', name: 'Hình ảnh minh họa & Ghi nguồn', description: 'Hình ảnh phù hợp, chú thích nguồn', maxScore: 1.5 },
      { id: 'r4', name: 'Định dạng & Trình bày văn bản', description: 'Tiêu đề to rõ, thụt dòng cân đối', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T07:06:00Z',
    isActive: true
  },
  {
    id: 'sp08-van-ban-gioi-thieu',
    title: 'SP08. Văn bản giới thiệu bản thân hoặc trường em',
    gradeLevel: 'Lớp 6',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Soạn thảo và định dạng văn bản cơ bản: phông chữ, cỡ chữ, căn lề, chèn hình ảnh.',
    toolRequired: 'Microsoft Word hoặc trình soạn thảo văn bản tương đương.',
    targetFile: 'SP08_GioiThieu.docx',
    requirements: [
      'Tiêu đề: “GIỚI THIỆU VỀ TRƯỜNG EM” hoặc “GIỚI THIỆU BẢN THÂN” in đậm, cỡ chữ lớn',
      'Đủ 3 đoạn văn: Thông tin chung, Các hoạt động nổi bật, Cảm nghĩ của em',
      'Phông chữ dễ đọc (Times New Roman / Arial / Calibri), cỡ chữ 13-14 thống nhất',
      'Căn lề justified hoặc căn đều, giãn đoạn hợp lý',
      'Chèn 1 hình ảnh minh họa phù hợp, không có lỗi chính tả'
    ],
    steps: [
      'Mở Word → Blank document.',
      'Gõ tiêu đề: “GIỚI THIỆU VỀ TRƯỜNG EM”.',
      'Viết 3 đoạn: thông tin chung, các hoạt động nổi bật, cảm nghĩ của em.',
      'Bôi đen tiêu đề, chọn cỡ chữ lớn hơn nội dung và in đậm.',
      'Chọn nội dung chính, đặt phông chữ dễ đọc và cỡ chữ thống nhất.',
      'Căn lề, giãn đoạn và xuống dòng hợp lí.',
      'Chèn một hình ảnh phù hợp nếu đề bài yêu cầu.',
      'Kiểm tra chính tả.',
      'Chọn File → Save As và lưu đúng tên tệp SP08_GioiThieu.docx.'
    ],
    acceptanceCriteria: 'Có tiêu đề, đủ 3 đoạn, định dạng thống nhất và không có lỗi chính tả nghiêm trọng.',
    expectedOutput: 'Văn bản Word hoàn chỉnh gồm tiêu đề in đậm, 3 đoạn văn rõ ràng và ảnh chèn ngay ngắn.',
    sampleProduct: {
      fileName: 'SP08_GioiThieu.docx',
      notes: 'Văn bản Word chuẩn: tiêu đề 18pt in đậm căn giữa, nội dung 14pt căn đều hai bên.',
      content: 'GIỚI THIỆU VỀ TRƯỜNG EM\nTrường THCS thân yêu của chúng em tọa lạc tại vị trí khang trang, sạch đẹp. Ngôi trường có lịch sử lâu đời với nhiều thế hệ học sinh chăm ngoan, học giỏi...\nTại trường, chúng em được tham gia nhiều hoạt động bổ ích như Hội khỏe Phù Đổng, câu lạc bộ Tin học, ngày hội Stem sáng tạo...\nEm rất tự hào về ngôi trường của mình và quyết tâm học tập thật tốt để xứng đáng với truyền thống của trường.'
    },
    rubric: [
      { id: 'r1', name: 'Đủ cấu trúc 3 đoạn văn', description: 'Thông tin chung, hoạt động, cảm nghĩ', maxScore: 3.5 },
      { id: 'r2', name: 'Định dạng tiêu đề & Phông chữ', description: 'Tiêu đề to đậm, nội dung thống nhất phông cỡ chữ', maxScore: 2.5 },
      { id: 'r3', name: 'Chèn hình ảnh & Căn lề', description: 'Ảnh minh họa cân đối, căn lề văn bản chuẩn', maxScore: 2.0 },
      { id: 'r4', name: 'Chính tả & Tên tệp nộp', description: 'Không mắc lỗi chính tả tiếng Việt', maxScore: 2.0 }
    ],
    createdAt: '2026-10-09T07:07:00Z',
    isActive: true
  },
  {
    id: 'sp09-tao-bang-thoi-khoa-bieu',
    title: 'SP09. Tạo bảng thời khóa biểu',
    gradeLevel: 'Lớp 6',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Kĩ năng chèn bảng (Table), nhập dữ liệu, định dạng cột, hàng và kẻ viền trong Word.',
    toolRequired: 'Word.',
    targetFile: 'SP09_ThoiKhoaBieu.docx',
    requirements: [
      'Tiêu đề nổi bật: “THỜI KHÓA BIỂU CỦA EM”',
      'Bảng gồm đúng 6 cột: Tiết, Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu',
      'Số hàng phù hợp: 6 hàng (1 hàng tiêu đề + 5 tiết học)',
      'Hàng đầu tiên in đậm và căn giữa',
      'Độ rộng cột cân đối, đường viền bảng rõ ràng, dữ liệu chính xác'
    ],
    steps: [
      'Tạo tài liệu mới trong Word.',
      'Gõ tiêu đề “THỜI KHÓA BIỂU CỦA EM”.',
      'Chọn Insert → Table.',
      'Tạo bảng gồm 6 cột: Tiết, Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu.',
      'Tạo số hàng phù hợp, chẳng hạn 6 hàng gồm hàng tiêu đề và 5 tiết.',
      'Nhập tên các môn học theo dữ liệu giáo viên cung cấp.',
      'Bôi đen hàng đầu, in đậm và căn giữa.',
      'Điều chỉnh độ rộng cột và đường viền bảng.',
      'Lưu thành SP09_ThoiKhoaBieu.docx.'
    ],
    acceptanceCriteria: 'Đúng số cột và hàng, dữ liệu chính xác, trình bày dễ đọc.',
    expectedOutput: 'Bảng thời khóa biểu 6 cột x 6 hàng căn giữa tiêu đề, kẻ khung rõ nét.',
    sampleProduct: {
      fileName: 'SP09_ThoiKhoaBieu.docx',
      notes: 'Bảng TKB 6 cột x 6 hàng hoàn chỉnh.',
      content: '| Tiết | Thứ Hai | Thứ Ba | Thứ Tư | Thứ Năm | Thứ Sáu |\n| 1 | Chào cờ | Toán | Ngữ văn | Tiếng Anh | Tin học |\n| 2 | Toán | Ngữ văn | Lịch sử | KHTN | GDCD |\n| 3 | Ngữ văn | KHTN | Tiếng Anh | Toán | Thể dục |\n| 4 | KHTN | Tin học | Địa lí | Âm nhạc | Công nghệ |\n| 5 | SHL | Tiếng Anh | GDQP | Mỹ thuật | SHCN |'
    },
    rubric: [
      { id: 'r1', name: 'Cấu trúc bảng 6 cột x 6 hàng', description: 'Đủ các cột thứ trong tuần và các tiết học', maxScore: 4.0 },
      { id: 'r2', name: 'Định dạng hàng tiêu đề', description: 'In đậm, căn giữa, màu nền phân biệt', maxScore: 2.5 },
      { id: 'r3', name: 'Đường viền & Độ rộng cột', description: 'Kẻ khung bảng đẹp mắt, độ rộng hợp lý', maxScore: 2.0 },
      { id: 'r4', name: 'Dữ liệu môn học & Lưu tệp', description: 'Nhập đầy đủ môn học, lưu đúng tệp', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T07:08:00Z',
    isActive: true
  },
  {
    id: 'sp10-tim-kiem-va-thay-the',
    title: 'SP10. Thực hành tìm kiếm và thay thế văn bản',
    gradeLevel: 'Lớp 6',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Sử dụng công cụ Find & Replace (Ctrl + H) để tìm và thay thế cụm từ nhanh chóng.',
    toolRequired: 'Word.',
    targetFile: 'SP10_ThayTheVanBan.png',
    requirements: [
      'Sử dụng chức năng Ctrl + H (Find and Replace)',
      'Nhập đúng cụm từ cần tìm vào Find what và cụm từ thay thế vào Replace with',
      'Thay thế chính xác các vị trí mà không làm thay đổi sai nghĩa câu',
      'Lưu thành tệp mới, không ghi đè tệp gốc',
      'Chụp ảnh màn hình hộp thoại hoặc kết quả văn bản sau khi thay thế'
    ],
    steps: [
      'Mở tệp văn bản mẫu do giáo viên cung cấp.',
      'Nhấn Ctrl + H để mở chức năng Find and Replace.',
      'Nhập cụm từ cần tìm vào ô Find what.',
      'Nhập cụm từ thay thế vào ô Replace with.',
      'Chọn Replace để thay từng vị trí hoặc Replace All khi giáo viên yêu cầu thay toàn bộ.',
      'Kiểm tra lại các vị trí đã thay để tránh làm sai nghĩa.',
      'Chọn Save As để lưu thành tệp mới, không ghi đè tệp mẫu.',
      'Chụp ảnh màn hình kết quả sau khi thay thế và nộp ảnh minh chứng.'
    ],
    acceptanceCriteria: 'Thay đúng cụm từ, không bỏ sót vị trí theo yêu cầu và lưu được tệp kết quả.',
    expectedOutput: 'Ảnh chụp màn hình thể hiện kết quả thông báo Replace đã thay thế các cụm từ yêu cầu.',
    sampleProduct: {
      fileName: 'SP10_ThayTheVanBan.png',
      notes: 'Ảnh chụp thao tác Find and Replace kèm hộp thoại kết quả thay thế thành công.',
      content: 'Hộp thoại Find and Replace:\n- Find what: "máy vi tính"\n- Replace with: "máy tính"\n- Thông báo: "All done. We made 8 replacements."'
    },
    rubric: [
      { id: 'r1', name: 'Thao tác công cụ Find & Replace', description: 'Mở và sử dụng đúng lệnh Ctrl + H', maxScore: 3.5 },
      { id: 'r2', name: 'Thay thế chính xác cụm từ', description: 'Đúng từ cần tìm và từ thay thế', maxScore: 3.5 },
      { id: 'r3', name: 'Bảo toàn ý nghĩa văn bản', description: 'Kiểm tra kỹ các ngữ cảnh trong bài', maxScore: 1.5 },
      { id: 'r4', name: 'Ảnh minh chứng & Lưu tệp mới', description: 'Chụp rõ hộp thoại kết quả thay thế', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T07:09:00Z',
    isActive: true
  },
  {
    id: 'sp11-tao-so-do-tu-duy',
    title: 'SP11. Tạo sơ đồ tư duy',
    gradeLevel: 'Lớp 6',
    subjectType: 'powerpoint',
    durationMinutes: 45,
    description: 'Biểu diễn chủ đề học tập dưới dạng sơ đồ tư duy phân nhánh bằng hình khối và màu sắc.',
    toolRequired: 'PowerPoint, Word hoặc phần mềm sơ đồ tư duy.',
    targetFile: 'SP11_SoDoTuDuy.png',
    requirements: [
      'Chủ đề trung tâm nổi bật trong hình lớn (ví dụ: “HỌC TẬP HIỆU QUẢ”)',
      'Ít nhất 4 nhánh chính (ví dụ: Lập kế hoạch, Ghi chép, Luyện tập, Nghỉ ngơi)',
      'Từ mỗi nhánh chính tỏa ra ít nhất 2 nhánh phụ',
      'Dùng từ khóa ngắn gọn, màu sắc phân biệt giữa các nhánh',
      'Chèn biểu tượng/icon phù hợp, lưu thành tệp PNG hoặc PPTX'
    ],
    steps: [
      'Tạo một trang trống trong PowerPoint hoặc Word.',
      'Đặt chủ đề trung tâm “HỌC TẬP HIỆU QUẢ” trong một hình lớn ở giữa.',
      'Tạo ít nhất 4 nhánh chính: Lập kế hoạch, Ghi chép, Luyện tập, Nghỉ ngơi.',
      'Từ mỗi nhánh, tạo thêm 2 nhánh phụ.',
      'Dùng từ khóa ngắn thay vì đoạn văn dài.',
      'Dùng màu khác nhau để phân biệt các nhánh.',
      'Chèn biểu tượng hoặc hình ảnh nếu phù hợp.',
      'Căn chỉnh và lưu thành SP11_SoDoTuDuy.pptx hoặc ảnh PNG.'
    ],
    acceptanceCriteria: 'Có chủ đề trung tâm, ít nhất 4 nhánh chính, nhánh phụ có ý nghĩa và sơ đồ dễ quan sát.',
    expectedOutput: 'Sơ đồ tư duy dạng tỏa nhánh từ tâm, màu sắc bắt mắt, có ít nhất 4 nhánh chính x 2 nhánh phụ.',
    sampleProduct: {
      fileName: 'SP11_SoDoTuDuy.png',
      notes: 'Sơ đồ tư duy 4 nhánh chính và 8 nhánh phụ với chủ đề Học tập hiệu quả.',
      content: 'Chủ đề: [HỌC TẬP HIỆU QUẢ]\n├── Nhánh 1: Lập kế hoạch (Thời khóa biểu, Mục tiêu tuần)\n├── Nhánh 2: Ghi chép (Sơ đồ tư duy, Từ khóa ngắn)\n├── Nhánh 3: Luyện tập (Làm bài tập, Thảo luận nhóm)\n└── Nhánh 4: Nghỉ ngơi (Ngủ đủ giấc, Thể dục giải lao)'
    },
    rubric: [
      { id: 'r1', name: 'Chủ đề trung tâm nổi bật', description: 'Hình ảnh/khối tâm ấn tượng, to rõ', maxScore: 2.5 },
      { id: 'r2', name: 'Đủ 4 nhánh chính & nhánh phụ', description: 'Mỗi nhánh chính có tối thiểu 2 nhánh con', maxScore: 3.5 },
      { id: 'r3', name: 'Từ khóa ngắn & Màu sắc phân nhánh', description: 'Từ ngữ súc tích, phối màu logic', maxScore: 2.0 },
      { id: 'r4', name: 'Biểu tượng minh họa & Bố cục', description: 'Cân đối toàn trang, dễ quan sát', maxScore: 2.0 }
    ],
    createdAt: '2026-10-09T07:10:00Z',
    isActive: true
  },
  {
    id: 'sp12-so-luu-niem-lop-em',
    title: 'SP12. Sổ lưu niệm lớp em',
    gradeLevel: 'Lớp 6',
    subjectType: 'powerpoint',
    durationMinutes: 45,
    description: 'Thiết kế cuốn kỷ yếu / sổ lưu niệm mini ghi lại kỷ niệm thầy cô và bạn bè trong lớp.',
    toolRequired: 'Word hoặc PowerPoint.',
    targetFile: 'SP12_SoLuuNiem.pptx',
    requirements: [
      'Trang bìa có tiêu đề “SỔ LƯU NIỆM LỚP EM” cùng thông tin năm học, trường, lớp',
      'Đủ 3 trang/mục nội dung: Giới thiệu tập thể lớp, Lời chúc thầy cô và kỷ niệm đáng nhớ',
      'Chèn khung viền và hình ảnh kỷ niệm phù hợp',
      'Phông chữ thân thiện, màu sắc tươi sáng ấm áp',
      'Lưu thành SP12_SoLuuNiem.pptx hoặc ảnh chụp tệp PNG'
    ],
    steps: [
      'Tạo trang bìa với tiêu đề “SỔ LƯU NIỆM LỚP EM”.',
      'Thêm thông tin trường, lớp, năm học.',
      'Tạo các trang hoặc các mục nội dung: Giới thiệu tập thể lớp, Lời chúc của bạn bè, Kỷ niệm đáng nhớ.',
      'Chèn ảnh chụp tập thể hoặc hình minh họa phù hợp.',
      'Dùng khung viền, màu sắc trang trí tươi sáng.',
      'Chọn phông chữ dễ thương nhưng vẫn dễ đọc.',
      'Sắp xếp trang cho đẹp mắt và lưu thành SP12_SoLuuNiem.pptx hoặc PDF.'
    ],
    acceptanceCriteria: 'Có bìa, đủ các mục nội dung, hình ảnh hài hòa và bố cục trang nhã.',
    expectedOutput: 'Bộ slide hoặc văn bản lưu niệm có trang bìa và các trang nội dung gắn kết bạn bè.',
    sampleProduct: {
      fileName: 'SP12_SoLuuNiem.pptx',
      notes: 'Sổ lưu niệm lớp 6 gồm bìa và các trang ký ức học trò.',
      content: 'Trang 1: Bìa SỔ LƯU NIỆM LỚP 6A2 - Niên khóa 2026\nTrang 2: Tập thể chúng mình (40 thành viên đoàn kết)\nTrang 3: Kỷ niệm ngày Nhà giáo Việt Nam và chuyến đi dã ngoại\nTrang 4: Lưu bút và những lời chúc yêu thương gửi bạn bè'
    },
    rubric: [
      { id: 'r1', name: 'Trang bìa trang trọng', description: 'Đầy đủ tên trường, lớp, niên khóa', maxScore: 2.5 },
      { id: 'r2', name: 'Đủ các trang nội dung kỷ niệm', description: 'Tập thể, lời chúc, khoảnh khắc đáng nhớ', maxScore: 3.5 },
      { id: 'r3', name: 'Khung viền & Hình ảnh minh họa', description: 'Trang trí đẹp mắt, chèn ảnh cân đối', maxScore: 2.0 },
      { id: 'r4', name: 'Phông chữ & Cảm xúc văn phong', description: 'Chữ dễ đọc, văn phong trong sáng', maxScore: 2.0 }
    ],
    createdAt: '2026-10-09T07:11:00Z',
    isActive: true
  },
  {
    id: 'sp13-ve-so-do-khoi-thuat-toan',
    title: 'SP13. Vẽ sơ đồ khối thuật toán',
    gradeLevel: 'Lớp 6',
    subjectType: 'powerpoint',
    durationMinutes: 45,
    description: 'Biểu diễn thuật toán bằng các hình khối chuẩn: Bắt đầu/Kết thúc (oval), Nhập/Xuất (bình hành), Xử lý (chữ nhật), Điều kiện (thoi).',
    toolRequired: 'PowerPoint, Word hoặc công cụ vẽ.',
    targetFile: 'SP13_SoDoKhoi.png',
    requirements: [
      'Dùng đúng các hình khối quy ước: Bắt đầu/Kết thúc (oval), Nhập/Xuất dữ liệu (hình bình hành), Xử lý (hình chữ nhật), Điều kiện rẽ nhánh (hình thoi)',
      'Mũi tên nối tuần tự thể hiện hướng đi của thuật toán',
      'Nhánh điều kiện Đúng/Sai ghi rõ nhãn trên mũi tên',
      'Đề bài mẫu: Tìm số lớn hơn trong 2 số a và b, hoặc tính tiền mua vở',
      'Lưu thành SP13_SoDoKhoi.png'
    ],
    steps: [
      'Chọn một bài toán quen thuộc, ví dụ: Tính tổng 2 số hoặc Tìm số lớn hơn trong hai số a và b.',
      'Vẽ khối Bắt đầu bằng hình oval.',
      'Vẽ khối Nhập dữ liệu (a, b) bằng hình bình hành.',
      'Vẽ khối Điều kiện so sánh (a > b) bằng hình thoi nếu có rẽ nhánh, hoặc khối hình chữ nhật để tính toán.',
      'Vẽ khối Xuất kết quả bằng hình bình hành.',
      'Vẽ khối Kết thúc bằng hình oval.',
      'Dùng mũi tên nối các khối theo đúng thứ tự thực hiện.',
      'Ghi nhãn Đúng/Sai ở các nhánh của hình thoi.',
      'Lưu tệp dưới dạng SP13_SoDoKhoi.png hoặc SP13_SoDoKhoi.pptx.'
    ],
    acceptanceCriteria: 'Đúng các loại hình khối theo quy ước, mũi tên rõ chiều, thể hiện đúng các bước thuật toán.',
    expectedOutput: 'Sơ đồ khối thuật toán chuẩn quy ước quốc tế với khối oval, bình hành, chữ nhật và thoi.',
    sampleProduct: {
      fileName: 'SP13_SoDoKhoi.png',
      notes: 'Sơ đồ khối thuật toán tìm số lớn nhất giữa 2 số a và b.',
      content: '[Bắt đầu] (Oval)\n  ↓\n[Nhập hai số a, b] (Hình bình hành)\n  ↓\n< a > b ? > (Hình thoi)\n  ├── (Đúng) ---> [In ra: a lớn hơn] (Bình hành) ──┐\n  └── (Sai)  ---> [In ra: b lớn hơn hoặc bằng a] ──┤\n                                                  ↓\n                                             [Kết thúc] (Oval)'
    },
    rubric: [
      { id: 'r1', name: 'Đúng quy ước hình khối', description: 'Oval, bình hành, chữ nhật, thoi chính xác', maxScore: 4.0 },
      { id: 'r2', name: 'Mũi tên chỉ hướng & Nhãn Đúng/Sai', description: 'Đầy đủ chiều mũi tên và nhãn nhánh', maxScore: 3.0 },
      { id: 'r3', name: 'Tính chính xác của thuật toán', description: 'Logic bài toán giải quyết trọn vẹn', maxScore: 2.0 },
      { id: 'r4', name: 'Thẩm mỹ & Đặt tên tệp', description: 'Hình vẽ ngay ngắn, thẳng hàng', maxScore: 1.0 }
    ],
    createdAt: '2026-10-09T07:12:00Z',
    isActive: true
  },
  {
    id: 'sp14-mo-ta-thuat-toan-bang-loi',
    title: 'SP14. Mô tả thuật toán bằng ngôn ngữ tự nhiên',
    gradeLevel: 'Lớp 6',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Mô tả thuật toán mạch lạc theo từng bước bằng tiếng Việt, có điều kiện và lặp rõ ràng.',
    toolRequired: 'Word hoặc Notepad.',
    targetFile: 'SP14_MoTaThuatToan.docx',
    requirements: [
      'Ghi rõ đầu vào (Input) và đầu ra (Output) của bài toán',
      'Mô tả tuần tự theo từng bước: Bước 1, Bước 2, Bước 3...',
      'Có điều kiện dừng rõ ràng để không bị lặp vô tận',
      'Ngôn ngữ tự nhiên ngắn gọn, chính xác, ai đọc cũng làm theo được',
      'Lưu thành SP14_MoTaThuatToan.docx'
    ],
    steps: [
      'Mở Word hoặc Notepad.',
      'Ghi tên bài toán (Ví dụ: Thuật toán pha trà chanh, hoặc Thuật toán tính chu vi hình chữ nhật).',
      'Xác định rõ:\n  - Đầu vào (Input): Dữ liệu hoặc nguyên liệu ban đầu.\n  - Đầu ra (Output): Kết quả nhận được.',
      'Viết các bước thực hiện theo thứ tự:\n  - Bước 1: ...\n  - Bước 2: ...\n  - Bước 3: ...\n  - Bước cuối: Kết thúc thuật toán.',
      'Kiểm tra lại xem các bước có bị thiếu hoặc lặp vô tận không.',
      'Lưu thành tệp SP14_MoTaThuatToan.docx.'
    ],
    acceptanceCriteria: 'Đủ Input, Output, các bước đánh số rõ ràng, logic chặt chẽ và có bước kết thúc.',
    expectedOutput: 'Văn bản Word gồm tiêu đề bài toán, Input, Output và các bước liệt kê tuần tự từ 1 đến kết thúc.',
    sampleProduct: {
      fileName: 'SP14_MoTaThuatToan.docx',
      notes: 'Mô tả thuật toán tính chu vi và diện tích hình chữ nhật bằng ngôn ngữ tự nhiên.',
      content: 'BÀI TOÁN: TÍNH CHU VI VÀ DIỆN TÍCH HÌNH CHỮ NHẬT\n- Input: Chiều dài a, chiều rộng b (a > 0, b > 0).\n- Output: Chu vi P và diện tích S của hình chữ nhật.\nCÁC BƯỚC THỰC HIỆN:\nBước 1: Nhập giá trị chiều dài a và chiều rộng b từ bàn phím.\nBước 2: Tính chu vi theo công thức: P = (a + b) * 2.\nBước 3: Tính diện tích theo công thức: S = a * b.\nBước 4: Thông báo kết quả giá trị P và S ra màn hình.\nBước 5: Kết thúc thuật toán.'
    },
    rubric: [
      { id: 'r1', name: 'Xác định đúng Input & Output', description: 'Đầu vào và đầu ra rõ ràng, chính xác', maxScore: 3.0 },
      { id: 'r2', name: 'Các bước thực hiện tuần tự', description: 'Đánh số Bước 1, Bước 2... logic chặt chẽ', maxScore: 4.0 },
      { id: 'r3', name: 'Tính khả thi & Bước kết thúc', description: 'Có điều kiện dừng, người đọc dễ dàng thực hiện', maxScore: 2.0 },
      { id: 'r4', name: 'Trình bày văn bản khoa học', description: 'Ngữ pháp chuẩn, lưu đúng tên tệp', maxScore: 1.0 }
    ],
    createdAt: '2026-10-09T07:13:00Z',
    isActive: true
  }
];
