import { Assignment } from '../types';

export const GRADE_9_PRODUCTS: Assignment[] = [
  {
    id: 'th9-sp01-danh-gia-do-tin-cay-thong-tin',
    title: 'SP01. Đánh giá độ tin cậy của thông tin trên Internet',
    gradeLevel: 'Lớp 9',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Tìm kiếm, so sánh và đánh giá độ tin cậy của ít nhất hai nguồn thông tin độc lập về cùng một chủ đề trên mạng.',
    toolRequired: 'Trình duyệt web và Word (hoặc bảng tính).',
    targetFile: 'TH9_SP01_DanhGiaThongTin.docx',
    requirements: [
      'Chọn một chủ đề gần gũi: môi trường, sức khỏe, khoa học hoặc công nghệ',
      'Tìm kiếm thông tin từ ít nhất hai trang web độc lập',
      'Ghi rõ tên trang web, tác giả hoặc đơn vị đăng, ngày đăng và đường dẫn (URL)',
      'Đối chiếu nội dung, bằng chứng số liệu và thời điểm cập nhật giữa hai nguồn',
      'Tạo bảng so sánh khoa học và viết kết luận đánh giá mức độ tin cậy',
      'Lưu tệp đúng tên quy định TH9_SP01_DanhGiaThongTin.docx'
    ],
    steps: [
      'Chọn một chủ đề gần gũi như môi trường, sức khỏe hoặc công nghệ.',
      'Tìm thông tin từ ít nhất hai trang web.',
      'Ghi tên trang, tác giả hoặc đơn vị đăng, ngày đăng và đường dẫn.',
      'Đối chiếu nội dung, bằng chứng và thời điểm cập nhật.',
      'Tạo bảng so sánh và viết kết luận.',
      'Kiểm tra định dạng bảng và lưu tệp đúng tên quy định.'
    ],
    acceptanceCriteria: 'Có bảng so sánh đầy đủ 2 nguồn, đối chiếu bằng chứng cụ thể và có kết luận phân tích tính tin cậy thuyết phục.',
    expectedOutput: 'Tài liệu Word chứa bảng so sánh đối chiếu đa chiều kèm kết luận xác đáng về độ tin cậy của nguồn thông tin số.',
    sampleProduct: {
      fileName: 'TH9_SP01_DanhGiaThongTin.docx',
      notes: 'Bảng đối chiếu thông tin về ô nhiễm vi nhựa giữa Cổng thông tin Bộ TN&MT và trang tin tức mạng xã hội.',
      content: 'ĐÁNH GIÁ ĐỘ TIN CẬY CỦA THÔNG TIN TRÊN INTERNET\nChủ đề: Tác hại của rác thải vi nhựa đối với sức khỏe con người\n\n1. NGUỒN 1:\n- Trang web: Cổng thông tin điện tử Bộ Tài nguyên và Môi trường (monre.gov.vn)\n- Tác giả: Viện Chiến lược và Chính sách Tài nguyên Môi trường, đăng ngày 20/04/2024\n- Nội dung: Dữ liệu đo đạc thực tế, báo cáo khoa học có kiểm chứng từ WHO.\n\n2. NGUỒN 2:\n- Trang web: Diễn đàn Sống Xanh (songxanh247.net - Blog tự do)\n- Tác giả: Ẩn danh (Nickname GreenLife), không ghi ngày cập nhật\n- Nội dung: Tổng hợp các bài viết mạng xã hội, không trích dẫn nguồn số liệu cụ thể.\n\nBẢNG ĐỐI CHIẾU TIÊU CHÍ ĐỘ TIN CẬY:\n- Nguồn gốc & Thẩm quyền: Nguồn 1 là cơ quan Chính phủ có trách nhiệm pháp lý; Nguồn 2 là trang cá nhân tự phát.\n- Bằng chứng & Kiểm chứng: Nguồn 1 có số liệu đo nồng độ và nghiên cứu kiểm chứng; Nguồn 2 nhận định cảm tính.\n- Tính cập nhật: Nguồn 1 năm 2024 rõ ràng; Nguồn 2 không xác định.\n\nKẾT LUẬN: Nguồn 1 có độ tin cậy cao và hoàn toàn chính xác để sử dụng trong học tập và nghiên cứu khoa học.'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 2 nguồn tìm kiếm', description: 'Trích dẫn ít nhất 2 nguồn tin độc lập kèm thông tin xuất bản và link', maxScore: 2.5 },
      { id: 'r2', name: 'Bảng so sánh đối chiếu', description: 'Bảng đối chiếu đủ các tiêu chí thẩm quyền, bằng chứng, thời điểm', maxScore: 3.5 },
      { id: 'r3', name: 'Kết luận có căn cứ', description: 'Rút ra kết luận thuyết phục về nguồn đáng tin cậy hơn kèm lí giải rõ ràng', maxScore: 2.5 },
      { id: 'r4', name: 'Hình thức văn bản', description: 'Trình bày Word ngay ngắn, đúng tên tệp quy định', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th9-sp02-thiet-ke-infographic-an-toan-so',
    title: 'SP02. Thiết kế infographic an toàn và văn hóa số',
    gradeLevel: 'Lớp 9',
    subjectType: 'other',
    durationMinutes: 45,
    description: 'Tạo một infographic trực quan tuyên truyền cách sử dụng Internet an toàn, văn minh và có trách nhiệm.',
    toolRequired: 'Canva, PowerPoint hoặc công cụ đồ họa trực tuyến.',
    targetFile: 'TH9_SP02_InfographicAnToan.png',
    requirements: [
      'Chọn ít nhất 4 thông điệp cốt lõi: bảo vệ mật khẩu mạnh, kiểm tra tin giả, tôn trọng người khác, bảo vệ dữ liệu cá nhân',
      'Chọn bố cục infographic hài hòa, phân cấp thị giác rõ ràng (tiêu đề, khối nội dung, hình minh họa)',
      'Sử dụng biểu tượng (icon), màu sắc tương phản dễ đọc và minh họa bắt mắt',
      'Kiểm tra lỗi chính tả, câu chữ cô đọng súc tích',
      'Xuất sản phẩm thành ảnh PNG hoặc PDF chất lượng cao, đặt tên TH9_SP02_InfographicAnToan.png'
    ],
    steps: [
      'Chọn ít nhất bốn thông điệp: bảo vệ mật khẩu, kiểm tra tin giả, tôn trọng người khác, bảo vệ dữ liệu cá nhân.',
      'Chọn công cụ thiết kế phù hợp (Canva, PowerPoint hoặc Photoshop).',
      'Sắp xếp tiêu đề, hình ảnh, biểu tượng và nội dung khoa học.',
      'Kiểm tra lỗi chính tả và khả năng đọc từ khoảng cách xa.',
      'Xuất sản phẩm thành ảnh PNG/PDF và lưu đúng tên quy định.'
    ],
    acceptanceCriteria: 'Infographic có đủ 4 thông điệp, hình ảnh biểu tượng sinh động, bố cục cân đối và xuất đúng tệp ảnh PNG/PDF.',
    expectedOutput: 'Tệp hình ảnh infographic đồ họa truyền thông thông điệp số ấn tượng, chuyên nghiệp và có tính ứng dụng tuyên truyền cao.',
    sampleProduct: {
      fileName: 'TH9_SP02_InfographicAnToan.png',
      notes: 'Infographic 4 nguyên tắc vàng của công dân số thông minh thiết kế dạng dọc.',
      content: 'TIÊU ĐỀ: 4 NGUYÊN TẮC VÀNG TRỞ THÀNH CÔNG DÂN SỐ THÔNG MINH\n1. MẬT KHẨU THÉP: Dùng từ 12 ký tự gồm chữ hoa, chữ thường, số và ký tự đặc biệt. Bật xác thực 2 lớp (2FA).\n2. TỈNH TÁO TRƯỚC TIN GIẢ: Luôn kiểm tra nguồn tin chính thống trước khi bấm like hoặc chia sẻ.\n3. VĂN HÓA ỨNG XỬ: Tôn trọng người khác trên không gian mạng, nói không với bắt nạt trực tuyến và bình luận độc hại.\n4. KÉT SẮT DỮ LIỆU: Tuyệt đối không cung cấp mã OTP, số CCCD, tài khoản cá nhân cho người lạ.\nKHẨU HIỆU: KẾT NỐI VĂN MINH - CHIA SẺ THÔNG MINH - BẢO VỆ CHÍNH MÌNH!'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 4 thông điệp', description: 'Thể hiện đầy đủ 4 nội dung trọng tâm về an toàn số và văn hóa mạng', maxScore: 3.0 },
      { id: 'r2', name: 'Bố cục & Thẩm mỹ', description: 'Phân cấp thị giác rõ ràng, màu sắc hài hòa, font chữ đồng bộ dễ đọc', maxScore: 3.0 },
      { id: 'r3', name: 'Hình ảnh & Biểu tượng', description: 'Sử dụng icon, hình minh họa phù hợp làm nổi bật thông điệp', maxScore: 2.5 },
      { id: 'r4', name: 'Định dạng & Xuất tệp', description: 'Đúng tên tệp PNG/PDF, không lỗi chính tả, sắc nét', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th9-sp03-bao-ve-du-lieu-ca-nhan',
    title: 'SP03. Bài trình chiếu về bảo vệ dữ liệu cá nhân',
    gradeLevel: 'Lớp 9',
    subjectType: 'powerpoint',
    durationMinutes: 45,
    description: 'Xây dựng bài trình chiếu chuyên đề từ 5–7 trang phân tích các nguy cơ và giải pháp bảo vệ dữ liệu cá nhân trên không gian mạng.',
    toolRequired: 'PowerPoint hoặc Google Slides.',
    targetFile: 'TH9_SP03_BaoVeDuLieu.pptx',
    requirements: [
      'Tạo bài trình chiếu hoàn chỉnh có độ dài từ 5 đến 7 trang',
      'Trang 1: Tiêu đề chuyên đề “BẢO VỆ DỮ LIỆU CÁ NHÂN TRONG KỶ NGUYÊN SỐ”, tên người thực hiện',
      'Trang 2: Nêu rõ các loại dữ liệu cá nhân cần bảo vệ và nguy cơ thường gặp',
      'Trang 3: Tình huống minh họa thực tế về lừa đảo trực tuyến hoặc lộ mật khẩu',
      'Trang 4-5: Đề xuất ít nhất bốn biện pháp phòng tránh thiết thực và hiệu quả',
      'Trang kết: Thông điệp hành động và kết luận',
      'Thêm hình ảnh phù hợp, thống nhất phông chữ và bố cục hài hòa, lưu tệp TH9_SP03_BaoVeDuLieu.pptx'
    ],
    steps: [
      'Tạo trang tiêu đề chuyên đề.',
      'Nêu các thông tin cần bảo vệ và nguy cơ thường gặp.',
      'Minh họa tình huống lừa đảo hoặc lộ mật khẩu thực tế.',
      'Đề xuất ít nhất bốn biện pháp phòng tránh an toàn.',
      'Thêm hình ảnh phù hợp, thống nhất phông chữ và bố cục.',
      'Chạy thử trình chiếu (F5) và lưu tệp đúng tên quy định.'
    ],
    acceptanceCriteria: 'Bài trình chiếu từ 5–7 trang, nội dung cảnh báo thực tế, có ít nhất 4 biện pháp phòng tránh và chạy thử mượt mà.',
    expectedOutput: 'Tệp trình chiếu PowerPoint chuẩn mực, hình ảnh sắc nét, bố cục khoa học kèm tình huống thực tiễn sinh động.',
    sampleProduct: {
      fileName: 'TH9_SP03_BaoVeDuLieu.pptx',
      notes: 'Bài thuyết trình 6 trang về bảo vệ danh tính số và phòng chống bẫy lừa đảo mạng.',
      content: 'Trang 1: BẢO VỆ DỮ LIỆU CÁ NHÂN TRONG KỶ NGUYÊN SỐ - Nhóm 1 Lớp 9A2\nTrang 2: Dữ liệu cá nhân gồm những gì? (Số CCCD, khuôn mặt, giọng nói, tài khoản ngân hàng, lịch sử định vị). Các nguy cơ: mạo danh lừa đảo, tống tiền trực tuyến.\nTrang 3: Tình huống thực tế: Cảnh giác với tin nhắn giả mạo trúng thưởng/thông báo giao hàng yêu cầu bấm vào đường link lạ để nhập mã OTP.\nTrang 4: 4 Biện pháp cốt lõi: 1. Sử dụng mật khẩu phức tạp; 2. Bật xác thực hai bước; 3. Không dùng Wi-Fi công cộng để giao dịch; 4. Thường xuyên kiểm tra quyền truy cập ứng dụng.\nTrang 5: Căn cứ pháp lý: Luật An ninh mạng và Nghị định về Bảo vệ dữ liệu cá nhân.\nTrang 6: Thông điệp: Dữ liệu của bạn là tài sản vô giá - Hãy bảo vệ trước khi quá muộn!'
    },
    rubric: [
      { id: 'r1', name: 'Số lượng & Cấu trúc slide', description: 'Đạt từ 5–7 trang với đầy đủ tiêu đề, nội dung, giải pháp và kết luận', maxScore: 2.5 },
      { id: 'r2', name: 'Tình huống minh họa', description: 'Nêu được tình huống thực tế về lừa đảo hoặc lộ lọt dữ liệu có chiều sâu', maxScore: 2.5 },
      { id: 'r3', name: 'Đủ 4 biện pháp an toàn', description: 'Đề xuất ít nhất 4 biện pháp phòng tránh cụ thể, khả thi', maxScore: 3.0 },
      { id: 'r4', name: 'Kỹ thuật trình chiếu', description: 'Định dạng phông chữ chuẩn, hình ảnh minh họa sắc nét, lưu đúng tên tệp', maxScore: 2.0 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th9-sp04-su-dung-tai-nguyen-so-dung-ban-quyen',
    title: 'SP04. Sử dụng tài nguyên số đúng bản quyền',
    gradeLevel: 'Lớp 9',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Tạo tài liệu giới thiệu chủ đề học tập có tích hợp tài nguyên số (ảnh, video, tư liệu) hợp pháp và trích dẫn bản quyền chuẩn mực.',
    toolRequired: 'Word hoặc PowerPoint.',
    targetFile: 'TH9_SP04_BanQuyenTaiNguyen.docx',
    requirements: [
      'Chọn một chủ đề học tập (lịch sử, địa lý, sinh học hoặc công nghệ)',
      'Tìm kiếm ít nhất 3 hình ảnh/tài nguyên được phép sử dụng công khai (giấy phép Creative Commons hoặc miền công cộng)',
      'Kiểm tra kỹ điều kiện sử dụng của từng tài nguyên (CC BY, CC BY-NC, CC0...)',
      'Tạo trang giới thiệu có chèn hình ảnh và nội dung diễn giải',
      'Ghi rõ nguồn, tác giả, đường dẫn và loại giấy phép bản quyền dưới mỗi tài nguyên',
      'Lưu tệp đúng tên quy định TH9_SP04_BanQuyenTaiNguyen.docx'
    ],
    steps: [
      'Chọn chủ đề và tìm hình ảnh hoặc tư liệu được phép sử dụng hợp pháp.',
      'Kiểm tra điều kiện sử dụng của từng tài nguyên (giấy phép Creative Commons).',
      'Tạo trang giới thiệu bằng công cụ văn bản Word hoặc trình chiếu.',
      'Ghi nguồn, tên tác giả, link gốc và loại giấy phép khi có thông tin.',
      'Kiểm tra nội dung, bố cục thẩm mỹ và lưu xuất tệp.'
    ],
    acceptanceCriteria: 'Tài liệu có đủ tài nguyên số hợp lệ, ghi rõ nguồn gốc, tác giả và giấy phép bản quyền rõ ràng minh bạch.',
    expectedOutput: 'Bản tài liệu học tập mẫu mực về ý thức tôn trọng sở hữu trí tuệ và trích dẫn chuẩn bản quyền số.',
    sampleProduct: {
      fileName: 'TH9_SP04_BanQuyenTaiNguyen.docx',
      notes: 'Trang giới thiệu Di sản Vịnh Hạ Long sử dụng ảnh bản quyền Creative Commons từ Wikimedia Commons và Pixabay.',
      content: 'CHUYÊN ĐỀ: KHÁM PHÁ DI SẢN THIÊN NHIÊN VỊNH HẠ LONG\n\nNội dung giới thiệu:\nVịnh Hạ Long là một trong những kỳ quan thiên nhiên thế giới nổi tiếng với hàng nghìn hòn đảo đá vôi kỳ vĩ...\n\nDANH MỤC TÀI NGUYÊN SỐ VÀ TRÍCH DẪN BẢN QUYỀN:\n1. Hình ảnh 1: Toàn cảnh Vịnh Hạ Long lúc hoàng hôn\n- Tác giả: Nguyễn Văn A (Wikimedia Commons)\n- Giấy phép: CC BY-SA 4.0 (Được phép chia sẻ và chỉnh sửa kèm ghi nhận tác giả)\n- Nguồn: https://commons.wikimedia.org/wiki/File:HaLongBaySunset.jpg\n\n2. Hình ảnh 2: Đảo hòn Trống Mái\n- Tác giả: Ảnh miễn phí bản quyền từ Pixabay (Pixabay License)\n- Giấy phép: Sử dụng tự do không cần xin phép cho mục đích phi thương mại\n- Nguồn: https://pixabay.com/photos/halong-vietnam-rock-12345/\n\nCAM KẾT BẢN QUYỀN: Toàn bộ tư liệu hình ảnh trong sản phẩm đều tuân thủ nghiêm túc Luật Sở hữu trí tuệ.'
    },
    rubric: [
      { id: 'r1', name: 'Lựa chọn tài nguyên hợp pháp', description: 'Sử dụng các tư liệu có giấy phép bản quyền mở (CC, CC0, miền công cộng)', maxScore: 3.0 },
      { id: 'r2', name: 'Trích dẫn nguồn chuẩn', description: 'Ghi đủ 4 yếu tố: tên tác giả, nguồn gốc, đường dẫn và loại giấy phép', maxScore: 3.5 },
      { id: 'r3', name: 'Nội dung chủ đề', description: 'Nội dung giới thiệu chủ đề học tập mạch lạc, có tính giáo dục', maxScore: 2.0 },
      { id: 'r4', name: 'Hình thức & Tên tệp', description: 'Trình bày trang nhã, đúng tên tệp TH9_SP04_BanQuyenTaiNguyen.docx', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th9-sp05-kham-pha-phan-mem-mo-phong',
    title: 'SP05. Báo cáo khám phá phần mềm mô phỏng học tập',
    gradeLevel: 'Lớp 9',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Thực hành tương tác với một phần mềm mô phỏng (PhET, GeoGebra, Solar System 3D...) và viết báo cáo thu hoạch khoa học.',
    toolRequired: 'Trình duyệt web/Phần mềm mô phỏng và Word.',
    targetFile: 'TH9_SP05_PhanMemMoPhong.docx',
    requirements: [
      'Lựa chọn và mở một phần mềm mô phỏng (ví dụ: PhET Interactive Simulations, Solar System Scope, GeoGebra)',
      'Tương tác điều chỉnh các thông số đầu vào và quan sát diễn biến mô phỏng',
      'Chụp ít nhất 2 ảnh màn hình minh chứng các trạng thái mô phỏng khác nhau',
      'Ghi nhận quy luật khoa học rút ra được thông qua quá trình thử nghiệm',
      'Đánh giá ưu điểm của việc sử dụng phần mềm mô phỏng so với thí nghiệm thực tế',
      'Lưu tệp đúng tên quy định TH9_SP05_PhanMemMoPhong.docx'
    ],
    steps: [
      'Mở trình duyệt và truy cập phần mềm mô phỏng (ví dụ: PhET môn Vật lý/Hóa học hoặc Solar System Scope).',
      'Thao tác tương tác: thay đổi các thông số (khối lượng, vận tốc, lực hoặc khoảng cách).',
      'Quan sát sự thay đổi của hiện tượng mô phỏng trên màn hình.',
      'Chụp ảnh màn hình (phím PrintScreen hoặc Snipping Tool) thể hiện 2 tình huống thí nghiệm.',
      'Mở Word, chèn hình ảnh minh chứng và viết báo cáo giải thích hiện tượng.',
      'Đánh giá lợi ích của mô phỏng và lưu tệp đúng tên quy định.'
    ],
    acceptanceCriteria: 'Có ít nhất 2 ảnh chụp thí nghiệm mô phỏng, phân tích rõ quy luật quan sát được và rút ra nhận xét lợi ích giáo dục.',
    expectedOutput: 'Bản báo cáo Word khoa học minh chứng trải nghiệm học tập số thông qua phần mềm mô phỏng tương tác.',
    sampleProduct: {
      fileName: 'TH9_SP05_PhanMemMoPhong.docx',
      notes: 'Báo cáo khám phá mô phỏng Định luật vạn vật hấp dẫn trên PhET Interactive Simulations.',
      content: 'BÁO CÁO THỰC HÀNH KHAI THÁC PHẦN MỀM MÔ PHÒNG\nPhần mềm: PhET Interactive Simulations (Đại học Colorado)\nChủ đề: Mô phỏng lực hấp dẫn giữa hai vật thể\n\n1. QUÁ TRÌNH THỰC HÀNH:\n- Thí nghiệm 1: Khối lượng m1 = 10kg, m2 = 10kg, khoảng cách r = 4m -> Lực F = 0.4 N.\n- Thí nghiệm 2: Tăng m1 lên 20kg, giữ nguyên khoảng cách -> Lực F tăng gấp đôi lên 0.8 N.\n- Thí nghiệm 3: Giữ nguyên khối lượng, tăng khoảng cách r lên gấp đôi (8m) -> Lực F giảm đi 4 lần (0.1 N).\n\n2. MINH CHỨNG HÌNH ẢNH:\n[Ảnh chụp màn hình Thí nghiệm 1 & Thí nghiệm 2 từ giao diện PhET]\n\n3. QUY LUẬT RÚT RA:\nLực hấp dẫn tỷ lệ thuận với tích khối lượng của hai vật và tỷ lệ nghịch với bình phương khoảng cách giữa chúng.\n\n4. ĐÁNH GIÁ LỢI ÍCH:\nPhần mềm mô phỏng giúp học sinh hình dung trực quan những hiện tượng vật lý trừu tượng mà phòng thí nghiệm trường học khó đo đạc chính xác, bảo đảm an toàn và tiết kiệm chi phí.'
    },
    rubric: [
      { id: 'r1', name: 'Thao tác mô phỏng & Minh chứng', description: 'Chụp đủ ít nhất 2 ảnh màn hình mô phỏng thể hiện rõ các trạng thái', maxScore: 3.0 },
      { id: 'r2', name: 'Phân tích quy luật khoa học', description: 'Ghi chép số liệu và giải thích chính xác hiện tượng/quy luật mô phỏng', maxScore: 3.5 },
      { id: 'r3', name: 'Đánh giá lợi ích mô phỏng', description: 'Nêu bật được vai trò của công nghệ mô phỏng trong nghiên cứu học tập', maxScore: 2.0 },
      { id: 'r4', name: 'Hình thức báo cáo', description: 'Trình bày Word mạch lạc, chèn ảnh cân đối, đặt tên tệp chuẩn', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th9-sp06-tao-so-do-tu-duy-chu-de',
    title: 'SP06. Tạo sơ đồ tư duy tóm tắt chủ đề kiến thức',
    gradeLevel: 'Lớp 9',
    subjectType: 'other',
    durationMinutes: 45,
    description: 'Sử dụng phần mềm sơ đồ tư duy để hệ thống hóa kiến thức trọng tâm của một chủ đề môn học thành sơ đồ trực quan, dễ nhớ.',
    toolRequired: 'XMind, MindMup, Word hoặc Canva.',
    targetFile: 'TH9_SP06_SoDoTuDuy.png',
    requirements: [
      'Chọn một chủ đề môn học (Tin học, Lịch sử, Sinh học, Ngữ văn hoặc Vật lý)',
      'Xác định nút trung tâm (chủ đề chính) nổi bật',
      'Phát triển ít nhất 3–4 nhánh chính (cấp 1) và các nhánh con chi tiết (cấp 2, cấp 3)',
      'Sử dụng từ khóa ngắn gọn, màu sắc phân biệt giữa các nhánh',
      'Chèn biểu tượng icon hoặc hình ảnh minh họa cho các nhánh quan trọng',
      'Xuất sơ đồ thành tệp ảnh PNG đúng tên TH9_SP06_SoDoTuDuy.png'
    ],
    steps: [
      'Mở phần mềm sơ đồ tư duy (XMind, MindMup hoặc Canva).',
      'Tạo chủ đề trung tâm: ví dụ “MẠNG MÁY TÍNH VÀ INTERNET”.',
      'Tạo 4 nhánh chính: Khái niệm - Thành phần mạng - Phân loại mạng - Lợi ích.',
      'Bổ sung các nhánh con cấp 2 và cấp 3 với từ khóa cô đọng.',
      'Định dạng màu sắc riêng cho từng nhánh và thêm biểu tượng minh họa.',
      'Kiểm tra tính logic, xuất ảnh PNG và lưu tệp đúng tên quy định.'
    ],
    acceptanceCriteria: 'Sơ đồ tư duy có đủ phân cấp từ trung tâm đến các nhánh, dùng từ khóa súc tích, màu sắc khoa học và xuất ảnh rõ nét.',
    expectedOutput: 'Tệp hình ảnh sơ đồ tư duy trực quan, cô đọng toàn bộ mạch kiến thức theo tư duy phân nhánh logic.',
    sampleProduct: {
      fileName: 'TH9_SP06_SoDoTuDuy.png',
      notes: 'Sơ đồ tư duy hệ thống hóa Chủ đề Mạng máy tính và Internet lớp 9.',
      content: 'NÚT TRUNG TÂM: MẠNG MÁY TÍNH & INTERNET\n├─ NHÁNH 1: THÀNH PHẦN MẠNG (Màu Xanh lam)\n│  ├─ Thiết bị đầu cuối: PC, Laptop, Smartphone, Máy in\n│  ├─ Thiết bị kết nối: Switch, Router, Modem, Access Point\n│  └─ Môi trường truyền dẫn: Có dây (Cáp mạng) & Không dây (Sóng Wi-Fi)\n├─ NHÁNH 2: PHÂN LOẠI MẠNG (Màu Cam)\n│  ├─ Mạng cục bộ (LAN): Phạm vi hẹp (trường học, gia đình)\n│  └─ Mạng diện rộng (WAN): Phạm vi toàn cầu (Internet)\n├─ NHÁNH 3: DỊCH VỤ INTERNET (Màu Xanh lá)\n│  ├─ Tra cứu web (WWW), Tìm kiếm\n│  ├─ Thư điện tử (Email), Tin nhắn tức thời\n│  └─ Lưu trữ đám mây (Google Drive, OneDrive)\n└─ NHÁNH 4: AN TOÀN TRUY CẬP (Màu Đỏ)\n   ├─ Mật khẩu mạnh & Xác thực 2 bước\n   └─ Phòng tránh virus & Phần mềm độc hại'
    },
    rubric: [
      { id: 'r1', name: 'Cấu trúc phân nhánh logic', description: 'Đầy đủ nút trung tâm, các nhánh chính và các nhánh phụ cấp 2, 3', maxScore: 3.0 },
      { id: 'r2', name: 'Từ khóa & Độ cô đọng', description: 'Sử dụng từ khóa súc tích, thể hiện chuẩn xác nội dung kiến thức', maxScore: 3.0 },
      { id: 'r3', name: 'Màu sắc & Biểu tượng', description: 'Phân màu khoa học giữa các nhánh, có icon/ảnh minh họa hỗ trợ ghi nhớ', maxScore: 2.5 },
      { id: 'r4', name: 'Chất lượng xuất tệp', description: 'Đúng tên tệp TH9_SP06_SoDoTuDuy.png, hình ảnh sắc nét không vỡ nét', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th9-sp07-thiet-ke-an-pham-so',
    title: 'SP07. Xử lý và thiết kế ấn phẩm số bằng công cụ đồ họa',
    gradeLevel: 'Lớp 9',
    subjectType: 'other',
    durationMinutes: 45,
    description: 'Ứng dụng các kỹ thuật chỉnh sửa hình ảnh số (cắt ghép, điều chỉnh màu sắc, hiệu ứng, typography) để thiết kế poster cổ động học đường.',
    toolRequired: 'Canva, Photoshop hoặc công cụ chỉnh sửa ảnh có sẵn.',
    targetFile: 'TH9_SP07_ThietKeAnPham.png',
    requirements: [
      'Chọn chủ đề thiết kế: Cổ động bảo vệ môi trường, văn hóa đọc sách hoặc phòng chống bạo lực học đường',
      'Thực hiện các thao tác xử lý ảnh: cắt tỉa tỷ lệ chuẩn, xóa nền hoặc ghép ảnh nền',
      'Căn chỉnh màu sắc, độ sáng, độ tương phản để tạo chiều sâu thị giác',
      'Chèn chữ tiêu đề khẩu hiệu với kiểu chữ phù hợp, dễ đọc và nổi bật',
      'Bố cục cân đối, hài hòa theo quy tắc 1/3 trong nhiếp ảnh/thiết kế đồ họa',
      'Xuất tệp ảnh PNG đúng tên TH9_SP07_ThietKeAnPham.png'
    ],
    steps: [
      'Chọn chủ đề ấn phẩm và chuẩn bị hình ảnh tư liệu gốc chất lượng tốt.',
      'Khởi động công cụ thiết kế đồ họa (Canva hoặc phần mềm biên tập ảnh).',
      'Cắt chỉnh kích thước ảnh theo khổ chuẩn poster hoặc banner.',
      'Áp dụng bộ lọc màu, độ tương phản và hiệu ứng hòa trộn.',
      'Chèn tiêu đề thông điệp, điều chỉnh kích thước và độ tương phản của chữ.',
      'Kiểm tra tổng thể bố cục thị giác, xuất tệp PNG và lưu đúng tên quy định.'
    ],
    acceptanceCriteria: 'Ấn phẩm có bố cục hài hòa, hình ảnh được xử lý khéo léo, chữ sắc nét dễ đọc và truyền tải thông điệp ý nghĩa.',
    expectedOutput: 'Tác phẩm đồ họa số chất lượng cao thể hiện kỹ năng thẩm mỹ và thao tác xử lý ảnh đa phương tiện thành thạo.',
    sampleProduct: {
      fileName: 'TH9_SP07_ThietKeAnPham.png',
      notes: 'Poster cổ động "Vì một mái trường không rác thải nhựa" kích thước chuẩn tỷ lệ 3:4.',
      content: 'THIẾT KẾ POSTER HỌC ĐƯỜNG:\n- Chủ đề: HÀNH ĐỘNG HÔM NAY - VÌ MÔI TRƯỜNG NGÀY MAI\n- Hình ảnh trung tâm: Bàn tay học sinh nâng niu mầm cây xanh lồng ghép với hình ảnh bình nước thủy tinh thay thế chai nhựa dùng một lần.\n- Kỹ thuật đồ họa: Sử dụng kỹ thuật hòa trộn ánh sáng (overlay), làm mờ hậu cảnh để nổi bật chủ thể, tông màu xanh ngọc bích chủ đạo.\n- Khẩu hiệu chính: "NÓI KHÔNG VỚI NHỰA DÙNG MỘT LẦN - BẢO VỆ TƯƠNG LAI XANH"\n- Thông tin chân trang: Liên đội Trường THCS - Phát động phong trào tháng Thanh niên 2026.'
    },
    rubric: [
      { id: 'r1', name: 'Kỹ thuật xử lý ảnh', description: 'Cắt cúp, chỉnh màu, hòa trộn và tối ưu hóa hình ảnh sắc nét', maxScore: 3.0 },
      { id: 'r2', name: 'Bố cục & Typography', description: 'Sắp xếp chữ tiêu đề và thông điệp hợp lý, tỷ lệ tương phản tốt', maxScore: 3.0 },
      { id: 'r3', name: 'Thông điệp truyền thông', description: 'Ý tưởng sáng tạo, có tính tuyên truyền và giáo dục học đường', maxScore: 2.5 },
      { id: 'r4', name: 'Định dạng sản phẩm', description: 'Xuất file PNG đúng tên TH9_SP07_ThietKeAnPham.png, độ phân giải cao', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th9-sp08-bien-tap-video-ngan',
    title: 'SP08. Xây dựng kịch bản và biên tập video ngắn',
    gradeLevel: 'Lớp 9',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Lập kịch bản phân cảnh chi tiết và thực hành biên tập một video ngắn (1-2 phút) giới thiệu hoạt động học tập hoặc trường lớp.',
    toolRequired: 'Word (viết kịch bản) và phần mềm dựng video (CapCut, Canva hoặc Clipchamp).',
    targetFile: 'TH9_SP08_BienTapVideo.docx',
    requirements: [
      'Xây dựng bảng kịch bản phân cảnh gồm các cột: Cảnh, Thời lượng, Hình ảnh/Góc quay, Âm thanh/Lời thoại, Hiệu ứng chuyển cảnh',
      'Kịch bản gồm ít nhất 4–5 cảnh mạch lạc với tổng thời lượng từ 1–2 phút',
      'Thực hành dựng video trên phần mềm: cắt ghép clip, chèn nhạc nền bản quyền mở',
      'Chèn tiêu đề đầu video, phụ đề nội dung và thông tin nhóm thực hiện ở cảnh kết',
      'Chụp ảnh màn hình giao diện dòng thời gian (timeline) biên tập video chèn vào tài liệu Word',
      'Lưu tệp kịch bản và minh chứng đúng tên TH9_SP08_BienTapVideo.docx'
    ],
    steps: [
      'Mở Word, tạo bảng kịch bản phân cảnh video chi tiết.',
      'Điền thông tin từng cảnh: góc quay, thời lượng, lời bình và nhạc nền.',
      'Sử dụng phần mềm dựng video (CapCut/Clipchamp) để ghép các đoạn video và ảnh.',
      'Thêm hiệu ứng chuyển tiếp (transition), chèn nhạc nền và tạo phụ đề (subtitles).',
      'Chụp ảnh màn hình dòng thời gian (timeline) dựng video trong phần mềm.',
      'Chèn ảnh minh chứng vào tệp Word kịch bản và lưu tệp đúng tên quy định.'
    ],
    acceptanceCriteria: 'Bảng kịch bản phân cảnh đủ 5 cột tiêu chuẩn, có ảnh chụp timeline biên tập video thực tế và khớp thời lượng.',
    expectedOutput: 'Tài liệu kịch bản chuyên nghiệp kèm minh chứng quá trình biên tập video đa phương tiện hiện đại.',
    sampleProduct: {
      fileName: 'TH9_SP08_BienTapVideo.docx',
      notes: 'Kịch bản phân cảnh video "Một ngày trải nghiệm tại phòng thực hành Tin học" thời lượng 90 giây.',
      content: 'KỊCH BẢN PHÂN CẢNH VIDEO NGẮN\nTên video: "Trải nghiệm số tại phòng máy THCS"\nThời lượng dự kiến: 90 giây\n\nBẢNG PHÂN CẢNH CHI TIẾT:\n- Cảnh 1 (00-10s): Toàn cảnh cổng trường và hành lang phòng máy. Nhạc nền nhẹ nhàng vui tươi. Tiêu đề xuất hiện: "Chào mừng đến với CLB Tin học 9".\n- Cảnh 2 (10-35s): Cận cảnh học sinh khởi động máy, đăng nhập hệ thống LabGrade nộp bài thực hành. Lời bình: "Các bạn học sinh tự tin thao tác trên phần mềm trực tuyến...".\n- Cảnh 3 (35-65s): Phỏng vấn nhanh bạn nhóm trưởng về trải nghiệm chấm điểm tự động. Góc quay trung cảnh.\n- Cảnh 4 (65-80s): Màn hình máy chiếu tổng kết bảng xếp hạng thi đua của lớp. Hiệu ứng vỗ tay chúc mừng.\n- Cảnh 5 (80-90s): Cảnh kết chào tạm biệt, thông tin ekip thực hiện nhóm 9A2.\n\nMINH CHỨNG BIÊN TẬP:\n[Ảnh chụp màn hình timeline CapCut với 3 layer video, 2 layer text và 1 track audio]'
    },
    rubric: [
      { id: 'r1', name: 'Bảng kịch bản phân cảnh', description: 'Đầy đủ 5 cột: Cảnh, Thời lượng, Hình ảnh, Âm thanh, Hiệu ứng', maxScore: 3.5 },
      { id: 'r2', name: 'Minh chứng dựng video', description: 'Có ảnh chụp timeline biên tập thực tế trên phần mềm dựng phim', maxScore: 3.0 },
      { id: 'r3', name: 'Tính khả thi & Sáng tạo', description: 'Ý tưởng mạch lạc, thời lượng hợp lý, âm nhạc và lời thoại hài hòa', maxScore: 2.0 },
      { id: 'r4', name: 'Định dạng tài liệu', description: 'Trình bày Word chuẩn mực, đúng tên tệp TH9_SP08_BienTapVideo.docx', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th9-sp09-bang-tinh-thong-ke-nang-cao',
    title: 'SP09. Bảng tính phân tích và thống kê dữ liệu nâng cao',
    gradeLevel: 'Lớp 9',
    subjectType: 'excel',
    durationMinutes: 45,
    description: 'Thiết kế bảng tính Excel quản lý dữ liệu học tập/khảo sát, sử dụng thành thạo các hàm COUNTIF, SUMIF, AVERAGE và IF lồng nhau.',
    toolRequired: 'Microsoft Excel hoặc Google Sheets.',
    targetFile: 'TH9_SP09_BangTinhThongKe.xlsx',
    requirements: [
      'Tạo bảng số liệu có ít nhất 10 dòng dữ liệu thực tế (danh sách học sinh, điểm thi hoặc khảo sát)',
      'Sử dụng hàm AVERAGE để tính điểm trung bình chính xác đến 1 chữ số thập phân',
      'Sử dụng hàm IF lồng nhau để xếp loại học lực: Giỏi (>=8.0), Khá (>=6.5), Đạt (>=5.0), Chưa đạt (<5.0)',
      'Sử dụng hàm COUNTIF để đếm số lượng học sinh từng loại học lực',
      'Sử dụng hàm SUMIF để tính tổng điểm hoặc thống kê theo nhóm điều kiện cụ thể',
      'Định dạng bảng tính chuyên nghiệp (kẻ viền, tô màu tiêu đề, căn lề số và chữ chuẩn)',
      'Lưu tệp đúng tên quy định TH9_SP09_BangTinhThongKe.xlsx'
    ],
    steps: [
      'Mở Excel và tạo bảng tính mới.',
      'Gõ tiêu đề bảng và nhập danh sách ít nhất 10 học sinh với các cột điểm thành phần.',
      'Lập công thức tính điểm trung bình bằng hàm =AVERAGE(...) hoặc tính điểm có hệ số.',
      'Lập công thức xếp loại học lực bằng hàm =IF(...) lồng nhiều điều kiện.',
      'Lập bảng thống kê tổng hợp ở dưới: dùng =COUNTIF(...) đếm số lượng Giỏi, Khá, Đạt...',
      'Dùng hàm =SUMIF(...) tính tổng số điểm theo điều kiện quy định.',
      'Căn chỉnh định dạng số liệu, kẻ khung viền đẹp mắt và lưu tệp đúng tên.'
    ],
    acceptanceCriteria: 'Bảng tính có đủ công thức AVERAGE, IF lồng, COUNTIF, SUMIF chạy đúng kết quả và định dạng bảng ngay ngắn.',
    expectedOutput: 'Bảng tính Excel chuẩn hóa với công thức hàm logic tự động hóa thống kê không có lỗi #VALUE! hay #REF!.',
    sampleProduct: {
      fileName: 'TH9_SP09_BangTinhThongKe.xlsx',
      notes: 'Bảng điểm và kết quả học tập kỳ 1 lớp 9A2 với 12 học sinh và bảng phân tích hàm thống kê.',
      content: 'CẤU TRÚC BẢNG TÍNH EXCEL:\n- Cột A-B: STT, Họ và tên (12 học sinh)\n- Cột C-E: Điểm Toán, Điểm Văn, Điểm Tin học\n- Cột F (ĐTB): =ROUND(AVERAGE(C4:E4), 1)\n- Cột G (Xếp loại): =IF(F4>=8,"Giỏi",IF(F4>=6.5,"Khá",IF(F4>=5,"Đạt","Chưa đạt")))\n\nBẢNG THỐNG KÊ TỔNG HỢP:\n- Số học sinh Giỏi: =COUNTIF($G$4:$G$15, "Giỏi") -> Kết quả: 5\n- Số học sinh Khá: =COUNTIF($G$4:$G$15, "Khá") -> Kết quả: 5\n- Số học sinh Đạt: =COUNTIF($G$4:$G$15, "Đạt") -> Kết quả: 2\n- Tổng điểm các môn của nhóm Giỏi: =SUMIF($G$4:$G$15, "Giỏi", $F$4:$F$15)'
    },
    rubric: [
      { id: 'r1', name: 'Dữ liệu & Công thức ĐTB', description: 'Nhập đủ 10+ dòng dữ liệu, công thức tính trung bình chuẩn xác', maxScore: 2.5 },
      { id: 'r2', name: 'Hàm IF xếp loại lồng nhau', description: 'Cài đặt hàm IF lồng nhiều nhánh xếp loại chính xác không lỗi', maxScore: 3.0 },
      { id: 'r3', name: 'Hàm COUNTIF & SUMIF', description: 'Ứng dụng chính xác các hàm thống kê theo điều kiện trong bảng tổng hợp', maxScore: 3.0 },
      { id: 'r4', name: 'Trình bày bảng tính', description: 'Kẻ viền, tô màu, định dạng số chuẩn, lưu đúng tên tệp', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th9-sp10-truc-quan-hoa-bieu-do',
    title: 'SP10. Trực quan hóa dữ liệu bằng biểu đồ nâng cao',
    gradeLevel: 'Lớp 9',
    subjectType: 'excel',
    durationMinutes: 45,
    description: 'Vẽ và định dạng các loại biểu đồ Excel phù hợp (biểu đồ cột, hình tròn hoặc đường) để phân tích so sánh và nhận xét xu hướng số liệu.',
    toolRequired: 'Microsoft Excel hoặc Google Sheets.',
    targetFile: 'TH9_SP10_BieuDoThongKe.xlsx',
    requirements: [
      'Sử dụng bảng dữ liệu thống kê từ SP09 hoặc bộ dữ liệu khảo sát thực tế',
      'Tạo ít nhất 2 dạng biểu đồ: 1 biểu đồ tròn (thể hiện cơ cấu tỷ lệ) và 1 biểu đồ cột/đường (so sánh số lượng hoặc tiến trình)',
      'Thêm đầy đủ các thành phần biểu đồ: Tiêu đề biểu đồ (Chart Title), Nhãn dữ liệu (Data Labels), Chú giải (Legend)',
      'Định dạng màu sắc trực quan, các phần trăm hiển thị rõ ràng',
      'Viết 1 đoạn nhận xét phân tích xu hướng hoặc nhận định rút ra từ biểu đồ ngay bên dưới',
      'Lưu tệp đúng tên quy định TH9_SP10_BieuDoThongKe.xlsx'
    ],
    steps: [
      'Mở Excel chứa bảng số liệu đã hoàn thiện.',
      'Chọn vùng dữ liệu cần trực quan hóa (ví dụ: Cơ cấu xếp loại học sinh).',
      'Vào Insert → Charts → chọn biểu đồ hình tròn (Pie Chart 2D hoặc 3D).',
      'Thêm tiêu đề: “TỶ LỆ XẾP LOẠI HỌC TẬP KHỐI 9”, bật Data Labels hiển thị số %.',
      'Tiếp tục tạo biểu đồ cột (Column Chart) so sánh điểm trung bình giữa các tổ.',
      'Tùy chỉnh màu sắc hài hòa và thêm hộp văn bản nhận xét kết quả.',
      'Lưu tệp đúng tên quy định.'
    ],
    acceptanceCriteria: 'Có ít nhất 2 dạng biểu đồ hoàn chỉnh, có đủ nhãn số liệu, chú giải và đoạn nhận xét phân tích sâu sắc.',
    expectedOutput: 'Bảng tính Excel trực quan sinh động với hệ thống biểu đồ chuẩn mực phục vụ báo cáo khoa học.',
    sampleProduct: {
      fileName: 'TH9_SP10_BieuDoThongKe.xlsx',
      notes: 'Hệ thống biểu đồ phân tích cơ cấu học lực và so sánh điểm trung bình các môn học.',
      content: 'CẤU TRÚC TRỰC QUAN HÓA BẢNG TÍNH:\n1. BIỂU ĐỒ HÌNH TRÒN: "Cơ cấu xếp loại học sinh lớp 9A2"\n- Hiển thị tỷ lệ: Giỏi (41.7%), Khá (41.7%), Đạt (16.6%)\n- Nhãn nhãn dữ liệu nằm ngoài lát cắt, có chú giải màu rõ nét.\n\n2. BIỂU ĐỒ CỘT: "So sánh điểm trung bình các môn Toán, Văn, Tin học"\n- Trục ngang (X): Tên 4 tổ học tập\n- Trục dọc (Y): Thang điểm từ 0 đến 10\n- Mỗi tổ có 3 cột màu so sánh trực quan.\n\n3. ĐOẠN NHẬN XÉT PHÂN TÍCH:\n- Tỷ lệ học sinh Khá và Giỏi chiếm đa số (trên 83%), cho thấy chất lượng học tập đồng đều.\n- Môn Tin học có điểm trung bình cao nhất (8.4 điểm), môn Toán và Văn cần bổ sung thêm chuyên đề ôn tập cho Tổ 3.'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 2 loại biểu đồ', description: 'Tạo đúng biểu đồ tròn (tỷ lệ cơ cấu) và biểu đồ cột/đường (so sánh)', maxScore: 3.0 },
      { id: 'r2', name: 'Đầy đủ thành phần biểu đồ', description: 'Có đủ Chart Title, Data Labels, Legend, trục tọa độ rõ ràng', maxScore: 3.0 },
      { id: 'r3', name: 'Nhận xét phân tích số liệu', description: 'Viết nhận xét sắc bén, rút ra kết luận logic từ dữ liệu biểu đồ', maxScore: 2.5 },
      { id: 'r4', name: 'Thẩm mỹ & Tên tệp', description: 'Màu sắc hài hòa, bố cục gọn gàng, lưu đúng tên tệp', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th9-sp11-thuat-toan-tim-kiem',
    title: 'SP11. Mô phỏng và cài đặt thuật toán tìm kiếm',
    gradeLevel: 'Lớp 9',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Trình bày thuật toán tìm kiếm tuần tự và tìm kiếm nhị phân, vẽ sơ đồ khối và so sánh số bước thực hiện của hai thuật toán.',
    toolRequired: 'Word, PowerPoint hoặc Scratch/Python.',
    targetFile: 'TH9_SP11_ThuatToanTimKiem.docx',
    requirements: [
      'Cho một dãy số nguyên gồm ít nhất 8 phần tử đã được sắp xếp tăng dần',
      'Mô tả các bước thực hiện thuật toán Tìm kiếm tuần tự (Linear Search) để tìm một giá trị X',
      'Mô tả các bước thực hiện thuật toán Tìm kiếm nhị phân (Binary Search) để tìm giá trị X',
      'Vẽ sơ đồ khối thuật toán hoặc viết mã lệnh chương trình (Scratch/Python)',
      'Lập bảng so sánh số lần lặp/số phép so sánh giữa 2 thuật toán trong trường hợp tốt nhất và xấu nhất',
      'Rút ra kết luận về hiệu quả vượt trội của tìm kiếm nhị phân trên dãy đã sắp xếp',
      'Lưu tệp đúng tên quy định TH9_SP11_ThuatToanTimKiem.docx'
    ],
    steps: [
      'Mở Word, ghi tiêu đề “BÁO CÁO THUẬT TOÁN TÌM KIẾM TUẦN TỰ VÀ NHỊ PHÂN”.',
      'Khởi tạo dãy số đã sắp xếp: ví dụ A = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91] và khóa tìm kiếm X = 38.',
      'Trình bày diễn giải từng bước tìm kiếm theo thuật toán tuần tự.',
      'Trình bày diễn giải từng bước tìm kiếm theo thuật toán nhị phân (chỉ rõ vị trí Left, Right, Mid).',
      'Vẽ sơ đồ khối thuật toán hoặc chèn ảnh mã lệnh minh họa.',
      'Lập bảng so sánh số bước và viết kết luận đánh giá hiệu quả thuật toán.',
      'Lưu tệp đúng tên quy định.'
    ],
    acceptanceCriteria: 'Mô tả chính xác cơ chế của 2 thuật toán, xác định đúng các chỉ số Left/Right/Mid và bảng so sánh số bước có căn cứ.',
    expectedOutput: 'Tài liệu Word phân tích thuật toán chuẩn mực, sơ đồ khối rõ ràng kèm bảng số liệu đối chiếu khách quan.',
    sampleProduct: {
      fileName: 'TH9_SP11_ThuatToanTimKiem.docx',
      notes: 'Báo cáo thuật toán tìm kiếm tuần tự và nhị phân trên dãy 10 số nguyên.',
      content: 'BÁO CÁO MÔ PHỎNG THUẬT TOÁN TÌM KIẾM\nDãy số A = [2, 7, 11, 15, 20, 28, 35, 42, 60, 85]. Khóa tìm kiếm X = 35.\n\n1. TÌM KIẾM TUẦN TỰ (Linear Search):\n- Duyệt từ đầu đến cuối dãy: So sánh X với A[0]=2, A[1]=7, A[2]=11, A[3]=15, A[4]=20, A[5]=28, A[6]=35 -> Tìm thấy tại vị trí chỉ số 6 sau 7 lần so sánh.\n\n2. TÌM KIẾM NHỊ PHÂN (Binary Search):\n- Lần 1: Left=0, Right=9 -> Mid=(0+9)//2=4. A[4]=20 < 35 -> Tìm nửa phải: Left=5, Right=9.\n- Lần 2: Mid=(5+9)//2=7. A[7]=42 > 35 -> Tìm nửa trái: Left=5, Right=6.\n- Lần 3: Mid=(5+6)//2=5. A[5]=28 < 35 -> Left=6, Right=6.\n- Lần 4: Mid=6. A[6]=35 == X -> Tìm thấy sau 4 lần so sánh!\n\n3. BẢNG SO SÁNH HIỆU QUẢ:\n- Số bước tìm thấy: Tuần tự = 7 bước; Nhị phân = 4 bước.\n- Trường hợp xấu nhất (X không có trong dãy): Tuần tự = 10 bước; Nhị phân = 4 bước (log2(N)).\n- KẾT LUẬN: Tìm kiếm nhị phân có hiệu quả và tốc độ vượt trội trên tập dữ liệu lớn đã được sắp xếp.'
    },
    rubric: [
      { id: 'r1', name: 'Mô tả thuật toán tuần tự', description: 'Trình bày đúng trình tự duyệt và số bước so sánh tuần tự', maxScore: 2.5 },
      { id: 'r2', name: 'Mô tả thuật toán nhị phân', description: 'Xác định đúng chỉ số Left, Right, Mid qua từng vòng lặp thu hẹp phạm vi', maxScore: 3.5 },
      { id: 'r3', name: 'Sơ đồ khối hoặc mã lệnh', description: 'Có sơ đồ khối thuật toán hoặc code Scratch/Python minh họa chuẩn', maxScore: 2.5 },
      { id: 'r4', name: 'Bảng so sánh & Kết luận', description: 'Bảng so sánh số bước logic và lưu đúng tên tệp quy định', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th9-sp12-thuat-toan-sap-xep',
    title: 'SP12. Mô phỏng và cài đặt thuật toán sắp xếp',
    gradeLevel: 'Lớp 9',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Trình bày thuật toán sắp xếp nổi bọt (Bubble Sort) hoặc sắp xếp chọn (Selection Sort), minh họa từng bước hoán đổi và lập trình chạy thử.',
    toolRequired: 'Word, PowerPoint hoặc Scratch/Python.',
    targetFile: 'TH9_SP12_ThuatToanSapXep.docx',
    requirements: [
      'Cho một dãy số nguyên gồm ít nhất 6 phần tử chưa có thứ tự',
      'Mô tả chi tiết từng bước hoán đổi các phần tử qua các vòng lặp theo thuật toán sắp xếp nổi bọt hoặc sắp xếp chọn',
      'Vẽ sơ đồ khối thuật toán hoặc viết mã lệnh chương trình (Scratch/Python)',
      'Lập bảng theo dõi trạng thái của dãy số sau mỗi lượt duyệt (pass)',
      'Chạy thử và ghi nhận kết quả dãy số sau khi sắp xếp tăng dần',
      'Lưu tệp đúng tên quy định TH9_SP12_ThuatToanSapXep.docx'
    ],
    steps: [
      'Mở Word, ghi tiêu đề “MÔ PHỎNG THUẬT TOÁN SẮP XẾP NỔI BỌT / CHỌN”.',
      'Cho dãy số ban đầu: ví dụ A = [45, 12, 85, 32, 89, 23].',
      'Trình bày lượt 1: so sánh và hoán đổi các cặp phần tử kề nhau, đưa phần tử lớn nhất về cuối dãy.',
      'Trình bày lượt 2, lượt 3... cho đến khi dãy hoàn toàn được sắp xếp tăng dần.',
      'Vẽ sơ đồ khối thuật toán hoặc chèn ảnh mã lệnh Scratch/Python.',
      'Lập bảng theo dõi kết quả sau từng lượt duyệt và lưu tệp đúng tên quy định.'
    ],
    acceptanceCriteria: 'Mô tả đúng các bước hoán đổi giá trị qua từng lượt lặp, có bảng trạng thái biến đổi của dãy và thuật toán chạy ra kết quả đúng.',
    expectedOutput: 'Tài liệu Word phân tích chi tiết diễn biến sắp xếp từng vòng lặp, minh chứng tư duy thuật toán chặt chẽ.',
    sampleProduct: {
      fileName: 'TH9_SP12_ThuatToanSapXep.docx',
      notes: 'Báo cáo mô phỏng thuật toán sắp xếp nổi bọt trên dãy số gồm 6 phần tử.',
      content: 'BÁO CÁO MÔ PHỎNG THUẬT TOÁN SẮP XẾP NỔI BỌT (BUBBLE SORT)\nDãy ban đầu: A = [5, 2, 8, 4, 1, 9] (n = 6 phần tử)\n\nDIỄN BIẾN TỪNG LƯỢT DUYỆT:\n- Lượt 1: So sánh từng cặp kề nhau:\n  + (5, 2) -> hoán đổi -> [2, 5, 8, 4, 1, 9]\n  + (5, 8) -> đúng thứ tự\n  + (8, 4) -> hoán đổi -> [2, 5, 4, 8, 1, 9]\n  + (8, 1) -> hoán đổi -> [2, 5, 4, 1, 8, 9]\n  + (8, 9) -> đúng thứ tự -> Số 9 đã vào đúng vị trí cuối cùng!\n- Lượt 2: Duyệt tiếp đến vị trí n-2 -> Kết quả: [2, 4, 1, 5, 8, 9]\n- Lượt 3: Duyệt tiếp -> Kết quả: [2, 1, 4, 5, 8, 9]\n- Lượt 4: Duyệt tiếp -> Kết quả: [1, 2, 4, 5, 8, 9]\n- Lượt 5: Không còn cặp nào cần đổi chỗ -> Thuật toán kết thúc!\n\nDãy sau khi sắp xếp tăng dần: [1, 2, 4, 5, 8, 9].\n\nMÃ NGUỒN PYTHON MINH HỌA:\ndef bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]'
    },
    rubric: [
      { id: 'r1', name: 'Mô tả diễn biến lượt duyệt', description: 'Trình bày chuẩn xác từng lượt so sánh và hoán đổi vị trí', maxScore: 3.5 },
      { id: 'r2', name: 'Bảng theo dõi trạng thái', description: 'Có bảng ghi nhận trạng thái dãy số sau mỗi lượt duyệt rõ ràng', maxScore: 2.5 },
      { id: 'r3', name: 'Sơ đồ khối hoặc mã nguồn', description: 'Có sơ đồ khối thuật toán hoặc mã chương trình Python/Scratch', maxScore: 2.5 },
      { id: 'r4', name: 'Kết quả & Định dạng', description: 'Kết quả sắp xếp chuẩn, tài liệu trình bày đẹp, đúng tên tệp', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th9-sp13-tro-choi-trac-nghiem-tinh-diem',
    title: 'SP13. Xây dựng trò chơi trắc nghiệm tương tác có tính điểm',
    gradeLevel: 'Lớp 9',
    subjectType: 'other',
    durationMinutes: 45,
    description: 'Lập trình một dự án trò chơi trắc nghiệm kiến thức bằng Scratch hoặc Python có tính năng hỏi đáp tương tác, tính điểm và tổng kết.',
    toolRequired: 'Scratch 3.0 (.sb3) hoặc Python (.py).',
    targetFile: 'TH9_SP13_TroChoiTracNghiem.sb3',
    requirements: [
      'Xây dựng ngân hàng câu hỏi gồm ít nhất 5 câu hỏi trắc nghiệm kiến thức Tin học hoặc học tập',
      'Tạo và sử dụng biến Điểm số (Score) và biến Câu hỏi (Question)',
      'Lập trình nhân vật hiển thị câu hỏi và chờ người chơi nhập câu trả lời (A, B, C, D hoặc từ khóa)',
      'Sử dụng cấu trúc rẽ nhánh nếu... thì... nếu không thì... để kiểm tra đáp án đúng/sai',
      'Trả lời đúng: tăng điểm (+10 hoặc +1), phát âm thanh vui tươi; Trả lời sai: thông báo đáp án đúng',
      'Khi hoàn thành 5 câu, hiển thị thông báo tổng điểm và xếp loại người chơi',
      'Lưu tệp dự án đúng tên TH9_SP13_TroChoiTracNghiem.sb3 (hoặc .py)'
    ],
    steps: [
      'Mở Scratch và thiết kế giao diện sân khấu: chọn nhân vật dẫn chương trình (Quiz Master).',
      'Tạo 2 danh sách (List): DanhSachCauHoi và DanhSachDapAn.',
      'Tạo biến: DiemSo (khởi tạo bằng 0) và ViTri (khởi tạo bằng 1).',
      'Sử dụng vòng lặp lặp 5 lần: hỏi câu hỏi tương ứng và nhận câu trả lời.',
      'Kiểm tra câu trả lời: nếu trả lời = đáp án thì thay đổi Điểm số một lượng 10 và nói "Chính xác!", ngược lại nói "Rất tiếc!".',
      'Sau vòng lặp: nhân vật thông báo tổng điểm và lời chúc mừng.',
      'Chạy thử toàn bộ trò chơi, lưu tệp dự án đúng tên quy định.'
    ],
    acceptanceCriteria: 'Trò chơi có đủ 5 câu hỏi, hiển thị tương tác mượt mà, biến điểm số cập nhật chuẩn xác và có thông báo tổng kết cuối game.',
    expectedOutput: 'Tệp dự án Scratch (.sb3) hoặc mã nguồn Python (.py) hoàn chỉnh chạy ổn định, có tính giải trí và giáo dục cao.',
    sampleProduct: {
      fileName: 'TH9_SP13_TroChoiTracNghiem.sb3',
      notes: 'Trò chơi "Đấu trí Tin học 9" với 5 câu hỏi trắc nghiệm âm thanh sinh động.',
      content: 'THIẾT KẾ KỊCH BẢN TRÒ CHƠI TRẮC NGHIỆM:\n- Nhân vật chính: Chú mèo Scratch hoặc Giáo sư Cú Vọ.\n- Biến sử dụng: DiemSo, CauSo, CauTraLoi.\n- 5 Câu hỏi trắc nghiệm:\n  1. Thiết bị nào sau đây dùng để kết nối mạng không dây? (A. Chuột, B. Router Wi-Fi, C. Máy in, D. Bàn phím) -> Đáp án: B\n  2. Trong Excel, hàm nào dùng để đếm có điều kiện? (A. SUM, B. AVERAGE, C. COUNTIF, D. MAX) -> Đáp án: C\n  3. Thuật toán tìm kiếm nhị phân yêu cầu dãy số phải như thế nào? (A. Đã sắp xếp, B. Bất kỳ, C. Toàn số chẵn, D. Giảm dần) -> Đáp án: A\n  4. Giấy phép Creative Commons nào cho phép chia sẻ nhưng cấm thương mại? (A. CC0, B. CC BY-NC, C. Public Domain, D. All Rights Reserved) -> Đáp án: B\n  5. Đâu là nguy cơ bảo mật khi dùng mạng công cộng? (A. Hao pin, B. Tấn công nghe lén dữ liệu, C. Máy tính chạy chậm, D. Hỏng màn hình) -> Đáp án: B\n- Xử lý kết thúc game: Nếu DiemSo == 50 -> "Xuất sắc! Bạn là chuyên gia Tin học!".'
    },
    rubric: [
      { id: 'r1', name: 'Ngân hàng 5 câu hỏi', description: 'Thiết kế đủ ít nhất 5 câu hỏi trắc nghiệm chất lượng, có đáp án chuẩn', maxScore: 2.5 },
      { id: 'r2', name: 'Lập trình biến & Rẽ nhánh', description: 'Quản lý biến điểm số chính xác, khối lệnh kiểm tra đúng/sai chuẩn mực', maxScore: 3.5 },
      { id: 'r3', name: 'Hiệu ứng & Trải nghiệm tương tác', description: 'Âm thanh phản hồi sinh động, thông báo tổng kết cuối trò chơi', maxScore: 2.5 },
      { id: 'r4', name: 'Định dạng & Chạy thử', description: 'Dự án chạy trơn tru không lỗi, lưu đúng tên tệp TH9_SP13_TroChoiTracNghiem.sb3', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th9-sp14-kiem-thu-va-go-loi-chuong-trinh',
    title: 'SP14. Kiểm thử và gỡ lỗi thuật toán / chương trình',
    gradeLevel: 'Lớp 9',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Thực hành phương pháp kiểm thử chương trình với các bộ dữ liệu thử nghiệm (bình thường, biên, ngoại lệ), phát hiện lỗi sai và sửa mã nguồn.',
    toolRequired: 'Word và Scratch hoặc Python.',
    targetFile: 'TH9_SP14_KiemThuVaGoLoi.docx',
    requirements: [
      'Chọn một chương trình máy tính hoặc thuật toán cụ thể (ví dụ: Tìm số lớn nhất trong 3 số, Phân loại tam giác, hoặc trò chơi trắc nghiệm)',
      'Thiết kế bảng kiểm thử (Test Plan) gồm ít nhất 3 bộ dữ liệu thử nghiệm: trường hợp bình thường, trường hợp giá trị biên, trường hợp dữ liệu bất thường',
      'Ghi nhận kết quả mong đợi (Expected Output) và kết quả thực tế (Actual Output) khi chạy chương trình',
      'Chỉ ra lỗi phát hiện được (lỗi cú pháp, lỗi logic hoặc lỗi tràn/biên) và giải thích nguyên nhân',
      'Đề xuất cách sửa mã nguồn và chứng minh chương trình sau khi sửa đã chạy đúng 100%',
      'Lưu tệp đúng tên quy định TH9_SP14_KiemThuVaGoLoi.docx'
    ],
    steps: [
      'Mở Word, ghi tiêu đề “BÁO CÁO KIỂM THỬ VÀ GỠ LỖI CHƯƠNG TRÌNH”.',
      'Mô tả bài toán và cung cấp đoạn mã nguồn chương trình ban đầu (chứa lỗi).',
      'Tạo bảng kiểm thử gồm các cột: STT, Mục đích thử nghiệm, Dữ liệu đầu vào, Kết quả mong đợi, Kết quả thực tế, Đánh giá (Pass/Fail).',
      'Thực hiện chạy thử lần lượt từng bộ dữ liệu và ghi kết quả vào bảng.',
      'Phát hiện lỗi ở trường hợp Fail, phân tích dòng lệnh sai và nêu nguyên nhân.',
      'Chỉnh sửa đoạn mã lệnh, chụp ảnh kết quả chạy thử thành công.',
      'Lưu tệp đúng tên quy định TH9_SP14_KiemThuVaGoLoi.docx.'
    ],
    acceptanceCriteria: 'Bảng kiểm thử có ít nhất 3 bộ dữ liệu thử nghiệm, xác định chính xác lỗi logic/cú pháp và có mã nguồn đã sửa chạy thử đạt yêu cầu.',
    expectedOutput: 'Tài liệu Word bài bản về quy trình kiểm thử phần mềm chuyên nghiệp kèm minh chứng chạy thử gỡ lỗi thành công.',
    sampleProduct: {
      fileName: 'TH9_SP14_KiemThuVaGoLoi.docx',
      notes: 'Báo cáo kiểm thử chương trình "Xác định loại tam giác từ 3 cạnh a, b, c" bằng Python.',
      content: 'BÁO CÁO KIỂM THỬ VÀ GỠ LỖI CHƯƠNG TRÌNH\nBài toán: Nhập 3 số thực a, b, c; kiểm tra xem có tạo thành tam giác hay không và phân loại (Đều, Cân, Thường).\n\n1. MÃ NGUỒN BAN ĐẦU (Chứa lỗi logic):\ndef phan_loai(a, b, c):\n    if a + b > c: # LỖI: Chỉ kiểm tra 1 điều kiện thay vì cả 3 điều kiện tam giác!\n        if a == b == c:\n            return "Tam giác đều"\n        elif a == b or b == c:\n            return "Tam giác cân"\n        else:\n            return "Tam giác thường"\n    return "Không phải tam giác"\n\n2. BẢNG KIỂM THỬ (TEST CASES):\n- Test 1 (Bình thường): a=3, b=4, c=5 -> Kỳ vọng: Tam giác thường | Thực tế: Tam giác thường -> PASS\n- Test 2 (Tam giác đều): a=6, b=6, c=6 -> Kỳ vọng: Tam giác đều | Thực tế: Tam giác đều -> PASS\n- Test 3 (Dữ liệu biên sai): a=1, b=2, c=10 -> Kỳ vọng: Không phải tam giác | Thực tế: Không phải tam giác -> PASS\n- Test 4 (LỖI PHÁT HIỆN): a=10, b=2, c=1 -> Kỳ vọng: Không phải tam giác | Thực tế chương trình báo: "Tam giác thường" (Do a+b = 12 > 1 thỏa mãn!) -> FAIL!\n\n3. NGUYÊN NHÂN VÀ CÁCH SỬA:\n- Nguyên nhân: Điều kiện tồn tại tam giác cần đồng thời cả 3 bất đẳng thức: (a+b>c) AND (a+c>b) AND (b+c>a).\n- Đoạn mã đã sửa chuẩn:\n    if (a + b > c) and (a + c > b) and (b + c > a):\n        # Tiếp tục phân loại tam giác...\n\n4. KẾT LUẬN: Sau khi sửa, chạy lại Test 4 cho kết quả "Không phải tam giác" chuẩn xác 100%.'
    },
    rubric: [
      { id: 'r1', name: 'Thiết kế Test Cases', description: 'Đủ ít nhất 3 bộ dữ liệu thử nghiệm: trường hợp bình thường, biên và ngoại lệ', maxScore: 3.0 },
      { id: 'r2', name: 'Bảng theo dõi kiểm thử', description: 'Bảng đủ cột Input, Expected, Actual, Đánh giá Pass/Fail cụ thể', maxScore: 3.0 },
      { id: 'r3', name: 'Phát hiện lỗi & Sửa mã nguồn', description: 'Chỉ rõ vị trí lỗi, phân tích nguyên nhân và sửa mã nguồn hoàn thiện', maxScore: 2.5 },
      { id: 'r4', name: 'Minh chứng chạy thử & Tên tệp', description: 'Có ảnh chụp màn hình chạy thử nghiệm sau khi sửa, lưu đúng tên tệp', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  }
];
