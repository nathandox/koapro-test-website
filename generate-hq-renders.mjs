/**
 * Generates photoreal Koa Pro Detail HQ renders with the Gemini image API
 * ("Nano Banana"), using the real Koa logo as a reference image so the mark
 * comes back correct instead of invented.
 *
 *   1. Get a key at https://aistudio.google.com/apikey
 *   2. Add to .env:   GEMINI_API_KEY=your-key-here
 *   3. node generate-hq-renders.mjs           # all four shots
 *      node generate-hq-renders.mjs 1 3       # only shots 1 and 3
 *      node generate-hq-renders.mjs 2 --n=4   # four variations of shot 2
 *
 * Output: ./hq-renders/hq-<n>-<slug>[-v2].png
 */

import fs from 'fs';
import path from 'path';

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
const LOGO = 'koa-logo-transparent.png';
const OUT_DIR = './hq-renders';

/* ---------- shared style + brand direction, appended to every prompt ---------- */

const LOGO_RULE = `
The attached image is the exact Koa Pro Detail logo: a cartoon brown kelpie dog holding a pressure washer beside a blue sports car, above bold white "KOA" lettering and "PRO DETAIL" in sky blue on a dark navy badge. Reproduce this logo faithfully wherever it appears — same dog, same colors, same lettering. Do not redraw, restyle, or invent a different logo, and do not add any other brand names or text.`;

const STYLE = `
Photorealistic, shot on a full-frame camera, natural optics, believable materials and reflections. 16:9 landscape composition. No people, no text overlays, no watermarks, no illustration or CGI-render look.`;

/* ---------- the four shots ---------- */

const SHOTS = [
  {
    slug: 'exterior-dusk',
    title: 'Exterior at dusk',
    prompt: `Photorealistic architectural photograph of a modern car-detailing headquarters at dusk, twenty minutes after sunset.

A long single-story pre-engineered metal building clad in matte charcoal standing-seam panels, low-slope roof with a deep overhang. Along the right two-thirds: four full-glass sectional overhead doors, all open, spilling warm white 5000K light across a compacted gray gravel apron. Inside the bays, luxury cars sit on lifts beside rolling LED light towers on spotless gloss-flake epoxy floors. The left third of the building is a floor-to-ceiling glass client wing glowing warm amber 2700K behind a covered porch on dark steel posts. A continuous thin sky-blue LED cove light runs the full width of the building under the roof fascia.

Mounted on the charcoal wall above the glass wing is a large illuminated sign panel carrying the Koa Pro Detail logo, edge-lit with a soft blue halo so it is the brightest object on the facade after the bay doors.

Parked on the gravel in the foreground: two gloss-black crew-cab pickup trucks, each wrapped with a sky-blue angular graphic sweep along the lower body and the Koa Pro Detail logo, each towing a matching black enclosed trailer with the logo on its flank.

Dusk sky with soft orange and pink cloud bands over a dark treeline. Wet gravel reflecting the bay lights. 35mm lens, eye level, slight three-quarter angle from the front-left, f/8, long exposure, crisp architectural realism. High-end commercial real-estate photography.`,
  },
  {
    slug: 'executive-office',
    title: 'Executive office',
    prompt: `Photorealistic interior photograph of a luxury executive office inside a car-detailing headquarters.

The feature wall is ebonized rift white oak millwork with integrated LED reveals, dominated by a large Koa Pro Detail logo backlit with a soft sky-blue halo. Flanking display shelving, lit from within, holds detailing trophies, framed certifications, ceramic-coating awards, and framed photos of finished supercars.

A large dark walnut executive desk with a black leather chair, an ultrawide curved monitor showing analytics, a navy leather-bound book, and a black mug carrying the Koa dog icon. To the right, a deep black leather sectional with sky-blue accent pillows, a low walnut coffee table, and a wall-mounted TV displaying the Koa logo on navy. A brown kelpie dog bed in sky-blue fabric sits in the corner by a window.

Warm 2700K lighting, wide-plank oak floors, navy and charcoal palette with sky-blue accents. 24mm lens, eye level, f/4, warm cinematic interior photography.`,
  },
  {
    slug: 'shop-gym-golf',
    title: 'Shop floor — gym & golf sim',
    prompt: `Photorealistic wide-angle interior photograph of the crew wing of a spotless car-detailing shop.

Polished gray flake-epoxy floor with mirror reflections, dark charcoal walls, exposed black steel trusses, hexagonal LED ceiling fixtures. On the left: a black power rack, a full dumbbell rack, a flat bench, and a cedar sauna with a glass door. On the right: an enclosed golf simulator bay with a bright green turf hitting mat, a large projected fairway screen, and a leather golf bag.

Center rear: a gloss-black crew-cab pickup wrapped with a sky-blue angular graphic sweep and the Koa Pro Detail logo, parked in front of an open glass sectional door. On the far charcoal wall, the Koa Pro Detail logo is painted at mural scale and lit from above. A sky-blue Koa dog silhouette is inlaid into the epoxy floor at the bay mouth.

Cool 5000K lighting with a sky-blue accent glow along the wall base. 20mm lens, eye level, f/8, deep focus, immaculate and empty. High-end commercial interior photography.`,
  },
  {
    slug: 'client-lounge',
    title: 'Client lounge onto the bays',
    prompt: `Photorealistic interior photograph of an upscale client lounge inside a car-detailing headquarters.

Warm 2700K lighting and ebonized oak millwork, with a full-height glass wall on the right looking directly into a brightly lit white detailing bay where a black Porsche sits under rolling LED light towers on a gloss epoxy floor.

Foreground: two black leather lounge chairs and a low walnut table with detailing magazines and a black mug carrying a brown kelpie dog icon. Left wall: an espresso bar in ebonized oak with a chrome machine, and a merchandise shelf with folded navy and sky-blue caps and shirts. Above the bar, the Koa Pro Detail logo is mounted as a backlit sign with a soft sky-blue halo on a charcoal panel. A brown kelpie dog lies on a sky-blue bed near the glass.

Navy, charcoal, warm brown leather, and sky-blue accents. 24mm lens, eye level, f/2.8, strong warm-to-cool light contrast between the lounge and the bay beyond, cinematic.`,
  },
];

