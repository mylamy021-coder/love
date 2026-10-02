async function init(){
  try{
    const res = await fetch('letters.json');
    const data = await res.json();
    render(data);
  }catch(e){
    document.getElementById('letters').textContent =
      'letters.json load hoy nai. Local server diye chalao (python3 -m http.server).';
  }
  // wait for images + fonts, then fade everything in slowly
  await (document.fonts ? document.fonts.ready : Promise.resolve());
  requestAnimationFrame(() => document.body.classList.add('ready'));
}

function render(d){
  document.title = d.title;
  document.getElementById('credit').innerHTML = (d.credit || '').replace(/\n/g,'<br>');
  document.getElementById('title').textContent = d.title;
  document.getElementById('subtitle').textContent = d.subtitle || '';
  document.getElementById('end').textContent = d.ending || '';

  // decorative images from JSON
  const decor = document.getElementById('decor');
  (d.decor || []).forEach(o => {
    const img = new Image();
    img.src = o.src;
    img.alt = '';
    if (o.polaroid) img.className = 'polaroid';
    img.style.width = o.width || '200px';
    ['top','left','right'].forEach(k => { if (o[k] !== undefined) img.style[k] = o[k]; });
    img.style.transform = `rotate(${o.rotate || 0}deg)`;
    img.onerror = () => img.remove();   // missing image = skip silently
    decor.appendChild(img);
  });

  // letters, newest first or as written in the file
  const wrap = document.getElementById('letters');
  const list = d.newestFirst ? [...d.letters].reverse() : d.letters;
  list.forEach(l => {
    const art = document.createElement('article');
    art.className = 'letter';
    if (l.place){ const p=document.createElement('div'); p.className='place'; p.textContent=l.place; art.appendChild(p); }
    const dt=document.createElement('div'); dt.className='date'; dt.textContent=l.date; art.appendChild(dt);
    l.body.forEach(t => { const p=document.createElement('p'); p.className='line'; p.textContent=t; art.appendChild(p); });
    if (l.sign){ const s=document.createElement('div'); s.className='sign'; s.textContent=l.sign; art.appendChild(s); }
    wrap.appendChild(art);
  });
}
init();
