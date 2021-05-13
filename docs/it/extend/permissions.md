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
$group->hasPermission('viewDiscussions');

// Enumera tutte le autorizzazioni dell'utente
$user->getPermissions();

// Controlla se l'utente fa parte di un gruppo con l'autorizzazione fornita
$user->hasPermission('viewDiscussions');
```

:::warning Use Proper Authorization

Permissions are just part of the puzzle: if you're enforcing whether a user can perform an action, you should use Flarum's [authorization system](authorization.md).

:::

## Permission Naming Conventions

Nothing is enforced, but we generally recommend the following convention for permission naming:

`extension-namespace.model-prefix.ability-name`.

The extension namespace ensures that your permission won't collide with other extensions.

The model prefix is useful in case you have different models but similar permissions (`flarum-sponsors.discussion.sponsor` vs `flarum-sponsors.post.sponsor`).

### "Magic" model namespaces

You may have seen some calls to `$actor->can` that don't use the full name of a permission; for example, `$actor->can('reply', $discussion)`, where the backing permission is actually called `discussion.reply`.

This is done in core to make authorization calls shorter and simpler. Essentially, if the second argument is a discussion, Core's [DiscussionPolicy](https://github.com/flarum/core/blob/bba6485effc088e38e9ae0bc8f25528ecbee3a7b/src/Discussion/Access/DiscussionPolicy.php#L39-L44) will check the `discussion.PROVIDED_ABILITY` permission automatically.

This can be used by extensions when a model namespace isn't present: for example, `$actor->can('someAbility, $discussion)` will check the `discussion.someAbility` permission if the `$discussion` argument is an instance of the `Discussion` model. However, this means you can't prefix your permissions with extension namespaces (or you have to put the extension namespace at the end).

These magic model-based conversions are applied to discussion, group, and user authorization checks. For posts, the logic is slightly different: `$actor->can('ability', $post)` will check `$actor->('abilityPosts, $post->discusssion)` on the post's discussion.

If you want to use authorization checks with an ability name that differs from the backing permission name, and these cases do not apply to your permission's naming, you'll have to use a custom policy.

See our [authorization documentation](authorization.md) for more information on the `can` method, policies, and how authorization checks are processed.

## Adding Custom Permissions

To learn more about adding permissions through the admin dashboard, see the [relevant documentation](admin.md).
