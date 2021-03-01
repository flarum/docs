<template>
  <outdated-it class="blue"></outdated-it>
</template>

# Formattazione

Flarum usa la potente libreria [s9e TextFormatter](https://github.com/s9e/TextFormatter) per formattare i post dal semplice markup in HTML. Dovresti familiarizzare con [come funziona TextFormatter](https://s9etextformatter.readthedocs.io/Getting_started/How_it_works/) prima di utilizzarlo.

In Flarum, il contenuto del post è formattato con una configurazione TextFormatter minima per impostazione predefinita. Le estensioni ** Markdown ** e ** BBCode ** in bundle abilitano semplicemente i rispettivi plugin.

## Configurazione

Puoi configurare l'istanza di TextFormatter `Configurator`, così come eseguire la logica personalizzata durante l'analisi e il rendering, utilizzando l'estensione `Formatter`:

```php
use Flarum\Extend;
use Psr\Http\Message\ServerRequestInterface as Request;
use s9e\TextFormatter\Configurator;
use s9e\TextFormatter\Parser;
use s9e\TextFormatter\Renderer;

return [
    (new Extend\Formatter)
        // Aggiungi la configurazione del formattatore di testo personalizzato
        ->configure(function (Configurator $config) {
            $config->BBCodes->addFromRepository('B');
        })
        // Modifica il testo grezzo prima che venga analizzato.
        // Questa callback dovrebbe restituire il testo modificato.
        ->parse(function (Parser $parser, $context, $text) {
            // logica personalizzata qui
            return $newText;
        })
        //Modificare l'XML di cui eseguire il rendering.
        // il suo callback dovrebbe restituire il nuovo XML.
        // Ad esempio, nell'estensione menzioni, viene utilizzato per
        // fornire il nome utente e il nome visualizzato dell'utente menzionato.
        // Assicurati che l'ultimo argomento $request sia annullabile (o omesso completamente).
        ->render(function (Renderer $renderer, $context, $xml, Request $request = null) {
            // logica personalizzata qui
            return $newXml;
        })
];
```

Una buona conoscenza di TextFormatter, ti consentirà di ottenere molti risultati, dalle semplici aggiunte di tag BBCode a compiti di formattazione più complessi come l'estensione ** Mentions ** di Flarum.
