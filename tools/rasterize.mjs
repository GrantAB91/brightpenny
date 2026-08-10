import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFile } from 'node:fs/promises';

const ICONS = '/Users/grant/BrightPenny/site/assets/icons';

// square (full-bleed) pngs for touch/manifest icons
for (const size of [180, 192, 512]) {
  const name = size === 180 ? `${ICONS}/apple-touch-icon.png` : `${ICONS}/icon-${size}.png`;
  await sharp('icon-square.svg').resize(size, size).png().toFile(name);
  console.log(name);
}

// classic favicon.ico from the disc mark (16 + 32)
const pngs = await Promise.all(
  [16, 32].map(s => sharp(`${ICONS}/favicon.svg`).resize(s, s).png().toBuffer())
);
await writeFile('/Users/grant/BrightPenny/site/favicon.ico', await pngToIco(pngs));
console.log('favicon.ico');
