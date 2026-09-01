"use client";

import React from "react";
import { Disc3, Music2, Sparkles, Youtube } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-[#222222] bg-[#030303]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-600/30">
            <Youtube className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                YTM Converter
                <span className="bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-full font-medium border border-red-500/20">
                  MV &rarr; Album
                </span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              Chuyển đổi MV sang bản Song/Album chính thức trên YouTube Music
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 bg-[#121212] px-3 py-1.5 rounded-full border border-neutral-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Vercel Free Ready</span>
          </div>

          <a
            href="https://music.youtube.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 transition rounded-full border border-neutral-700"
          >
            <Music2 className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">Mở YouTube Music</span>
          </a>
        </div>
      </div>
    </header>
  );
}
