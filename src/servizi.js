// Elenco dei servizi controllati. gruppo: 0 o 1 (due esecuzioni cron, max 50 richieste ciascuna).
// url/check: pagina da verificare; si seguono redirect e pagine-ponte. Conta il cambiamento rispetto al solito, non il codice.
// posta: server IMAP/SMTP («host:porta») che devono rispondere al saluto.
// attendi: la risposta deve iniziare così (minuscolo); guasto: se la risposta contiene questo testo (minuscolo), il servizio segnala un guasto.

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
  { id: 'app-io', nome: 'App IO', cat: 'pa', url: 'https://io.italia.it/', check: 'https://app-backend.io.italia.it/ping', attendi: 'ok', cosa: 'il server a cui si collega l’app IO', server: ['io.italia.it'] },
  { id: 'pagopa', nome: 'pagoPA', cat: 'pa', url: 'https://checkout.pagopa.it/', check: 'https://api.platform.pagopa.it/ecommerce/checkout/v1/payment-methods', cosa: 'il server dei pagamenti di checkout.pagopa.it (api.platform.pagopa.it, a cui si collega la pagina «Paga un avviso»)', server: ['api.platform.pagopa.it'] },
  { id: 'inps', nome: 'INPS', cat: 'pa', url: 'https://www.inps.it/', check: 'https://servizi2.inps.it/servizi/areariservata', cosa: 'la pagina di accesso a MyINPS (servizi2.inps.it, pulsante «Accedi a MyINPS» del sito)', server: ['servizi2.inps.it', 'serviziweb2.inps.it'] },
  { id: 'inail', nome: 'INAIL', cat: 'pa', url: 'https://www.inail.it/', check: 'https://www.inail.it/api/checksession', cosa: 'il server di accesso ai servizi online (www.inail.it/api, usato dalla pagina «Accedi ai servizi online»)', server: ['fws.inail.it'] },
  { id: 'agenzia-entrate', nome: 'Agenzia delle Entrate', cat: 'pa', url: 'https://www.agenziaentrate.gov.it/', server: ['iampe.agenziaentrate.gov.it', 'ivaservizi.agenziaentrate.gov.it'] },
  { id: 'area-riservata-entrate', nome: 'Area riservata Entrate (Fisconline, Entratel)', cat: 'pa', url: 'https://iampe.agenziaentrate.gov.it/sam/UI/Login?realm=/agenziaentrate', check: 'https://iampe.agenziaentrate.gov.it/sam/json/serverinfo/*', cosa: 'il server di accesso dell’Area riservata (iampe.agenziaentrate.gov.it, che gestisce Fisconline ed Entratel)' },
  { id: 'fatture-corrispettivi', nome: 'Fatture e Corrispettivi (SdI)', cat: 'pa', url: 'https://ivaservizi.agenziaentrate.gov.it/portale/' },
  { id: 'anpr', nome: 'ANPR · Anagrafe nazionale', cat: 'pa', url: 'https://www.anagrafenazionale.interno.it/', server: ['spid.anpr.interno.it'] },
  { id: 'fascicolo-sanitario', nome: 'Fascicolo sanitario elettronico', cat: 'pa', url: 'https://www.fascicolosanitario.gov.it/' },
  { id: 'mepa', nome: 'MePA · Acquisti in rete PA', cat: 'pa', url: 'https://www.acquistinretepa.it/', check: 'https://www.acquistinretepa.it/ext/utente/shres/userProfileJSON', cosa: 'il server di accesso di Acquisti in rete (www.acquistinretepa.it, usato dal pulsante «Accedi»)' },
  { id: 'noipa', nome: 'NoiPA · stipendi PA', cat: 'pa', url: 'https://noipa.mef.gov.it/', check: 'https://noipa.mef.gov.it/spascelta/', cosa: 'la pagina di accesso all’area riservata NoiPA (accessnoipa.mef.gov.it, pulsante «Accedi all’area riservata» del sito)', server: ['accessnoipa.mef.gov.it'] },
  { id: 'tessera-sanitaria', nome: 'Sistema Tessera Sanitaria', cat: 'pa', url: 'https://sistemats1.sanita.finanze.it/portale/', server: ['sp.sanita.finanze.it'] },
  // PEC, fatture, hosting
  { id: 'aruba-pec', nome: 'Aruba PEC', cat: 'lavoro', url: 'https://webmail.pec.it/', cosa: 'la pagina di accesso alla webmail PEC (webmail.pec.it, che rimanda a login.aruba.it)', server: ['login.aruba.it'], posta: ['imaps.pec.aruba.it:993', 'smtps.pec.aruba.it:465'] },
  { id: 'legalmail', nome: 'Legalmail (PEC InfoCert)', cat: 'lavoro', url: 'https://www.legalmail.it/', check: 'https://webmail.infocert.it/mail-api/session', cosa: 'il server della webmail Legalmail (webmail.infocert.it, collegata da «Accedi a Legalmail» del sito)', server: ['webmail.infocert.it'], posta: ['mbox.cert.legalmail.it:993', 'sendm.cert.legalmail.it:465'] },
  { id: 'aruba', nome: 'Aruba', cat: 'lavoro', url: 'https://www.aruba.it/', check: 'https://admin.aruba.it/PannelloAdmin/login.aspx', cosa: 'la pagina di accesso al pannello di controllo hosting (admin.aruba.it, che rimanda a mylogin.aruba.it)', server: ['mylogin.aruba.it', 'customerarea.aruba.it'] },
  { id: 'register', nome: 'Register.it', cat: 'lavoro', url: 'https://www.register.it/', check: 'https://controlpanel.register.it/welcome.html', cosa: 'la pagina di accesso all’Area clienti (controlpanel.register.it, pulsante «Area clienti» del sito)', server: ['webmail.register.it'], ufficiale: { tipo: 'statuspage', url: 'https://status.register.it' } },
  { id: 'fatture-in-cloud', nome: 'Fatture in Cloud', cat: 'lavoro', url: 'https://secure.fattureincloud.it/', check: 'https://secure.fattureincloud.it/backend_apiV2/user/info', cosa: 'il server dell’app Fatture in Cloud (secure.fattureincloud.it/backend_apiV2, usato dalla pagina «Accedi»)', server: ['api-v2.fattureincloud.it', 'identity.teamsystem.com'] },
  // Banche e pagamenti
  { id: 'poste', nome: 'Poste Italiane', cat: 'banche', url: 'https://www.poste.it/', check: 'https://idp-poste.poste.it/', cosa: 'la pagina di accesso all’area personale di Poste (securelogin.poste.it, pulsante «Accedi» del sito)', server: ['securelogin.poste.it', 'securelogin.mobile.poste.it', 'posteid.poste.it'] },
  { id: 'postepay', nome: 'Postepay', cat: 'banche', url: 'https://postepay.poste.it/', check: 'https://postepay.poste.it/ppay/private/pages/index.html', cosa: 'la pagina di accesso all’area riservata Postepay (securelogin.poste.it, collegata dal sito)', server: ['ppayapp.mobile.poste.it', 'securelogin.poste.it', 'securelogin.mobile.poste.it', 'posteid.poste.it'] },
  { id: 'app-postepay', nome: 'App Postepay', cat: 'banche', url: 'https://postepay.poste.it/', check: 'https://ppayapp.mobile.poste.it/', cosa: 'il server dell’app Postepay (ppayapp.mobile.poste.it, dal registro pubblico dei certificati)', server: ['securelogin.mobile.poste.it', 'posteid.poste.it'] },
  { id: 'accesso-app-poste', nome: 'Accesso alle app di Poste', cat: 'banche', url: 'https://www.poste.it/', check: 'https://securelogin.mobile.poste.it/', cosa: 'il server di accesso delle app di Poste (securelogin.mobile.poste.it, dal registro pubblico dei certificati)' },
  { id: 'intesa-sanpaolo', nome: 'Intesa Sanpaolo', cat: 'banche', url: 'https://www.intesasanpaolo.com/', check: 'https://api.intesasanpaolo.com/api/core-secbankispweb/idra0/secbankispweb/oauth/v2/authorize', cosa: 'il server di accesso dell’home banking (api.intesasanpaolo.com, usato dalla pagina «Accedi» del sito)', server: ['login-app.intesasanpaolo.com', 'app-api.intesasanpaolo.com'] },
  { id: 'app-intesa', nome: 'App Intesa Sanpaolo', cat: 'banche', url: 'https://www.intesasanpaolo.com/', check: 'https://login-app.intesasanpaolo.com/', cosa: 'il server di accesso dell’app (login-app.intesasanpaolo.com, dal registro pubblico dei certificati)', server: ['app-api.intesasanpaolo.com'] },
  { id: 'unicredit', nome: 'UniCredit', cat: 'banche', url: 'https://www.unicredit.it/', server: ['m.unicredit.it', 'mgi.api.unicredit.it', 'mgi-auth.api.unicredit.it'] },
  { id: 'mobile-banking-unicredit', nome: 'Mobile banking UniCredit', cat: 'banche', url: 'https://www.unicredit.it/', server: ['mgi.api.unicredit.it', 'mgi-auth.api.unicredit.it'], check: 'https://m.unicredit.it/mobilebanking/index.html', cosa: 'il mobile banking web di UniCredit (m.unicredit.it/mobilebanking, collegato dal sito della banca)' },
  { id: 'bper', nome: 'BPER Banca', cat: 'banche', url: 'https://www.bper.it/', server: ['homebanking.bpergroup.net'] },
  { id: 'home-banking-bper', nome: 'Home banking BPER', cat: 'banche', url: 'https://www.bper.it/', check: 'https://homebanking.bpergroup.net/bffe-user-data/public/click-to-call/v1/chat-availability', cosa: 'il server dell’home banking BPER (homebanking.bpergroup.net, a cui si collega la pagina di accesso)' },
  { id: 'bancoposta-online', nome: 'BancoPosta online', cat: 'banche', url: 'https://bancopostaonline.poste.it/', check: 'https://bancoposta.poste.it/bpol/public/homeBanking.html', cosa: 'la pagina di accesso a BancoPosta online (bancoposta.poste.it, pulsante «Accedi» di poste.it)', server: ['securelogin.mobile.poste.it', 'posteid.poste.it'] },
  { id: 'banco-bpm', nome: 'Banco BPM · YouWeb', cat: 'banche', url: 'https://youweb.bancobpm.it/', check: 'https://youweb.bancobpm.it/WEBHT/login', cosa: 'la pagina di accesso all’home banking YouWeb (youweb.bancobpm.it)', server: ['apimobile.bancobpm.it'] },
  { id: 'fineco', nome: 'Fineco', cat: 'banche', url: 'https://finecobank.com/it/online/', server: ['api.finecobank.com', 'private-api.finecobank.com'] },
  { id: 'app-fineco', nome: 'App Fineco', cat: 'banche', url: 'https://finecobank.com/it/online/', check: 'https://private-api.finecobank.com/', cosa: 'il server dell’area riservata e dell’app Fineco (private-api.finecobank.com, dal registro pubblico dei certificati)', server: ['api.finecobank.com'] },
  { id: 'mediolanum', nome: 'Banca Mediolanum', cat: 'banche', url: 'https://www.bancamediolanum.it/', server: ['www.bmedonline.it', 'sso-c-pro.mediolanum.it'] },
  { id: 'home-banking-mediolanum', nome: 'Home banking Mediolanum', cat: 'banche', url: 'https://www.bancamediolanum.it/', check: 'https://www.bmedonline.it/v3/api/ib-bff-sb-login/v1/private', cosa: 'la pagina di accesso all’home banking (sso-c-pro.mediolanum.it, a cui rimanda bmedonline.it)' },
  { id: 'bnl', nome: 'BNL', cat: 'banche', url: 'https://bnl.it/', server: ['banking.bnl.it', 'myhub.bnl.it'] },
  { id: 'home-banking-bnl', nome: 'Home banking BNL', cat: 'banche', url: 'https://bnl.it/', check: 'https://banking.bnl.it/login/ulink?cta=dashboard', cosa: 'la pagina di accesso all’home banking (banking.bnl.it, pulsante «Accedi» del sito)' },
  { id: 'mps', nome: 'Monte dei Paschi', cat: 'banche', url: 'https://www.mps.it/', server: ['online.mps.it', 'digital.mps.it'] },
  { id: 'home-banking-mps', nome: 'Home banking MPS', cat: 'banche', url: 'https://www.mps.it/', check: 'https://digital.mps.it/', cosa: 'la pagina di accesso al digital banking (digital.mps.it, collegato dal sito della banca)' },
  { id: 'credit-agricole', nome: 'Crédit Agricole Italia', cat: 'banche', url: 'https://www.credit-agricole.it/', server: ['nowbanking.credit-agricole.it', 'api.credit-agricole.it'] },
  { id: 'home-banking-credit-agricole', nome: 'Home banking Crédit Agricole', cat: 'banche', url: 'https://www.credit-agricole.it/', check: 'https://nowbanking.credit-agricole.it/API/Authentication/', cosa: 'il server di accesso all’home banking (nowbanking.credit-agricole.it, usato dalla pagina «Accesso Home Banking»)' },
  { id: 'ing', nome: 'ING Italia', cat: 'banche', url: 'https://www.ing.it/', check: 'https://areariservata.ing.it/login/', cosa: 'la pagina di accesso all’area riservata (areariservata.ing.it, pulsante «Accedi» del sito)', server: ['api.mobile.ing.it', 'mobile.ing.it', 'api.areariservata.ing.it'] },
  { id: 'app-ing', nome: 'App ING', cat: 'banche', url: 'https://www.ing.it/', check: 'https://api.mobile.ing.it/', cosa: 'il server dell’app mobile (api.mobile.ing.it, dal registro pubblico dei certificati)' },
  { id: 'sella', nome: 'Banca Sella', cat: 'banche', url: 'https://www.sella.it/', server: ['mobile.sella.it'] },
  { id: 'home-banking-sella', nome: 'Home banking Sella', cat: 'banche', url: 'https://www.sella.it/', check: 'https://www.sella.it/Autenticazione/step_one.jsp', cosa: 'il primo passo di accesso all’home banking (sella.it/Autenticazione, pulsante «Accedi» del sito)' },
  { id: 'widiba', nome: 'Widiba', cat: 'banche', url: 'https://www.widiba.it/', check: 'https://www.widiba.it/banca/online/it/login-widiba', cosa: 'la pagina di accesso all’home banking (widiba.it/banca/online, pulsante «Accedi» del sito)', server: ['mobile.widiba.it'] },
  { id: 'app-widiba', nome: 'App Widiba', cat: 'banche', url: 'https://www.widiba.it/', check: 'https://mobile.widiba.it/', cosa: 'il server dell’app mobile (mobile.widiba.it, dal registro pubblico dei certificati)' },
  { id: 'hype', nome: 'Hype', cat: 'banche', url: 'https://www.hype.it/', server: ['app.hype.it', 'auth.hype.it', 'api.hype.it'] },
  { id: 'app-hype', nome: 'App Hype', cat: 'banche', url: 'https://www.hype.it/', server: ['auth.hype.it', 'api.hype.it'], check: 'https://app.hype.it/', cosa: 'l’app web di Hype (app.hype.it)' },
  { id: 'revolut', nome: 'Revolut', cat: 'banche', url: 'https://www.revolut.com/it-IT/', check: 'https://api.revolut.com/user/current', cosa: 'il server a cui si collega l’app Revolut (api.revolut.com)', server: ['app.revolut.com'] },
  // Pagamenti
  { id: 'nexi', nome: 'Nexi', cat: 'pagamenti', url: 'https://www.nexi.it/', server: ['ecommerce.nexi.it', 'business.nexi.it', 'xpay.nexigroup.com'] },
  { id: 'nexi-xpay', nome: 'Nexi XPay · pagamenti e-commerce', cat: 'pagamenti', url: 'https://ecommerce.nexi.it/', check: 'https://ecommerce.nexi.it/ecomm/web/reporting/ReportLoginCs.jsp', cosa: 'la pagina di accesso al back office XPay per gli esercenti (ecommerce.nexi.it, collegata da nexi.it)', server: ['xpay.nexigroup.com', 'xpaydashboard.nexigroup.com'] },
  { id: 'nexi-business', nome: 'Nexi Business · area esercenti', cat: 'pagamenti', url: 'https://business.nexi.it/', check: 'https://business.nexi.it/api/services/login-service/prelogin/retrieve-user?isMobile=true', cosa: 'il server di accesso di Nexi Business, sito e app (business.nexi.it)' },
  { id: 'satispay', nome: 'Satispay', cat: 'pagamenti', url: 'https://www.satispay.com/', server: ['authservices.satispay.com', 'api.merchant.satispay.com', 'dashboard.satispay.com'] },
  { id: 'satispay-api', nome: 'Satispay · API esercenti', cat: 'pagamenti', url: 'https://authservices.satispay.com/', check: 'https://authservices.satispay.com/g_business/v1/payments', cosa: 'il server API per gli esercenti (authservices.satispay.com/g_business, l’indirizzo della documentazione ufficiale)' },
  { id: 'paypal', nome: 'PayPal', cat: 'pagamenti', url: 'https://www.paypal.com/it/home', check: 'https://api-m.paypal.com/v1/oauth2/token', cosa: 'il server di accesso alle API di PayPal (api-m.paypal.com), usato da negozi e app', server: ['www.paypal.com'] },
  { id: 'stripe', nome: 'Stripe · API pagamenti', cat: 'pagamenti', url: 'https://api.stripe.com/', server: ['dashboard.stripe.com'], ufficiale: { tipo: 'stripe', url: 'https://status.stripe.com' } },
  { id: 'sumup', nome: 'SumUp', cat: 'pagamenti', url: 'https://me.sumup.com/', check: 'https://api.sumup.com/', cosa: 'il server API di SumUp (api.sumup.com)', server: ['me.sumup.com', 'auth.sumup.com'], ufficiale: { tipo: 'statuspage', url: 'https://status.sumup.com' } },
  { id: 'axerve', nome: 'Axerve', cat: 'pagamenti', url: 'https://www.axerve.com/', check: 'https://ecomms2s.sella.it/gestpay/gestpayws/WSCryptDecrypt.asmx?wsdl', cosa: 'il server dei pagamenti online Axerve (ecomms2s.sella.it, ex GestPay)', server: ['ecomm.sella.it', 'mystore.axerve.com'] },
  { id: 'scalapay', nome: 'Scalapay', cat: 'pagamenti', url: 'https://www.scalapay.com/', check: 'https://api.scalapay.com/v3/configurations', cosa: 'il server API di Scalapay (api.scalapay.com)', server: ['portal.scalapay.com', 'login.scalapay.com'], ufficiale: { tipo: 'statuspage', url: 'https://status.scalapay.com' } },
  // Posta elettronica
  { id: 'libero-mail', nome: 'Libero Mail', cat: 'mail', url: 'https://login.libero.it/', posta: ['imapmail.libero.it:993', 'smtp.libero.it:465'] },
  { id: 'virgilio-mail', nome: 'Virgilio Mail', cat: 'mail', url: 'https://login.virgilio.it/', posta: ['in.virgilio.it:993', 'out.virgilio.it:465'] },
  { id: 'aruba-webmail', nome: 'Aruba Webmail', cat: 'mail', url: 'https://webmail.aruba.it/', cosa: 'la pagina di accesso alla webmail (webmail.aruba.it, che rimanda a loginpel.aruba.it)', server: ['loginpel.aruba.it'], posta: ['imaps.aruba.it:993', 'smtps.aruba.it:465'] },
  { id: 'yahoo-mail', nome: 'Yahoo Mail', cat: 'mail', url: 'https://mail.yahoo.com/', posta: ['imap.mail.yahoo.com:993', 'smtp.mail.yahoo.com:465'] },
  // Scuola
  { id: 'classeviva', nome: 'ClasseViva Spaggiari', cat: 'scuola', url: 'https://web.spaggiari.eu/', check: 'https://web.spaggiari.eu/rest/v1/auth/login', cosa: 'il server dell’app ClasseViva (web.spaggiari.eu/rest, a cui si collega l’app per l’accesso)' },
  { id: 'argo', nome: 'Argo · registro elettronico', cat: 'scuola', url: 'https://www.portaleargo.it/', check: 'https://auth.portaleargo.it/oauth2/auth?response_type=code&client_id=8aef9dcb-e948-462a-a239-646a54a44ddb&redirect_uri=https%3A%2F%2Fwww.portaleargo.it%2Ffamiglia%2Foidc-callback.html&scope=openid&state=statoservizi01', cosa: 'la pagina di accesso con le credenziali Argo (auth.portaleargo.it, usata da Portale Famiglia e didUP)', server: ['auth.portaleargo.it', 'didattica.portaleargo.it'] },
  // Telefonia
  { id: 'tim', nome: 'TIM', cat: 'tel', url: 'https://www.tim.it/', check: 'https://mytim.tim.it/login-authorize.html', cosa: 'la pagina di accesso a MyTIM (mytim.tim.it, collegata dall’«Accedi» del sito)', server: ['api.tim.it', 'mytim.tim.it'] },
  { id: 'vodafone', nome: 'Vodafone', cat: 'tel', url: 'https://www.vodafone.it/', check: 'https://az-apicweb.vodafone.it/rest/v70/user', cosa: 'il server di accesso al Fai da te Vodafone (az-apicweb.vodafone.it, indicato dal sito), che deve rispondere «OK»', server: ['landing.vodafone.it', 'apicweb.vodafone.it'], attendi: '{"health-check": "ok"}' },
  { id: 'windtre', nome: 'WindTre', cat: 'tel', url: 'https://www.windtre.it/', check: 'https://apigw.windtre.it/oauth2/token', cosa: 'il server dell’area clienti WINDTRE (apigw.windtre.it, usato da ac.windtre.it)', server: ['ac.windtre.it'] },
  { id: 'iliad', nome: 'Iliad', cat: 'tel', url: 'https://www.iliad.it/', check: 'https://www.iliad.it/account/', cosa: 'la pagina di accesso all’Area personale iliad (iliad.it/account, collegata dal sito)' },
  { id: 'fastweb', nome: 'Fastweb', cat: 'tel', url: 'https://www.fastweb.it/', check: 'https://fastweb.it/myfastweb/accesso/login/', cosa: 'la pagina di accesso a MyFastweb (fastweb.it/myfastweb/accesso, pulsante «MyFastweb» del sito)' },
  // Trasporti
  { id: 'trenitalia', nome: 'Trenitalia', cat: 'trasporti', url: 'https://www.trenitalia.com/', check: 'https://www.lefrecce.it/Channels.Website.BFF.WEB/website/locations/search?name=roma&limit=1', cosa: 'la ricerca delle stazioni del sito di acquisto biglietti (lefrecce.it), che deve rispondere con l’elenco', server: ['app.lefrecce.it'], attendi: '[{"id":' },
  { id: 'italo', nome: 'Italo', cat: 'trasporti', url: 'https://www.italotreno.com/', check: 'https://biglietti.italotreno.com/api/refreshtoken', cosa: 'il server di acquisto biglietti e accesso Italo (biglietti.italotreno.com), che dice anche se i sistemi di prenotazione rispondono', server: ['api-biglietti.italotreno.com', 'italoinviaggio.italotreno.com'], attendi: '{"isloggedin"', guasto: '"issoadown":true' },
  { id: 'telepass', nome: 'Telepass', cat: 'trasporti', url: 'https://www.telepass.com/', check: 'https://www.telepass.com/KTI/dashboard', cosa: 'la pagina di accesso all’area clienti Telepass (login.telepass.com, pulsante «Accedi» del sito)', server: ['login.telepass.com'] },
  // App
  { id: 'whatsapp', nome: 'WhatsApp', cat: 'app', url: 'https://web.whatsapp.com/', check: 'https://web.whatsapp.com/ws/chat', cosa: 'il server di chat a cui si collega WhatsApp Web (web.whatsapp.com/ws/chat)', server: ['g.whatsapp.net', 'v.whatsapp.net', 'mmg.whatsapp.net'] },
  { id: 'instagram', nome: 'Instagram', cat: 'app', url: 'https://www.instagram.com/', check: 'https://www.instagram.com/accounts/login/', cosa: 'la pagina di accesso a Instagram (instagram.com/accounts/login)', server: ['i.instagram.com', 'static.cdninstagram.com'] },
  { id: 'facebook', nome: 'Facebook', cat: 'app', url: 'https://www.facebook.com/', check: 'https://graph.facebook.com/', cosa: 'il server Graph API a cui si collegano le app di Facebook (graph.facebook.com)', server: ['edge-mqtt.facebook.com', 'static.xx.fbcdn.net'] },
  { id: 'gmail', nome: 'Gmail', cat: 'mail', url: 'https://mail.google.com/', ufficiale: { tipo: 'google', url: 'https://www.google.com/appsstatus/dashboard/', prodotto: 'Gmail' }, posta: ['imap.gmail.com:993', 'smtp.gmail.com:465'] },
  { id: 'outlook', nome: 'Outlook', cat: 'mail', url: 'https://outlook.office.com/', server: ['outlook.office365.com', 'login.microsoftonline.com', 'outlook.cloud.microsoft'], posta: ['outlook.office365.com:993', 'smtp.office365.com:587'] },
  { id: 'microsoft-365', nome: 'Microsoft 365', cat: 'mail', url: 'https://www.office.com/', server: ['outlook.office365.com', 'teams.microsoft.com', 'm365.cloud.microsoft'], check: 'https://login.microsoftonline.com/', cosa: 'il server di accesso di Microsoft (login.microsoftonline.com), da cui dipendono Outlook, Teams e Office' },
  { id: 'teams', nome: 'Microsoft Teams', cat: 'app', url: 'https://teams.microsoft.com/', check: 'https://teams.microsoft.com/api/authsvc/v1.0/authz', cosa: 'il servizio di accesso di Teams (teams.microsoft.com/api/authsvc), chiamato dall’app subito dopo il login', server: ['login.microsoftonline.com', 'presence.teams.microsoft.com', 'teams.cloud.microsoft'] },
  { id: 'chatgpt', nome: 'ChatGPT', cat: 'app', url: 'https://chatgpt.com/', check: 'https://chatgpt.com/backend-api/me', cosa: 'il server delle conversazioni di ChatGPT (chatgpt.com/backend-api)', server: ['auth.openai.com', 'cdn.oaistatic.com'], ufficiale: { tipo: 'statuspage', url: 'https://status.openai.com' } },
  { id: 'amazon', nome: 'Amazon.it', cat: 'app', url: 'https://www.amazon.it/', check: 'https://www.amazon.it/gp/sign-in.html', cosa: 'la pagina di accesso ad Amazon.it (pulsante «Accedi» del sito)', server: ['m.media-amazon.com'] },
  { id: 'youtube', nome: 'YouTube', cat: 'app', url: 'https://www.youtube.com/', check: 'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=jNQXAC9IVRw&format=json', cosa: 'il server dei video di YouTube, interrogato su un video pubblico (youtube.com/oembed)', server: ['youtubei.googleapis.com', 'i.ytimg.com', 'redirector.googlevideo.com'], attendi: '{"title"' },
  { id: 'tiktok', nome: 'TikTok', cat: 'app', url: 'https://www.tiktok.com/', check: 'https://www.tiktok.com/oembed?url=https://www.tiktok.com/@scout2015/video/6718335390845095173', cosa: 'il server dei video di TikTok, interrogato su un video pubblico (tiktok.com/oembed)', server: ['webcast.tiktok.com'], attendi: '{"version"' },
  { id: 'telegram', nome: 'Telegram', cat: 'app', url: 'https://web.telegram.org/', check: 'https://venus.web.telegram.org/apiw1', cosa: 'il server web di Telegram per l’Europa (venus.web.telegram.org) e i data center delle app sulla porta 443', server: ['149.154.167.50', '149.154.167.91'] },
  { id: 'netflix', nome: 'Netflix', cat: 'app', url: 'https://www.netflix.com/it/', check: 'https://www.netflix.com/login', cosa: 'la pagina di accesso a Netflix (netflix.com/login)', server: ['web.prod.cloud.netflix.com', 'assets.nflxext.com'] },
  { id: 'dazn', nome: 'DAZN', cat: 'app', url: 'https://www.dazn.com/it-IT/', check: 'https://startup.core.indazn.com/v1/main/web?Platform=web&LandingPageKey=generic&Languages=it-IT', cosa: 'il server di avvio dell’app DAZN (startup.core.indazn.com), interrogato da sito e app all’apertura', server: ['authentication-prod.ar.indazn.com', 'ott-authz-bff-prod.ar.indazn.com'] },
  { id: 'sky-go', nome: 'Sky Go', cat: 'app', url: 'https://skygo.sky.it/', check: 'https://www.sky.it/login', cosa: 'la pagina di accesso con Sky iD (sky.it/login), usato anche per entrare in Sky Go', server: ['tm.apid.sky.it'] },
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
