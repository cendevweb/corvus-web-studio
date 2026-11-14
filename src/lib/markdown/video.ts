export type VideoSource = { kind: "youtube"; id: string } | { kind: "file"; src: string };

/** Recognises a YouTube link or a video file (MP4/WebM), the two kinds a news can embed. */
export function parseVideo(url: string | undefined): VideoSource | null {
  if (!url) return null;
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) return { kind: "file", src: url };
  const match =
    /^https?:\/\/(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)([\w-]{6,})/.exec(url) ??
    /^https?:\/\/youtu\.be\/([\w-]{6,})/.exec(url);
  return match ? { kind: "youtube", id: match[1]! } : null;
}
