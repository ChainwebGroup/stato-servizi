# Stato servizi Italia

Verifica ogni 5 minuti se rispondono SPID, INPS, pagoPA, PEC, banche, operatori e app, e pubblica lo stato con lo storico di 24 ore.

- `gen/genera.mjs`: verifiche e pagine statiche (GitHub Actions → Cloudflare Pages).
- `src/`: versione Worker con segnalazioni degli utenti (Cloudflare Workers + D1).

Un progetto di [Chainweb](https://chainweb.solutions/it).
