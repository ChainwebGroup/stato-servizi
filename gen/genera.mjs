// Versione statica: GitHub Actions ogni 5 minuti verifica i servizi, aggiorna lo storico di 24 ore
// e genera le pagine HTML, pubblicate su Cloudflare Pages. Lo storico precedente si legge dal sito stesso.
import { SERVIZI, CATEGORIE, CONSIGLI } from '../src/servizi.js';
import { layout, linea, icona, pill, esc, host, tono, bloccoChainweb, oraIt, DATAORA, sec } from '../src/index.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT = process.argv[2] || 'out';
const SITO = process.env.SITO || 'https://stato-servizi.pages.dev';
const BASE = process.env.BASE_URL || SITO;
const ORA_MS = 3600000;
const GIORNO = 24 * ORA_MS;
const QUARTO = 15 * 60000;
const PER_ID = Object.fromEntries(SERVIZI.map((s) => [s.id, s]));

// ---------- storico ----------
let storico = {};
if (process.env.STORICO_VUOTO !== '1') {
  try {
    const r = await fetch(`${SITO}/storico.json?t=${Date.now()}`, { signal: AbortSignal.timeout(15000) });
    if (r.ok) storico = await r.json();
  } catch {}
}

const MANUT = /manutenzion|non (è )?disponibil|temporaneamente|maintenance|unavailable|errore|error 5\d\d|\b50[234]\b/i;
const MANUT_TESTO = /(servizio|sito|portale|applicazione)[^<]{0,40}(temporaneamente )?(non disponibile|in manutenzione|sospeso)|we('| a)re (currently )?(down for )?maintenance/i;

async function prova(s) {
  const t0 = Date.now();
  try {
    const r = await fetch(s.check || s.url, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; StatoServiziItalia/1.0)', accept: 'text/html,application/json' },
    });
    const ms = Date.now() - t0;
    const tipo = r.headers.get('content-type') || '';
    if (r.status === 200 && (s.attendi || tipo.includes('html'))) {
      let testo = '';
      try { testo = (await r.text()).slice(0, 300000); } catch {}
      // il server risponde ma non con quello che deve (es. il ping dell'app IO deve dire "ok")
      if (s.attendi && !testo.trim().toLowerCase().startsWith(s.attendi)) return { ok: 0, c: r.status, ms, x: 'risposta inattesa' };
      // pagina di manutenzione o di errore servita come pagina normale
      const titolo = (testo.match(/<title[^>]*>([\s\S]{0,200}?)<\/title>/i) || [])[1] || '';
      if (MANUT.test(titolo) || MANUT_TESTO.test(testo.slice(0, 20000))) return { ok: 1, c: r.status, ms, m: 1 };
      return { ok: 1, c: r.status, ms };
    }
    try { await r.body?.cancel(); } catch {}
    return { ok: r.status < 500 ? 1 : 0, c: r.status, ms };
  } catch {
    return { ok: 0, c: 0, ms: Date.now() - t0 };
  }
}

// una seconda prova dopo 3 s prima di segnare un errore
async function controlla(s) {
  const r = await prova(s);
  if (r.ok) return r;
  await new Promise((f) => setTimeout(f, 3000));
  return prova(s);
}

// al massimo 8 verifiche insieme: tutte in parallelo si accodano e falsano i tempi
async function aGruppi(lista, fn, n = 8) {
  const out = new Array(lista.length);
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < lista.length) { const k = i++; out[k] = await fn(lista[k]); }
  }));
  return out;
}

const TRADUZIONI = {
  'all systems operational': 'Tutti i sistemi operativi',
  'partial system degradation': 'Degrado parziale dei sistemi',
  'minor service outage': 'Disservizio minore',
  'partial system outage': 'Interruzione parziale',
  'major service outage': 'Disservizio grave',
  'major system outage': 'Interruzione grave',
  'service under maintenance': 'Manutenzione in corso',
};
const traduci = (t) => TRADUZIONI[(t || '').trim().toLowerCase()] || t;

