"use client";

import React, { useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Info,
  KeyRound,
  ListPlus,
  Loader2,
  Lock,
  MousePointerClick,
  Music2,
  Share2,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
  Youtube,
} from "lucide-react";
import { CreatePlaylistResponse } from "@/lib/types";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle: string;
  videoIds: string[];
}

export function CreatePlaylistModal({
  isOpen,
  onClose,
  defaultTitle,
  videoIds,
}: CreatePlaylistModalProps) {
  const [tab, setTab] = useState<"instant_link" | "bookmarklet" | "cookie">("instant_link");
  const [title, setTitle] = useState(defaultTitle || "Playlist Album Mới");
  const [description, setDescription] = useState(
    "Được tạo tự động bởi YTM MV to Album Converter"
  );
  const [cookie, setCookie] = useState("");
  const [showCookieGuide, setShowCookieGuide] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolvingMusicUrl, setIsResolvingMusicUrl] = useState(false);
  const [result, setResult] = useState<CreatePlaylistResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  if (!isOpen) return null;

  const handleOpenDirectOnYTM = async () => {
    if (videoIds.length === 0) return;
    setIsResolvingMusicUrl(true);
    try {
      const res = await fetch("/api/ytm/get-music-playlist-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoIds }),
      });
      const data = await res.json();
      if (data.success && data.musicUrl) {
        window.open(data.musicUrl, "_blank");
      } else {
        window.open(`https://music.youtube.com/watch_videos?video_ids=${videoIds.join(",")}`, "_blank");
      }
    } catch {
      window.open(`https://music.youtube.com/watch_videos?video_ids=${videoIds.join(",")}`, "_blank");
    } finally {
      setIsResolvingMusicUrl(false);
    }
  };

  // 2. Bookmarklet Script (Chạy trực tiếp trên music.youtube.com không cần Cookie)
  const bookmarkletCode = `javascript:(async function(){
    try {
      if (!location.hostname.includes('youtube.com')) {
        alert('Vui lòng mở tab music.youtube.com trước khi bấm nút này!');
        return;
      }
      const title = ${JSON.stringify(title || "Playlist Album Mới")};
      const videoIds = ${JSON.stringify(videoIds)};
      const apiKey = window.ytcfg?.get('INNERTUBE_API_KEY') || window.ytcfg?.get('VISITOR_DATA');
      const token = window.ytcfg?.get('INNERTUBE_CONTEXT');
      
      const res = await fetch('/youtubei/v1/playlist/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: token || { client: { clientName: 'WEB_REMIX', clientVersion: '1.20240101.01.00' } },
          title: title,
          videoIds: videoIds,
          privacyStatus: 'PUBLIC'
        })
      });
      const data = await res.json();
      if (data.playlistId) {
        alert('✅ Đã tạo thành công playlist: ' + title + '! Đang chuyển đến playlist...');
        location.href = 'https://music.youtube.com/playlist?list=' + data.playlistId;
      } else {
        alert('Không thể tạo tự động. Vui lòng mở link YouTube Music để lưu thủ công.');
      }
    } catch(e) {
      alert('Lỗi: ' + e.message);
    }
  })();`;

  const handleCreateWithCookie = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!title.trim()) {
      setError("Vui lòng nhập tên Playlist");
      return;
    }

    if (!cookie.trim()) {
      setError("Vui lòng dán Cookie YouTube Music.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/ytm/create-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          videoIds,
          cookie: cookie.trim(),
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text().catch(() => "");
        throw new Error(`Máy chủ phản hồi lỗi (${res.status}): ${text.slice(0, 100)}`);
      }

      const data: CreatePlaylistResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Không thể tạo playlist. Vui lòng thử lại!");
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối đến máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#141414] rounded-2xl border border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <ListPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Tạo Playlist ({videoIds.length} bài hát bản Album)
              </h3>
              <p className="text-xs text-neutral-400">
                Mở trực tiếp trên YouTube Music hoặc tạo playlist tự động
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-neutral-800 bg-[#0e0e0e] px-4 pt-2 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab("instant_link")}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              tab === "instant_link"
                ? "border-red-500 text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Music2 className="w-4 h-4 text-emerald-400" />
            <span>Mở trên YouTube Music (1-Click)</span>
            <span className="bg-emerald-950 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded font-mono">
              Khuyên dùng
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab("bookmarklet")}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              tab === "bookmarklet"
                ? "border-red-500 text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Bookmarklet Tự Động</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("cookie")}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
              tab === "cookie"
                ? "border-red-500 text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <KeyRound className="w-4 h-4 text-neutral-400" />
            <span>Dùng Cookie</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* ================= TAB 1: DIRECT YTM (ZERO COOKIES) ================= */}
          {tab === "instant_link" && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-300 space-y-1">
                  <div className="font-bold text-white text-sm">
                    Mở Nghe Trực Tiếp Trên YouTube Music (music.youtube.com)
                  </div>
                  <p className="text-neutral-400 leading-relaxed">
                    Hệ thống sẽ tự động tạo một danh sách phát thông minh trên <b>YouTube Music</b> chứa toàn bộ {videoIds.length} bài hát bản Album phòng thu. Bạn chỉ cần bấm <b>&quot;Lưu vào danh sách phát&quot; (+)</b> trên màn hình YouTube Music để lưu vào tài khoản.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#181818] rounded-xl border border-neutral-800 space-y-2">
                <div className="text-xs font-semibold text-neutral-200">
                  Các bước thực hiện:
                </div>
                <ol className="list-decimal list-inside text-xs text-neutral-400 space-y-1.5">
                  <li>Bấm nút màu đỏ <b>&quot;Mở Toàn Bộ Trên YouTube Music&quot;</b> ở dưới.</li>
                  <li>Trang <b>music.youtube.com</b> sẽ mở ra và nạp toàn bộ danh sách bài hát vào hàng chờ.</li>
                  <li>Bấm biểu tượng <b>&quot;+&quot; (Lưu vào danh sách phát)</b> để lưu lại.</li>
                </ol>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleOpenDirectOnYTM}
                  disabled={isResolvingMusicUrl}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg glow-red transition active:scale-95 disabled:opacity-75"
                >
                  {isResolvingMusicUrl ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang nạp YouTube Music...</span>
                    </>
                  ) : (
                    <>
                      <Music2 className="w-4 h-4 fill-current" />
                      <span>Mở Toàn Bộ Trên YouTube Music Ngay</span>
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: BOOKMARKLET (ZERO COOKIES) ================= */}
          {tab === "bookmarklet" && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-start gap-3">
                <Wand2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-300 space-y-1">
                  <div className="font-bold text-white text-sm">
                    Tạo Playlist Trực Tiếp Bằng Bookmarklet
                  </div>
                  <p className="text-neutral-400 leading-relaxed">
                    Bookmarklet là một đoạn mã JavaScript nhỏ chạy trực tiếp trên tab YouTube Music đã mở. Nó sẽ tự động tạo playlist mới ngay lập tức.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 mb-1.5 block">
                  Tên Playlist muốn đặt:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(bookmarkletCode);
                    setCopiedBookmarklet(true);
                    setTimeout(() => setCopiedBookmarklet(false), 3000);
                  }}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
                    copiedBookmarklet
                      ? "bg-emerald-600 text-white shadow-lg glow-green"
                      : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                  }`}
                >
                  {copiedBookmarklet ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã sao chép mã Bookmarklet!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao chép mã Bookmarklet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 3: COOKIE ================= */}
          {tab === "cookie" && (
            <div>
              {result?.success ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Tạo Playlist Thành Công!</h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      Đã thêm thành công {videoIds.length} bài hát bản Album vào playlist mới.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center">
                    <a
                      href={result.playlistUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg glow-red transition"
                    >
                      <Music2 className="w-4 h-4 fill-current" />
                      <span>Mở Playlist trên YouTube Music</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateWithCookie} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-xs flex items-start gap-2">
                      <Info className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Tên Playlist mới
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nhập tên playlist (ví dụ: test 2 - Bản Album)"
                      className="w-full bg-[#1e1e1e] border border-neutral-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <textarea
                      value={cookie}
                      onChange={(e) => setCookie(e.target.value)}
                      placeholder="Dán chuỗi Cookie từ trình duyệt vào đây..."
                      rows={3}
                      className="w-full bg-[#1e1e1e] border border-neutral-700/80 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-red-500"
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || !cookie.trim()}
                      className={`w-full py-3 rounded-xl font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                        isLoading || !cookie.trim()
                          ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-800"
                          : "bg-red-600 hover:bg-red-500 text-white shadow-lg glow-red"
                      }`}
                    >
                      {isLoading ? (
                        <span>Đang tạo playlist trên YouTube Music...</span>
                      ) : (
                        <span>Tạo Playlist Tự Động Với Cookie</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
