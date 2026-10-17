const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const images = path.join(root, 'dist', 'assets', 'images');
const basePath = path.join(images, 'venue-gallery-v3.webp');
const width = 1774;
const height = 887;

function edgeDecontaminate(data, info) {
  const { width: w, height: h, channels } = info;
  let current = Buffer.from(data);

  for (let pass = 0; pass < 2; pass += 1) {
    const next = Buffer.from(current);
    for (let y = 1; y < h - 1; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        const index = (y * w + x) * channels;
        const alpha = current[index + 3];
        if (alpha === 0) continue;

        let touchesTransparency = false;
        for (let oy = -1; oy <= 1 && !touchesTransparency; oy += 1) {
          for (let ox = -1; ox <= 1; ox += 1) {
            if (current[((y + oy) * w + (x + ox)) * channels + 3] < 16) {
              touchesTransparency = true;
              break;
            }
          }
        }
        if (!touchesTransparency) continue;

        let best = -1;
        let bestAlpha = 0;
        for (let radius = 1; radius <= 4; radius += 1) {
          for (let oy = -radius; oy <= radius; oy += 1) {
            for (let ox = -radius; ox <= radius; ox += 1) {
              const nx = x + ox;
              const ny = y + oy;
              if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
              const candidate = (ny * w + nx) * channels;
              const candidateAlpha = current[candidate + 3];
              if (candidateAlpha > bestAlpha) {
                bestAlpha = candidateAlpha;
                best = candidate;
              }
            }
          }
          if (bestAlpha >= 245) break;
        }

        if (best >= 0 && bestAlpha >= 180) {
          next[index] = current[best];
          next[index + 1] = current[best + 1];
          next[index + 2] = current[best + 2];
        }
        next[index + 3] = alpha < 220 ? Math.max(0, Math.round((alpha - 14) * 1.06)) : alpha;
      }
    }
    current = next;
  }
  return current;
}

async function prepareCutout(filename, targetWidth) {
  const { data, info } = await sharp(path.join(images, filename))
    .ensureAlpha()
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cleaned = edgeDecontaminate(data, info);
  return sharp(cleaned, { raw: info })
    .resize({ width: targetWidth, fit: 'inside', withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer({ resolveWithObject: true });
}

async function shadow(cx, cy, rx, ry, opacity, blur) {
  const svg = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#35291f" fill-opacity="${opacity}"/>
  </svg>`);
  return sharp(svg).blur(blur).png().toBuffer();
}

async function buildScene({ cutout, targetWidth, centerX, bottomY, shadowSpec, output, overlay }) {
  const prepared = await prepareCutout(cutout, targetWidth);
  const arrangementHeight = prepared.info.height;
  const arrangementWidth = prepared.info.width;
  const left = Math.round(centerX - arrangementWidth / 2);
  const top = Math.round(bottomY - arrangementHeight);
  const shadowBuffer = await shadow(...shadowSpec);

  const overlayBuffer = await sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .composite([
      { input: shadowBuffer, left: 0, top: 0 },
      { input: prepared.data, left, top }
    ])
    .webp({ quality: 88, smartSubsample: true })
    .toBuffer();

  await sharp(overlayBuffer).toFile(path.join(images, overlay));
  await sharp(basePath)
    .composite([{ input: overlayBuffer, left: 0, top: 0 }])
    .webp({ quality: 88, smartSubsample: true })
    .toFile(path.join(images, output));

  return { output, overlay, left, top, arrangementWidth, arrangementHeight, bottomY };
}

async function main() {
  const scenes = [
    {
      cutout: 'arrangement-classic-cutout-v3.png',
      targetWidth: 220,
      centerX: 986,
      bottomY: 368,
      shadowSpec: [986, 370, 55, 7, 0.18, 7],
      output: 'hero-scene-classic-v6.webp',
      overlay: 'hero-overlay-classic-v6.webp'
    },
    {
      cutout: 'arrangement-large-cutout-v3.png',
      targetWidth: 560,
      centerX: 1272,
      bottomY: 498,
      shadowSpec: [1272, 500, 74, 10, 0.16, 10],
      output: 'hero-scene-large-v6.webp',
      overlay: 'hero-overlay-large-v6.webp'
    },
    {
      cutout: 'arrangement-grand-cutout-v3.png',
      targetWidth: 330,
      centerX: 1588,
      bottomY: 378,
      shadowSpec: [1588, 379, 48, 7, 0.17, 7],
      output: 'hero-scene-grand-v6.webp',
      overlay: 'hero-overlay-grand-v6.webp'
    }
  ];

  const results = [];
  for (const scene of scenes) results.push(await buildScene(scene));
  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