// avvisi ufficiali pubblicati dai servizi stessi
async function avviso(s) {
  const u = s.ufficiale;
  try {
    const get = (url) => fetch(url, { signal: AbortSignal.timeout(10000), headers: { accept: 'application/json' } }).then((r) => r.json());
    if (u.tipo === 'statuspage') {
      const j = await get(`${u.url}/api/v2/status.json`);
      const ind = j.status?.indicator || 'none';
      if (ind === 'none') return { livello: 'ok', testo: traduci(j.status?.description) || 'Tutti i sistemi operativi', link: u.url };
      return { livello: ind === 'minor' ? 'minore' : 'grave', testo: traduci(j.status?.description) || 'Disservizio in corso', link: u.url };
    }
    if (u.tipo === 'stripe') {
      const j = await get(`${u.url}/current`);
      const giu = Object.entries(j.statuses || {}).filter(([, v]) => v !== 'up');
      if (!giu.length) return { livello: 'ok', testo: 'Tutti i sistemi operativi', link: u.url };
      return { livello: giu.some(([, v]) => v === 'down') ? 'grave' : 'minore', testo: 'Problemi su: ' + giu.map(([k]) => k).join(', '), link: u.url };
    }
    if (u.tipo === 'google') {
      const j = await get('https://www.google.com/appsstatus/dashboard/incidents.json');
      const aperti = j.filter((i) => !i.end && (i.service_name === u.prodotto || (i.affected_products || []).some((p) => p.title === u.prodotto)));
      if (!aperti.length) return { livello: 'ok', testo: 'Nessun incidente aperto', link: u.url };
      const grave = aperti.some((i) => (i.severity || '').toLowerCase() === 'high');
      return { livello: grave ? 'grave' : 'minore', testo: (aperti[0].external_desc || 'Incidente in corso').replace(/\s+/g, ' ').slice(0, 160), link: u.url };
    }
  } catch {}
  return null;
}

const ora = Date.now();
const avvisi = Object.fromEntries(await Promise.all(SERVIZI.filter((s) => s.ufficiale).map(async (s) => [s.id, await avviso(s)])));
const ris = await aGruppi(SERVIZI, controlla);
SERVIZI.forEach((s, i) => {
  const a = (storico[s.id] || []).filter((p) => p.t > ora - GIORNO);
  a.push({ t: ora, ...ris[i] });
  storico[s.id] = a;
});

// ---------- stato ----------
function stato(a, uff) {
  const u = a[a.length - 1];
  let err = 0;
  for (let i = a.length - 1; i >= 0 && !a[i].ok; i--) err++;
  if (err >= 2) return { k: 'giu', t: 'Il sito non risponde' };
  if (uff?.livello === 'grave') return { k: 'problemi', t: 'Disservizio confermato dal servizio' };
  if (err === 1) return { k: 'dubbio', t: 'Verifica in corso' };
  if (uff?.livello === 'minore') return { k: 'parziale', t: 'Disservizio parziale segnalato dal servizio' };
  if (u.m && a.slice(-2).every((p) => p.m)) return { k: 'manut', t: 'Pagina di manutenzione o di errore' };
  const lenti = a.slice(-2).every((p) => p.ms > 5000);
  if (lenti && a.length >= 2) return { k: 'lento', t: 'Risponde lentamente' };
  return { k: 'ok', t: 'Nessun problema rilevato' };
}

// tempo di risposta: finestra di 24 ore, o dalla prima verifica se lo storico è più corto.
// Una verifica fallita vale 10 s. Con più verifiche che punti si tiene il valore peggiore per tratto.
function inizioDi(a) { return Math.max(ora - GIORNO, a[0].t); }
function serie(a, punti) {
  const inizio = inizioDi(a);
  const pts = a.filter((p) => p.t >= inizio);
  const val = (p) => (p.ok ? p.ms : 10000);
  if (pts.length <= punti) {
    const v = pts.map(val);
    return v.length === 1 ? [v[0], v[0]] : v;
  }
  const span = Math.max(ora - inizio, 1);
  const v = new Array(punti).fill(null);
  for (const p of pts) {
    const q = Math.min(punti - 1, Math.floor(((p.t - inizio) / span) * punti));
    v[q] = v[q] == null ? val(p) : Math.max(v[q], val(p));
  }
  let prec = v.find((x) => x != null);
  return v.map((x) => (x == null ? prec : (prec = x)));
}

