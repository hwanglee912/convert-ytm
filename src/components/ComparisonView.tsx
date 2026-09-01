"use client";

import React, { useState } from "react";
import { CandidateTrack, MatchedTrack } from "@/lib/types";
import { TrackCard } from "./TrackCard";
import { CandidateModal } from "./CandidateModal";
import { Disc, Filter, ListMusic, Search } from "lucide-react";

interface ComparisonViewProps {
  tracks: MatchedTrack[];
  onUpdateTrack: (index: number, newCandidate: CandidateTrack) => void;
  onPlayPreview: (videoId: string, title: string) => void;
}

export function ComparisonView({
  tracks,
  onUpdateTrack,
  onPlayPreview,
}: ComparisonViewProps) {
  const [filterType, setFilterType] = useState<"all" | "matched" | "unmatched">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrackForModal, setSelectedTrackForModal] = useState<{
    item: MatchedTrack;
    index: number;
  } | null>(null);

  const filteredTracksWithIndices = tracks
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      // Filter status
      const isMatched = item.status === "matched" || item.status === "custom_selected";
      if (filterType === "matched" && !isMatched) return false;
      if (filterType === "unmatched" && isMatched) return false;

      // Filter search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const origTitle = item.original.title.toLowerCase();
        const origAuthor = item.original.author.toLowerCase();
        const matchTitle = item.matched?.title.toLowerCase() || "";
        const matchArtist = item.matched?.artists.toLowerCase() || "";

        return (
          origTitle.includes(query) ||
          origAuthor.includes(query) ||
          matchTitle.includes(query) ||
          matchArtist.includes(query)
        );
      }

      return true;
    });

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111111] p-3 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              filterType === "all"
                ? "bg-neutral-700 text-white"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Tất cả ({tracks.length})</span>
          </button>

          <button
            onClick={() => setFilterType("matched")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              filterType === "matched"
                ? "bg-emerald-950 text-emerald-400 border border-emerald-800/80 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <Disc className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Đã khớp Album (
              {
                tracks.filter(
                  (t) => t.status === "matched" || t.status === "custom_selected"
                ).length
              }
              )
            </span>
          </button>

          <button
            onClick={() => setFilterType("unmatched")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              filterType === "unmatched"
                ? "bg-amber-950 text-amber-400 border border-amber-800/80 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <span>
              Cần kiểm tra (
              {
                tracks.filter(
                  (t) => t.status !== "matched" && t.status !== "custom_selected"
                ).length
              }
              )
            </span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên bài hát hoặc nghệ sĩ..."
            className="w-full sm:w-60 bg-[#1a1a1a] border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </div>
      </div>

      {/* Track List */}
      <div className="space-y-3">
        {filteredTracksWithIndices.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl border border-neutral-800 text-neutral-400 text-sm">
            Không tìm thấy bài hát nào phù hợp với bộ lọc.
          </div>
        ) : (
          filteredTracksWithIndices.map(({ item, index }) => (
            <TrackCard
              key={`${item.original.id}-${index}`}
              index={index}
              item={item}
              onOpenCandidates={() =>
                setSelectedTrackForModal({ item, index })
              }
              onPlayPreview={onPlayPreview}
            />
          ))
        )}
      </div>

      {/* Candidate Modal */}
      {selectedTrackForModal && (
        <CandidateModal
          trackItem={selectedTrackForModal.item}
          isOpen={true}
          onClose={() => setSelectedTrackForModal(null)}
          onSelectCandidate={(cand) => {
            onUpdateTrack(selectedTrackForModal.index, cand);
          }}
          onPlayPreview={onPlayPreview}
        />
      )}
    </div>
  );
}
