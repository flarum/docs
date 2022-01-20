# Lokale Extender

Wenn du Anpassungen an deiner Seite vornehmen möchtest, ohne eine ganze Erweiterung zu erstellen, kannst du dies mit **lokalen Extendern** tun. Jede Flarum-Installation wird mit einer `extend.php`-Datei geliefert, in der du Extender-Instanzen hinzufügen kannst, genau wie bei einer vollständigen Erweiterung.

In unserer [Erweiterungsdokumentation](extend/start.md) findest du weitere Informationen über Extender (und auch ein [Beispiel für einen lokalen Extender](extend/start.md#hello-world)).

Wenn du neue Dateien erstellen musst (wenn du eine benutzerdefinierte Klasse hinzufügst, die für Extender importiert werden soll), musst du deine composer.json ein wenig anpassen. Füge Folgendes hinzu:

```json
"autoload": {
    "psr-4": {
        "App\\": "app/"
    }
},
```

Jetzt kannst du neue PHP-Dateien in einem `App`-Unterverzeichnis erstellen, indem du den `App\...`-Namensraum benutzt.

:::tip Lokale Extender vs. Erweiterungen

Lokale Extender können für kleine Anpassungen gut sein, aber wenn Sie umfangreiche Anpassungen benötigen, ist eine Erweiterung möglicherweise die bessere Wahl: Eine separate Codebasis, eine sauberere Handhabung vieler Dateien, Werkzeuge für Entwickler und die Möglichkeit, den Quellcode zu teilen, sind große Vorteile.

:::