const tutti = SERVIZI.map((s) => {
  const a = storico[s.id];
  return { s, a, u: a[a.length - 1], uff: avvisi[s.id] || null, st: stato(a, avvisi[s.id]), v: serie(a, 96), vg: serie(a, 288), inizio: inizioDi(a), falliti: a.filter((p) => !p.ok) };
});

// Linea dell'intestazione: tempo medio di risposta di tutti i servizi a ogni giro di verifiche (dati reali).
function lineaTesta() {
  const giri = new Map();
  for (const x of tutti) for (const p of x.a) {
    if (p.t < ora - GIORNO) continue;
    const o = giri.get(p.t) || { s: 0, n: 0, f: 0 };
    if (p.ok) { o.s += p.ms; o.n++; } else o.f++;
    giri.set(p.t, o);
  }
  let pts = [...giri.entries()].sort((a, b) => a[0] - b[0]).map(([t, o]) => ({ t, v: o.n ? o.s / o.n : 10000, f: o.f }));
  if (!pts.length) return { d: '', inizio: ora, tono: 'ok' };
  const inizio = pts[0].t;
  if (pts.length > 96) {
    const span = Math.max(ora - inizio, 1), v = new Array(96).fill(null);
    for (const p of pts) { const q = Math.min(95, Math.floor(((p.t - inizio) / span) * 96)); v[q] = v[q] == null || p.v > v[q].v ? p : v[q]; }
    pts = v.filter(Boolean);
  }
  if (pts.length === 1) pts = [pts[0], pts[0]];
  // tempi normali (fino a 3 s) restano nella fascia bassa, sotto i testi; solo un rallentamento vero sale verso l'alto
  const X = (i) => -10 + (i / (pts.length - 1)) * 1220;
  const Y = (v) => (v <= 3000 ? 390 - (v / 3000) * 38 : 352 - Math.min((v - 3000) / 7000, 1) * 312);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p.v).toFixed(1)).join(' ');
  const ultimo = pts[pts.length - 1];
  return { d, inizio, tono: ultimo.f >= 3 ? 'bad' : 'ok', media: ultimo.v };
}

// ---------- pagine ----------
function riga(x) {
  const t = tono(x.st.k);
  const nota = t === 'ok' ? '' : `<small class="${t}">${esc(x.st.t)}</small>`;
  return `<a class="riga" href="/s/${x.s.id}/" data-nome="${esc((x.s.nome + ' ' + host(x.s.url)).toLowerCase())}">
  <span class="r-nome">${esc(x.s.nome)}${nota}</span>${icona(t)}${linea(x.v, t, 300, 60, 4000)}
</a>`;
}

