"use client";

import React, { useState } from "react";
import { ArrowRight, Clipboard, Sparkles, Trash2, Video, Music } from "lucide-react";

interface UrlInputFormProps {
  onSubmit: (url: string) => void;
  onUseSampleTracks?: () => void;
  isLoading: boolean;
}

export function UrlInputForm({ onSubmit, onUseSampleTracks, isLoading }: UrlInputFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    onSubmit(url.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch {
      // Fallback
    }
  };

  const sampleUrl = "https://music.youtube.com/playlist?list=PLAUgEUsKvpOUDa9wc7QosxGyD6x-btqkc";

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center glass-panel rounded-2xl p-2 border border-neutral-700/80 shadow-2xl focus-within:border-red-500/80 focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
          <div className="pl-3 pr-2 text-neutral-400">
            <Music className="w-5 h-5 text-red-500" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Dán link Playlist YouTube Music (ví dụ: https://music.youtube.com/playlist?list=...) hoặc link video MV..."
            className="w-full bg-transparent text-white placeholder-neutral-500 px-2 py-3 text-sm sm:text-base focus:outline-none"
            disabled={isLoading}
          />

          <div className="flex items-center gap-1.5 pr-1">
            {url && (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
                title="Xóa nhập"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handlePaste}
              className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-lg bg-neutral-800 hover:bg-neutral-700 transition border border-neutral-700"
              title="Dán từ Clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Dán</span>
            </button>

            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 shadow-md ${
                !url.trim() || isLoading
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-800"
                  : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white glow-red active:scale-95"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <span>Chuyển đổi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Quick sample chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
        <span className="flex items-center gap-1 text-neutral-500 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Dùng thử mẫu:
        </span>

        {onUseSampleTracks && (
          <button
            type="button"
            onClick={onUseSampleTracks}
            className="px-2.5 py-1 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition border border-neutral-700 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span>Bộ 3 bài từ Ảnh 1 (Indila, Phương Mỹ Chi, Minh Huy)</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setUrl(sampleUrl);
            onSubmit(sampleUrl);
          }}
          className="px-2.5 py-1 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition border border-neutral-700 flex items-center gap-1.5"
        >
          <Video className="w-3 h-3 text-red-400" />
          <span>Playlist V-Pop Hits (100 bài)</span>
        </button>
      </div>
    </div>
  );
}
