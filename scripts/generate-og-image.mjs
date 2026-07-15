// Generates client/public/og-default.png — a 1200x630 branded social-share image.
// Dependency-free PNG encoder (Node zlib) + a tiny 5x7 bitmap font, so it runs
// anywhere without ImageMagick/sharp. Re-run: `node scripts/generate-og-image.mjs`.
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const W = 1200;
const H = 630;

const BRAND = [185, 28, 28]; // #b91c1c
const BRAND_DARK = [127, 29, 29]; // #7f1d1d
const WHITE = [255, 255, 255];
const CREAM = [255, 228, 228];

const buf = new Uint8Array(W * H * 4);

function setPx(x, y, [r, g, b], a = 255) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
}
function fillRect(x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) setPx(x, y, color);
}

// 5x7 bitmap font (only the glyphs we need).
const FONT = {
  A: ['..#..', '.#.#.', '#...#', '#...#', '#####', '#...#', '#...#'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  D: ['###..', '#..#.', '#...#', '#...#', '#...#', '#..#.', '###..'],
  G: ['.####', '#....', '#....', '#..##', '#...#', '#...#', '.####'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};

function textWidth(text, scale) {
  return text.length * (5 + 1) * scale - scale; // 1px gap between glyphs
}
function drawText(text, cx, y, scale, color) {
  let x = Math.round(cx - textWidth(text, scale) / 2);
  for (const ch of text.toUpperCase()) {
    const glyph = FONT[ch] || FONT[' '];
    for (let gy = 0; gy < 7; gy++) {
      for (let gx = 0; gx < 5; gx++) {
        if (glyph[gy][gx] === '#') fillRect(x + gx * scale, y + gy * scale, scale, scale, color);
      }
    }
    x += (5 + 1) * scale;
  }
}

// --- compose ---
// background
fillRect(0, 0, W, H, BRAND);
// darker frame border
fillRect(0, 0, W, 14, BRAND_DARK);
fillRect(0, H - 14, W, 14, BRAND_DARK);

// white logo tile with red "N"
const tile = 150;
const tx = (W - tile) / 2;
const ty = 96;
fillRect(tx, ty, tile, tile, WHITE);
drawText('N', W / 2, ty + 33, 12, BRAND);

// wordmark
drawText('NARANG MANDI', W / 2, 300, 14, WHITE);
// domain
drawText('NARANGMANDI.COM', W / 2, 470, 6, CREAM);

// --- encode PNG ---
function crc32(bytes) {
  let c = ~0;
  for (let i = 0; i < bytes.length; i++) {
    c ^= bytes[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 0);
  return Buffer.concat([len, typeBytes, data, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type RGBA
ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

// filtered raw scanlines (filter byte 0 per row)
const raw = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 4)] = 0;
  Buffer.from(buf.buffer, y * W * 4, W * 4).copy(raw, y * (1 + W * 4) + 1);
}
const idat = zlib.deflateSync(raw, { level: 9 });

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = path.resolve(__dirname, '..', 'public', 'og-default.png');
fs.writeFileSync(out, png);
console.log(`[og] wrote ${out} (${W}x${H}, ${png.length} bytes)`);
