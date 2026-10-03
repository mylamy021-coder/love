// node build.js -> posts/index.json + p/<id>.html (share card-er jonno OG meta shoho)
const fs = require('fs');

const readJSON = file => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { console.error(`\nERROR: ${file} e JSON bhul ache -> ${e.message}\n(comma, quote ba bracket check koro)`); process.exit(1); }
};

const site = readJSON('site.json');
site.siteUrl = String(site.siteUrl || '').replace(/\/+$/, '');   // shesh-er "/" bad
if (!site.siteUrl || site.siteUrl.includes('REPO-NAME'))
  console.warn('WARN: site.json e siteUrl thik koro, noile share card kaj korbe na.');
if (site.defaultCard && !fs.existsSync(site.defaultCard))
  console.warn(`WARN: ${site.defaultCard} nei. Photo chhara post share korle card ashbe na.`);

const num = f => parseInt(f.match(/\d+/)[0], 10);
const ids = fs.readdirSync('posts').filter(f => /^post\d+\.json$/.test(f))
  .sort((a, b) => num(b) - num(a)).map(f => f.replace('.json', ''));   // notun post age
fs.writeFileSync('posts/index.json', JSON.stringify(ids));

fs.rmSync('p', { recursive: true, force: true });   // purono/deleted post-er page jeno na thake
fs.mkdirSync('p', { recursive: true });

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const abs = u => /^https?:/.test(u) ? u : `${site.siteUrl}/${encodeURI(u.replace(/^\.?\//, ''))}`;

for (const id of ids) {
  const p = readJSON(`posts/${id}.json`);
  const title = p.title || site.title;
  const desc = (p.body || []).filter(l => !/^dear/i.test(l)).join(' ').slice(0, 200) || site.subtitle || '';
  const img = abs(p.image || site.defaultCard);
  const url = `${site.siteUrl}/p/${id}.html`;
  if (p.image && !/^https?:/.test(p.image) && !fs.existsSync(p.image))
    console.warn(`WARN: ${id}: image "${p.image}" file paoa jay nai.`);
  fs.writeFileSync(`p/${id}.html`, `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${esc(title)}</title>
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:url" content="${esc(url)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
<script>location.replace('../index.html#${id}')</script>
<noscript><meta http-equiv="refresh" content="0;url=../index.html#${id}"></noscript>
</head><body></body></html>`);
}
console.log(`Built ${ids.length} posts`);
