import { NextRequest, NextResponse } from "next/server";
import { getInnertube } from "@/lib/innertube";
import { OriginalTrack, ParseResponse, PlaylistMetadata } from "@/lib/types";
import { formatSecondsToDuration } from "@/lib/cleaner";

function extractIds(inputUrl: string): { playlistId?: string; videoId?: string } {
  const url = inputUrl.trim();

  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    
    // Check list param (playlist)
    const list = parsed.searchParams.get("list");
    if (list) {
      return { playlistId: list, videoId: parsed.searchParams.get("v") || undefined };
    }

    // Check video param
    const v = parsed.searchParams.get("v");
    if (v) {
      return { videoId: v };
    }

    // Check youtu.be shortlinks
    if (parsed.hostname.includes("youtu.be")) {
      const vid = parsed.pathname.slice(1);
      if (vid) return { videoId: vid };
    }

    // Check /watch/VIDEO_ID or /playlist/PLAYLIST_ID
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "playlist" && pathParts[1]) {
      return { playlistId: pathParts[1] };
    }
    if (pathParts[0] === "watch" && pathParts[1]) {
      return { videoId: pathParts[1] };
    }
  } catch {
    // If not a valid URL, check if input is directly an ID
    if (inputUrl.startsWith("PL") || inputUrl.startsWith("VLPL") || inputUrl.startsWith("RD")) {
      return { playlistId: inputUrl };
    }
    if (inputUrl.length === 11) {
      return { videoId: inputUrl };
    }
  }

  return {};
}

export async function POST(req: NextRequest): Promise<NextResponse<ParseResponse>> {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đường dẫn URL YouTube / YouTube Music hợp lệ" },
        { status: 400 }
      );
    }

    const { playlistId, videoId } = extractIds(url);

    if (!playlistId && !videoId) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy ID Playlist hoặc Video trong đường dẫn đã nhập" },
        { status: 400 }
      );
    }

    const yt = await getInnertube();

    // 1. Xử lý Single Video/Track
    if (videoId && !playlistId) {
      try {
        const info = await yt.getBasicInfo(videoId);
        const durationSec = info.basic_info.duration;
        const track: OriginalTrack = {
          id: videoId,
          title: info.basic_info.title || "Unknown Title",
          author: info.basic_info.author || "Unknown Artist",
          duration: formatSecondsToDuration(durationSec),
          durationSeconds: durationSec,
          thumbnailUrl:
            info.basic_info.thumbnail?.[0]?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          originalUrl: `https://music.youtube.com/watch?v=${videoId}`,
        };

        const metadata: PlaylistMetadata = {
          id: videoId,
          title: track.title,
          author: track.author,
          itemCount: 1,
          thumbnailUrl: track.thumbnailUrl,
          isSingleTrack: true,
        };

        return NextResponse.json({
          success: true,
          metadata,
          tracks: [track],
        });
      } catch (err: any) {
        return NextResponse.json(
          { success: false, error: `Không thể lấy thông tin video: ${err.message}` },
          { status: 404 }
        );
      }
    }

    // 2. Xử lý Playlist
    if (playlistId) {
      let rawItems: any[] = [];
      let playlistTitle = "YouTube Playlist";
      let playlistAuthor = "YouTube";
      let playlistThumb = "";

      // Thử lấy từ yt.music.getPlaylist trước (dành cho YouTube Music)
      try {
        const musicPl = (await yt.music.getPlaylist(playlistId)) as any;
        playlistTitle =
          musicPl.header?.title?.text ||
          musicPl.header?.title ||
          musicPl.info?.title ||
          "YouTube Music Playlist";
        playlistAuthor =
          musicPl.header?.author?.name ||
          musicPl.header?.author ||
          musicPl.info?.author?.name ||
          "YouTube Music";
        playlistThumb = musicPl.header?.thumbnails?.[0]?.url || "";

        if (musicPl.items && musicPl.items.length > 0) {
          rawItems = musicPl.items;
        }
      } catch (e) {
        console.warn("[yt.music.getPlaylist fallback to yt.getPlaylist]:", e);
      }

      // Fallback sang yt.getPlaylist nếu yt.music không có items
      if (rawItems.length === 0) {
        try {
          const mainPl = (await yt.getPlaylist(playlistId)) as any;
          playlistTitle = mainPl.info?.title || playlistTitle;
          playlistAuthor = mainPl.info?.author?.name || playlistAuthor;
          playlistThumb = mainPl.info?.thumbnails?.[0]?.url || playlistThumb;
          rawItems = mainPl.items || [];
        } catch (e: any) {
          return NextResponse.json(
            { success: false, error: `Không thể tìm thấy playlist hoặc playlist đang ở chế độ riêng tư: ${e.message}` },
            { status: 404 }
          );
        }
      }

      const tracks: OriginalTrack[] = rawItems.map((item: any) => {
        const id = item.id || item.video_id;
        const title = item.title?.text || item.title || "Untitled";
        const author =
          item.author?.name ||
          item.artists?.map((a: any) => a.name).join(", ") ||
          item.authors?.map((a: any) => a.name).join(", ") ||
          "Unknown Artist";
        const durationText =
          item.duration?.text ||
          (item.duration?.seconds ? formatSecondsToDuration(item.duration.seconds) : "");
        const durationSec = item.duration?.seconds;
        const thumb =
          item.thumbnails?.[0]?.url ||
          `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

        return {
          id,
          title,
          author,
          duration: durationText,
          durationSeconds: durationSec,
          thumbnailUrl: thumb,
          originalUrl: `https://music.youtube.com/watch?v=${id}`,
        };
      });

      const metadata: PlaylistMetadata = {
        id: playlistId,
        title: playlistTitle,
        author: playlistAuthor,
        itemCount: tracks.length,
        thumbnailUrl: playlistThumb || tracks[0]?.thumbnailUrl,
        isSingleTrack: false,
      };

      return NextResponse.json({
        success: true,
        metadata,
        tracks,
      });
    }

    return NextResponse.json({ success: false, error: "Yêu cầu không hợp lệ" }, { status: 400 });
  } catch (error: any) {
    console.error("[Parse Route Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi máy chủ khi phân tích playlist" },
      { status: 500 }
    );
  }
}
