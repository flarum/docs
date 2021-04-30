# Aspetto e Temi

Anche se abbiamo lavorato duramente per rendere Flarum il più bello possibile, ogni comunità probabilmente vorrà apportare alcune modifiche grafiche o di stile per adattarlo alle proprie esigenze.

## Pannello di amministrazione

L'aspetto del [pannello di amministrazione](../admin.md) è un ottimo punto da cui iniziare a personalizzare il tuo forum. Da qui infatti si può:

- Scegliere i colori principali del forum
- Attivare o meno la dark mode e scegliere il colore dell'header
- Caricare il tuo logo e favicon (l'icona visualizzata ai browser)
- Aggiungere html per personalizare header e footer
- Aggiungere [LESS/CSS](#css-theming) per cambiare la visualizzazione degli elementi

## Il CSS nei temi

CSS è un linguaggio per fogli di stile che indica ai browser come visualizzare gli elementi di una pagina web. Ci consente di modificare qualsiasi cosa, dai colori ai caratteri, alla dimensione degli elementi e al posizionamento delle animazioni. L'aggiunta di CSS personalizzati può essere un ottimo modo per modificare l'aspetto di Flarum in modo che corrisponda al tema del tuo sito.

Un tutorial CSS va oltre lo scopo di questa documentazione, ma ci sono molte ottime risorse online per apprendere le basi dei fogli di stile.

:::tip

Flarum actually uses LESS, which makes it easier to write CSS by allowing for variables, conditionals, and functions.

:::

## Estensioni

Flarum's flexible [extension system](extensions.md) allows you to add, remove, or modify practically any part of Flarum. If you want to make substantial theming modifications beyond changing colors/sizes/styles, a custom extension is definitely the way to go. To learn how to make an extension, check out our [extension documentation](extend/README.md)!
