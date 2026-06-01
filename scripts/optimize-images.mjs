/**
 * Nén ảnh cho ThreeSphere — giữ nguyên bản gốc.
 *
 *   pnpm optimize-images        → đọc images-original/, ghi .webp vào images/
 *   pnpm optimize-images --init → copy ảnh hiện có từ images/ sang images-original/ (lần đầu)
 *
 * Mặc định: cạnh dài tối đa 1280px, WebP quality 78 (~50–150 KB/ảnh).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ORIGINAL_DIR = path.join(ROOT, 'src/assets/images-original');
const OUTPUT_DIR = path.join(ROOT, 'src/assets/images');

const MAX_EDGE = 1280;
const WEBP_QUALITY = 78;

const SOURCE_EXT = /\.(png|jpe?g|gif|webp)$/i;
const SKIP_IN_ORIGINAL = /\.webp$/i;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function listSourceFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && SOURCE_EXT.test(e.name) && !SKIP_IN_ORIGINAL.test(e.name))
    .map((e) => e.name);
}

async function copyToOriginals() {
  await ensureDir(ORIGINAL_DIR);
  const inOutput = await listSourceFiles(OUTPUT_DIR);
  let copied = 0;

  for (const name of inOutput) {
    const dest = path.join(ORIGINAL_DIR, name);
    try {
      await fs.access(dest);
      continue;
    } catch {
      /* chưa có bản gốc */
    }
    await fs.copyFile(path.join(OUTPUT_DIR, name), dest);
    copied += 1;
  }

  return copied;
}

async function removeHeavyFromOutput() {
  const entries = await fs.readdir(OUTPUT_DIR, { withFileTypes: true });
  let removed = 0;
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (SOURCE_EXT.test(e.name) && !SKIP_IN_ORIGINAL.test(e.name)) {
      await fs.unlink(path.join(OUTPUT_DIR, e.name));
      removed += 1;
    }
  }
  return removed;
}

async function optimizeOne(fileName) {
  const inputPath = path.join(ORIGINAL_DIR, fileName);
  const base = fileName.replace(/\.[^.]+$/, '');
  const outputPath = path.join(OUTPUT_DIR, `${base}.webp`);

  const before = (await fs.stat(inputPath)).size;

  await sharp(inputPath)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(outputPath);

  const after = (await fs.stat(outputPath)).size;
  return { base, before, after };
}

async function main() {
  const init = process.argv.includes('--init');

  if (init) {
    const copied = await copyToOriginals();
    console.log(`--init: đã copy ${copied} file vào images-original/ (bản gốc giữ nguyên).`);
  }

  await ensureDir(ORIGINAL_DIR);
  await ensureDir(OUTPUT_DIR);

  const sources = await listSourceFiles(ORIGINAL_DIR);
  if (sources.length === 0) {
    console.error(
      'Không có ảnh trong src/assets/images-original/\n' +
        'Chạy: pnpm optimize-images --init   (nếu ảnh gốc đang ở images/)',
    );
    process.exit(1);
  }

  console.log(`Đang nén ${sources.length} ảnh → WebP (max ${MAX_EDGE}px, q=${WEBP_QUALITY})…\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const name of sources) {
    try {
      const { base, before, after } = await optimizeOne(name);
      totalBefore += before;
      totalAfter += after;
      const pct = ((1 - after / before) * 100).toFixed(0);
      console.log(`  ✓ ${base}  ${formatMb(before)} → ${formatKb(after)}  (−${pct}%)`);
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message);
    }
  }

  const removed = await removeHeavyFromOutput();
  if (removed > 0) {
    console.log(`\nĐã xóa ${removed} file JPG/PNG cũ trong images/ (bản gốc vẫn ở images-original/).`);
  }

  console.log(
    `\nTổng: ${formatMb(totalBefore)} → ${formatMb(totalAfter)}` +
      ` (tiết kiệm ~${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`,
  );
  console.log('App dùng: src/assets/images/*.webp');
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
