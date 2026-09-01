import { NextRequest, NextResponse } from "next/server";
import { getInnertube } from "@/lib/innertube";
import { matchSingleTrack } from "@/lib/matcher";
import { BatchMatchResponse, OriginalTrack } from "@/lib/types";

export const maxDuration = 30; // Max duration for Vercel serverless

export async function POST(
  req: NextRequest
): Promise<NextResponse<BatchMatchResponse>> {
  try {
    const body = await req.json();
    const tracks: OriginalTrack[] = body.tracks;

    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      return NextResponse.json(
        { success: false, results: [], error: "Danh sách bài hát rỗng" },
        { status: 400 }
      );
    }

    const yt = await getInnertube();

    // Xử lý song song từng bài trong batch
    const results = await Promise.all(
      tracks.map(async (track) => {
        try {
          return await matchSingleTrack(yt, track);
        } catch (err: any) {
          console.error(`[Match Error for ${track.id}]:`, err);
          return {
            original: track,
            matched: null,
            status: "fallback_original" as const,
            confidence: "none" as const,
            candidates: [],
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error("[Match Batch Route Error]:", error);
    return NextResponse.json(
      {
        success: false,
        results: [],
        error: error.message || "Lỗi xử lý đối soát bài hát",
      },
      { status: 500 }
    );
  }
}
