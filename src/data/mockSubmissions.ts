import { Submission } from '../types';

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-6a2-01',
    assignmentId: 'sp04-poster-internet-an-toan',
    assignmentTitle: 'SP04. Poster sử dụng Internet an toàn',
    className: '6A2',
    machineNumber: 'Máy 01',
    studentLeader: 'Nguyễn Hoàng Long',
    groupMembers: ['Phạm Thu Trang'],
    attempts: [
      {
        attemptNumber: 1,
        timestamp: '2026-10-08T07:15:00Z',
        fileName: 'Poster_An_Toan_Internet.docx',
        fileSize: 8540,
        fileContent: '[Tệp tài liệu Word: Poster tuyên truyền 5 quy tắc an toàn không gian mạng, định dạng SmartArt, 2 hình ảnh minh họa, Page Border]',
        score: 10.0,
        criteriaResults: [
          {
            criterionId: 'r1',
            criterionName: 'Định dạng trang giấy & Canh lề chuẩn',
            score: 2.5,
            maxScore: 2.5,
            feedback: 'Căn lề chuẩn A4, giãn dòng 1.15 lines rất đẹp mắt.',
          },
          {
            criterionId: 'r2',
            criterionName: 'Bố cục & Sử dụng đối tượng đồ họa (Shapes, SmartArt)',
            score: 3.5,
            maxScore: 3.5,
            feedback: 'Sử dụng SmartArt dạng vòng tròn phân nhánh rất sáng tạo.',
          },
          {
            criterionId: 'r3',
            criterionName: 'Xử lý hình ảnh & Màu sắc chữ',
            score: 2.5,
            maxScore: 2.5,
            feedback: 'Hình ảnh sắc nét, có bo viền bóng mờ thẩm mỹ cao.',
          },
          {
            criterionId: 'r4',
            criterionName: 'Nội dung thông điệp sâu sắc & Không lỗi gõ',
            score: 1.5,
            maxScore: 1.5,
            feedback: 'Không có lỗi chính tả, nội dung tuyên truyền ý nghĩa.',
          },
        ],
        strengths: ['Sản phẩm thiết kế chuyên nghiệp, màu sắc bắt mắt, đáp ứng trọn vẹn yêu cầu.'],
        weaknesses: [],
        howToGetTen: ['Đạt điểm 10 tối đa xuất sắc!'],
      },
    ],
    highestScore: 10.0,
    latestScore: 10.0,
    latestSubmittedAt: '2026-10-08T07:15:00Z',
    status: 'perfect',
  },
  {
    id: 'sub-6a2-02',
    assignmentId: 'sp04-poster-internet-an-toan',
    assignmentTitle: 'SP04. Poster sử dụng Internet an toàn',
    className: '6A2',
    machineNumber: 'Máy 02',
    studentLeader: 'Lê Minh Quân',
    groupMembers: ['Vũ Đức Anh', 'Đỗ Quỳnh Anh'],
    attempts: [
      {
        attemptNumber: 1,
        timestamp: '2026-10-08T07:18:00Z',
        fileName: 'Quy_Tac_Internet_Nhom2.docx',
        fileSize: 6200,
        fileContent: '[Tệp Word: 5 quy tắc bảo vệ thông tin cá nhân và mật khẩu an toàn]',
        score: 8.5,
        criteriaResults: [
          {
            criterionId: 'r1',
            criterionName: 'Định dạng trang giấy & Canh lề chuẩn',
            score: 2.5,
            maxScore: 2.5,
            feedback: 'Định dạng trang chuẩn.',
          },
          {
            criterionId: 'r2',
            criterionName: 'Bố cục & Sử dụng đối tượng đồ họa (Shapes, SmartArt)',
            score: 3.0,
            maxScore: 3.5,
            feedback: 'Đã có khung viền nhưng có thể bổ sung thêm màu nền cho khối.',
          },
          {
            criterionId: 'r3',
            criterionName: 'Xử lý hình ảnh & Màu sắc chữ',
            score: 2.0,
            maxScore: 2.5,
            feedback: 'Mới chèn 1 hình ảnh minh họa, cần thêm 1 ảnh nữa.',
          },
          {
            criterionId: 'r4',
            criterionName: 'Nội dung thông điệp sâu sắc & Không lỗi gõ',
            score: 1.0,
            maxScore: 1.5,
            feedback: 'Thiếu thông điệp khẩu hiệu ở cuối trang.',
          },
        ],
        strengths: ['Trình bày sạch sẽ, các quy tắc rõ ràng dễ nhớ.'],
        weaknesses: ['Cần chèn thêm 1 ảnh minh họa và thêm câu khẩu hiệu kết luận.'],
        howToGetTen: [
          'Chèn thêm 1 hình ảnh biểu tượng ổ khóa an toàn vào mục mật khẩu.',
          'Bổ sung câu khẩu hiệu: "Hãy là người dùng Internet thông thái!" ở chân trang và nộp lại để nhận 10 điểm.',
        ],
      },
    ],
    highestScore: 8.5,
    latestScore: 8.5,
    latestSubmittedAt: '2026-10-08T07:18:00Z',
    status: 'graded',
  },
  {
    id: 'sub-8a2-01',
    assignmentId: 'assign-python-8-prime',
    assignmentTitle: 'Bài thực hành: Thuật toán kiểm tra số nguyên tố và đếm ước',
    className: '8A2',
    machineNumber: 'Máy 01',
    studentLeader: 'Nguyễn Văn An',
    groupMembers: ['Trần Minh Bình'],
    attempts: [
      {
        attemptNumber: 1,
        timestamp: '2026-10-08T07:12:00Z',
        fileName: 'kiem_tra_so_nguyen_to.py',
        fileSize: 450,
        fileContent: `n = int(input("Nhap n: "))
count = 0
for i in range(1, n + 1):
    if n % i == 0:
        count += 1
if count == 2:
    print(n, "la so nguyen to")
else:
    print(n, "khong phai so nguyen to")`,
        score: 7.5,
        criteriaResults: [
          {
            criterionId: 'r1',
            criterionName: 'Đúng chức năng & Thuật toán kiểm tra số nguyên tố',
            score: 3.0,
            maxScore: 3.5,
            feedback: 'Thuật toán chạy đúng với số thông thường nhưng chưa kiểm tra trường hợp n <= 1.',
          },
          {
            criterionId: 'r2',
            criterionName: 'Liệt kê và đếm ước số của n',
            score: 2.0,
            maxScore: 3.0,
            feedback: 'Mới đếm được số lượng ước, chưa in ra danh sách các ước số của n theo yêu cầu đề bài.',
          },
          {
            criterionId: 'r3',
            criterionName: 'Cấu trúc mã nguồn, chú thích & Đặt tên biến',
            score: 1.5,
            maxScore: 2.0,
            feedback: 'Code gọn gàng nhưng thiếu comment chú thích ý nghĩa.',
          },
          {
            criterionId: 'r4',
            criterionName: 'Tối ưu hóa vòng lặp & Xử lý ngoại lệ',
            score: 1.0,
            maxScore: 1.5,
            feedback: 'Vòng lặp chạy từ 1 đến n, chưa tối ưu.',
          },
        ],
        strengths: [
          'Chương trình chạy không lỗi cú pháp cơ bản.',
          'Sử dụng vòng lặp for và điều kiện if chia hết chính xác.',
        ],
        weaknesses: [
          'Chưa in danh sách các ước số của n ra màn hình.',
          'Chưa bẫy lỗi khi người dùng nhập số âm hoặc số 1.',
        ],
        howToGetTen: [
          'Tạo một danh sách `uoc_so = []` và dùng `uoc_so.append(i)` mỗi khi n chia hết cho i, sau đó in ra danh sách này.',
          'Thêm điều kiện kiểm tra `if n <= 1:` ngay từ đầu.',
        ],
      },
      {
        attemptNumber: 2,
        timestamp: '2026-10-08T07:28:00Z',
        fileName: 'kiem_tra_so_nguyen_to_v2.py',
        fileSize: 820,
        fileContent: `# Chuong trinh kiem tra so nguyen to va liet ke uoc so
# Nhom An va Binh - Lop 8A - May 01
import math

n = int(input("Nhap so nguyen duong n: "))
if n <= 1:
    print(n, "khong phai la so nguyen to")
else:
    uoc_so = []
    # Tim tat ca uoc so
    for i in range(1, n + 1):
        if n % i == 0:
            uoc_so.append(i)
            
    # Kiem tra so nguyen to
    if len(uoc_so) == 2:
        print(f"{n} la so nguyen to.")
    else:
        print(f"{n} khong phai so nguyen to.")
        
    print(f"Danh sach tat ca cac uoc cua {n}:", uoc_so)
    print(f"Tong so luong uoc: {len(uoc_so)}")`,
        score: 10.0,
        criteriaResults: [
          {
            criterionId: 'r1',
            criterionName: 'Đúng chức năng & Thuật toán kiểm tra số nguyên tố',
            score: 3.5,
            maxScore: 3.5,
            feedback: 'Hoàn hảo! Đã xử lý đầy đủ trường hợp n <= 1 và số nguyên tố.',
          },
          {
            criterionId: 'r2',
            criterionName: 'Liệt kê và đếm ước số của n',
            score: 3.0,
            maxScore: 3.0,
            feedback: 'In danh sách ước số rất rõ ràng bằng list và f-string.',
          },
          {
            criterionId: 'r3',
            criterionName: 'Cấu trúc mã nguồn, chú thích & Đặt tên biến',
            score: 2.0,
            maxScore: 2.0,
            feedback: 'Có chú thích đầy đủ, tên biến tiếng Việt không dấu chuẩn.',
          },
          {
            criterionId: 'r4',
            criterionName: 'Tối ưu hóa vòng lặp & Xử lý ngoại lệ',
            score: 1.5,
            maxScore: 1.5,
            feedback: 'Bài làm xuất sắc, cấu trúc logic mạch lạc.',
          },
        ],
        strengths: [
          'Đã tiếp thu và khắc phục hoàn toàn mọi thiếu sót của lần nộp 1!',
          'Trình bày kết quả đẹp mắt, trực quan và chuyên nghiệp.',
        ],
        weaknesses: [],
        howToGetTen: ['Bạn đã đạt điểm 10 tối đa!'],
      },
    ],
    highestScore: 10.0,
    latestScore: 10.0,
    latestSubmittedAt: '2026-10-08T07:28:00Z',
    status: 'perfect',
  },
  {
    id: 'sub-8a2-02',
    assignmentId: 'assign-python-8-prime',
    assignmentTitle: 'Bài thực hành: Thuật toán kiểm tra số nguyên tố và đếm ước',
    className: '8A2',
    machineNumber: 'Máy 02',
    studentLeader: 'Lê Hoàng Cường',
    groupMembers: ['Phạm Thanh Duy'],
    attempts: [
      {
        attemptNumber: 1,
        timestamp: '2026-10-08T07:18:00Z',
        fileName: 'bai_thuc_hanh_prime.py',
        fileSize: 512,
        fileContent: `n = int(input("Nhap n: "))
is_prime = True
if n < 2:
    is_prime = False
else:
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            is_prime = False
            break
if is_prime:
    print(n, "la so nguyen to")
else:
    print(n, "khong phai so nguyen to")`,
        score: 8.5,
        criteriaResults: [
          {
            criterionId: 'r1',
            criterionName: 'Đúng chức năng & Thuật toán kiểm tra số nguyên tố',
            score: 3.5,
            maxScore: 3.5,
            feedback: 'Thuật toán kiểm tra số nguyên tố rất tốt và tối ưu với n**0.5.',
          },
          {
            criterionId: 'r2',
            criterionName: 'Liệt kê và đếm ước số của n',
            score: 1.5,
            maxScore: 3.0,
            feedback: 'Còn thiếu chức năng liệt kê và in ra tất cả các ước số của n.',
          },
          {
            criterionId: 'r3',
            criterionName: 'Cấu trúc mã nguồn, chú thích & Đặt tên biến',
            score: 2.0,
            maxScore: 2.0,
            feedback: 'Đặt tên biến is_prime chuẩn quốc tế.',
          },
          {
            criterionId: 'r4',
            criterionName: 'Tối ưu hóa vòng lặp & Xử lý ngoại lệ',
            score: 1.5,
            maxScore: 1.5,
            feedback: 'Đã tối ưu chạy đến căn bậc 2.',
          },
        ],
        strengths: [
          'Thuật toán kiểm tra số nguyên tố tối ưu chạy rất nhanh.',
          'Đặt tên biến tiếng Anh logic và dễ đọc.',
        ],
        weaknesses: [
          'Chưa viết đoạn code tìm và in danh sách các ước số của n.',
        ],
        howToGetTen: [
          'Thêm một vòng lặp for chạy từ 1 đến n để in ra các ước số mà n chia hết.',
          'Nộp lại lần 2 để nâng điểm từ 8.5 lên 10.0 nhé!',
        ],
      },
    ],
    highestScore: 8.5,
    latestScore: 8.5,
    latestSubmittedAt: '2026-10-08T07:18:00Z',
    status: 'graded',
  },
  {
    id: 'sub-8a2-03',
    assignmentId: 'assign-python-8-prime',
    assignmentTitle: 'Bài thực hành: Thuật toán kiểm tra số nguyên tố và đếm ước',
    className: '8A2',
    machineNumber: 'Máy 03',
    studentLeader: 'Hoàng Thùy Dương',
    groupMembers: ['Đỗ Quỳnh Giang'],
    attempts: [
      {
        attemptNumber: 1,
        timestamp: '2026-10-08T07:10:00Z',
        fileName: 'cau_1.py',
        fileSize: 320,
        fileContent: `n = int(input())
for i in range(1, n):
    if n % i == 0:
        print(i)`,
        score: 6.0,
        criteriaResults: [
          {
            criterionId: 'r1',
            criterionName: 'Đúng chức năng & Thuật toán kiểm tra số nguyên tố',
            score: 1.5,
            maxScore: 3.5,
            feedback: 'Chưa có thông báo kết luận n có phải là số nguyên tố hay không.',
          },
          {
            criterionId: 'r2',
            criterionName: 'Liệt kê và đếm ước số của n',
            score: 2.0,
            maxScore: 3.0,
            feedback: 'Vòng lặp range(1, n) bị thiếu chính số n (ước số lớn nhất). Cần dùng range(1, n + 1).',
          },
          {
            criterionId: 'r3',
            criterionName: 'Cấu trúc mã nguồn, chú thích & Đặt tên biến',
            score: 1.5,
            maxScore: 2.0,
            feedback: 'Thiếu câu nhắc người dùng khi nhập (input prompt) và thiếu comment.',
          },
          {
            criterionId: 'r4',
            criterionName: 'Tối ưu hóa vòng lặp & Xử lý ngoại lệ',
            score: 1.0,
            maxScore: 1.5,
            feedback: 'Cần hoàn thiện thêm cấu trúc rẽ nhánh.',
          },
        ],
        strengths: ['Đã biết dùng vòng lặp for và toán tử lấy dư %.'],
        weaknesses: [
          'Thiếu logic kết luận số nguyên tố.',
          'Khoảng lặp range bị thiếu số n.',
        ],
        howToGetTen: [
          'Sửa `range(1, n)` thành `range(1, n + 1)` để không bị sót ước n.',
          'Đếm số ước, nếu đúng bằng 2 thì in "Là số nguyên tố", ngược lại "Không là số nguyên tố".',
          'Sửa code và bấm nộp lại ngay để nâng điểm lên 10 nhé!',
        ],
      },
      {
        attemptNumber: 2,
        timestamp: '2026-10-08T07:32:00Z',
        fileName: 'cau_1_sua.py',
        fileSize: 680,
        fileContent: `# Bai thuc hanh so nguyen to - May 03
n = int(input("Nhap so n: "))
uoc = []
for i in range(1, n + 1):
    if n % i == 0:
        uoc.append(i)

print("Cac uoc cua", n, "la:", uoc)
if len(uoc) == 2:
    print(n, "la so nguyen to")
else:
    print(n, "khong phai la so nguyen to")`,
        score: 9.5,
        criteriaResults: [
          {
            criterionId: 'r1',
            criterionName: 'Đúng chức năng & Thuật toán kiểm tra số nguyên tố',
            score: 3.5,
            maxScore: 3.5,
            feedback: 'Đã bổ sung kết luận chính xác!',
          },
          {
            criterionId: 'r2',
            criterionName: 'Liệt kê và đếm ước số của n',
            score: 3.0,
            maxScore: 3.0,
            feedback: 'Đã sửa dải lặp và in đủ tất cả các ước.',
          },
          {
            criterionId: 'r3',
            criterionName: 'Cấu trúc mã nguồn, chú thích & Đặt tên biến',
            score: 1.8,
            maxScore: 2.0,
            feedback: 'Code sáng sủa, dễ hiểu.',
          },
          {
            criterionId: 'r4',
            criterionName: 'Tối ưu hóa vòng lặp & Xử lý ngoại lệ',
            score: 1.2,
            maxScore: 1.5,
            feedback: 'Thêm kiểm tra số <= 0 là tròn 10 điểm tuyệt đối.',
          },
        ],
        strengths: [
          'Tiến bộ vượt bậc từ 6.0 điểm lên 9.5 điểm!',
          'Khắc phục chính xác các gợi ý sửa lỗi.',
        ],
        weaknesses: ['Chưa bẫy lỗi trường hợp n âm.'],
        howToGetTen: [
          'Thêm điều kiện `if n <= 1:` ở đầu bài là đạt trọn 10 điểm!',
        ],
      },
    ],
    highestScore: 9.5,
    latestScore: 9.5,
    latestSubmittedAt: '2026-10-08T07:32:00Z',
    status: 'graded',
  },
  {
    id: 'sub-8a2-04',
    assignmentId: 'assign-python-8-prime',
    assignmentTitle: 'Bài thực hành: Thuật toán kiểm tra số nguyên tố và đếm ước',
    className: '8A2',
    machineNumber: 'Máy 04',
    studentLeader: 'Vũ Quốc Hưng',
    groupMembers: ['Mai Tuấn Kiệt'],
    attempts: [
      {
        attemptNumber: 1,
        timestamp: '2026-10-08T07:22:00Z',
        fileName: 'prime_may4.py',
        fileSize: 760,
        fileContent: `# Tinh toan so nguyen to
n = int(input("Nhap vao n: "))
if n <= 1:
    print(n, "khong phai so nguyen to")
else:
    uocs = []
    for i in range(1, n + 1):
        if n % i == 0:
            uocs.append(i)
    if len(uocs) == 2:
        print(f"-> {n} la so nguyen to!")
    else:
        print(f"-> {n} khong phai so nguyen to!")
    print("Danh sach cac uoc so:", uocs)`,
        score: 10.0,
        criteriaResults: [
          {
            criterionId: 'r1',
            criterionName: 'Đúng chức năng & Thuật toán kiểm tra số nguyên tố',
            score: 3.5,
            maxScore: 3.5,
            feedback: 'Đầy đủ trường hợp biên, thuật toán chuẩn xác.',
          },
          {
            criterionId: 'r2',
            criterionName: 'Liệt kê và đếm ước số của n',
            score: 3.0,
            maxScore: 3.0,
            feedback: 'Liệt kê ước số đầy đủ và chính xác.',
          },
          {
            criterionId: 'r3',
            criterionName: 'Cấu trúc mã nguồn, chú thích & Đặt tên biến',
            score: 2.0,
            maxScore: 2.0,
            feedback: 'Trình bày chuẩn PEP 8.',
          },
          {
            criterionId: 'r4',
            criterionName: 'Tối ưu hóa vòng lặp & Xử lý ngoại lệ',
            score: 1.5,
            maxScore: 1.5,
            feedback: 'Tốt.',
          },
        ],
        strengths: ['Bài làm đạt chuẩn ngay lần nộp đầu tiên.'],
        weaknesses: [],
        howToGetTen: ['Đạt 10/10 xuất sắc!'],
      },
    ],
    highestScore: 10.0,
    latestScore: 10.0,
    latestSubmittedAt: '2026-10-08T07:22:00Z',
    status: 'perfect',
  },
  {
    id: 'sub-7b2-01',
    assignmentId: 'th7-sp05-tao-bang-du-lieu-bang-tinh',
    assignmentTitle: 'SP05. Tạo bảng dữ liệu bằng phần mềm bảng tính',
    className: '7B2',
    machineNumber: 'Máy 01',
    studentLeader: 'Trịnh Bảo Lâm',
    groupMembers: ['Đặng Ngọc Mai'],
    attempts: [
      {
        attemptNumber: 1,
        timestamp: '2026-10-08T07:15:00Z',
        fileName: 'Bang_Diem_Lop_7B.xlsx',
        fileSize: 12400,
        fileContent: '[Tệp bảng tính Microsoft Excel: Có bảng điểm 12 học sinh, công thức AVERAGE, IF xếp loại, MAX, MIN]',
        score: 9.0,
        criteriaResults: [
          {
            criterionId: 'r1',
            criterionName: 'Định dạng bảng biểu & Dữ liệu đầu vào',
            score: 2.5,
            maxScore: 2.5,
            feedback: 'Kẻ khung viền đầy đủ, căn lề văn bản bên trái, số bên phải rất chuẩn.',
          },
          {
            criterionId: 'r2',
            criterionName: 'Sử dụng đúng hàm tính toán (AVERAGE, ROUND, MAX, MIN)',
            score: 3.5,
            maxScore: 3.5,
            feedback: 'Công thức AVERAGE lồng hàm ROUND làm tròn 1 chữ số thập phân chính xác.',
          },
          {
            criterionId: 'r3',
            criterionName: 'Hàm logic IF lồng nhau xếp loại học lực',
            score: 2.0,
            maxScore: 2.5,
            feedback: 'Hàm IF chạy tốt nhưng điều kiện ranh giới 8.0 và 6.5 nên dùng >= thay vì >.',
          },
          {
            criterionId: 'r4',
            criterionName: 'Hàm RANK xếp thứ hạng và thẩm mỹ bảng tính',
            score: 1.0,
            maxScore: 1.5,
            feedback: 'Trong hàm RANK chưa cố định vùng dữ liệu bằng dấu $ (địa chỉ tuyệt đối).',
          },
        ],
        strengths: ['Bảng tính trình bày đẹp, màu sắc tiêu đề trang nhã, đủ các hàm.'],
        weaknesses: ['Hàm RANK khi kéo fill xuống bị lệch vùng vì thiếu dấu $.'],
        howToGetTen: [
          'Nhấn F4 để chuyển vùng tham chiếu trong hàm RANK sang dạng tuyệt đối (ví dụ: $H$5:$H$16).',
          'Nộp lại để nhận ngay điểm 10 tuyệt đối!',
        ],
      },
    ],
    highestScore: 9.0,
    latestScore: 9.0,
    latestSubmittedAt: '2026-10-08T07:15:00Z',
    status: 'graded',
  },
  {
    id: 'sub-8a2-01',
    assignmentId: 'th8-sp01-danh-gia-chat-luong-thong-tin',
    assignmentTitle: 'SP01. Đánh giá chất lượng thông tin tìm được trên Internet',
    className: '8A2',
    machineNumber: 'Máy 01',
    studentLeader: 'Đỗ Minh Khang',
    groupMembers: ['Vũ Bảo Trâm'],
    attempts: [
      {
        attemptNumber: 1,
        timestamp: '2026-10-08T07:20:00Z',
        fileName: 'TH8_SP01_DanhGiaThongTin.docx',
        fileSize: 14200,
        fileContent: '[Tài liệu Word: Báo cáo đánh giá chất lượng thông tin mạng, bảng so sánh 2 nguồn tin theo 4 tiêu chí]',
        score: 10.0,
        criteriaResults: [
          {
            criterionId: 'r1',
            criterionName: 'Đủ 2 nguồn tìm kiếm',
            score: 2.5,
            maxScore: 2.5,
            feedback: 'Đã trích dẫn đủ 2 nguồn tin uy tín và nguồn blog kèm link rõ ràng.',
          },
          {
            criterionId: 'r2',
            criterionName: 'Bảng đánh giá tiêu chí',
            score: 3.5,
            maxScore: 3.5,
            feedback: 'Bảng phân tích mạch lạc, đủ 4 tiêu chí đánh giá chuẩn xác.',
          },
          {
            criterionId: 'r3',
            criterionName: 'Kết luận có căn cứ',
            score: 2.5,
            maxScore: 2.5,
            feedback: 'Lập luận thuyết phục, chỉ rõ lý do nguồn tin chính thống tin cậy hơn.',
          },
          {
            criterionId: 'r4',
            criterionName: 'Hình thức văn bản',
            score: 1.5,
            maxScore: 1.5,
            feedback: 'Trình bày Word đẹp, căn lề Justify chuẩn, lưu đúng tên tệp.',
          },
        ],
        strengths: ['Bài làm xuất sắc, phân tích sâu sắc và lập luận thuyết phục.'],
        weaknesses: [],
        howToGetTen: ['Đạt 10/10 xuất sắc!'],
      },
    ],
    highestScore: 10.0,
    latestScore: 10.0,
    latestSubmittedAt: '2026-10-08T07:20:00Z',
    status: 'perfect',
  },
  {
    id: 'sub-9a2-01',
    assignmentId: 'th9-sp01-danh-gia-do-tin-cay-thong-tin',
    assignmentTitle: 'SP01. Đánh giá độ tin cậy của thông tin trên Internet',
    className: '9A2',
    machineNumber: 'Máy 01',
    studentLeader: 'Nguyễn Hoàng Long',
    groupMembers: ['Trần Thu Phương'],
    attempts: [
      {
        attemptNumber: 1,
        timestamp: '2026-10-09T07:25:00Z',
        fileName: 'TH9_SP01_DanhGiaThongTin.docx',
        fileSize: 15400,
        fileContent: '[Tài liệu Word: Báo cáo đánh giá độ tin cậy thông tin mạng, so sánh nguồn Bộ Y tế và diễn đàn tự phát]',
        score: 10.0,
        criteriaResults: [
          {
            criterionId: 'r1',
            criterionName: 'Đủ 2 nguồn tìm kiếm',
            score: 2.5,
            maxScore: 2.5,
            feedback: 'Đã trích dẫn chính xác nguồn Cổng TT Bộ Y tế và diễn đàn sức khỏe kèm URL.',
          },
          {
            criterionId: 'r2',
            criterionName: 'Bảng so sánh đối chiếu',
            score: 3.5,
            maxScore: 3.5,
            feedback: 'Bảng đối chiếu đa chiều, phân tích rõ ràng thẩm quyền, bằng chứng và tính thời sự.',
          },
          {
            criterionId: 'r3',
            criterionName: 'Kết luận có căn cứ',
            score: 2.5,
            maxScore: 2.5,
            feedback: 'Kết luận sắc bén, thuyết phục với lập luận dựa trên phương pháp khoa học.',
          },
          {
            criterionId: 'r4',
            criterionName: 'Hình thức văn bản',
            score: 1.5,
            maxScore: 1.5,
            feedback: 'Trình bày tài liệu Word chuẩn thể thức, đúng tên tệp TH9_SP01_DanhGiaThongTin.docx.',
          },
        ],
        strengths: ['Bài làm xuất sắc, phân tích sâu sắc và lập luận thuyết phục.'],
        weaknesses: [],
        howToGetTen: ['Đạt 10/10 xuất sắc!'],
      },
    ],
    highestScore: 10.0,
    latestScore: 10.0,
    latestSubmittedAt: '2026-10-09T07:25:00Z',
    status: 'perfect',
  },
  {
    id: 'sub-9a2-02',
    assignmentId: 'th9-sp02-thiet-ke-infographic-an-toan-so',
    assignmentTitle: 'SP02. Thiết kế infographic an toàn và văn hóa số',
    className: '9A2',
    machineNumber: 'Máy 02',
    studentLeader: 'Lê Thùy Dung',
    groupMembers: ['Phạm Tuấn Kiệt'],
    attempts: [
      {
        attemptNumber: 1,
        timestamp: '2026-10-09T07:30:00Z',
        fileName: 'TH9_SP02_InfographicAnToan.png',
        fileSize: 420000,
        fileContent: '[Ảnh PNG: Infographic 4 thông điệp vàng văn hóa và an toàn số]',
        score: 9.5,
        criteriaResults: [
          {
            criterionId: 'r1',
            criterionName: 'Đủ 4 thông điệp',
            score: 3.0,
            maxScore: 3.0,
            feedback: 'Đầy đủ 4 thông điệp: mật khẩu mạnh, kiểm tra tin giả, ứng xử văn minh, bảo vệ dữ liệu.',
          },
          {
            criterionId: 'r2',
            criterionName: 'Bố cục & Thẩm mỹ',
            score: 3.0,
            maxScore: 3.0,
            feedback: 'Thiết kế đẹp, màu sắc tương phản tốt, phân cấp thông tin rõ ràng.',
          },
          {
            criterionId: 'r3',
            criterionName: 'Hình ảnh & Biểu tượng',
            score: 2.0,
            maxScore: 2.5,
            feedback: 'Biểu tượng khá phù hợp, có thể tăng thêm 1 icon ở phần bảo vệ dữ liệu.',
          },
          {
            criterionId: 'r4',
            criterionName: 'Định dạng & Xuất tệp',
            score: 1.5,
            maxScore: 1.5,
            feedback: 'Tệp ảnh PNG độ nét cao, lưu đúng tên quy định.',
          },
        ],
        strengths: ['Infographic bắt mắt, truyền tải thông điệp văn hóa số mạnh mẽ.'],
        weaknesses: ['Có thể bổ sung thêm biểu tượng ổ khóa bảo mật để tăng tính trực quan.'],
        howToGetTen: ['Bổ sung thêm biểu tượng trực quan ở phần dữ liệu để đạt 10 điểm tuyệt đối!'],
      },
    ],
    highestScore: 9.5,
    latestScore: 9.5,
    latestSubmittedAt: '2026-10-09T07:30:00Z',
    status: 'graded',
  },
];

