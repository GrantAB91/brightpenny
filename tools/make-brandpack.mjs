import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SRC = 'file:///Users/grant/BrightPenny/brand/brand-pack.html';
const OUT = '/Users/grant/BrightPenny/brand/Bright-Penny-Brand-Pack.pdf';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--allow-file-access-from-files', '--no-sandbox'],
});
const page = await browser.newPage();
await page.goto(SRC, { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');

await page.pdf({
  path: OUT,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});

await browser.close();
console.log('written:', OUT);
