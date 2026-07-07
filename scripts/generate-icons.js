import { Jimp } from 'jimp';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const BG = '#0d0f12';
const ACC = '#c6ff3a';
const SIZES = [192, 512];

async function generateIcon(size) {
  const bgNum = parseInt(BG.slice(1), 16);
  const accNum = parseInt(ACC.slice(1), 16);

  let img = new Jimp({ width: size, height: size, color: bgNum });

  // Desenha um halter simples (dois círculos nas laterais + linha do meio)
  const pad = Math.floor(size * 0.15);
  const barWidth = Math.floor(size * 0.1);
  const discRadius = Math.floor(size * 0.25);
  const centerX = size / 2;
  const centerY = size / 2;

  // Esquerda: disco
  for (let y = Math.max(0, centerY - discRadius); y < Math.min(size, centerY + discRadius); y++) {
    for (let x = Math.max(0, pad - discRadius); x < Math.min(size, pad + discRadius); x++) {
      const dx = x - pad, dy = y - centerY;
      if (dx * dx + dy * dy <= discRadius * discRadius) {
        img.setPixelColor(accNum, x, y);
      }
    }
  }

  // Direita: disco
  for (let y = Math.max(0, centerY - discRadius); y < Math.min(size, centerY + discRadius); y++) {
    for (let x = Math.max(0, size - pad - discRadius); x < Math.min(size, size - pad + discRadius); x++) {
      const dx = x - (size - pad), dy = y - centerY;
      if (dx * dx + dy * dy <= discRadius * discRadius) {
        img.setPixelColor(accNum, x, y);
      }
    }
  }

  // Barra do meio (retângulo)
  for (let y = centerY - barWidth / 2; y < centerY + barWidth / 2; y++) {
    if (y >= 0 && y < size) {
      for (let x = pad; x < size - pad; x++) {
        img.setPixelColor(accNum, x, Math.floor(y));
      }
    }
  }

  const path = `public/icon-${size}x${size}.png`;
  mkdirSync(dirname(path), { recursive: true });
  await img.write(path);
  console.log(`✓ Generated ${path}`);
}

async function main() {
  for (const size of SIZES) {
    await generateIcon(size);
  }
  console.log('Icons generated successfully!');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
