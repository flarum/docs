<template>
  <outdated-it class="blue"></outdated-it>
</template>

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

I "permessi" Flarum sono implementati come semplici stringhe e associati a gruppi in una tabella di pseudo-giunzione (non è una vera relazione, ma il concetto è lo stesso).
Questo è in realtà tutto ciò che sta facendo la griglia delle autorizzazioni nella dashboard di amministrazione: stai aggiungendo e rimuovendo queste stringhe di autorizzazione dai gruppi.
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

:::warning Utilizzare l'autorizzazione appropriata
Le autorizzazioni sono solo una parte del puzzle: se imponi che un utente può eseguire un'azione, dovresti usare il [sistema di autorizzazione](authorization.md) di Flarum.
:::

### Aggiunta di autorizzazioni personalizzate

Poiché le autorizzazioni sono solo stringhe, non è necessario "registrare" formalmente un'autorizzazione ovunque: è necessario solo un modo per gli amministratori di assegnare tale autorizzazione ai gruppi.
Possiamo farlo estendendo il componente del frontend `flarum/components/PermissionGrid`. Per esempio:

```js
import { extend } from 'flarum/extend';
import PermissionGrid from 'flarum/components/PermissionGrid';

export default function() {
  extend(PermissionGrid.prototype, 'moderateItems', items => {
    items.add('tag', {
      icon: 'fas fa-tag',  // Classi CSS per l'icona. Generalmente in formato fontawesome, anche se puoi usare anche il tuo CSS personalizzato.
      label: app.translator.trans('flarum-tags.admin.permissions.tag_discussions_label'),
      permission: 'discussion.tag'  // La stringa di autorizzazione.
    }, 95);
  });
}
```

Per impostazione predefinita, le autorizzazioni vengono concesse solo agli amministratori. Se desideri rendere disponibile un'autorizzazione ad altri gruppi per impostazione predefinita, dovrai utilizzare una [migrazione dei dati](data.md#migrations) per aggiungere righe per i gruppi pertinenti. Se desideri eseguire questa operazione, ti consigliamo ** VIVAMENTE ** di assegnare autorizzazioni predefinite solo a uno dei [gruppi riservati](#groups).
