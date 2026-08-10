import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = '/Users/grant/BrightPenny/src-images/originals';
const OUT = '/Users/grant/BrightPenny/site/assets/img';
await mkdir(OUT, { recursive: true });

const JOBS = [
  { name: 'hero-fabrication', widths: [800, 1200, 1600, 2000, 2400] },
  { name: 'hero-fabrication', suffix: '-tall', widths: [480, 800, 1080], aspect: [4, 5] },
  { name: 'sector-manufacturing', widths: [480, 800, 1200] },
  { name: 'sector-haulage', widths: [480, 800, 1200] },
  { name: 'sector-construction', widths: [480, 800, 1200] },
  { name: 'sector-engineering', widths: [480, 800, 1200] },
  { name: 'sector-agriculture', widths: [480, 800, 1200] },
  { name: 'sector-hospitality', widths: [480, 800, 1200] },
  { name: 'sector-healthcare', widths: [480, 800, 1200] },
  { name: 'sector-recycling', widths: [480, 800, 1200] },
  { name: 'about-craftsmen', widths: [480, 800, 1200] },
  { name: 'about-team', widths: [480, 800, 1200, 1600] },
  { name: 'detail-machining', widths: [480, 800, 1200, 1600] },
];

const results = [];
for (const job of JOBS) {
  const suffix = job.suffix ?? '';
  for (const w of job.widths) {
    let img = sharp(`${SRC}/${job.name}.jpg`).rotate();
    if (job.aspect) {
      const h = Math.round((w * job.aspect[1]) / job.aspect[0]);
      img = img.resize(w, h, { fit: 'cover', position: sharp.strategy.attention });
    } else {
      img = img.resize(w);
    }
    const base = `${OUT}/${job.name}${suffix}-${w}`;
    const [a, we, j] = await Promise.all([
      img.clone().avif({ quality: 55 }).toFile(`${base}.avif`),
      img.clone().webp({ quality: 72 }).toFile(`${base}.webp`),
      img.clone().jpeg({ quality: 76, progressive: true, mozjpeg: true }).toFile(`${base}.jpg`),
    ]);
    results.push(`${job.name}${suffix}-${w}: avif ${Math.round(a.size / 1024)}k webp ${Math.round(we.size / 1024)}k jpg ${Math.round(j.size / 1024)}k  (${a.width}x${a.height})`);
  }
}
console.log(results.join('\n'));
