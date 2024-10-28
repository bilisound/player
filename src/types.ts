export type ExtendedData = any;

export interface TrackData {
  uri: string;
  artworkUri?: string | null;
  title?: string | null;
  artist?: string | null;
  duration?: number | null;
  httpHeaders?: Record<string, string> | null;
  extendedData?: ExtendedData | null;
}

export interface TrackDataInternal {
  uri: string;
  artworkUri: string | null;
  title: string | null;
  artist: string | null;
  duration: number | null;
  httpHeaders: string | null;
  extendedData: string | null;
}

export interface PlaybackProgress {
  duration: number;
  position: number;
  buffered: number;
}
