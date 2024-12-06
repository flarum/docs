# Aggiornamenti per Beta 16

La Beta 16 finalizza l'API extender PHP, introduce una libreria di test e le tipizzazioni JS, passa all'utilizzo di namespace per le importazioni JS, aumenta la robustezza della dipendenza dalle estensioni e consente l'override deli percorsi, tra le altre funzionalità.

:::tip

Se hai bisogno di aiuto per alcune modifiche o utilizzare le nuove funzionalità, si prega di avviare una discussione sul [forum della community](https://discuss.flarum.org/t/extensibility) o nella [chat Discord](https://flarum.org/discord/).

:::

## Frontend

- È stata introdotta una nuova astrazione del driver dell'editor, che consente alle estensioni di sostituire l'editor predefinito basato sull'area di testo con soluzioni più avanzate.
- I componenti `TextEditor` e `TextEditorButton`, così come `BasicEditorDriver` (che rimpiazza `SuperTextarea`) è stato spostato da `forum` a `common`.
- I namespace `forum`, `admin`, e `common` dovrebbero essere usati durante l'importazione. Quind invece di `import Component from 'flarum/Component'`, utilizzate `import Component from 'flarum/common/Component`. Il supporto per i vecchi stili di importazione sarà deprecato con la versione stabile e rimosso con Flarum 2.0.
- È stata rilasciata una libreria di digitazione per supportare il completamento automatico dell'editor per lo sviluppo del frontend, installabile tramite `npm install --save-dev flarum@0.1.0-beta.16`.
- Le categorie di estensioni sono state semplificate fino a `feature`, `theme`, e `language`.

## Backend

### Extender

- Tutti gli extender che supportano callback / chiusure ora supportano funzioni globali come `'boolval'` e funzioni array-type come `[ClassName::class, 'methodName']`.
- L'estensore `Settings` e metodo `serializeToFrontend` ora supporta un valore predefinito come quarto argomento.
- L'estensore `Event` ora supporta la registrazione di abbonati a più eventi contemporaneamente tramite metodo `subscribe`.
- L'estensore `Notification` utilizza ora il metodo `beforeSending`, che consente di modificare l'elenco dei destinatari prima che venga inviata una notifica.
- Il metodo `mutate` di `ApiSerializer` è ora deprecato, e rinominato come `attributes`.
- Il metodo `remove` negli estensori `Route` e `Frontend` può essere utilizzato per rimuovere (e quindi sostituire) le rotte.
- L'estensore `ModelPrivate` rimpiazza l'evento `GetModelIsPrivate`, ormai deprecato.
- I metodi sull'estensore `Auth` rimpiazzano l'evento `CheckingPassword`, ormai deprecato.
- Tutti gli eventi relativi alla ricerca sono ora deprecati a favore di estensori quali `SimpleFlarumSearch` e `Filter`; spiegato meglio qui sotto.

### Laravel e Symfony

Aggiornamenti beta 16 dalla v6.x alla v8.x dei componenti Laravel e dalla v4 alla v5 dei componenti Symfony. Consulta le rispettive guide all'upgrade di ciascuna per le modifiche che potresti dover apportare alle tue estensioni.
La modifica più sostanziale è la deprecazione di `Symfony\Component\Translation\TranslatorInterface` in favore di `Symfony\Contracts\Translation\TranslatorInterface`. Il primo verrà rimosso nella beta 17.

### Funzioni Helper

I rimanenti helper `app` e `event` sono ora deprecati. `app` è stato rimpiazzato con `resolve`.

Poiché alcune estensioni Flarum utilizzano librerie Laravel che presumono l'esistenza di alcuni helper globali, abbiamo ricreato alcuni helper comunemente usati nel pacchetto [flarum/laravel-helpers](https://github.com/flarum/laravel-helpers). Questi helper NON dovrebbero essere usati direttamente nel codice di estensione Flarum; sono disponibili in modo che le librerie basate su Laravel che si aspettano che esistano non funzionino male.

### Cambiamenti alla Ricerca

Come parte dei nostri continui sforzi per rendere il sistema di ricerca di Flarum più flessibile, abbiamo rifattorizzato parecchio codice nella beta 16.
In particolare, il filtraggio e la ricerca sono ora trattati come meccanismi diversi e hanno condutture ed estensori separati.
In sostanza, se una query ha `filter[q]` come parametro, verrà considerato come una ricerca e tutti gli altri parametri del filtro verranno ignorati. In caso contrario, verrà gestito dal sistema di filtraggio. Ciò consentirà alla fine di gestire le ricerche da driver alternativi (forniti dalle estensioni), come ElasticSearch, senza impattare i filtri (es. caricamento discussioni recenti). Le classi comuni a entrambi i sistemi sono state spostate sotto il namespace `Query`.

Le implementazioni di filtro e ricerca predefinita di Core (denominate SimpleFlarumSearch) sono abbastanza simili, poiché entrambe sono alimentate dal database. L'API controller `List` richiama i metodi `search` / `filter` in una sottoclasse specifica delle risorse di `Flarum\Search\AbstractSearcher` o `Flarum\Filter\AbstractFilterer`. Gli argomenti sono un'istanza di `Flarum\Query\QueryCriteria`, oltre a informazioni su ordinamento, offset e limite. Entrambi i sistemi restituiscono un'istanza di `Flarum\Query\QueryResults`, che è effettivamente un involucro attorno a una collezione di modelli Eloquent.

Anche i sistemi predefiniti sono in qualche modo simili nella loro implementazione. `Filterer`applica filtri (implementando `Flarum\Filter\FilterInterface`) in base ai parametri della query nel modulo `filter[FILTER_KEY] = FILTER_VALUE` (o `filter[-FILTER_KEY] = FILTER_VALUE` per filtri negati). SimpleFlarumSearch `Searcher` divide il parametro `filter[q]` da spazi in "termini", applica Gambits (implementando `Flarum\Search\GambitInterface`) che corrispondono ai termini e quindi applicano "Fulltext Gambit" per cercare in base a "termini" che non corrispondono ad un "auxiliary gambit". Entrambi i sistemi applicano quindi l'ordinamento, un offset e un limite di conteggio dei risultati e consentono alle estensioni di modificare il risultato della query tramite `searchMutators` o `filterMutators`.

Le estensioni aggiungono "gambits" e "search mutators" per classi `Searcher` tramite estensore `SimpleFlarumSearch`. Possono aggiungere filtri a classi `Filterer` tramite  estensore`Filter`.

Per quanto riguarda l'aggiornamento, tieni presente quanto segue:

- Cerca le mutazioni registrate con eventi `Searching`, per le discussioni e gli utenti verranno applicate le ricerche durante la fase di mutazione della ricerca tramite uno strato BC temporaneo. NON verranno applicati ai filtri. Questo è un cambiamento decisivo. Questi eventi sono stati deprecati.
- Search gambits registrati con eventi `ConfigureUserGambits` e `ConfigureDiscussionGambits` verrà applicato al ricercatore tramite un layer BC temporaneo. NON verranno applicati ai filtri. Questo è un cambiamento decisivo. Questi eventi sono stati deprecati.
- Filtri post registrati tramite eventi `ConfigurePostsQuery` verrà applicato ai filtri dei post tramite un layer BC temporaneo. Quell'evento è stato deprecato.

### Libreria di test

Il pacchetto `flarum/testing` fornisce utilità per test backend automatizzati basati su PHPUnit. Vedi [documentazione test](testing.md) per info.

### Dipendenze opzionali

La Beta 15 ha introdotto le "dipendenze delle estensioni", che richiedono tutte le estensioni elencate in `composer.json` e nella sezione `require` da abilitare prima che la tua estensione possa essere utilizzata.

Con la beta 16, puoi specificare "dipendenze opzionali" elencando i nomi dei pacchetti del composer come un array nella tua estensione `extra.flarum-extension.optional-dependencies`. Qualsiasi dipendenza facoltativa abilitata verrà avviata prima dell'estensione, ma non è necessaria per l'abilitazione di quest'ultima.

### Access Token e cambiamenti all'autenticazione

#### Cambiamenti Estensioni API

La firma per vari metodi relativi all'autenticazione è stata modificata in `$token` come parametro invece di `$userId`. Altre modifiche sono il risultato del passaggio da `$lifetime` a `$type`

- `Flarum\Http\AccessToken::generate($userId)` non accetta più `$lifetime` come secondo parametro. Il parametro è stato mantenuto per compatibilità con le versioni precedenti ma non ha alcun effetto. Verrà rimosso nella beta 17.
- `Flarum\Http\RememberAccessToken::generate($userId)` dovrebbe essere usato per creare token di accesso da ricordare.
- `Flarum\Http\DeveloperAccessToken::generate($userId)` dovrebbe essere utilizzato per creare token di accesso sviluppatore (non scadono).
- `Flarum\Http\SessionAccessToken::generate()` può essere utilizzato come alias per `Flarum\Http\AccessToken::generate()`. Verrà deprecato `AccessToken::generate()` in futuro.
- `Flarum\Http\Rememberer::remember(ResponseInterface $response, AccessToken $token)`: passare `AccessToken` è stato deprecato. Passa un'istanza di `RememberAccessToken` al suo posto. Come livello di compatibilità temporaneo, il passaggio di qualsiasi altro tipo di token lo convertirà in un token di ricordo. Come livello di compatibilità temporaneo, il passaggio di qualsiasi altro tipo di token lo convertirà in un token di ricordo.
- `Flarum\Http\Rememberer::rememberUser()` è deprecata. Invece dovresti creare / recuperare un token manualmente con `RememberAccessToken::generate()` e passarlo a `Rememberer::remember()`
- `Flarum\Http\SessionAuthenticator::logIn(Session $session, $userId)` come secondo parametro è stato deprecato ed è stato sostituito con `$token`. Viene mantenuta la compatibilità con le versioni precedenti. Nella beta 17, la firma del secondo metodo del parametro cambierà in `AccessToken $token`.
- `AccessToken::generate()` ora salva il modello nel database prima di restituirlo.
- `AccessToken::find($id)` or `::findOrFail($id)` non può più essere utilizzato per trovare un token, perché la chiave primaria è stata modificata da `token` a `id`. Invece puoi utilizzare `AccessToken::findValid($tokenString)`
- Si consiglia di utilizzare `AccessToken::findValid($tokenString): AccessToken` o `AccessToken::whereValid(): Illuminate\Database\Eloquent\Builder` per trovare un token. Ciò consentirà automaticamente alla richiesta di restituire solo token validi. Sui forum con bassa attività questo aumenta la sicurezza poiché l'eliminazione automatica dei token obsoleti avviene in media solo ogni 50 richieste.

#### Cambiamenti sessioni Symfony

Se stai accedendo o manipolando direttamente l'oggetto sessione di Symfony, sono state apportate le seguenti modifiche:

- L'attributo `user_id` non è più utilizzato. `access_token` è ora utilizzato al suo posto. È una stringa che mappa alla colonna `token` della tabella nel database `access_tokens`.

Per recuperare l'utente corrente dall'interno di un'estensione Flarum, la soluzione ideale che era già presente in Flarum è quella di utilizzare `$request->getAttribute('actor')` che restituisce un istanza di `User` (quale potrebbe essere `Guest`)

Per recuperare l'istanza del token da Flarum, puoi usare `Flarum\Http\AccessToken::findValid($tokenString)`

Per recuperare i dati utente da un'applicazione non Flarum, dovrai effettuare una richiesta di database aggiuntiva per recuperare il token. L' user ID è presente come `user_id` nella tabella \`access_tokens.

#### Cambiamenti creazione Token

La proprietà `lifetime` degli access token è stata rimossa. I token ora sono token di `session` con durata di 1 ora dopo l'ultima attività, o i token `session_remember` con 5 anni di vita dopo l'ultima attività.

Il parametro `remember` precedentemente disponibile sull'endopoint `POST /login` è stato redo disponibile in `POST /api/token`. Non restituisce il cookie di memorizzazione stesso, ma il token restituito può essere utilizzato come cookie di memorizzazione.

Il parametro `lifetime` di `POST /api/token` è stato deprecato e verrà rimosso in Flarum beta 17. È stata fornita una compatibilità con le versioni precedenti parziale laddove un valore `lifetime` con più di 3600 secondi viene interpretato come `remember=1`. Valori inferiori a 3600 secondi danno come risultato un normale token di non ricordo.

Nuovi token `developer` tokens that don't expire have been introduced, che non scadono sono stati introdotti, tuttavia non possono essere attualmente creati tramite l'API REST. Gli sviluppatori possono creare token per sviluppatori da un'estensione utilizzando `Flarum\Http\DeveloperAccessToken::generate($userId)`.

Se hai creato manualmente token nel database dall'esterno di Flarum, la colonna `type` è ora richiesta e deve contenere `session`, `session_remember` o `developer`. I token di tipo non riconosciuto non possono essere utilizzati per l'autenticazione, ma non verranno nemmeno eliminati dal garbage collector. In una versione futura le estensioni potranno registrare tipi di token di accesso personalizzati.

#### Cambiamenti all'utilizzo dei token

I [problemi di sicurezza in Flarum](https://github.com/flarum/core/issues/2075) causavano la non scadenza dei token. Ciò ha avuto un impatto sulla sicurezza limitato poiché i token sono caratteri lunghi e unici. Tuttavia, le integrazioni personalizzate che hanno salvato un token in un database esterno per un uso successivo potrebbero scoprire che i token non funzionano più se non sono stati utilizzati di recente.

Se utilizzi token di accesso di breve durata per qualsiasi scopo, prendi nota del tempo di scadenza di 1 ora. La scadenza si basa sull'ora dell'ultimo utilizzo, quindi rimarrà valida finché continuerà ad essere utilizzata.

A causa della grande quantità di token scaduti accumulati nel database e del fatto che la maggior parte dei token non è mai stata utilizzata più di una volta durante il processo di accesso, abbiamo scelto di eliminare tutti i token di accesso per una durata di 3600 secondi come parte della migrazione , Tutti i token rimanenti sono stati convertiti in `session_remember`.

#### Ricorda cookie

Il cookie di memorizzazione funziona ancora come prima, ma sono state apportate alcune modifiche che potrebbero interrompere implementazioni insolite.

Ora accedi solo ai token creati con opzione `remember`. Qualsiasi altro tipo di token verrà ignorato. Ciò significa che se crei un token con `POST /api/token` e lo inserisci manualmente nel cookie, devi assicurati di aver impostato `remember=1` durante la sua creazione.

#### Scadenza della sessione Web

Nelle versioni precedenti di Flarum, una sessione poteva essere mantenuta in vita per sempre fino a quando i file della sessione di Symfony non venivano cancellati dal disco.

Ora le sessioni sono collegate ai token di accesso. Un token in fase di eliminazione o in scadenza terminerà automaticamente la sessione web collegata.

Un token collegato a una sessione Web verrà ora automaticamente eliminato dal database quando l'utente fa clic su Logout. Ciò impedisce il riutilizzo di qualsiasi token rubato, ma potrebbe interrompere l'integrazione personalizzata che in precedenza utilizzava un singolo token di accesso sia in una sessione Web che in qualcos'altro.

### Varie

- L'indirizzo IP è ora disponibile nelle richieste tramite `$request->getAttribute('ipAddress')`
- Le policy possono ora restituire `true` e `false` come alias per `$this->allow()` e `$this->deny()`, rispettivamente.
- I permessi `user.edit` sono stati divisi in `user.editGroups`, `user.editCredentials` (per email, username, e password), e `user.edit` (per altri attributi).
- Ci sono ora permessi (`bypassTagCounts`) che consentono agli utenti di ignorare i requisiti di conteggio dei tag.
- Flarum ora supporta PHP 7.3 - PHP 8.0, con supporto per PHP 7.2 ufficialmente abbandonato.
