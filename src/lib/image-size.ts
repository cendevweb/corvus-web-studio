import fs from "node:fs";
import path from "node:path";

export interface ImageSize {
  width: number;
  height: number;
}

const cache = new Map<string, ImageSize | null>();

function readPng(buffer: Buffer): ImageSize | null {
  if (buffer.length < 24 || buffer.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function readJpeg(buffer: Buffer): ImageSize | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1]!;
    const length = buffer.readUInt16BE(offset + 2);
    // Start-of-frame markers carry the dimensions (C4, C8 and CC are not frames).
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

/**
 * Intrinsic size of an image of `public/` (PNG or JPEG), read at build time so Markdown images
 * can go through `next/image` without the author typing dimensions. `null` when unknown.
 */
export function publicImageSize(src: string): ImageSize | null {
  if (!src.startsWith("/") || src.startsWith("//")) return null;
  const cached = cache.get(src);
  if (cached !== undefined) return cached;
  let size: ImageSize | null = null;
  try {
    const file = path.join(process.cwd(), "public", decodeURIComponent(src.split(/[?#]/)[0]!));
    const buffer = fs.readFileSync(file);
    size = readPng(buffer) ?? readJpeg(buffer);
  } catch {
    size = null;
  }
  cache.set(src, size);
  return size;
}
