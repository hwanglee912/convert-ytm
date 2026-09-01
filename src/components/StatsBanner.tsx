"use client";

import React from "react";
import { MatchedTrack } from "@/lib/types";
import { formatSecondsToDuration } from "@/lib/cleaner";
import { Clock, Disc, Sparkles, TrendingDown, Volume2 } from "lucide-react";

interface StatsBannerProps {
  tracks: MatchedTrack[];
}

export function StatsBanner({ tracks }: StatsBannerProps) {
  if (tracks.length === 0) return null;

  // Tính tổng thời lượng bản gốc
  const totalOriginalSec = tracks.reduce(
    (acc, t) => acc + (t.original.durationSeconds || 0),
    0
  );

  // Tính tổng thời lượng bản mới
  const totalNewSec = tracks.reduce((acc, t) => {
    const sec = t.matched?.durationSeconds || t.original.durationSeconds || 0;
    return acc + sec;
  }, 0);

  const matchedCount = tracks.filter(
    (t) => t.status === "matched" || t.status === "custom_selected"
  ).length;
  const matchRate = Math.round((matchedCount / tracks.length) * 100);

  const savedSeconds = Math.max(0, totalOriginalSec - totalNewSec);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* 1. Tỷ lệ khớp Album */}
      <div className="bg-[#121212] rounded-2xl p-4 border border-neutral-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center flex-shrink-0">
          <Disc className="w-5 h-5" />
        </div>
        <div>
          <div className="text-lg font-bold text-white">
            {matchedCount} / {tracks.length}
          </div>
          <p className="text-xs text-neutral-400">
            Khớp bản Album ({matchRate}%)
          </p>
        </div>
      </div>

      {/* 2. Tiết kiệm thời lượng tạp âm */}
      <div className="bg-[#121212] rounded-2xl p-4 border border-neutral-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400 flex items-center justify-center flex-shrink-0">
          <TrendingDown className="w-5 h-5" />
        </div>
        <div>
          <div className="text-lg font-bold text-white">
            {savedSeconds > 0 ? `-${formatSecondsToDuration(savedSeconds)}` : "Chuẩn"}
          </div>
          <p className="text-xs text-neutral-400">Lược bỏ intro/outro MV</p>
        </div>
      </div>

      {/* 3. Tổng thời lượng mới */}
      <div className="bg-[#121212] rounded-2xl p-4 border border-neutral-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-400 flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-lg font-bold text-white">
            {formatSecondsToDuration(totalNewSec)}
          </div>
          <p className="text-xs text-neutral-400">
            Gốc: {formatSecondsToDuration(totalOriginalSec)}
          </p>
        </div>
      </div>

      {/* 4. Chất lượng âm thanh */}
      <div className="bg-[#121212] rounded-2xl p-4 border border-neutral-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-400 flex items-center justify-center flex-shrink-0">
          <Volume2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-lg font-bold text-white">256kbps AAC</div>
          <p className="text-xs text-neutral-400">Chuẩn YouTube Music Audio</p>
        </div>
      </div>
    </div>
  );
}
