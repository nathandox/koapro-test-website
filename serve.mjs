import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Load .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  }
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the friendly AI assistant for Koa Pro Detail, a premier mobile car detailing company in Northern Virginia. Help website visitors learn about services and book appointments.

BUSINESS INFO:
- Name: Koa Pro Detail
- Phone: (571) 850-2351
- Email: koaprodetail@gmail.com
- 115+ 5-star Google reviews
- Fully mobile — we come to your home, office, estate, hangar, or marina

SERVICES & STARTING PRICES:
- Interior Detail: from $179
- Exterior Detail: from $155
- Full Detail (interior + exterior): from $279
- Paint Correction: from $395 (removes swirls, scratches, oxidation)
- Ceramic Coating: from $649 (long-term paint protection)
- Paint Protection Film (PPF): contact for quote, 10-year warranty
- Aviation Detailing: contact for quote (aircraft interiors & exteriors)
- Marine Detailing: contact for quote (boats & watercraft)
- Corporate Fleet: contact for quote (volume pricing available)

SERVICE AREAS:
- Loudoun County, VA: Leesburg, Ashburn, Middleburg, South Riding, Purcellville
- Fairfax County, VA: McLean, Great Falls, Vienna, Reston, Herndon
- Fauquier County, VA: Warrenton, Upperville, The Plains
- Also serve surrounding Northern Virginia communities

BOOKING:
- Book online: https://app.urable.com/virtual-shop/w4wNh0LRbxnCwDWP9tbr
- Call or text: (571) 850-2351
- Email: koaprodetail@gmail.com

GUIDELINES:
- Be warm, professional, and concise — 2-4 sentences per reply unless more detail is genuinely needed
- Help visitors pick the right service for their situation
- Always encourage booking — it's quick and easy online
- If asked about something outside your knowledge, direct them to call or email
- Never invent prices beyond what's listed above`;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Chat API endpoint
  if (req.method === 'POST' && req.url === '/api/chat') {
    if (!process.env.ANTHROPIC_API_KEY) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Chat is not configured yet. Please call (571) 850-2351 or email koaprodetail@gmail.com.' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { messages } = JSON.parse(body);
        const response = await anthropic.messages.create({
          model: 'claude-opus-4-8',
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          messages: messages,
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ content: response.content[0].text }));
      } catch (err) {
        console.error('Chat API error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Chat is temporarily unavailable. Please call (571) 850-2351 or email koaprodetail@gmail.com.' }));
      }
    });
    return;
  }

  // Static file server
  let urlPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(__dirname, urlPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY not set — add it to a .env file to enable the chat widget.');
  }
});
