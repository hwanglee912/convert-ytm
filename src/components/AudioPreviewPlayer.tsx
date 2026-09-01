"use client";

import React, { useState } from "react";
import { Disc, Music, Pause, Play, Volume2, X } from "lucide-react";

interface AudioPreviewPlayerProps {
  videoId: string | null;
  title: string | null;
  onClose: () => void;
}

export function AudioPreviewPlayer({
  videoId,
  title,
  onClose,
}: AudioPreviewPlayerProps) {
  if (!videoId) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm bg-[#181818]/95 backdrop-blur-md rounded-2xl p-4 border border-neutral-700 shadow-2xl shadow-black/80 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center flex-shrink-0 animate-spin-slow">
            <Disc className="w-5 h-5 animate-spin" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Đang nghe thử</span>
            </div>
            <p className="text-xs font-semibold text-white truncate mt-0.5" title={title || ""}>
              {title || "YouTube Track"}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          title="Tắt nghe thử"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Embedded Iframe Player (hidden or compact) */}
      <div className="mt-3 rounded-lg overflow-hidden border border-neutral-800 bg-black aspect-video max-h-36">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`}
          title={title || "YouTube Player"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    </div>
  );
}
