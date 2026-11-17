import { SERVIZI, CATEGORIE, CONSIGLI } from './servizi.js';
import { LOGO_CW } from './logo.js';

const PER_ID = Object.fromEntries(SERVIZI.map((s) => [s.id, s]));
const ORA_MS = 3600000;
export const UTM = 'utm_source=stato-servizi&utm_medium=referral&utm_campaign=stato-servizi';
export const CONTINUITA = `https://chainweb.solutions/it/continuita-operativa?${UTM}`;

export default {
  async scheduled(event, env, ctx) {
    const gruppo = event.cron && event.cron.startsWith('2-') ? 1 : 0;
    await controllaGruppo(env, gruppo);
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const base = env.BASE_URL || url.origin;
    try {
      if (url.pathname === '/api/segnala' && request.method === 'POST') return segnala(request, env);
      if (url.pathname === '/api/stato') return json(await statoTutti(env));
      if (url.pathname === '/robots.txt') return testo(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
      if (url.pathname === '/sitemap.xml') return sitemap(base);
      if (url.pathname === '/__controlla' && env.LOCALE === '1') {
        await controllaGruppo(env, 0);
        await controllaGruppo(env, 1);
        return testo('ok');
      }
      if (url.pathname === '/__prova' && env.LOCALE === '1') {
        const ids = (url.searchParams.get('id') || '').split(',');
        return json(await Promise.all(ids.filter((i) => PER_ID[i]).map(async (i) => ({ id: i, ...(await controlla(PER_ID[i])) }))));
      }
      if (url.pathname === '/') return html(await paginaHome(env, base));
      const m = url.pathname.match(/^\/s\/([a-z0-9-]+)\/?$/);
      if (m && PER_ID[m[1]]) return html(await paginaServizio(env, base, PER_ID[m[1]]));
      return html(pagina404(base), 404);
    } catch (e) {
      return html(layout({ titolo: 'Errore temporaneo', descr: '', base, path: '/', corpo: `<section class="wrap"><h1>Errore temporaneo</h1><p class="muted">Riprova tra un minuto.</p></section>` }), 500);
    }
  },
};

// ---------- Verifiche ----------

async function controlla(s) {
  const t0 = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const r = await fetch(s.url, {
      method: 'GET',
      redirect: 'manual',
      signal: ctrl.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; StatoServiziItalia/1.0)', accept: 'text/html' },
    });
    try { await r.body?.cancel(); } catch {}
    return { ok: r.status < 500, codice: r.status, ms: Date.now() - t0 };
  } catch (e) {
    const err = String((e && e.message) || e);
    // Il runtime non riesce a leggere la risposta (intestazioni non standard): non è un guasto del servizio.
    if (/internal error/i.test(err)) return { ok: true, codice: -1, ms: Date.now() - t0, err };
    return { ok: false, codice: 0, ms: Date.now() - t0, err };
  } finally {
    clearTimeout(timer);
  }
}

async function controllaGruppo(env, gruppo) {
  const lista = SERVIZI.filter((s) => s.gruppo === gruppo);
  const ora = Date.now();
  const ris = await Promise.all(lista.map(controlla));
  const st = [];
  lista.forEach((s, i) => {
    const r = ris[i];
    st.push(env.DB.prepare(
      `INSERT INTO ultimo (servizio, ts, ok, codice, ms, errori) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
       ON CONFLICT(servizio) DO UPDATE SET ts = excluded.ts, ok = excluded.ok, codice = excluded.codice, ms = excluded.ms,
       errori = CASE WHEN excluded.ok = 1 THEN 0 ELSE ultimo.errori + 1 END`
    ).bind(s.id, ora, r.ok ? 1 : 0, r.codice, r.ms, r.ok ? 0 : 1));
    if (!r.ok) st.push(env.DB.prepare('INSERT INTO guasti (servizio, ts, codice, ms) VALUES (?1, ?2, ?3, ?4)').bind(s.id, ora, r.codice, r.ms));
  });
  if (gruppo === 0 && new Date(ora).getUTCMinutes() < 5) {
    const limite = ora - 7 * 24 * ORA_MS;
    st.push(env.DB.prepare('DELETE FROM guasti WHERE ts < ?1').bind(limite));
    st.push(env.DB.prepare('DELETE FROM segnalazioni WHERE ts < ?1').bind(limite));
  }
  await env.DB.batch(st);
}

