#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = __dirname;

const files = [
  'about.html','ashburn.html','auto-detailing.html','aviation-detailing.html',
  'blog.html','book.html','ceramic-coating.html','contact.html',
  'corporate-fleet.html','great-falls.html','index.html','leesburg.html',
  'marine-detailing.html','mclean.html','middleburg.html',
  'paint-correction.html','paint-protection-film.html'
];

const OLD_CSS = '.nav-dropdown:hover .nav-dropdown-menu { display:block; }';
const NEW_CSS = `.nav-dropdown:hover .nav-dropdown-menu { display:block; }
    .nav-dropdown-menu.counties { display:none; min-width:540px; padding:0; }
    .nav-dropdown:hover .nav-dropdown-menu.counties { display:grid; grid-template-columns:repeat(3,1fr); }
    .county-nav-col { padding:8px 0; }
    .county-nav-col + .county-nav-col { border-left:1px solid rgba(0,0,0,0.06); }
    .county-nav-label { font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#aaa; padding:12px 16px 6px; display:block; cursor:default; }`;

const OLD_DESKTOP_NAV = `        <div class="nav-dropdown-menu">
          <a href="leesburg.html">Leesburg</a>
          <a href="ashburn.html">Ashburn</a>
          <a href="mclean.html">McLean</a>
          <a href="great-falls.html">Great Falls</a>
          <a href="middleburg.html">Middleburg</a>
        </div>`;

const NEW_DESKTOP_NAV = `        <div class="nav-dropdown-menu counties">
          <div class="county-nav-col">
            <span class="county-nav-label">Loudoun County</span>
            <a href="leesburg.html">Leesburg</a>
            <a href="ashburn.html">Ashburn</a>
            <a href="middleburg.html">Middleburg</a>
            <a href="south-riding.html">South Riding</a>
            <a href="purcellville.html">Purcellville</a>
          </div>
          <div class="county-nav-col">
            <span class="county-nav-label">Fairfax County</span>
            <a href="mclean.html">McLean</a>
            <a href="great-falls.html">Great Falls</a>
            <a href="vienna.html">Vienna</a>
            <a href="reston.html">Reston</a>
            <a href="herndon.html">Herndon</a>
          </div>
          <div class="county-nav-col">
            <span class="county-nav-label">Fauquier County</span>
            <a href="warrenton.html">Warrenton</a>
            <a href="upperville.html">Upperville</a>
            <a href="the-plains.html">The Plains</a>
          </div>
        </div>`;

const OLD_MOBILE_NAV = `        <a href="leesburg.html" onclick="closeMobileMenu()">Leesburg</a>
        <a href="ashburn.html" onclick="closeMobileMenu()">Ashburn</a>
        <a href="mclean.html" onclick="closeMobileMenu()">McLean</a>
        <a href="great-falls.html" onclick="closeMobileMenu()">Great Falls</a>
        <a href="middleburg.html" onclick="closeMobileMenu()">Middleburg</a>`;

const NEW_MOBILE_NAV = `        <a href="leesburg.html" onclick="closeMobileMenu()">Leesburg</a>
        <a href="ashburn.html" onclick="closeMobileMenu()">Ashburn</a>
        <a href="middleburg.html" onclick="closeMobileMenu()">Middleburg</a>
        <a href="south-riding.html" onclick="closeMobileMenu()">South Riding</a>
        <a href="purcellville.html" onclick="closeMobileMenu()">Purcellville</a>
        <a href="mclean.html" onclick="closeMobileMenu()">McLean</a>
        <a href="great-falls.html" onclick="closeMobileMenu()">Great Falls</a>
        <a href="vienna.html" onclick="closeMobileMenu()">Vienna</a>
        <a href="reston.html" onclick="closeMobileMenu()">Reston</a>
        <a href="herndon.html" onclick="closeMobileMenu()">Herndon</a>
        <a href="warrenton.html" onclick="closeMobileMenu()">Warrenton</a>
        <a href="upperville.html" onclick="closeMobileMenu()">Upperville</a>
        <a href="the-plains.html" onclick="closeMobileMenu()">The Plains</a>`;

