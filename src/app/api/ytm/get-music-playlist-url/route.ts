import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Dữ liệu không đúng định dạng JSON" },
        { status: 400 }
      );
    }
    const { videoIds } = body || {};

    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Danh sách bài hát rỗng" },
        { status: 400 }
      );
    }

    const watchUrl = `https://www.youtube.com/watch_videos?video_ids=${videoIds.join(",")}`;

    // Lấy link redirect chứa mã playlist TLGG...
    const res = await fetch(watchUrl, {
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const location = res.headers.get("location");

    if (location) {
      // Đổi sang domain music.youtube.com
      const musicUrl = location.replace("www.youtube.com", "music.youtube.com");
      return NextResponse.json({
        success: true,
        musicUrl,
        youtubeUrl: location,
      });
    }

    // Fallback nếu không có header location
    return NextResponse.json({
      success: true,
      musicUrl: `https://music.youtube.com/watch_videos?video_ids=${videoIds.join(",")}`,
      youtubeUrl: watchUrl,
    });
  } catch (error: any) {
    console.error("[Get Music Playlist URL Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi tạo link YouTube Music" },
      { status: 500 }
    );
  }
}
