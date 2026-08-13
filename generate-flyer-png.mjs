import puppeteer from 'puppeteer';
import path from 'path';

const url = process.argv[2];
const out = process.argv[3] || path.resolve('./flyer.png');
const width = parseInt(process.argv[4] || '1080', 10);
const height = parseInt(process.argv[5] || '1440', 10);

const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/Users/nathantaylor/.cache/puppeteer/chrome/mac_arm-148.0.7778.97/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
});

const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

const el = await page.$('.flyer');
await el.screenshot({ path: out });

await browser.close();
console.log(`PNG saved: ${out}`);
