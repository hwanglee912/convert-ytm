export interface OriginalTrack {
  id: string;
  title: string;
  author: string;
  duration?: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  originalUrl: string;
}

export interface CandidateTrack {
  id: string;
  title: string;
  artists: string;
  album?: string;
  duration?: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  musicUrl: string;
  score: number;
  matchReason?: string;
}

export interface MatchedTrack {
  original: OriginalTrack;
  matched: CandidateTrack | null;
  status: "matched" | "fallback_original" | "not_found" | "custom_selected";
  confidence: "exact" | "high" | "medium" | "low" | "none";
  candidates: CandidateTrack[];
}

export interface PlaylistMetadata {
  id: string;
  title: string;
  author?: string;
  description?: string;
  itemCount: number;
  thumbnailUrl?: string;
  isSingleTrack: boolean;
}

export interface ParseResponse {
  success: boolean;
  metadata?: PlaylistMetadata;
  tracks?: OriginalTrack[];
  error?: string;
}

export interface BatchMatchRequest {
  tracks: OriginalTrack[];
}

export interface BatchMatchResponse {
  success: boolean;
  results: MatchedTrack[];
  error?: string;
}

export interface CreatePlaylistRequest {
  title: string;
  description?: string;
  privacy?: "PUBLIC" | "UNLISTED" | "PRIVATE";
  videoIds: string[];
  cookie?: string;
}

export interface CreatePlaylistResponse {
  success: boolean;
  playlistId?: string;
  playlistUrl?: string;
  error?: string;
}
