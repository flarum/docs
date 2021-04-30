# Aggiornamenti per Beta 16

La Beta 16 finalizza l'API extender PHP, introduce una libreria di test e le tipizzazioni JS, passa all'utilizzo di namespace per le importazioni JS, aumenta la robustezza della dipendenza dalle estensioni e consente l'override deli percorsi, tra le altre funzionalità.

::: tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## Frontend

- È stata introdotta una nuova astrazione del driver dell'editor, che consente alle estensioni di sostituire l'editor predefinito basato sull'area di testo con soluzioni più avanzate.
- I componenti `TextEditor` e `TextEditorButton`, così come `BasicEditorDriver` (che rimpiazza `SuperTextarea`) è stato spostato da `forum` a `common`.
- I namespace `forum`, `admin`, e `common` dovrebbero essere usati durante l'importazione. Quind invece di `import Component from 'flarum/Component'`, utilizzate `import Component from 'flarum/common/Component`. Il supporto per i vecchi stili di importazione sarà deprecato con la versione stabile e rimosso con Flarum 2.0.
- È stata rilasciata una libreria di digitazione per supportare il completamento automatico dell'editor per lo sviluppo del frontend, installabile tramite `npm install --save-dev flarum@0.1.0-beta.16`.
- Le categorie di estensioni sono state semplificate fino a `feature`, `theme`, e `language`.

## Backend

### Estensori

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

Beta 16 upgrades from v6.x to v8.x of Laravel components and v4 to v5 of Symfony components. Please see the respective upgrade guides of each for changes you might need to make to your extensions. The most applicable change is the deprecation of `Symfony\Component\Translation\TranslatorInterface` in favor of `Symfony\Contracts\Translation\TranslatorInterface`. The former will be removed in beta 17.

### Funzioni Helper

The remaining `app` and `event` global helper functions have been deprecated. `app` has been replaced with `resolve`, which takes the name of a container binding and resolves it through the container.

Since some Flarum extensions use Laravel libraries that assume some global helpers exist, we've recreated some commonly used helpers in the [flarum/laravel-helpers](https://github.com/flarum/laravel-helpers) package. These helpers should NOT be used directly in Flarum extension code; they are available so that Laravel-based libraries that expect them to exist don't malfunction.

### Cambiamenti alla Ricerca

As part of our ongoing efforts to make Flarum's search system more flexible, we've made several refactors in beta 16. Most notably, filtering and searching are now treated as different mechanisms, and have separate pipelines and extenders. Essentially, if a query has a `filter[q]` query param, it will be treated as a search, and all other filter params will be ignored. Otherwise, it will be handled by the filtering system. This will eventually allow searches to be handled by alternative drivers (provided by extensions), such as ElasticSearch, without impacting filtering (e.g. loading recent discussions). Classes common to both systems have been moved to a `Query` namespace.

Core's filtering and default search (named SimpleFlarumSearch) implementations are quite similar, as both are powered by the database. `List` API controllers call the `search` / `filter` methods on a resource-specific subclass of `Flarum\Search\AbstractSearcher` or `Flarum\Filter\AbstractFilterer`. Arguments are an instance of `Flarum\Query\QueryCriteria`, as well as sort, offset, and limit information. Both systems return an instance of `Flarum\Query\QueryResults`, which is effectively a wrapper around a collection of Eloquent models.

The default systems are also somewhat similar in their implementation. `Filterer`s apply Filters (implementing `Flarum\Filter\FilterInterface`) based on query params in the form `filter[FILTER_KEY] = FILTER_VALUE` (or `filter[-FILTER_KEY] = FILTER_VALUE` for negated filters). SimpleFlarumSearch's `Searcher`s split the `filter[q]` param by spaces into "terms", apply Gambits (implementing `Flarum\Search\GambitInterface`) that match the terms, and then apply a "Fulltext Gambit" to search based on any "terms" that don't match an auxiliary gambit. Both systems then apply sorting, an offset, and a result count limit, and allow extensions to modify the query result via `searchMutators` or `filterMutators`.

Extensions add gambits and search mutators and set fulltext gambits for `Searcher` classes via the `SimpleFlarumSearch` extender. They can add filters and filter mutators to `Filterer` classes via the `Filter` extender.

With regards to upgrading, please note the following:

- Cerca le mutazioni registrate con eventi `Searching`, per le discussioni e gli utenti verranno applicate le ricerche durante la fase di mutazione della ricerca tramite uno strato BC temporaneo. NON verranno applicati ai filtri. Questo è un cambiamento decisivo. Questi eventi sono stati deprecati.
- Search gambits registrati con eventi `ConfigureUserGambits` e `ConfigureDiscussionGambits` verrà applicato al ricercatore tramite un layer BC temporaneo. NON verranno applicati ai filtri. Questo è un cambiamento decisivo. Questi eventi sono stati deprecati.
- Filtri post registrati tramite eventi `ConfigurePostsQuery` verrà applicato ai filtri dei post tramite un layer BC temporaneo. Quell'evento è stato deprecato.

### Libreria di test

The `flarum/testing` package provides utils for PHPUnit-powered automated backend tests. See the [testing documentation](testing.md) for more info.

### Dipendenze opzionali

Beta 15 introduced "extension dependencies", which require any extensions listed in your extension's `composer.json`'s `require` section to be enabled before your extension can be enabled.

With beta 16, you can specify "optional dependencies" by listing their composer package names as an array in your extension's `extra.flarum-extension.optional-dependencies`. Any enabled optional dependencies will be booted before your extension, but aren't required for your extension to be enabled.

### Access Token e cambiamenti all'autenticazione

#### Cambiamenti Estensioni API

The signature to various method related to authentication have been changed to take `$token` as parameter instead of `$userId`. Other changes are the result of the move from `$lifetime` to `$type`

- `Flarum\Http\AccessToken::generate($userId)` non accetta più `$lifetime` come secondo parametro. Il parametro è stato mantenuto per compatibilità con le versioni precedenti ma non ha alcun effetto. Verrà rimosso nella beta 17.
- `Flarum\Http\RememberAccessToken::generate($userId)` dovrebbe essere usato per creare token di accesso da ricordare.
- `Flarum\Http\DeveloperAccessToken::generate($userId)` dovrebbe essere utilizzato per creare token di accesso sviluppatore (non scadono).
- `Flarum\Http\SessionAccessToken::generate()` può essere utilizzato come alias per `Flarum\Http\AccessToken::generate()`. Verrà deprecato `AccessToken::generate()` in futuro.
- `Flarum\Http\Rememberer::remember(ResponseInterface $response, AccessToken $token)`: passare `AccessToken` è stato deprecato. Passa un'istanza di `RememberAccessToken` al suo posto. Come livello di compatibilità temporaneo, il passaggio di qualsiasi altro tipo di token lo convertirà in un token di ricordo. Nella beta 17 la firma del metodo cambierà per accettare solo `RememberAccessToken`.
- `Flarum\Http\Rememberer::rememberUser()` è deprecata. Invece dovresti creare / recuperare un token manualmente con `RememberAccessToken::generate()` e passarlo a `Rememberer::remember()`
- `Flarum\Http\SessionAuthenticator::logIn(Session $session, $userId)` come secondo parametro è stato deprecato ed è stato sostituito con `$token`. Viene mantenuta la compatibilità con le versioni precedenti. Nella beta 17, la firma del secondo metodo del parametro cambierà in `AccessToken $token`.
- `AccessToken::generate()` ora salva il modello nel database prima di restituirlo.
- `AccessToken::find($id)` or `::findOrFail($id)` non può più essere utilizzato per trovare un token, perché la chiave primaria è stata modificata da `token` a `id`. Invece puoi utilizzare `AccessToken::findValid($tokenString)`
- Si consiglia di utilizzare `AccessToken::findValid($tokenString): AccessToken` o `AccessToken::whereValid(): Illuminate\Database\Eloquent\Builder` per trovare un token. Ciò consentirà automaticamente alla richiesta di restituire solo token validi. Sui forum con bassa attività questo aumenta la sicurezza poiché l'eliminazione automatica dei token obsoleti avviene in media solo ogni 50 richieste.

#### Cambiamenti sessioni Symfony

If you are directly accessing or manipulating the Symfony session object, the following changes have been made:

- L'attributo `user_id` non è più utilizzato. `access_token` è ora utilizzato al suo posto. È una stringa che mappa alla colonna `token` della tabella nel database `access_tokens`.

To retrieve the current user from inside a Flarum extension, the ideal solution which was already present in Flarum is to use `$request->getAttribute('actor')` which returns a `User` instance (which might be `Guest`)

To retrieve the token instance from Flarum, you can use `Flarum\Http\AccessToken::findValid($tokenString)`

To retrieve the user data from a non-Flarum application, you'll need to make an additional database request to retrieve the token. The user ID is present as `user_id` on the `access_tokens` table.

#### Cambiamenti creazione Token

The `lifetime` property of access tokens has been removed. Tokens are now either `session` tokens with 1h lifetime after last activity, or `session_remember` tokens with 5 years lifetime after last activity.

The `remember` parameter that was previously available on the `POST /login` endpoint has been made available on `POST /api/token`. It doesn't return the remember cookie itself, but the token returned can be used as a remember cookie.

The `lifetime` parameter of `POST /api/token` has been deprecated and will be removed in Flarum beta 17. Partial backward compatibility has been provided where a `lifetime` value longer than 3600 seconds is interpreted like `remember=1`. Values lower than 3600 seconds result in a normal non-remember token.

New `developer` tokens that don't expire have been introduced, however they cannot be currently created through the REST API. Developers can create developer tokens from an extension using `Flarum\Http\DeveloperAccessToken::generate($userId)`.

If you manually created tokens in the database from outside Flarum, the `type` column is now required and must contain `session`, `session_remember` or `developer`. Tokens of unrecognized type cannot be used to authenticate, but won't be deleted by the garbage collector either. In a future version extensions will be able to register custom access token types.

#### Cambiamenti all'utilizzo dei token

A [security issue in Flarum](https://github.com/flarum/core/issues/2075) previously caused all tokens to never expire. This had limited security impact due to tokens being long unique characters. However custom integrations that saved a token in an external database for later use might find the tokens no longer working if they were not used recently.

If you use short-lived access tokens for any purpose, take note of the expiration time of 1h. The expiration is based on the time of last usage, so it will remain valid as long as it continues to be used.

Due to the large amount of expired tokens accumulated in the database and the fact most tokens weren't ever used more than once during the login process, we have made the choice to delete all access tokens a lifetime of 3600 seconds as part of the migration, All remaining tokens have been converted to `session_remember` tokens.

#### Ricorda cookie

The remember cookie still works like before, but a few changes have been made that could break unusual implementations.

Now only access tokens created with `remember` option can be used as remember cookie. Any other type of token will be ignored. This means if you create a token with `POST /api/token` and then place it in the cookie manually, make sure you set `remember=1` when creating the token.

#### Scadenza della sessione Web

In previous versions of Flarum, a session could be kept alive forever until the Symfony session files were deleted from disk.

Now sessions are linked to access tokens. A token being deleted or expiring will automatically end the linked web session.

A token linked to a web session will now be automatically deleted from the database when the user clicks logout. This prevents any stolen token from being re-used, but it could break custom integration that previously used a single access token in both a web session and something else.

### Varie

- L'indirizzo IP è ora disponibile nelle richieste tramite `$request->getAttribute('ipAddress')`
- Le policy possono ora restituire `true` e `false` come alias per `$this->allow()` e `$this->deny()`, rispettivamente.
- I permessi `user.edit` sono stati divisi in `user.editGroups`, `user.editCredentials` (per email, username, e password), e `user.edit` (per altri attributi).
- Ci sono ora permessi (`bypassTagCounts`) che consentono agli utenti di ignorare i requisiti di conteggio dei tag.
- Flarum ora supporta PHP 7.3 - PHP 8.0, con supporto per PHP 7.2 ufficialmente abbandonato.
