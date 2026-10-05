# Design

Obwohl wir hart daran gearbeitet haben, Flarum so schön wie möglich zu machen, wird wahrscheinlich jede Community einige Optimierungen/Modifikationen vornehmen wollen, um sie ihrem gewünschten Stil anzupassen.

## Admin-Dashboard

The [admin dashboard](admin.md)'s Appearance page is a great first place to start customizing your forum. Hier kannst Du:

- Designfarben auswählen
- Dunkelmodus und eine farbige Kopfzeile umschalten
- Ein Logo und Favicon hochladen (Symbol wird in Browser-Tabs angezeigt)
- HTML für benutzerdefinierte Kopf- und Fußzeilen hinzufügen
- [custom LESS/CSS](#css-theming) hinzufügen, um zu ändern, wie Elemente angezeigt werden

## FontAwesome

Flarum uses FontAwesome 7 for icons throughout the interface. By default the Free icon set is bundled and served locally, but this can be switched to a CDN or a FontAwesome Kit (which unlocks Pro icons and custom icons) via the [advanced settings](admin.md) in the admin dashboard, or directly in [config.php](config.md).

See the [FontAwesome](fontawesome.md) page for full details on configuration options and available icon styles.

## CSS-Design

CSS ist eine Stylesheet-Sprache, die Browsern mitteilt, wie Elemente einer Webseite angezeigt werden sollen.
Es ermöglicht uns, alles von Farben über Schriftarten bis hin zu Elementgröße und Positionierung bis hin zu Animationen zu ändern.
Das Hinzufügen von benutzerdefiniertem CSS kann eine großartige Möglichkeit sein, deine Flarum-Installation an ein Thema anzupassen.

Ein CSS-Tutorial würde den Rahmen dieser Dokumentation sprengen, aber es existieren viele großartige Online-Ressourcen, um die Grundlagen von CSS zu erlernen.

:::tip

Flarum verwendet tatsächlich LESS, was das Schreiben von CSS erleichtert, indem es Variablen, Bedingungen und Funktionen zulässt.

:::

## Erweiterungen

Das flexible [Erweiterungssystem](extensions.md) von Flarum ermöglicht es dir, praktisch jeden Teil von Flarum hinzuzufügen, zu entfernen oder zu modifizieren.
Wenn Du über das Ändern von Farben/Größen/Stilen hinaus erhebliche thematische Änderungen vornehmen möchtest, ist eine benutzerdefinierte Erweiterung definitiv der richtige Weg.
Um zu erfahren, wie man eine Erweiterung erstellt, lese unsere [Extension-Dokumentation](extend/README.md)!
