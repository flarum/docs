<template>
  <outdated-it class="blue"></outdated-it>
</template>

# Provider di servizi

Come notato in questa documentazione, Flarum utilizza [il contenitore dei servizi Laravel](https://laravel.com/docs/6.x/container) (o IoC container) per l'iniezione di dipendenze.
[I provider di servizi](https://laravel.com/docs/6.x/providers) consentono la configurazione e la modifica del backend Flarum a basso livello.
Il caso d'uso più comune per i provider di servizi è creare, modificare o sostituire i binding del contenitore.
Detto questo, i provider di servizi consentono l'accesso completo per eseguire qualsiasi logica necessaria durante l'avvio dell'applicazione con accesso al contenitore.

::: warning Solo per utenti avanzati!!!
A differenza di altri estensori, il livello del provider di servizi NON è basato sul caso d'uso e NON è considerato API pubblica. È soggetto a modifiche in qualsiasi momento, senza preavviso. E dovrebbe essere usato solo se sai cosa stai facendo e gli altri extender non soddisfano il tuo caso d'uso.
:::

## Processi di Boot di Flarum

Per comprendere i provider di servizi, devi prima capire l'ordine in cui Flarum si avvia. La maggior parte di questo accade in [Flarum\Foundation\InstalledSite](https://github.com/flarum/core/blob/master/src/Foundation/InstalledSite.php)

1. Il contenitore e l'applicazione vengono inizializzati e vengono registrati i collegamenti essenziali (configurazione, ambiente, logger)
2. Il metodo `register` di tutti i principali provider di servizi viene eseguito.
3. Il metodo `extend`di tutti gli extender utilizzati dalle estensioni sono avviati.
4. Il metodo `extend` di tutti gli extender utilizzati nel file Flarum `extend.php` è avviato.
5. Il metodo `boot` di tutti i provider di servizi principali è avviato.

## Provider di servizi personalizzato

Un provider di servizi personalizzato dovrebbe estendersi in `Flarum\Foundation\AbstractServiceProvider`, e può avere metodi `boot` e `register`. Per esempio:

```php
<?php

use Flarum\Foundation\AbstractServiceProvider;

class CustomServiceProvider extends AbstractServiceProvider
{
    public function register()
    {
        // custom logic here
    }

    public function boot()
    {
        // custom logic here
    }
}
```

Il metodo `register` verrà eseguito durante il passaggio (3) qui sopra, e il metodo `boot` verrà eseguito durante la fase (5). 
In entrambi i metodi, il contenitore è disponibile tramite `$this->app`.

Per registrare effettivamente il tuo provider di servizi personalizzato, puoi utilizzare l'extender `ServiceProvider` in `extend.php`:

```php
<?php

use Flarum\Extend;

return [
    // Other extenders
    (new Extend\ServiceProvider())
        ->register(CustomServiceProvider::class),
    // Other extenders
];
```
