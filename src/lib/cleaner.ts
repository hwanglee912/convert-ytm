/**
 * Làm sạch tiêu đề video YouTube / MV để lấy tên bài hát chuẩn và gợi ý nghệ sĩ
 */

export interface CleanResult {
  cleanTitle: string;
  artistHint?: string;
  searchQueries: string[];
}

export function parseDurationToSeconds(durationStr?: string): number | undefined {
  if (!durationStr) return undefined;
  const parts = durationStr.split(":").map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return undefined;

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return undefined;
}

export function formatSecondsToDuration(seconds?: number): string {
  if (seconds === undefined || isNaN(seconds)) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function cleanTrackTitle(rawTitle: string, rawAuthor?: string): CleanResult {
  let title = rawTitle;

  // 1. Loại bỏ các đoạn trong ngoặc vuông, tròn, nhọn chứa các từ khóa video/MV/audio/lyric/vietsub
  title = title.replace(
    /\s*[\(\[\{【](?:official\s*(?:music\s*)?video|official\s*mv|official\s*audio|official\s*hd|mv|m\/v|lyric\s*video|audio|lyrics|video\s*clip|teaser|trailer|4k|hd|live(?:\s*session)?|ost|tập\s*\d+|vietsub|karaoke|beat|nhạc\s*phim|visualizer|remix|acoustic|color\s*coded)[^\)\]\}】]*[\)\]\}】]/gi,
    ""
  );

  // 2. Loại bỏ các đoạn sau dấu gạch đứng `|` chứa thông tin MV / Kênh
  title = title.replace(
    /\s*\|\s*(?:official\s*(?:music\s*)?video|official\s*mv|mv|official\s*audio|m\/v|lyric\s*video|4k|hd|tập\s*\d+|nhạc\s*phim|ost).*/gi,
    ""
  );

  // 3. Xử lý định dạng "Nghệ sĩ - Tên bài hát" hoặc "Nghệ sĩ | Tên bài hát"
  let artistHint: string | undefined;

  if (title.includes(" - ")) {
    const parts = title.split(" - ");
    if (parts.length >= 2) {
      artistHint = parts[0].trim();
      title = parts.slice(1).join(" - ").trim();
    }
  } else if (title.includes(" | ")) {
    const parts = title.split(" | ");
    if (parts.length >= 2) {
      artistHint = parts[0].trim();
      title = parts[1].trim();
    }
  } else if (title.includes(" : ")) {
    const parts = title.split(" : ");
    if (parts.length >= 2) {
      artistHint = parts[0].trim();
      title = parts[1].trim();
    }
  }

  // 4. Loại bỏ các từ khóa MV / Official Video còn sót lại nếu không nằm trong ngoặc
  title = title.replace(
    /\b(?:OFFICIAL\s*(?:MUSIC\s*)?VIDEO|OFFICIAL\s*MV|OFFICIAL\s*AUDIO|OFFICIAL\s*HD|M\/V|LYRIC\s*VIDEO|MV\s*HD)\b/gi,
    ""
  );

  // 5. Loại bỏ tiền tố / hậu tố "prod. by", "ft.", "feat." trong tiêu đề bài nếu có
  title = title.replace(/\s*\((?:ft\.|feat\.|prod\.\s*by)[^\)]*\)/gi, "");
  title = title.replace(/\s*\[(?:ft\.|feat\.|prod\.\s*by)[^\]]*\]/gi, "");

  // 6. Xóa các khoảng trắng thừa
  title = title.replace(/\s+/g, " ").trim();

  // Làm sạch artistHint nếu có
  if (artistHint) {
    artistHint = artistHint
      .replace(/\b(?:VEVO|Official|Channel|Entertainment|Music|Records|Media)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Tạo danh sách các câu truy vấn tìm kiếm tối ưu
  const queries: string[] = [];

  // Query 1: Kết hợp Nghệ sĩ trích xuất + Tên bài hát sạch
  if (artistHint && artistHint.length > 1) {
    queries.push(`${artistHint} ${title}`);
  }

  // Query 2: Tác giả từ channel YouTube + Tên bài hát sạch
  if (rawAuthor && rawAuthor.length > 1) {
    const cleanAuthor = rawAuthor
      .replace(/ - Topic$/i, "")
      .replace(/\b(?:Official|Channel|VEVO|Entertainment)\b/gi, "")
      .trim();
    if (cleanAuthor && cleanAuthor !== artistHint) {
      queries.push(`${cleanAuthor} ${title}`);
    }
  }

  // Query 3: Chỉ Tên bài hát sạch
  if (!queries.includes(title)) {
    queries.push(title);
  }

  // Query 4: Tiêu đề gốc đã xóa ngoặc
  const fallback = rawTitle.replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, "").trim();
  if (fallback && !queries.includes(fallback)) {
    queries.push(fallback);
  }

  return {
    cleanTitle: title || rawTitle,
    artistHint: artistHint || rawAuthor,
    searchQueries: queries,
  };
}