const OLD_FOOTER = `          <li><a href="leesburg.html">Luxury car detailing in Leesburg, VA</a></li>
          <li><a href="ashburn.html">Mobile detailing in Ashburn, VA</a></li>
          <li><a href="mclean.html">High-end detailing in McLean, VA</a></li>
          <li><a href="great-falls.html">Estate detailing in Great Falls, VA</a></li>
          <li><a href="middleburg.html">Mobile detailing in Middleburg, VA</a></li>
          <li><a href="leesburg.html">Ceramic coating in Leesburg, VA</a></li>
          <li><a href="ashburn.html">Paint correction in Ashburn, VA</a></li>
          <li><a href="mclean.html">Ceramic coating in McLean, VA</a></li>
          <li><a href="leesburg.html">Mobile car detailing in Purcellville, VA</a></li>
          <li><a href="ashburn.html">Auto detailing in Sterling, VA</a></li>
          <li><a href="ashburn.html">Car detailing in Lansdowne, VA</a></li>
          <li><a href="mclean.html">Mobile detailing in Vienna, VA</a></li>
          <li><a href="mclean.html">Auto detailing in Reston, VA</a></li>
          <li><a href="mclean.html">Interior detailing in Herndon, VA</a></li>
          <li><a href="great-falls.html">Paint protection film in Great Falls, VA</a></li>
          <li><a href="middleburg.html">Premium detailing in Warrenton, VA</a></li>
          <li><a href="leesburg.html">Mobile detailing in Loudoun County, VA</a></li>
          <li><a href="mclean.html">Car detailing in Fairfax County, VA</a></li>
          <li><a href="middleburg.html">Auto detailing in Fauquier County, VA</a></li>
          <li><a href="ashburn.html">Paint protection film in Ashburn, VA</a></li>`;

const NEW_FOOTER = `          <li><a href="leesburg.html">Mobile car detailing in Leesburg, VA</a></li>
          <li><a href="ashburn.html">Mobile detailing in Ashburn, VA</a></li>
          <li><a href="middleburg.html">Car detailing in Middleburg, VA</a></li>
          <li><a href="south-riding.html">Mobile detailing in South Riding, VA</a></li>
          <li><a href="purcellville.html">Auto detailing in Purcellville, VA</a></li>
          <li><a href="mclean.html">Luxury detailing in McLean, VA</a></li>
          <li><a href="great-falls.html">Estate detailing in Great Falls, VA</a></li>
          <li><a href="vienna.html">Mobile detailing in Vienna, VA</a></li>
          <li><a href="reston.html">Car detailing in Reston, VA</a></li>
          <li><a href="herndon.html">Auto detailing in Herndon, VA</a></li>
          <li><a href="warrenton.html">Mobile detailing in Warrenton, VA</a></li>
          <li><a href="upperville.html">Car detailing in Upperville, VA</a></li>
          <li><a href="the-plains.html">Mobile detailing in The Plains, VA</a></li>`;

let updated = 0;
for (const file of files) {
  const filepath = path.join(DIR, file);
  if (!fs.existsSync(filepath)) { console.log(`SKIP: ${file} not found`); continue; }

  let content = fs.readFileSync(filepath, 'utf8');
  const orig = content;

  content = content.replace(OLD_CSS, NEW_CSS);
  content = content.replace(OLD_DESKTOP_NAV, NEW_DESKTOP_NAV);
  content = content.replace(OLD_MOBILE_NAV, NEW_MOBILE_NAV);
  content = content.replace(OLD_FOOTER, NEW_FOOTER);

  if (content !== orig) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`UPDATED: ${file}`);
    updated++;
  } else {
    console.log(`NO CHANGE: ${file}`);
  }
}
console.log(`\nDone. ${updated}/${files.length} files updated.`);
