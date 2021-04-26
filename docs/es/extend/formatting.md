# Formatting

Flarum utiliza la potente biblioteca [s9e TextFormatter](https://github.com/s9e/TextFormatter) para dar formato a los mensajes desde el marcado simple hasta el HTML. Deberías familiarizarte con [cómo funciona TextFormatter](https://s9etextformatter.readthedocs.io/Getting_started/How_it_works/) antes de intentar extenderlo.

En Flarum, el contenido de las entradas se formatea con una configuración mínima de TextFormatter por defecto. Las extensiones **Markdown** y **BBCode** incluidas simplemente habilitan los respectivos plugins en esta configuración de TextFormatter.

## Configuración

Puedes configurar la instancia del `Configurador` de TextFormatter, así como ejecutar una lógica personalizada durante el análisis sintáctico y la renderización, utilizando el extensor `Formatter`:

```php
use Flarum\Extend;
use Psr\Http\Message\ServerRequestInterface as Request;
use s9e\TextFormatter\Configurator;
use s9e\TextFormatter\Parser;
use s9e\TextFormatter\Renderer;

return [
    (new Extend\Formatter)
        // Añadir la configuración del formateador de texto personalizado
        ->configure(function (Configurator $config) {
            $config->BBCodes->addFromRepository('B');
        })
        // Modificar el texto en bruto antes de analizarlo.
        // Esta llamada de retorno debe devolver el texto modificado.
        ->parse(function (Parser $parser, $context, $text) {
            // lógica personalizada aquí
            return $newText;
        })
        // Modificar el XML a renderizar antes de renderizar.
        // Esta llamada de retorno debe devolver el nuevo XML.
        // Por ejemplo, en la extensión de menciones, esto se utiliza para
        // proporcionar el nombre de usuario y el nombre para mostrar del usuario que está siendo mencionado.
        // Asegúrese de que el último argumento $request sea nulo (u omitido por completo).
        ->render(function (Renderer $renderer, $context, $xml, Request $request = null) {
            // lógica personalizada aquí
            return $newXml;
        })
];
```

Con una buena comprensión de TextFormatter, esto le permitirá lograr cualquier cosa, desde simples adiciones de etiquetas BBCode hasta tareas de formato más complejas como la extensión **Mentions** de Flarum.
