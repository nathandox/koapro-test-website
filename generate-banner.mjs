import puppeteer from 'puppeteer';
import path from 'path';

const url = process.argv[2];
const base = process.argv[3] || './banner';

const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/Users/nathantaylor/.cache/puppeteer/chrome/mac_arm-148.0.7778.97/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
});

const page = await browser.newPage();
await page.setViewport({ width: 7200, height: 4800, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

const pngPath = path.resolve(`${base}.png`);
const el = await page.$('.banner');
await el.screenshot({ path: pngPath });
console.log(`PNG saved: ${pngPath}`);

const pdfPath = path.resolve(`${base}.pdf`);
await page.pdf({
  path: pdfPath,
  width: '72in',
  height: '48in',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});
console.log(`PDF saved: ${pdfPath}`);

await browser.close();
