import puppeteer from 'puppeteer';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3000/flyer-atlantic.html';
const out = process.argv[3] || path.resolve('./flyer-atlantic.pdf');

const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/Users/nathantaylor/.cache/puppeteer/chrome/mac_arm-148.0.7778.97/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
});

const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

await page.pdf({
  path: out,
  format: 'Letter',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});

await browser.close();
console.log(`PDF saved: ${out}`);
