#!/usr/bin/env node
/**
 * One-off PWA icon generator.
 *
 * Source: src/assets/logo-whale-main.png (Whale logo, transparent PNG).
 * Output: public/icons/
 *   - pwa-192x192.png          (any, opaque background)
 *   - pwa-512x512.png          (any, opaque background)
 *   - pwa-maskable-512x512.png (maskable, safe-area padded)
 *   - apple-touch-icon.png     (180x180, opaque)
 *   - favicon.ico              (multi-size ICO, 16/32/48)
 *
 * Run: `node scripts/generate-icons.mjs` (after `npm i -D sharp`).
 * Not wired into the build — outputs are committed under public/icons/.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const SRC = resolve(root, "src/assets/logo-whale-main.png");
const OUT = resolve(root, "public/icons");

const BG = { r: 0x1a, g: 0x1b, b: 0x2e, alpha: 1 };

async function renderOpaque(size, innerScale = 0.78) {
  const inner = Math.round(size * innerScale);
  const pad = Math.round((size - inner) / 2);
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toBuffer();
}

async function renderMaskable(size) {
  return renderOpaque(size, 0.6);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const tasks = [
    { name: "pwa-192x192.png", buf: await renderOpaque(192) },
    { name: "pwa-512x512.png", buf: await renderOpaque(512) },
    { name: "pwa-maskable-512x512.png", buf: await renderMaskable(512) },
    { name: "apple-touch-icon.png", buf: await renderOpaque(180) },
  ];

  for (const { name, buf } of tasks) {
    await writeFile(resolve(OUT, name), buf);
    console.log("wrote", name, buf.length, "bytes");
  }

  const ico16 = await renderOpaque(16);
  const ico32 = await renderOpaque(32);
  const ico48 = await renderOpaque(48);
  await writeFile(resolve(OUT, "favicon.ico"), buildIco([
    { size: 16, png: ico16 },
    { size: 32, png: ico32 },
    { size: 48, png: ico48 },
  ]));
  console.log("wrote favicon.ico");
}

function buildIco(entries) {
  const count = entries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  const bodies = [];
  entries.forEach((e, i) => {
    const d = dir.subarray(i * 16, i * 16 + 16);
    d.writeUInt8(e.size === 256 ? 0 : e.size, 0);
    d.writeUInt8(e.size === 256 ? 0 : e.size, 1);
    d.writeUInt8(0, 2);
    d.writeUInt8(0, 3);
    d.writeUInt16LE(1, 4);
    d.writeUInt16LE(32, 6);
    d.writeUInt32LE(e.png.length, 8);
    d.writeUInt32LE(offset, 12);
    offset += e.png.length;
    bodies.push(e.png);
  });

  return Buffer.concat([header, dir, ...bodies]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
