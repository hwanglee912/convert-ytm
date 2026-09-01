import { NextRequest, NextResponse } from "next/server";
import { getInnertube } from "@/lib/innertube";
import { OriginalTrack, ParseResponse, PlaylistMetadata } from "@/lib/types";
import { formatSecondsToDuration } from "@/lib/cleaner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function extractIds(inputUrl: string): { playlistId?: string; videoId?: string } {
  let url = inputUrl.trim();

  try {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    const parsed = new URL(url);
    
    // Check list param (playlist)
    const list = parsed.searchParams.get("list");
    const v = parsed.searchParams.get("v");
    if (list) {
      return { playlistId: list, videoId: v || undefined };
    }

    // Check video param
    if (v) {
      return { videoId: v };
    }

    // Check youtu.be shortlinks
    if (parsed.hostname.includes("youtu.be")) {
      const vid = parsed.pathname.replace(/^\/+/, "");
      if (vid) return { videoId: vid };
    }

    // Check /watch/VIDEO_ID or /playlist/PLAYLIST_ID or /browse/ID
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "playlist" && pathParts[1]) {
      return { playlistId: pathParts[1] };
    }
    if (pathParts[0] === "browse" && pathParts[1]) {
      return { playlistId: pathParts[1] };
    }
    if (pathParts[0] === "watch" && pathParts[1]) {
      return { videoId: pathParts[1] };
    }
  } catch {
    // If not a standard URL, check direct ID patterns
  }

  const cleaned = inputUrl.trim().replace(/^https?:\/\//, "");
  if (
    cleaned.startsWith("PL") ||
    cleaned.startsWith("VLPL") ||
    cleaned.startsWith("RD") ||
    cleaned.startsWith("OLAK5uy_") ||
    cleaned.startsWith("MPREb_")
  ) {
    return { playlistId: cleaned };
  }
  if (cleaned.length === 11 && !cleaned.includes("/")) {
    return { videoId: cleaned };
  }

  return {};
}

export async function POST(req: NextRequest): Promise<NextResponse<ParseResponse>> {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Dữ liệu gửi lên không đúng định dạng JSON" },
        { status: 400 }
      );
    }

    const { url } = body || {};

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đường dẫn URL YouTube / YouTube Music hợp lệ" },
        { status: 400 }
      );
    }

    const { playlistId, videoId } = extractIds(url);

    if (!playlistId && !videoId) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy ID Playlist hoặc Video trong đường dẫn đã nhập. Hãy kiểm tra lại định dạng link." },
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
          { success: false, error: `Không thể lấy thông tin video: ${err.message || "Video không tồn tại hoặc bị chặn"}` },
          { status: 404 }
        );
      }
    }

    // 2. Xử lý Playlist / Album
    if (playlistId) {
      let rawItems: any[] = [];
      let playlistTitle = "YouTube Playlist";
      let playlistAuthor = "YouTube";
      let playlistThumb = "";

      // 2a. Thử lấy từ yt.music.getPlaylist trước (dành cho YouTube Music)
      try {
        const musicPl = (await yt.music.getPlaylist(playlistId)) as any;
        playlistTitle =
          musicPl.header?.title?.text ||
          musicPl.header?.title ||
          musicPl.info?.title ||
          playlistTitle;
        playlistAuthor =
          musicPl.header?.author?.name ||
          musicPl.header?.author ||
          musicPl.info?.author?.name ||
          playlistAuthor;
        playlistThumb = musicPl.header?.thumbnails?.[0]?.url || "";

        if (Array.isArray(musicPl.items) && musicPl.items.length > 0) {
          rawItems = musicPl.items;
        } else if (Array.isArray(musicPl.contents) && musicPl.contents.length > 0) {
          rawItems = musicPl.contents;
        }
      } catch (e: any) {
        console.warn("[yt.music.getPlaylist fallback]:", e?.message || e);
      }

      // 2b. Thử lấy từ yt.music.getAlbum (nếu là album hoặc yt.music.getPlaylist không lấy được)
      if (rawItems.length === 0) {
        try {
          const album = (await yt.music.getAlbum(playlistId)) as any;
          playlistTitle =
            album.header?.title?.text ||
            album.header?.title ||
            album.title ||
            playlistTitle;
          playlistAuthor =
            album.header?.author?.name ||
            album.header?.author ||
            album.author ||
            playlistAuthor;
          playlistThumb = album.header?.thumbnails?.[0]?.url || playlistThumb;

          if (Array.isArray(album.contents) && album.contents.length > 0) {
            rawItems = album.contents;
          } else if (Array.isArray(album.items) && album.items.length > 0) {
            rawItems = album.items;
          }
        } catch (e: any) {
          console.warn("[yt.music.getAlbum fallback]:", e?.message || e);
        }
      }

      // 2c. Fallback sang yt.getPlaylist nếu yt.music không có items
      if (rawItems.length === 0) {
        try {
          const mainPl = (await yt.getPlaylist(playlistId)) as any;
          playlistTitle = mainPl.info?.title || playlistTitle;
          playlistAuthor = mainPl.info?.author?.name || playlistAuthor;
          playlistThumb = mainPl.info?.thumbnails?.[0]?.url || playlistThumb;
          if (Array.isArray(mainPl.items) && mainPl.items.length > 0) {
            rawItems = mainPl.items;
          }
        } catch (e: any) {
          console.warn("[yt.getPlaylist fallback]:", e?.message || e);
        }
      }

      if (rawItems.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Không tìm thấy bài hát nào trong playlist hoặc playlist đang ở chế độ riêng tư (Private). Vui lòng đảm bảo Playlist ở chế độ Công khai (Public) hoặc Không công khai (Unlisted).",
          },
          { status: 404 }
        );
      }

      const tracks: OriginalTrack[] = rawItems
        .map((item: any) => {
          const id = item.id || item.video_id;
          if (!id) return null;

          const title = item.title?.text || item.title || "Untitled";
          const author =
            item.author?.name ||
            item.artists?.map((a: any) => a.name).join(", ") ||
            item.authors?.map((a: any) => a.name).join(", ") ||
            item.subtitle?.text ||
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
        })
        .filter(Boolean) as OriginalTrack[];

      if (tracks.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Không thể trích xuất danh sách bài hát từ playlist này.",
          },
          { status: 400 }
        );
      }

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
