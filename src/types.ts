export type ExtendedData = any;

export interface TrackData {
  uri: string;
  artworkUri?: string;
  title?: string;
  artist?: string;
  duration?: number;
  httpHeaders?: Record<string, string>;
  extendedData?: ExtendedData;
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
