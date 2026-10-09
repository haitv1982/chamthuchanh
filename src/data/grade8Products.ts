import { Assignment } from '../types';

export const GRADE_8_PRODUCTS: Assignment[] = [
  {
    id: 'th8-sp01-danh-gia-chat-luong-thong-tin',
    title: 'SP01. Đánh giá chất lượng thông tin tìm được trên Internet',
    gradeLevel: 'Lớp 8',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Biết tìm kiếm, đối chiếu và đánh giá độ tin cậy của thông tin tìm kiếm từ Internet.',
    toolRequired: 'Trình duyệt web và Word.',
    targetFile: 'TH8_SP01_DanhGiaThongTin.docx',
    requirements: [
      'Tìm thông tin theo chủ đề giáo viên giao từ ít nhất 2 nguồn khác nhau',
      'Ghi rõ tên trang web, tác giả/đơn vị xuất bản, ngày đăng và đường dẫn liên kết',
      'So sánh nội dung và lập bảng đánh giá theo 4 tiêu chí: nguồn gốc, tính cập nhật, bằng chứng, sự thống nhất',
      'Viết kết luận ngắn gọn, thuyết phục về nguồn tin đáng tin cậy hơn kèm lí do',
      'Lưu tệp đúng tên quy định TH8_SP01_DanhGiaThongTin.docx'
    ],
    steps: [
      'Mở trình duyệt và truy cập một công cụ tìm kiếm.',
      'Tìm thông tin theo chủ đề giáo viên giao, ví dụ: lợi ích của việc đọc sách.',
      'Chọn ít nhất 2 nguồn thông tin khác nhau.',
      'Ghi tên trang web, tác giả hoặc đơn vị xuất bản, ngày đăng nếu có và đường dẫn.',
      'So sánh nội dung giữa hai nguồn.',
      'Đánh giá từng nguồn theo các tiêu chí: nguồn xuất bản, tính cập nhật, bằng chứng và mức độ thống nhất với nguồn khác.',
      'Mở Word, tạo bảng gồm các cột: Nguồn, Thông tin chính, Bằng chứng, Đánh giá.',
      'Viết kết luận ngắn về nguồn đáng tin cậy hơn và giải thích lí do.',
      'Lưu tệp đúng tên quy định.'
    ],
    acceptanceCriteria: 'Có ít nhất 2 nguồn kiểm chứng được, bảng đánh giá rõ ràng và kết luận có căn cứ.',
    expectedOutput: 'Tài liệu Word chứa bảng so sánh đối chiếu giữa 2 nguồn tin kèm phân tích tiêu chí tin cậy và kết luận sắc bén.',
    sampleProduct: {
      fileName: 'TH8_SP01_DanhGiaThongTin.docx',
      notes: 'Bảng đánh giá độ tin cậy thông tin mạng với 2 nguồn kiểm chứng khoa học và nguồn blog cá nhân.',
      content: 'BÁO CÁO ĐÁNH GIÁ CHẤT LƯỢNG THÔNG TIN TRÊN INTERNET\nChủ đề: Lợi ích của việc đọc sách đối với sự phát triển tư duy\n\n1. Nguồn 1: Báo điện tử Tuổi Trẻ (tuoitre.vn) - Tác giả Ban Giáo Dục, ngày 15/03/2024\n2. Nguồn 2: Blog Chia Sẻ Cuộc Sống (chiasecuocsong.blogspot.com) - Tác giả ẩn danh, không rõ ngày đăng\n\nBẢNG SO SÁNH VÀ ĐÁNH GIÁ:\n- Tiêu chí Nguồn xuất bản: Nguồn 1 là cơ quan báo chí có kiểm duyệt; Nguồn 2 là trang cá nhân tự do.\n- Tiêu chí Tính cập nhật: Nguồn 1 có ngày tháng rõ ràng năm 2024; Nguồn 2 không ghi thời gian.\n- Tiêu chí Bằng chứng khoa học: Nguồn 1 trích dẫn nghiên cứu của ĐH Oxford; Nguồn 2 nêu ý kiến chủ quan.\n\nKẾT LUẬN: Nguồn 1 từ báo Tuổi Trẻ có độ tin cậy cao hơn hẳn vì có cơ quan chịu trách nhiệm, dữ liệu có kiểm chứng khoa học và thời gian cập nhật minh bạch.'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 2 nguồn tìm kiếm', description: 'Trích dẫn ít nhất 2 nguồn tin độc lập kèm thông tin xuất bản và link', maxScore: 2.5 },
      { id: 'r2', name: 'Bảng đánh giá tiêu chí', description: 'Bảng đối chiếu đủ các tiêu chí nguồn gốc, cập nhật, bằng chứng', maxScore: 3.5 },
      { id: 'r3', name: 'Kết luận có căn cứ', description: 'Rút ra kết luận thuyết phục về nguồn đáng tin cậy hơn', maxScore: 2.5 },
      { id: 'r4', name: 'Hình thức văn bản', description: 'Trình bày Word ngay ngắn, đúng tên tệp quy định', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th8-sp02-bao-ve-thong-tin-ca-nhan',
    title: 'SP02. Thực hành bảo vệ thông tin cá nhân trong môi trường số',
    gradeLevel: 'Lớp 8',
    subjectType: 'powerpoint',
    durationMinutes: 45,
    description: 'Nhận biết nguy cơ lộ dữ liệu cá nhân trên không gian mạng và biết cách phòng tránh hiệu quả.',
    toolRequired: 'Word hoặc PowerPoint.',
    targetFile: 'TH8_SP02_BaoVeDuLieu.pptx',
    requirements: [
      'Tạo bài trình chiếu gồm đúng 5 trang nội dung mạch lạc',
      'Trang 1: Tiêu đề “BẢO VỆ THÔNG TIN CÁ NHÂN”, tên nhóm/máy',
      'Trang 2: Liệt kê các thông tin cá nhân cần bảo vệ (mật khẩu, CCCD, địa chỉ, tài khoản)',
      'Trang 3: Nêu ít nhất 3 tình huống thực tế có nguy cơ lộ lọt dữ liệu',
      'Trang 4: Đề xuất biện pháp phòng tránh (mật khẩu mạnh, xác thực 2FA, cảnh giác link lạ)',
      'Trang 5: Thông điệp hoặc quy tắc ghi nhớ an toàn số',
      'Lưu tệp PowerPoint đúng tên TH8_SP02_BaoVeDuLieu.pptx'
    ],
    steps: [
      'Mở PowerPoint, tạo bài trình chiếu gồm 5 trang.',
      'Trang 1: đặt tiêu đề “BẢO VỆ THÔNG TIN CÁ NHÂN”.',
      'Trang 2: liệt kê những thông tin cần bảo vệ như mật khẩu, địa chỉ, số điện thoại và thông tin tài khoản.',
      'Trang 3: nêu ít nhất 3 tình huống có nguy cơ lộ thông tin.',
      'Trang 4: đề xuất cách xử lí như sử dụng mật khẩu mạnh, bật xác thực bổ sung và kiểm tra đường dẫn.',
      'Trang 5: đưa ra thông điệp hoặc quy tắc ghi nhớ.',
      'Chèn hình minh họa phù hợp, không sử dụng dữ liệu cá nhân thật.',
      'Kiểm tra lỗi chính tả, màu sắc và cỡ chữ.',
      'Lưu tệp PowerPoint.'
    ],
    acceptanceCriteria: 'Có đủ 5 trang, nêu được nguy cơ và biện pháp bảo vệ cụ thể.',
    expectedOutput: 'Tệp PowerPoint 5 slide với thiết kế sinh động, phân tích rủi ro thực tế và đưa ra cẩm nang bảo vệ dữ liệu số.',
    sampleProduct: {
      fileName: 'TH8_SP02_BaoVeDuLieu.pptx',
      notes: 'Slide thuyết trình 5 trang bảo vệ dữ liệu số an toàn, hình ảnh minh họa cảnh giác lừa đảo.',
      content: 'Slide 1: BẢO VỆ THÔNG TIN CÁ NHÂN TRÊN KHÔNG GIAN MẠNG\nSlide 2: Dữ liệu nhạy cảm cần bảo vệ (Mật khẩu, CCCD/CMND, Số điện thoại, Địa chỉ nhà, Số tài khoản ngân hàng)\nSlide 3: 3 Nguy cơ lộ lọt dữ liệu (Nhấp link trúng thưởng giả mạo, Dùng wifi công cộng không mã hóa, Đăng ảnh vé máy bay/giấy tờ lên mạng xã hội)\nSlide 4: Biện pháp phòng vệ (Bật xác thực 2 bước 2FA, Đặt mật khẩu mạnh trên 8 ký tự kèm ký tự đặc biệt, Cài phần mềm diệt virus)\nSlide 5: Thông điệp: "Thông tin cá nhân là chìa khóa số - Đừng trao chìa khóa cho kẻ lạ!"'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 5 trang trình chiếu', description: 'Bài trình chiếu có đầy đủ 5 slide theo cấu trúc yêu cầu', maxScore: 2.5 },
      { id: 'r2', name: 'Nhận diện thông tin & nguy cơ', description: 'Liệt kê đúng dữ liệu cần giữ kín và 3 tình huống rủi ro', maxScore: 3.5 },
      { id: 'r3', name: 'Biện pháp xử lý & thông điệp', description: 'Đề xuất giải pháp bảo mật khả thi và thông điệp ý nghĩa', maxScore: 2.5 },
      { id: 'r4', name: 'Thiết kế thẩm mỹ', description: 'Màu sắc hài hòa, font chữ dễ đọc, hình ảnh minh họa đẹp mắt', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th8-sp03-lich-su-phat-trien-may-tinh',
    title: 'SP03. Tạo bài trình chiếu về lịch sử phát triển máy tính',
    gradeLevel: 'Lớp 8',
    subjectType: 'powerpoint',
    durationMinutes: 45,
    description: 'Biết chọn lọc thông tin và trình bày sự phát triển của máy tính qua các thời kỳ lịch sử.',
    toolRequired: 'PowerPoint hoặc phần mềm trình chiếu tương đương.',
    targetFile: 'TH8_SP03_LichSuMayTinh.pptx',
    requirements: [
      'Tạo bài trình chiếu gồm tối thiểu 5 trang theo dòng thời gian',
      'Trang 1: Tiêu đề “LỊCH SỬ PHÁT TRIỂN CỦA MÁY TÍNH”',
      'Trang 2: Các thế hệ máy tính điện tử đời đầu (đèn điện tử chân không, ENIAC...)',
      'Trang 3: Sự xuất hiện và bùng nổ của máy tính cá nhân (PC, vi xử lý)',
      'Trang 4: Máy tính hiện đại, siêu máy tính và thiết bị di động thông minh',
      'Trang 5: Tác động của máy tính đối với xã hội và tương lai',
      'Hình ảnh minh họa có nguồn rõ ràng, bố cục cân đối'
    ],
    steps: [
      'Mở PowerPoint và tạo bài trình chiếu mới.',
      'Trang 1: ghi tiêu đề “LỊCH SỬ PHÁT TRIỂN CỦA MÁY TÍNH”.',
      'Trang 2: giới thiệu những máy tính điện tử đời đầu.',
      'Trang 3: trình bày sự phát triển của máy tính cá nhân.',
      'Trang 4: giới thiệu máy tính hiện đại và các thiết bị di động.',
      'Trang 5: nêu một số thay đổi của máy tính đối với học tập và đời sống.',
      'Tìm hình ảnh minh họa từ các nguồn phù hợp, ghi nguồn khi cần.',
      'Sắp xếp các sự kiện theo trình tự thời gian.',
      'Chạy thử bài trình chiếu, sửa lỗi và lưu tệp.'
    ],
    acceptanceCriteria: 'Có ít nhất 5 trang, thể hiện được các mốc phát triển chính của máy tính và trình bày trực quan.',
    expectedOutput: 'Bài trình chiếu PowerPoint 5 slide với trục thời gian timeline lịch sử máy tính điện tử trực quan.',
    sampleProduct: {
      fileName: 'TH8_SP03_LichSuMayTinh.pptx',
      notes: 'Dòng thời gian các thế hệ máy tính từ ENIAC đến Smartphone và AI.',
      content: 'Slide 1: LỊCH SỬ PHÁT TRIỂN CỦA MÁY TÍNH ĐIỆN TỬ\nSlide 2: Thế hệ đầu tiên (1940-1956) - Đèn điện tử chân không, máy ENIAC khổng lồ nặng 30 tấn.\nSlide 3: Kỷ nguyên máy tính cá nhân (Thập niên 1970 - 1980) - Chip vi xử lý Intel, Apple II, IBM PC đưa máy tính vào từng gia đình.\nSlide 4: Kỷ nguyên di động & Internet (Thập niên 2000 đến nay) - Laptop, Smartphone, Máy tính bảng, Siêu máy tính đám mây.\nSlide 5: Tác động xã hội: Tự động hóa sản xuất, kết nối thông tin toàn cầu, thúc đẩy trí tuệ nhân tạo.'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 5 trang nội dung', description: 'Bài trình chiếu đủ 5 slide theo từng mốc thời gian', maxScore: 2.5 },
      { id: 'r2', name: 'Nội dung lịch sử chính xác', description: 'Nêu đúng các mốc sự kiện và bước ngoặt kỹ thuật', maxScore: 3.5 },
      { id: 'r3', name: 'Trực quan hóa timeline', description: 'Sử dụng hình ảnh và sơ đồ dòng thời gian mạch lạc', maxScore: 2.5 },
      { id: 'r4', name: 'Định dạng và trình bày', description: 'Cỡ chữ chuẩn trình chiếu, không sai chính tả, tệp đúng quy định', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th8-sp04-ham-dieu-kien-if',
    title: 'SP04. Sử dụng hàm điều kiện IF trong bảng tính',
    gradeLevel: 'Lớp 8',
    subjectType: 'excel',
    durationMinutes: 45,
    description: 'Sử dụng hàm IF để tự động hóa đánh giá kết quả học tập trong phần mềm bảng tính.',
    toolRequired: 'Excel hoặc phần mềm bảng tính.',
    targetFile: 'TH8_SP04_HamDieuKien.xlsx',
    requirements: [
      'Tạo bảng điểm kiểm tra gồm ít nhất 8 học sinh với các cột: STT, Họ và tên, Toán, Văn, Tin học, ĐTB, Kết quả',
      'Dùng hàm =AVERAGE() để tính điểm trung bình chính xác đến 1 chữ số thập phân',
      'Sử dụng hàm =IF(ĐTB>=5, "Đạt", "Chưa đạt") tại cột Kết quả',
      'Sao chép công thức tự động cho toàn bộ danh sách bằng Fill Handle',
      'Kẻ đường viền bảng, in đậm tiêu đề cột và căn lề số/chữ đúng chuẩn'
    ],
    steps: [
      'Mở Excel, nhập bảng điểm kiểm tra gồm các cột: STT, Họ và tên, Điểm Toán, Điểm Văn, Điểm Tin, Điểm Trung Bình, Kết Quả.',
      'Dùng hàm AVERAGE tính Điểm Trung Bình cho ít nhất 8 học sinh.',
      'Nhập công thức hàm =IF(Điểm Trung Bình >= 5, "Đạt", "Chưa đạt") tại cột Kết Quả.',
      'Sao chép công thức cho toàn bộ danh sách lớp.',
      'Định dạng bảng viền, tiêu đề in đậm, canh lề số và chữ chuẩn xác.',
      'Lưu tệp đúng tên quy định TH8_SP04_HamDieuKien.xlsx.'
    ],
    acceptanceCriteria: 'Sử dụng đúng cú pháp hàm IF, kết quả tính chính xác cho toàn bộ danh sách học sinh.',
    expectedOutput: 'Bảng tính Excel chứa công thức hàm IF tính tự động kết quả "Đạt" hoặc "Chưa đạt" cho học sinh.',
    sampleProduct: {
      fileName: 'TH8_SP04_HamDieuKien.xlsx',
      notes: 'Bảng điểm 8 học sinh có công thức AVERAGE và hàm IF điều kiện hoàn chỉnh.',
      content: 'STT | Họ và tên | Toán | Văn | Tin | ĐTB | Kết Quả\n1 | Nguyễn An | 8.5 | 7.0 | 9.0 | =AVERAGE(C2:E2) | =IF(F2>=5,"Đạt","Chưa đạt")\n2 | Trần Bình | 4.0 | 5.0 | 4.5 | =AVERAGE(C3:E3) | =IF(F3>=5,"Đạt","Chưa đạt")\n3 | Lê Cúc | 9.0 | 8.5 | 9.5 | =AVERAGE(C4:E4) | =IF(F4>=5,"Đạt","Chưa đạt")'
    },
    rubric: [
      { id: 'r1', name: 'Dữ liệu bảng tính', description: 'Có đủ danh sách 8 học sinh với đầy đủ điểm 3 môn', maxScore: 2.0 },
      { id: 'r2', name: 'Công thức AVERAGE', description: 'Tính đúng điểm trung bình bằng hàm AVERAGE', maxScore: 2.5 },
      { id: 'r3', name: 'Cú pháp hàm IF', description: 'Viết đúng cú pháp hàm IF phân loại Đạt / Chưa đạt', maxScore: 3.5 },
      { id: 'r4', name: 'Định dạng bảng tính', description: 'Kẻ viền, căn lề số và chữ chuẩn quy cách bảng tính', maxScore: 2.0 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th8-sp05-ham-logic-long-nhau',
    title: 'SP05. Sử dụng hàm điều kiện lồng nhau và hàm logic',
    gradeLevel: 'Lớp 8',
    subjectType: 'excel',
    durationMinutes: 45,
    description: 'Kết hợp hàm IF lồng nhau và hàm logic AND/OR để xếp loại học lực học sinh đa tiêu chí.',
    toolRequired: 'Excel hoặc phần mềm bảng tính.',
    targetFile: 'TH8_SP05_HamLogic.xlsx',
    requirements: [
      'Phát triển từ bảng điểm SP04, bổ sung cột "Xếp Loại"',
      'Sử dụng hàm IF lồng nhau để phân loại 4 mức: Giỏi (>=8.0), Khá (>=6.5), Trung bình (>=5.0), Yếu (<5.0)',
      'Vận dụng hàm AND để kiểm tra điều kiện khống chế môn hoặc danh hiệu thi đua',
      'Kiểm tra tính đúng đắn với các trường hợp biên (8.0, 6.5, 5.0)',
      'Lưu tệp TH8_SP05_HamLogic.xlsx'
    ],
    steps: [
      'Mở bảng tính bảng điểm ở SP04, bổ sung cột "Xếp Loại".',
      'Thiết lập công thức hàm IF lồng nhau: nếu ĐTB >= 8.0 thì "Giỏi", nếu ĐTB >= 6.5 thì "Khá", nếu ĐTB >= 5.0 thì "Trung bình", còn lại "Yếu".',
      'Kết hợp hàm AND để kiểm tra điều kiện không có điểm môn nào dưới 6.5 đối với loại Giỏi.',
      'Kiểm tra độ chính xác của kết quả với từng trường hợp điểm số.',
      'Lưu tệp đúng tên TH8_SP05_HamLogic.xlsx.'
    ],
    acceptanceCriteria: 'Công thức hàm IF lồng nhau và hàm logic hoạt động đúng, phân loại chuẩn xác 4 mức xếp loại.',
    expectedOutput: 'Bảng tính Excel có công thức IF lồng nhau phân loại chính xác Giỏi/Khá/Trung bình/Yếu.',
    sampleProduct: {
      fileName: 'TH8_SP05_HamLogic.xlsx',
      notes: 'Công thức IF lồng ghép kết hợp logic phân loại học lực chuẩn xác.',
      content: 'Công thức cột Xếp loại:\n=IF(AND(F2>=8.0,MIN(C2:E2)>=6.5),"Giỏi",IF(F2>=6.5,"Khá",IF(F2>=5.0,"Trung bình","Yếu")))\nKết quả: Phân loại chính xác 100% học sinh trong lớp theo quy chế đánh giá.'
    },
    rubric: [
      { id: 'r1', name: 'Cấu trúc IF lồng nhau', description: 'Viết đúng cú pháp hàm IF lồng nhau 3 tầng', maxScore: 3.5 },
      { id: 'r2', name: 'Kết hợp hàm logic AND', description: 'Sử dụng thành công hàm AND xét điều kiện kèm theo', maxScore: 2.5 },
      { id: 'r3', name: 'Độ chính xác dữ liệu', description: 'Kết quả xếp loại chuẩn xác với toàn bộ danh sách lớp', maxScore: 2.5 },
      { id: 'r4', name: 'Trình bày trang tính', description: 'Định dạng màu sắc nổi bật theo xếp loại, lưu đúng tên', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th8-sp06-sap-xep-va-loc-du-lieu',
    title: 'SP06. Sắp xếp và lọc dữ liệu trong bảng tính',
    gradeLevel: 'Lớp 8',
    subjectType: 'excel',
    durationMinutes: 45,
    description: 'Thành thạo kỹ năng sắp xếp thứ tự ưu tiên và lọc dữ liệu trích xuất theo điều kiện.',
    toolRequired: 'Excel hoặc phần mềm bảng tính.',
    targetFile: 'TH8_SP06_SapXepVaLoc.xlsx',
    requirements: [
      'Sử dụng bảng dữ liệu học sinh hoặc bảng quản lý thư viện/thiết bị',
      'Thực hiện sắp xếp danh sách theo Điểm Trung Bình giảm dần (từ cao xuống thấp)',
      'Sử dụng công cụ AutoFilter để trích xuất danh sách học sinh đạt danh hiệu "Giỏi"',
      'Thực hiện lọc nâng cao: Tìm các học sinh có điểm môn Tin học >= 9.0',
      'Lưu các kết quả trích lọc vào các Sheet hoặc vùng riêng rõ ràng',
      'Lưu tệp TH8_SP06_SapXepVaLoc.xlsx'
    ],
    steps: [
      'Mở bảng tính danh sách học sinh có kết quả học tập từ bài trước.',
      'Thực hiện sắp xếp danh sách theo Điểm Trung Bình giảm dần (từ cao xuống thấp).',
      'Sử dụng công cụ Filter (Lọc) để trích xuất danh sách các học sinh xếp loại "Giỏi".',
      'Tạo thêm một bảng lọc trích xuất các học sinh có Điểm Tin học từ 9.0 trở lên.',
      'Lưu các sheet kết quả lọc riêng biệt hoặc ghi chú các bước thực hiện.',
      'Lưu tệp TH8_SP06_SapXepVaLoc.xlsx.'
    ],
    acceptanceCriteria: 'Sắp xếp đúng thứ tự yêu cầu và thiết lập bộ lọc hiển thị chính xác các bản ghi thỏa mãn điều kiện.',
    expectedOutput: 'Bảng tính Excel với dữ liệu đã được Sort theo thứ tự và thiết lập AutoFilter chuẩn xác.',
    sampleProduct: {
      fileName: 'TH8_SP06_SapXepVaLoc.xlsx',
      notes: 'Bảng tính 2 Sheet: Sheet 1 Sắp xếp theo ĐTB giảm dần, Sheet 2 Danh sách lọc học sinh Giỏi và Tin học >= 9.',
      content: 'Sheet 1: Sort by ĐTB (Descending)\nSheet 2: Filter [Xếp Loại = "Giỏi" AND Điểm Tin >= 9.0]\nSố lượng kết quả trích xuất: 3 học sinh xuất sắc nhất khối.'
    },
    rubric: [
      { id: 'r1', name: 'Sắp xếp dữ liệu', description: 'Thực hiện đúng sắp xếp theo thứ tự giảm dần/tăng dần', maxScore: 3.0 },
      { id: 'r2', name: 'Bật và dùng công cụ Lọc', description: 'Thiết lập thành công bộ lọc AutoFilter trên dòng tiêu đề', maxScore: 3.0 },
      { id: 'r3', name: 'Kết quả lọc chính xác', description: 'Trích xuất đúng các dòng thỏa mãn điều kiện bài toán', maxScore: 2.5 },
      { id: 'r4', name: 'Tổ chức dữ liệu', description: 'Trình bày sheet ngăn nắp, dễ theo dõi, tệp đúng quy định', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th8-sp07-ve-bieu-do-bang-tinh',
    title: 'SP07. Tạo biểu đồ cột và biểu đồ tròn trong bảng tính',
    gradeLevel: 'Lớp 8',
    subjectType: 'excel',
    durationMinutes: 45,
    description: 'Trực quan hóa dữ liệu thống kê bằng biểu đồ cột so sánh số lượng và biểu đồ tròn tỉ lệ %.',
    toolRequired: 'Excel hoặc phần mềm bảng tính.',
    targetFile: 'TH8_SP07_BieuDo.xlsx',
    requirements: [
      'Tạo bảng thống kê xếp loại học lực của lớp (Số lượng và tỉ lệ % Giỏi, Khá, Trung bình, Yếu)',
      'Vẽ Biểu đồ cột (Column Chart) thể hiện số lượng học sinh từng loại kèm tiêu đề',
      'Vẽ Biểu đồ hình tròn (Pie Chart) thể hiện cơ cấu tỉ lệ % từng loại',
      'Thêm đầy đủ thành phần biểu đồ: Chart Title, Data Labels, Legend',
      'Định dạng màu sắc phân biệt rõ ràng giữa các nhóm'
    ],
    steps: [
      'Tạo bảng thống kê xếp loại học lực của lớp (Số lượng học sinh Giỏi, Khá, Trung bình, Yếu và tỉ lệ %).',
      'Chọn vùng dữ liệu và chèn Biểu đồ hình cột (Column Chart) thể hiện số lượng từng loại.',
      'Chèn Biểu đồ hình tròn (Pie Chart) thể hiện tỉ lệ phần trăm từng loại học lực.',
      'Thêm tiêu đề biểu đồ, nhãn dữ liệu (Data Labels), chú giải (Legend) rõ ràng.',
      'Định dạng màu sắc hài hòa, chuyên nghiệp và lưu tệp TH8_SP07_BieuDo.xlsx.'
    ],
    acceptanceCriteria: 'Có đủ 2 dạng biểu đồ (cột và tròn), dữ liệu biểu đồ chính xác, có đầy đủ tiêu đề và nhãn số liệu.',
    expectedOutput: 'Bảng tính Excel chứa bảng tổng hợp và 2 biểu đồ cột, tròn trực quan sinh động.',
    sampleProduct: {
      fileName: 'TH8_SP07_BieuDo.xlsx',
      notes: 'Bảng tính thống kê kèm 2 biểu đồ: Biểu đồ cột so sánh số lượng và Biểu đồ tròn tỉ trọng phần trăm.',
      content: 'BẢNG THỐNG KÊ XẾP LOẠI HỌC LỰC LỚP 8A:\n- Giỏi: 12 HS (30%)\n- Khá: 18 HS (45%)\n- Trung bình: 8 HS (20%)\n- Yếu: 2 HS (5%)\nTổng số: 40 HS (100%)\n\nBiểu đồ 1: Biểu đồ cột "Thống kê số lượng học sinh theo học lực"\nBiểu đồ 2: Biểu đồ tròn "Cơ cấu xếp loại học lực lớp 8A" có gắn nhãn %'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 2 loại biểu đồ', description: 'Tạo thành công cả biểu đồ cột và biểu đồ hình tròn', maxScore: 3.0 },
      { id: 'r2', name: 'Dữ liệu biểu đồ chuẩn xác', description: 'Vùng chọn dữ liệu chuẩn xác, biểu diễn đúng tỉ lệ', maxScore: 3.0 },
      { id: 'r3', name: 'Đầy đủ thành phần biểu đồ', description: 'Có tiêu đề, nhãn số liệu (Data Labels) và chú giải', maxScore: 2.5 },
      { id: 'r4', name: 'Thẩm mỹ và căn chỉnh', description: 'Bố cục cân đối, màu sắc tương phản tốt, tệp đúng quy định', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th8-sp08-danh-sach-liet-ke-hinh-anh',
    title: 'SP08. Định dạng danh sách liệt kê và chèn hình ảnh nâng cao trong Word',
    gradeLevel: 'Lớp 8',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Biết tạo danh sách dấu đầu dòng (Bullets), danh sách số thứ tự (Numbering) đa cấp và định dạng hình ảnh.',
    toolRequired: 'Word.',
    targetFile: 'TH8_SP08_LietKeVaHinhAnh.docx',
    requirements: [
      'Soạn thảo văn bản giới thiệu một chủ đề khoa học hoặc công nghệ thông tin',
      'Sử dụng định dạng Bullets (dấu đầu dòng) và Numbering (danh sách có thứ tự) đa cấp (Cấp 1, Cấp 2)',
      'Chèn ít nhất 2 hình ảnh minh họa chất lượng cao',
      'Định dạng vị trí hình ảnh với Wrap Text (Square hoặc Tight), thêm khung viền ảnh',
      'Căn lề hai bên (Justify), giãn dòng 1.15 hoặc 1.5 dòng'
    ],
    steps: [
      'Mở tài liệu Word mới, soạn bài giới thiệu về một chủ đề học tập (ví dụ: Các thành phần máy tính hoặc An toàn mạng).',
      'Sử dụng Bullets (dấu đầu dòng) và Numbering (danh sách có thứ tự) đa cấp cho các ý lớn, ý nhỏ.',
      'Chèn ít nhất 2 hình ảnh minh họa phù hợp với nội dung.',
      'Định dạng vị trí hình ảnh (Wrap Text: Square hoặc Tight), chỉnh độ sáng và thêm khung viền cho ảnh.',
      'Căn lề hai bên (Justify), giãn dòng 1.15 - 1.5 dòng và lưu tệp TH8_SP08_LietKeVaHinhAnh.docx.'
    ],
    acceptanceCriteria: 'Sử dụng đúng định dạng danh sách liệt kê nhiều cấp, hình ảnh được căn chỉnh hợp lý không bị vỡ layout.',
    expectedOutput: 'Tài liệu Word định dạng chuẩn với danh sách phân cấp đa tầng và hình ảnh minh họa bọc chữ chuyên nghiệp.',
    sampleProduct: {
      fileName: 'TH8_SP08_LietKeVaHinhAnh.docx',
      notes: 'Tài liệu Word giới thiệu linh kiện máy tính có danh sách đa cấp và hình ảnh bọc văn bản đẹp mắt.',
      content: 'CÁC THÀNH PHẦN CƠ BẢN CỦA MÁY TÍNH CÁ NHÂN\n\n1. Phần cứng chính (Hardware):\n   - Khối xử lý trung tâm (CPU): Trí tuệ của máy tính.\n   - Bộ nhớ trong (RAM & ROM):\n     + RAM: Lưu trữ tạm thời khi máy đang hoạt động.\n     + ROM: Lưu trữ chương trình khởi động BIOS.\n   - Ổ cứng lưu trữ: SSD tốc độ cao và HDD truyền thống.\n\n2. Thiết bị ngoại vi:\n   - Thiết bị đầu vào: Bàn phím, chuột cơ học, microphone.\n   - Thiết bị đầu ra: Màn hình 4K, loa âm thanh vòm, máy in laser.\n\n(Chèn 2 ảnh minh họa CPU và RAM có khung viền bo tròn, Wrap Text dạng Square).'
    },
    rubric: [
      { id: 'r1', name: 'Danh sách liệt kê đa cấp', description: 'Áp dụng chính xác Bullets và Numbering ít nhất 2 cấp độ', maxScore: 3.5 },
      { id: 'r2', name: 'Chèn và căn chỉnh ảnh', description: 'Có ít nhất 2 ảnh minh họa, định dạng Wrap Text phù hợp', maxScore: 3.0 },
      { id: 'r3', name: 'Quy cách văn bản', description: 'Căn lề Justify, giãn dòng chuẩn, không bị lỗi font', maxScore: 2.0 },
      { id: 'r4', name: 'Đúng tên tệp quy định', description: 'Lưu đúng tên tệp TH8_SP08_LietKeVaHinhAnh.docx', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th8-sp09-dau-trang-chan-trang-so-trang',
    title: 'SP09. Tạo tiêu đề đầu trang, chân trang và đánh số trang tự động',
    gradeLevel: 'Lớp 8',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Tạo Header, Footer chuyên nghiệp và đánh số trang tự động trong tài liệu văn bản dài.',
    toolRequired: 'Word.',
    targetFile: 'TH8_SP09_DauTrangChanTrang.docx',
    requirements: [
      'Tài liệu văn bản có độ dài tối thiểu 3 trang nội dung',
      'Tạo Header (tiêu đề đầu trang) chứa tên bài báo cáo và tên tác giả/nhóm',
      'Tạo Footer (tiêu đề chân trang) chứa tên trường, lớp học',
      'Đánh số trang tự động (Page Number) tăng dần ở Footer',
      'Áp dụng tính năng Different First Page để ẩn header/footer ở trang bìa (nếu có)'
    ],
    steps: [
      'Mở tài liệu Word có độ dài ít nhất 3 trang (bài thu hoạch hoặc báo cáo dự án).',
      'Chọn Insert -> Header: Thêm tiêu đề đầu trang chứa tên bài thu hoạch và tên tác giả.',
      'Chọn Insert -> Footer: Thêm thông tin lớp học và tên trường.',
      'Chọn Page Number: Đánh số trang tự động ở góc dưới bên phải hoặc chính giữa footer.',
      'Tùy chọn Different First Page để ẩn số trang trên trang bìa (nếu có).',
      'Kiểm tra hiển thị trang in (Print Preview) và lưu tệp TH8_SP09_DauTrangChanTrang.docx.'
    ],
    acceptanceCriteria: 'Tài liệu có đủ Header, Footer và số trang tự động tăng dần trên tất cả các trang nội dung.',
    expectedOutput: 'Tài liệu Word chuẩn 3 trang trở lên với Header, Footer và số trang đồng bộ.',
    sampleProduct: {
      fileName: 'TH8_SP09_DauTrangChanTrang.docx',
      notes: 'Báo cáo khoa học 3 trang có Header phía trên, Footer thông tin trường lớp và số trang tự động bên dưới.',
      content: 'Header: BÁO CÁO DỰ ÁN HỌC TẬP TIN HỌC 8 | NHÓM MÁY 01\nNội dung: 3 trang tài liệu chuyên đề Đổi mới sáng tạo trong thời đại số.\nFooter: Trường THCS - Lớp 8A | Trang {Page} / {NumPages}'
    },
    rubric: [
      { id: 'r1', name: 'Độ dài văn bản', description: 'Văn bản có đủ tối thiểu 3 trang nội dung hoàn chỉnh', maxScore: 2.0 },
      { id: 'r2', name: 'Thiết lập Header & Footer', description: 'Tạo đúng Header và Footer với thông tin bài học và lớp', maxScore: 3.5 },
      { id: 'r3', name: 'Đánh số trang tự động', description: 'Số trang tự động tăng dần chính xác từ trang đầu đến cuối', maxScore: 3.0 },
      { id: 'r4', name: 'Trình bày và tên tệp', description: 'Định dạng đẹp mắt, lưu đúng tên TH8_SP09_DauTrangChanTrang.docx', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th8-sp10-ban-mau-trinh-chieu-nang-cao',
    title: 'SP10. Sử dụng bản mẫu và định dạng nâng cao trong PowerPoint',
    gradeLevel: 'Lớp 8',
    subjectType: 'powerpoint',
    durationMinutes: 45,
    description: 'Áp dụng Template và Slide Master để tạo bài thuyết trình chuyên nghiệp có phong cách đồng bộ.',
    toolRequired: 'PowerPoint.',
    targetFile: 'TH8_SP10_BanMauTrinhChieu.pptx',
    requirements: [
      'Sử dụng Slide Master hoặc Theme bản mẫu để định hình phong cách đồng nhất',
      'Bài thuyết trình tối thiểu 4 trang về một chủ đề tự chọn (Khoa học, Môi trường, Lịch sử...)',
      'Đồng bộ về bảng màu, kiểu phông chữ tiêu đề và nội dung trên toàn bộ các slide',
      'Sử dụng sơ đồ SmartArt để mô hình hóa thông tin thay vì đoạn văn bản thuần túy',
      'Độ tương phản cao giữa màu nền và chữ, dễ quan sát từ xa'
    ],
    steps: [
      'Mở PowerPoint, chọn một Theme mẫu có sẵn hoặc thiết kế Slide Master riêng biệt.',
      'Đặt màu chủ đạo, phông chữ đồng nhất (chữ tiêu đề và chữ nội dung) cho toàn bộ bài.',
      'Thiết kế bài trình chiếu gồm ít nhất 4 trang về một chủ đề tự chọn (ví dụ: Bảo vệ môi trường hoặc Công nghệ tương lai).',
      'Thêm SmartArt hoặc sơ đồ trực quan để cô đọng thông tin thay vì nhiều chữ.',
      'Đảm bảo tính tương phản giữa màu nền và màu chữ giúp dễ đọc khi chiếu.',
      'Lưu tệp TH8_SP10_BanMauTrinhChieu.pptx.'
    ],
    acceptanceCriteria: 'Bài trình chiếu có phong cách đồng bộ từ Slide Master, bố cục khoa học, sử dụng SmartArt trực quan.',
    expectedOutput: 'Tệp PowerPoint 4 slide có bản mẫu Slide Master nhất quán và sơ đồ SmartArt chuyên nghiệp.',
    sampleProduct: {
      fileName: 'TH8_SP10_BanMauTrinhChieu.pptx',
      notes: 'Slide thuyết trình dự án Năng lượng tái tạo dùng Slide Master màu xanh lá, có SmartArt chu trình năng lượng.',
      content: 'Slide 1: NĂNG LƯỢNG TÁI TẠO - TƯƠNG LAI XANH CỦA TRÁI ĐẤT\nSlide 2: Tổng quan các nguồn năng lượng (Năng lượng mặt trời, Gió, Thủy điện, Sinh khối)\nSlide 3: Sơ đồ SmartArt: Chu trình chuyển đổi năng lượng mặt trời thành điện sinh hoạt\nSlide 4: Lời kêu gọi hành động: Sử dụng tiết kiệm điện và bảo vệ môi trường.'
    },
    rubric: [
      { id: 'r1', name: 'Đủ 4 trang trình chiếu', description: 'Bài trình chiếu có tối thiểu 4 slide nội dung hoàn chỉnh', maxScore: 2.0 },
      { id: 'r2', name: 'Áp dụng bản mẫu thống nhất', description: 'Font chữ, màu sắc, bố cục đồng bộ xuyên suốt qua Slide Master', maxScore: 3.5 },
      { id: 'r3', name: 'Ứng dụng SmartArt trực quan', description: 'Chèn và tùy biến thành công sơ đồ SmartArt truyền tải thông điệp', maxScore: 3.0 },
      { id: 'r4', name: 'Thẩm mỹ và lưu tệp', description: 'Bố cục hiện đại, lưu đúng tên TH8_SP10_BanMauTrinhChieu.pptx', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th8-sp11-lien-ket-va-dieu-huong-slide',
    title: 'SP11. Tạo liên kết và nút điều hướng trong bài trình chiếu',
    gradeLevel: 'Lớp 8',
    subjectType: 'powerpoint',
    durationMinutes: 45,
    description: 'Xây dựng bài trình chiếu tương tác phi tuần tự bằng Hyperlink và nút hành động Action Buttons.',
    toolRequired: 'PowerPoint.',
    targetFile: 'TH8_SP11_LienKetDieuHuong.pptx',
    requirements: [
      'Tạo bài trình chiếu gồm tối thiểu 5 trang có cấu trúc tương tác mục lục tra cứu hoặc trò chơi',
      'Trang mục lục có các liên kết (Hyperlink) dẫn trực tiếp đến các trang chuyên đề',
      'Trên mỗi trang nội dung có các nút điều hướng (Action Buttons): Home (về mục lục), Back, Next',
      'Kiểm tra hoạt động ở chế độ Slide Show, liên kết nhảy chính xác 100%',
      'Lưu tệp TH8_SP11_LienKetDieuHuong.pptx'
    ],
    steps: [
      'Mở PowerPoint, tạo bài trình chiếu trò chơi hỏi đáp hoặc mục lục tra cứu gồm ít nhất 5 trang.',
      'Trang 2: Trang mục lục chính chứa các nút bấm dẫn tới từng nội dung chuyên đề.',
      'Sử dụng tính năng Hyperlink (Insert -> Link) liên kết các mục lục tới từng trang cụ thể.',
      'Chèn nút hành động điều hướng (Shapes -> Action Buttons): Nút "Trang chủ" (Home), nút "Quay lại" (Back), nút "Kế tiếp" (Next) trên từng trang.',
      'Chạy thử bài trình chiếu ở chế độ Slide Show để kiểm tra tính năng nhấp chuột chuyển trang.',
      'Lưu tệp TH8_SP11_LienKetDieuHuong.pptx.'
    ],
    acceptanceCriteria: 'Các liên kết và nút điều hướng hoạt động chính xác 100%, chuyển trang trơn tru không bị lỗi liên kết.',
    expectedOutput: 'Tệp PowerPoint 5 slide với hệ thống liên kết nội bộ nhảy trang thông minh và nút Home/Back/Next chuẩn.',
    sampleProduct: {
      fileName: 'TH8_SP11_LienKetDieuHuong.pptx',
      notes: 'Trò chơi trắc nghiệm Tin học 5 câu hỏi có liên kết lựa chọn đáp án đúng/sai và nút quay về trang chủ.',
      content: 'Slide 1: TRÒ CHƠI Ô CHỮ TIN HỌC (Nút: BẮT ĐẦU -> Link tới Slide 2)\nSlide 2: MỤC LỤC CÁC CHỦ ĐỀ (Link 1: CPU, Link 2: Internet, Link 3: Thuật toán)\nSlide 3: Chuyên đề 1 - Khám phá CPU (Action Button: Home quay lại Slide 2, Next sang Slide 4)\nSlide 4: Chuyên đề 2 - An toàn Internet (Action Button: Home, Back, Next)\nSlide 5: Tổng kết điểm số và phần thưởng.'
    },
    rubric: [
      { id: 'r1', name: 'Số lượng trang và cấu trúc', description: 'Có đủ 5 trang được tổ chức theo cấu trúc tương tác', maxScore: 2.5 },
      { id: 'r2', name: 'Thiết lập Hyperlink', description: 'Tạo liên kết từ mục lục tới đúng trang đích', maxScore: 3.5 },
      { id: 'r3', name: 'Nút hành động điều hướng', description: 'Chèn và cấu hình đúng nút Home, Back, Next trên các slide', maxScore: 2.5 },
      { id: 'r4', name: 'Vận hành không lỗi', description: 'Chạy thử Slide Show mượt mà, lưu đúng tên quy định', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th8-sp12-kich-ban-va-so-do-thuat-toan',
    title: 'SP12. Xây dựng kịch bản và thuật toán cho chương trình',
    gradeLevel: 'Lớp 8',
    subjectType: 'word',
    durationMinutes: 45,
    description: 'Phân tích bài toán, xác định đầu vào/đầu ra và biểu diễn thuật toán bằng sơ đồ khối chuẩn xác.',
    toolRequired: 'Word hoặc công cụ vẽ sơ đồ (PowerPoint / Draw.io).',
    targetFile: 'TH8_SP12_KichBanThuatToan.docx',
    requirements: [
      'Chọn bài toán thực tế (tính tiền taxi, xếp loại học lực, hoặc giải phương trình bậc nhất)',
      'Xác định rõ ràng: Thông tin đầu vào (Input) và Kết quả đầu ra (Output)',
      'Mô tả các bước thực hiện thuật toán bằng ngôn ngữ tự nhiên',
      'Vẽ Sơ đồ khối (Flowchart) chuẩn quy ước: Oval (Bắt đầu/Kết thúc), Bình hành (Nhập/Xuất), Chữ nhật (Xử lý), Thoi (Điều kiện)',
      'Kiểm thử thuật toán bằng tay với ít nhất 2 bộ giá trị đầu vào khác nhau'
    ],
    steps: [
      'Chọn bài toán: Ví dụ phân loại học lực, tính tiền cước điện thoại, hoặc trò chơi giải đố số học.',
      'Xác định rõ thông tin đầu vào (Input) và kết quả đầu ra (Output).',
      'Mô tả các bước thực hiện thuật toán bằng ngôn ngữ tự nhiên.',
      'Vẽ sơ đồ khối (Flowchart) hoàn chỉnh gồm: Khối bắt đầu/kết thúc (Oval), Khối nhập/xuất (Hình bình hành), Khối xử lý (Hình chữ nhật), Khối điều kiện (Hình thoi) và các mũi tên chỉ luồng.',
      'Đánh giá tính đúng đắn của thuật toán bằng các giá trị thử nghiệm.',
      'Lưu tệp TH8_SP12_KichBanThuatToan.docx.'
    ],
    acceptanceCriteria: 'Sơ đồ khối đúng chuẩn quy ước hình học, luồng điều khiển logic và giải quyết đúng bài toán đặt ra.',
    expectedOutput: 'Tài liệu Word chứa đặc tả bài toán, phân tích Input/Output và sơ đồ khối thuật toán hoàn chỉnh.',
    sampleProduct: {
      fileName: 'TH8_SP12_KichBanThuatToan.docx',
      notes: 'Bản phân tích thuật toán tính cước cước phí giao hàng theo khoảng cách km kèm sơ đồ khối chi tiết.',
      content: 'THUẬT TOÁN TÍNH TIỀN CƯỚC VẬN CHUYỂN THEO KHOẢNG CÁCH (d km)\n\n1. Input: Khoảng cách d (km)\n2. Output: Số tiền cước T (đồng)\n3. Mô tả thuật toán:\n   - Bước 1: Nhập d\n   - Bước 2: Nếu d <= 2 thì T = 15000\n   - Bước 3: Nếu 2 < d <= 10 thì T = 15000 + (d - 2) * 8000\n   - Bước 4: Nếu d > 10 thì T = 15000 + 8 * 8000 + (d - 10) * 6000\n   - Bước 5: Xuất số tiền T và kết thúc.\n\n4. Sơ đồ khối: Gồm khối Bắt đầu -> Nhập d -> Khối thoi điều kiện rẽ nhánh -> Khối tính toán -> Khối xuất T -> Kết thúc.'
    },
    rubric: [
      { id: 'r1', name: 'Xác định Input/Output', description: 'Xác định chính xác thông tin đầu vào và kết quả đầu ra', maxScore: 2.5 },
      { id: 'r2', name: 'Mô tả thuật toán', description: 'Các bước diễn giải thuật toán tuần tự, mạch lạc, dễ hiểu', maxScore: 2.5 },
      { id: 'r3', name: 'Chuẩn quy ước sơ đồ khối', description: 'Vẽ đúng hình dạng các khối (Oval, Thoi, Chữ nhật, Bình hành) và hướng mũi tên', maxScore: 3.5 },
      { id: 'r4', name: 'Thử nghiệm và lưu tệp', description: 'Có bộ số kiểm tra tính đúng đắn, lưu đúng tên quy định', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th8-sp13-lap-trinh-cau-truc-re-nhanh',
    title: 'SP13. Lập trình cấu trúc rẽ nhánh trong chương trình',
    gradeLevel: 'Lớp 8',
    subjectType: 'scratch',
    durationMinutes: 45,
    description: 'Sử dụng khối lệnh hoặc câu lệnh điều kiện (if, if-else) để lập trình đưa ra quyết định tự động.',
    toolRequired: 'Scratch hoặc Python (nộp ảnh chụp màn hình + code hoặc tệp dự án).',
    targetFile: 'TH8_SP13_CauTrucReNhanh.docx',
    requirements: [
      'Viết chương trình có cấu trúc rẽ nhánh (dạng thiếu hoặc dạng đủ)',
      'Bài toán: Kiểm tra số chẵn/lẻ, xét điểm đỗ/trượt, hoặc tính tiền vé theo độ tuổi',
      'Hiển thị thông báo kết luận rõ ràng tương ứng với từng điều kiện',
      'Kiểm thử với ít nhất 3 bộ dữ liệu khác nhau (dữ liệu thỏa điều kiện, không thỏa, dữ liệu biên)',
      'Chụp ảnh màn hình khối lệnh/mã nguồn và kết quả chạy thử, lưu tệp TH8_SP13_CauTrucReNhanh.docx'
    ],
    steps: [
      'Mở môi trường lập trình (Scratch hoặc IDLE Python).',
      'Viết chương trình nhập vào một số hoặc điểm kiểm tra, sau đó kiểm tra điều kiện (ví dụ: Chẵn/Lẻ, Dương/Âm, hoặc Đạt/Không đạt).',
      'Sử dụng cấu trúc rẽ nhánh dạng đủ: if condition: ... else: ... hoặc khối Nếu ... thì ... Ngược lại.',
      'Hiển thị thông báo kết luận tương ứng trên màn hình nhân vật hoặc cửa sổ console.',
      'Chụp ảnh màn hình khối lệnh / mã nguồn và ảnh chạy thử với 3 bộ dữ liệu kiểm thử khác nhau.',
      'Dán vào Word và lưu tệp TH8_SP13_CauTrucReNhanh.docx (hoặc nộp tệp chương trình).'
    ],
    acceptanceCriteria: 'Chương trình chạy không có lỗi cú pháp, cấu trúc rẽ nhánh phân loại chính xác các trường hợp kiểm thử.',
    expectedOutput: 'Tài liệu Word chứa mã nguồn chương trình rẽ nhánh và ảnh chụp kết quả kiểm thử thực tế.',
    sampleProduct: {
      fileName: 'TH8_SP13_CauTrucReNhanh.docx',
      notes: 'Chương trình kiểm tra năm nhuận bằng Python/Scratch kèm ảnh chụp kết quả chạy thử 3 trường hợp.',
      content: 'BÁO CÁO THỰC HÀNH LẬP TRÌNH CẤU TRÚC RẼ NHÁNH\n\n1. Mã nguồn Python:\nyear = int(input("Nhập năm cần kiểm tra: "))\nif (year % 400 == 0) or (year % 4 == 0 and year % 100 != 0):\n    print(f"Năm {year} là năm nhuận (tháng 2 có 29 ngày).")\nelse:\n    print(f"Năm {year} KHÔNG phải năm nhuận (tháng 2 có 28 ngày).")\n\n2. Kết quả kiểm thử:\n- Test 1: Năm 2024 -> Kết quả: Năm nhuận (ĐÚNG)\n- Test 2: Năm 1900 -> Kết quả: Không phải năm nhuận (ĐÚNG)\n- Test 3: Năm 2023 -> Kết quả: Không phải năm nhuận (ĐÚNG)'
    },
    rubric: [
      { id: 'r1', name: 'Cú pháp cấu trúc rẽ nhánh', description: 'Sử dụng đúng cấu trúc điều kiện if / if-else không lỗi', maxScore: 3.5 },
      { id: 'r2', name: 'Độ chính xác thuật toán', description: 'Chương trình cho kết quả chuẩn xác 100% với các đầu vào', maxScore: 3.0 },
      { id: 'r3', name: 'Kiểm thử 3 trường hợp', description: 'Có đủ minh chứng chạy thử 3 trường hợp thử nghiệm', maxScore: 2.0 },
      { id: 'r4', name: 'Trình bày tài liệu nộp', description: 'Hình ảnh rõ nét, mã nguồn chú thích rõ ràng, đúng tên tệp', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  },
  {
    id: 'th8-sp14-lap-trinh-vong-lap-kiem-thu',
    title: 'SP14. Lập trình cấu trúc lặp và kiểm thử chương trình',
    gradeLevel: 'Lớp 8',
    subjectType: 'scratch',
    durationMinutes: 45,
    description: 'Lập trình cấu trúc lặp, xây dựng kịch bản kiểm thử và hoàn thiện chương trình sau gỡ lỗi.',
    toolRequired: 'Scratch hoặc Python (kèm tài liệu kiểm thử Word/ảnh).',
    targetFile: 'TH8_SP14_KiemThuChuongTrinh.docx',
    requirements: [
      'Xây dựng chương trình sử dụng cấu trúc lặp (lặp với số lần biết trước hoặc lặp với điều kiện)',
      'Bài toán: Tính tổng dãy số từ 1 đến N, vẽ hình đa giác đều N cạnh, hoặc tìm ước chung lớn nhất',
      'Lập bảng kiểm thử (Test Cases) có các cột: STT, Input, Output mong đợi, Output thực tế, Kết luận',
      'Thực hiện kiểm thử ít nhất 4 trường hợp (bình thường, số 0, số âm, số lớn)',
      'Chụp ảnh minh chứng chương trình thực thi thành công từng bộ test case'
    ],
    steps: [
      'Mở môi trường lập trình (Scratch hoặc Python).',
      'Xây dựng chương trình sử dụng cấu trúc lặp: Ví dụ tính tổng các số từ 1 đến N, vẽ hình đa giác đều, hoặc đếm các số thỏa mãn điều kiện.',
      'Thiết kế bảng trường hợp kiểm thử (Test Cases) gồm: Số thứ tự, Đầu vào (Input), Kết quả mong đợi (Expected Output), Kết quả thực tế (Actual Output), Đánh giá (Đạt/Lỗi).',
      'Chạy thử chương trình với từng bộ test case (trường hợp biên, trường hợp bình thường, trường hợp sai).',
      'Nếu có lỗi, tiến hành gỡ lỗi (debug) và hoàn thiện chương trình.',
      'Chụp ảnh màn hình mã nguồn và kết quả chạy thử các test case, lưu tệp TH8_SP14_KiemThuChuongTrinh.docx.'
    ],
    acceptanceCriteria: 'Thuật toán đúng, chương trình phân loại chính xác các trường hợp kiểm thử và có minh chứng chạy thử.',
    expectedOutput: 'Tài liệu Word chứa mã nguồn chương trình vòng lặp và bảng kiểm thử test cases có minh chứng ảnh chạy.',
    sampleProduct: {
      fileName: 'TH8_SP14_KiemThuChuongTrinh.docx',
      notes: 'Chương trình tính tổng S = 1 + 2 + ... + N bằng vòng lặp while/for kèm bảng test 4 trường hợp.',
      content: 'BÁO CÁO KIỂM THỬ CHƯƠNG TRÌNH VÒNG LẶP\nBài toán: Tính tổng các số tự nhiên từ 1 đến N\n\n1. Mã nguồn Python:\nn = int(input("Nhập số nguyên dương N: "))\nif n <= 0:\n    print("Vui lòng nhập số nguyên dương lớn hơn 0.")\nelse:\n    tong = 0\n    for i in range(1, n + 1):\n        tong += i\n    print(f"Tổng từ 1 đến {n} là: {tong}")\n\n2. Bảng kiểm thử (Test Cases):\n- Test 1 | Input: N = 5 | Expected: 15 | Actual: 15 | Kết luận: ĐẠT\n- Test 2 | Input: N = 10 | Expected: 55 | Actual: 55 | Kết luận: ĐẠT\n- Test 3 | Input: N = 1 | Expected: 1 | Actual: 1 | Kết luận: ĐẠT\n- Test 4 | Input: N = -3 | Expected: Báo lỗi | Actual: Báo lỗi | Kết luận: ĐẠT'
    },
    rubric: [
      { id: 'r1', name: 'Cấu trúc lặp chính xác', description: 'Sử dụng đúng vòng lặp (for/while) giải quyết trọn vẹn bài toán', maxScore: 3.5 },
      { id: 'r2', name: 'Bảng thiết kế kiểm thử', description: 'Có đủ 4 bộ test case bao quát trường hợp chuẩn và trường hợp biên', maxScore: 3.0 },
      { id: 'r3', name: 'Minh chứng chạy thử', description: 'Ảnh chụp màn hình thể hiện kết quả chạy thử trùng khớp với kỳ vọng', maxScore: 2.0 },
      { id: 'r4', name: 'Trình bày và lưu tệp', description: 'Báo cáo Word khoa học, lưu đúng tên TH8_SP14_KiemThuChuongTrinh.docx', maxScore: 1.5 }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    isActive: true
  }
];
