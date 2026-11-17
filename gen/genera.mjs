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

async function prova(s) {
  const t0 = Date.now();
  try {
    const r = await fetch(s.url, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; StatoServiziItalia/1.0)', accept: 'text/html' },
    });
    try { await r.body?.cancel(); } catch {}
    return { ok: r.status < 500 ? 1 : 0, c: r.status, ms: Date.now() - t0 };
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

const ora = Date.now();
const ris = await aGruppi(SERVIZI, controlla);
SERVIZI.forEach((s, i) => {
  const a = (storico[s.id] || []).filter((p) => p.t > ora - GIORNO);
  a.push({ t: ora, ...ris[i] });
  storico[s.id] = a;
});

// ---------- stato ----------
function stato(a) {
  const u = a[a.length - 1];
  let err = 0;
  for (let i = a.length - 1; i >= 0 && !a[i].ok; i--) err++;
  if (err >= 2) return { k: 'giu', t: 'Il sito non risponde' };
  if (err === 1) return { k: 'dubbio', t: 'Verifica in corso' };
  const lenti = a.slice(-2).every((p) => p.ms > 5000);
  if (lenti && a.length >= 2) return { k: 'lento', t: 'Risponde lentamente' };
  return { k: 'ok', t: 'Nessun problema rilevato' };
}

// tempo di risposta per quarto d'ora (96 punti); una verifica fallita vale 10 s
function serie(a) {
  const v = new Array(96).fill(null);
  const da = ora - GIORNO;
  for (const p of a) {
    const q = Math.min(95, Math.floor((p.t - da) / QUARTO));
    if (q < 0) continue;
    const val = p.ok ? p.ms : 10000;
    v[q] = v[q] == null ? val : Math.max(v[q], val);
  }
  const primo = v.find((x) => x != null) ?? 0;
  let prec = primo;
  return v.map((x) => (x == null ? prec : (prec = x)));
}

const tutti = SERVIZI.map((s) => {
  const a = storico[s.id];
  return { s, a, u: a[a.length - 1], st: stato(a), v: serie(a), falliti: a.filter((p) => !p.ok) };
});

// ---------- pagine ----------
function riga(x) {
  const t = tono(x.st.k);
  const nota = t === 'ok' ? '' : `<small class="${t}">${esc(x.st.t)}</small>`;
  return `<a class="riga" href="/s/${x.s.id}/" data-nome="${esc((x.s.nome + ' ' + host(x.s.url)).toLowerCase())}">
  <span class="r-nome">${esc(x.s.nome)}${nota}</span>${icona(t)}${linea(x.v, t, 300, 60, 3000)}
</a>`;
}

function home() {
  const problemi = tutti.filter((x) => ['giu', 'lento', 'dubbio'].includes(x.st.k));
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
    <svg class="picco" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="gp" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8AB4F8" stop-opacity=".55"/><stop offset=".78" stop-color="#8AB4F8"/><stop offset=".9" stop-color="#F87171"/><stop offset="1" stop-color="#F87171"/></linearGradient></defs><path d="M-10 352 L40 372 L120 344 L205 360 L290 336 L380 364 L470 342 L560 356 L650 346 L740 352 L830 349 L905 351 L980 318 L1040 250 L1080 110 L1120 40 L1210 -30" pathLength="1"/></svg>
    <h1>Cosa non funziona oggi in Italia?</h1>
    <p class="lead">SPID, INPS, pagoPA, PEC, banche, pagamenti e app: ogni 5 minuti verifichiamo se rispondono e quanto ci mettono.</p>
    <div class="numeri"><div><b>${SERVIZI.length}</b><span>servizi controllati</span></div><i></i><div><b>5 min</b><span>tra una verifica e l'altra</span></div></div>
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
  const h = host(s.url);
  let spiega;
  if (st.k === 'giu') spiega = `${esc(h)} non risponde da più verifiche di fila (ultima alle ${oraIt(u.t)}).`;
  else if (st.k === 'dubbio') spiega = `L'ultima verifica di ${esc(h)} alle ${oraIt(u.t)} non ha avuto risposta. Ricontrolliamo tra 5 minuti.`;
  else if (st.k === 'lento') spiega = `${esc(h)} risponde, ma lentamente: ${sec(u.ms)} all'ultima verifica delle ${oraIt(u.t)}.`;
  else spiega = `Alle ${oraIt(u.t)} ${esc(h)} ha risposto in ${sec(u.ms)}. Un sito che risponde può comunque avere problemi di accesso o nell'app.`;
  const etich = [0, 6, 12, 18].map((i) => `<span style="left:${(i / 24) * 100}%">${oraIt(ora - (24 - i) * ORA_MS)}</span>`).join('') + `<span style="right:0">ora</span>`;
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
  </div>
  <h2>Tempo di risposta, ultime 24 ore</h2>
  <div class="chart"><div class="chart-top muted small">Ogni 15 minuti · le verifiche fallite salgono a 10 s</div>${linea(v, tono(st.k), 720, 180, 3000)}<div class="axis">${etich}</div></div>
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
