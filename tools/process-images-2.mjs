import sharp from 'sharp';

const SRC = '/Users/grant/BrightPenny/src-images/originals';
const OUT = '/Users/grant/BrightPenny/site/assets/img';

// Landscape 16:9-ish crops for the finance product rows + supporting images.
const JOBS = [
  { name: 'product-asset-finance', widths: [480, 800, 1200], aspect: [16, 10] },
  { name: 'product-asset-refinance', widths: [480, 800, 1200], aspect: [16, 10] },
  { name: 'product-business-loans', widths: [480, 800, 1200], aspect: [16, 10] },
  { name: 'product-invoice-finance', widths: [480, 800, 1200], aspect: [16, 10] },
  { name: 'product-merchant-cash-advance', widths: [480, 800, 1200], aspect: [16, 10] },
  { name: 'product-commercial-mortgages', widths: [480, 800, 1200], aspect: [16, 10] },
  { name: 'product-development-bridging', widths: [480, 800, 1200], aspect: [16, 10] },
  { name: 'product-structured-finance', widths: [480, 800, 1200], aspect: [16, 10] },
  { name: 'product-trade-finance', widths: [480, 800, 1200], aspect: [16, 10] },
  { name: 'contact-shop', widths: [480, 800], aspect: [4, 3] },
  // replaces the rejected foreign-factory shot on the Sectors page
  { name: 'sector-manufacturing-new', out: 'sector-manufacturing', widths: [480, 800, 1200], aspect: [3, 2] },
  // hero poster: wide for desktop, plus a taller mobile crop
  { name: 'hero-a1-poster', widths: [800, 1280, 1920], aspect: [16, 9] },
  { name: 'hero-a1-poster', out: 'hero-a1-poster-tall', widths: [480, 800], aspect: [4, 5] },
];

const lines = [];
for (const job of JOBS) {
  const outName = job.out ?? job.name;
  for (const w of job.widths) {
    const h = Math.round((w * job.aspect[1]) / job.aspect[0]);
    const base = `${OUT}/${outName}-${w}`;
    const img = sharp(`${SRC}/${job.name}.jpg`)
      .rotate()
      .resize(w, h, { fit: 'cover', position: sharp.strategy.attention });
    const [a, we, j] = await Promise.all([
      img.clone().avif({ quality: 55 }).toFile(`${base}.avif`),
      img.clone().webp({ quality: 72 }).toFile(`${base}.webp`),
      img.clone().jpeg({ quality: 76, progressive: true, mozjpeg: true }).toFile(`${base}.jpg`),
    ]);
    lines.push(`${outName}-${w}  avif ${Math.round(a.size / 1024)}k  webp ${Math.round(we.size / 1024)}k  jpg ${Math.round(j.size / 1024)}k  ${a.width}x${a.height}`);
  }
}
console.log(lines.join('\n'));