function home() {
  const lt = lineaTesta();
  const problemi = tutti.filter((x) => ['giu', 'lento', 'dubbio', 'manut', 'problemi', 'parziale'].includes(x.st.k));
  const caldi = problemi.length ? `<section class="cat" data-cat><h2>Ora sotto osservazione</h2><div class="lista">${problemi.map(riga).join('')}</div></section>` : '';
  const sezioni = caldi + CATEGORIE.map((c) => {
    const items = tutti.filter((x) => x.s.cat === c.id);
    return `<section class="cat" id="${c.id}" data-cat><h2>${esc(c.nome)}</h2><div class="lista">${items.map(riga).join('')}</div></section>`;
  }).join('');
  const giu = tutti.filter((x) => x.st.k === 'giu');
  const strip = giu.length
    ? `<div class="alert"><strong>Non rispondono adesso:</strong> ${giu.map((x) => `<a href="/s/${x.s.id}/">${esc(x.s.nome)}</a>`).join(', ')}</div>`
    : `<div class="alert calm">Tutti i ${SERVIZI.length} servizi controllati rispondono.</div>`;
  const corpo = `
<section class="hero wrap">
  <div class="hero-top">
    <svg class="picco ${lt.tono}" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="gp" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" class="p0"/><stop offset="1" class="p1"/></linearGradient></defs><path d="${lt.d}" pathLength="1"/></svg>
    <h1>Cosa non funziona oggi in Italia?</h1>
    <p class="lead">SPID, INPS, pagoPA, PEC, banche, pagamenti e app: ogni 5 minuti verifichiamo se rispondono e quanto ci mettono.</p>
    <div class="numeri"><div><b>${SERVIZI.length}</b><span>servizi controllati</span></div><i></i><div><b>5 min</b><span>tra una verifica e l'altra</span></div></div>
    <p class="nota-linea">La linea è il tempo medio di risposta dei ${SERVIZI.length} servizi ${lt.inizio > ora - GIORNO + QUARTO ? `dalle ${oraIt(lt.inizio)}` : 'nelle ultime 24 ore'}: adesso ${sec(lt.media || 0)}.</p>
  </div>
  <div class="search"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><input id="cerca" type="search" placeholder="Cerca un servizio: INPS, SPID, Aruba PEC…" autocomplete="off"></div>
  <p class="muted small">Ultimo aggiornamento alle ${oraIt(ora)}</p>
  ${strip}
</section>
<div class="wrap">${sezioni}<p id="vuoto" class="muted" hidden>Nessun servizio trovato.</p></div>`;
  return piede(layout({
    titolo: 'Cosa non funziona oggi? SPID, INPS, PEC e app in tempo reale · Stato servizi Italia',
    descr: 'SPID, INPS, pagoPA, PEC, banche, operatori e app: verifichiamo ogni 5 minuti se rispondono. Stato in tempo reale e storico delle ultime 24 ore.',
    base: BASE, path: '/', corpo,
  }));
}

function pagina(x) {
  const { s, u, st, v, falliti } = x;
  const h = host(s.check || s.url);
  let spiega;
  if (st.k === 'giu') spiega = `${esc(h)} non risponde da più verifiche di fila (ultima alle ${oraIt(u.t)}).`;
  else if (st.k === 'dubbio') spiega = `L'ultima verifica di ${esc(h)} alle ${oraIt(u.t)} non ha avuto risposta. Ricontrolliamo tra 5 minuti.`;
  else if (st.k === 'problemi' || st.k === 'parziale') spiega = `Il servizio stesso segnala un disservizio: «${esc(x.uff.testo)}». Ultima nostra verifica alle ${oraIt(u.t)}.`;
  else if (st.k === 'manut') spiega = `${esc(h)} risponde, ma con una pagina di manutenzione o di errore (verifica delle ${oraIt(u.t)}).`;
  else if (st.k === 'lento') spiega = `${esc(h)} risponde, ma lentamente: ${sec(u.ms)} all'ultima verifica delle ${oraIt(u.t)}.`;
  else spiega = `Alle ${oraIt(u.t)} ${esc(h)} ha risposto in ${sec(u.ms)}. Un sito che risponde può comunque avere problemi di accesso o nell'app.`;
  const span = ora - x.inizio;
  const etich = [0, 1, 2, 3].map((k) => `<span style="left:${k * 25}%">${oraIt(x.inizio + (span * k) / 4)}</span>`).join('') + `<span style="right:0">ora</span>`;
  const parziale = x.inizio > ora - GIORNO + QUARTO;
  const listaGuasti = falliti.length
    ? `<ul class="log">${falliti.slice(-12).reverse().map((g) => `<li>${DATAORA.format(new Date(g.t))} · ${g.c ? 'codice ' + g.c : 'nessuna risposta'}</li>`).join('')}</ul>`
    : `<p class="muted">Nessuna verifica fallita nelle ultime 24 ore.</p>`;
  const consigli = (CONSIGLI[s.cat] || []).map((c) => `<li>${esc(c)}</li>`).join('');
  const stessi = SERVIZI.filter((t) => t.cat === s.cat && t.id !== s.id).map((t) => `<a href="/s/${t.id}/">${esc(t.nome)}</a>`).join('');
  const corpo = `
<div class="wrap narrow">
  <a class="back" href="/">← Tutti i servizi</a>
  <h1>${esc(s.nome)} non funziona?</h1>
  <p class="lead">Stato in tempo reale e storico delle ultime 24 ore.</p>
  <div class="big">
    <div class="big-top">${pill(st)}<span class="muted small">verificato alle ${oraIt(u.t)}</span></div>
    <p>${spiega}</p>
    <p class="muted small">Cosa controlliamo: ${esc(s.cosa || 'la pagina principale del servizio')}${s.ufficiale ? ', e gli avvisi pubblicati dal servizio stesso' : ''}.</p>
    ${x.uff ? `<div class="ufficiale ${x.uff.livello}"><strong>Stato ufficiale del servizio</strong><p>${esc(x.uff.testo)} · <a href="${x.uff.link}" rel="nofollow noopener">pagina di stato</a></p></div>` : ''}
  </div>
  <h2>Tempo di risposta${parziale ? ` dalle ${oraIt(x.inizio)}` : ', ultime 24 ore'}</h2>
  <div class="chart"><div class="chart-top muted small">Una verifica ogni 5 minuti · massimo ${sec(Math.max(...x.vg))}${parziale ? ' · lo storico si completa in 24 ore' : ''} · le verifiche fallite salgono a 10 s</div>${linea(x.vg, tono(st.k), 720, 180, 3000)}<div class="axis">${etich}</div></div>
  <h2>Verifiche non riuscite, ultime 24 ore</h2>
  ${listaGuasti}
  <h2>Cosa fare se ${esc(s.nome)} non funziona</h2>
  <ul class="tips">${consigli}</ul>
  ${bloccoChainweb()}
  <h2>Altri servizi della stessa categoria</h2>
  <div class="links">${stessi}</div>
</div>`;
  return piede(layout({
    titolo: `${s.nome} non funziona oggi? Stato in tempo reale · Stato servizi Italia`,
    descr: `${s.nome} è down? Ogni 5 minuti verifichiamo se ${h} risponde e quanto ci mette. Stato attuale e storico delle ultime 24 ore.`,
    base: BASE, path: `/s/${s.id}/`, corpo,
  }));
}

