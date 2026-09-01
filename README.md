# YTM MV to Album Converter 🎵 &rarr; 💿

Ứng dụng web Next.js chuyển đổi Playlist và Video âm nhạc (MV) trên **YouTube Music** sang bản **Song / Album phòng thu chính thức** (tương tự như chuyển đổi từ Playlist `test 1` sang `test 2`).

Tối ưu hóa 100% để triển khai miễn phí trên **Vercel Free Tier** mà không gặp lỗi Serverless Function Timeout.

---

## 🌟 Tính năng nổi bật

- **Làm sạch Metadata & Tiêu đề thông minh**: Loại bỏ tiền tố `OFFICIAL MV`, `(Official Music Video)`, `(Lyric Video)`, `(4K)`, tên kênh upload, v.v.
- **InnerTube Song Matcher**: Tìm kiếm chính xác bản Album / Single chính thức phát hành trên YouTube Music với chất lượng âm thanh chuẩn phòng thu (256kbps AAC).
- **So sánh 2 bên trực quan (Before vs. After)**: Hiển thị thời lượng tiết kiệm (loại bỏ intro/outro đối thoại của MV), ảnh bìa album, thông tin `Nghệ sĩ • Album`.
- **Tùy chọn ứng viên thay thế**: Cho phép người dùng nghe thử và chọn bản Album khác từ danh sách ứng viên gợi ý.
- **Bộ công cụ Xuất đa năng**:
  - 📋 **Sao chép toàn bộ link bài hát**
  - 💾 **Xuất file `.m3u`** (Dành cho VLC, Apple Music, máy nghe nhạc)
  - 📊 **Xuất file `.csv`** (Dành cho Excel, bảng tính)
  - ⚡ **Tạo Playlist trực tiếp vào tài khoản YouTube Music** (sử dụng Cookie xác thực an toàn)
- **Tối ưu Vercel Free Tier**: Xử lý phân đoạn (Chunked Batching) từ Client giúp chuyển đổi playlist lớn (>100 bài) mượt mà mà không lo timeout 10s.

---

## 🚀 Hướng dẫn Cài đặt & Chạy Local

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 18.x hoặc 20.x+
- **npm** hoặc **pnpm** / **yarn**

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Chạy môi trường Development
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

---

## ☁️ Hướng dẫn Deploy lên Vercel (Free Tier)

### Cách 1: Deploy qua GitHub (Khuyên dùng)
1. Khởi tạo Git repository và push mã nguồn lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: YTM MV to Album Converter"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Truy cập [Vercel Dashboard](https://vercel.com/new).
3. Chọn Repository vừa tạo và nhấn **Deploy**.
4. Vercel sẽ tự động build và cấp phát domain miễn phí dạng `https://your-app.vercel.app`.

### Cách 2: Deploy qua Vercel CLI
```bash
npx vercel
```

---

## 🛠️ Công nghệ sử dụng
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Serverless Functions)
- **YouTube API Engine**: [`youtubei.js`](https://github.com/LuanRT/YouTube.js) (Innertube API thuần TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (YouTube Music Dark Theme)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Hosting**: [Vercel](https://vercel.com/) (Free Hobby Plan)
