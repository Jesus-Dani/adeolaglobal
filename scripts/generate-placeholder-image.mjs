// Generates a branded square placeholder product image (Soft Lilac background,
// gold hairline-with-dot, product name) for catalog entries that don't yet have
// real photography. Swap the output file for a real photo when one is available.
//
// Usage: node scripts/generate-placeholder-image.mjs "Product Name" output/path.jpg

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const [, , name, outPath] = process.argv;

if (!name || !outPath) {
  console.error('Usage: node scripts/generate-placeholder-image.mjs "Product Name" output/path.jpg');
  process.exit(1);
}

const SIZE = 900;
const SOFT_LILAC = "#F3EEFA";
const DEEP_PLUM = "#3D2258";
const GOLD = "#D4AF37";

function wrapLines(text, maxCharsPerLine) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const lines = wrapLines(name, 16);
const lineHeight = 56;
const startY = SIZE / 2 - ((lines.length - 1) * lineHeight) / 2;

const textSvg = lines
  .map(
    (line, i) =>
      `<text x="50%" y="${startY + i * lineHeight}" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, 'Times New Roman', serif" font-size="42" fill="${DEEP_PLUM}">${line}</text>`
  )
  .join("\n");

const hairlineY = startY + lines.length * lineHeight + 40;

const svg = `
<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${SOFT_LILAC}" />
  ${textSvg}
  <line x1="${SIZE / 2 - 90}" y1="${hairlineY}" x2="${SIZE / 2 - 12}" y2="${hairlineY}" stroke="${GOLD}" stroke-width="1.5" />
  <circle cx="${SIZE / 2}" cy="${hairlineY}" r="4" fill="${GOLD}" />
  <line x1="${SIZE / 2 + 12}" y1="${hairlineY}" x2="${SIZE / 2 + 90}" y2="${hairlineY}" stroke="${GOLD}" stroke-width="1.5" />
  <text x="50%" y="${hairlineY + 46}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" letter-spacing="2" fill="${DEEP_PLUM}" opacity="0.55">IMAGE PENDING</text>
</svg>
`;

await mkdir(dirname(outPath), { recursive: true });
await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(outPath);
console.log(`Wrote ${outPath}`);
