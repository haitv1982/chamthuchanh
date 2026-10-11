# Hệ Thống Quản Lý & Chấm Điểm Thực Hành Tin Học THCS (Khối 6, 7, 8, 9)

Ứng dụng web hỗ trợ giáo viên và học sinh thực hành môn Tin học theo chương trình GDPT 2018 (Khối 6, 7, 8, 9).

## Cách kích hoạt GitHub Pages để xem trang web trực tiếp

1. Mở trang repository trên **GitHub**.
2. Chọn tab **Settings** (Cài đặt) ở thanh menu trên cùng.
3. Ở menu bên trái, chọn **Pages**.
4. Tại mục **Build and deployment** -> **Source**:
   - Chọn **GitHub Actions**.
5. Vào tab **Actions** trên GitHub, workflow **Deploy to GitHub Pages** sẽ tự động chạy (build & deploy).
6. Sau khoảng 1-2 phút, đường dẫn website của bạn sẽ xuất hiện tại mục **Deployments** trên trang chính repository (hoặc trong phần GitHub Pages settings).

## Chạy thử ở môi trường Local (Máy tính cá nhân)

```bash
# Cài đặt thư viện
npm install

# Chạy bản thử nghiệm lập trình
npm run dev

# Đóng gói xuất bản
npm run build
```