/* ---------- env ---------- */

function loadEnv() {
  if (!fs.existsSync('.env')) return;
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

/* ---------- find base64 image bytes anywhere in the response ---------- */

function findImage(node, depth = 0) {
  if (!node || depth > 8) return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findImage(item, depth + 1);
      if (hit) return hit;
    }
    return null;
  }
  if (typeof node !== 'object') return null;

  // a node carrying image bytes: { data: "<base64>", mime_type?: "image/png" }
  const data = node.data ?? node.bytes_base64_encoded ?? node.inline_data?.data ?? node.inlineData?.data;
  if (typeof data === 'string' && data.length > 1024) {
    const mime = node.mime_type || node.mimeType || node.inline_data?.mime_type || 'image/png';
    if (!mime.startsWith('text')) return { data, mime };
  }
  for (const v of Object.values(node)) {
    const hit = findImage(v, depth + 1);
    if (hit) return hit;
  }
  return null;
}

/* ---------- one generation ---------- */

async function generate(shot, apiKey, logoB64, attempt = 1) {
  const body = {
    model: MODEL,
    input: [
      { type: 'text', text: `${shot.prompt}\n${LOGO_RULE}\n${STYLE}` },
      { type: 'image', mime_type: 'image/png', data: logoB64 },
    ],
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    // 429/5xx are worth retrying; 4xx config errors are not
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      const wait = attempt * 8000;
      console.log(`   ${res.status} — retrying in ${wait / 1000}s (attempt ${attempt + 1}/3)`);
      await new Promise((r) => setTimeout(r, wait));
      return generate(shot, apiKey, logoB64, attempt + 1);
    }
    throw new Error(`HTTP ${res.status}\n${text.slice(0, 900)}`);
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Response was not JSON:\n${text.slice(0, 400)}`);
  }

  const img = findImage(json);
  if (!img) {
    throw new Error(
      `No image in response. Top-level keys: ${Object.keys(json).join(', ')}\n${JSON.stringify(json).slice(0, 700)}`
    );
  }
  return img;
}

/* ---------- main ---------- */

loadEnv();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error(
    '\nMissing GEMINI_API_KEY.\n\n' +
      '  1. Get a key: https://aistudio.google.com/apikey\n' +
      '  2. Add this line to .env in the project root:\n\n' +
      '       GEMINI_API_KEY=your-key-here\n'
  );
  process.exit(1);
}
if (!fs.existsSync(LOGO)) {
  console.error(`Missing ${LOGO} in the project root.`);
  process.exit(1);
}

const args = process.argv.slice(2);
const nArg = args.find((a) => a.startsWith('--n='));
const variations = nArg ? Math.max(1, parseInt(nArg.split('=')[1], 10) || 1) : 1;
const picked = args.filter((a) => /^[1-4]$/.test(a)).map(Number);
const queue = picked.length ? picked.map((n) => SHOTS[n - 1]) : SHOTS;

const logoB64 = fs.readFileSync(LOGO).toString('base64');
fs.mkdirSync(OUT_DIR, { recursive: true });

console.log(`\nModel: ${MODEL}`);
console.log(`Shots: ${queue.length}${variations > 1 ? ` × ${variations} variations` : ''}\n`);

let ok = 0;
let failed = 0;

for (const shot of queue) {
  const n = SHOTS.indexOf(shot) + 1;
  for (let v = 1; v <= variations; v++) {
    const label = variations > 1 ? `${shot.title} (v${v})` : shot.title;
    process.stdout.write(`[${n}] ${label} … `);
    const started = Date.now();
    try {
      const img = await generate(shot, apiKey, logoB64);
      const ext = img.mime.includes('jpeg') ? 'jpg' : 'png';
      const suffix = variations > 1 ? `-v${v}` : '';
      const file = path.join(OUT_DIR, `hq-${n}-${shot.slug}${suffix}.${ext}`);
      fs.writeFileSync(file, Buffer.from(img.data, 'base64'));
      const kb = Math.round(fs.statSync(file).size / 1024);
      console.log(`saved ${file} (${kb} KB, ${((Date.now() - started) / 1000).toFixed(1)}s)`);
      ok++;
    } catch (err) {
      console.log('FAILED');
      console.log(`     ${String(err.message).split('\n').join('\n     ')}\n`);
      failed++;
    }
  }
}

console.log(`\nDone — ${ok} generated, ${failed} failed. Output in ${OUT_DIR}/\n`);
if (failed && ok === 0) {
  console.log(
    'If every shot failed on a 404 or model error, try another model id:\n' +
      '  GEMINI_IMAGE_MODEL=gemini-3-pro-image node generate-hq-renders.mjs\n' +
      '  GEMINI_IMAGE_MODEL=gemini-2.5-flash-image node generate-hq-renders.mjs\n'
  );
}
