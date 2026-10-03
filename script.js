// ---- Supabase config (anon key public hoy, RLS diye protected) ----
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';
const db = (window.supabase && !SUPABASE_URL.includes('YOUR-'))
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const $ = id => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
let site;

async function init(){
  try{
    site = await (await fetch('site.json')).json();
    renderHeader(site);
    const ids = await (await fetch('posts/index.json')).json();
    const posts = await Promise.all(ids.map(async id => ({ id, ...(await (await fetch(`posts/${id}.json`)).json()) })));
    posts.forEach(renderPost);
    $('end').textContent = site.ending || '';
  }catch(e){
    $('feed').textContent = 'Load hoy nai. "node build.js" chalaw, tarpor local server (python3 -m http.server) diye kholo.';
  }
  await (document.fonts ? document.fonts.ready : Promise.resolve());
  requestAnimationFrame(() => document.body.classList.add('ready'));
  const t = location.hash && document.querySelector(location.hash.replace(/[^#\w-]/g,''));
  if (t){ t.classList.add('target'); setTimeout(() => t.scrollIntoView({block:'center'}), 600); }
}

function renderHeader(s){
  document.title = s.title;
  $('credit').textContent = s.credit || '';
  $('title').textContent = s.title;
  $('subtitle').textContent = s.subtitle || '';
  (s.decor || []).forEach(o => {
    const img = new Image(); img.src = o.src; img.alt = '';
    if (o.polaroid) img.className = 'polaroid';
    img.style.width = o.width || '200px';
    ['top','left','right'].forEach(k => { if (o[k]) img.style[k] = o[k]; });
    img.style.transform = `rotate(${o.rotate || 0}deg)`;
    img.onerror = () => img.remove();
    $('decor').appendChild(img);
  });
}

function renderPost(p){
  const art = el('article', 'post'); art.id = p.id;
  const meta = el('div', 'meta');
  meta.append(el('div', 'avatar', (site.author || 'H')[0]));
  const who = el('div', 'who', site.author || '');
  who.append(el('span', 'when', [p.place, p.date].filter(Boolean).join(' · ')));
  meta.append(who); art.append(meta);

  const text = el('div', 'text');
  (p.body || []).forEach(t => text.append(el('p', '', t)));
  art.append(text);
  if (p.image){
    const img = el('img', 'photo'); img.src = p.image; img.alt = ''; img.loading = 'lazy';
    img.onerror = () => img.remove(); art.append(img);
  }
  if (p.sign) art.append(el('div', 'sign', p.sign));

  const act = el('div', 'actions');
  const cBtn = el('button', '', 'Comment'); cBtn.type = 'button';
  act.append(cBtn);
  const url = `${site.siteUrl}/p/${p.id}.html`;
  const share = (label, href, blank=true) => {
    const b = el('button', '', label); b.type = 'button';
    b.onclick = () => window.open(href, '_blank', 'noopener,width=600,height=500'); act.append(b);
  };
  share('Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  share('Twitter', `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`);
  const cp = el('button', '', 'Copy link'); cp.type = 'button';
  cp.onclick = async () => { try{ await navigator.clipboard.writeText(url); cp.textContent = 'Copied'; setTimeout(() => cp.textContent = 'Copy link', 1500); }catch{} };
  act.append(cp); art.append(act);

  const box = el('div', 'comments'); art.append(box);
  let loaded = false;
  cBtn.onclick = () => {
    art.classList.toggle('open');
    if (art.classList.contains('open') && !loaded){ loaded = true; setupComments(p.id, box); }
  };
  $('feed').append(art);
}

async function setupComments(postId, box){
  const list = el('div'); box.append(list);
  const addOne = c => {
    const d = el('div', 'c'); const h = el('div');
    h.append(el('b', '', c.name), el('small', '', new Date(c.created_at).toLocaleString()));
    d.append(h, el('p', '', c.body)); list.append(d);
  };
  if (!db){ list.append(el('p', 'note', 'Comment ekhono connect kora hoy nai (Supabase key dao).')); return; }
  const { data, error } = await db.from('comments').select('*').eq('post_id', postId).order('created_at');
  if (error) list.append(el('p', 'note', 'Comment load hoy nai.'));
  else if (!data.length) list.append(el('p', 'note', 'Ekhono kono comment nei.'));
  (data || []).forEach(addOne);

  const f = el('form', 'cform');
  const name = el('input'); name.placeholder = 'Tomar nam'; name.maxLength = 40; name.required = true;
  name.value = localStorage.getItem('cname') || '';
  const body = el('textarea'); body.placeholder = 'Comment likho...'; body.maxLength = 500; body.rows = 3; body.required = true;
  const btn = el('button', '', 'Post'); btn.type = 'submit';
  const msg = el('div', 'note');
  f.append(name, body, btn, msg); box.append(f);
  f.onsubmit = async e => {
    e.preventDefault();
    const last = +localStorage.getItem('clast') || 0;
    if (Date.now() - last < 30000){ msg.textContent = 'Ektu opekkha koro, 30 second por abar try koro.'; return; }
    btn.disabled = true;
    const row = { post_id: postId, name: name.value.trim(), body: body.value.trim() };
    const { data: ins, error } = await db.from('comments').insert(row).select().single();
    btn.disabled = false;
    if (error){ msg.textContent = 'Comment jay nai, abar chesta koro.'; return; }
    localStorage.setItem('clast', Date.now()); localStorage.setItem('cname', row.name);
    if (list.querySelector('.note')) list.innerHTML = '';
    addOne(ins); body.value = ''; msg.textContent = '';
  };
}
init();
