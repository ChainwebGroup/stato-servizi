// Elenco dei servizi controllati. gruppo: 0 o 1 (due esecuzioni cron, max 50 richieste ciascuna).
// url: pagina che deve rispondere. Qualsiasi risposta HTTP sotto 500 = il server risponde.

export const CATEGORIE = [
  { id: 'id', nome: 'SPID e identità digitale' },
  { id: 'pa', nome: 'Pubblica amministrazione' },
  { id: 'lavoro', nome: 'PEC, fatture e hosting' },
  { id: 'banche', nome: 'Banche e home banking' },
  { id: 'pagamenti', nome: 'Pagamenti online, POS e carte' },
  { id: 'mail', nome: 'Posta elettronica' },
  { id: 'scuola', nome: 'Scuola e registro elettronico' },
  { id: 'tel', nome: 'Telefonia e internet' },
  { id: 'trasporti', nome: 'Trasporti' },
  { id: 'app', nome: 'App e servizi online' },
];

export const SERVIZI = [
  // SPID e identità
  { id: 'posteid', nome: 'PosteID (SPID)', cat: 'id', url: 'https://posteid.poste.it/', check: 'https://posteid.poste.it/jod-fs/ssoserviceredirect', cosa: 'la pagina di accesso SPID del gestore, all’indirizzo ufficiale del registro AgID' },
  { id: 'aruba-id', nome: 'Aruba ID (SPID)', cat: 'id', url: 'https://loginspid.aruba.it/', check: 'https://loginspid.aruba.it/ServiceLoginWelcome', cosa: 'la pagina di accesso SPID del gestore, all’indirizzo ufficiale del registro AgID' },
  { id: 'infocert-id', nome: 'InfoCert ID (SPID)', cat: 'id', url: 'https://identity.infocert.it/', check: 'https://identity.infocert.it/spid/samlsso', cosa: 'la pagina di accesso SPID del gestore, all’indirizzo ufficiale del registro AgID' },
  { id: 'namirial-id', nome: 'Namirial ID (SPID)', cat: 'id', url: 'https://idp.namirialtsp.com/idp/', check: 'https://idp.namirialtsp.com/idp/profile/SAML2/Redirect/SSO', cosa: 'la pagina di accesso SPID del gestore, all’indirizzo ufficiale del registro AgID' },
  { id: 'sielte-id', nome: 'Sielte ID (SPID)', cat: 'id', url: 'https://identity.sieltecloud.it/' },
  { id: 'lepida-id', nome: 'Lepida ID (SPID)', cat: 'id', url: 'https://id.lepida.it/', check: 'https://id.lepida.it/idp/profile/SAML2/Redirect/SSO', cosa: 'la pagina di accesso SPID del gestore, all’indirizzo ufficiale del registro AgID' },
  { id: 'spiditalia', nome: 'SpidItalia Register.it (SPID)', cat: 'id', url: 'https://spid.register.it/', check: 'https://spid.register.it/login/sso', cosa: 'la pagina di accesso SPID del gestore, all’indirizzo ufficiale del registro AgID' },
  { id: 'intesi-id', nome: 'Intesi Group ID (SPID)', cat: 'id', url: 'https://spid.intesigroup.com/', check: 'https://spid.intesigroup.com/saml/public/income', cosa: 'la pagina di accesso SPID del gestore, all’indirizzo ufficiale del registro AgID' },
  { id: 'infocamere-id', nome: 'InfoCamere ID (SPID)', cat: 'id', url: 'https://loginspid.infocamere.it/', check: 'https://loginspid.infocamere.it/ServiceLoginWelcome', cosa: 'la pagina di accesso SPID del gestore, all’indirizzo ufficiale del registro AgID' },
  { id: 'teamsystem-id', nome: 'TeamSystem ID (SPID)', cat: 'id', url: 'https://spid.teamsystem.com/idp', check: 'https://spid.teamsystem.com/idp/sso/redirect', cosa: 'la pagina di accesso SPID del gestore, all’indirizzo ufficiale del registro AgID' },
  { id: 'cie', nome: "CieID · Carta d'identità elettronica", cat: 'id', url: 'https://idserver.servizicie.interno.gov.it/idp/' },
  // PA
  { id: 'app-io', nome: 'App IO', cat: 'pa', url: 'https://io.italia.it/', check: 'https://app-backend.io.italia.it/ping', attendi: 'ok', cosa: 'il server a cui si collega l’app IO' },
  { id: 'pagopa', nome: 'pagoPA', cat: 'pa', url: 'https://checkout.pagopa.it/' },
  { id: 'inps', nome: 'INPS', cat: 'pa', url: 'https://www.inps.it/' },
  { id: 'inail', nome: 'INAIL', cat: 'pa', url: 'https://www.inail.it/' },
  { id: 'agenzia-entrate', nome: 'Agenzia delle Entrate', cat: 'pa', url: 'https://www.agenziaentrate.gov.it/' },
  { id: 'area-riservata-entrate', nome: 'Area riservata Entrate (Fisconline, Entratel)', cat: 'pa', url: 'https://iampe.agenziaentrate.gov.it/sam/UI/Login?realm=/agenziaentrate' },
  { id: 'fatture-corrispettivi', nome: 'Fatture e Corrispettivi (SdI)', cat: 'pa', url: 'https://ivaservizi.agenziaentrate.gov.it/portale/' },
  { id: 'anpr', nome: 'ANPR · Anagrafe nazionale', cat: 'pa', url: 'https://www.anagrafenazionale.interno.it/' },
  { id: 'fascicolo-sanitario', nome: 'Fascicolo sanitario elettronico', cat: 'pa', url: 'https://www.fascicolosanitario.gov.it/' },
  { id: 'mepa', nome: 'MePA · Acquisti in rete PA', cat: 'pa', url: 'https://www.acquistinretepa.it/' },
  { id: 'noipa', nome: 'NoiPA · stipendi PA', cat: 'pa', url: 'https://noipa.mef.gov.it/' },
  { id: 'tessera-sanitaria', nome: 'Sistema Tessera Sanitaria', cat: 'pa', url: 'https://sistemats1.sanita.finanze.it/portale/' },
  // PEC, fatture, hosting
  { id: 'aruba-pec', nome: 'Aruba PEC', cat: 'lavoro', url: 'https://webmail.pec.it/' },
  { id: 'legalmail', nome: 'Legalmail (PEC InfoCert)', cat: 'lavoro', url: 'https://www.legalmail.it/' },
  { id: 'aruba', nome: 'Aruba', cat: 'lavoro', url: 'https://www.aruba.it/' },
  { id: 'register', nome: 'Register.it', cat: 'lavoro', url: 'https://www.register.it/', ufficiale: { tipo: 'statuspage', url: 'https://status.register.it' } },
  { id: 'fatture-in-cloud', nome: 'Fatture in Cloud', cat: 'lavoro', url: 'https://secure.fattureincloud.it/' },
  // Banche e pagamenti
  { id: 'poste', nome: 'Poste Italiane', cat: 'banche', url: 'https://www.poste.it/' },
  { id: 'postepay', nome: 'Postepay', cat: 'banche', url: 'https://postepay.poste.it/' },
  { id: 'app-postepay', nome: 'App Postepay', cat: 'banche', url: 'https://postepay.poste.it/', check: 'https://ppayapp.mobile.poste.it/', cosa: 'il server dell’app Postepay (ppayapp.mobile.poste.it, dal registro pubblico dei certificati)' },
  { id: 'accesso-app-poste', nome: 'Accesso alle app di Poste', cat: 'banche', url: 'https://www.poste.it/', check: 'https://securelogin.mobile.poste.it/', cosa: 'il server di accesso delle app di Poste (securelogin.mobile.poste.it, dal registro pubblico dei certificati)' },
  { id: 'intesa-sanpaolo', nome: 'Intesa Sanpaolo', cat: 'banche', url: 'https://www.intesasanpaolo.com/' },
  { id: 'unicredit', nome: 'UniCredit', cat: 'banche', url: 'https://www.unicredit.it/' },
  { id: 'bper', nome: 'BPER Banca', cat: 'banche', url: 'https://www.bper.it/' },
  { id: 'bancoposta-online', nome: 'BancoPosta online', cat: 'banche', url: 'https://bancopostaonline.poste.it/' },
  { id: 'banco-bpm', nome: 'Banco BPM · YouWeb', cat: 'banche', url: 'https://youweb.bancobpm.it/' },
  { id: 'fineco', nome: 'Fineco', cat: 'banche', url: 'https://finecobank.com/it/online/' },
  { id: 'mediolanum', nome: 'Banca Mediolanum', cat: 'banche', url: 'https://www.bancamediolanum.it/' },
  { id: 'bnl', nome: 'BNL', cat: 'banche', url: 'https://bnl.it/' },
  { id: 'mps', nome: 'Monte dei Paschi', cat: 'banche', url: 'https://www.mps.it/' },
  { id: 'credit-agricole', nome: 'Crédit Agricole Italia', cat: 'banche', url: 'https://www.credit-agricole.it/' },
  { id: 'ing', nome: 'ING Italia', cat: 'banche', url: 'https://www.ing.it/' },
  { id: 'sella', nome: 'Banca Sella', cat: 'banche', url: 'https://www.sella.it/' },
  { id: 'widiba', nome: 'Widiba', cat: 'banche', url: 'https://www.widiba.it/' },
  { id: 'hype', nome: 'Hype', cat: 'banche', url: 'https://www.hype.it/' },
  { id: 'revolut', nome: 'Revolut', cat: 'banche', url: 'https://www.revolut.com/it-IT/' },
  // Pagamenti
  { id: 'nexi', nome: 'Nexi', cat: 'pagamenti', url: 'https://www.nexi.it/' },
  { id: 'nexi-xpay', nome: 'Nexi XPay · pagamenti e-commerce', cat: 'pagamenti', url: 'https://ecommerce.nexi.it/' },
  { id: 'nexi-business', nome: 'Nexi Business · area esercenti', cat: 'pagamenti', url: 'https://business.nexi.it/' },
  { id: 'satispay', nome: 'Satispay', cat: 'pagamenti', url: 'https://www.satispay.com/' },
  { id: 'satispay-api', nome: 'Satispay · API esercenti', cat: 'pagamenti', url: 'https://authservices.satispay.com/' },
  { id: 'paypal', nome: 'PayPal', cat: 'pagamenti', url: 'https://www.paypal.com/it/home' },
  { id: 'stripe', nome: 'Stripe · API pagamenti', cat: 'pagamenti', url: 'https://api.stripe.com/', ufficiale: { tipo: 'stripe', url: 'https://status.stripe.com' } },
  { id: 'sumup', nome: 'SumUp', cat: 'pagamenti', url: 'https://me.sumup.com/', ufficiale: { tipo: 'statuspage', url: 'https://status.sumup.com' } },
  { id: 'axerve', nome: 'Axerve', cat: 'pagamenti', url: 'https://www.axerve.com/' },
  { id: 'scalapay', nome: 'Scalapay', cat: 'pagamenti', url: 'https://www.scalapay.com/', ufficiale: { tipo: 'statuspage', url: 'https://status.scalapay.com' } },
  // Posta elettronica
  { id: 'libero-mail', nome: 'Libero Mail', cat: 'mail', url: 'https://login.libero.it/' },
  { id: 'virgilio-mail', nome: 'Virgilio Mail', cat: 'mail', url: 'https://login.virgilio.it/' },
  { id: 'aruba-webmail', nome: 'Aruba Webmail', cat: 'mail', url: 'https://webmail.aruba.it/' },
  { id: 'yahoo-mail', nome: 'Yahoo Mail', cat: 'mail', url: 'https://mail.yahoo.com/' },
  // Scuola
  { id: 'classeviva', nome: 'ClasseViva Spaggiari', cat: 'scuola', url: 'https://web.spaggiari.eu/' },
  { id: 'argo', nome: 'Argo · registro elettronico', cat: 'scuola', url: 'https://www.portaleargo.it/' },
  // Telefonia
  { id: 'tim', nome: 'TIM', cat: 'tel', url: 'https://www.tim.it/' },
  { id: 'vodafone', nome: 'Vodafone', cat: 'tel', url: 'https://www.vodafone.it/' },
  { id: 'windtre', nome: 'WindTre', cat: 'tel', url: 'https://www.windtre.it/' },
  { id: 'iliad', nome: 'Iliad', cat: 'tel', url: 'https://www.iliad.it/' },
  { id: 'fastweb', nome: 'Fastweb', cat: 'tel', url: 'https://www.fastweb.it/' },
  // Trasporti
  { id: 'trenitalia', nome: 'Trenitalia', cat: 'trasporti', url: 'https://www.trenitalia.com/' },
  { id: 'italo', nome: 'Italo', cat: 'trasporti', url: 'https://www.italotreno.com/' },
  { id: 'telepass', nome: 'Telepass', cat: 'trasporti', url: 'https://www.telepass.com/' },
  // App
  { id: 'whatsapp', nome: 'WhatsApp', cat: 'app', url: 'https://web.whatsapp.com/' },
  { id: 'instagram', nome: 'Instagram', cat: 'app', url: 'https://www.instagram.com/' },
  { id: 'facebook', nome: 'Facebook', cat: 'app', url: 'https://www.facebook.com/' },
  { id: 'gmail', nome: 'Gmail', cat: 'mail', url: 'https://mail.google.com/', ufficiale: { tipo: 'google', url: 'https://www.google.com/appsstatus/dashboard/', prodotto: 'Gmail' } },
  { id: 'outlook', nome: 'Outlook', cat: 'mail', url: 'https://outlook.office.com/' },
  { id: 'teams', nome: 'Microsoft Teams', cat: 'app', url: 'https://teams.microsoft.com/' },
  { id: 'chatgpt', nome: 'ChatGPT', cat: 'app', url: 'https://chatgpt.com/', ufficiale: { tipo: 'statuspage', url: 'https://status.openai.com' } },
  { id: 'amazon', nome: 'Amazon.it', cat: 'app', url: 'https://www.amazon.it/' },
  { id: 'youtube', nome: 'YouTube', cat: 'app', url: 'https://www.youtube.com/' },
  { id: 'tiktok', nome: 'TikTok', cat: 'app', url: 'https://www.tiktok.com/' },
  { id: 'telegram', nome: 'Telegram', cat: 'app', url: 'https://web.telegram.org/' },
  { id: 'netflix', nome: 'Netflix', cat: 'app', url: 'https://www.netflix.com/it/' },
  { id: 'dazn', nome: 'DAZN', cat: 'app', url: 'https://www.dazn.com/it-IT/' },
  { id: 'sky-go', nome: 'Sky Go', cat: 'app', url: 'https://skygo.sky.it/' },
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
  pagamenti: [
    'Se il POS non va, controlla prima la connessione del terminale e prova un altro metodo: contanti, link di pagamento o un altro circuito.',
    'Se un pagamento online resta in sospeso, non ripeterlo subito: verifica nell’estratto conto o nell’area esercenti se è stato addebitato.',
  ],
  mail: [
    'Prova l’app o la webmail da un altro dispositivo o rete.',
    'Se la posta non arriva, controlla lo spam e chiedi al mittente se ha ricevuto un messaggio di errore.',
  ],
  scuola: [
    'Prova l’app al posto del sito, o il contrario: spesso uno dei due funziona.',
    'Per scadenze e comunicazioni urgenti contatta la segreteria della scuola.',
  ],
  app: [
    'Prova a chiudere e riaprire l’app, oppure la versione web dal browser.',
    'Controlla la connessione: se altre app funzionano, il problema è probabilmente del servizio.',
  ],
};
