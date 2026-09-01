import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YTM MV to Album Converter | Chuyển đổi Playlist YouTube Music sang Bản Studio",
  description:
    "Tự động tìm kiếm và thay thế các video ca nhạc (MV) trong Playlist YouTube Music sang bản Album / Song chính thức với chất lượng âm thanh phòng thu chuẩn.",
  icons: {
    icon: "https://music.youtube.com/img/favicon_144.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-[#030303] text-[#f1f1f1] antialiased selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
