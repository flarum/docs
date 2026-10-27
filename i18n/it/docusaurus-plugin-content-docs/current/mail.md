# Configurazione Email

Qualsiasi comunità necessita di inviare e-mail per consentire la verifica, reimpostazioni della password, notifiche e altre comunicazioni agli utenti. Configurare il tuo forum per l'invio di email dovrebbe essere uno dei tuoi primi passi come amministratore: una configurazione errata causerà errori quando gli utenti tenteranno di registrarsi.

## Driver disponibili

Flarum fornisce diversi driver di default, e sono elencati e spiegati di seguito. Gli sviluppatori inoltre possono anche aggiungere [driver personalizzati tramite estensioni](extend/mail.md).

### SMTP

Questo è probabilmente il driver di posta elettronica più comunemente utilizzato, che consente di configurare un host, una porta / crittografia, un nome utente e una password per un servizio SMTP esterno. Nel campo crittografia sarà possibile utilizzare solamente `ssl` o `tls`.

### Mail

Il driver `mail` proverà a utilizzare il sistema di posta sendmail / postfix incluso in molti server di hosting. Devi installare e configurare correttamente sendmail sul tuo server affinché funzioni.

### Mailgun

Questo driver utilizza il tuo account [Mailgun](https://www.mailgun.com/) per inviare email. Avrai bisogno di una chiave segreta, così come il dominio e la regione reperibili dalla configurazione della tua mailgun.

Per utilizzare il driver mailgun, è necessario installare il pacchetto Guzzle (un client HTTP PHP). Puoi farlo eseguendo  `composer require guzzlehttp/guzzle:^6.0|^7.0` nella tua directory principale di Flarum.

### Log

Il driver Log NON INVIA EMAIL,ed è utilizzato principalmente dagli sviluppatori. Scrive il contenuto di qualsiasi messaggio di posta elettronica nel file di registro in  `DIRECTORY_PRINCIPALE_FLARUM/storage/logs`.

## Email di prova

Dopo aver salvato una configurazione di posta elettronica, è possibile fare clic sul pulsante "Invia mail di prova" nella pagina Posta del pannello di amministratore per assicurarti che la tua configurazione funzioni. Se visualizzi un errore o non ricevi un'email, modifica la configurazione e riprova. Assicurati di controllare lo spam se non ci sono errori e se non viene visualizzato nulla nella tua posta in arrivo.
