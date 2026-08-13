#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_TAG = '<script src="/chatbot.js" defer></script>';

const htmlFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

let updated = 0;
for (const file of htmlFiles) {
  const filepath = path.join(__dirname, file);
  const content = fs.readFileSync(filepath, 'utf8');

  if (content.includes('/chatbot.js')) {
    console.log(`SKIP: ${file} (already has chatbot)`);
    continue;
  }

  if (!content.includes('</body>')) {
    console.log(`SKIP: ${file} (no </body> tag)`);
    continue;
  }

  const updated_content = content.replace('</body>', `${SCRIPT_TAG}\n</body>`);
  fs.writeFileSync(filepath, updated_content, 'utf8');
  console.log(`UPDATED: ${file}`);
  updated++;
}

console.log(`\nDone. ${updated}/${htmlFiles.length} files updated.`);
