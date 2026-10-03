// node build.js -> posts/index.json + p/<id>.html (share card-er jonno OG meta shoho)
const fs = require('fs');
const site = JSON.parse(fs.readFileSync('site.json', 'utf8'));
const num = f => parseInt(f.match(/\d+/)[0], 10);
const ids = fs.readdirSync('posts').filter(f => /^post\d+\.json$/.test(f))
  .sort((a, b) => num(b) - num(a)).map(f => f.replace('.json', ''));   // notun post age
fs.writeFileSync('posts/index.json', JSON.stringify(ids));
fs.mkdirSync('p', { recursive: true });

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const abs = u => /^https?:/.test(u) ? u : `${site.siteUrl}/${u.replace(/^\.?\//, '')}`;

for (const id of ids) {
  const p = JSON.parse(fs.readFileSync(`posts/${id}.json`, 'utf8'));
  const title = p.title || site.title;
  const desc = (p.body || []).filter(l => !/^dear/i.test(l)).join(' ').slice(0, 200) || site.subtitle;
  const img = abs(p.image || site.defaultCard);
  const url = `${site.siteUrl}/p/${id}.html`;
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
