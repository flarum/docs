# Risorse Estensione

Alcune estensioni potrebbero voler includere asset come immagini o file JSON nel loro codice sorgente (non si tratta di upload, che richiederebbe probabilmente un apposito [filesystem](filesystem.md)).

Lavorare con gli asset è in realtà molto semplice. Basta creare una cartella `assets` nella radice principale della tua estensione, e posizionare tutti i file al suo interno.
Flarum copierà automaticamente tali file nella propria directory `assets` (o altra posizione di archiviazione se [impostata da un estensione](filesystem.md)) ogni volta che l'estensione è abilitata o [`php flarum assets:publish`](../console.md) viene eseguito.

Se si utilizza il driver di archiviazione predefinito, le risorse saranno disponibili all'url `https://FORUM_URL/assets/extensions/EXTENSION_ID/file.path`. Tuttavia, poiché altre estensioni potrebbero usare filesystem remoti, si consiglia di serializzare l'url alle risorse di cui hai bisogno nel backend. See [Flarum's serialization of the logo and favicon URLs](https://github.com/flarum/framework/blob/4ecd9a9b2ff0e9ba42bb158f3f83bb3ddfc10853/framework/core/src/Api/Serializer/ForumSerializer.php#L85-L86) for an example.
