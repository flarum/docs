# Yönetici Gösterge Tablosu

Her uzantının bilgi, ayarlar ve uzantının kendi izinlerini içeren benzersiz bir sayfası vardır.

Ayarları veya izinleri kaydedebilir ya da tamamen özel bir sayfayı [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) bileşenine dayalı olarak kullanabilirsiniz.

## Yönetici Genişletici

Yönetici ön yüzü, `Admin` ön yüz genişleticisini kullanarak eklentinize çok az kod ile ayarlar ve izinler eklemenizi sağlar.

Başlamak için, bir `admin/extend.js` dosyanızın olduğundan emin olun:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  //
]
```

:::bilgi

Giriş dosyanız olan `admin/index.js` dosyasından `extend` modülünü dışa aktardığınızdan emin olun:

```js
export { default as extend } from './extend';
```

:::

### Ayarları Kaydetme

Bu şekilde ayar alanları eklemek, basit öğeler için önerilir. Genel bir kural olarak, sadece ayarlar tablosunda veri saklamanız gerekiyorsa, bu sizin için yeterli olacaktır.

Bir alan eklemek için, `Admin` genişleticisinin `setting` yöntemini çağırın ve ilk argüman olarak bir 'ayar nesnesi' döndüren bir callback (geri çağırma) fonksiyonu iletin. Arka planda, uygulama ayarlarınızı bir [`ItemList`](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist) haline getirir; ikinci argüman olarak bir öncelik numarası geçebilirsiniz, bu numara sayfadaki ayarların sırasını belirler.

İşte bir anahtar (boolean) öğesi ile örnek:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
  new Extend.Admin()
    .setting(
      () => ({
        setting: 'acme-interstellar.coordinates', // Bu, ayarların veritabanındaki ayarlar tablosunda kaydedileceği anahtardır.
        label: app.translator.trans('acme-interstellar.admin.coordinates_label', {}, true), // Yöneticiye ayarın ne işe yaradığını göstermek için görüntülenecek etiket.
        help: app.translator.trans('acme-interstellar.admin.coordinates_help', {}, true), // Ayarın daha ayrıntılı açıklamasının verilebileceği isteğe bağlı yardım metni.
        type: 'boolean', // Bu ayarın türü, geçerli seçenekler: boolean, text (veya başka herhangi bir <input>tag türü) ve select. 
      }),
30 // İsteğe bağlı: Öncelik Sıralaması
)
];
```

Eğer ``type: 'select'`\` kullanırsanız, ayar nesnesi biraz farklı görünür:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
new Extend.Admin()
.setting(
() => ({
setting: 'acme-interstellar.fuel_type',
label: app.translator.trans('acme-interstellar.admin.fuel_type_label', {}, true),
type: 'select',
options: {
'LOH': 'Sıvı Yakıt', // Bu nesnedeki anahtar, ayarın veritabanında nasıl saklanacağını gösterir; değer ise yöneticinin göreceği etikettir (bağlamınıza uygunsa çevirileri kullanmayı unutmayın).
          'RDX': 'Katı Yakıt',
},
default: 'LOH',
}),
)
];
```

Ayrıca, ayar nesnesine eklenen diğer öğelerin bileşen özellikleri (component attrs) olarak kullanılacağını unutmayın. Bu, yer tutucular, minimum/maksimum sınırlamalar vb. için kullanılabilir:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
  new Extend.Admin()
    .setting(
      () => ({
        setting: 'acme-interstellar.crew_count',
        label: app.translator.trans('acme-interstellar.admin.crew_count_label', {}, true),
        type: 'number',
        min: 1,
        max: 10
      }),
    )
];
```

Ayarlar bölümüne ekstra metin veya daha karmaşık bir girdi eklemek isterseniz, ilk argüman olarak JSX döndüren bir geri çağırma (callback) fonksiyonu da geçebilirsiniz. Bu geri çağırma (callback), [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) bağlamında çalıştırılacaktır ve ayar değerleri otomatik olarak serileştirilmeyecektir.

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
  new Extend.Admin()
    .setting(
      () => function () {
        if (app.session.user.username() === 'RocketMan') {
          return (
            <div className="Form-group">
              <h1> {app.translator.trans('acme-interstellar.admin.you_are_rocket_man_label')} </h1>
              <label className="checkbox">
                <input type="checkbox" bidi={this.setting('acme-interstellar.rocket_man_setting')}/>
                {app.translator.trans('acme-interstellar.admin.rocket_man_setting_label')}
              </label>
            </div>
          );
        }
      },
    )
];
```

### Mevcut Ayar Türleri

Varsayılan olarak kullanılabilen ayar türlerinin listesi şunlardır:

**Açma/Kapama:** `bool` veya `checkbox` veya `switch` veya `boolean`

**Metin Alanı:** `textarea`

**Renk Seçici:** `color-preview`

**Metin Girdisi:** `text` veya `tel` ya da `number` gibi herhangi bir HTML input türü

```ts
{
  setting: 'setting_unique_key',
  label: app.translator.trans('acme-interstellar.admin.settings.setting_unique_key', {}, true),
  type: 'bool' // Yukarıda bahsedilen değerlerden herhangi biri
}
```

**Seçim:** `select` veya `dropdown` veya `selectdropdown`

```ts
{
  setting: 'setting_unique_key',
  label: app.translator.trans('acme-interstellar.admin.settings.setting_unique_key', {}, true),
  type: 'select', // Yukarıda bahsedilen değerlerden herhangi biri
  options: {
    'option_key': 'Seçenek Etiketi',
    'option_key_2': 'Seçenek Etiketi 2',
    'option_key_3': 'Seçenek Etiketi 3',
  },
  default: 'option_key'
}
```

