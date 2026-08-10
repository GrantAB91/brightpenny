import sharp from 'sharp';

const W = 1200, H = 630;
const logo = await sharp('/Users/grant/BrightPenny/site/assets/img/logo-lockup-white.svg', { density: 300 })
  .resize(720)
  .png()
  .toBuffer();

await sharp({ create: { width: W, height: H, channels: 3, background: '#0b1b33' } })
  .composite([
    { input: logo, gravity: 'centre' },
    { input: { create: { width: W, height: 10, channels: 3, background: '#f7931e' } }, top: H - 10, left: 0 },
  ])
  .jpeg({ quality: 85 })
  .toFile('/Users/grant/BrightPenny/site/assets/img/og-image.jpg');
console.log('og-image.jpg written');
