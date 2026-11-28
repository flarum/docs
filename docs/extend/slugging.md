# Model Slugging

## Suggesting slugs in the frontend

The `slug()` helper in `flarum/common/utils/string` turns a name into a slug, for example to suggest one in a form as the admin types a tag's name. It doesn't use the transliteration that the backend uses, so only use it to suggest a slug that the user can change.

```js
import { slug, SluggingMode } from 'flarum/common/utils/string';

slug('Café Новости'); // "caf"
slug('Café Новости', SluggingMode.UTF8); // "café-новости"
slug('Café Новости', SluggingMode.UTF8_FOLDED); // "cafe-новости"
```

The second argument picks the mode:

| Mode | Result |
| --- | --- |
| `SluggingMode.ALPHANUMERIC` (the default) | Lowercase ASCII letters and digits. Every other character becomes a hyphen. |
| `SluggingMode.UTF8` | Letters, digits and marks of any script are kept. |
| `SluggingMode.UTF8_FOLDED` | From Flarum 2.1. Like `UTF8`, but Latin letters lose their accents and letters such as ß are spelled out (`ss`), compatibility forms such as fullwidth letters and ligatures become plain ones, and invisible characters and Hebrew and Arabic vowel marks are dropped. Other scripts keep their letters, so the result isn't always ASCII. The Tags extension suggests tag slugs with it. |
