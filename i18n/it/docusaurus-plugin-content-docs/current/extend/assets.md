# Risorse Estensione

Alcune estensioni potrebbero voler includere asset come immagini o file JSON nel loro codice sorgente (non si tratta di upload, che richiederebbe probabilmente un apposito [filesystem](filesystem.md)).

Lavorare con gli asset è in realtà molto semplice. Basta creare una cartella `assets` nella radice principale della tua estensione, e posizionare tutti i file al suo interno. Flarum copierà automaticamente tali file nella propria directory `assets` (o altra posizione di archiviazione se [impostata da un estensione](filesystem.md)) ogni volta che l'estensione è abilitata o [`php flarum assets:publish`](../console.md) viene eseguito.

Se si utilizza il driver di archiviazione predefinito, le risorse saranno disponibili all'url `https://FORUM_URL/assets/extensions/EXTENSION_ID/file.path`. Tuttavia, poiché altre estensioni potrebbero usare filesystem remoti, si consiglia di serializzare l'url alle risorse di cui hai bisogno nel backend. Vedi per esempio la serializzazione del [logo di Flarum e degli URL delle favicon](https://github.com/flarum/core/blob/bba6485effc088e38e9ae0bc8f25528ecbee3a7b/src/Api/Serializer/ForumSerializer.php#L85-L86).