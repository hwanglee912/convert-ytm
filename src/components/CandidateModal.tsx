"use client";

import React from "react";
import { CandidateTrack, MatchedTrack } from "@/lib/types";
import { Check, Disc, ExternalLink, Play, X } from "lucide-react";

interface CandidateModalProps {
  trackItem: MatchedTrack | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidate: (candidate: CandidateTrack) => void;
  onPlayPreview: (videoId: string, title: string) => void;
}

export function CandidateModal({
  trackItem,
  isOpen,
  onClose,
  onSelectCandidate,
  onPlayPreview,
}: CandidateModalProps) {
  if (!isOpen || !trackItem) return null;

  const { original, matched, candidates } = trackItem;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#141414] rounded-2xl border border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Disc className="w-5 h-5 text-red-500" />
              Chọn bản Album / Song thay thế
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
              Bài gốc: <span className="text-neutral-200">{original.title}</span> ({original.author})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {candidates.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-sm">
              Không tìm thấy thêm bản Album nào khác cho bài này trên YouTube Music.
            </div>
          ) : (
            candidates.map((cand) => {
              const isCurrent = matched?.id === cand.id;

              return (
                <div
                  key={cand.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? "bg-red-950/20 border-red-500/50 ring-1 ring-red-500/30"
                      : "bg-[#1c1c1c] border-neutral-800 hover:border-neutral-700 hover:bg-[#222]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0 group">
                      <img
                        src={cand.thumbnailUrl}
                        alt={cand.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => onPlayPreview(cand.id, cand.title)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                        title="Nghe thử"
                      >
                        <Play className="w-5 h-5 text-white fill-white" />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white truncate">
                          {cand.title}
                        </span>
                        {isCurrent && (
                          <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded font-medium border border-red-500/30">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {cand.artists} {cand.album ? `• ${cand.album}` : ""}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500">
                        <span>Thời lượng: {cand.duration || "--:--"}</span>
                        <span>•</span>
                        <span className="text-emerald-400">
                          {cand.matchReason || "Bản Song chính thức"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onPlayPreview(cand.id, cand.title)}
                      className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                      title="Nghe thử"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>

                    <a
                      href={cand.musicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                      title="Mở link trên YouTube Music"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => {
                        onSelectCandidate(cand);
                        onClose();
                      }}
                      disabled={isCurrent}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                        isCurrent
                          ? "bg-neutral-800 text-neutral-500 cursor-default"
                          : "bg-red-600 hover:bg-red-500 text-white shadow"
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã chọn</span>
                        </>
                      ) : (
                        <span>Chọn bản này</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