// ---------- Segnalazioni ----------

async function sha256(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

async function segnala(request, env) {
  let id = '';
  try { id = (await request.json()).id; } catch {}
  if (!PER_ID[id]) return json({ ok: false }, 400);
  const ip = request.headers.get('cf-connecting-ip') || 'locale';
  const giorno = new Date().toISOString().slice(0, 10);
  const impronta = (await sha256(`${env.SALE}|${giorno}|${ip}`)).slice(0, 32);
  const ora = Date.now();
  const gia = await env.DB.prepare('SELECT 1 FROM segnalazioni WHERE servizio = ?1 AND impronta = ?2 AND ts > ?3 LIMIT 1')
    .bind(id, impronta, ora - 30 * 60000).first();
  const tante = await env.DB.prepare('SELECT COUNT(*) AS n FROM segnalazioni WHERE impronta = ?1 AND ts > ?2')
    .bind(impronta, ora - ORA_MS).first();
  if (!gia && (tante?.n || 0) < 10) {
    await env.DB.prepare('INSERT INTO segnalazioni (servizio, ts, impronta) VALUES (?1, ?2, ?3)').bind(id, ora, impronta).run();
  }
  const n = await env.DB.prepare('SELECT COUNT(*) AS n FROM segnalazioni WHERE servizio = ?1 AND ts > ?2').bind(id, ora - ORA_MS).first();
  return json({ ok: true, n: n?.n || 0 });
}

// ---------- Stato ----------

async function statoTutti(env) {
  const ora = Date.now();
  const da = ora - 24 * ORA_MS;
  const [ult, ore] = await env.DB.batch([
    env.DB.prepare('SELECT * FROM ultimo'),
    env.DB.prepare('SELECT servizio, CAST((ts - ?1) / 900000 AS INTEGER) AS q, COUNT(*) AS n FROM segnalazioni WHERE ts > ?1 GROUP BY servizio, q').bind(da),
  ]);
  const ultimo = Object.fromEntries(ult.results.map((r) => [r.servizio, r]));
  const serie = {};
  for (const r of ore.results) {
    (serie[r.servizio] ||= new Array(96).fill(0))[Math.min(95, r.q)] += r.n;
  }
  const ultimaOra = await env.DB.prepare('SELECT servizio, COUNT(*) AS n FROM segnalazioni WHERE ts > ?1 GROUP BY servizio').bind(ora - ORA_MS).all();
  const r1h = Object.fromEntries(ultimaOra.results.map((r) => [r.servizio, r.n]));
  return SERVIZI.map((s) => {
    const u = ultimo[s.id];
    const v = serie[s.id] || new Array(96).fill(0);
    const media = v.reduce((a, b) => a + b, 0) / 24;
    return { id: s.id, nome: s.nome, cat: s.cat, ultimo: u || null, serie: v, ultimaOra: r1h[s.id] || 0, stato: calcolaStato(u, r1h[s.id] || 0, media) };
  });
}

function calcolaStato(u, r1h, media) {
  if (u && u.errori >= 2) return { k: 'giu', t: 'Il sito non risponde' };
  if (r1h >= Math.max(5, 3 * media)) return { k: 'problemi', t: 'Molte segnalazioni' };
  if (u && u.errori === 1) return { k: 'dubbio', t: 'Verifica in corso' };
  if (r1h >= 2) return { k: 'alcune', t: 'Alcune segnalazioni' };
  if (!u) return { k: 'na', t: 'In attesa di verifica' };
  return { k: 'ok', t: 'Nessun problema rilevato' };
}

// ---------- Pagine ----------

export const ORARIO = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' });
export const DATAORA = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const oraIt = (ts) => ORARIO.format(new Date(ts));
export const sec = (ms) => (ms / 1000).toLocaleString('it-IT', { maximumFractionDigits: 2 }) + ' s';

export function esc(t) {
  return String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function host(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } }

export function tono(k) {
  return k === 'giu' || k === 'problemi' ? 'bad' : k === 'alcune' || k === 'dubbio' || k === 'lento' ? 'warn' : k === 'na' ? 'na' : 'ok';
}

// Linea delle segnalazioni (96 quarti d'ora = 24 ore), come i grafici di stato.
export function linea(v, t, w = 300, h = 60, minMax = 6) {
  const max = Math.max(...v, minMax);
  const n = v.length;
  const pts = v.map((y, i) => [(i / (n - 1)) * w, h - 3 - (y / max) * (h - 8)]);
  const d = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
  const gid = 'g' + Math.random().toString(36).slice(2, 8);
  return `<svg class="linea ${t}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s0"/><stop offset="1" class="s1"/></linearGradient></defs><path class="area" fill="url(#${gid})" d="${d} L${w} ${h} L0 ${h} Z"/><path class="tratto" d="${d}" vector-effect="non-scaling-stroke"/></svg>`;
}

export function icona(t) {
  const corpo = {
    ok: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.8"/>',
    warn: '<path d="M12 3.8l9 15.6H3z"/><path d="M12 9.8v4.2"/><path d="M12 16.9h.01"/>',
    bad: '<circle cx="12" cy="12" r="9"/><path d="M12 7.3v6"/><path d="M12 16.6h.01"/>',
    na: '<circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/>',
  }[t];
  return `<svg class="ic ${t}" viewBox="0 0 24 24" aria-hidden="true">${corpo}</svg>`;
}

export function pill(st) {
  return `<span class="pill ${st.k}"><span class="dot"></span>${esc(st.t)}</span>`;
}

function riga(x) {
  const s = PER_ID[x.id];
  const t = tono(x.stato.k);
  const nota = t === 'ok' || t === 'na' ? '' : `<small class="${t}">${esc(x.stato.t)}${x.ultimaOra ? ` · ${x.ultimaOra} in 1 ora` : ''}</small>`;
  return `<a class="riga" href="/s/${s.id}" data-nome="${esc((s.nome + ' ' + host(s.url)).toLowerCase())}">
  <span class="r-nome">${esc(s.nome)}${nota}</span>${icona(t)}${linea(x.serie, t)}
</a>`;
}

export function bloccoChainweb() {
  return `<section class="cw">
  <div><h2>Se si ferma un servizio da cui dipendi, quanto tempo resta ferma la tua azienda?</h2>
  <p>PEC, SPID, banca, gestionale: prima o poi qualcosa non risponde. Con un piano di continuità operativa sai cosa fare, chi chiamare e come lavorare nel frattempo.</p></div>
  <a class="btn" href="${CONTINUITA}">Il piano di continuità con Chainweb</a>
</section>`;
}

async function paginaHome(env, base) {
  const tutti = await statoTutti(env);
  const ultimoTs = Math.max(0, ...tutti.map((x) => x.ultimo?.ts || 0));
  const problemi = tutti.filter((x) => ['problemi', 'giu'].includes(x.stato.k));
  const somma = (v) => v.reduce((a, b) => a + b, 0);
  const caldi = tutti.filter((x) => somma(x.serie) > 0).sort((a, b) => b.ultimaOra - a.ultimaOra || somma(b.serie) - somma(a.serie)).slice(0, 8);
  const sezioneCaldi = caldi.length ? `<section class="cat" data-cat><h2>Più segnalati nelle ultime 24 ore</h2><div class="lista">${caldi.map(riga).join('')}</div></section>` : '';
  const sezioni = sezioneCaldi + CATEGORIE.map((c) => {
    const items = tutti.filter((x) => x.cat === c.id);
    return `<section class="cat" id="${c.id}" data-cat><h2>${esc(c.nome)}</h2><div class="lista">${items.map(riga).join('')}</div></section>`;
  }).join('');
  const strip = problemi.length
    ? `<div class="alert"><strong>Ora con problemi:</strong> ${problemi.map((x) => `<a href="/s/${x.id}">${esc(x.nome)}</a>`).join(', ')}</div>`
    : `<div class="alert calm">Nessun problema rilevato al momento sui ${SERVIZI.length} servizi controllati.</div>`;
  const corpo = `
<section class="hero wrap">
  <svg class="ecg" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true"><path class="ecg-base" d="M0 150 H430 L462 150 L486 84 L514 200 L544 36 L572 172 L596 150 H760 L780 150 L792 124 L806 168 L818 150 H1200"/><path class="ecg-run" d="M0 150 H430 L462 150 L486 84 L514 200 L544 36 L572 172 L596 150 H760 L780 150 L792 124 L806 168 L818 150 H1200"/></svg>
  <h1>Cosa non funziona oggi in Italia?</h1>
  <p class="lead">SPID, INPS, pagoPA, PEC, banche, operatori e app: ogni 5 minuti verifichiamo se rispondono, e qui vedi le segnalazioni di chi ha un problema adesso.</p>
  <div class="search"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><input id="cerca" type="search" placeholder="Cerca un servizio: INPS, SPID, Aruba PEC…" autocomplete="off"></div>
  <p class="muted small">${ultimoTs ? `Ultimo aggiornamento alle ${oraIt(ultimoTs)}` : 'Prime verifiche in corso'}</p>
  ${strip}
</section>
<div class="wrap">${sezioni}<p id="vuoto" class="muted" hidden>Nessun servizio trovato.</p></div>`;
  return layout({
    titolo: 'Cosa non funziona oggi? SPID, INPS, PEC e app in tempo reale · Stato servizi Italia',
    descr: 'SPID, INPS, pagoPA, PEC, banche, operatori e app: verifiche ogni 5 minuti e segnalazioni degli utenti in tempo reale.',
    base, path: '/', corpo,
  });
}

async function paginaServizio(env, base, s) {
  const tutti = await statoTutti(env);
  const x = tutti.find((t) => t.id === s.id);
  const u = x.ultimo;
  const ora = Date.now();
  const guasti = await env.DB.prepare('SELECT ts, codice, ms FROM guasti WHERE servizio = ?1 AND ts > ?2 ORDER BY ts DESC LIMIT 12')
    .bind(s.id, ora - 24 * ORA_MS).all();
  const h = host(s.url);
  let spiega;
  if (!u) spiega = `Le prime verifiche di ${esc(h)} sono in corso.`;
  else if (u.codice === -1) spiega = `Per questo servizio la verifica automatica non è disponibile: lo stato si basa sulle segnalazioni degli utenti.`;
  else if (u.errori >= 2) spiega = `${esc(h)} non risponde da ${u.errori} verifiche di fila (ultima alle ${oraIt(u.ts)}).`;
  else if (u.ok) spiega = `Alle ${oraIt(u.ts)} ${esc(h)} ha risposto in ${sec(u.ms)}. Un sito che risponde può comunque avere problemi di accesso o nell'app: se è il tuo caso, segnalalo.`;
  else spiega = `L'ultima verifica di ${esc(h)} alle ${oraIt(u.ts)} non ha avuto risposta. Ricontrolliamo tra 5 minuti.`;
  const etich = [0, 6, 12, 18].map((i) => `<span style="left:${(i / 24) * 100}%">${oraIt(ora - (24 - i) * ORA_MS)}</span>`).join('') + `<span style="right:0">ora</span>`;
  const picco = Math.max(...x.serie);
  const listaGuasti = guasti.results.length
    ? `<ul class="log">${guasti.results.map((g) => `<li>${DATAORA.format(new Date(g.ts))} · ${g.codice ? 'codice ' + g.codice : 'nessuna risposta'}</li>`).join('')}</ul>`
    : `<p class="muted">Nessuna verifica fallita nelle ultime 24 ore.</p>`;
  const consigli = (CONSIGLI[s.cat] || []).map((c) => `<li>${esc(c)}</li>`).join('');
  const stessi = SERVIZI.filter((t) => t.cat === s.cat && t.id !== s.id).map((t) => `<a href="/s/${t.id}">${esc(t.nome)}</a>`).join('');
  const corpo = `
<div class="wrap narrow">
  <a class="back" href="/">← Tutti i servizi</a>
  <h1>${esc(s.nome)} non funziona?</h1>
  <p class="lead">Stato in tempo reale e segnalazioni degli utenti.</p>
  <div class="big">
    <div class="big-top">${pill(x.stato)}<span class="muted small">${u ? 'verificato alle ' + oraIt(u.ts) : ''}</span></div>
    <p>${spiega}</p>
    <div class="big-act"><button class="btn" data-segnala="${s.id}">Ho un problema con ${esc(s.nome)}</button><span class="muted"><b data-conta="${s.id}">${x.ultimaOra}</b> segnalazioni nell'ultima ora</span></div>
  </div>
  <h2>Segnalazioni nelle ultime 24 ore</h2>
  <div class="chart"><div class="chart-top muted small">Segnalazioni ogni 15 minuti${picco ? ` · massimo ${picco}` : ''}</div>${linea(x.serie, tono(x.stato.k), 720, 180)}<div class="axis">${etich}</div></div>
  <h2>Verifiche non riuscite, ultime 24 ore</h2>
  ${listaGuasti}
  <h2>Cosa fare se ${esc(s.nome)} non funziona</h2>
  <ul class="tips">${consigli}</ul>
  ${bloccoChainweb()}
  <h2>Altri servizi della stessa categoria</h2>
  <div class="links">${stessi}</div>
</div>`;
  return layout({
    titolo: `${s.nome} non funziona oggi? Stato in tempo reale · Stato servizi Italia`,
    descr: `${s.nome} è down? Ogni 5 minuti verifichiamo se ${h} risponde e mostriamo le segnalazioni degli utenti delle ultime 24 ore.`,
    base, path: `/s/${s.id}`, corpo,
  });
}

function pagina404(base) {
  return layout({ titolo: 'Pagina non trovata · Stato servizi Italia', descr: '', base, path: '/', corpo: `<div class="wrap narrow"><h1>Pagina non trovata</h1><p><a href="/">Torna a tutti i servizi</a></p></div>` });
}

function sitemap(base) {
  const urls = ['/', ...SERVIZI.map((s) => `/s/${s.id}`)].map((p) => `<url><loc>${base}${p}</loc><changefreq>hourly</changefreq></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}

export function layout({ titolo, descr, base, path, corpo }) {
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titolo)}</title>${descr ? `<meta name="description" content="${esc(descr)}">` : ''}
<link rel="canonical" href="${base}${path}">
<meta property="og:title" content="${esc(titolo)}"><meta property="og:description" content="${esc(descr)}"><meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#0B0F17"/><path d="M3 12h4l2-5 4 10 2-5h6" fill="none" stroke="#8AB4F8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>')}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
<header class="top"><div class="wrap row"><a class="logo" href="/"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 12h4l2-5 4 10 2-5h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Stato servizi Italia</a><a class="by" href="https://chainweb.solutions/it?${UTM}">di Chainweb</a></div></header>
<main>${corpo}</main>
<section class="wrap"><div class="fine">
  <img src="${LOGO_CW}" alt="Chainweb" width="220" height="55">
  <p>Stato servizi Italia è un progetto di Chainweb. Sviluppiamo software, assistenti AI e sicurezza informatica per le imprese, e le aiutiamo a non fermarsi quando un servizio cade.</p>
  <div class="fine-cta"><a class="btn" href="${CONTINUITA}">Piano di continuità operativa</a><a class="btn ghost" href="https://chainweb.solutions/it?${UTM}">Scopri Chainweb</a></div>
</div></section>
<footer class="foot"><div class="wrap">
<p>Ogni 5 minuti controlliamo se il sito di ciascun servizio risponde e raccogliamo le segnalazioni anonime degli utenti. Un sito che risponde può comunque avere problemi di accesso o nell'app. Non siamo affiliati ai servizi elencati: i nomi appartengono ai rispettivi titolari.</p>
<p>Privacy: niente cookie e niente pubblicità. Per evitare segnalazioni doppie conserviamo un'impronta cifrata dell'indirizzo IP, che cambia ogni giorno, per 7 giorni; l'indirizzo IP in chiaro non viene salvato.</p>
<p>© Chainweb Corp · Torino</p>
</div></footer>
<script>${JS}</script></body></html>`;
}

const CSS = `
:root{--bg:#0E1013;--card:rgba(255,255,255,.06);--line:rgba(255,255,255,.09);--tx:#FFFFFF;--mu:#8C95A8;--ac:#8AB4F8;--btn:#3E88F5;--ok:#34D399;--warn:#FBBF24;--bad:#F87171}
*{box-sizing:border-box}[hidden]{display:none!important}html,body{margin:0;background:var(--bg);color:var(--tx);font:16px/1.55 Montserrat,Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
a{color:var(--ac);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:1120px;margin:0 auto;padding:0 16px}.narrow{max-width:780px}
.top{border-bottom:1px solid var(--line);background:rgba(11,15,23,.92);position:sticky;top:0;z-index:5;backdrop-filter:blur(8px)}
.row{display:flex;align-items:center;justify-content:space-between;height:56px}
.logo{display:flex;gap:10px;align-items:center;color:var(--tx);font-weight:700;letter-spacing:-.01em}.logo svg{color:var(--ac)}.by{color:var(--mu);font-size:14px}
.hero{padding:44px 16px 8px}h1{font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.02em;margin:0 0 12px}
h2{font-size:18px;margin:36px 0 14px;letter-spacing:-.01em}.lead{color:var(--mu);font-size:18px;max-width:680px;margin:0 0 22px}
.muted{color:var(--mu)}.small{font-size:13px}
.search{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:0 14px;max-width:560px;color:var(--mu)}
.search input{flex:1;background:none;border:0;outline:0;color:var(--tx);font:inherit;height:48px}
.search:focus-within{border-color:var(--ac)}
.alert{margin:18px 0 0;padding:12px 16px;border-radius:12px;border:1px solid rgba(248,113,113,.35);background:rgba(248,113,113,.08)}
.alert.calm{border-color:rgba(52,211,153,.3);background:rgba(52,211,153,.07)}
.lista{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(460px,100%),1fr));column-gap:28px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:4px 16px}
.riga{display:grid;grid-template-columns:minmax(0,1fr) 26px minmax(110px,42%);align-items:center;gap:14px;padding:12px 2px;border-bottom:1px solid var(--line);color:var(--tx);min-height:68px}
.riga:hover{text-decoration:none;background:rgba(138,180,248,.04)}
.r-nome{display:flex;flex-direction:column;min-width:0;font-weight:600;font-size:17px;line-height:1.25}
.r-nome small{font-size:12px;font-weight:500;margin-top:3px}.r-nome small.warn{color:var(--warn)}.r-nome small.bad{color:var(--bad)}
.ic{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ic.ok{color:var(--ok)}.ic.warn{color:var(--warn)}.ic.bad{color:var(--bad)}.ic.na{color:var(--mu)}
.linea{display:block;width:100%;height:46px}.linea .tratto{fill:none;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.linea.ok .tratto,.linea.na .tratto{stroke:var(--ac)}
.linea.warn .tratto{stroke:var(--warn)}
.linea.bad .tratto{stroke:var(--bad)}
.linea .s1{stop-color:#000;stop-opacity:0}
.linea.ok .s0,.linea.na .s0{stop-color:#8AB4F8;stop-opacity:.22}
.linea.warn .s0{stop-color:#FBBF24;stop-opacity:.25}
.linea.bad .s0{stop-color:#F87171;stop-opacity:.3}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:12px}
.card-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.nome{color:var(--tx);font-weight:600}
.card-mid{display:flex;flex-direction:column;gap:6px}.card .spark{width:100%;height:26px}.card-bot{display:flex;justify-content:space-between;align-items:center;gap:8px}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500;padding:3px 9px;border-radius:999px;white-space:nowrap;border:1px solid var(--line);color:var(--mu)}
.dot{width:7px;height:7px;border-radius:50%;background:currentColor}
.pill.ok{color:var(--ok);border-color:rgba(52,211,153,.3)}.pill.alcune,.pill.dubbio,.pill.lento{color:var(--warn);border-color:rgba(251,191,36,.35)}
.pill.problemi,.pill.giu{color:var(--bad);border-color:rgba(248,113,113,.4)}
.spark .b{fill:var(--ac)}.spark .b0{fill:#2A3547}
.btn,.btn-sm{font:inherit;cursor:pointer;border-radius:10px;border:0;background:var(--btn);color:#fff;font-weight:600}
.btn{padding:12px 18px;display:inline-block}.btn:hover{text-decoration:none;filter:brightness(1.08)}
.btn-sm{font-size:13px;padding:6px 11px;background:transparent;border:1px solid var(--line);color:var(--tx)}.btn-sm:hover{border-color:var(--ac)}
button:disabled{opacity:.7;cursor:default}
.cw{margin:44px 0 12px;padding:24px;border-radius:16px;border:1px solid rgba(138,180,248,.3);background:linear-gradient(135deg,rgba(62,136,245,.14),rgba(17,24,39,.6));display:flex;gap:20px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.cw h2{margin:0 0 8px;font-size:20px}.cw p{margin:0;color:var(--mu);max-width:640px}
.back{display:inline-block;margin:28px 0 14px;font-size:14px}
.big{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px}
.big-top{display:flex;justify-content:space-between;align-items:center;gap:10px}.big .pill{font-size:14px;padding:5px 12px}
.big-act{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin-top:6px}
.chart{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 16px 30px;position:relative}
.chart .linea{height:180px}.chart-top{margin-bottom:8px}.axis{position:relative;height:14px;margin-top:6px;font:12px 'JetBrains Mono',monospace;color:var(--mu)}.axis span{position:absolute}
.log{margin:0;padding-left:18px;color:var(--mu)}.tips{padding-left:18px}.tips li{margin:6px 0}
.links{display:flex;flex-wrap:wrap;gap:8px}.links a{border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:14px;color:var(--tx)}
.foot{border-top:1px solid var(--line);margin-top:56px;padding:20px 0 40px;color:var(--mu);font-size:13px}
@media (max-width:520px){.cw{padding:18px}.hero{padding-top:24px}.lead{font-size:16px;margin-bottom:16px}.alert{margin-top:12px}.r-nome{font-size:16px}.riga{gap:10px}}

html{background:#0B0D10;overflow-x:clip}body{overflow-x:clip}body{background:transparent!important;min-height:100vh}
body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:
radial-gradient(55% 45% at 88% -8%,rgba(62,136,245,.30),transparent 62%),
radial-gradient(45% 40% at -8% 28%,rgba(62,136,245,.16),transparent 62%),
radial-gradient(40% 35% at 72% 92%,rgba(90,158,252,.13),transparent 62%),
linear-gradient(180deg,#111418,#0B0D10)}
.top{background:rgba(20,20,21,.62);border-bottom:1px solid rgba(255,255,255,.08);-webkit-backdrop-filter:blur(16px) saturate(200%);backdrop-filter:blur(16px) saturate(200%)}
.lista,.big,.chart,.search,.alert,.cw,.fine,.links a{background:linear-gradient(135deg,rgba(255,255,255,.12),rgba(255,255,255,.035) 45%,rgba(255,255,255,.07));border:1px solid rgba(255,255,255,.16);-webkit-backdrop-filter:blur(18px) saturate(1.7);backdrop-filter:blur(18px) saturate(1.7);box-shadow:0 24px 60px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.22)}
.lista,.big,.chart{border-radius:20px}.search{border-radius:14px}.links a{box-shadow:inset 0 1px 0 rgba(255,255,255,.18)}
.alert{background:linear-gradient(135deg,rgba(248,113,113,.16),rgba(248,113,113,.05));border-color:rgba(248,113,113,.35)}
.alert.calm{background:linear-gradient(135deg,rgba(52,211,153,.13),rgba(52,211,153,.04));border-color:rgba(52,211,153,.3)}
.cw{background:linear-gradient(135deg,rgba(62,136,245,.22),rgba(255,255,255,.04) 55%,rgba(62,136,245,.10));border-color:rgba(138,180,248,.32);border-radius:22px}
.riga{border-bottom-color:rgba(255,255,255,.08)}.riga:hover{background:rgba(255,255,255,.04)}
.btn{background:#3E88F5;box-shadow:0 8px 24px rgba(62,136,245,.35),inset 0 1px 0 rgba(255,255,255,.25)}
.btn.ghost{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.2);box-shadow:inset 0 1px 0 rgba(255,255,255,.15)}
.logo svg{filter:drop-shadow(0 0 8px rgba(138,180,248,.6))}
.fine{margin:56px 0 0;padding:32px;border-radius:24px;display:grid;gap:16px;justify-items:start}
.fine img{height:auto;max-width:200px;opacity:.95}.fine p{margin:0;color:var(--mu);max-width:640px}
.fine-cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:4px}
.foot{margin-top:28px;border-top:1px solid rgba(255,255,255,.08)}
@media (max-width:520px){.fine{padding:22px}.fine-cta .btn{width:100%;text-align:center}}

body::after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;
background-image:radial-gradient(rgba(255,255,255,.10) 1px,transparent 1.3px),linear-gradient(rgba(138,180,248,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(138,180,248,.035) 1px,transparent 1px);
background-size:24px 24px,120px 120px,120px 120px;
-webkit-mask-image:radial-gradient(130% 90% at 60% 0%,#000 25%,rgba(0,0,0,.35) 60%,transparent 92%);mask-image:radial-gradient(130% 90% at 60% 0%,#000 25%,rgba(0,0,0,.35) 60%,transparent 92%)}
.hero{position:relative;isolation:isolate}
.ecg{position:absolute;left:62%;top:120px;width:40%;height:165px;z-index:-1;pointer-events:none;overflow:visible}
.ecg path{fill:none;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}
.ecg-base{stroke:rgba(138,180,248,.16);stroke-width:2}
.ecg-run{stroke:#8AB4F8;stroke-width:2.5;stroke-dasharray:180 1600;stroke-dashoffset:1780;filter:drop-shadow(0 0 6px rgba(138,180,248,.9)) drop-shadow(0 0 18px rgba(62,136,245,.6));animation:corri 6s linear infinite}
@keyframes corri{to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){.ecg-run{animation:none;stroke-dasharray:none;opacity:.35}}
@media (max-width:520px){.hero{padding-top:84px!important}.ecg{left:0;width:100%;top:6px;height:76px}}

.hero-top{position:relative;padding-bottom:96px}
.picco{position:absolute;left:calc(50% - 50vw);width:100vw;top:-140px;height:calc(100% + 140px);z-index:-1;pointer-events:none;overflow:visible}
.picco path{fill:none;stroke:url(#gp);stroke-width:3;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;filter:drop-shadow(0 0 6px rgba(138,180,248,.55)) drop-shadow(0 0 16px rgba(248,113,113,.35));stroke-dasharray:1;stroke-dashoffset:1;animation:disegna 2.2s cubic-bezier(.4,0,.2,1) .2s forwards}
@keyframes disegna{to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){.picco path{animation:none;stroke-dashoffset:0}}
.numeri{display:flex;align-items:center;gap:28px;margin-top:8px}
.numeri div{display:flex;flex-direction:column}.numeri b{font-size:32px;line-height:1.1;letter-spacing:-.01em}.numeri span{color:var(--mu);font-size:14px}
.numeri i{width:1px;align-self:stretch;background:rgba(255,255,255,.35)}
.hero .ecg{display:none}
@media (max-width:520px){.hero-top{padding-bottom:84px}.numeri{gap:20px}.numeri b{font-size:28px}.picco{top:-150px;height:calc(100% + 150px)}}
`;

const JS = `
document.addEventListener('click',async function(e){var b=e.target.closest('[data-segnala]');if(!b)return;e.preventDefault();var id=b.getAttribute('data-segnala');var t=b.textContent;b.disabled=true;b.textContent='Invio…';
try{var r=await fetch('/api/segnala',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:id})});var j=await r.json();if(!j.ok)throw 0;b.textContent='Segnalato, grazie';
document.querySelectorAll('[data-conta="'+id+'"]').forEach(function(c){c.textContent=j.n});}catch(_){b.disabled=false;b.textContent=t;}});
var q=document.getElementById('cerca');if(q){q.addEventListener('input',function(){var v=q.value.trim().toLowerCase();var any=false;
document.querySelectorAll('[data-cat]').forEach(function(sec){var vis=0;sec.querySelectorAll('.riga').forEach(function(c){var ok=!v||c.getAttribute('data-nome').indexOf(v)>=0;c.hidden=!ok;if(ok)vis++;});sec.hidden=!vis;if(vis)any=true;});
document.getElementById('vuoto').hidden=any;});}
`;

// ---------- Utilità ----------

function html(body, status = 200) {
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' } });
}
function json(o, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
function testo(t) {
  return new Response(t, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
