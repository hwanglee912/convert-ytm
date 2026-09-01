"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { UrlInputForm } from "@/components/UrlInputForm";
import { StatsBanner } from "@/components/StatsBanner";
import { ComparisonView } from "@/components/ComparisonView";
import { ExportToolbar } from "@/components/ExportToolbar";
import { CreatePlaylistModal } from "@/components/CreatePlaylistModal";
import { AudioPreviewPlayer } from "@/components/AudioPreviewPlayer";
import {
  CandidateTrack,
  MatchedTrack,
  OriginalTrack,
  ParseResponse,
  PlaylistMetadata,
} from "@/lib/types";
import {
  AlertCircle,
  ArrowRight,
  Disc,
  ListMusic,
  Loader2,
  RefreshCw,
  Sparkles,
  Video,
} from "lucide-react";

export default function Home() {
  const [stage, setStage] = useState<"idle" | "parsing" | "matching" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<PlaylistMetadata | null>(null);
  const [matchedTracks, setMatchedTracks] = useState<MatchedTrack[]>([]);
  const [progress, setProgress] = useState<{ current: number; total: number; currentTitle?: string }>({
    current: 0,
    total: 0,
  });

  // State audio player & modal
  const [previewVideo, setPreviewVideo] = useState<{ id: string; title: string } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Xử lý khi người dùng nhập link
  const handleProcessUrl = async (url: string) => {
    setStage("parsing");
    setErrorMessage(null);
    setMatchedTracks([]);
    setProgress({ current: 0, total: 0 });

    try {
      // 1. Phân tích URL để lấy danh sách bài hát
      const parseRes = await fetch("/api/ytm/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const parseData: ParseResponse = await parseRes.json();

      if (!parseRes.ok || !parseData.success || !parseData.tracks || parseData.tracks.length === 0) {
        throw new Error(parseData.error || "Không tìm thấy danh sách bài hát trong URL này");
      }

      setMetadata(parseData.metadata || null);
      const rawTracks = parseData.tracks;
      const total = rawTracks.length;

      setStage("matching");
      setProgress({ current: 0, total });

      // 2. Chia lô (Batching chunks of 4 tracks) để gửi về serverless
      const BATCH_SIZE = 4;
      const allMatched: MatchedTrack[] = [];

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const chunk = rawTracks.slice(i, i + BATCH_SIZE);
        setProgress({
          current: i,
          total,
          currentTitle: chunk[0]?.title,
        });

        try {
          const matchRes = await fetch("/api/ytm/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tracks: chunk }),
          });

          const matchData = await matchRes.json();

          if (matchData.success && matchData.results) {
            allMatched.push(...matchData.results);
            setMatchedTracks([...allMatched]);
          } else {
            // Fallback for this chunk
            const fallbacks: MatchedTrack[] = chunk.map((t) => ({
              original: t,
              matched: null,
              status: "fallback_original",
              confidence: "none",
              candidates: [],
            }));
            allMatched.push(...fallbacks);
            setMatchedTracks([...allMatched]);
          }
        } catch (chunkErr) {
          console.warn("[Chunk Match Error]:", chunkErr);
          const fallbacks: MatchedTrack[] = chunk.map((t) => ({
            original: t,
            matched: null,
            status: "fallback_original",
            confidence: "none",
            candidates: [],
          }));
          allMatched.push(...fallbacks);
          setMatchedTracks([...allMatched]);
        }

        setProgress({ current: Math.min(total, i + BATCH_SIZE), total });
      }

      setStage("done");
    } catch (err: any) {
      console.error("[Process Error]:", err);
      setErrorMessage(err.message || "Đã xảy ra lỗi khi xử lý bài hát");
      setStage("error");
    }
  };

  // Mẫu test từ Ảnh 1 của người dùng
  const handleUseSampleFromScreenshot = () => {
    const sampleTracks: OriginalTrack[] = [
      {
        id: "sample-1",
        title: "Ngày Rời Chuyến Bay",
        author: "Minh Huy và Pinny",
        duration: "4:35",
        durationSeconds: 275,
        thumbnailUrl: "https://i.ytimg.com/vi/kBz22YS1eeQ/hqdefault.jpg",
        originalUrl: "https://music.youtube.com/watch?v=kBz22YS1eeQ",
      },
      {
        id: "sample-2",
        title: "PHƯƠNG MỸ CHI x DTAP | THIÊN ĐƯỜNG VỚI NGƯỜI THƯƠNG | OFFICIAL MUSIC VI...",
        author: "Phương Mỹ Chi",
        duration: "4:07",
        durationSeconds: 247,
        thumbnailUrl: "https://i.ytimg.com/vi/xMDdXoa9x90/hqdefault.jpg",
        originalUrl: "https://music.youtube.com/watch?v=xMDdXoa9x90",
      },
      {
        id: "sample-3",
        title: "Love Story (Official Music Video)",
        author: "Indila",
        duration: "4:45",
        durationSeconds: 285,
        thumbnailUrl: "https://i.ytimg.com/vi/4TIGwaBHuzg/hqdefault.jpg",
        originalUrl: "https://music.youtube.com/watch?v=4TIGwaBHuzg",
      },
    ];

    setStage("matching");
    setErrorMessage(null);
    setMetadata({
      id: "test-1",
      title: "test 1 (Playlist từ Ảnh 1)",
      author: "Hoang Le",
      itemCount: 3,
      isSingleTrack: false,
    });
    setProgress({ current: 0, total: 3 });

    // Gọi API match cho bộ 3 bài này
    fetch("/api/ytm/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tracks: sampleTracks }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.results) {
          setMatchedTracks(data.results);
          setProgress({ current: 3, total: 3 });
          setStage("done");
        } else {
          throw new Error("Không thể xử lý bài mẫu");
        }
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setStage("error");
      });
  };

  // Cập nhật khi người dùng chọn thủ công 1 bản album khác
  const handleUpdateTrack = (index: number, newCandidate: CandidateTrack) => {
    setMatchedTracks((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = {
          ...next[index],
          matched: newCandidate,
          status: "custom_selected",
          confidence: "high",
        };
      }
      return next;
    });
  };

  const percent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#030303]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* --- HERO BANNER --- */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-2 sm:pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tối ưu cho Playlist YouTube Music</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Chuyển Đổi MV Sang{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">
              Bản Album Phòng Thu
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Tự động tìm kiếm, làm sạch tiêu đề và chuyển đổi toàn bộ bài hát từ bản Music Video (dính kịch bản, intro/outro, tạp âm) sang bản phát hành Audio chính thức (Album / Single) với âm thanh chuẩn 256kbps.
          </p>
        </div>

        {/* --- INPUT FORM --- */}
        <UrlInputForm
          onSubmit={handleProcessUrl}
          onUseSampleTracks={handleUseSampleFromScreenshot}
          isLoading={stage === "parsing" || stage === "matching"}
        />

        {/* --- PROGRESS BAR KHI ĐANG XỬ LÝ --- */}
        {(stage === "parsing" || stage === "matching") && (
          <div className="glass-panel max-w-2xl mx-auto rounded-2xl p-6 border border-neutral-800 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {stage === "parsing"
                      ? "Đang phân tích liên kết YouTube..."
                      : `Đang đối soát bản Album (${progress.current}/${progress.total})`}
                  </h4>
                  <p className="text-xs text-neutral-400 truncate max-w-md mt-0.5">
                    {progress.currentTitle
                      ? `Đang tìm: "${progress.currentTitle}"`
                      : "Trích xuất metadata và tìm kiếm bản Song chính thức..."}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-red-400 font-mono">
                {percent}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300 rounded-full"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* --- ERROR MESSAGE --- */}
        {stage === "error" && errorMessage && (
          <div className="max-w-2xl mx-auto p-4 bg-red-950/40 border border-red-800/60 rounded-2xl text-red-300 text-sm flex items-start gap-3 shadow-xl">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-white">Không thể hoàn tất chuyển đổi</div>
              <p className="text-xs text-red-300/90">{errorMessage}</p>
              <button
                onClick={() => setStage("idle")}
                className="mt-2 text-xs font-medium text-red-400 hover:text-white underline"
              >
                Thử lại với đường dẫn khác
              </button>
            </div>
          </div>
        )}

        {/* --- KẾT QUẢ SO SÁNH (COMPLETED RESULTS) --- */}
        {matchedTracks.length > 0 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Metadata Header */}
            {metadata && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 overflow-hidden border border-neutral-800 flex-shrink-0">
                    {metadata.thumbnailUrl ? (
                      <img
                        src={metadata.thumbnailUrl}
                        alt={metadata.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600">
                        <ListMusic className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {metadata.title}
                    </h2>
                    <p className="text-xs text-neutral-400">
                      {metadata.author} • {matchedTracks.length} bài hát
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleProcessUrl(metadata.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition border border-neutral-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Làm mới đối soát</span>
                </button>
              </div>
            )}

            {/* Stats Overview */}
            <StatsBanner tracks={matchedTracks} />

            {/* Export Toolbar Top */}
            <ExportToolbar
              tracks={matchedTracks}
              playlistTitle={metadata?.title}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />

            {/* Comparison Table / Cards */}
            <ComparisonView
              tracks={matchedTracks}
              onUpdateTrack={handleUpdateTrack}
              onPlayPreview={(id, title) => setPreviewVideo({ id, title })}
            />

            {/* Export Toolbar Bottom */}
            <ExportToolbar
              tracks={matchedTracks}
              playlistTitle={metadata?.title}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* --- FLOATING AUDIO PREVIEW PLAYER --- */}
      {previewVideo && (
        <AudioPreviewPlayer
          videoId={previewVideo.id}
          title={previewVideo.title}
          onClose={() => setPreviewVideo(null)}
        />
      )}

      {/* --- CREATE PLAYLIST MODAL --- */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultTitle={`${metadata?.title || "Playlist"} (Bản Album)`}
        videoIds={matchedTracks
          .map((t) => (t.matched ? t.matched.id : t.original.id))
          .filter(Boolean)}
      />

      {/* --- FOOTER --- */}
      <footer className="border-t border-neutral-800/80 bg-[#070707] py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            YTM MV to Album Converter &copy; 2026. Tương thích Vercel Free & YouTube Music API.
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Không lưu trữ cookie</span>
            <span>•</span>
            <span>InnerTube Engine</span>
            <span>•</span>
            <span>Next.js 14 App Router</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
