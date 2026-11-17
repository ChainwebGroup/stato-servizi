// Elenco dei servizi controllati. gruppo: 0 o 1 (due esecuzioni cron, max 50 richieste ciascuna).
// url: pagina che deve rispondere. Qualsiasi risposta HTTP sotto 500 = il server risponde.

export const CATEGORIE = [
  { id: 'id', nome: 'SPID e identità digitale' },
  { id: 'pa', nome: 'Pubblica amministrazione' },
  { id: 'lavoro', nome: 'PEC, fatture e hosting' },
  { id: 'banche', nome: 'Banche e pagamenti' },
  { id: 'tel', nome: 'Telefonia e internet' },
  { id: 'trasporti', nome: 'Trasporti' },
  { id: 'app', nome: 'App e servizi online' },
];

export const SERVIZI = [
  // SPID e identità
  { id: 'posteid', nome: 'PosteID (SPID)', cat: 'id', url: 'https://posteid.poste.it/' },
  { id: 'aruba-id', nome: 'Aruba ID (SPID)', cat: 'id', url: 'https://loginspid.aruba.it/' },
  { id: 'infocert-id', nome: 'InfoCert ID (SPID)', cat: 'id', url: 'https://identity.infocert.it/' },
  { id: 'namirial-id', nome: 'Namirial ID (SPID)', cat: 'id', url: 'https://idp.namirialtsp.com/idp/' },
  { id: 'sielte-id', nome: 'Sielte ID (SPID)', cat: 'id', url: 'https://identity.sieltecloud.it/' },
  { id: 'lepida-id', nome: 'Lepida ID (SPID)', cat: 'id', url: 'https://id.lepida.it/' },
  { id: 'tim-id', nome: 'TIM id (SPID)', cat: 'id', url: 'https://login.id.tim.it/affwebservices/public/saml2sso' },
  { id: 'spiditalia', nome: 'SpidItalia Register.it (SPID)', cat: 'id', url: 'https://spid.register.it/' },
  { id: 'intesi-id', nome: 'Intesi Group ID (SPID)', cat: 'id', url: 'https://spid.intesigroup.com/' },
  { id: 'infocamere-id', nome: 'InfoCamere ID (SPID)', cat: 'id', url: 'https://loginspid.infocamere.it/' },
  { id: 'teamsystem-id', nome: 'TeamSystem ID (SPID)', cat: 'id', url: 'https://spid.teamsystem.com/idp' },
  { id: 'cie', nome: "CieID · Carta d'identità elettronica", cat: 'id', url: 'https://idserver.servizicie.interno.gov.it/idp/' },
  // PA
  { id: 'app-io', nome: 'App IO', cat: 'pa', url: 'https://io.italia.it/' },
  { id: 'pagopa', nome: 'pagoPA', cat: 'pa', url: 'https://checkout.pagopa.it/' },
  { id: 'inps', nome: 'INPS', cat: 'pa', url: 'https://www.inps.it/' },
  { id: 'inail', nome: 'INAIL', cat: 'pa', url: 'https://www.inail.it/' },
  { id: 'agenzia-entrate', nome: 'Agenzia delle Entrate', cat: 'pa', url: 'https://www.agenziaentrate.gov.it/' },
  { id: 'area-riservata-entrate', nome: 'Area riservata Entrate (Fisconline, Entratel)', cat: 'pa', url: 'https://iampe.agenziaentrate.gov.it/sam/UI/Login?realm=/agenziaentrate' },
  { id: 'fatture-corrispettivi', nome: 'Fatture e Corrispettivi (SdI)', cat: 'pa', url: 'https://ivaservizi.agenziaentrate.gov.it/portale/' },
  { id: 'anpr', nome: 'ANPR · Anagrafe nazionale', cat: 'pa', url: 'https://www.anagrafenazionale.interno.it/' },
  { id: 'fascicolo-sanitario', nome: 'Fascicolo sanitario elettronico', cat: 'pa', url: 'https://www.fascicolosanitario.gov.it/' },
  { id: 'mepa', nome: 'MePA · Acquisti in rete PA', cat: 'pa', url: 'https://www.acquistinretepa.it/' },
  // PEC, fatture, hosting
  { id: 'aruba-pec', nome: 'Aruba PEC', cat: 'lavoro', url: 'https://webmail.pec.it/' },
  { id: 'legalmail', nome: 'Legalmail (PEC InfoCert)', cat: 'lavoro', url: 'https://www.legalmail.it/' },
  { id: 'aruba', nome: 'Aruba', cat: 'lavoro', url: 'https://www.aruba.it/' },
  { id: 'register', nome: 'Register.it', cat: 'lavoro', url: 'https://www.register.it/' },
  { id: 'fatture-in-cloud', nome: 'Fatture in Cloud', cat: 'lavoro', url: 'https://secure.fattureincloud.it/' },
  // Banche e pagamenti
  { id: 'poste', nome: 'Poste Italiane', cat: 'banche', url: 'https://www.poste.it/' },
  { id: 'postepay', nome: 'Postepay', cat: 'banche', url: 'https://postepay.poste.it/' },
  { id: 'intesa-sanpaolo', nome: 'Intesa Sanpaolo', cat: 'banche', url: 'https://www.intesasanpaolo.com/' },
  { id: 'unicredit', nome: 'UniCredit', cat: 'banche', url: 'https://www.unicredit.it/' },
  { id: 'bper', nome: 'BPER Banca', cat: 'banche', url: 'https://www.bper.it/' },
  { id: 'nexi', nome: 'Nexi', cat: 'banche', url: 'https://www.nexi.it/' },
  { id: 'satispay', nome: 'Satispay', cat: 'banche', url: 'https://www.satispay.com/' },
  // Telefonia
  { id: 'tim', nome: 'TIM', cat: 'tel', url: 'https://www.tim.it/' },
  { id: 'vodafone', nome: 'Vodafone', cat: 'tel', url: 'https://www.vodafone.it/' },
  { id: 'windtre', nome: 'WindTre', cat: 'tel', url: 'https://www.windtre.it/' },
  { id: 'iliad', nome: 'Iliad', cat: 'tel', url: 'https://www.iliad.it/' },
  { id: 'fastweb', nome: 'Fastweb', cat: 'tel', url: 'https://www.fastweb.it/' },
  // Trasporti
  { id: 'trenitalia', nome: 'Trenitalia', cat: 'trasporti', url: 'https://www.trenitalia.com/' },
  { id: 'italo', nome: 'Italo', cat: 'trasporti', url: 'https://www.italotreno.com/' },
  // App
  { id: 'whatsapp', nome: 'WhatsApp', cat: 'app', url: 'https://web.whatsapp.com/' },
  { id: 'instagram', nome: 'Instagram', cat: 'app', url: 'https://www.instagram.com/' },
  { id: 'facebook', nome: 'Facebook', cat: 'app', url: 'https://www.facebook.com/' },
  { id: 'gmail', nome: 'Gmail', cat: 'app', url: 'https://mail.google.com/' },
  { id: 'outlook', nome: 'Outlook', cat: 'app', url: 'https://outlook.office.com/' },
  { id: 'teams', nome: 'Microsoft Teams', cat: 'app', url: 'https://teams.microsoft.com/' },
  { id: 'chatgpt', nome: 'ChatGPT', cat: 'app', url: 'https://chatgpt.com/' },
  { id: 'amazon', nome: 'Amazon.it', cat: 'app', url: 'https://www.amazon.it/' },
].map((s, i) => ({ ...s, gruppo: i % 2 }));

