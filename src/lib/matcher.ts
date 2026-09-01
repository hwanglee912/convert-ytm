import { Innertube } from "youtubei.js";
import { CandidateTrack, MatchedTrack, OriginalTrack } from "./types";
import { cleanTrackTitle, parseDurationToSeconds } from "./cleaner";

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  if (s1.includes(s2) || s2.includes(s1)) {
    return Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
  }

  const words1 = s1.split(" ").filter((w) => w.length > 1);
  const words2 = new Set(s2.split(" ").filter((w) => w.length > 1));

  if (words1.length === 0 || words2.size === 0) return 0.0;

  let intersection = 0;
  words1.forEach((w) => {
    if (words2.has(w)) intersection++;
  });

  const totalUnique = new Set([...words1, ...Array.from(words2)]).size;
  return intersection / (totalUnique || 1);
}

export function scoreCandidate(
  original: OriginalTrack,
  candidate: {
    id: string;
    title: string;
    artists?: Array<{ name: string }>;
    album?: { name: string };
    duration?: { text?: string; seconds?: number };
  },
  cleanTitleStr: string,
  artistHintStr?: string
): CandidateTrack {
  let score = 0;
  const reasons: string[] = [];

  const candidateArtists = candidate.artists?.map((a) => a.name).join(", ") || "";
  const candidateDurationStr = candidate.duration?.text || "";
  const candidateDurationSec =
    candidate.duration?.seconds ?? parseDurationToSeconds(candidateDurationStr);
  const originalDurationSec =
    original.durationSeconds ?? parseDurationToSeconds(original.duration);

  // 1. So khớp tiêu đề (Max 40 điểm)
  const titleSim = calculateStringSimilarity(cleanTitleStr, candidate.title);
  const titleScore = Math.round(titleSim * 40);
  score += titleScore;
  if (titleSim > 0.8) reasons.push("Tên bài hát khớp chính xác");

  // 2. So khớp nghệ sĩ (Max 30 điểm)
  let artistSim = 0;
  if (artistHintStr) {
    artistSim = Math.max(
      artistSim,
      calculateStringSimilarity(artistHintStr, candidateArtists)
    );
  }
  if (original.author) {
    artistSim = Math.max(
      artistSim,
      calculateStringSimilarity(original.author.replace(/ - Topic$/i, ""), candidateArtists)
    );
  }
  const artistScore = Math.round(artistSim * 30);
  score += artistScore;
  if (artistSim > 0.6) reasons.push("Nghệ sĩ khớp");

  // 3. So khớp thời lượng (Max 20 điểm)
  if (originalDurationSec && candidateDurationSec) {
    const diff = Math.abs(originalDurationSec - candidateDurationSec);
    // MV thường dài hơn audio studio từ 5s đến 50s (do intro/outro)
    const isMvLonger = originalDurationSec >= candidateDurationSec;

    if (diff <= 5) {
      score += 20;
      reasons.push("Thời lượng trùng khớp hoàn toàn");
    } else if (isMvLonger && diff <= 60) {
      score += 18;
      reasons.push("Thời lượng chuẩn audio (ngắn hơn MV)");
    } else if (diff <= 30) {
      score += 15;
    } else if (diff <= 90) {
      score += 10;
    } else {
      score -= 5;
    }
  } else {
    score += 10;
  }

  // 4. Ưu tiên có thông tin Album / Single chính thức (Max 10 điểm)
  if (candidate.album?.name && candidate.album.name.trim().length > 0) {
    score += 10;
    reasons.push(`Thuộc Album: ${candidate.album.name}`);
  }

  return {
    id: candidate.id,
    title: candidate.title,
    artists: candidateArtists,
    album: candidate.album?.name || "Single",
    duration: candidateDurationStr,
    durationSeconds: candidateDurationSec,
    thumbnailUrl: `https://i.ytimg.com/vi/${candidate.id}/hqdefault.jpg`,
    musicUrl: `https://music.youtube.com/watch?v=${candidate.id}`,
    score,
    matchReason: reasons.join(" • ") || "Tìm thấy trên YouTube Music",
  };
}

export async function matchSingleTrack(
  yt: Innertube,
  original: OriginalTrack
): Promise<MatchedTrack> {
  const { cleanTitle: cleaned, artistHint, searchQueries } = cleanTrackTitle(
    original.title,
    original.author
  );

  const candidateMap = new Map<string, CandidateTrack>();

  // Thử các câu query tìm kiếm
  for (const query of searchQueries) {
    try {
      const searchRes = await yt.music.search(query, { type: "song" });
      if (searchRes.songs && searchRes.songs.contents) {
        for (const item of searchRes.songs.contents) {
          const rawItem = item as any;
          if (rawItem.id && !candidateMap.has(rawItem.id)) {
            const candidate = scoreCandidate(
              original,
              rawItem,
              cleaned,
              artistHint
            );
            candidateMap.set(rawItem.id, candidate);
          }
        }
      }
    } catch (err) {
      console.warn(`[Search Error for "${query}"]:`, err);
    }

    // Nếu đã tìm thấy ứng viên có điểm rất cao (>= 80), dừng sớm để tiết kiệm tài nguyên
    const currentCandidates = Array.from(candidateMap.values());
    if (currentCandidates.some((c) => c.score >= 80)) {
      break;
    }
  }

  const sortedCandidates = Array.from(candidateMap.values()).sort(
    (a, b) => b.score - a.score
  );

  if (sortedCandidates.length === 0) {
    return {
      original,
      matched: null,
      status: "fallback_original",
      confidence: "none",
      candidates: [],
    };
  }

  const bestCandidate = sortedCandidates[0];
  let confidence: MatchedTrack["confidence"] = "low";
  let status: MatchedTrack["status"] = "matched";

  if (bestCandidate.score >= 80) {
    confidence = "exact";
  } else if (bestCandidate.score >= 60) {
    confidence = "high";
  } else if (bestCandidate.score >= 40) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  return {
    original,
    matched: bestCandidate,
    status,
    confidence,
    candidates: sortedCandidates.slice(0, 5), // Giữ tối đa 5 ứng viên tốt nhất để người dùng chọn
  };
}