// Piede della versione statica: niente segnalazioni, quindi niente dati degli utenti.
function piede(html) {
  return html
    .replace(/<p>Ogni 5 minuti controlliamo[\s\S]*?<\/p>/, "<p>Ogni 5 minuti controlliamo se il sito di ciascun servizio risponde e in quanto tempo. Un sito che risponde può comunque avere problemi di accesso o nell'app. Non siamo affiliati ai servizi elencati: i nomi appartengono ai rispettivi titolari.</p>")
    .replace(/<p>Privacy:[\s\S]*?<\/p>/, '<p>Privacy: niente cookie, niente pubblicità, nessun dato dei visitatori salvato.</p>');
}

// ---------- scrittura ----------
async function scrivi(rel, testo) {
  const p = path.join(OUT, rel);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, testo);
}
await fs.rm(OUT, { recursive: true, force: true });
await scrivi('index.html', home());
for (const x of tutti) await scrivi(`s/${x.s.id}/index.html`, pagina(x));
await scrivi('storico.json', JSON.stringify(storico));
await scrivi('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
await scrivi('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', ...SERVIZI.map((s) => `/s/${s.id}/`)].map((p) => `<url><loc>${BASE}${p}</loc><changefreq>hourly</changefreq></url>`).join('')}</urlset>`);
await scrivi('_headers', `/*\n  Cache-Control: public, max-age=60\n/storico.json\n  Cache-Control: no-store\n`);
await scrivi('404.html', piede(layout({ titolo: 'Pagina non trovata · Stato servizi Italia', descr: '', base: BASE, path: '/', corpo: '<div class="wrap narrow"><h1>Pagina non trovata</h1><p><a href="/">Torna a tutti i servizi</a></p></div>' })));
const giu = tutti.filter((x) => x.st.k !== 'ok').map((x) => `${x.s.id}:${x.st.k}`);
console.log(`ok ${SERVIZI.length} servizi, problemi: ${giu.join(', ') || 'nessuno'}`);
