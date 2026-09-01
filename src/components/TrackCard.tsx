"use client";

import React from "react";
import { CandidateTrack, MatchedTrack } from "@/lib/types";
import {
  ArrowRight,
  CheckCircle2,
  Disc,
  ExternalLink,
  HelpCircle,
  ListMusic,
  Play,
  RotateCw,
  Video,
} from "lucide-react";

interface TrackCardProps {
  index: number;
  item: MatchedTrack;
  onOpenCandidates: (item: MatchedTrack) => void;
  onPlayPreview: (videoId: string, title: string) => void;
}

export function TrackCard({
  index,
  item,
  onOpenCandidates,
  onPlayPreview,
}: TrackCardProps) {
  const { original, matched, status, confidence, candidates } = item;

  // Tính độ chênh lệch thời gian nếu có
  let timeDiffText = "";
  if (original.durationSeconds && matched?.durationSeconds) {
    const diff = original.durationSeconds - matched.durationSeconds;
    if (diff > 5) {
      timeDiffText = `-${diff}s (Bỏ tạp âm/intro MV)`;
    } else if (diff < -5) {
      timeDiffText = `+${Math.abs(diff)}s`;
    } else {
      timeDiffText = "Trùng thời lượng";
    }
  }

  const isMatched = status === "matched" || status === "custom_selected";

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 transition-all duration-200 border border-neutral-800/80 shadow-lg">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        {/* Index number */}
        <div className="hidden sm:flex items-center justify-center w-8 text-neutral-500 font-bold text-sm">
          #{index + 1}
        </div>

        {/* --- CỘT TRÁI: BẢN GỐC (ẢNH 1 - TEST 1) --- */}
        <div className="flex-1 bg-[#121212] rounded-xl p-3 border border-neutral-800/90 flex items-center gap-3 min-w-0">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0 group">
            <img
              src={original.thumbnailUrl || `https://i.ytimg.com/vi/${original.id}/hqdefault.jpg`}
              alt={original.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => onPlayPreview(original.id, original.title)}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
              title="Nghe thử bản MV gốc"
            >
              <Play className="w-5 h-5 text-white fill-white" />
            </button>
            <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-neutral-300 px-1 rounded">
              {original.duration || "--:--"}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="bg-red-950/60 text-red-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-red-800/50 flex items-center gap-1">
                <Video className="w-2.5 h-2.5" />
                Bản MV / Video gốc
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white truncate mt-1" title={original.title}>
              {original.title}
            </h4>
            <p className="text-xs text-neutral-400 truncate mt-0.5">{original.author}</p>
          </div>
        </div>

        {/* --- CỘT GIỮA: MŨI TÊN CHUYỂN ĐỔI --- */}
        <div className="flex lg:flex-col items-center justify-center gap-1 text-neutral-500 py-1 lg:py-0">
          <div className="hidden lg:block w-px h-2 bg-neutral-800"></div>
          <div className="flex items-center gap-1.5 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800 text-[11px]">
            <ArrowRight className="w-3.5 h-3.5 text-red-500" />
            {timeDiffText && (
              <span className="text-emerald-400 font-medium">{timeDiffText}</span>
            )}
          </div>
          <div className="hidden lg:block w-px h-2 bg-neutral-800"></div>
        </div>

        {/* --- CỘT PHẢI: BẢN ALBUM/SONG MỚI (ẢNH 2 - TEST 2) --- */}
        <div
          className={`flex-1 rounded-xl p-3 border flex items-center gap-3 min-w-0 transition-all ${
            isMatched
              ? "bg-[#141d17]/80 border-emerald-900/60 shadow-sm"
              : "bg-[#211b14]/80 border-amber-900/60"
          }`}
        >
          {matched ? (
            <>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0 group">
                <img
                  src={matched.thumbnailUrl}
                  alt={matched.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => onPlayPreview(matched.id, matched.title)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                  title="Nghe thử bản Album"
                >
                  <Play className="w-5 h-5 text-white fill-white" />
                </button>
                <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-neutral-300 px-1 rounded">
                  {matched.duration || "--:--"}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-950/70 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-800/60 flex items-center gap-1">
                    <Disc className="w-2.5 h-2.5" />
                    Bản Album / Song chuẩn
                  </span>
                  {confidence === "exact" && (
                    <span className="text-emerald-500 text-[10px] font-medium flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      100% Khớp
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-white truncate mt-1" title={matched.title}>
                  {matched.title}
                </h4>
                <p className="text-xs text-neutral-300 truncate mt-0.5">
                  <span className="text-neutral-200">{matched.artists}</span>
                  {matched.album && (
                    <span className="text-neutral-400"> • {matched.album}</span>
                  )}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 min-w-0 flex-1 py-2">
              <div className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-amber-400">
                  Chưa tìm thấy bản Album chính xác
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Đang giữ nguyên bản MV gốc. Bạn có thể bấm &quot;Đổi bản khác&quot; để tìm thủ công.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* --- NÚT HÀNH ĐỘNG CHO TỪNG BÀI --- */}
        <div className="flex items-center justify-end gap-2 pt-2 lg:pt-0 border-t border-neutral-800 lg:border-t-0">
          <button
            type="button"
            onClick={() => onOpenCandidates(item)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition border border-neutral-700/80"
            title="Xem các bản thay thế khác"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Đổi bản khác</span>
            {candidates.length > 1 && (
              <span className="bg-neutral-700 text-[10px] px-1.5 py-0.2 rounded-full text-neutral-300">
                {candidates.length}
              </span>
            )}
          </button>

          {matched && (
            <a
              href={matched.musicUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition border border-neutral-700/80"
              title="Mở bài này trên YouTube Music"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
