"use client";

import React, { useState } from "react";
import { MatchedTrack } from "@/lib/types";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  ListPlus,
  Loader2,
  Music2,
  Share2,
  Sparkles,
  Youtube,
} from "lucide-react";

interface ExportToolbarProps {
  tracks: MatchedTrack[];
  playlistTitle?: string;
  onOpenCreateModal: () => void;
}

export function ExportToolbar({
  tracks,
  playlistTitle = "Converted Playlist",
  onOpenCreateModal,
}: ExportToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [isOpeningYtm, setIsOpeningYtm] = useState(false);

  const getTargetVideoIds = () => {
    return tracks
      .map((t) => (t.matched ? t.matched.id : t.original.id))
      .filter(Boolean);
  };

  const getTargetUrls = () => {
    return tracks.map((t) =>
      t.matched
        ? t.matched.musicUrl
        : `https://music.youtube.com/watch?v=${t.original.id}`
    );
  };

  const handleCopyAllLinks = () => {
    const urls = getTargetUrls();
    navigator.clipboard.writeText(urls.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenDirectOnYTM = async () => {
    const videoIds = getTargetVideoIds();
    if (videoIds.length === 0) return;

    setIsOpeningYtm(true);
    try {
      const res = await fetch("/api/ytm/get-music-playlist-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoIds }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success && data.musicUrl) {
          window.open(data.musicUrl, "_blank");
          return;
        }
      }
      // Fallback
      window.open(`https://music.youtube.com/watch_videos?video_ids=${videoIds.join(",")}`, "_blank");
    } catch {
      window.open(`https://music.youtube.com/watch_videos?video_ids=${videoIds.join(",")}`, "_blank");
    } finally {
      setIsOpeningYtm(false);
    }
  };

  const handleExportM3U = () => {
    let content = "#EXTM3U\n";
    tracks.forEach((t) => {
      const active = t.matched || t.original;
      const title = active.title;
      const artist = (active as any).artists || (active as any).author || "Unknown";
      const sec = (active as any).durationSeconds || -1;
      const url = t.matched
        ? t.matched.musicUrl
        : `https://music.youtube.com/watch?v=${t.original.id}`;

      content += `#EXTINF:${sec},${artist} - ${title}\n${url}\n`;
    });

    const blob = new Blob([content], { type: "audio/x-mpegurl;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${playlistTitle.replace(/[^a-z0-9]/gi, "_")}_album_version.m3u`;
    link.click();
  };

  const handleExportCSV = () => {
    let csv = "Index,Title,Artist,Album,Duration,URL\n";
    tracks.forEach((t, i) => {
      const active = t.matched || t.original;
      const title = `"${active.title.replace(/"/g, '""')}"`;
      const artist = `"${((active as any).artists || (active as any).author || "").replace(/"/g, '""')}"`;
      const album = `"${((active as any).album || "").replace(/"/g, '""')}"`;
      const duration = active.duration || "";
      const url = t.matched
        ? t.matched.musicUrl
        : `https://music.youtube.com/watch?v=${t.original.id}`;

      csv += `${i + 1},${title},${artist},${album},${duration},${url}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${playlistTitle.replace(/[^a-z0-9]/gi, "_")}_album_tracks.csv`;
    link.click();
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 flex-shrink-0">
          <Music2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white">
            Xuất kết quả ({tracks.length} bài hát bản Album)
          </h3>
          <p className="text-xs text-neutral-400">
            Mở nghe trực tiếp trên YouTube Music hoặc lưu vào tài khoản
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Nút Mở trực tiếp trên YouTube Music */}
        <button
          type="button"
          onClick={handleOpenDirectOnYTM}
          disabled={isOpeningYtm}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg glow-red transition active:scale-95 disabled:opacity-75"
          title="Mở toàn bộ danh sách phát trên YouTube Music"
        >
          {isOpeningYtm ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang mở YouTube Music...</span>
            </>
          ) : (
            <>
              <Music2 className="w-4 h-4 fill-current text-white" />
              <span>Mở toàn bộ trên YouTube Music</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {/* Nút Copy tất cả link */}
        <button
          type="button"
          onClick={handleCopyAllLinks}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
            copied
              ? "bg-emerald-600 text-white shadow-lg glow-green"
              : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Đã copy {tracks.length} link!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Sao chép tất cả link</span>
            </>
          )}
        </button>

        {/* Nút Tạo Playlist Modal */}
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition"
        >
          <ListPlus className="w-3.5 h-3.5 text-amber-400" />
          <span>Tùy chọn khác</span>
        </button>

        {/* Export file */}
        <div className="flex items-center gap-1 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={handleExportM3U}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition flex items-center gap-1"
            title="Tải file M3U cho trình phát nhạc"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>M3U</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition flex items-center gap-1"
            title="Tải file bảng tính CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