**Görsel Yükleme Butonu:** `image-upload`

```ts
{
  setting: 'setting_unique_key',
  label: app.translator.trans('acme-interstellar.admin.settings.setting_unique_key', {}, true),
  type: 'image-upload',
  name: 'my_image_name', // Görselin adı; bu, backend'e yapılan istek için kullanılacaktır.
  routePath: '/upload-my-image', // Görselin yükleneceği rota.
  url: () => app.forum.attribute('myImageUrl'), // Görselin bağlantısı; bu, görseli önizlemek için kullanılacaktır.
}
```

### İzinleri Kaydetme

İzinler 2 yerde bulunabilir. Her uzantının kendi sayfasında bireysel izinlerini görüntüleyebilir veya tüm izinleri ana izinler sayfasında görebilirsiniz.

Bunun gerçekleşmesi için, izinler ayarların kaydedildiği yöntemle benzer şekilde, `Admin` genişleticisinin `permission` yöntemi kullanılarak kaydedilmelidir.

Argümanlar:
 * İzin nesnesi
 * İzin türü – türleri görmek için [`PermissionGrid`](https://api.docs.flarum.org/js/master/class/src/admin/components/permissiongrid.js~permissiongrid) fonksiyonlarına bakabilirsiniz (isimdeki öğeleri kaldırın)
 * `ItemList` önceliği

Favori roket eklentimize geri dönelim:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
  new Extend.Admin()
    .permission(
      () => ({
        icon: 'fas fa-rocket', // Font-Awesome simgesi
        label: app.translator.trans('acme-interstellar.admin.permissions.fly_rockets_label', {}, true), // İzin etiketi
        permission: 'discussion.rocket_fly', // Veritabanında saklanan gerçek izin adı (izin kontrolü yapılırken kullanılır).
        tagScoped: true, // Whether it be possible to apply this permission on tags, not just globally. Explained in the next paragraph.
      }),
      'start', // Category permission will be added to on the grid
      95 // Optional: Priority
    )
];
```

If your extension interacts with the [tags extension](https://github.com/flarum/tags) (which is fairly common), you might want a permission to be tag scopable (i.e. applied on the tag level, not just globally). You can do this by including a `tagScoped` attribute, as seen above. Permissions starting with `discussion.` will automatically be tag scoped unless `tagScoped: false` is indicated.

To learn more about Flarum permissions, see [the relevant docs](permissions.md).

### Chaining Reminder

Remember these functions can all be chained like:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
  new Extend.Admin()
    .setting(...)
    .permission(...)
    .permission(...)
    .permission(...)
    .setting(...)
    .setting(...)
];
```

### Extending/Overriding the Default Page

Sometimes you may have more complicated settings, or just want the page to look completely different. In this case, you will need to tell the `Admin` extender that you want to provide your own page. Note that `buildSettingComponent`, the util used to register settings by providing a descriptive object, is available as a method on `ExtensionPage` (extending from `AdminPage`, which is a generic base for all admin pages with some util methods).

Create a new class that extends the `Page` or `ExtensionPage` component:

```js
import ExtensionPage from 'flarum/admin/components/ExtensionPage';

export default class StarPage extends ExtensionPage {
  content() {
    return (
      <h1>Hello from the settings section!</h1>
    )
  }
}

```

Then, simply use the `page` method of the extender:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

import StarPage from './components/StarPage';

return [
  new Extend.Admin()
    .page(StarPage)
];
```

This page will be shown instead of the default.

You can extend the [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) or extend the base `Page` and design your own!

### Admin Search

The admin dashboard has a search bar that allows you to quickly find settings and permissions. If you have used the `Admin.settings` and `Admin.permissions` extender methods, your settings and permissions will be automatically indexed and searchable. However, if you have a custom setting, or custom page that structures its content differently, then you must manually add index entries that reference your custom settings.

To do this, you can use the `Admin.generalIndexItems` extender method. This method takes a callback that returns an array of index items. Each index item is an object with the following properties:

```ts
export type GeneralIndexItem = {
  /**
   * The unique identifier for this index item.
   */
  id: string;
  /**
   * Optional: The tree path to this item, used for grouping in the search results.
   */
  tree?: string[];
  /**
   * The label to display in the search results.
   */
  label: string;
  /**
   * Optional: The description to display in the search results.
   */
  help?: string;
  /**
   * Optional: The URL to navigate to when this item is selected.
   * The default is to navigate to the extension page.
   */
  link?: string;
  /**
   * Optional: A callback that returns a boolean indicating whether this item should be visible in the search results.
   */
  visible?: () => boolean;
};
```

Here is an example of how to add an index item:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
  new Extend.Admin()
    .generalIndexItems(() => [
      {
        id: 'acme-interstellar',
        label: app.translator.trans('acme-interstellar.admin.acme_interstellar_label', {}, true),
        help: app.translator.trans('acme-interstellar.admin.acme_interstellar_help', {}, true),
      },
    ])
];
```

## Composer.json Metadata

Extension pages make room for extra info which is pulled from extensions' composer.json.

For more information, see the [composer.json schema](https://getcomposer.org/doc/04-schema.md).

| Description                        | Where in composer.json                                       |
| ---------------------------------- | ------------------------------------------------------------ |
| discuss.flarum.org discussion link | "forum" key inside "support"                                 |
| Documentation                      | "docs" key inside "support"                                  |
| Support (email)                    | "email" key inside "support"                                 |
| Website                            | "homepage" key                                               |
| Donate                             | "funding" key block (Note: Only the first link will be used) |
| Source                             | "source" key inside "support"                                |
