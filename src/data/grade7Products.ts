import { Assignment } from '../types';

export const GRADE_7_PRODUCTS: Assignment[] = [
  {
    id: 'th7-sp01-thiet-bi-vao-ra',
    title: 'SP01. Thiết bị vào – ra của máy tính',
    gradeLevel: 'Lớp 7',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Nhận biết, phân loại thiết bị vào và thiết bị ra của máy tính.',
    toolRequired: 'PowerPoint hoặc Word.',
    targetFile: 'TH7_SP01_ThietBi.docx',
    requirements: [
      'Gõ tiêu đề “THIẾT BỊ VÀO – RA CỦA MÁY TÍNH” nổi bật',
      'Tạo bảng gồm 3 cột: Tên thiết bị, Chức năng, Phân loại (Vào / Ra)',
      'Liệt kê ít nhất 8 thiết bị (Bàn phím, chuột, máy quét, micro, màn hình, máy in, loa, máy chiếu...)',
      'Mô tả đầy đủ chức năng và phân loại chính xác từng thiết bị',
      'Định dạng tiêu đề, đường viền bảng ngay ngắn và lưu tệp TH7_SP01_ThietBi.docx'
    ],
    steps: [
      'Mở Word và tạo tài liệu mới.',
      'Gõ tiêu đề “THIẾT BỊ VÀO – RA CỦA MÁY TÍNH”.',
      'Tạo bảng gồm 3 cột: Tên thiết bị, Chức năng, Phân loại.',
      'Liệt kê ít nhất 8 thiết bị, chẳng hạn bàn phím, chuột, máy quét, micro, màn hình, máy in, loa, máy chiếu.',
      'Điền chức năng và phân loại từng thiết bị.',
      'Chèn hình minh họa nếu được yêu cầu.',
      'Định dạng tiêu đề, đường viền bảng và căn chỉnh nội dung.',
      'Lưu tệp đúng tên quy định TH7_SP01_ThietBi.docx.'
    ],
    acceptanceCriteria: 'Có ít nhất 8 thiết bị, phân loại đúng và mô tả chức năng rõ ràng.',
    expectedOutput: 'Tài liệu Word chứa bảng 3 cột với ít nhất 8 thiết bị được phân loại chuẩn xác thành thiết bị Vào hoặc thiết bị Ra cùng chức năng cụ thể.',
    sampleProduct: {
      fileName: 'TH7_SP01_ThietBi.docx',
      notes: 'Bảng tổng hợp thiết bị vào/ra hoàn chỉnh 8 thiết bị kèm chức năng chi tiết.',
      content: 'THIẾT BỊ VÀO – RA CỦA MÁY TÍNH\n1. Bàn phím: Nhập dữ liệu chữ và số -> Thiết bị vào\n2. Chuột: Điều khiển con trỏ -> Thiết bị vào\n3. Máy quét: Quét ảnh/văn bản vào máy -> Thiết bị vào\n4. Micro: Thu nhận âm thanh -> Thiết bị vào\n5. Màn hình: Hiển thị hình ảnh/thông tin -> Thiết bị ra\n6. Máy in: In tài liệu ra giấy -> Thiết bị ra\n7. Loa: Phát âm thanh -> Thiết bị ra\n8. Máy chiếu: Trình chiếu hình ảnh lên màn lớn -> Thiết bị ra'
    },
    rubric: [
      { id: 'r1', name: 'Đủ số lượng thiết bị', description: 'Liệt kê ít nhất 8 thiết bị vào/ra khác nhau', maxScore: 3.0 },
      { id: 'r2', name: 'Phân loại chính xác', description: 'Phân loại đúng 100% thiết bị Vào hoặc thiết bị Ra', maxScore: 3.5 },
      { id: 'r3', name: 'Mô tả chức năng rõ ràng', description: 'Nêu súc tích chức năng chính của từng thiết bị', maxScore: 2.0 },
      { id: 'r4', name: 'Định dạng bảng và trình bày', description: 'Bảng có tiêu đề, căn lề, viền đẹp và lưu đúng tên tệp', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T07:10:00Z',
    isActive: true
  },
  {
    id: 'th7-sp02-phan-mem-he-dieu-hanh',
    title: 'SP02. Phần mềm máy tính và hệ điều hành',
    gradeLevel: 'Lớp 7',
    subjectType: 'powerpoint',
    durationMinutes: 45,
    description: 'Phân biệt hệ điều hành và phần mềm ứng dụng thông qua bài trình chiếu trực quan.',
    toolRequired: 'Word hoặc PowerPoint.',
    targetFile: 'TH7_SP02_PhanMem.pptx',
    requirements: [
      'Tạo bài trình chiếu gồm đúng 3 trang',
      'Trang 1: Tiêu đề “PHẦN MỀM MÁY TÍNH”, tên học sinh / nhóm',
      'Trang 2: Khái niệm hệ điều hành và nêu ví dụ (Windows, Linux, Android, iOS...)',
      'Trang 3: Khái niệm phần mềm ứng dụng và ví dụ (Trình duyệt web, Word, PowerPoint...)',
      'Thêm biểu tượng hoặc hình ảnh minh họa phù hợp, bố cục hài hòa, chữ dễ đọc'
    ],
    steps: [
      'Tạo bài trình chiếu gồm 3 trang.',
      'Trang 1: Ghi tiêu đề “PHẦN MỀM MÁY TÍNH”.',
      'Trang 2: Trình bày khái niệm hệ điều hành và nêu ví dụ như Windows, Linux, Android.',
      'Trang 3: Trình bày phần mềm ứng dụng và nêu ví dụ như trình duyệt web, phần mềm soạn thảo văn bản, phần mềm trình chiếu.',
      'Thêm biểu tượng hoặc hình ảnh minh họa phù hợp.',
      'Kiểm tra nội dung, cỡ chữ và bố cục.',
      'Lưu tệp PowerPoint đúng tên TH7_SP02_PhanMem.pptx.'
    ],
    acceptanceCriteria: 'Có đủ 3 trang, phân biệt đúng hai nhóm phần mềm và có ví dụ minh họa.',
    expectedOutput: 'Tệp PowerPoint 3 trang trình bày mạch lạc, phân biệt chuẩn xác hệ điều hành và phần mềm ứng dụng.',
    sampleProduct: {
      fileName: 'TH7_SP02_PhanMem.pptx',
      notes: 'Slide 1: Tiêu đề; Slide 2: Hệ điều hành (Windows, Linux, macOS); Slide 3: Phần mềm ứng dụng (Chrome, Word, Excel).',
      content: 'Trang 1: PHẦN MỀM MÁY TÍNH\nTrang 2: HỆ ĐIỀU HÀNH - Môi trường quản lý phần cứng & phần mềm (VD: Windows 11, Ubuntu Linux, Android)\nTrang 3: PHẦN MỀM ỨNG DỤNG - Phục vụ nhu cầu cụ thể của người dùng (VD: Google Chrome, MS Word, Paint)'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 3 trang slide', description: 'Cấu trúc 3 trang chuẩn theo yêu cầu', maxScore: 2.5 },
      { id: 'r2', name: 'Nội dung Hệ điều hành', description: 'Khái niệm đúng và ví dụ phong phú (Windows, Linux, Android)', maxScore: 3.0 },
      { id: 'r3', name: 'Nội dung Phần mềm ứng dụng', description: 'Khái niệm đúng và nêu rõ các ứng dụng thực tế', maxScore: 3.0 },
      { id: 'r4', name: 'Thẩm mỹ & Hình minh họa', description: 'Bố cục cân đối, font chữ dễ đọc, có minh họa đẹp', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T07:11:00Z',
    isActive: true
  },
  {
    id: 'th7-sp03-mang-xa-hoi-giao-tiep',
    title: 'SP03. Mạng xã hội và giao tiếp trên mạng',
    gradeLevel: 'Lớp 7',
    subjectType: 'powerpoint',
    durationMinutes: 45,
    description: 'Biết sử dụng mạng xã hội an toàn, có trách nhiệm và phòng tránh các nguy cơ trực tuyến.',
    toolRequired: 'Word hoặc PowerPoint.',
    targetFile: 'TH7_SP03_MangXaHoi.pptx',
    requirements: [
      'Bài trình chiếu gồm 4 trang hoàn chỉnh',
      'Trang 1: Tiêu đề “SỬ DỤNG MẠNG XÃ HỘI AN TOÀN”',
      'Trang 2: Nêu 3 lợi ích của mạng xã hội trong học tập và giao tiếp',
      'Trang 3: Nêu 4 nguy cơ (Tin giả, lừa đảo, bắt nạt trực tuyến, lộ thông tin cá nhân...)',
      'Trang 4: Đề xuất ít nhất 4 nguyên tắc sử dụng mạng xã hội có trách nhiệm',
      'Chèn minh họa phù hợp, màu sắc thống nhất, lưu tệp TH7_SP03_MangXaHoi.pptx'
    ],
    steps: [
      'Mở PowerPoint, tạo bài trình chiếu gồm 4 trang.',
      'Trang 1: Ghi tiêu đề “SỬ DỤNG MẠNG XÃ HỘI AN TOÀN”.',
      'Trang 2: Nêu 3 lợi ích của mạng xã hội trong học tập và giao tiếp.',
      'Trang 3: Nêu 4 nguy cơ, chẳng hạn tin giả, lừa đảo, bắt nạt trực tuyến và lộ thông tin cá nhân.',
      'Trang 4: Đề xuất ít nhất 4 nguyên tắc sử dụng mạng xã hội có trách nhiệm.',
      'Chèn hình minh họa phù hợp.',
      'Định dạng tiêu đề, nội dung và màu sắc thống nhất.',
      'Lưu tệp và chụp ảnh minh chứng các trang.'
    ],
    acceptanceCriteria: 'Có đủ 4 trang, nội dung đúng, có ví dụ và khuyến nghị an toàn.',
    expectedOutput: 'Bài trình chiếu 4 slide chỉ rõ lợi ích, nguy cơ và các giải pháp tự vệ trên mạng xã hội.',
    sampleProduct: {
      fileName: 'TH7_SP03_MangXaHoi.pptx',
      notes: 'Bộ slide 4 trang thuyết trình về văn hóa và an toàn mạng xã hội học đường.',
      content: 'Slide 1: SỬ DỤNG MẠNG XÃ HỘI AN TOÀN\nSlide 2: 3 Lợi ích: Kết nối bạn bè, Trao đổi bài vở, Cập nhật tin tức học thuật\nSlide 3: 4 Nguy cơ: Tin giả/lừa đảo, Bắt nạt trực tuyến, Nghiện mạng xã hội, Lộ dữ liệu riêng tư\nSlide 4: 4 Nguyên tắc: Suy nghĩ trước khi chia sẻ, Bảo mật mật khẩu, Không kết bạn người lạ, Tôn trọng bản quyền'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 4 trang slide', description: 'Đủ bố cục 4 trang theo trình tự yêu cầu', maxScore: 2.0 },
      { id: 'r2', name: 'Lợi ích & Nguy cơ', description: 'Nêu đủ 3 lợi ích và 4 nguy cơ cụ thể trên mạng', maxScore: 3.5 },
      { id: 'r3', name: 'Nguyên tắc an toàn', description: 'Đề xuất ít nhất 4 nguyên tắc thực tế, giá trị', maxScore: 3.0 },
      { id: 'r4', name: 'Thiết kế trực quan', description: 'Hình ảnh, biểu tượng và định dạng thống nhất', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T07:12:00Z',
    isActive: true
  },
  {
    id: 'th7-sp04-van-hoa-ung-xu-khong-gian-mang',
    title: 'SP04. Văn hóa ứng xử trên không gian mạng',
    gradeLevel: 'Lớp 7',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Ứng xử lịch sự, tôn trọng người khác và xử lý các tình huống giao tiếp trực tuyến.',
    toolRequired: 'Word hoặc PowerPoint.',
    targetFile: 'TH7_SP04_UngXuSo.docx',
    requirements: [
      'Tiêu đề nổi bật: “5 QUY TẮC ỨNG XỬ VĂN MINH TRÊN MẠNG”',
      'Trình bày 5 quy tắc: Tôn trọng người khác, Không xúc phạm, Kiểm chứng thông tin, Tôn trọng bản quyền, Bảo vệ quyền riêng tư',
      'Tạo bảng 3 cột: Tình huống | Cách ứng xử chưa phù hợp | Cách ứng xử đúng',
      'Đưa ra ít nhất 3 tình huống thực tế và cách giải quyết hợp lý',
      'Định dạng bảng ngay ngắn, rõ ràng, lưu tệp TH7_SP04_UngXuSo.docx'
    ],
    steps: [
      'Tạo tài liệu Word mới.',
      'Đặt tiêu đề “5 QUY TẮC ỨNG XỬ VĂN MINH TRÊN MẠNG”.',
      'Viết 5 quy tắc: tôn trọng người khác, không xúc phạm, kiểm chứng thông tin, tôn trọng bản quyền và bảo vệ quyền riêng tư.',
      'Tạo bảng gồm 3 cột: Tình huống, Cách ứng xử chưa phù hợp, Cách ứng xử đúng.',
      'Đưa ra ít nhất 3 tình huống thực tế.',
      'Viết cách giải quyết phù hợp cho từng tình huống.',
      'Định dạng bảng, tiêu đề và nội dung.',
      'Lưu tệp theo tên quy định TH7_SP04_UngXuSo.docx.'
    ],
    acceptanceCriteria: 'Có đủ 5 quy tắc, 3 tình huống và cách giải quyết hợp lí.',
    expectedOutput: 'Tài liệu Word gồm 5 quy tắc văn minh số và bảng phân tích 3 tình huống đối thoại trên mạng.',
    sampleProduct: {
      fileName: 'TH7_SP04_UngXuSo.docx',
      notes: 'Bảng xử lý tình huống: Bắt nạt bạn trong nhóm chat, Chia sẻ bài viết chưa kiểm chứng, Dùng ảnh người khác chưa xin phép.',
      content: '5 QUY TẮC ỨNG XỬ:\n1. Tôn trọng người khác\n2. Không xúc phạm, chửi bới\n3. Kiểm chứng thông tin trước khi share\n4. Tôn trọng tác quyền bài viết/hình ảnh\n5. Bảo vệ quyền riêng tư bản thân và mọi người\nBẢNG TÌNH HUỐNG: 3 tình huống đối chiếu Chưa phù hợp vs Phù hợp'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 5 quy tắc ứng xử', description: 'Nêu chính xác và giải thích ngắn gọn 5 quy tắc', maxScore: 3.5 },
      { id: 'r2', name: 'Bảng 3 tình huống thực tế', description: 'Đưa ra ít nhất 3 tình huống gần gũi với học sinh', maxScore: 3.5 },
      { id: 'r3', name: 'Giải pháp ứng xử đúng', description: 'Cách giải quyết văn minh, hợp lý, có tính thuyết phục', maxScore: 2.0 },
      { id: 'r4', name: 'Hình thức văn bản', description: 'Trình bày Word chuẩn, kẻ viền bảng rõ ràng', maxScore: 1.0 }
    ],
    createdAt: '2026-10-09T07:13:00Z',
    isActive: true
  },
  {
    id: 'th7-sp05-tao-bang-du-lieu-bang-tinh',
    title: 'SP05. Tạo bảng dữ liệu bằng phần mềm bảng tính',
    gradeLevel: 'Lớp 7',
    subjectType: 'excel',
    durationMinutes: 45,
    description: 'Nhập dữ liệu, chỉnh sửa ô, hàng, cột, căn chỉnh và định dạng bảng tính cơ bản.',
    toolRequired: 'Microsoft Excel, LibreOffice Calc hoặc Google Sheets.',
    targetFile: 'TH7_SP05_BangDuLieu.xlsx',
    requirements: [
      'Nhập tiêu đề lớn “KẾT QUẢ HỌC TẬP”',
      'Hàng tiêu đề gồm 5 cột: STT, Họ tên, Toán, Ngữ văn, Tin học',
      'Nhập dữ liệu đầy đủ cho ít nhất 5 học sinh (dữ liệu mẫu hợp lệ)',
      'Chỉnh độ rộng cột vừa khít nội dung, bôi đậm hàng tiêu đề, kẻ khung viền (Borders) cho toàn bảng',
      'Lưu tệp đúng định dạng TH7_SP05_BangDuLieu.xlsx'
    ],
    steps: [
      'Mở phần mềm bảng tính và tạo bảng tính mới.',
      'Nhập tiêu đề “KẾT QUẢ HỌC TẬP”.',
      'Tại hàng đầu tiên, nhập các cột: STT, Họ tên, Toán, Ngữ văn, Tin học.',
      'Nhập dữ liệu của ít nhất 5 học sinh bằng dữ liệu mẫu, không sử dụng thông tin cá nhân thật nếu không cần thiết.',
      'Chỉnh độ rộng cột để hiển thị đầy đủ nội dung.',
      'Bôi đậm hàng tiêu đề.',
      'Kẻ đường viền cho bảng.',
      'Lưu tệp dưới định dạng XLSX nếu phần mềm hỗ trợ.'
    ],
    acceptanceCriteria: 'Có đủ 5 cột, ít nhất 5 dòng dữ liệu, định dạng dễ đọc và tệp mở được.',
    expectedOutput: 'Bảng tính Excel kẻ viền hoàn chỉnh, cột cân đối với 5 cột và tối thiểu 5 hàng điểm số học sinh.',
    sampleProduct: {
      fileName: 'TH7_SP05_BangDuLieu.xlsx',
      notes: 'Bảng điểm 5 học sinh: Nguyễn Văn An, Lê Thị Mai, Trần Quốc Tuấn, Phạm Hải Yến, Hoàng Văn Nam.',
      content: 'KẾT QUẢ HỌC TẬP\nSTT | Họ tên | Toán | Ngữ văn | Tin học\n1 | Nguyễn Văn An | 8.5 | 8.0 | 9.0\n2 | Lê Thị Mai | 9.0 | 8.5 | 9.5\n3 | Trần Quốc Tuấn | 7.5 | 8.0 | 8.5\n4 | Phạm Hải Yến | 8.0 | 9.0 | 9.0\n5 | Hoàng Văn Nam | 8.5 | 7.5 | 9.0'
    },
    rubric: [
      { id: 'r1', name: 'Cấu trúc 5 cột tiêu đề', description: 'STT, Họ tên, Toán, Ngữ văn, Tin học', maxScore: 2.5 },
      { id: 'r2', name: 'Đủ ít nhất 5 dòng dữ liệu', description: 'Dữ liệu số điểm và họ tên hợp lý, không để trống', maxScore: 3.5 },
      { id: 'r3', name: 'Định dạng & Viền bảng', description: 'Bôi đậm tiêu đề, kẻ borders, căn giữa cột số', maxScore: 2.5 },
      { id: 'r4', name: 'Độ rộng cột chuẩn', description: 'Hiển thị trọn vẹn họ tên, không bị che khuất chữ hay ###', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T07:14:00Z',
    isActive: true
  },
  {
    id: 'th7-sp06-su-dung-cong-thuc-bang-tinh',
    title: 'SP06. Sử dụng công thức trong bảng tính',
    gradeLevel: 'Lớp 7',
    subjectType: 'excel',
    durationMinutes: 45,
    description: 'Vận dụng công thức toán học (+, -, *, /) và địa chỉ ô để tính toán tự động trong Excel.',
    toolRequired: 'Excel, Calc hoặc Google Sheets.',
    targetFile: 'TH7_SP06_CongThuc.xlsx',
    requirements: [
      'Tạo bảng tính với các cột: Tên mặt hàng, Số lượng, Đơn giá, Thành tiền',
      'Nhập ít nhất 5 mặt hàng văn phòng phẩm hoặc đồ dùng học tập',
      'Tính cột Thành tiền bằng công thức chứa địa chỉ ô: = Số lượng * Đơn giá (VD: =B3*C3)',
      'Sao chép (Fill down) công thức cho toàn bộ các dòng còn lại',
      'Tạo dòng Tổng cộng ở cuối và tính tổng bằng công thức',
      'Định dạng số rõ ràng và lưu tệp TH7_SP06_CongThuc.xlsx'
    ],
    steps: [
      'Tạo bảng gồm các cột: Tên mặt hàng, Số lượng, Đơn giá, Thành tiền.',
      'Nhập dữ liệu ít nhất 5 mặt hàng.',
      'Dùng công thức để tính Thành tiền = Số lượng * Đơn giá.',
      'Sao chép công thức cho các dòng còn lại.',
      'Tính tổng tiền của tất cả mặt hàng ở dòng cuối.',
      'Định dạng số cho rõ ràng.',
      'Lưu tệp TH7_SP06_CongThuc.xlsx.'
    ],
    acceptanceCriteria: 'Có đủ 5 mặt hàng, dùng công thức đúng, sao chép công thức đúng và kết quả chính xác.',
    expectedOutput: 'Bảng tính tính tiền 5 món hàng dùng công thức nhân địa chỉ ô tự động, có dòng tổng cộng.',
    sampleProduct: {
      fileName: 'TH7_SP06_CongThuc.xlsx',
      notes: 'Bảng mua đồ dùng học tập: Bút bi, Vở 96 trang, Thước kẻ, Compa, Hộp bút; Thành tiền = Bx*Cx.',
      content: 'Tên mặt hàng | Số lượng | Đơn giá | Thành tiền (=B*C)\nBút bi | 10 | 5000 | 50000\nVở kẻ ngang | 5 | 12000 | 60000\nThước kẻ | 2 | 7000 | 14000\nCompa | 1 | 15000 | 15000\nHộp bút | 1 | 35000 | 35000\nTỔNG CỘNG: 174000'
    },
    rubric: [
      { id: 'r1', name: 'Dữ liệu 5 mặt hàng', description: 'Đầy đủ tên hàng, số lượng và đơn giá hợp lý', maxScore: 2.5 },
      { id: 'r2', name: 'Công thức Thành tiền', description: 'Dùng đúng công thức địa chỉ ô =B*C, không gõ số chết', maxScore: 3.5 },
      { id: 'r3', name: 'Sao chép công thức (Fill)', description: 'Công thức tự động đổi địa chỉ tương đối ở mọi dòng', maxScore: 2.0 },
      { id: 'r4', name: 'Công thức Tổng cộng & Trình bày', description: 'Tính đúng tổng cộng và định dạng tiền tệ ngay ngắn', maxScore: 2.0 }
    ],
    createdAt: '2026-10-09T07:15:00Z',
    isActive: true
  },
  {
    id: 'th7-sp07-su-dung-ham-tinh-toan-thong-ke',
    title: 'SP07. Sử dụng hàm tính toán trong bảng tính',
    gradeLevel: 'Lớp 7',
    subjectType: 'excel',
    durationMinutes: 45,
    description: 'Thực hành thành thạo các hàm tính toán cơ bản: SUM, AVERAGE, MAX, MIN trong bảng tính.',
    toolRequired: 'Excel, Calc hoặc Google Sheets.',
    targetFile: 'TH7_SP07_HamTinhToan.xlsx',
    requirements: [
      'Sử dụng bảng dữ liệu học tập hoặc chi tiêu có ít nhất 6 dòng số liệu',
      'Sử dụng chính xác cả 4 hàm: =SUM() tính tổng, =AVERAGE() tính trung bình cộng',
      '=MAX() tìm giá trị lớn nhất, =MIN() tìm giá trị nhỏ nhất',
      'Ghi nhãn rõ ràng cho từng kết quả tương ứng',
      'Kiểm tra lại vùng dữ liệu trong dấu ngoặc đơn và lưu tệp TH7_SP07_HamTinhToan.xlsx'
    ],
    steps: [
      'Mở bảng dữ liệu từ bài trước hoặc tạo bảng dữ liệu mới có ít nhất 6 dòng.',
      'Thêm các dòng hoặc ô để tính: Tổng cộng, Trung bình, Cao nhất, Thấp nhất.',
      'Sử dụng hàm SUM để tính tổng.',
      'Sử dụng hàm AVERAGE để tính trung bình.',
      'Sử dụng hàm MAX và MIN để tìm giá trị lớn nhất và nhỏ nhất.',
      'Ghi nhãn rõ ràng cho từng ô kết quả.',
      'Kiểm tra lại công thức và lưu tệp TH7_SP07_HamTinhToan.xlsx.'
    ],
    acceptanceCriteria: 'Có đủ 4 hàm SUM, AVERAGE, MAX, MIN; vùng dữ liệu đúng và kết quả chính xác.',
    expectedOutput: 'Bảng tính Excel tích hợp đủ 4 hàm thống kê SUM, AVERAGE, MAX, MIN với nhãn minh bạch.',
    sampleProduct: {
      fileName: 'TH7_SP07_HamTinhToan.xlsx',
      notes: 'Bảng điểm 6 học sinh tính Tổng: =SUM(C2:C7), TB: =AVERAGE(C2:C7), Max: =MAX(C2:C7), Min: =MIN(C2:C7).',
      content: 'CÁC HÀM THỰC HIỆN:\n=SUM(C2:C7) -> Tổng điểm\n=AVERAGE(C2:C7) -> Điểm trung bình môn\n=MAX(C2:C7) -> Điểm cao nhất lớp\n=MIN(C2:C7) -> Điểm thấp nhất lớp'
    },
    rubric: [
      { id: 'r1', name: 'Đủ dữ liệu ít nhất 6 dòng', description: 'Có vùng dữ liệu số hợp lệ để thống kê', maxScore: 2.0 },
      { id: 'r2', name: 'Sử dụng đúng SUM & AVERAGE', description: 'Cú pháp hàm và vùng tham chiếu chính xác tuyệt đối', maxScore: 3.5 },
      { id: 'r3', name: 'Sử dụng đúng MAX & MIN', description: 'Tìm chính xác số lớn nhất và nhỏ nhất trong dãy', maxScore: 3.0 },
      { id: 'r4', name: 'Nhãn mô tả & Định dạng', description: 'Đặt tên nhãn rõ ràng cho từng dòng thống kê', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T07:16:00Z',
    isActive: true
  },
  {
    id: 'th7-sp08-dinh-dang-bang-tinh-nang-cao',
    title: 'SP08. Định dạng bảng tính nâng cao',
    gradeLevel: 'Lớp 7',
    subjectType: 'excel',
    durationMinutes: 45,
    description: 'Thực hành các kỹ năng định dạng số, trộn ô Merge & Center, đổi màu nền và kẻ khung chuyên nghiệp.',
    toolRequired: 'Excel, Calc hoặc Google Sheets.',
    targetFile: 'TH7_SP08_DinhDangBangTinh.xlsx',
    requirements: [
      'Gộp các ô tiêu đề chính bằng lệnh Merge & Center, chỉnh cỡ chữ lớn và in đậm',
      'Định dạng số phù hợp: số thập phân (1 chữ số sau dấu phẩy) hoặc định dạng tiền tệ (VNĐ)',
      'Đổi màu nền (Fill Color) cho hàng tiêu đề chính và tiêu đề cột',
      'Kẻ đường viền phân biệt: viền ngoài đậm, viền trong mảnh',
      'Căn giữa cho các cột số thứ tự và ngày tháng; lưu tệp TH7_SP08_DinhDangBangTinh.xlsx'
    ],
    steps: [
      'Mở một bảng dữ liệu đã có.',
      'Gộp các ô tiêu đề chính bằng Merge & Center và tăng kích cỡ chữ.',
      'Định dạng các cột số theo kiểu phù hợp, ví dụ có 1 chữ số thập phân hoặc kiểu tiền tệ.',
      'Đổi màu nền cho hàng tiêu đề để làm nổi bật.',
      'Kẻ đường viền cho bảng: đường viền ngoài đậm, đường viền trong mảnh.',
      'Căn giữa cho các cột số thứ tự hoặc ngày tháng.',
      'Kiểm tra tính thẩm mĩ và lưu tệp TH7_SP08_DinhDangBangTinh.xlsx.'
    ],
    acceptanceCriteria: 'Có gộp ô tiêu đề, định dạng số đúng kiểu, màu sắc hài hòa và viền bảng rõ ràng.',
    expectedOutput: 'Bảng tính được định dạng chuẩn mực thẩm mỹ: Merge tiêu đề, viền trong ngoài chuẩn, format số chuyên nghiệp.',
    sampleProduct: {
      fileName: 'TH7_SP08_DinhDangBangTinh.xlsx',
      notes: 'Bảng theo dõi thu chi/học tập với tiêu đề gộp ô, màu nền pastel trang nhã, phân cách hàng nghìn rõ ràng.',
      content: 'Tiêu đề: Gộp ô A1:E1, Chữ đậm 16pt, Nền xanh lam\nCột STT: Căn giữa\nCột Điểm/Tiền: Định dạng số có 1 chữ số thập phân (8.5) hoặc phân cách hàng nghìn (50,000 đ)\nViền: Thick Box Border ngoài, Thin Gridline bên trong'
    },
    rubric: [
      { id: 'r1', name: 'Merge & Center tiêu đề', description: 'Gộp ô chuẩn, canh giữa và tăng kích cỡ nổi bật', maxScore: 2.5 },
      { id: 'r2', name: 'Định dạng số chuyên dụng', description: 'Số thập phân hoặc tiền tệ hiển thị đúng chuẩn', maxScore: 3.0 },
      { id: 'r3', name: 'Kẻ khung viền phối hợp', description: 'Viền ngoài đậm, lưới trong mảnh sắc nét', maxScore: 2.5 },
      { id: 'r4', name: 'Phối màu nền & Căn lề', description: 'Màu nền dịu mắt, căn lề cột logic (chữ trái, số phải, STT giữa)', maxScore: 2.0 }
    ],
    createdAt: '2026-10-09T07:17:00Z',
    isActive: true
  },
  {
    id: 'th7-sp09-ve-bieu-do-bieu-dien-du-lieu',
    title: 'SP09. Vẽ biểu đồ biểu diễn dữ liệu',
    gradeLevel: 'Lớp 7',
    subjectType: 'excel',
    durationMinutes: 45,
    description: 'Chuyển đổi số liệu dạng bảng thành biểu đồ trực quan (cột, tròn) và chú thích đầy đủ.',
    toolRequired: 'Excel, Calc hoặc Google Sheets.',
    targetFile: 'TH7_SP09_BieuDo.xlsx',
    requirements: [
      'Chọn một bảng dữ liệu phù hợp (kết quả học tập hoặc cơ cấu thu chi)',
      'Tạo một biểu đồ cột (Column Chart) hoặc biểu đồ tròn (Pie Chart)',
      'Đặt tiêu đề biểu đồ rõ ràng, thể hiện đúng nội dung',
      'Bật hiển thị nhãn dữ liệu (Data Labels) hoặc phần chú giải (Legend)',
      'Bố trí biểu đồ bên cạnh hoặc phía dưới bảng, không che khuất dữ liệu; lưu tệp TH7_SP09_BieuDo.xlsx'
    ],
    steps: [
      'Chọn một bảng dữ liệu phù hợp, ví dụ kết quả học tập hoặc cơ cấu thu chi.',
      'Chọn vùng dữ liệu cần vẽ biểu đồ.',
      'Vào Insert → Charts và chọn dạng biểu đồ cột hoặc biểu đồ tròn thích hợp.',
      'Đặt tiêu đề cho biểu đồ.',
      'Thêm nhãn dữ liệu hoặc chú giải nếu cần.',
      'Kéo và chỉnh kích thước biểu đồ cho cân đối, không đè lên bảng dữ liệu.',
      'Lưu tệp TH7_SP09_BieuDo.xlsx.'
    ],
    acceptanceCriteria: 'Dạng biểu đồ phù hợp, có tiêu đề, hiển thị rõ số liệu và không che khuất bảng dữ liệu.',
    expectedOutput: 'Tệp Excel chứa bảng dữ liệu kèm biểu đồ cột hoặc tròn được gắn tiêu đề, nhãn số liệu rõ nét.',
    sampleProduct: {
      fileName: 'TH7_SP09_BieuDo.xlsx',
      notes: 'Biểu đồ so sánh điểm trung bình giữa các môn hoặc biểu đồ tròn thể hiện tỉ lệ phần trăm chi tiêu.',
      content: 'Bảng dữ liệu phía trên\nBiểu đồ phía dưới: Tiêu đề "BIỂU ĐỒ SO SÁNH ĐIỂM HỌC KỲ I"\nTrục hoành: Tên học sinh / Tên môn\nTrục tung: Điểm số từ 0 đến 10\nData Labels: Hiện số điểm trực tiếp trên đầu cột'
    },
    rubric: [
      { id: 'r1', name: 'Chọn đúng loại biểu đồ', description: 'Loại biểu đồ cột hoặc tròn phản ánh đúng bản chất dữ liệu', maxScore: 3.0 },
      { id: 'r2', name: 'Tiêu đề biểu đồ chuẩn xác', description: 'Đặt tên biểu đồ rõ nghĩa, in hoa trang trọng', maxScore: 2.5 },
      { id: 'r3', name: 'Nhãn dữ liệu & Chú giải', description: 'Có Data Labels hoặc Legend giúp người xem hiểu ngay', maxScore: 2.5 },
      { id: 'r4', name: 'Bố cục sắp đặt trang tính', description: 'Biểu đồ đặt ngay ngắn bên dưới bảng, kích thước vừa vặn', maxScore: 2.0 }
    ],
    createdAt: '2026-10-09T07:18:00Z',
    isActive: true
  },
  {
    id: 'th7-sp10-sap-xep-loc-du-lieu',
    title: 'SP10. Sắp xếp và lọc dữ liệu',
    gradeLevel: 'Lớp 7',
    subjectType: 'excel',
    durationMinutes: 45,
    description: 'Thao tác sắp xếp dữ liệu tăng/giảm dần và dùng bộ lọc Filter để trích xuất thông tin theo tiêu chí.',
    toolRequired: 'Excel, Calc hoặc Google Sheets.',
    targetFile: 'TH7_SP10_SapXepLoc.xlsx',
    requirements: [
      'Chuẩn bị bảng dữ liệu gồm ít nhất 8 dòng (VD: Danh sách điểm, sản phẩm bán lẻ)',
      'Thực hiện sắp xếp theo một cột số (ví dụ Điểm trung bình giảm dần)',
      'Bật tính năng lọc (Filter) cho hàng tiêu đề',
      'Thực hiện ít nhất 1 thao tác lọc theo điều kiện (VD: Học sinh có điểm >= 8.0)',
      'Lưu lại trạng thái bảng sau khi lọc hoặc chụp ảnh minh chứng kết quả; lưu tệp TH7_SP10_SapXepLoc.xlsx'
    ],
    steps: [
      'Chuẩn bị bảng dữ liệu gồm ít nhất 8 dòng.',
      'Chọn cột cần sắp xếp, vào Data → Sort để sắp xếp tăng dần hoặc giảm dần.',
      'Bật tính năng Filter (Lọc).',
      'Thực hiện một thao tác lọc theo điều kiện, ví dụ lọc những học sinh có điểm từ 8 trở lên.',
      'Kiểm tra kết quả lọc xem có đúng điều kiện không.',
      'Lưu tệp TH7_SP10_SapXepLoc.xlsx hoặc chụp ảnh minh chứng trạng thái đã lọc.'
    ],
    acceptanceCriteria: 'Dữ liệu được sắp xếp đúng thứ tự, bật được chế độ lọc và kết quả lọc chính xác.',
    expectedOutput: 'Bảng dữ liệu Excel có nút tam giác Filter ở tiêu đề, đã được sắp xếp giảm dần và áp dụng điều kiện lọc chuẩn.',
    sampleProduct: {
      fileName: 'TH7_SP10_SapXepLoc.xlsx',
      notes: 'Bảng 10 học sinh sắp xếp Điểm trung bình từ cao xuống thấp; Filter chọn điểm môn Tin học >= 8.5.',
      content: 'Cột Tiêu đề: Đã bật Filter (biểu tượng phễu lọc)\nSắp xếp: Điểm TB giảm dần từ 9.8 đến 6.5\nLọc: Number Filters -> Greater Than or Equal To -> 8.0'
    },
    rubric: [
      { id: 'r1', name: 'Đủ số dòng dữ liệu (>=8 dòng)', description: 'Bảng đủ lớn để thấy rõ hiệu quả sắp xếp & lọc', maxScore: 2.0 },
      { id: 'r2', name: 'Sắp xếp chuẩn xác', description: 'Thực hiện Sort tăng dần hoặc giảm dần đúng toàn bộ hàng', maxScore: 3.5 },
      { id: 'r3', name: 'Thiết lập Filter chuẩn', description: 'Bật được Filter trên đúng hàng tiêu đề cột', maxScore: 2.5 },
      { id: 'r4', name: 'Kết quả lọc chính xác', description: 'Trích xuất đúng các bản ghi thỏa mãn điều kiện lọc', maxScore: 2.0 }
    ],
    createdAt: '2026-10-09T07:19:00Z',
    isActive: true
  },
  {
    id: 'th7-sp11-thiet-ke-bai-trinh-chieu-chu-de-khoa-hoc',
    title: 'SP11. Thiết kế bài trình chiếu chủ đề khoa học',
    gradeLevel: 'Lớp 7',
    subjectType: 'powerpoint',
    durationMinutes: 45,
    description: 'Xây dựng bài thuyết trình khoa học hoàn chỉnh, ứng dụng mẫu thiết kế (Theme) và hiệu ứng chuyển trang.',
    toolRequired: 'PowerPoint hoặc Google Slides.',
    targetFile: 'TH7_SP11_ThuyetTrinhKhoaHoc.pptx',
    requirements: [
      'Bài thuyết trình tối thiểu 5 trang về chủ đề khoa học tự nhiên hoặc bảo vệ môi trường',
      'Trang 1: Trang bìa (Tiêu đề, người trình bày); Trang 2: Đặt vấn đề / Giới thiệu',
      'Trang 3 & 4: Nội dung chính và giải pháp / ứng dụng; Trang 5: Kết luận và lời cảm ơn',
      'Áp dụng Theme (mẫu bố cục) đồng nhất cho toàn bộ bài',
      'Chèn ít nhất 2 hình ảnh sắc nét, áp dụng hiệu ứng chuyển trang (Transition) nhẹ nhàng',
      'Lưu tệp TH7_SP11_ThuyetTrinhKhoaHoc.pptx'
    ],
    steps: [
      'Chọn một chủ đề khoa học hoặc đời sống em yêu thích, ví dụ Năng lượng tái tạo hoặc Ô nhiễm rác thải nhựa.',
      'Tạo bài trình chiếu gồm ít nhất 5 trang.',
      'Trang 1: Tiêu đề và người thực hiện.',
      'Trang 2: Đặt vấn đề.',
      'Trang 3–4: Nội dung chính và giải pháp.',
      'Trang 5: Kết luận và lời cảm ơn.',
      'Chọn một mẫu thiết kế (Theme) thống nhất cho toàn bộ bài.',
      'Chèn ít nhất 2 hình ảnh minh họa phù hợp.',
      'Thêm hiệu ứng chuyển trang (Transition) vừa phải, không gây rối mắt.',
      'Lưu tệp TH7_SP11_ThuyetTrinhKhoaHoc.pptx.'
    ],
    acceptanceCriteria: 'Có đủ 5 trang, đúng chủ đề, màu sắc đồng nhất, có hình minh họa và hiệu ứng hợp lí.',
    expectedOutput: 'Tệp PowerPoint 5 slide chủ đề khoa học có Theme thống nhất, 2 ảnh minh họa và hiệu ứng chuyển slide mượt mà.',
    sampleProduct: {
      fileName: 'TH7_SP11_ThuyetTrinhKhoaHoc.pptx',
      notes: 'Bài trình chiếu: "NĂNG LƯỢNG MẶT TRỜI - NGUỒN NĂNG LƯỢNG TƯƠNG LAI" (5 slides hoàn chỉnh).',
      content: 'Slide 1: Trang bìa "Năng Lượng Xanh Cho Trái Đất"\nSlide 2: Thực trạng cạn kiệt nhiên liệu hóa thạch\nSlide 3: Khái niệm & Cơ chế hoạt động của pin mặt trời\nSlide 4: Ứng dụng thực tiễn trong trường học & gia đình\nSlide 5: Thông điệp hành động và Lời cảm ơn thầy cô, các bạn'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 5 trang slide mạch lạc', description: 'Trang bìa, vấn đề, nội dung chính, giải pháp, kết luận', maxScore: 3.0 },
      { id: 'r2', name: 'Nội dung khoa học chính xác', description: 'Thông tin có chiều sâu, lập luận rõ ràng, bổ ích', maxScore: 3.0 },
      { id: 'r3', name: 'Đồng nhất Theme & Thẩm mỹ', description: 'Sử dụng Theme chuyên nghiệp, màu sắc và font chữ hài hòa', maxScore: 2.0 },
      { id: 'r4', name: 'Hình ảnh & Hiệu ứng chuyển slide', description: 'Có ít nhất 2 ảnh minh họa, hiệu ứng chuyển trang phù hợp', maxScore: 2.0 }
    ],
    createdAt: '2026-10-09T07:20:00Z',
    isActive: true
  },
  {
    id: 'th7-sp12-mo-hinh-hoa-thuat-toan-bang-so-do-khoi',
    title: 'SP12. Mô hình hóa thuật toán bằng sơ đồ khối',
    gradeLevel: 'Lớp 7',
    subjectType: 'powerpoint',
    durationMinutes: 45,
    description: 'Biểu diễn thuật toán rẽ nhánh hoặc tuần tự bằng sơ đồ khối chuẩn hình học (Shapes).',
    toolRequired: 'PowerPoint, Word hoặc công cụ vẽ trực tuyến.',
    targetFile: 'TH7_SP12_SoDoKhoi.png',
    requirements: [
      'Chọn một thuật toán quen thuộc: Tìm số lớn hơn trong 2 số, hoặc Thuật toán kiểm tra số chẵn/lẻ',
      'Dùng đúng các khối hình học chuẩn: Hình oval (Bắt đầu/Kết thúc), Hình bình hành (Nhập/Xuất)',
      'Hình chữ nhật (Xử lý/Gán), Hình thoi (Điều kiện rẽ nhánh Đúng/Sai)',
      'Dùng mũi tên có hướng rõ ràng, nối tuần tự từ trên xuống dưới',
      'Ghi nhãn nhánh "Đúng" / "Sai" rõ ràng tại khối hình thoi',
      'Xuất hoặc lưu tệp thành ảnh TH7_SP12_SoDoKhoi.png'
    ],
    steps: [
      'Chọn một thuật toán quen thuộc, ví dụ tìm số lớn hơn trong hai số hoặc kiểm tra một số là chẵn hay lẻ.',
      'Mở phần mềm vẽ hoặc PowerPoint.',
      'Dùng khối oval cho điểm Bắt đầu và Kết thúc.',
      'Dùng khối hình bình hành cho thao tác Nhập dữ liệu và Xuất kết quả.',
      'Dùng khối hình thoi cho thao tác kiểm tra điều kiện.',
      'Dùng khối hình chữ nhật cho thao tác tính toán hoặc gán giá trị nếu có.',
      'Nối các khối bằng mũi tên có hướng.',
      'Ghi chú rõ hai nhánh Đúng và Sai ở khối điều kiện.',
      'Lưu tệp hoặc chụp ảnh màn hình thành TH7_SP12_SoDoKhoi.png.'
    ],
    acceptanceCriteria: 'Dùng đúng các hình quy ước của sơ đồ khối, có đủ các bước và mũi tên chỉ đúng hướng đi của thuật toán.',
    expectedOutput: 'Ảnh sơ đồ khối mô tả thuật toán kiểm tra số chẵn/lẻ hoặc tìm Max, dùng đúng 100% hình khối chuẩn.',
    sampleProduct: {
      fileName: 'TH7_SP12_SoDoKhoi.png',
      notes: 'Sơ đồ khối: Kiểm tra số nguyên n là chẵn hay lẻ. Bắt đầu -> Nhập n -> n mod 2 = 0? -> Đúng: In Chẵn, Sai: In Lẻ -> Kết thúc.',
      content: '[Oval: Bắt đầu] -> [Hình bình hành: Nhập n] -> [Hình thoi: n chia hết cho 2?]\n  - Đúng -> [Hình bình hành: In ra "n là số chẵn"] -> [Oval: Kết thúc]\n  - Sai -> [Hình bình hành: In ra "n là số lẻ"] -> [Oval: Kết thúc]'
    },
    rubric: [
      { id: 'r1', name: 'Chuẩn quy ước hình khối', description: 'Đúng Oval, Bình hành, Chữ nhật, Thoi cho từng thao tác', maxScore: 3.5 },
      { id: 'r2', name: 'Cấu trúc thuật toán logic', description: 'Đầy đủ các bước từ Bắt đầu đến Kết thúc, không lặp vô tận', maxScore: 3.0 },
      { id: 'r3', name: 'Rẽ nhánh Đúng/Sai rõ ràng', description: 'Ghi nhãn rõ 2 nhánh điều kiện tại khối hình thoi', maxScore: 2.0 },
      { id: 'r4', name: 'Mũi tên & Trình bày', description: 'Đường nối thẳng hàng, mũi tên chỉ đúng hướng, hình vẽ sạch sẽ', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T07:21:00Z',
    isActive: true
  },
  {
    id: 'th7-sp13-mo-phong-thuat-toan-tim-kiem-tuan-tu',
    title: 'SP13. Mô phỏng thuật toán tìm kiếm tuần tự',
    gradeLevel: 'Lớp 7',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Mô phỏng từng bước thuật toán tìm kiếm tuần tự (Sequential Search) bằng bảng theo dõi chi tiết.',
    toolRequired: 'Word hoặc PowerPoint.',
    targetFile: 'TH7_SP13_TimKiemTuanTu.docx',
    requirements: [
      'Cho trước một danh sách gồm 6–8 số nguyên (ví dụ: [12, 45, 23, 67, 89, 34]) và một số cần tìm K',
      'Tạo bảng mô phỏng gồm các cột: Bước, Vị trí đang xét (i), Giá trị phần tử (A[i]), So sánh với K, Kết luận',
      'Ghi rõ diễn biến qua từng bước so sánh từ phần tử đầu tiên đến khi tìm thấy (hoặc hết dãy)',
      'Đưa ra kết luận cuối cùng: Tìm thấy tại vị trí nào hoặc Không tìm thấy',
      'Lưu tệp TH7_SP13_TimKiemTuanTu.docx'
    ],
    steps: [
      'Cho trước một danh sách gồm 6–8 số nguyên và một số cần tìm.',
      'Tạo bảng theo dõi gồm các cột: Bước, Vị trí đang xét, Giá trị, So sánh, Kết luận.',
      'Ghi lại từng bước so sánh từ phần tử đầu tiên đến khi tìm thấy hoặc hết danh sách.',
      'Nêu rõ kết quả tìm kiếm: tìm thấy ở vị trí nào hoặc không tìm thấy.',
      'Định dạng bảng rõ ràng và lưu tệp TH7_SP13_TimKiemTuanTu.docx.'
    ],
    acceptanceCriteria: 'Có dãy số ban đầu, bảng mô phỏng đủ từng bước, đối chiếu đúng và kết luận chính xác.',
    expectedOutput: 'Tài liệu Word chứa bảng bảng mô phỏng từng bước thuật toán tìm kiếm tuần tự kèm kết luận vị trí tìm thấy.',
    sampleProduct: {
      fileName: 'TH7_SP13_TimKiemTuanTu.docx',
      notes: 'Dãy A = [15, 28, 42, 60, 73, 91], Cần tìm K = 60. Mô phỏng 4 bước tìm thấy tại vị trí 4.',
      content: 'Dãy: A = [15, 28, 42, 60, 73, 91]. Giá trị cần tìm: K = 60\nBước 1: i = 1, A[1] = 15 != 60 -> Tiếp tục\nBước 2: i = 2, A[2] = 28 != 60 -> Tiếp tục\nBước 3: i = 3, A[3] = 42 != 60 -> Tiếp tục\nBước 4: i = 4, A[4] = 60 == 60 -> Tìm thấy K tại vị trí 4! Dừng thuật toán.'
    },
    rubric: [
      { id: 'r1', name: 'Đủ dữ liệu bài toán', description: 'Có dãy số ban đầu (6-8 số) và giá trị K cần tìm', maxScore: 2.0 },
      { id: 'r2', name: 'Bảng mô phỏng từng bước', description: 'Đầy đủ các cột: Bước, Chỉ số i, Giá trị, So sánh, Kết luận', maxScore: 4.0 },
      { id: 'r3', name: 'Logic so sánh chính xác', description: 'Thực hiện tuần tự từ trái qua phải, điều kiện dừng chuẩn', maxScore: 2.5 },
      { id: 'r4', name: 'Kết luận và Định dạng', description: 'Kết luận vị trí chính xác và định dạng bảng ngay ngắn', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T07:22:00Z',
    isActive: true
  },
  {
    id: 'th7-sp14-mo-phong-thuat-toan-tim-kiem-nhi-phan',
    title: 'SP14. Mô phỏng thuật toán tìm kiếm nhị phân',
    gradeLevel: 'Lớp 7',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Mô phỏng thuật toán tìm kiếm nhị phân (Binary Search) trên dãy đã sắp xếp bằng cách thu hẹp phạm vi.',
    toolRequired: 'Word hoặc PowerPoint.',
    targetFile: 'TH7_SP14_TimKiemNhiPhan.docx',
    requirements: [
      'Cho trước một danh sách gồm 7–9 số nguyên ĐÃ ĐƯỢC SẮP XẾP TĂNG DẦN và số cần tìm K',
      'Tạo bảng theo dõi gồm các cột: Bước, Phạm vi xét (Đầu - Cuối), Vị trí giữa (Giữa), Giá trị giữa (A[Giữa]), So sánh với K, Phạm vi tiếp theo',
      'Ghi rõ cách tính vị trí giữa và cách thu hẹp phạm vi tìm kiếm qua từng bước (nửa trái hoặc nửa phải)',
      'Đưa ra kết luận cuối cùng chính xác về vị trí tìm thấy hoặc không tìm thấy',
      'Lưu tệp TH7_SP14_TimKiemNhiPhan.docx'
    ],
    steps: [
      'Cho trước một danh sách gồm 7–9 số nguyên đã được sắp xếp tăng dần và một số cần tìm.',
      'Tạo bảng theo dõi gồm các cột: Bước, Phạm vi tìm kiếm, Vị trí giữa, Giá trị tại vị trí giữa, So sánh với số cần tìm, Hướng thu hẹp.',
      'Ghi lại từng bước chia đôi phạm vi tìm kiếm.',
      'Dừng lại khi tìm thấy hoặc khi phạm vi không còn phần tử nào.',
      'Kết luận vị trí của phần tử cần tìm.',
      'Lưu tệp TH7_SP14_TimKiemNhiPhan.docx.'
    ],
    acceptanceCriteria: 'Dãy ban đầu được sắp xếp, các bước thu hẹp phạm vi đúng và kết luận chính xác.',
    expectedOutput: 'Tài liệu Word chứa bảng mô phỏng từng bước chia đôi phạm vi của thuật toán tìm kiếm nhị phân.',
    sampleProduct: {
      fileName: 'TH7_SP14_TimKiemNhiPhan.docx',
      notes: 'Dãy đã sắp xếp: [11, 23, 35, 47, 59, 68, 77, 85]. Tìm K = 68. Bước 1 -> Bước 2 -> Tìm thấy tại vị trí 6.',
      content: 'Dãy đã sắp xếp: A = [11, 23, 35, 47, 59, 68, 77, 85]. K = 68\nBước 1: Dau=1, Cuoi=8 -> Giua=(1+8)/2=4, A[4]=47. Vì 68 > 47 nên xét nửa phải [5..8]\nBước 2: Dau=5, Cuoi=8 -> Giua=(5+8)/2=6, A[6]=68. Vì 68 == 68 -> Tìm thấy K tại vị trí 6! Dừng.'
    },
    rubric: [
      { id: 'r1', name: 'Dãy ban đầu đã sắp xếp', description: 'Dãy 7-9 số được xếp tăng dần và có số cần tìm K', maxScore: 2.0 },
      { id: 'r2', name: 'Công thức tính vị trí Giữa', description: 'Tính đúng Giữa = (Đầu + Cuối) / 2 ở mỗi bước', maxScore: 3.5 },
      { id: 'r3', name: 'Thu hẹp nửa trái/nửa phải', description: 'Xác định chính xác hướng thu hẹp phạm vi tìm kiếm', maxScore: 3.0 },
      { id: 'r4', name: 'Kết luận & Trình bày bảng', description: 'Kết luận chuẩn xác vị trí và trình bày bảng khoa học', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T07:23:00Z',
    isActive: true
  }
];