// Consigli brevi per categoria, mostrati sulla pagina del servizio.
export const CONSIGLI = {
  id: [
    "Prova ad accedere con un altro gestore SPID, se ne hai più di uno, o con la Carta d'identità elettronica (CieID).",
    "Se il problema è l'app del gestore, prova l'accesso con SMS o da un altro dispositivo.",
    'Se il servizio pubblico ha una scadenza, conserva uno screenshot dell’errore con data e ora.',
  ],
  pa: [
    'Se il portale non risponde, riprova più tardi: nelle ore di punta i servizi pubblici rallentano spesso.',
    "Se l'accesso si blocca su SPID, controlla nella sezione SPID se il tuo gestore ha problemi.",
    'Per le scadenze, conserva uno screenshot dell’errore con data e ora.',
  ],
  lavoro: [
    'Se la webmail PEC non va, prova da un programma di posta già configurato o dall’app del gestore.',
    'Se devi rispettare una scadenza, conserva uno screenshot dell’errore con data e ora.',
  ],
  banche: [
    'Non comunicare codici o password a chi ti contatta durante un disservizio: è il momento preferito dalle truffe.',
    'Usa solo l’app ufficiale o il sito che digiti tu, non i link ricevuti via SMS o e-mail.',
  ],
  tel: [
    'Riavvia modem o telefono e prova la rete da un altro dispositivo.',
    'Controlla se il problema riguarda tutta la tua zona: le segnalazioni qui sotto aiutano a capirlo.',
  ],
  trasporti: [
    'Se il sito non risponde, prova l’app ufficiale o la biglietteria in stazione.',
  ],
  app: [
    'Prova a chiudere e riaprire l’app, oppure la versione web dal browser.',
    'Controlla la connessione: se altre app funzionano, il problema è probabilmente del servizio.',
  ],
};
