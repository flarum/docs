# Gruppi e autorizzazioni

Oltre ad etichettare i ruoli, il sistema di gruppo di Flarum è un modo per applicare le autorizzazioni a segmenti di utenti.

## Gruppi

Flarum ha diversi "gruppi riservati":

- Il gruppo di amministratori dispone di ID `1`. Gli utenti di questo gruppo dispongono di tutte le autorizzazioni.
- Tutti gli utenti (indipendentemente dallo stato di autenticazione) vengono automaticamente inseriti nel gruppo Guest (ID `2`)
- Tutti gli utenti che hanno effettuato l'accesso vengono automaticamente inseriti nel gruppo Membri (ID `3`)

I gruppi riservati funzionano effettivamente come qualsiasi altro gruppo, esistente come record nel database. Hanno solo proprietà speciali per quanto riguarda il modo in cui sono assegnati (per ospiti e membri) o cosa possono fare (per amministratore).

Durante l'installazione, Flarum creerà anche un gruppo moderatori con ID `4`, ma questo è solo per comodità: non ha un significato speciale.

Gli amministratori possono anche creare nuovi gruppi tramite la dashboard dell'amministratore. Gli utenti possono essere aggiunti o rimossi dai gruppi dalla loro pagina utente.

## Permessi

I "permessi" Flarum sono implementati come semplici stringhe e associati a gruppi in una tabella di pseudo-giunzione (non è una vera relazione, ma il concetto è lo stesso). Questo è in realtà tutto ciò che sta facendo la griglia delle autorizzazioni nella dashboard di amministrazione: stai aggiungendo e rimuovendo queste stringhe di autorizzazione dai gruppi.

Non esiste alcuna associazione diretta tra utenti e permessi: quando controlliamo i permessi di un utente, stiamo effettivamente enumerando i permessi per tutti i gruppi dell'utente.

I gruppi e gli utenti dispongono di metodi pubblici per controllare le loro autorizzazioni. Alcuni di quelli più comunemente usati sono:

```php
// Una relazione eloquente con le autorizzazioni del gruppo
$group->permissions();

// Controlla se un gruppo dispone di un'autorizzazione
$group->hasPermission('viewForum');

// Enumera tutte le autorizzazioni dell'utente
$user->getPermissions();

// Controlla se l'utente fa parte di un gruppo con l'autorizzazione fornita
$user->hasPermission('viewForum');
```

Le autorizzazioni sono solo una parte del puzzle: se imponi che un utente può eseguire un'azione, dovresti usare il [sistema di autorizzazione](authorization.md) di Flarum.

I permessi sono solo parte del puzzle: se stai decidendo se un utente puù o non può eseguire un azione, dovresti usare il [sistema di autorizzazioni di Flarum](authorization.md).

:::

## Permessi e Nomi Convenzionali

Non sei obbligato, ma generalmente raccomandiamo di seguire una convenzione per i nomi dei permessi:

`extension-namespace.model-prefix.ability-name`.

Il namespace delle estensioni assicura che il tuo permesso non collida con altre estensioni.

Il prefisso del modello è utile nel caso in cui tu abbia diversi modelli ma permessi simili (`flarum-sponsors.discussion.sponsor` vs `flarum-sponsors.post.sponsor`).

### Namespaces "Magici"

Potresti aver visto alcune call a `$actor->can` che non usano il nome completo di un'autorizzazione; ad esempio, `$actor->can('reply', $discussion)`, dove il permesso è effettivamente chiamato `discussion.reply`.

Questo viene fatto nel core per rendere le call di autorizzazione più brevi e più semplici. In sostanza, se il secondo argomento è una discussione, la [DiscussionPolicy](https://github.com/flarum/core/blob/bba6485effc088e38e9ae0bc8f25528ecbee3a7b/src/Discussion/Access/DiscussionPolicy.php#L39-L44) del core controllerà automaticamente l'autorizzazione `discussione.PROVIDED_ABILITY`.

Può essere usato per le estensioni quando il namespace di un modello non è presente: per esempio, `$actor->can('someAbility, $discussion)` controllerà il permesso di `discussion.someAbility` se l'argomento `$discussion` è un'istanza del modello `Discussion`. Tuttavia, questo significa che non è possibile prefissare i permessi con i namespace delle estensioni (o è necessario mettere il namespace delle estensioni alla fine).

Queste conversioni magiche basate su modelli sono applicate ai controlli di discussione, gruppo e autorizzazione utente. Per i post, la logica è leggermente diversa: `$actor->can('ability', $post)` controllerà  `$actor->('abilityPosts, $post->discussion)`  sulla discussione del post.

Se si desidera utilizzare permessi e autorizzazioni aventi un nome diverso dal nome dell'autorizzazione di backing, si dovrà usare una permesso personalizzato.

Vedi la nostra [documentazione sulle autorizzazioni](authorization.md) per maggiori informazioni sul metodo `can`, le politiche e il modo in cui vengono elaborati i controlli di autorizzazione.

## Aggiunta di permessi personalizzati

Per saperne di più sull'aggiunta dei permessi tramite il pannello di amministrazione, consulta la [documentazione pertinente](admin.md).
