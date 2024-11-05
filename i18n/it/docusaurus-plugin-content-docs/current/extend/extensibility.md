# Estensibilità

In alcuni casi, potresti aver bisogno di altre estensioni per [estendere la tua estensione](extending-extensions.md).

## Backend

Le estensioni estendono il backend di Flarum Core tramite due meccanismi:

- [L'API extender](start.md#extenders)
- [Ascolto di eventi](backend-events.md)

Non a caso, puoi rendere estensibile la tua estensione tramite gli stessi meccanismi.

### Eventi personalizzati

Per conoscere gli eventi di dispatching e definirne di nuovi, consultare la [documentazione pertinente](backend-events.md).

### Extenders Personalizzati

Let's say you've developed an extension that adds an alternative search driver to Flarum, but you want to allow other extensions to add support for custom filters / sorts. Un estensore personalizzato potrebbe essere un la via giusta da seguire.

L'implementazione degli extender è in realtà abbastanza semplice. Queste sono le 3 fasi principali:

1. Vari metodi (e il costruttore) consentono al codice client di specificare le opzioni. Per esempio:
  - Which model / controller / service should be extended?
  - Quali modifiche si dovrebbero apportare?
2. Un metodo `extend` prende l'input dal passaggio 1, e lo applica modificando varie [container bindings](service-provider.md) e variabili statiche globali per ottenere l'effetto desiderato. Questa è la "implementazione" del composer. I metodi `extend` per tutte le estensioni abilitate vengono eseguiti come parte del processo di avvio di Flarum.
3. Facoltativamente, gli extender che implementano `Flarum\Extend\LifecycleInterface` possono avere i metodi `onEnable` e `onDisable`, che vengono eseguiti quando le estensioni che usano l'extender sono abilitate/disabilitate, e sono utili per attività come la cancellazione di varie cache.

Di conseguenza, per creare un estensore personalizzato, tutto ciò che devi fare è:

0. Definire una classe che implementa `Flarum\Extend\ExtenderInterface`.
1. Definire argomenti nel costruttore, e vari metodi. Tali metodi dovrebbero rappresentare "modifiche" concrete.
2. Implementa un metodo `extend` che modifica l'estensione (o Flarum), tipicamente estendendo/modificando i binding del container.
3. Facoltativamente, implementa `Flarum\Extend\LifecycleInterface` se è necessaria una pulizia su enable/disable.

Before designing your own extenders, we HIGHLY recommend looking through the implementations of [core's extenders](https://github.com/flarum/framework/tree/main/framework/core/src/Extend).

:::tip

Gli estensori personalizzati introdotti dalla tua estensione dovrebbero essere considerati API pubbliche. È possibile aggiungere test automatici tramite il nostro [pacchetto di test backend](testing.md).

:::

:::cautela

Gli estensori personalizzati NON devono essere usati per eseguire logiche arbitrarie durante il processo di avvio di Flarum. Questo è un lavoro per il [Service Providers](service-provider.md). Un modo semplice per controllare: se stai usando gli estensori che hai definito nella tua estensione, probabilmente stai facendo qualcosa di sbagliato.

:::

## Frontend

Se vuoi che altre estensioni siano in grado di utilizzare classi o funzioni definite nella tua estensione (riutilizzare o modificare tramite gli utils [extend/override](frontend.md)), dovrai esportarli nell'indice di `index.js` (tipicamente lo stesso luogo in cui si trova il tag [initializer](frontend.md) della tua estensione).

Per esempio:

```js
app.initializers.add('your-extension-id', () => {
  // Il codice della tua estensione andrà qui
})

export {
  // Tutto ciò che vuoi esportare invece andrà qui.
}
```
