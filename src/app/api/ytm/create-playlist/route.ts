import { NextRequest, NextResponse } from "next/server";
import { getInnertube } from "@/lib/innertube";
import { CreatePlaylistRequest, CreatePlaylistResponse } from "@/lib/types";

export const maxDuration = 30;

export async function POST(
  req: NextRequest
): Promise<NextResponse<CreatePlaylistResponse>> {
  try {
    const body: CreatePlaylistRequest = await req.json();
    const { title, description, videoIds, cookie } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập tên Playlist mới" },
        { status: 400 }
      );
    }

    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Danh sách bài hát rỗng" },
        { status: 400 }
      );
    }

    if (!cookie || !cookie.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cần cung cấp Cookie YouTube Music để tạo Playlist trực tiếp vào tài khoản của bạn. Hoặc bạn có thể dùng tính năng 'Sao chép toàn bộ link' / 'Mở nhanh' mà không cần Cookie.",
        },
        { status: 401 }
      );
    }

    // Khởi tạo Innertube với cookie người dùng
    const yt = await getInnertube(cookie);

    // Tạo playlist mới trên YouTube Music (nhận 2 tham số: title, video_ids)
    try {
      const createRes = await yt.playlist.create(title.trim(), videoIds);

      const playlistId = createRes.playlist_id;

      if (!playlistId) {
        return NextResponse.json(
          {
            success: false,
            error: "Không nhận được Playlist ID từ YouTube. Vui lòng kiểm tra lại tính hợp lệ của Cookie.",
          },
          { status: 500 }
        );
      }

      // Cập nhật mô tả nếu có
      if (description && description.trim()) {
        try {
          await yt.playlist.setDescription(playlistId, description.trim());
        } catch (descErr) {
          console.warn("[Set Description Non-fatal Error]:", descErr);
        }
      }

      return NextResponse.json({
        success: true,
        playlistId,
        playlistUrl: `https://music.youtube.com/playlist?list=${playlistId}`,
      });
    } catch (apiErr: any) {
      console.error("[YouTube Playlist Create Error]:", apiErr);
      return NextResponse.json(
        {
          success: false,
          error: `Không thể tạo Playlist trên YouTube: ${apiErr.message || "Cookie không hợp lệ hoặc đã hết hạn"}`,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[Create Playlist Route Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi máy chủ khi tạo playlist",
      },
      { status: 500 }
    );
  }
}
